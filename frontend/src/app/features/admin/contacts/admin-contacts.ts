import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ApiCollection } from '@core/models/product.model';

interface ContactMessage {
  id: number;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './admin-contacts.html',
})
export class AdminContactsComponent implements OnInit {
  private http = inject(HttpClient);

  readonly itemsPerPage = 20;
  messages = signal<ContactMessage[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  loading = signal(true);
  selected = signal<ContactMessage | null>(null);

  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.http
      .get<
        ApiCollection<ContactMessage>
      >(`${environment.apiUrl}/contact_messages?page=${page}&itemsPerPage=${this.itemsPerPage}&order[createdAt]=desc`)
      .subscribe({
        next: (res) => {
          this.messages.set(res['hydra:member']);
          this.totalItems.set(res['hydra:totalItems']);
          this.currentPage.set(page);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  markRead(msg: ContactMessage): void {
    if (msg.read) return;
    this.http
      .patch<ContactMessage>(
        `${environment.apiUrl}/contact_messages/${msg.id}`,
        { read: true },
        { headers: { 'Content-Type': 'application/merge-patch+json' } },
      )
      .subscribe((updated) => {
        this.messages.set(this.messages().map((m) => (m.id === updated.id ? updated : m)));
        if (this.selected()?.id === updated.id) this.selected.set(updated);
      });
  }

  openMessage(msg: ContactMessage): void {
    this.selected.set(msg);
    this.markRead(msg);
  }

  closeMessage(): void {
    this.selected.set(null);
  }

  deleteMessage(id: number): void {
    if (!confirm('Supprimer ce message ?')) return;
    this.http.delete<void>(`${environment.apiUrl}/contact_messages/${id}`).subscribe(() => {
      this.messages.set(this.messages().filter((m) => m.id !== id));
      this.totalItems.update((n) => n - 1);
      if (this.selected()?.id === id) this.selected.set(null);
    });
  }

  unreadCount(): number {
    return this.messages().filter((m) => !m.read).length;
  }
}
