// ... existing code ...
import { Injectable } from '@angular/core';
import type { Product } from '../shared/models';
import {Observable, of} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly PRODUCTS: Product[] = [
    { id: 'p-001', title: 'Wireless Noise-Canceling Headphones', description: 'Over-ear Bluetooth headphones with ANC and 30h battery life.', price: 199.99, imageUrl: 'https://picsum.photos/seed/p001/600/400', tags: ['audio', 'wireless', 'electronics'] },
    { id: 'p-002', title: '4K Ultra HD Monitor 27"', description: 'Crisp 4K resolution with HDR and 99% sRGB coverage.', price: 329.0, imageUrl: 'https://picsum.photos/seed/p002/600/400', tags: ['monitor', 'display', 'electronics'] },
    { id: 'p-003', title: 'Mechanical Keyboard (Blue Switches)', description: 'Tactile typing experience with RGB backlight.', price: 89.99, imageUrl: 'https://picsum.photos/seed/p003/600/400', tags: ['keyboard', 'peripherals'] },
    { id: 'p-004', title: 'Ergonomic Wireless Mouse', description: 'Comfort-first design with adjustable DPI.', price: 39.5, imageUrl: 'https://picsum.photos/seed/p004/600/400', tags: ['mouse', 'peripherals'] },
    { id: 'p-005', title: 'USB-C Hub 8-in-1', description: 'Expand your laptop with HDMI, USB-A, card readers, and more.', price: 49.99, imageUrl: 'https://picsum.photos/seed/p005/600/400', tags: ['usb-c', 'hub'] },
    { id: 'p-006', title: 'Portable SSD 1TB', description: 'High-speed NVMe external SSD for on-the-go storage.', price: 119.99, imageUrl: 'https://picsum.photos/seed/p006/600/400', tags: ['storage', 'ssd'] },
    { id: 'p-007', title: 'Smart LED Light Bulb (4-pack)', description: 'Wi-Fi bulbs with millions of colors and voice control.', price: 34.99, imageUrl: 'https://picsum.photos/seed/p007/600/400', tags: ['smart-home', 'lighting'] },
    { id: 'p-008', title: 'Streaming Webcam 1080p', description: 'Full HD webcam with dual mics and privacy shutter.', price: 54.99, imageUrl: 'https://picsum.photos/seed/p008/600/400', tags: ['webcam', 'video'] },
    { id: 'p-009', title: 'Bluetooth Speaker Mini', description: 'Pocket-sized speaker with surprisingly big sound.', price: 24.99, imageUrl: 'https://picsum.photos/seed/p009/600/400', tags: ['audio', 'portable'] },
    { id: 'p-010', title: 'Action Camera 4K', description: 'Waterproof camera with stabilization and accessories.', price: 149.99, imageUrl: 'https://picsum.photos/seed/p010/600/400', tags: ['camera', 'outdoor'] },
    { id: 'p-011', title: 'Smartwatch Fitness Pro', description: 'Heart rate, GPS, sleep tracking, and 7-day battery.', price: 179.0, imageUrl: 'https://picsum.photos/seed/p011/600/400', tags: ['wearables', 'fitness'] },
    { id: 'p-012', title: 'True Wireless Earbuds', description: 'Comfort fit with ENC and wireless charging case.', price: 59.99, imageUrl: 'https://picsum.photos/seed/p012/600/400', tags: ['audio', 'wireless'] },
    { id: 'p-013', title: 'Laptop Stand Aluminum', description: 'Ergonomic riser for better posture and cooling.', price: 29.99, imageUrl: 'https://picsum.photos/seed/p013/600/400', tags: ['stand', 'accessories'] },
    { id: 'p-014', title: '1080p Projector', description: 'Bright, compact projector for home cinema nights.', price: 209.99, imageUrl: 'https://picsum.photos/seed/p014/600/400', tags: ['projector', 'home-theater'] },
    { id: 'p-015', title: 'Noise-Isolating Gaming Headset', description: 'Immersive sound with detachable mic.', price: 69.0, imageUrl: 'https://picsum.photos/seed/p015/600/400', tags: ['gaming', 'audio'] },
    { id: 'p-016', title: 'Portable Power Bank 20,000mAh', description: 'Fast charging with USB-C PD and dual outputs.', price: 39.99, imageUrl: 'https://picsum.photos/seed/p016/600/400', tags: ['power', 'mobile'] },
    { id: 'p-017', title: 'Smart Plug (2-pack)', description: 'Voice-controlled plugs with energy monitoring.', price: 22.99, imageUrl: 'https://picsum.photos/seed/p017/600/400', tags: ['smart-home'] },
    { id: 'p-018', title: 'Graphics Drawing Tablet', description: 'Battery-free stylus and customizable keys.', price: 79.99, imageUrl: 'https://picsum.photos/seed/p018/600/400', tags: ['creative', 'tablet'] },
    { id: 'p-019', title: 'Desk Microphone USB', description: 'Crystal-clear audio for meetings and streams.', price: 49.5, imageUrl: 'https://picsum.photos/seed/p019/600/400', tags: ['audio', 'microphone'] },
    { id: 'p-020', title: 'Wireless Charging Stand', description: 'Charges phone and earbuds simultaneously.', price: 27.99, imageUrl: 'https://picsum.photos/seed/p020/600/400', tags: ['charging', 'accessories'] },
    { id: 'p-021', title: 'Home Mesh Wi-Fi (2-pack)', description: 'Whole-home coverage with seamless roaming.', price: 149.0, imageUrl: 'https://picsum.photos/seed/p021/600/400', tags: ['networking', 'wifi'] },
    { id: 'p-022', title: 'Smart Doorbell Camera', description: '2K video, motion alerts, and two-way audio.', price: 129.99, imageUrl: 'https://picsum.photos/seed/p022/600/400', tags: ['security', 'smart-home'] },
    { id: 'p-023', title: 'LED Desk Lamp with Wireless Charger', description: 'Adjustable color temp and brightness.', price: 36.0, imageUrl: 'https://picsum.photos/seed/p023/600/400', tags: ['lighting', 'desk'] },
    { id: 'p-024', title: 'Compact Drone with 2.7K Camera', description: 'Beginner-friendly with auto hover.', price: 239.99, imageUrl: 'https://picsum.photos/seed/p024/600/400', tags: ['drone', 'camera'] },
    { id: 'p-025', title: 'Smart Thermostat', description: 'Save energy with schedules and app control.', price: 169.99, imageUrl: 'https://picsum.photos/seed/p025/600/400', tags: ['climate', 'smart-home'] },
    { id: 'p-026', title: 'Electric Toothbrush', description: 'Sonic cleaning with 4 modes and timer.', price: 34.5, imageUrl: 'https://picsum.photos/seed/p026/600/400', tags: ['health', 'personal-care'] },
    { id: 'p-027', title: 'Kitchen Air Fryer 5Qt', description: 'Crispy results with less oil.', price: 89.0, imageUrl: 'https://picsum.photos/seed/p027/600/400', tags: ['kitchen', 'appliances'] },
    { id: 'p-028', title: 'Stainless Steel Water Bottle 1L', description: 'Insulated bottle keeps drinks cold for 24h.', price: 21.99, imageUrl: 'https://picsum.photos/seed/p028/600/400', tags: ['outdoor', 'hydration'] },
    { id: 'p-029', title: 'Robot Vacuum Cleaner', description: 'Smart mapping and auto-recharge.', price: 259.99, imageUrl: 'https://picsum.photos/seed/p029/600/400', tags: ['home', 'cleaning'] },
    { id: 'p-030', title: 'Portable Camping Lantern', description: 'Rechargeable with SOS mode.', price: 18.99, imageUrl: 'https://picsum.photos/seed/p030/600/400', tags: ['outdoor', 'lighting'] },
    { id: 'p-031', title: 'Adjustable Dumbbell Set', description: 'Space-saving weights for home workouts.', price: 129.0, imageUrl: 'https://picsum.photos/seed/p031/600/400', tags: ['fitness', 'home-gym'] },
    { id: 'p-032', title: 'Yoga Mat Non-Slip', description: 'Cushioned support with carrying strap.', price: 24.0, imageUrl: 'https://picsum.photos/seed/p032/600/400', tags: ['fitness', 'yoga'] },
    { id: 'p-033', title: 'Messenger Laptop Bag 15.6"', description: 'Water-resistant with padded compartments.', price: 42.99, imageUrl: 'https://picsum.photos/seed/p033/600/400', tags: ['bags', 'travel'] },
    { id: 'p-034', title: 'Noise-Canceling Ear Muffs', description: 'Reduce ambient noise for focus.', price: 16.99, imageUrl: 'https://picsum.photos/seed/p034/600/400', tags: ['safety', 'work'] },
    { id: 'p-035', title: 'Standing Desk Converter', description: 'Switch from sitting to standing in seconds.', price: 119.5, imageUrl: 'https://picsum.photos/seed/p035/600/400', tags: ['office', 'ergonomics'] },
    { id: 'p-036', title: 'Cable Management Kit', description: 'Keep your workspace tidy.', price: 14.99, imageUrl: 'https://picsum.photos/seed/p036/600/400', tags: ['organization', 'accessories'] },
    { id: 'p-037', title: 'USB-C to HDMI Cable 4K', description: 'Direct connect laptop to 4K displays.', price: 12.99, imageUrl: 'https://picsum.photos/seed/p037/600/400', tags: ['cables', 'video'] },
    { id: 'p-038', title: 'NVMe SSD 2TB (Internal)', description: 'PCIe Gen4 blazing speeds.', price: 189.99, imageUrl: 'https://picsum.photos/seed/p038/600/400', tags: ['storage', 'ssd'] },
    { id: 'p-039', title: 'Compact Photo Printer', description: 'Instant prints from phone via Wi-Fi.', price: 99.99, imageUrl: 'https://picsum.photos/seed/p039/600/400', tags: ['printer', 'photo'] },
    { id: 'p-040', title: 'Smart Garden Kit', description: 'Grow herbs indoors with automated lighting.', price: 79.0, imageUrl: 'https://picsum.photos/seed/p040/600/400', tags: ['garden', 'smart-home'] },
  ];


  // Stream API used by the product list
  getProducts(): Observable<Product[]> {
    // Return a copy to avoid accidental external mutation
    return of([...this.PRODUCTS]);
  }

  all(): Product[] {
    return [...this.PRODUCTS];
  }

  page(page: number, pageSize: number): Product[] {
    const p = Math.max(1, Math.floor(page || 1));
    const size = Math.max(1, Math.floor(pageSize || 10));
    const start = (p - 1) * size;
    return this.PRODUCTS.slice(start, start + size);
  }

  count(): number {
    return this.PRODUCTS.length;
  }

  findById(id: string): Product | undefined {
    return this.PRODUCTS.find(p => p.id === id);
  }
}
