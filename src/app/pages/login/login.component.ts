import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Welcome Back</h2>
          <p>Please sign in to your account</p>
        </div>

        <form class="auth-form" (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="loginData.email"
              required
              class="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="loginData.password"
              required
              class="form-input"
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            class="auth-btn"
            [disabled]="!loginForm.form.valid"
          >
            Sign In
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? 
            <a routerLink="/register" class="auth-link">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };

  constructor(private router: Router) {}

  onLogin() {
    console.log('Login attempt:', this.loginData);
    alert('Login successful!');
    this.router.navigate(['/products']);
  }
}

