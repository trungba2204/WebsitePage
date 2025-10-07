-- Update foreign key constraints to allow cascade delete

-- Drop existing foreign key constraints
ALTER TABLE order_items DROP FOREIGN KEY FKocimc7dtr037rh4ls4l95nlfi;
ALTER TABLE favorites DROP FOREIGN KEY favorites_ibfk_2;

-- Add new foreign key constraints with CASCADE DELETE
ALTER TABLE order_items 
ADD CONSTRAINT FKocimc7dtr037rh4ls4l95nlfi 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE favorites 
ADD CONSTRAINT favorites_ibfk_2 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
