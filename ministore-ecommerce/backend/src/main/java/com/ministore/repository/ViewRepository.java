package com.ministore.repository;

import com.ministore.entity.View;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ViewRepository extends JpaRepository<View, Long> {
    
    @Query("SELECT COUNT(v) FROM View v WHERE v.createdAt BETWEEN :startDate AND :endDate")
    long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(v) FROM View v WHERE v.page = :page AND v.createdAt BETWEEN :startDate AND :endDate")
    long countByPageAndDateRange(@Param("page") String page, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DATE(v.createdAt) as date, COUNT(v) as count FROM View v WHERE v.createdAt BETWEEN :startDate AND :endDate GROUP BY DATE(v.createdAt) ORDER BY date")
    List<Object[]> getViewsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(DISTINCT v.ipAddress) FROM View v WHERE v.createdAt BETWEEN :startDate AND :endDate")
    long countUniqueVisitorsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(v) FROM View v WHERE v.userId IS NOT NULL AND v.createdAt BETWEEN :startDate AND :endDate")
    long countLoggedInUserViewsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
