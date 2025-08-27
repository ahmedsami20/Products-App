// src/app/components/product-card/product-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="product-card" (click)="onCardClick()">
      <div class="product-image-container">
        <img 
          [src]="product.thumbnail" 
          [alt]="product.title"
          class="product-image"
          (error)="onImageError($event)"
        />
      </div>
      
      <div class="product-details">
        <h3 class="product-title">{{ product.title }}</h3>
        
        <div class="product-price">
          {{ product.price | currency:'EGP':'symbol':'1.2-2' }}
        </div>
        
        <div class="product-rating">
          <div class="stars">
            <span 
              *ngFor="let star of [1,2,3,4,5]; let i = index"
              class="star"
              [class.filled]="i < getFilledStars()"
              [class.half]="i === getFilledStars() && hasHalfStar()"
            >
              ★
            </span>
          </div>
          <span class="rating-value">({{ product.rating }})</span>
        </div>
        
        <div class="stock-status">
          <span 
            class="stock-text"
            [class.in-stock]="product.stock > 0"
            [class.out-of-stock]="product.stock === 0"
          >
            {{ product.stock === 0 ? 'Out of Stock' : 'In Stock' }}
          </span>
        </div>
        
        <button 
          class="add-to-cart-btn"
          [disabled]="product.stock === 0"
          (click)="addToCart($event)"
        >
          Add to Cart
        </button>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      height: 100%;
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .product-image-container {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: #f8f9fa;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image {
      transform: scale(1.05);
    }

    .product-details {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #333;
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-price {
      font-size: 18px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 12px;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .star {
      color: #ddd;
      font-size: 16px;
      transition: color 0.2s ease;
    }

    .star.filled {
      color: #ffc107;
    }

    .star.half {
      background: linear-gradient(90deg, #ffc107 50%, #ddd 50%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .rating-value {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .stock-status {
      margin-bottom: 16px;
    }

    .stock-text {
      font-weight: 600;
      font-size: 14px;
    }

    .stock-text.in-stock {
      color: #16a34a;
    }

    .stock-text.out-of-stock {
      color: #dc2626;
    }

    .add-to-cart-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: auto;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 14px;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .add-to-cart-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .add-to-cart-btn:active:not(:disabled) {
      transform: translateY(0);
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() productClick = new EventEmitter<number>();

  getFilledStars(): number {
    return Math.floor(this.product.rating);
  }

  hasHalfStar(): boolean {
    return this.product.rating % 1 >= 0.5;
  }

  onCardClick(): void {
    this.productClick.emit(this.product.id);
  }

  addToCart(event: Event): void {
    event.stopPropagation(); // Prevent card click when button is clicked
    if (this.product.stock > 0) {
      console.log('Added to cart:', this.product.title);
      alert(`${this.product.title} added to cart!`);
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=No+Image';
  }
}