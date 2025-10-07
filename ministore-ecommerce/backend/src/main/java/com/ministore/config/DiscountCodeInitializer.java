package com.ministore.config;

import com.ministore.entity.DiscountCode;
import com.ministore.repository.DiscountCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DiscountCodeInitializer implements CommandLineRunner {

    private final DiscountCodeRepository discountCodeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Always recreate discount codes to ensure we have the latest configuration
        discountCodeRepository.deleteAll();
        createSampleDiscountCodes();
    }

    private void createSampleDiscountCodes() {
        // Discount code 1: 10% off, min order 100k
        DiscountCode code1 = new DiscountCode();
        code1.setCode("WELCOME10");
        code1.setDiscountType(DiscountCode.DiscountType.PERCENTAGE);
        code1.setDiscountValue(new BigDecimal("10"));
        code1.setMinOrderAmount(new BigDecimal("100000"));
        code1.setMaxDiscountAmount(new BigDecimal("50000"));
        code1.setStartDate(LocalDateTime.now());
        code1.setEndDate(LocalDateTime.now().plusMonths(1));
        code1.setUsageLimit(100);
        code1.setUsedCount(0);
        code1.setIsActive(true);
        discountCodeRepository.save(code1);

        // Discount code 2: 50k off, min order 500k
        DiscountCode code2 = new DiscountCode();
        code2.setCode("SAVE50K");
        code2.setDiscountType(DiscountCode.DiscountType.FIXED_AMOUNT);
        code2.setDiscountValue(new BigDecimal("50000"));
        code2.setMinOrderAmount(new BigDecimal("500000"));
        code2.setMaxDiscountAmount(new BigDecimal("50000"));
        code2.setStartDate(LocalDateTime.now());
        code2.setEndDate(LocalDateTime.now().plusMonths(2));
        code2.setUsageLimit(50);
        code2.setUsedCount(0);
        code2.setIsActive(true);
        discountCodeRepository.save(code2);

        // Discount code 3: 20% off, min order 200k, no max limit
        DiscountCode code3 = new DiscountCode();
        code3.setCode("SUMMER20");
        code3.setDiscountType(DiscountCode.DiscountType.PERCENTAGE);
        code3.setDiscountValue(new BigDecimal("20"));
        code3.setMinOrderAmount(new BigDecimal("200000"));
        code3.setMaxDiscountAmount(new BigDecimal("0")); // No max limit
        code3.setStartDate(LocalDateTime.now());
        code3.setEndDate(LocalDateTime.now().plusWeeks(2));
        code3.setUsageLimit(0); // Unlimited
        code3.setUsedCount(0);
        code3.setIsActive(true);
        discountCodeRepository.save(code3);

        // Discount code 4: 30k off, min order 300k
        DiscountCode code4 = new DiscountCode();
        code4.setCode("SAVE30K");
        code4.setDiscountType(DiscountCode.DiscountType.FIXED_AMOUNT);
        code4.setDiscountValue(new BigDecimal("30000"));
        code4.setMinOrderAmount(new BigDecimal("300000"));
        code4.setMaxDiscountAmount(new BigDecimal("30000"));
        code4.setStartDate(LocalDateTime.now());
        code4.setEndDate(LocalDateTime.now().plusMonths(1));
        code4.setUsageLimit(100);
        code4.setUsedCount(0);
        code4.setIsActive(true);
        discountCodeRepository.save(code4);

        System.out.println("✅ Created 4 sample discount codes: WELCOME10, SAVE50K, SUMMER20, SAVE30K");
    }
}
