# 🔧 HƯỚNG DẪN FIX BACKEND CHO MÃ GIẢM GIÁ

## Vấn đề hiện tại
Frontend đã có UI hiển thị mã giảm giá, nhưng backend chưa lưu đúng discount data vào database.

## Giải pháp tạm thời
Tôi đã thêm **mock data** vào frontend để test UI. Bây giờ bạn sẽ thấy mã giảm giá hiển thị trong tất cả đơn hàng có giá > 100,000 VNĐ.

## Giải pháp vĩnh viễn - Fix Backend

### Bước 1: Kiểm tra Database Schema
Chạy SQL sau để kiểm tra xem có columns discount không:

```sql
-- Kiểm tra columns trong bảng orders
DESCRIBE orders;

-- Hoặc
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'orders' 
AND COLUMN_NAME IN ('discount_code', 'discount_amount', 'original_amount');
```

### Bước 2: Thêm columns nếu chưa có
Nếu chưa có columns, chạy SQL sau:

```sql
-- Thêm columns discount vào bảng orders
ALTER TABLE orders 
ADD COLUMN discount_code VARCHAR(255),
ADD COLUMN discount_amount DECIMAL(19,2) DEFAULT 0.00,
ADD COLUMN original_amount DECIMAL(19,2);

-- Update existing orders
UPDATE orders 
SET original_amount = total_amount 
WHERE original_amount IS NULL;
```

### Bước 3: Restart Backend
Sau khi thêm columns, restart backend:
```bash
cd /path/to/backend
mvn spring-boot:run
```

### Bước 4: Test tạo order mới với discount
1. Đăng nhập với tài khoản user
2. Thêm sản phẩm vào giỏ hàng (tổng > 100,000 VNĐ)
3. Vào checkout, nhập mã `WELCOME10`
4. Tạo đơn hàng
5. Kiểm tra console logs xem có discount data không

### Bước 5: Xóa mock data (sau khi fix backend)
Sau khi backend hoạt động đúng, xóa các dòng mock data trong:

1. **orders.component.ts** - Xóa dòng 37-48
2. **order-detail.component.ts** - Xóa dòng 53-58  
3. **profile.component.ts** - Xóa dòng 58-68

## Kiểm tra Backend có hoạt động không

### Test API trực tiếp:
```bash
# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Test discount validation
curl -X POST http://localhost:8080/api/discount-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","orderAmount":200000}'
```

### Kiểm tra logs:
Xem backend logs có lỗi gì không:
- Database connection errors
- SQL syntax errors  
- Authentication errors

## Mã giảm giá test:
- `WELCOME10` - Giảm 10%, tối thiểu 100k, tối đa 50k
- `SAVE50K` - Giảm 50k cố định, tối thiểu 500k
- `SUMMER20` - Giảm 20%, tối thiểu 200k, tối đa 100k

## Sau khi fix xong:
1. Xóa mock data trong frontend
2. Test tạo order mới với discount
3. Kiểm tra UI hiển thị đúng
4. Verify database có lưu discount data
