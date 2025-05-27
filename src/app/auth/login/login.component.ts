import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthStore } from '../auth.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hide = true;
  loginSuccess = false;

  constructor(private fb: FormBuilder, public authStore: AuthStore, private router: Router) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.loginSuccess = false;
  }

  login(): void {
    if (this.loginForm.valid) {
      this.authStore.loading.set(true);

      const { email, password } = this.loginForm.value;

      this.authStore.signIn(email, password)
        .then(() => {
          console.log('Login successful');
          this.loginSuccess = true;
          setTimeout(() => {
            this.router.navigate(['home']);
          }, 1500);
        })
        .catch((error) => {
          console.error('Login failed', error);
          this.loginSuccess = false;
        })
        .finally(() => {
          this.authStore.loading.set(false);
        });
    }
  }

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  register(): void {
    this.router.navigate(['/auth/register']);
  }
}
