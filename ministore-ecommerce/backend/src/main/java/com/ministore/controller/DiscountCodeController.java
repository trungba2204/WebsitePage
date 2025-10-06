package com.ministore.controller;

import com.ministore.dto.DiscountCodeValidationRequest;
import com.ministore.dto.DiscountCodeValidationResponse;
import com.ministore.entity.DiscountCode;
import com.ministore.repository.DiscountCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/discount-codes")
@RequiredArgsConstructor
public class DiscountCodeController {

    private final DiscountCodeRepository discountCodeRepository;

    @GetMapping("/active")
    public ResponseEntity<List<DiscountCode>> getActiveDiscountCodes() {
        List<DiscountCode> activeCodes = discountCodeRepository.findActiveDiscountCodes(LocalDateTime.now());
        return ResponseEntity.ok(activeCodes);
    }

    @PostMapping("/validate")
    public ResponseEntity<DiscountCodeValidationResponse> validateDiscountCode(
            @Valid @RequestBody DiscountCodeValidationRequest request) {
        
        DiscountCode discountCode = discountCodeRepository.findAvailableDiscountCode(
                request.getCode(), LocalDateTime.now()).orElse(null);

        if (discountCode == null) {
            return ResponseEntity.ok(new DiscountCodeValidationResponse(
                    false, "Mã giảm giá không hợp lệ hoặc đã hết hạn", BigDecimal.ZERO));
        }

        if (request.getOrderAmount().compareTo(discountCode.getMinOrderAmount()) < 0) {
            return ResponseEntity.ok(new DiscountCodeValidationResponse(
                    false, 
                    String.format("Đơn hàng tối thiểu %s để sử dụng mã này", 
                            formatPrice(discountCode.getMinOrderAmount())), 
                    BigDecimal.ZERO));
        }

        BigDecimal discountAmount = calculateDiscountAmount(discountCode, request.getOrderAmount());
        
        String message = String.format("Áp dụng mã giảm giá %s. Giảm %s", 
                request.getCode(), formatPrice(discountAmount));

        return ResponseEntity.ok(new DiscountCodeValidationResponse(
                true, message, discountAmount));
    }

    private BigDecimal calculateDiscountAmount(DiscountCode discountCode, BigDecimal orderAmount) {
        BigDecimal discountAmount;
        
        if (discountCode.getDiscountType() == DiscountCode.DiscountType.PERCENTAGE) {
            discountAmount = orderAmount.multiply(discountCode.getDiscountValue().divide(new BigDecimal("100")));
            if (discountCode.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = discountAmount.min(discountCode.getMaxDiscountAmount());
            }
        } else {
            discountAmount = discountCode.getDiscountValue();
        }
        
        return discountAmount;
    }

    private String formatPrice(BigDecimal price) {
        return String.format("%,.0f VNĐ", price);
    }
}
