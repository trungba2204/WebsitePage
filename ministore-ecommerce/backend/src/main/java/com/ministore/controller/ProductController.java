package com.ministore.controller;

import com.ministore.entity.Product;
import com.ministore.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(productService.getProducts(categoryId, minPrice, maxPrice, minRating, inStockOnly, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<Product>> getNewArrivals(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getNewArrivals(limit));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getFeaturedProducts(limit));
    }

    @GetMapping("/counts/category/{categoryId}")
    public ResponseEntity<Long> getProductCountByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductCountByCategory(categoryId));
    }

    @GetMapping("/counts/categories")
    public ResponseEntity<Map<Long, Long>> getProductCountsByCategory() {
        return ResponseEntity.ok(productService.getProductCountsByCategory());
    }
}

