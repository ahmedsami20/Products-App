// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  
  // Observable for components to subscribe to
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    // Load cart from memory or initialize empty
    this.loadCart();
  }

  private loadCart(): void {
    // Since we can't use localStorage in Claude artifacts,
    // we'll just initialize with an empty cart
    this.cartItems = [];
    this.cartItemsSubject.next(this.cartItems);
  }

  private saveCart(): void {
    // In a real app, you would save to localStorage here
    // For now, we'll just update the subject
    console.log('CartService: Saving cart with', this.cartItems.length, 'items');
    this.cartItemsSubject.next([...this.cartItems]);
  }

  addToCart(product: Product, quantity: number = 1): void {
    console.log('CartService: Adding to cart', product.title, 'quantity:', quantity);
    
    const existingItem = this.cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      console.log('CartService: Updated existing item quantity to', existingItem.quantity);
    } else {
      this.cartItems.push({ product, quantity });
      console.log('CartService: Added new item to cart');
    }
    
    console.log('CartService: Total cart items now:', this.cartItems.length);
    this.saveCart();
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.saveCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  isInCart(productId: number): boolean {
    return this.cartItems.some(item => item.product.id === productId);
  }

  getCartItemQuantity(productId: number): number {
    const item = this.cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}