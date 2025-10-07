package com.ministore.controller;

import com.ministore.dto.FavoriteDTO;
import com.ministore.entity.User;
import com.ministore.repository.UserRepository;
import com.ministore.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<FavoriteDTO>> getUserFavorites(Authentication authentication) {
        try {
            log.info("Getting favorites for user: {}", authentication.getName());
            
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<FavoriteDTO> favorites = favoriteService.getUserFavorites(user.getId());
            log.info("Found {} favorites for user: {}", favorites.size(), authentication.getName());
            
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            log.error("Error getting favorites for user: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<FavoriteDTO> addToFavorites(
            @RequestBody Map<String, Long> request,
            Authentication authentication) {
        try {
            Long productId = request.get("productId");
            log.info("Adding product {} to favorites for user: {}", productId, authentication.getName());
            
            if (productId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            FavoriteDTO favorite = favoriteService.addToFavorites(user.getId(), productId);
            log.info("Successfully added product {} to favorites for user: {}", productId, authentication.getName());
            
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            log.error("Error adding to favorites for user: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> removeFromFavorites(
            @PathVariable Long productId,
            Authentication authentication) {
        try {
            log.info("Removing product {} from favorites for user: {}", productId, authentication.getName());
            
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            favoriteService.removeFromFavorites(user.getId(), productId);
            log.info("Successfully removed product {} from favorites for user: {}", productId, authentication.getName());
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error removing from favorites for user: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/check/{productId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Boolean> isFavorite(
            @PathVariable Long productId,
            Authentication authentication) {
        try {
            log.info("Checking if product {} is favorite for user: {}", productId, authentication.getName());
            
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean isFavorite = favoriteService.isFavorite(user.getId(), productId);
            log.info("Product {} is favorite for user {}: {}", productId, authentication.getName(), isFavorite);
            
            return ResponseEntity.ok(isFavorite);
        } catch (Exception e) {
            log.error("Error checking favorite status for user: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Long>> getFavoriteCount(Authentication authentication) {
        try {
            log.info("Getting favorite count for user: {}", authentication.getName());
            
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            long count = favoriteService.getFavoriteCount(user.getId());
            log.info("Favorite count for user {}: {}", authentication.getName(), count);
            
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting favorite count for user: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
