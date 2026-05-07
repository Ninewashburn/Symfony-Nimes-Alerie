import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ProductService } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  featuredProducts = signal<Product[]>([]);

  /* HUD Simulation Data */
  activeTransmissions = signal(42);
  deliveriesInOrbit = signal(12);
  systemStatus = signal('STABLE');
  currentTime = signal(new Date());

  // Verification signal
  hudSync = signal(false);

  ngOnInit() {
    // Slicing to 3 explicitly to avoid backend overflow and placeholders
    this.productService.getAll(1, 10).subscribe(({ items }) => {
      this.featuredProducts.set(items.slice(0, 3));
    });

    // Simulate HUD activity & Clock 1s
    setInterval(() => {
      this.activeTransmissions.update((v) => v + (Math.random() > 0.5 ? 1 : -1));
      this.deliveriesInOrbit.update((v) => v + (Math.random() > 0.8 ? 1 : -1));
      this.currentTime.set(new Date());
      this.hudSync.update((v) => !v);
    }, 1000);
  }

  addToCart(product: Product) {
    this.cartService.addProduct(product);
  }
}
