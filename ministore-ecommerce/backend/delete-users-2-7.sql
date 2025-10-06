-- Delete users with id 2 and 7 from the database
-- WARNING: This will permanently delete these users and all related data

-- First, check what users exist with these IDs
SELECT id, email, firstName, lastName, role, createdAt FROM users WHERE id IN (2, 7);

-- Delete related data first (foreign key constraints)
-- Delete cart items for these users
DELETE FROM cart WHERE user_id IN (2, 7);

-- Delete orders for these users
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (2, 7));
DELETE FROM orders WHERE user_id IN (2, 7);

-- Delete the users themselves
DELETE FROM users WHERE id IN (2, 7);

-- Verify deletion
SELECT 'Users deleted successfully' as status;
SELECT COUNT(*) as remaining_users FROM users;
SELECT id, email, firstName, lastName, role FROM users ORDER BY id;
