package com.ministore.service;

import com.ministore.dto.FavoriteDTO;
import com.ministore.entity.Favorite;
import com.ministore.entity.Product;
import com.ministore.entity.User;
import com.ministore.repository.FavoriteRepository;
import com.ministore.repository.ProductRepository;
import com.ministore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<FavoriteDTO> getUserFavorites(Long userId) {
        log.info("Getting favorites for user: {}", userId);
        
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        log.info("Found {} favorites for user: {}", favorites.size(), userId);
        
        return favorites.stream()
                .map(FavoriteDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public FavoriteDTO addToFavorites(Long userId, Long productId) {
        log.info("Adding product {} to favorites for user: {}", productId, userId);
        
        // Check if already in favorites
        Optional<Favorite> existingFavorite = favoriteRepository.findByUserIdAndProductId(userId, productId);
        if (existingFavorite.isPresent()) {
            log.warn("Product {} already in favorites for user: {}", productId, userId);
            return FavoriteDTO.fromEntity(existingFavorite.get());
        }
        
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Verify product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        // Create new favorite
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setProduct(product);
        
        Favorite savedFavorite = favoriteRepository.save(favorite);
        log.info("Successfully added product {} to favorites for user: {}", productId, userId);
        
        return FavoriteDTO.fromEntity(savedFavorite);
    }

    public void removeFromFavorites(Long userId, Long productId) {
        log.info("Removing product {} from favorites for user: {}", productId, userId);
        
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
        log.info("Successfully removed product {} from favorites for user: {}", productId, userId);
    }

    public boolean isFavorite(Long userId, Long productId) {
        return favoriteRepository.existsByUserIdAndProductId(userId, productId);
    }

    public long getFavoriteCount(Long userId) {
        return favoriteRepository.countByUserId(userId);
    }
}
