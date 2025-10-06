package com.ministore.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCodeValidationResponse {

    @JsonProperty("isValid")
    private boolean valid;
    private String message;
    private BigDecimal discountAmount;
}
