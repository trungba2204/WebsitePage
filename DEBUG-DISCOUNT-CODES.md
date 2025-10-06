# 🔍 HƯỚNG DẪN DEBUG MÃ GIẢM GIÁ

## Vấn đề: Mã giảm giá không hiển thị sau khi áp dụng

### Bước 1: Kiểm tra Console Logs
1. Mở **Developer Tools** (F12)
2. Vào tab **Console**
3. Thực hiện các bước sau:
   - Áp dụng mã giảm giá trong checkout
   - Tạo đơn hàng
   - Xem danh sách đơn hàng
   - Xem chi tiết đơn hàng

### Bước 2: Tìm các log messages
Tìm các messages sau trong console:
- `🔍 Order created successfully:` - Khi tạo đơn hàng
- `🔍 Orders received:` - Khi load danh sách đơn hàng  
- `🔍 Order detail received:` - Khi xem chi tiết đơn hàng
- `Discount info:` - Thông tin về mã giảm giá

### Bước 3: Kiểm tra dữ liệu
Trong console, kiểm tra xem:
```javascript
// Khi tạo đơn hàng
{
  discountCode: "WELCOME10",      // Có giá trị?
  discountAmount: 20000,          // Có giá trị?
  originalAmount: 200000,         // Có giá trị?
  totalAmount: 180000,            // Đã trừ discount?
  hasDiscount: true               // true hay false?
}
```

### Bước 4: Sử dụng Debug Tool
1. Mở file `debug-orders.html` trong browser
2. Click các nút theo thứ tự:
   - **Test Login** - Đăng nhập
   - **Test Orders** - Xem đơn hàng hiện có
   - **Test Discount** - Test mã giảm giá
   - **Create Order** - Tạo đơn hàng mới với discount

### Bước 5: Các trường hợp có thể xảy ra

#### ✅ Trường hợp 1: Frontend nhận đúng data
```
Discount info: {
  discountCode: "WELCOME10",
  discountAmount: 20000,
  originalAmount: 200000,
  totalAmount: 180000,
  hasDiscount: true
}
```
**→ UI sẽ hiển thị mã giảm giá**

#### ❌ Trường hợp 2: Frontend không nhận được discount data
```
Discount info: {
  discountCode: null,
  discountAmount: null,
  originalAmount: null,
  totalAmount: 200000,
  hasDiscount: false
}
```
**→ Vấn đề ở backend hoặc database**

#### ❌ Trường hợp 3: Backend error
```
Error loading orders: 403 Forbidden
```
**→ Vấn đề authentication hoặc backend**

### Bước 6: Giải pháp

#### Nếu có discount data nhưng UI không hiển thị:
- Kiểm tra template HTML có đúng syntax không
- Kiểm tra CSS có ẩn elements không

#### Nếu không có discount data:
- **Database chưa có columns**: Cần thêm columns `discount_code`, `discount_amount`, `original_amount`
- **Backend chưa lưu**: Kiểm tra OrderController có lưu đúng không
- **Authentication issue**: Kiểm tra token có hợp lệ không

### Bước 7: Test với mã giảm giá mới
1. Đăng nhập với tài khoản user
2. Thêm sản phẩm vào giỏ hàng
3. Vào checkout, nhập mã `WELCOME10`
4. Tạo đơn hàng
5. Kiểm tra console logs
6. Vào trang đơn hàng xem có hiển thị discount không

### Mã giảm giá test:
- `WELCOME10` - Giảm 10%, tối thiểu 100k, tối đa 50k
- `SAVE50K` - Giảm 50k cố định, tối thiểu 500k
- `SUMMER20` - Giảm 20%, tối thiểu 200k, tối đa 100k
