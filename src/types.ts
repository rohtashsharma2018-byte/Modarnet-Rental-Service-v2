export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  phone: string;
  address: string;
  createdAt: any;
}

export interface Laptop {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  price?: number;
  offerPricePerItem?: number;
  stock: number;
  imageUrl: string;
  createdAt: any;
  updatedAt: any;
}

export interface PurchaseRequest {
  id?: string;
  userId: string;
  laptopId: string;
  laptopName: string;
  quantity: number;
  offerPrice: number;
  totalCost: number;
  deliveryDate: any;
  comments: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: any;
  updatedAt: any;
}

export type RentalStatus = "pending" | "approved" | "rejected" | "active" | "completed" | "overdue";

export interface RentalRequest {
  id: string;
  userId: string;
  laptopId: string;
  laptopName: string;
  quantity: number;
  pickupDate: any; // timestamps
  returnDate: any;
  duration: number; // days
  purpose: string;
  status: RentalStatus;
  totalCost: number;
  createdAt: any;
  updatedAt: any;
}
