-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_favorites_user_id (user_id),
    INDEX idx_favorites_product_id (product_id),
    UNIQUE KEY unique_user_product (user_id, product_id)
);
