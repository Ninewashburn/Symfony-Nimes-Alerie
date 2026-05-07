import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { CheckoutService, MyOrder } from '@core/services/checkout.service';

@Component({
  selector: 'app-space-base',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './space-base.html',
  styleUrl: './space-base.scss',
})
export class SpaceBaseComponent implements OnInit {
  authService = inject(AuthService);
  private checkoutService = inject(CheckoutService);

  orders = signal<MyOrder[]>([]);
  loading = signal(true);
  error = signal('');
  currentTime = signal(new Date());

  // Helper function for robust status mapping
  normalizeStatus(status: string): string {
    const s = (status || '').toLowerCase().trim();
    if (s.includes('attente') || s === 'pending') return 'pending';
    if (s.includes('préparation') || s === 'preparing') return 'preparing';
    if (s.includes('expédiée') || s === 'shipped') return 'shipped';
    if (s.includes('remboursée') || s === 'refunded') return 'refunded';
    if (s.includes('annulée') || s === 'cancelled') return 'cancelled';
    return s;
  }

  totalSpent = computed(() => this.orders().reduce((sum, o) => sum + (+o.total || 0), 0));

  readonly statusLabels: Record<string, string> = {
    pending: 'ORBITAL',
    preparing: 'DESCENT',
    shipped: 'LANDED',
    refunded: 'ABORTED',
    cancelled: 'CANCELLED',
  };

  readonly statusColors: Record<string, string> = {
    pending:
      'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    preparing:
      'bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
    shipped:
      'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    refunded:
      'bg-red-500/10 text-red-600 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    cancelled: 'bg-slate-500/10 text-slate-600 border border-slate-500/20 shadow-sm',
  };

  ngOnInit() {
    setInterval(() => this.currentTime.set(new Date()), 1000);
    this.checkoutService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger vos commandes.');
        this.loading.set(false);
      },
    });
  }
}
