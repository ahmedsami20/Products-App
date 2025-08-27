// src/app/pages/product-details/product-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/product.interface';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-details-container">
      <div class="back-button-container">
        <button class="back-btn" (click)="goBack()">
          ← Back to Products
        </button>
      </div>

      <div class="product-details-content" *ngIf="product">
        <div class="product-images">
          <div class="main-image">
            <img 
              [src]="getImageUrl(selectedImage)" 
              [alt]="product.title"
              class="main-product-image"
              (error)="onImageError($event)"
              (load)="onImageLoad($event)"
            />
            <div class="image-loading" *ngIf="imageLoading">Loading...</div>
          </div>
          
          <div class="image-thumbnails" *ngIf="product.images && product.images.length > 1">
            <img 
              *ngFor="let image of product.images; let i = index"
              [src]="getImageUrl(image)"
              [alt]="product.title + ' image ' + (i + 1)"
              class="thumbnail-image"
              [class.active]="selectedImage === image"
              (click)="selectImage(image)"
              (error)="onThumbnailError($event, i)"
            />
          </div>
        </div>

        <div class="product-info">
          <div class="product-header">
            <span class="product-category">{{ product.category | titlecase }}</span>
            <h1 class="product-title">{{ product.title }}</h1>
            <div class="product-brand" *ngIf="product.brand">
              <strong>Brand:</strong> {{ product.brand }}
            </div>
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
            <span class="rating-value">{{ product.rating }} / 5</span>
          </div>

          <div class="product-price">
            <span class="current-price">EGP {{ product.price.toFixed(2) }}</span>
            <span class="discount" *ngIf="product.discountPercentage > 0">
              {{ product.discountPercentage }}% OFF
            </span>
          </div>

          <div class="product-description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-stock">
            <span 
              class="stock-status"
              [class.in-stock]="product.stock > 0"
              [class.out-of-stock]="product.stock === 0"
            >
              {{ product.stock === 0 ? 'Out of Stock' : 'In Stock (' + product.stock + ' available)' }}
            </span>
          </div>

          <div class="product-actions">
            <button 
              class="add-to-cart-btn"
              [disabled]="product.stock === 0"
              (click)="addToCart()"
            >
              Add to Cart
            </button>
          </div>

          <div class="product-details-grid">
            <div class="detail-item">
              <strong>SKU:</strong>
              <span>{{ product.sku }}</span>
            </div>
            <div class="detail-item" *ngIf="product.weight">
              <strong>Weight:</strong>
              <span>{{ product.weight }} kg</span>
            </div>
            <div class="detail-item" *ngIf="product.warrantyInformation">
              <strong>Warranty:</strong>
              <span>{{ product.warrantyInformation }}</span>
            </div>
            <div class="detail-item" *ngIf="product.shippingInformation">
              <strong>Shipping:</strong>
              <span>{{ product.shippingInformation }}</span>
            </div>
            <div class="detail-item" *ngIf="product.returnPolicy">
              <strong>Return Policy:</strong>
              <span>{{ product.returnPolicy }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="!product && !notFound">
        <div class="loader"></div>
        <p>Loading product details...</p>
      </div>

      <div class="not-found" *ngIf="notFound">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button class="back-btn" (click)="goBack()">
          Back to Products
        </button>
      </div>

      <div class="error" *ngIf="error">
        <h2>Error Loading Product</h2>
        <p>{{ error }}</p>
        <button class="back-btn" (click)="goBack()">
          Back to Products
        </button>
      </div>
    </div>
  `,
  styles: [`
    .product-details-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .back-button-container {
      max-width: 1200px;
      margin: 0 auto 20px;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.9);
      color: #667eea;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .back-btn:hover {
      background: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .product-details-content {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }

    .product-images {
      padding: 40px;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .main-image {
      width: 100%;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: relative;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
      background: #f3f4f6;
    }

    .main-product-image:hover {
      transform: scale(1.05);
    }

    .image-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 14px;
    }

    .image-thumbnails {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .thumbnail-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 3px solid transparent;
      background: #f3f4f6;
    }

    .thumbnail-image:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .thumbnail-image.active {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .product-info {
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .product-header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 20px;
    }

    .product-category {
      background: #667eea;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 16px 0 8px 0;
      line-height: 1.2;
    }

    .product-brand {
      color: #6b7280;
      font-size: 1.1rem;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stars {
      display: flex;
      gap: 4px;
    }

    .star {
      color: #d1d5db;
      font-size: 20px;
      transition: color 0.2s ease;
    }

    .star.filled {
      color: #fbbf24;
    }

    .star.half {
      background: linear-gradient(90deg, #fbbf24 50%, #d1d5db 50%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .rating-value {
      font-size: 1.1rem;
      color: #6b7280;
      font-weight: 600;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .current-price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #059669;
    }

    .discount {
      background: #dc2626;
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
    }

    .product-description h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
    }

    .product-description p {
      color: #6b7280;
      line-height: 1.6;
      font-size: 1.1rem;
    }

    .product-stock {
      padding: 16px;
      border-radius: 8px;
      background: #f3f4f6;
    }

    .stock-status {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .stock-status.in-stock {
      color: #059669;
    }

    .stock-status.out-of-stock {
      color: #dc2626;
    }

    .add-to-cart-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
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

    .add-to-cart-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }

    .add-to-cart-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .product-details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-item strong {
      color: #374151;
      font-weight: 600;
    }

    .detail-item span {
      color: #6b7280;
    }

    .loading, .not-found, .error {
      text-align: center;
      color: white;
      padding: 60px 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .loader {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    .not-found h2, .error h2 {
      font-size: 2rem;
      margin-bottom: 16px;
    }

    .not-found p, .error p {
      font-size: 1.2rem;
      margin-bottom: 24px;
      opacity: 0.9;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      .product-details-content {
        grid-template-columns: 1fr;
        margin: 0 10px;
      }

      .product-images,
      .product-info {
        padding: 20px;
      }

      .main-image {
        height: 300px;
      }

      .product-title {
        font-size: 2rem;
      }

      .current-price {
        font-size: 2rem;
      }

      .product-details-container {
        padding: 10px;
      }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  selectedImage: string = '';
  notFound: boolean = false;
  error: string = '';
  imageLoading: boolean = false;
  
  // Default placeholder image
  private readonly defaultImage = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image+Available';
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: number) {
    this.loadProductsFromJson().subscribe(
      (products: Product[]) => {
        const foundProduct = products.find(p => p.id === id);
        
        if (foundProduct) {
          this.product = foundProduct;
          this.selectedImage = this.getValidImage(foundProduct);
        } else {
          this.notFound = true;
        }
      },
      (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load product data. Please try again later.';
      }
    );
  }

  private loadProductsFromJson(): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>('assets/products.json').pipe(
      map((response: { products: Product[] }) => response.products),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return of([]); 
      })
    );
  }

  // Get valid image - prioritize thumbnail, then first image, then default
  private getValidImage(product: Product): string {
    if (product.thumbnail && this.isValidUrl(product.thumbnail)) {
      return product.thumbnail;
    }
    
    if (product.images && product.images.length > 0) {
      const validImage = product.images.find(img => this.isValidUrl(img));
      if (validImage) {
        return validImage;
      }
    }
    
    return this.defaultImage;
  }

  // Basic URL validation
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.startsWith('assets/') || url.startsWith('http');
    }
  }

  // Get image URL with fallback
  getImageUrl(imageUrl: string): string {
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

  getFilledStars(): number {
    return this.product ? Math.floor(this.product.rating) : 0;
  }

  hasHalfStar(): boolean {
    return this.product ? this.product.rating % 1 >= 0.5 : false;
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  addToCart(): void {
    if (this.product && this.product.stock > 0) {
      console.log('Added to cart:', this.product.title);
      alert(`${this.product.title} added to cart!`);
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.warn('Image failed to load:', target.src);
    target.src = this.defaultImage;
  }

  onThumbnailError(event: Event, index: number): void {
    const target = event.target as HTMLImageElement;
    console.warn(`Thumbnail ${index} failed to load:`, target.src);
    target.src = this.defaultImage;
  }

  onImageLoad(event: Event): void {
    this.imageLoading = false;
    console.log('Image loaded successfully');
  }
}