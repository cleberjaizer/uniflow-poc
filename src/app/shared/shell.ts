import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../core/auth.service';
import { UserRole } from '../core/models';

interface NavItem {
  path: string;
  key: string;
  icon: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './shell.html',
})
export class Shell {
  auth = inject(AuthService);
  private router = inject(Router);

  nav: NavItem[] = [
    { path: '/dashboard', key: 'nav.dashboard', icon: '📊' },
    { path: '/materials', key: 'nav.materials', icon: '📦' },
    { path: '/coworkers', key: 'nav.coworkers', icon: '👥' },
    { path: '/actions', key: 'nav.actions', icon: '📷' },
    { path: '/settings', key: 'nav.settings', icon: '⚙️' },
  ];

  visibleNav = computed(() => {
    return this.nav.filter((n) => !n.roles || this.auth.hasRole(n.roles));
  });

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
