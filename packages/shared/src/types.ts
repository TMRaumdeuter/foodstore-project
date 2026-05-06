// ============ USER ============
export type UserRole = 'admin' | 'staff' | 'customer';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  loyaltyPoints: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ CATEGORY ============
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

// ============ PRODUCT ============
export interface IProductOptionChoice {
  label: string;
  extraPrice: number;
}

export interface IProductOption {
  name: string;
  choices: IProductOptionChoice[];
}

export interface IProduct {
  _id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  options: IProductOption[];
  isAvailable: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

// ============ ORDER ============
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'qr_transfer';
export type PaymentStatus = 'unpaid' | 'paid';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: { name: string; choice: string; extraPrice: number }[];
}

export interface IOrder {
  _id: string;
  userId: string;
  orderCode: string;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  pointsUsed: number;
  pointsDiscount: number;
  totalPrice: number;
  voucherCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ VOUCHER ============
export type DiscountType = 'percent' | 'fixed';

export interface IVoucher {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

// ============ PAYMENT QR ============
export interface IPaymentQR {
  _id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  qrImage: string;
  isActive: boolean;
}

// ============ REVIEW ============
export interface IReview {
  _id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  userName?: string;
  createdAt: string;
}

// ============ INVOICE ============
export interface IInvoice {
  _id: string;
  orderId: string;
  pdfPath: string;
  generatedAt: string;
}
