// src/app/pages/products/products.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/product.interface';
import { CartService } from '../../services/cart.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="products-container">
      <header class="products-header">
        <div class="header-content">
          <h1 class="main-title">Premium Products</h1>
          <p class="subtitle">Discover our curated collection of quality items</p>
          
          <div class="search-and-filter">
            <div class="search-container">
              <input 
                type="text" 
                [(ngModel)]="searchTerm"
                (input)="onSearchChange()"
                placeholder="Search products..."
                class="search-input"
              />
              <span class="search-icon">🔍</span>
            </div>
            
            <div class="filter-container">
              <select 
                [(ngModel)]="selectedCategory"
                (change)="onCategoryChange()"
                class="category-filter"
              >
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category">
                  {{ category | titlecase }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main class="products-main">
        <div class="products-grid" *ngIf="filteredProducts.length > 0">
          <div 
            *ngFor="let product of filteredProducts" 
            class="product-card"
          >
            <div class="product-image-container" (click)="viewProduct(product.id)">
              <img 
                [src]="getImageUrl(product.thumbnail || (product.images && product.images[0]))"
                [alt]="product.title"
                class="product-image"
                (error)="onImageError($event)"
              />
              <div class="product-badge" *ngIf="product.discountPercentage > 0">
                {{ product.discountPercentage }}% OFF
              </div>
            </div>
            
            <div class="product-info">
              <div class="product-category">{{ product.category | titlecase }}</div>
              <h3 class="product-title" (click)="viewProduct(product.id)">{{ product.title }}</h3>
              <p class="product-description">{{ product.description | slice:0:100 }}...</p>
              
              <div class="product-rating">
                <div class="stars">
                  <span 
                    *ngFor="let star of [1,2,3,4,5]; let i = index"
                    class="star"
                    [class.filled]="i < getFilledStars(product.rating)"
                  >
                    ★
                  </span>
                </div>
                <span class="rating-value">{{ product.rating }}</span>
              </div>
              
              <div class="product-price">
                <span class="current-price">EGP {{ product.price.toFixed(2) }}</span>
              </div>
              
              <div class="product-stock" 
                   [class.in-stock]="product.stock > 0"
                   [class.out-of-stock]="product.stock === 0">
                {{ product.stock > 0 ? 'In Stock (' + product.stock + ')' : 'Out of Stock' }}
              </div>

              <!-- Add to Cart Section -->
              <div class="cart-actions">
                <div class="quantity-selector" *ngIf="product.stock > 0">
                  <button 
                    class="quantity-btn decrease"
                    (click)="decreaseQuantity(product.id)"
                    [disabled]="getSelectedQuantity(product.id) <= 1"
                  >
                    -
                  </button>
                  <span class="quantity-display">{{ getSelectedQuantity(product.id) }}</span>
                  <button 
                    class="quantity-btn increase"
                    (click)="increaseQuantity(product.id)"
                    [disabled]="getSelectedQuantity(product.id) >= product.stock"
                  >
                    +
                  </button>
                </div>
                
                <button 
                  class="add-to-cart-btn"
                  (click)="addToCart(product)"
                  [disabled]="product.stock === 0 || addingToCart === product.id"
                  [class.in-cart]="cartService.isInCart(product.id)"
                >
                  <span *ngIf="addingToCart === product.id">Adding...</span>
                  <span *ngIf="addingToCart !== product.id && !cartService.isInCart(product.id)">
                    Add to Cart
                  </span>
                  <span *ngIf="addingToCart !== product.id && cartService.isInCart(product.id)">
                    ✓ In Cart ({{ cartService.getCartItemQuantity(product.id) }})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div class="success-message" *ngIf="showSuccessMessage" [@fadeInOut]>
          <div class="success-content">
            <span class="success-icon">✅</span>
            <span>{{ successMessage }}</span>
          </div>
        </div>

        <div class="no-products" *ngIf="filteredProducts.length === 0 && !loading">
          <div class="no-products-icon">📦</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>

        <div class="loading" *ngIf="loading">
          <div class="loader"></div>
          <p>Loading products...</p>
        </div>

        <div class="error" *ngIf="error">
          <h3>Error Loading Products</h3>
          <p>{{ error }}</p>
          <button class="retry-btn" (click)="loadProducts()">Retry</button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .products-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .products-header {
      padding: 60px 20px 40px;
      text-align: center;
      color: white;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .main-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 16px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .subtitle {
      font-size: 1.2rem;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .search-and-filter {
      display: flex;
      gap: 20px;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-container {
      position: relative;
    }

    .search-input {
      padding: 12px 45px 12px 16px;
      border: none;
      border-radius: 25px;
      width: 300px;
      font-size: 16px;
      outline: none;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .search-icon {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: #666;
    }

    .category-filter {
      padding: 12px 16px;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      outline: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      background: white;
    }

    .products-main {
      padding: 0 20px 60px;
      position: relative;
    }

    .products-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
    }

    .product-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }

    .product-image-container {
      position: relative;
      height: 200px;
      overflow: hidden;
      cursor: pointer;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
      background: #f3f4f6;
    }

    .product-image-container:hover .product-image {
      transform: scale(1.05);
    }

    .product-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #dc2626;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .product-info {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-category {
      background: #e0e7ff;
      color: #3730a3;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 8px;
      text-transform: uppercase;
      width: fit-content;
    }

    .product-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
      line-height: 1.3;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .product-title:hover {
      color: #667eea;
    }

    .product-description {
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.4;
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
      color: #d1d5db;
      font-size: 16px;
    }

    .star.filled {
      color: #fbbf24;
    }

    .rating-value {
      font-size: 0.9rem;
      color: #6b7280;
      font-weight: 500;
    }

    .product-price {
      margin-bottom: 12px;
    }

    .current-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #059669;
    }

    .product-stock {
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .product-stock.in-stock {
      color: #059669;
    }

    .product-stock.out-of-stock {
      color: #dc2626;
    }

    /* Cart Actions Styles */
    .cart-actions {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #f3f4f6;
      border-radius: 8px;
      padding: 8px;
    }

    .quantity-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: white;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .quantity-btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
      transform: translateY(-1px);
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-display {
      min-width: 40px;
      text-align: center;
      font-weight: 600;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .add-to-cart-btn {
      width: 100%;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }

    .add-to-cart-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .add-to-cart-btn.in-cart {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }

    .add-to-cart-btn.in-cart:hover {
      background: linear-gradient(135deg, #047857 0%, #065f46 100%);
    }

    /* Success Message */
    .success-message {
      position: fixed;
      top: 90px;
      right: 20px;
      background: white;
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }

    .success-content {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1f2937;
      font-weight: 500;
    }

    .success-icon {
      font-size: 1.2rem;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .loading, .error, .no-products {
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

    .no-products-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.7;
    }

    .retry-btn {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 20px;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      .main-title {
        font-size: 2.5rem;
      }

      .search-and-filter {
        flex-direction: column;
        gap: 15px;
      }

      .search-input {
        width: 280px;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }

      .products-container {
        padding: 0 10px;
      }

      .success-message {
        right: 10px;
        left: 10px;
        right: 10px;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  loading: boolean = false;
  error: string = '';
  
  // Cart-related properties
  selectedQuantities: { [productId: number]: number } = {};
  addingToCart: number | null = null;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  
  // Default placeholder image
  private readonly defaultImage = 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image+Available';

  constructor(
    private http: HttpClient,
    private router: Router,
    public cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    
    this.loadProductsFromJson().subscribe(
      (products: Product[]) => {
        this.products = products;
        this.filteredProducts = products;
        this.extractCategories();
        this.initializeQuantities();
        this.loading = false;
      },
      (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
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

  private extractCategories() {
    const categorySet = new Set(this.products.map(product => product.category));
    this.categories = Array.from(categorySet).sort();
  }

  private initializeQuantities() {
    this.products.forEach(product => {
      if (!this.selectedQuantities[product.id]) {
        this.selectedQuantities[product.id] = 1;
      }
    });
  }

  onSearchChange() {
    this.filterProducts();
  }

  onCategoryChange() {
    this.filterProducts();
  }

  private filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || 
        product.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  viewProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  getFilledStars(rating: number): number {
    return Math.floor(rating);
  }

  // Cart-related methods
  getSelectedQuantity(productId: number): number {
    return this.selectedQuantities[productId] || 1;
  }

  increaseQuantity(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product && this.selectedQuantities[productId] < product.stock) {
      this.selectedQuantities[productId]++;
    }
  }

  decreaseQuantity(productId: number) {
    if (this.selectedQuantities[productId] > 1) {
      this.selectedQuantities[productId]--;
    }
  }

  addToCart(product: Product) {
    if (product.stock === 0) return;
    
    this.addingToCart = product.id;
    const quantity = this.selectedQuantities[product.id] || 1;
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      this.cartService.addToCart(product, quantity);
      this.addingToCart = null;
      
      // Show success message
      this.successMessage = `${product.title} added to cart (${quantity})`;
      this.showSuccessMessage = true;
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
      
      console.log(`Added ${quantity} x ${product.title} to cart`);
    }, 500);
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