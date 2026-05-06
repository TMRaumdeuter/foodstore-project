export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  delivering: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const LOYALTY_POINTS_PER_VND = 10000; // 10,000 VND = 1 điểm
export const VND_PER_LOYALTY_POINT = 1000;   // 1 điểm = 1,000 VND giảm giá

export const POLLING_INTERVAL_MS = 5000; // 5 seconds

export const PAYMENT_METHODS = {
  cod: 'Thanh toán khi nhận hàng',
  qr_transfer: 'Chuyển khoản QR',
} as const;
