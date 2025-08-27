// src/app/pages/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Create Account</h2>
          <p>Join us and start shopping</p>
        </div>

        <form class="auth-form" (ngSubmit)="onRegister()" #registerForm="ngForm">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName"
              [(ngModel)]="registerData.fullName"
              required
              class="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="registerData.email"
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
              [(ngModel)]="registerData.password"
              required
              minlength="6"
              class="form-input"
              placeholder="Enter your password"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              [(ngModel)]="registerData.confirmPassword"
              required
              class="form-input"
              placeholder="Confirm your password"
            />
          </div>

          <button 
            type="submit" 
            class="auth-btn"
            [disabled]="!registerForm.form.valid || registerData.password !== registerData.confirmPassword"
          >
            Create Account
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? 
            <a routerLink="/login" class="auth-link">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-header h2 {
      color: #1f2937;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .auth-header p {
      color: #6b7280;
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
    }

    .form-input {
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .auth-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 8px;
    }

    .auth-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .auth-footer p {
      color: #6b7280;
      margin: 0;
    }

    .auth-link {
      color: #667eea;
      font-weight: 600;
      text-decoration: none;
    }

    .auth-link:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Register attempt:', this.registerData);
    alert('Registration successful!');
    this.router.navigate(['/products']);
  }
}
