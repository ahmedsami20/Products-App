/*// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-brand">
          <h2>Product Store</h2>
        </div>
        
        <div class="nav-links">
          <a 
            routerLink="/products" 
            routerLinkActive="active"
            class="nav-link"
          >
            Products
          </a>
          <a 
            routerLink="/login" 
            routerLinkActive="active"
            class="nav-link"
          >
            Login
          </a>
          <a 
            routerLink="/register" 
            routerLinkActive="active"
            class="nav-link"
          >
            Register
          </a>
          <a 
            routerLink="/cart" 
            routerLinkActive="active"
            class="nav-link"
          >
            Cart
          </a>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    .nav-brand h2 {
      color: #667eea;
      margin: 0;
      font-weight: 700;
      font-size: 1.8rem;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .nav-link {
      text-decoration: none;
      color: #64748b;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .nav-link.active {
      color: #16a34a;
      background: rgba(22, 163, 74, 0.1);
      border: 2px solid #16a34a;
    }

    .main-content {
      padding: 0;
      min-height: calc(100vh - 80px);
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }

      .nav-links {
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .nav-link {
        font-size: 14px;
        padding: 0.4rem 0.8rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'product-store';
}*/


// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CartService } from './services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="app">
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-brand">
            <a routerLink="/products" class="brand-link">
              🛍️ ShopApp
            </a>
          </div>
          
          <div class="nav-menu">
            <a routerLink="/products" routerLinkActive="active" class="nav-link">
              Products
            </a>
            <a routerLink="/cart" routerLinkActive="active" class="nav-link cart-link">
              🛒 Cart
              <span class="cart-badge" *ngIf="cartItemCount > 0">
                {{ cartItemCount }}
              </span>
            </a>
            <a routerLink="/login" routerLinkActive="active" class="nav-link">
              Login
            </a>
            <a routerLink="/register" routerLinkActive="active" class="nav-link">
              Register
            </a>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
    }

    .navbar {
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      height: 70px;
    }

    .nav-brand {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .brand-link {
      color: #667eea;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .brand-link:hover {
      color: #764ba2;
    }

    .nav-menu {
      display: flex;
      gap: 30px;
      align-items: center;
    }

    .nav-link {
      color: #6b7280;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      padding: 8px 16px;
      border-radius: 8px;
      position: relative;
    }

    .nav-link:hover {
      color: #667eea;
      background: #f3f4f6;
    }

    .nav-link.active {
      color: #667eea;
      background: #e0e7ff;
    }

    .cart-link {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cart-badge {
      background: #dc2626;
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      min-width: 20px;
      text-align: center;
      line-height: 1.4;
    }

    .main-content {
      flex: 1;
    }

    @media (max-width: 768px) {
      .nav-container {
        padding: 0 10px;
        height: 60px;
      }

      .nav-menu {
        gap: 15px;
      }

      .nav-link {
        padding: 6px 12px;
        font-size: 0.9rem;
      }

      .brand-link {
        font-size: 1.3rem;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'products-app';
  cartItemCount = 0;
  private cartSubscription?: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.cartItems$.subscribe(
      (items) => {
        this.cartItemCount = this.cartService.getCartItemCount();
      }
    );
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}