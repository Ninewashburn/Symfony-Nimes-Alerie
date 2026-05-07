import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiCollection, Article } from '@core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly apiUrl = `${environment.apiUrl}/articles`;
  private readonly articleCoverRules: Array<{ pattern: RegExp; cover: string }> = [
    { pattern: /arenes/, cover: '/images/articles/arenes-nimes-orbital.png' },
    { pattern: /brandade/, cover: '/images/articles/brandade-nimes-orbital.png' },
    { pattern: /pont du gard/, cover: '/images/articles/pont-du-gard-orbital.png' },
    { pattern: /feria/, cover: '/images/articles/feria-nimes-orbital.png' },
    { pattern: /maison carree/, cover: '/images/articles/maison-carree-orbital.png' },
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<Article[]> {
    return this.http
      .get<ApiCollection<Article>>(this.apiUrl)
      .pipe(
        map((res) => res['hydra:member'].map((article) => this.normalizeArticleAssets(article))),
      );
  }

  getById(id: number): Observable<Article> {
    return this.http
      .get<Article>(`${this.apiUrl}/${id}`)
      .pipe(map((article) => this.normalizeArticleAssets(article)));
  }

  create(article: Partial<Article>): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article);
  }

  update(id: number, article: Partial<Article>): Observable<Article> {
    return this.http.patch<Article>(`${this.apiUrl}/${id}`, article, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private normalizeArticleAssets(article: Article): Article {
    const articleCover = this.getArticleCover(article);

    return {
      ...article,
      cover: articleCover ?? article.cover?.replace(/^assets\//, '/'),
    };
  }

  private getArticleCover(article: Article): string | undefined {
    const name = this.normalizeTitle(article.name);

    return this.articleCoverRules.find(({ pattern }) => pattern.test(name))?.cover;
  }

  private normalizeTitle(title = ''): string {
    return title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
