package com.ministore.repository;

import com.ministore.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    
    Page<Order> findByOrderNumberContainingIgnoreCase(String orderNumber, Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate > :date")
    long countByOrderDateAfter(LocalDateTime date);
    
    long countByStatus(Order.OrderStatus status);
    
    // Date range queries for analytics
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}

