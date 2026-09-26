import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Page } from '../../models/page';
import { CustomerProfile } from '../../models/customerProfile';
import { UserService } from '../../services/user.service';
import { formatPhone } from '../../core/http/utils';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  phoneFormatter = formatPhone;

  // UI state
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Paging + filters
  pageIndex = signal<number>(0);   // 0-based
  pageSize  = signal<number>(10);
  nameQuery = signal<string>('');
  status    = signal<string>('');  // <-- fully typed union
  referralCode = signal<string>('');

  // Data
  page = signal<Page<CustomerProfile> | null>(null);

  // Placeholder rows shown while the table is loading
  skeletonRows = Array.from({ length: 6 });

  ngOnInit(): void {
    this.load();
  }

  // Called by template (no casts inside template)
  onStatusChange(val: string): void {
    this.status.set(val);
  }
  onReferralCodeChange(val: string): void {
    this.referralCode.set(val);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: any = {
      page: this.pageIndex(),
      size: this.pageSize()
    };
    const name = this.nameQuery().trim();
    const referralCode = this.referralCode().trim();

    if (name) { params.name = name; }
    if (referralCode) { params.referralCode = referralCode; }
    if (this.status()) { params.status = this.status(); }

    this.userService.list(params).subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load users.');
        this.loading.set(false);
      }
    });
  }

  // Actions
  createNew(): void {
    this.router.navigate(['/users', 'new']);
  }
  view(r: CustomerProfile): void {
    if (r.profile?.profileId) { this.router.navigate(['/users', r.account.userAccountId]); }
  }
  edit(r: CustomerProfile): void {
    if (r.profile?.profileId) { this.router.navigate(['/users', r.account.userAccountId, 'edit']); }
  }

  //Pagination helpers 
  private lastPageIndex(): number {
    const p = this.page();
    const total = p?.totalPages ?? 0;
    return Math.max(0, total - 1);
  }


  first(): void {
    
    if (this.pageIndex() > 0) {
      this.pageIndex.set(0);
      this.load();
    }
  }
  prev(): void {
    if (this.pageIndex() > 0) {
      this.pageIndex.set(this.pageIndex() - 1);
      this.load();
    }
  }
  next(): void {
    const last = this.lastPageIndex();
    if (this.pageIndex() < last) {
      this.pageIndex.set(this.pageIndex() + 1);
      this.load();
    }
  }
  last(): void {
    const last = this.lastPageIndex();
    if (last >= 0) {
      this.pageIndex.set(last);
      this.load();
    }
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(0);
    this.load();
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    this.load();
  }

  clearFilters(): void {
    this.nameQuery.set('');
    this.referralCode.set('');
    this.status.set('');     
    this.pageIndex.set(0);
    this.load();
  }

  goUpload(): void{
    this.router.navigate(['/rooms', 'upload'])
  }

}