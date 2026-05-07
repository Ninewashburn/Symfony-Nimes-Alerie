<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Order;
use App\Entity\User;
use App\Repository\OrderRepository;
use App\Service\OrderService;
use DomainException;
use InvalidArgumentException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class OrderController extends AbstractController
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {
    }

    #[Route('/api/my-orders', name: 'api_my_orders', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function myOrders(OrderRepository $orderRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $orders = $orderRepo->findBy(['user' => $user], ['id' => 'DESC']);

        return $this->json(array_map(static fn ($o) => [
            'id' => $o->getId(),
            'status' => $o->getStatus()->value,
            'total' => $o->getTotal(),
            'items' => $o->getItems(),
            'createdAt' => $o->getCreatedAt()?->format('d/m/Y'),
            'billNumber' => $o->getBill()?->getNumber(),
            'payment' => $o->getBill()?->getPayment()?->value,
        ], $orders));
    }

    #[Route('/api/orders', name: 'api_create_order', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function createOrder(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Invalid request body'], 400);
        }

        try {
            $order = $this->orderService->createOrder(
                user: $user,
                items: $data['items'] ?? [],
                deliveryAddress: $data['deliveryAddress'] ?? '',
                deliveryCity: $data['deliveryCity'] ?? '',
                deliveryPostal: $data['deliveryPostalCode'] ?? '',
                deliveryCountry: $data['deliveryCountry'] ?? 'France',
                paymentMethod: $data['paymentMethod'] ?? 'card',
            );
        } catch (InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        } catch (DomainException $e) {
            return $this->json(['error' => $e->getMessage()], 409);
        }

        return $this->json([
            'id' => $order->getId(),
            'billNumber' => $order->getBill()?->getNumber(),
            'status' => $order->getStatus()->value,
            'total' => $order->getTotal(),
            'itemsCount' => array_sum(array_column($order->getItems() ?? [], 'quantity')),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
            'payment' => $order->getBill()?->getPayment()?->value,
        ], 201);
    }

    #[Route('/api/order/{id}/invoice', name: 'api_order_invoice', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function invoice(int $id, OrderRepository $orderRepo): Response
    {
        $order = $orderRepo->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], 404);
        }

        /** @var User $user */
        $user = $this->getUser();

        if (!$this->isGranted('ROLE_ADMIN') && $order->getUser()?->getId() !== $user->getId()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $billNumber = $order->getBill()?->getNumber() ?? 'ORDER-'.$order->getId();
        $pdf = $this->buildInvoicePdf($order, $user, $billNumber);

        return new Response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="facture-'.$billNumber.'.pdf"',
        ]);
    }

    private function buildInvoicePdf(Order $order, User $user, string $billNumber): string
    {
        $content = '';
        $items = $order->getItems() ?? [];
        $delivery = $order->getOrderLine()?->getDelivery();
        $createdAt = $order->getCreatedAt()?->format('d/m/Y H:i') ?? '-';
        $payment = $this->paymentLabel($order->getBill()?->getPayment()?->value);
        $status = $this->statusLabel($order->getStatus()->value);
        $clientName = trim(($user->getFirstName() ?? '').' '.($user->getLastName() ?? ''));
        $clientName = '' !== $clientName ? $clientName : 'Client';

        $content .= $this->rect(0, 0, 595, 842, '0.96 0.98 1');
        $content .= $this->rect(0, 712, 595, 130, '0.03 0.06 0.12');
        $content .= $this->rect(0, 704, 595, 8, '0.15 0.39 0.92');
        $content .= $this->circle(518, 780, 44, '0.07 0.12 0.24');
        $content .= $this->circle(545, 802, 22, '0.15 0.39 0.92');

        $content .= $this->text("LA NIMES'ALERIE", 42, 785, 22, 'F2', '1 1 1');
        $content .= $this->text('Facture officielle', 42, 758, 11, 'F1', '0.62 0.75 0.95');
        $content .= $this->text('Equipement spatial pour compagnons terrestres', 42, 740, 9, 'F1', '0.45 0.56 0.72');
        $content .= $this->text('FACTURE', 410, 786, 30, 'F2', '1 1 1');
        $content .= $this->text($billNumber, 412, 760, 11, 'F1', '0.70 0.82 1');

        $content .= $this->card(42, 545, 238, 130);
        $content .= $this->sectionTitle('Client', 58, 648);
        $content .= $this->text($clientName, 58, 626, 13, 'F2', '0.08 0.11 0.18');
        $content .= $this->text($user->getEmail() ?? '-', 58, 606, 10, 'F1', '0.20 0.27 0.38');
        if (null !== $delivery) {
            $content .= $this->text($delivery->getDeliveryAddress() ?? '-', 58, 588, 9, 'F1', '0.35 0.42 0.52');
            $content .= $this->text(trim(($delivery->getDeliveryPostalCode() ?? '').' '.($delivery->getDeliveryCity() ?? '')), 58, 573, 9, 'F1', '0.35 0.42 0.52');
            $content .= $this->text($delivery->getDeliveryCountry() ?? '-', 58, 558, 9, 'F1', '0.35 0.42 0.52');
        }

        $content .= $this->card(315, 545, 238, 130);
        $content .= $this->sectionTitle('Details', 331, 648);
        $content .= $this->labelValue('Commande', '#'.$order->getId(), 331, 626);
        $content .= $this->labelValue('Date', $createdAt, 331, 604);
        $content .= $this->labelValue('Paiement', $payment, 331, 582);
        $content .= $this->labelValue('Statut', $status, 331, 560);

        $content .= $this->text('Articles achetes', 42, 520, 17, 'F2', '0.08 0.11 0.18');
        $content .= $this->rect(42, 486, 511, 26, '0.05 0.09 0.17');
        $content .= $this->text('ARTICLE', 58, 496, 8, 'F2', '0.85 0.90 1');
        $content .= $this->text('QTE', 342, 496, 8, 'F2', '0.85 0.90 1');
        $content .= $this->text('PU TTC', 405, 496, 8, 'F2', '0.85 0.90 1');
        $content .= $this->text('TOTAL', 492, 496, 8, 'F2', '0.85 0.90 1');

        $y = 462;
        $subtotal = 0.0;
        foreach ($items as $index => $item) {
            $quantity = (int) ($item['quantity'] ?? 0);
            $unitPrice = (float) ($item['priceTTC'] ?? 0);
            $lineTotal = $quantity * $unitPrice;
            $subtotal += $lineTotal;
            $fill = 0 === $index % 2 ? '1 1 1' : '0.93 0.96 1';

            $content .= $this->rect(42, $y - 10, 511, 30, $fill);
            $content .= $this->strokeRect(42, $y - 10, 511, 30, '0.82 0.87 0.95');
            $content .= $this->text($this->truncate((string) ($item['title'] ?? 'Article'), 40), 58, $y, 10, 'F2', '0.08 0.11 0.18');
            $content .= $this->text((string) $quantity, 350, $y, 10, 'F1', '0.20 0.27 0.38');
            $content .= $this->text(number_format($unitPrice, 2, '.', ' ').' EUR', 405, $y, 10, 'F1', '0.20 0.27 0.38');
            $content .= $this->text(number_format($lineTotal, 2, '.', ' ').' EUR', 492, $y, 10, 'F2', '0.08 0.11 0.18');
            $y -= 30;
        }

        $displayTotal = (float) ($order->getTotal() ?? $subtotal);
        $content .= $this->card(335, 178, 218, 104);
        $content .= $this->labelValue('Sous-total TTC', number_format($subtotal, 2, '.', ' ').' EUR', 351, 252);
        $content .= $this->labelValue('Livraison', 'Incluse', 351, 231);
        $content .= $this->rect(351, 216, 186, 1, '0.82 0.87 0.95');
        $content .= $this->text('TOTAL TTC', 351, 198, 10, 'F2', '0.25 0.35 0.55');
        $content .= $this->text(number_format($displayTotal, 2, '.', ' ').' EUR', 435, 195, 20, 'F2', '0.15 0.39 0.92');

        $content .= $this->rect(42, 95, 511, 55, '0.03 0.06 0.12');
        $content .= $this->text('Merci pour votre commande.', 58, 124, 13, 'F2', '1 1 1');
        $content .= $this->text('Document genere automatiquement par La Nimes\'Alerie Galactique.', 58, 108, 9, 'F1', '0.62 0.75 0.95');
        $content .= $this->text('contact@nimes-alerie.space', 410, 108, 9, 'F1', '0.62 0.75 0.95');

        $objects = [
            "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
            "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>\nendobj\n",
            "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
            "5 0 obj\n<< /Length ".\strlen($content)." >>\nstream\n".$content."endstream\nendobj\n",
            "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $object) {
            $offsets[] = \strlen($pdf);
            $pdf .= $object;
        }

        $xref = \strlen($pdf);
        $pdf .= "xref\n0 ".(\count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";

        for ($i = 1; $i <= \count($objects); ++$i) {
            $pdf .= \sprintf("%010d 00000 n \n", $offsets[$i]);
        }

        $pdf .= "trailer\n<< /Size ".(\count($objects) + 1)." /Root 1 0 R >>\n";
        $pdf .= "startxref\n".$xref."\n%%EOF";

        return $pdf;
    }

    private function pdfText(string $text): string
    {
        $encoded = iconv('UTF-8', 'Windows-1252//TRANSLIT', $text);

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], false === $encoded ? $text : $encoded);
    }

    private function text(string $text, int $x, int $y, int $size = 10, string $font = 'F1', string $color = '0 0 0'): string
    {
        return \sprintf(
            "%s rg BT /%s %d Tf %d %d Td (%s) Tj ET\n",
            $color,
            $font,
            $size,
            $x,
            $y,
            $this->pdfText($text)
        );
    }

    private function rect(int $x, int $y, int $width, int $height, string $color): string
    {
        return \sprintf("%s rg %d %d %d %d re f\n", $color, $x, $y, $width, $height);
    }

    private function strokeRect(int $x, int $y, int $width, int $height, string $color): string
    {
        return \sprintf("%s RG 0.5 w %d %d %d %d re S\n", $color, $x, $y, $width, $height);
    }

    private function circle(int $x, int $y, int $radius, string $color): string
    {
        return \sprintf("%s rg %d %d %d %d re f\n", $color, $x - $radius, $y - $radius, $radius * 2, $radius * 2);
    }

    private function card(int $x, int $y, int $width, int $height): string
    {
        return $this->rect($x, $y, $width, $height, '1 1 1')
            .$this->strokeRect($x, $y, $width, $height, '0.80 0.86 0.95');
    }

    private function sectionTitle(string $title, int $x, int $y): string
    {
        return $this->text(strtoupper($title), $x, $y, 9, 'F2', '0.15 0.39 0.92');
    }

    private function labelValue(string $label, string $value, int $x, int $y): string
    {
        return $this->text($label, $x, $y, 8, 'F1', '0.45 0.52 0.62')
            .$this->text($value, $x + 82, $y, 9, 'F2', '0.08 0.11 0.18');
    }

    private function truncate(string $text, int $max): string
    {
        if (\strlen($text) <= $max) {
            return $text;
        }

        return substr($text, 0, $max - 3).'...';
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'En attente',
            'preparing' => 'En preparation',
            'shipped' => 'Expediee',
            'refunded' => 'Remboursee',
            default => $status,
        };
    }

    private function paymentLabel(?string $payment): string
    {
        return match ($payment) {
            'card' => 'Carte bancaire',
            'paypal' => 'PayPal',
            default => 'Non renseigne',
        };
    }
}
