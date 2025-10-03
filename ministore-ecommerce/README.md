# MiniStore - Mini Ecommerce Store

Dự án ecommerce website được xây dựng dựa trên thiết kế Figma MiniStore Template.

## Công nghệ sử dụng

### Frontend
- **Angular 17+** - Framework chính
- **TypeScript** - Ngôn ngữ lập trình
- **Angular Material/Bootstrap** - UI Components
- **RxJS** - Quản lý state và async operations

### Backend
- **Spring Boot 3.x** - Framework backend
- **Java 17+** - Ngôn ngữ lập trình
- **Spring Data JPA** - ORM
- **MySQL/PostgreSQL** - Database
- **Spring Security** - Authentication & Authorization
- **Maven** - Build tool

## Cấu trúc dự án

```
ministore-ecommerce/
├── frontend/          # Angular application
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   └── package.json
│
└── backend/           # Spring Boot application
    ├── src/
    │   ├── main/
    │   └── test/
    └── pom.xml
```

## Cài đặt và chạy

### Frontend (Angular)

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
ng serve
```

4. Mở trình duyệt tại: `http://localhost:4200`

### Backend (Spring Boot)

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies và build:
```bash
mvn clean install
```

3. Chạy application:
```bash
mvn spring-boot:run
```

4. API sẽ chạy tại: `http://localhost:8080`

## Tính năng chính

- 🛍️ Danh sách sản phẩm với phân trang
- 🔍 Tìm kiếm và lọc sản phẩm
- 🛒 Giỏ hàng
- 👤 Đăng nhập / Đăng ký
- 📦 Quản lý đơn hàng
- 💳 Thanh toán
- 📱 Responsive design

## Database Schema

Các bảng chính:
- `users` - Thông tin người dùng
- `products` - Thông tin sản phẩm
- `categories` - Danh mục sản phẩm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `cart` - Giỏ hàng

## API Endpoints

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/products/{id}` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/{id}` - Xóa sản phẩm (Admin)

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/{id}` - Lấy chi tiết danh mục

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm sản phẩm vào giỏ
- `PUT /api/cart/items/{id}` - Cập nhật số lượng
- `DELETE /api/cart/items/{id}` - Xóa sản phẩm khỏi giỏ

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/{id}` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

## Tài liệu tham khảo

- [Angular Documentation](https://angular.io/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Figma Design](https://www.figma.com/design/UrzqlgMhMEOF70pAW8xqJg/MiniStore---Mini-Ecommerce-Store-Website-Template--Community-)

