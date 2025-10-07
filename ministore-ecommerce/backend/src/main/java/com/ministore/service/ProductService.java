package com.ministore.service;

import com.ministore.entity.Product;
import com.ministore.repository.ProductRepository;
import com.ministore.repository.FavoriteRepository;
import com.ministore.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final FavoriteRepository favoriteRepository;
    private final OrderItemRepository orderItemRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    public Page<Product> getProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, 
                                     Double minRating, Boolean inStockOnly, String search, Pageable pageable) {
        return productRepository.findByFilters(categoryId, minPrice, maxPrice, minRating, inStockOnly, search, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> getNewArrivals(int limit) {
        return productRepository.findTop8ByOrderByCreatedAtDesc();
    }

    public List<Product> getFeaturedProducts(int limit) {
        return productRepository.findTop8ByRatingGreaterThanOrderByRatingDesc(4.0);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product product) {
        Product existingProduct = getProductById(id);
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setImageUrl(product.getImageUrl());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setStock(product.getStock());
        return productRepository.save(existingProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product with ID: {}", id);
        
        try {
            // Delete related records first using repository methods
            log.info("Deleting favorites for product ID: {}", id);
            favoriteRepository.deleteByProductId(id);
            
            log.info("Deleting order items for product ID: {}", id);
            orderItemRepository.deleteByProductId(id);
            
            // Then delete the product
            log.info("Deleting product ID: {}", id);
            productRepository.deleteById(id);
            
            log.info("Product deleted successfully: {}", id);
            
        } catch (Exception e) {
            log.error("Error deleting product {}: {}", id, e.getMessage());
            throw e;
        }
    }

    public Long getProductCountByCategory(Long categoryId) {
        return productRepository.countByCategoryId(categoryId);
    }

    public Map<Long, Long> getProductCountsByCategory() {
        List<Object[]> results = productRepository.getProductCountsByCategory();
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] result : results) {
            Long categoryId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            counts.put(categoryId, count);
        }
        return counts;
    }
}

