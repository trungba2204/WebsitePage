package com.ministore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "discount_codes")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue;

    @Column(nullable = false)
    private BigDecimal minOrderAmount;

    @Column(nullable = false)
    private BigDecimal maxDiscountAmount;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private Integer usageLimit = 0; // 0 = unlimited

    @Column(nullable = false)
    private Integer usedCount = 0;

    @Column(nullable = false)
    private Boolean isActive = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum DiscountType {
        PERCENTAGE, FIXED_AMOUNT
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(endDate);
    }

    public boolean isNotStarted() {
        return LocalDateTime.now().isBefore(startDate);
    }

    public boolean isUsageLimitReached() {
        return usageLimit > 0 && usedCount >= usageLimit;
    }

    public boolean isValid() {
        return isActive && !isExpired() && !isNotStarted() && !isUsageLimitReached();
    }
}
