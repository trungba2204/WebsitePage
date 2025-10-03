package com.ministore.controller;

import com.ministore.entity.Cart;
import com.ministore.entity.CartItem;
import com.ministore.entity.Product;
import com.ministore.repository.CartRepository;
import com.ministore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        // For demo purposes, create a default cart if none exists
        Cart cart = cartRepository.findAll().stream().findFirst().orElse(null);
        
        if (cart == null) {
            // Create a new cart for demo
            cart = new Cart();
            cart.setId(1L);
            cart.setUser(null); // Anonymous cart
            cart = cartRepository.save(cart);
        }
        
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addToCart(@RequestBody AddToCartRequest request) {
        // Get or create cart
        Cart cart = cartRepository.findAll().stream().findFirst().orElse(null);
        if (cart == null) {
            cart = new Cart();
            cart.setId(1L);
            cart.setUser(null); // Anonymous cart
            cart = cartRepository.save(cart);
        }

        // Get product
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product product = productOpt.get();

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<Cart> updateCartItem(@PathVariable Long itemId, @RequestBody UpdateCartItemRequest request) {
        Cart cart = cartRepository.findAll().stream().findFirst().orElse(null);
        if (cart == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst();

        if (itemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CartItem item = itemOpt.get();
        item.setQuantity(request.getQuantity());
        cart = cartRepository.save(cart);
        
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Cart> removeCartItem(@PathVariable Long itemId) {
        Cart cart = cartRepository.findAll().stream().findFirst().orElse(null);
        if (cart == null) {
            return ResponseEntity.notFound().build();
        }

        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cart = cartRepository.save(cart);
        
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        Cart cart = cartRepository.findAll().stream().findFirst().orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
        return ResponseEntity.ok().build();
    }

    // DTOs
    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class UpdateCartItemRequest {
        private Integer quantity;

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
