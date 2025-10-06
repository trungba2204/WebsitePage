export interface DiscountCode {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCodeValidation {
  isValid: boolean;
  discountAmount: number;
  message: string;
}

export interface ApplyDiscountRequest {
  code: string;
  orderAmount: number;
}

export interface CreateDiscountCodeRequest {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
}
