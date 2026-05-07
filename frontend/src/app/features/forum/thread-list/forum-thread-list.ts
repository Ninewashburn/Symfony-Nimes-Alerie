import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ForumService } from '@core/services/forum.service';
import { AuthService } from '@core/services/auth.service';
import { Thread } from '@core/models/product.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-forum-thread-list',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './forum-thread-list.html',
  styleUrl: './forum-thread-list.scss',
})
export class ForumThreadListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private forumService = inject(ForumService);
  authService = inject(AuthService);

  readonly itemsPerPage = 10;

  threads = signal<Thread[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  subTypeId = 0;
  newSubject = '';

  currentPage = signal(1);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  ngOnInit(): void {
    this.subTypeId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.forumService.getThreads(this.subTypeId, page, this.itemsPerPage).subscribe({
      next: ({ items, total }) => {
        this.threads.set(items);
        this.totalItems.set(total);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) this.newSubject = '';
  }

  submitThread(): void {
    if (!this.newSubject.trim()) return;
    this.submitting.set(true);
    this.forumService
      .createThread({
        subject: this.newSubject,
        subtype: `/api/sub_types/${this.subTypeId}`,
      })
      .subscribe({
        next: (thread) => {
          this.submitting.set(false);
          this.router.navigate(['/forum/thread', thread.id]);
        },
        error: () => this.submitting.set(false),
      });
  }
}
