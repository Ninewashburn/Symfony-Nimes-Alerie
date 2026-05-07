<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Bill;
use App\Entity\Delivery;
use App\Entity\Order;
use App\Entity\OrderLine;
use App\Entity\User;
use App\Enum\OrderStatus;
use App\Enum\PaymentMethod;
use App\Repository\ProductRepository;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use DomainException;
use InvalidArgumentException;

class OrderService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProductRepository $productRepo,
    ) {
    }

    /**
     * @param array<array{productId: int, quantity: int}> $items
     *
     * @throws InvalidArgumentException when items are empty or address is incomplete
     * @throws DomainException          when stock is insufficient (includes product title + quantities)
     */
    public function createOrder(
        User $user,
        array $items,
        string $deliveryAddress,
        string $deliveryCity,
        string $deliveryPostal,
        string $deliveryCountry,
        string $paymentMethod,
    ): Order {
        if (empty($items)) {
            throw new InvalidArgumentException('Cart is empty');
        }

        if (empty($deliveryAddress) || empty($deliveryCity) || empty($deliveryPostal)) {
            throw new InvalidArgumentException('Delivery address is incomplete');
        }

        $serverTotal = 0.0;
        $enrichedItems = [];
        $totalQty = 0;
        $products = [];

        foreach ($items as $item) {
            $productId = (int) $item['productId'];
            $requested = (int) $item['quantity'];

            if ($productId <= 0 || $requested <= 0) {
                throw new InvalidArgumentException("Invalid item (id={$productId})");
            }

            $product = $this->productRepo->find($productId);

            if (!$product) {
                throw new InvalidArgumentException("Product #{$productId} not found");
            }

            if ($product->getQuantity() < $requested) {
                throw new DomainException(\sprintf('Stock insuffisant pour "%s" : %d disponible(s), %d demandé(s).', $product->getTitle(), $product->getQuantity(), $requested));
            }

            $unitPrice = (float) $product->getPriceTTC();
            $serverTotal += $unitPrice * $requested;
            $totalQty += $requested;

            $enrichedItems[] = [
                'productId' => $productId,
                'title' => $product->getTitle(),
                'quantity' => $requested,
                'priceTTC' => $product->getPriceTTC(),
            ];

            $product->setQuantity($product->getQuantity() - $requested);
            $products[] = $product;
        }

        $orderLine = new OrderLine();
        $orderLine->setQuantity($totalQty);

        $delivery = new Delivery();
        $delivery->setDeliveryAddress($deliveryAddress);
        $delivery->setDeliveryCity($deliveryCity);
        $delivery->setDeliveryPostalCode($deliveryPostal);
        $delivery->setDeliveryCountry($deliveryCountry);
        $delivery->setStatus('pending');
        $delivery->setOrderLine($orderLine);
        $orderLine->setDelivery($delivery);

        $payment = PaymentMethod::tryFrom($paymentMethod);

        if (!$payment) {
            throw new InvalidArgumentException('Invalid payment method');
        }

        $bill = new Bill();
        $bill->setPayment($payment);
        $bill->setNumber('BILL-'.strtoupper(uniqid()));
        $bill->setCreatedAt(new DateTime());

        $order = new Order();
        $order->setStatus(OrderStatus::PENDING);
        $order->setCreatedAt(new DateTime());
        $order->setTotal((string) round($serverTotal, 2));
        $order->setItems($enrichedItems);
        $order->setOrderLine($orderLine);
        $order->setBill($bill);
        $order->setUser($user);

        $this->em->persist($orderLine);
        $this->em->persist($delivery);
        $this->em->persist($bill);
        $this->em->persist($order);
        $this->em->flush();

        return $order;
    }
}
