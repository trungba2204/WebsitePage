package com.ministore.dto;

import com.ministore.entity.Favorite;
import com.ministore.entity.Product;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDTO {
    private Long id;
    private Long userId;
    private Long productId;
    private Product product;
    private LocalDateTime createdAt;

    public static FavoriteDTO fromEntity(Favorite favorite) {
        FavoriteDTO dto = new FavoriteDTO();
        dto.setId(favorite.getId());
        dto.setUserId(favorite.getUserId());
        dto.setProductId(favorite.getProduct() != null ? favorite.getProduct().getId() : null);
        dto.setProduct(favorite.getProduct());
        dto.setCreatedAt(favorite.getCreatedAt());
        return dto;
    }
}