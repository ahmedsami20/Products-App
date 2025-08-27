// src/app/pages/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-container">
      <div class="cart-content">
        <header class="cart-header">
          <h1 class="cart-title">Shopping Cart</h1>
          <p class="cart-subtitle" *ngIf="cartItems.length > 0">
            {{ getTotalItemCount() }} {{ getTotalItemCount() === 1 ? 'item' : 'items' }} in your cart
          </p>
        </header>

        <div class="cart-main" *ngIf="cartItems.length > 0">
          <div class="cart-items">
            <div 
              *ngFor="let item of cartItems; trackBy: trackByProductId" 
              class="cart-item"
            >
              <div class="item-image">
                <img 
                  [src]="getImageUrl(item.product.thumbnail || item.product.images?.[0])"
                  [alt]="item.product.title"
                  class="product-image"
                  (error)="onImageError($event)"
                />
              </div>
              
              <div class="item-details">
                <h3 class="item-title">{{ item.product.title }}</h3>
                <p class="item-category">{{ item.product.category | titlecase }}</p>
                <p class="item-description">{{ item.product.description | slice:0:100 }}...</p>
                
                <div class="item-stock" 
                     [class.low-stock]="item.product.stock <= 5"
                     [class.out-of-stock]="item.product.stock === 0">
                  {{ item.product.stock > 0 ? 
                     (item.product.stock + ' in stock') : 
                     'Out of stock' }}
                </div>
              </div>
              
              <div class="item-price">
                <span class="price">EGP {{ item.product.price.toFixed(2) }}</span>
              </div>
              
              <div class="item-quantity">
                <button 
                  class="quantity-btn decrease"
                  (click)="decreaseQuantity(item)"
                  [disabled]="item.quantity <= 1"
                >
                  -
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button 
                  class="quantity-btn increase"
                  (click)="increaseQuantity(item)"
                  [disabled]="item.quantity >= item.product.stock"
                >
                  +
                </button>
              </div>
              
              <div class="item-total">
                <span class="total">EGP {{ (item.product.price * item.quantity).toFixed(2) }}</span>
              </div>
              
              <div class="item-actions">
                <button 
                  class="remove-btn"
                  (click)="removeItem(item.product.id)"
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <div class="cart-summary">
            <div class="summary-card">
              <h3 class="summary-title">Order Summary</h3>
              
              <div class="summary-line">
                <span>Items ({{ getTotalItemCount() }})</span>
                <span>EGP {{ getSubtotal().toFixed(2) }}</span>
              </div>
              
              <div class="summary-line">
                <span>Shipping</span>
                <span>EGP {{ getShipping().toFixed(2) }}</span>
              </div>
              
              <div class="summary-line">
                <span>Tax</span>
                <span>EGP {{ getTax().toFixed(2) }}</span>
              </div>
              
              <div class="summary-divider"></div>
              
              <div class="summary-total">
                <span>Total</span>
                <span>EGP {{ getTotal().toFixed(2) }}</span>
              </div>
              
              <button class="checkout-btn" (click)="proceedToCheckout()">
                Proceed to Checkout
              </button>
              
              <button class="continue-shopping-btn" routerLink="/products">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        <div class="empty-cart" *ngIf="cartItems.length === 0">
          <div class="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <button class="shop-now-btn" routerLink="/products">
            Start Shopping
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .cart-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .cart-header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .cart-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .cart-subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .cart-main {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
      align-items: start;
    }

    .cart-items {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto auto;
      gap: 20px;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      overflow: hidden;
      background: #f3f4f6;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
    }

    .item-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .item-category {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 8px;
      text-transform: capitalize;
    }

    .item-description {
      color: #9ca3af;
      font-size: 0.85rem;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .item-stock {
      font-size: 0.8rem;
      font-weight: 600;
      color: #059669;
    }

    .item-stock.low-stock {
      color: #d97706;
    }

    .item-stock.out-of-stock {
      color: #dc2626;
    }

    .item-price .price {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f3f4f6;
      border-radius: 8px;
      padding: 4px;
    }

    .quantity-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: white;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quantity-btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      min-width: 30px;
      text-align: center;
      font-weight: 600;
    }

    .item-total .total {
      font-size: 1.2rem;
      font-weight: 700;
      color: #059669;
    }

    .remove-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .remove-btn:hover {
      background: #fee2e2;
    }

    .cart-summary {
      position: sticky;
      top: 20px;
    }

    .summary-card {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .summary-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 20px;
      text-align: center;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      color: #6b7280;
    }

    .summary-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 16px 0;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      font-size: 1.3rem;
      font-weight: 700;
      color: #1f2937;
    }

    .checkout-btn {
      width: 100%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .checkout-btn:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }

    .continue-shopping-btn {
      width: 100%;
      background: transparent;
      color: #6b7280;
      border: 2px solid #e5e7eb;
      padding: 12px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .continue-shopping-btn:hover {
      border-color: #667eea;
      color: #667eea;
      transform: translateY(-1px);
    }

    .empty-cart {
      text-align: center;
      color: white;
      padding: 80px 20px;
    }

    .empty-cart-icon {
      font-size: 5rem;
      margin-bottom: 30px;
      opacity: 0.7;
    }

    .empty-cart h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .empty-cart p {
      font-size: 1.2rem;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .shop-now-btn {
      background: white;
      color: #667eea;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .shop-now-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
    }

    @media (max-width: 768px) {
      .cart-title {
        font-size: 2.5rem;
      }

      .cart-main {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: 15px;
        grid-template-areas: 
          "image details"
          "image price"
          "quantity quantity"
          "total actions";
      }

      .item-image {
        grid-area: image;
        width: 80px;
        height: 80px;
      }

      .item-details {
        grid-area: details;
      }

      .item-price {
        grid-area: price;
        text-align: right;
      }

      .item-quantity {
        grid-area: quantity;
        justify-self: start;
      }

      .item-total {
        grid-area: total;
      }

      .item-actions {
        grid-area: actions;
        justify-self: end;
      }

      .cart-items {
        padding: 20px;
      }

      .summary-card {
        padding: 20px;
      }
    }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private cartSubscription?: Subscription;
  
  // Default placeholder image
  private readonly defaultImage = 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=No+Image';

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.cartItems$.subscribe(
      (items) => {
        this.cartItems = items;
      }
    );
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.product.id;
  }

  increaseQuantity(item: CartItem) {
    if (item.quantity < item.product.stock) {
      this.cartService.updateQuantity(item.product.id, item.quantity + 1);
    }
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  removeItem(productId: number) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  getTotalItemCount(): number {
    return this.cartService.getCartItemCount();
  }

  getSubtotal(): number {
    return this.cartService.getCartTotal();
  }

  getShipping(): number {
    // Free shipping over 500 EGP, otherwise 50 EGP
    const subtotal = this.getSubtotal();
    return subtotal >= 500 ? 0 : 50;
  }

  getTax(): number {
    // 14% tax rate
    return this.getSubtotal() * 0.14;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  proceedToCheckout() {
    // In a real app, this would navigate to checkout
    alert('Proceeding to checkout...\nTotal: EGP ' + this.getTotal().toFixed(2));
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) {
      return this.defaultImage;
    }
    
    // If it's a relative path, assume it's in assets
    if (imageUrl.startsWith('images/') || imageUrl.startsWith('./images/')) {
      return `assets/${imageUrl.replace('./', '')}`;
    }
    
    // If it starts with assets, use as is
    if (imageUrl.startsWith('assets/')) {
      return imageUrl;
    }
    
    // If it's an absolute URL, use as is
    if (this.isValidUrl(imageUrl)) {
      return imageUrl;
    }
    
    // Fallback to default
    return this.defaultImage;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.startsWith('assets/') || url.startsWith('http');
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.warn('Image failed to load:', target.src);
    target.src = this.defaultImage;
  }
}