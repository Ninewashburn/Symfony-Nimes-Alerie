import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiCollection, Product, Brand, Category } from '@core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private readonly productCoverRules: Array<{ pattern: RegExp; cover: string }> = [
    { pattern: /figurine.*taureau|taureau.*camarguais/, cover: '/products/taureau-camarguais.png' },
    { pattern: /brandade/, cover: '/products/brandade-nimes.png' },
    { pattern: /miel/, cover: '/products/miel-cevennes.png' },
    { pattern: /t-?shirt|arenes/, cover: '/products/tshirt-arenes.png' },
    { pattern: /carnet|pont du gard/, cover: '/products/carnet-pont-gard.png' },
    { pattern: /2000 ans|histoire/, cover: '/products/livre-nimes-histoire.png' },
    { pattern: /costi|rouge/, cover: '/products/costieres-nimes-rouge.png' },
    { pattern: /eau de toilette|garrigue/, cover: '/products/parfum-garrigue.png' },
    { pattern: /magnet/, cover: '/products/magnets-nimes.png' },
  ];

  constructor(private http: HttpClient) {}

  getAll(page = 1, itemsPerPage = 9, search = ''): Observable<{ items: Product[]; total: number }> {
    const searchParam = search ? `&title=${encodeURIComponent(search)}` : '';
    return this.http
      .get<
        ApiCollection<Product>
      >(`${this.apiUrl}?page=${page}&itemsPerPage=${itemsPerPage}${searchParam}`)
      .pipe(
        map((res) => ({
          items: res['hydra:member'].map((product) => this.normalizeProductAssets(product)),
          total: res['hydra:totalItems'],
        })),
      );
  }

  getById(id: number): Observable<Product> {
    return this.http
      .get<Product>(`${this.apiUrl}/${id}`)
      .pipe(map((product) => this.normalizeProductAssets(product)));
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, product, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(id: number, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http
      .post<Product>(`${this.apiUrl}/${id}/image`, formData)
      .pipe(map((product) => this.normalizeProductAssets(product)));
  }

  getBrands(): Observable<Brand[]> {
    return this.http
      .get<ApiCollection<Brand>>(`${environment.apiUrl}/brands`)
      .pipe(map((res) => res['hydra:member']));
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<ApiCollection<Category>>(`${environment.apiUrl}/categories`)
      .pipe(map((res) => res['hydra:member']));
  }

  private normalizeProductAssets(product: Product): Product {
    const productCover = this.getProductCover(product);

    return {
      ...product,
      cover: productCover ?? this.normalizeAssetPath(product.cover),
      image: this.normalizeAssetPath(product.image ?? productCover),
    };
  }

  private getProductCover(product: Product): string | undefined {
    const title = this.normalizeTitle(product.title);

    return this.productCoverRules.find(({ pattern }) => pattern.test(title))?.cover;
  }

  private normalizeTitle(title = ''): string {
    return title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private normalizeAssetPath(path?: string): string | undefined {
    if (!path) {
      return path;
    }

    return path.replace(/^assets\//, '/');
  }
}
