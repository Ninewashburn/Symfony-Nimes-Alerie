import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ForumService } from '@core/services/forum.service';
import { AuthService } from '@core/services/auth.service';
import { Post, Thread } from '@core/models/product.model';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forum-thread',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './forum-thread.html',
  styleUrl: './forum-thread.scss',
})
export class ForumThreadComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private forumService = inject(ForumService);
  authService = inject(AuthService);

  readonly itemsPerPage = 20;

  thread = signal<Thread | null>(null);
  posts = signal<Post[]>([]);
  newPostContent = '';

  currentPage = signal(1);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  editingPostId = signal<number | null>(null);
  editContent = '';
  savingEdit = signal(false);

  private threadId = 0;

  ngOnInit(): void {
    this.threadId = Number(this.route.snapshot.paramMap.get('id'));
    this.forumService.getThread(this.threadId).subscribe((t) => this.thread.set(t));
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.forumService
      .getPosts(this.threadId, page, this.itemsPerPage)
      .subscribe(({ items, total }) => {
        this.posts.set(items);
        this.totalItems.set(total);
        this.currentPage.set(page);
      });
  }

  canEditPost(post: Post): boolean {
    const me = this.authService.user();
    return !!me && (this.authService.isAdmin() || post.user?.id === me.id);
  }

  submitPost(): void {
    if (!this.newPostContent.trim()) return;
    this.forumService
      .createPost({ content: this.newPostContent, thread: `/api/threads/${this.threadId}` })
      .subscribe((post) => {
        this.posts.set([...this.posts(), post]);
        this.newPostContent = '';
        this.totalItems.update((n) => n + 1);
      });
  }

  startEdit(post: Post): void {
    this.editingPostId.set(post.id);
    this.editContent = post.content;
  }

  cancelEdit(): void {
    this.editingPostId.set(null);
    this.editContent = '';
  }

  saveEdit(): void {
    const id = this.editingPostId();
    if (!id || !this.editContent.trim()) return;
    this.savingEdit.set(true);
    this.forumService.updatePost(id, this.editContent).subscribe({
      next: (updated) => {
        this.posts.set(this.posts().map((p) => (p.id === id ? updated : p)));
        this.cancelEdit();
        this.savingEdit.set(false);
      },
      error: () => this.savingEdit.set(false),
    });
  }

  deletePost(id: number): void {
    if (!confirm('Supprimer ce message ?')) return;
    this.forumService.deletePost(id).subscribe(() => {
      this.posts.set(this.posts().filter((p) => p.id !== id));
      this.totalItems.update((n) => n - 1);
    });
  }

  deleteThread(): void {
    const t = this.thread();
    if (!t || !confirm('Supprimer tout ce canal de transmission ?')) return;
    this.forumService.deleteThread(t.id).subscribe(() => {
      this.router.navigate(['/forum']);
    });
  }

  votePost(post: Post, direction: 'upvote' | 'downvote'): void {
    this.forumService.votePost(post.id, direction).subscribe((counts) => {
      this.posts.set(
        this.posts().map((p) =>
          p.id === post.id ? { ...p, upVote: counts.upVote, downVote: counts.downVote } : p,
        ),
      );
    });
  }
}
