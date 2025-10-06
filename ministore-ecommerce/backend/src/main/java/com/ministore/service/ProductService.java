package com.ministore.service;

import com.ministore.entity.Product;
import com.ministore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

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

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
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

