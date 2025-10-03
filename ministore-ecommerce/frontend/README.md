# MiniStore Frontend (Angular)

Ứng dụng frontend cho MiniStore e-commerce được xây dựng bằng Angular 17+.

## Yêu cầu hệ thống

- Node.js 18+ và npm
- Angular CLI 17+

## Cài đặt

1. Cài đặt Angular CLI (nếu chưa có):
```bash
npm install -g @angular/cli
```

2. Cài đặt dependencies:
```bash
npm install
```

## Chạy ứng dụng

### Development server
```bash
npm start
# hoặc
ng serve
```

Mở trình duyệt tại `http://localhost:4200/`

### Build production
```bash
npm run build
# hoặc
ng build --configuration production
```

Build output sẽ được lưu trong thư mục `dist/`

## Cấu trúc dự án

```
src/
├── app/
│   ├── components/       # Shared components
│   │   ├── header/
│   │   ├── footer/
│   │   └── product-card/
│   ├── pages/           # Page components
│   │   ├── home/
│   │   ├── products/
│   │   ├── product-detail/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   └── orders/
│   ├── services/        # Services
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── models/          # Data models
│   ├── guards/          # Route guards
│   ├── interceptors/    # HTTP interceptors
│   ├── app.routes.ts
│   └── app.component.ts
├── assets/              # Static files
├── environments/        # Environment configs
└── styles.scss         # Global styles
```

## Tính năng

- ✅ Xem danh sách sản phẩm với phân trang
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Đăng ký / Đăng nhập
- ✅ Quản lý giỏ hàng
- ✅ Đặt hàng
- ✅ Xem lịch sử đơn hàng
- ✅ Responsive design

## API Endpoint

Backend API mặc định chạy tại `http://localhost:8080/api`

Có thể thay đổi trong file `src/environments/environment.ts`

## Công nghệ sử dụng

- **Angular 17+** - Framework
- **TypeScript** - Ngôn ngữ
- **RxJS** - Reactive programming
- **Bootstrap 5** - CSS Framework
- **Bootstrap Icons** - Icons

## Testing

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

## Lưu ý

- Đảm bảo backend đang chạy trước khi start frontend
- Kiểm tra CORS settings nếu gặp lỗi kết nối API

