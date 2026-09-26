import { Component, signal } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';
import { LoadingService } from '../../core/services/loading.service';
import { AuthService } from '../../auth/services/auth.service';
import { AccountService } from '../../auth/services/account.service';
import { environment } from '../../../environment/environment';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterComponent],
  templateUrl: './main.component.html'
})
export class MainComponent {

  isLoginPage = false;
  sidebarOpen = signal<boolean>(false);
  userMenuOpen = signal<boolean>(false);

  navItems: NavItem[] = [
    { label: 'User Accounts', path: '/users', icon: 'bi-people' },
  ];

  bottomNavItems: NavItem[] = [
    { label: 'Settings', path: '/settings', icon: 'bi-gear' },
  ];

  currentPageLabel = 'Dashboard';

  constructor(
    private router: Router,
    private loading: LoadingService,
    public authService: AuthService,
    public accountService: AccountService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading.startNav();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading.stopNav();
      }

      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.router.url === '/login' || this.router.url === '/';
        const all = [...this.navItems, ...this.bottomNavItems];
        const match = all.find(n => this.router.url.startsWith(n.path));
        this.currentPageLabel = match ? match.label : 'Dashboard';
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }
  getProfileImageUrl(objectKey: string): string {
      const cleanKey = objectKey.replace(/[{}]/g, '');
      return `${environment.mediaUrl}/user-media/${encodeURIComponent(cleanKey)}`;
    }
    onImageError(event: Event): void {
      const img = event.target as HTMLImageElement;
      img.style.display = 'none';
    }

  get userInitials(): string {
    const profile = this.accountService.profile();

    const firstName = profile?.profile?.firstName?.trim();
    const lastName = profile?.profile?.lastName?.trim();

    if (!firstName) {
      return 'A';
    }

    return (
      firstName.charAt(0) +
      (lastName?.charAt(0) ?? '')
    ).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
