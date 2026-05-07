import { Routes } from '@angular/router';
import { authGuard, adminGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('@features/products/product-list/product-list').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('@features/products/product-detail/product-detail').then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: 'cart',
    loadComponent: () => import('@features/cart/cart').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('@features/checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@features/auth/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'articles',
    loadComponent: () =>
      import('@features/articles/article-list/article-list').then((m) => m.ArticleListComponent),
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('@features/articles/article-detail/article-detail').then(
        (m) => m.ArticleDetailComponent,
      ),
  },
  {
    path: 'forum',
    loadComponent: () =>
      import('@features/forum/category-list/forum-category-list').then(
        (m) => m.ForumCategoryListComponent,
      ),
  },
  {
    path: 'forum/:id',
    loadComponent: () =>
      import('@features/forum/subcategory/forum-subcategory').then(
        (m) => m.ForumSubcategoryComponent,
      ),
  },
  {
    path: 'forum/:id/threads',
    loadComponent: () =>
      import('@features/forum/thread-list/forum-thread-list').then(
        (m) => m.ForumThreadListComponent,
      ),
  },
  {
    path: 'forum/thread/:id',
    loadComponent: () =>
      import('@features/forum/thread/forum-thread').then((m) => m.ForumThreadComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('@features/contact/contact').then((m) => m.ContactComponent),
  },
  {
    path: 'space',
    canActivate: [authGuard],
    loadComponent: () => import('@features/space/space-base').then((m) => m.SpaceBaseComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('@features/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('@features/admin/dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'admin/products',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('@features/admin/products/admin-products').then((m) => m.AdminProductsComponent),
  },
  {
    path: 'admin/users',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('@features/admin/users/admin-users').then((m) => m.AdminUsersComponent),
  },
  {
    path: 'admin/orders',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('@features/admin/orders/admin-orders/admin-orders').then(
        (m) => m.AdminOrdersComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('@features/auth/forgot-password/forgot-password').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('@features/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('@features/auth/verify-email/verify-email').then((m) => m.VerifyEmailComponent),
  },
  {
    path: 'admin/contacts',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('@features/admin/contacts/admin-contacts').then((m) => m.AdminContactsComponent),
  },
  {
    path: 'bonus',
    loadComponent: () => import('@features/bonus/bonus').then((m) => m.BonusComponent),
  },
  {
    path: 'legal/cgu',
    loadComponent: () => import('@features/legal/legal').then((m) => m.LegalComponent),
    data: { type: 'cgu' },
  },
  {
    path: 'legal/cgv',
    loadComponent: () => import('@features/legal/legal').then((m) => m.LegalComponent),
    data: { type: 'cgv' },
  },
  {
    path: 'legal/mentions',
    loadComponent: () => import('@features/legal/legal').then((m) => m.LegalComponent),
    data: { type: 'mentions' },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
