package com.ministore.controller;

import com.ministore.dto.CreateDiscountCodeRequest;
import com.ministore.dto.UpdateDiscountCodeRequest;
import com.ministore.entity.DiscountCode;
import com.ministore.repository.DiscountCodeRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/discount-codes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDiscountCodeController {

    private final DiscountCodeRepository discountCodeRepository;

    @GetMapping
    public ResponseEntity<List<DiscountCode>> getAllDiscountCodes() {
        List<DiscountCode> codes = discountCodeRepository.findAll();
        return ResponseEntity.ok(codes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountCode> getDiscountCodeById(@PathVariable Long id) {
        Optional<DiscountCode> code = discountCodeRepository.findById(id);
        return code.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DiscountCode> createDiscountCode(@Valid @RequestBody CreateDiscountCodeRequest request) {
        // Check if code already exists
        if (discountCodeRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode(request.getCode());
        discountCode.setDiscountType(DiscountCode.DiscountType.valueOf(request.getDiscountType()));
        discountCode.setDiscountValue(request.getDiscountValue());
        discountCode.setMinOrderAmount(request.getMinOrderAmount());
        discountCode.setMaxDiscountAmount(request.getMaxDiscountAmount());
        discountCode.setStartDate(request.getStartDateTime());
        discountCode.setEndDate(request.getEndDateTime());
        discountCode.setUsageLimit(request.getUsageLimit());
        discountCode.setUsedCount(0);
        discountCode.setIsActive(request.getIsActive());

        DiscountCode savedCode = discountCodeRepository.save(discountCode);
        return ResponseEntity.ok(savedCode);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountCode> updateDiscountCode(@PathVariable Long id, 
                                                          @Valid @RequestBody UpdateDiscountCodeRequest request) {
        Optional<DiscountCode> existingCode = discountCodeRepository.findById(id);
        if (existingCode.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DiscountCode code = existingCode.get();
        code.setCode(request.getCode());
        code.setDiscountType(DiscountCode.DiscountType.valueOf(request.getDiscountType()));
        code.setDiscountValue(request.getDiscountValue());
        code.setMinOrderAmount(request.getMinOrderAmount());
        code.setMaxDiscountAmount(request.getMaxDiscountAmount());
        code.setStartDate(request.getStartDateTime());
        code.setEndDate(request.getEndDateTime());
        code.setUsageLimit(request.getUsageLimit());
        code.setIsActive(request.getIsActive());

        DiscountCode updatedCode = discountCodeRepository.save(code);
        return ResponseEntity.ok(updatedCode);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscountCode(@PathVariable Long id) {
        if (!discountCodeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        discountCodeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}