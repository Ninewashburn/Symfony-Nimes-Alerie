import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { Order, ApiCollection, User } from '@core/models/product.model';

export type AdminOrder = Order & {
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
  email?: string;
};

type AdminOrdersResponse = ApiCollection<AdminOrder> & {
  orders?: AdminOrder[];
  total?: number;
};

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
  }

  getInvoicePdf(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/order/${orderId}/invoice`, {
      responseType: 'blob',
    });
  }

  getAllOrders(page = 1, itemsPerPage = 20): Observable<{ items: AdminOrder[]; total: number }> {
    return this.http
      .get<AdminOrdersResponse>(
        `${this.apiUrl}/admin/orders?page=${page}&itemsPerPage=${itemsPerPage}`,
      )
      .pipe(
        map((res) => ({
          items: res.orders ?? res['hydra:member'] ?? [],
          total: res.total ?? res['hydra:totalItems'] ?? 0,
        })),
      );
  }

  updateStatus(id: number, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/admin/orders/${id}/status`,
      { status },
      { headers: { 'Content-Type': 'application/merge-patch+json' } },
    );
  }
}
