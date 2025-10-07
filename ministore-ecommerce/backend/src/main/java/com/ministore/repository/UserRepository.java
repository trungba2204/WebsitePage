package com.ministore.repository;

import com.ministore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    Page<User> findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCase(String email, String firstName, Pageable pageable);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt > :date")
    long countByCreatedAtAfter(LocalDateTime date);
    
    // Date range queries for analytics
    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}

