import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Product {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
}
