import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../auth.store';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    // RouterLink,
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  registerForm!: FormGroup;
  hide = true;
   constructor(private fb: FormBuilder, private authStore: AuthStore , private router: Router) {}
   ngOnInit(): void {

       this.registerForm = this.fb.group({
         email: ['', [Validators.required, Validators.email]],
         password: ['', [Validators.required, Validators.minLength(6)]],
       });
     }

   async register(): Promise<void> {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      try {
        await this.authStore.register(email, password);
        console.log('Registration successful');
        this.router.navigate(['/auth/login']);
      } catch (error) {
        console.error('Registration failed', error);
      }
    }
  }
  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  login(): void {
    this.router.navigate(['/auth/login']);
  }
  // async loginWithGoogle(): Promise<void> {
  //   try {
  //     await this.authStore.signInWithGoogle();
  //     console.log('Google Sign-In successful');
  //   } catch (error) {
  //     console.error('Google Sign-In failed', error);
  //   }
  // }
}
