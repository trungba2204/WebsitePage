-- Simple script to delete users with ID 2 and 7
-- Run this directly in your MySQL client or H2 console

-- Check current users
SELECT id, email, firstName, lastName, role, createdAt FROM users WHERE id IN (2, 7);

-- Delete related data first (to avoid foreign key constraints)
DELETE FROM cart WHERE user_id IN (2, 7);
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (2, 7));
DELETE FROM orders WHERE user_id IN (2, 7);

-- Delete the users
DELETE FROM users WHERE id IN (2, 7);

-- Verify deletion
SELECT 'Deletion completed' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT id, email, firstName, lastName, role FROM users ORDER BY id;
