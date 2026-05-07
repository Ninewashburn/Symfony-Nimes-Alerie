import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminStats } from '@core/services/admin.service';
import { ProductService } from '@core/services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private productService = inject(ProductService);

  stats = signal<AdminStats | null>(null);
  loading = signal(true);
  error = signal('');

  /* Quick stock edit */
  editingStockId = signal<number | null>(null);
  editStockValue = 0;
  savingStock = signal(false);

  readonly statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    preparing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    shipped: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    refunded: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  ngOnInit() {
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les statistiques.');
        this.loading.set(false);
      },
    });
  }

  startStockEdit(item: { id: number; quantity: number }): void {
    this.editingStockId.set(item.id);
    this.editStockValue = item.quantity;
  }

  cancelStockEdit(): void {
    this.editingStockId.set(null);
  }

  saveStock(itemId: number): void {
    if (this.editStockValue < 0) return;
    this.savingStock.set(true);
    this.productService.update(itemId, { quantity: this.editStockValue }).subscribe({
      next: () => {
        const s = this.stats();
        if (s) {
          this.stats.set({
            ...s,
            lowStock: s.lowStock.map((p) =>
              p.id === itemId ? { ...p, quantity: this.editStockValue } : p,
            ),
          });
        }
        this.editingStockId.set(null);
        this.savingStock.set(false);
      },
      error: () => this.savingStock.set(false),
    });
  }
}
