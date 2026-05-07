import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { OrderService } from '@core/services/order.service';
import { Order } from '@core/models/product.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private orderService = inject(OrderService);

  // Info form
  form = {
    firstName: '',
    lastName: '',
    telephone: '',
    gender: '',
    address: '',
    secondAddress: '',
    city: '',
    postalCode: '',
    country: '',
  };

  // Password form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  saving = signal(false);
  saveSuccess = signal(false);
  saveError = signal('');

  changingPassword = signal(false);
  passwordSuccess = signal(false);
  passwordError = signal('');

  orders = signal<Order[]>([]);
  ordersLoading = signal(true);
  ordersError = signal('');
  invoiceLoading = signal<number | null>(null);

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.form.firstName = user.firstName ?? '';
      this.form.lastName = user.lastName ?? '';
      this.form.telephone = user.telephone ?? '';
      this.form.gender = user.gender ?? '';
      this.form.address = user.address ?? '';
      this.form.secondAddress = user.secondAddress ?? '';
      this.form.city = user.city ?? '';
      this.form.postalCode = user.postalCode ?? '';
      this.form.country = user.country ?? '';
    }

    this.loadOrders();
  }

  loadOrders() {
    this.ordersLoading.set(true);
    this.ordersError.set('');

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.ordersLoading.set(false);
      },
      error: () => {
        this.ordersLoading.set(false);
        this.ordersError.set('Impossible de recuperer vos commandes pour le moment.');
      },
    });
  }

  totalItems(order: Order): number {
    return order.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  }

  statusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending: 'En attente',
      preparing: 'En preparation',
      shipped: 'Expediee',
      refunded: 'Remboursee',
    };

    return labels[status] ?? status;
  }

  statusClass(status: Order['status']): string {
    const classes: Record<Order['status'], string> = {
      pending: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
      preparing: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
      shipped: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
      refunded: 'border-red-400/30 bg-red-400/10 text-red-300',
    };

    return classes[status] ?? 'border-slate-400/30 bg-slate-400/10 text-slate-300';
  }

  paymentLabel(payment?: Order['payment']): string {
    if (payment === 'paypal') {
      return 'PayPal';
    }

    if (payment === 'card') {
      return 'Carte bancaire';
    }

    return 'Paiement non renseigne';
  }

  downloadInvoice(order: Order) {
    this.invoiceLoading.set(order.id);

    this.orderService.getInvoicePdf(order.id).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        const invoiceNumber = order.billNumber ?? `commande-${order.id}`;

        link.href = url;
        link.download = `facture-${invoiceNumber}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.invoiceLoading.set(null);
      },
      error: () => this.invoiceLoading.set(null),
    });
  }

  saveProfile() {
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set('');

    this.authService.updateProfile(this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Une erreur est survenue. Veuillez réessayer.');
      },
    });
  }

  changePassword() {
    this.passwordError.set('');
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.set('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    this.changingPassword.set(true);
    this.authService
      .updateProfile({
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword,
      })
      .subscribe({
        next: () => {
          this.changingPassword.set(false);
          this.passwordSuccess.set(true);
          this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
          setTimeout(() => this.passwordSuccess.set(false), 3000);
        },
        error: (err) => {
          this.changingPassword.set(false);
          this.passwordError.set(err?.error?.error ?? 'Mot de passe actuel incorrect.');
        },
      });
  }
}
