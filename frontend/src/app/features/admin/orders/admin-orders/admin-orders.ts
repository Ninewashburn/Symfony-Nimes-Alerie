import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminOrder, OrderService } from '@core/services/order.service';
import { Order } from '@core/models/product.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<AdminOrder[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalItems = signal(0);
  readonly itemsPerPage = 20;

  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  readonly statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'preparing', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'refunded', label: 'Remboursée' },
  ];

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.orderService.getAllOrders(page, this.itemsPerPage).subscribe({
      next: ({ items, total }) => {
        this.orders.set(items);
        this.totalItems.set(total);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onStatusChange(order: AdminOrder, newStatus: Order['status']): void {
    this.orderService.updateStatus(order.id, newStatus).subscribe({
      next: () => {
        this.orders.set(
          this.orders().map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)),
        );
      },
    });
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      pending:
        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700',
      preparing:
        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700',
      shipped:
        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700',
      refunded:
        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700',
    };
    return classes[status] ?? '';
  }
}
