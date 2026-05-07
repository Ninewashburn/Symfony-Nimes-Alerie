import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiCollection, ForumType, SubType, Thread, Post } from '@core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTypes(): Observable<ForumType[]> {
    return this.http
      .get<ApiCollection<ForumType>>(`${this.apiUrl}/types`)
      .pipe(map((res) => res['hydra:member']));
  }

  getTypeById(id: number): Observable<ForumType> {
    return this.http.get<ForumType>(`${this.apiUrl}/types/${id}`);
  }

  getSubTypes(typeId: number): Observable<SubType[]> {
    return this.http
      .get<ApiCollection<SubType>>(`${this.apiUrl}/sub_types?type=${typeId}`)
      .pipe(map((res) => res['hydra:member']));
  }

  getThreads(
    subTypeId: number,
    page = 1,
    itemsPerPage = 10,
  ): Observable<{ items: Thread[]; total: number }> {
    return this.http
      .get<
        ApiCollection<Thread>
      >(`${this.apiUrl}/threads?subtype=${subTypeId}&page=${page}&itemsPerPage=${itemsPerPage}`)
      .pipe(map((res) => ({ items: res['hydra:member'], total: res['hydra:totalItems'] })));
  }

  getThread(id: number): Observable<Thread> {
    return this.http.get<Thread>(`${this.apiUrl}/threads/${id}`);
  }

  getPosts(
    threadId: number,
    page = 1,
    itemsPerPage = 20,
  ): Observable<{ items: Post[]; total: number }> {
    return this.http
      .get<
        ApiCollection<Post>
      >(`${this.apiUrl}/posts?thread=${threadId}&page=${page}&itemsPerPage=${itemsPerPage}`)
      .pipe(map((res) => ({ items: res['hydra:member'], total: res['hydra:totalItems'] })));
  }

  createThread(thread: Partial<Thread>): Observable<Thread> {
    return this.http.post<Thread>(`${this.apiUrl}/threads`, thread);
  }

  createPost(post: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, post);
  }

  updatePost(id: number, content: string): Observable<Post> {
    return this.http.patch<Post>(
      `${this.apiUrl}/posts/${id}`,
      { content },
      { headers: { 'Content-Type': 'application/merge-patch+json' } },
    );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`);
  }

  deleteThread(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/threads/${id}`);
  }

  votePost(
    id: number,
    direction: 'upvote' | 'downvote',
  ): Observable<{ upVote: number; downVote: number }> {
    return this.http.patch<{ upVote: number; downVote: number }>(
      `${this.apiUrl}/posts/${id}/${direction}`,
      {},
      { headers: { 'Content-Type': 'application/merge-patch+json' } },
    );
  }
}
