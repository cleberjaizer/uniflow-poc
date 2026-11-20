import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = signal('');
  error = signal(false);

  setEmail(val: string) {
    this.email.set(val);
    this.error.set(false);
  }

  login() {
    this.error.set(false);
    if (this.auth.login(this.email())) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set(true);
    }
  }
}
