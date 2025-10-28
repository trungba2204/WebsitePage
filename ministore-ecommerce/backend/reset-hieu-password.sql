-- Script để reset password cho user hieu@gmail.com
-- Chạy lệnh này trong MySQL console

-- Hiển thị thông tin user hiện tại
SELECT id, email, password, firstName, lastName, role, active 
FROM users 
WHERE email = 'hieu@gmail.com';

-- Option 1: Reset password về "hieu123" (password mới)
-- Password sẽ được BCrypt hash tự động khi user đăng ký hoặc login lần đầu
-- Bạn cần chạy ứng dụng Spring Boot để tự động hash password mới

-- Option 2: Xóa user và tạo lại (nếu cần)
-- DELETE FROM users WHERE email = 'hieu@gmail.com';

-- Option 3: Chỉnh trạng thái active
-- UPDATE users SET active = true WHERE email = 'hieu@gmail.com';

-- Option 4: Tạo BCrypt hash cho password "hieu123" và update trực tiếp
-- UPDATE users 
-- SET password = '$2a$10$hash_here' 
-- WHERE email = 'hieu@gmail.com';

-- Để tạo BCrypt hash, bạn có thể sử dụng online tool hoặc Spring Boot để generate

