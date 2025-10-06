package com.ministore.repository;

import com.ministore.entity.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {

    Optional<DiscountCode> findByCode(String code);

    List<DiscountCode> findByIsActiveTrue();

    @Query("SELECT dc FROM DiscountCode dc WHERE dc.isActive = true AND dc.startDate <= :now AND dc.endDate > :now")
    List<DiscountCode> findActiveDiscountCodes(@Param("now") LocalDateTime now);

    @Query("SELECT dc FROM DiscountCode dc WHERE dc.code = :code AND dc.isActive = true AND dc.startDate <= :now AND dc.endDate > :now")
    Optional<DiscountCode> findValidDiscountCode(@Param("code") String code, @Param("now") LocalDateTime now);

    @Query("SELECT dc FROM DiscountCode dc WHERE dc.code = :code AND dc.isActive = true AND dc.startDate <= :now AND dc.endDate > :now AND (dc.usageLimit = 0 OR dc.usedCount < dc.usageLimit)")
    Optional<DiscountCode> findAvailableDiscountCode(@Param("code") String code, @Param("now") LocalDateTime now);
}
