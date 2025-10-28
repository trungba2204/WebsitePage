-- Script để reset password cho user trong MySQL database
-- Chạy lệnh này trong MySQL console

-- Tìm user hiện tại
SELECT id, email, password, firstName, lastName, role FROM users WHERE email = 'admin@ministore.com';

-- Reset password về "admin123" (password đã được BCrypt hash)
-- Lưu ý: password hash này được tạo từ "admin123" qua BCrypt
-- Để reset, bạn cần chạy lại ứng dụng hoặc tạo hash mới

-- Xóa user cũ nếu cần
-- DELETE FROM users WHERE email = 'admin@ministore.com';

-- Tạo admin user mới (nếu chưa có)
INSERT INTO users (email, password, first_name, last_name, phone, role, active, created_at)
VALUES (
    'admin@ministore.com',
    '$2a$10$YourBCryptHashHere', -- Thay bằng hash thực tế
    'Admin',
    'User',
    '0123456789',
    'ADMIN',
    true,
    NOW()
)
ON DUPLICATE KEY UPDATE email=email;

