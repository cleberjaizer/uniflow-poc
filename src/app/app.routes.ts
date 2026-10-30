import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'materials', loadComponent: () => import('./pages/materials/materials').then((m) => m.Materials) },
      { path: 'coworkers', loadComponent: () => import('./pages/coworkers/coworkers').then((m) => m.Coworkers) },
      { path: 'actions', loadComponent: () => import('./pages/actions/actions').then((m) => m.Actions) },
    ],
  },
  { path: '**', redirectTo: '' },
];
