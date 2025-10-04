package com.ministore.controller;

import com.ministore.entity.Cart;
import com.ministore.entity.CartItem;
import com.ministore.entity.Product;
import com.ministore.entity.User;
import com.ministore.repository.CartRepository;
import com.ministore.repository.ProductRepository;
import com.ministore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        User currentUser = userOpt.get();
        
        // Get or create cart for current user
        Cart cart = cartRepository.findByUserId(currentUser.getId()).orElse(null);
        
        if (cart == null) {
            // Create a new cart for current user
            cart = new Cart();
            cart.setUser(currentUser);
            cart = cartRepository.save(cart);
        }
        
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addToCart(@RequestBody AddToCartRequest request) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        User currentUser = userOpt.get();
        
        // Get or create cart for current user
        Cart cart = cartRepository.findByUserId(currentUser.getId()).orElse(null);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(currentUser);
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
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        User currentUser = userOpt.get();
        
        // Get current user's cart
        Cart cart = cartRepository.findByUserId(currentUser.getId()).orElse(null);
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
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        User currentUser = userOpt.get();
        
        // Get current user's cart
        Cart cart = cartRepository.findByUserId(currentUser.getId()).orElse(null);
        if (cart == null) {
            return ResponseEntity.notFound().build();
        }

        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cart = cartRepository.save(cart);
        
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        User currentUser = userOpt.get();
        
        // Get current user's cart
        Cart cart = cartRepository.findByUserId(currentUser.getId()).orElse(null);
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
