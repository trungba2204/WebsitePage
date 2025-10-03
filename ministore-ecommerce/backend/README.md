# MiniStore Backend (Spring Boot)

Backend API cho MiniStore e-commerce được xây dựng bằng Spring Boot 3.x.

## Yêu cầu hệ thống

- Java 17+
- Maven 3.6+
- MySQL 8+ (optional, mặc định dùng H2 in-memory database)

## Cài đặt và chạy

### Sử dụng Maven

1. Build project:
```bash
mvn clean install
```

2. Chạy ứng dụng:
```bash
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại `http://localhost:8080`

### Sử dụng JAR file

```bash
mvn clean package
java -jar target/ministore-backend-1.0.0.jar
```

## Cấu hình Database

### H2 Database (Mặc định - Development)

H2 Console: `http://localhost:8080/h2-console`
- URL: `jdbc:h2:mem:ministore`
- Username: `sa`
- Password: (để trống)

### MySQL (Production)

Uncomment các dòng MySQL trong `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ministore
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

Tạo database:
```sql
CREATE DATABASE ministore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập

### Products
- `GET /api/products` - Lấy danh sách sản phẩm (có phân trang, filter)
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm
- `GET /api/products/featured` - Sản phẩm nổi bật
- `GET /api/products/new-arrivals` - Sản phẩm mới

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/{id}` - Lấy chi tiết danh mục

### Cart (Requires Authentication)
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm sản phẩm vào giỏ
- `PUT /api/cart/items/{id}` - Cập nhật số lượng
- `DELETE /api/cart/items/{id}` - Xóa sản phẩm

### Orders (Requires Authentication)
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/{id}` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới

## Dữ liệu mẫu

Khi chạy lần đầu, hệ thống sẽ tự động tạo:
- 4 danh mục sản phẩm
- 10 sản phẩm mẫu
- 2 tài khoản test:
  - Admin: `admin@ministore.com` / `admin123`
  - User: `user@test.com` / `user123`

## Security

- JWT Token-based authentication
- Token expiration: 24 giờ
- Password encryption: BCrypt
- CORS enabled cho `http://localhost:4200`

## Cấu trúc project

```
src/main/java/com/ministore/
├── config/           # Configuration classes
├── controller/       # REST Controllers
├── dto/             # Data Transfer Objects
├── entity/          # JPA Entities
├── repository/      # JPA Repositories
├── security/        # Security & JWT
├── service/         # Business Logic
└── MiniStoreApplication.java
```

## Testing

```bash
mvn test
```

## Build Production

```bash
mvn clean package -DskipTests
```

JAR file sẽ được tạo trong thư mục `target/`

## Logging

Logs được cấu hình trong `application.properties`:
- Application logs: DEBUG level
- Spring Security logs: DEBUG level

## Lưu ý

- JWT secret key nên được thay đổi trong production
- Nên sử dụng MySQL cho production thay vì H2
- Cấu hình CORS cho phù hợp với domain production
- Thêm validation và error handling cho các endpoint

