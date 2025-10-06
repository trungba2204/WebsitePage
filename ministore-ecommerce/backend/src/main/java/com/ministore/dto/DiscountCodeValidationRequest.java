package com.ministore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DiscountCodeValidationRequest {

    @NotBlank(message = "Discount code is required")
    private String code;

    @NotNull(message = "Order amount is required")
    @Positive(message = "Order amount must be positive")
    private BigDecimal orderAmount;
}
