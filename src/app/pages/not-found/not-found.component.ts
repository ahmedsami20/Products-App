import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for doesn't exist or has been moved.</p>
        
        <div class="not-found-actions">
          <a routerLink="/products" class="home-btn">
            Back to Products
          </a>
          <button class="back-btn" (click)="goBack()">
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* نفس الستايل اللي عندك هنا بدون أي كود زيادة */
  `]
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
