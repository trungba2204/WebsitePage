package com.ministore.repository;

import com.ministore.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    Optional<Blog> findBySlugAndPublishedTrue(String slug);

    Page<Blog> findByPublishedTrue(Pageable pageable);

    Page<Blog> findByPublishedTrueAndCategory(String category, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND " +
           "(:category IS NULL OR b.category = :category) AND " +
           "(:search IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Blog> findByFilters(@Param("category") String category,
                            @Param("search") String search,
                            Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true ORDER BY b.createdAt DESC")
    List<Blog> findTopByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true ORDER BY b.likes DESC, b.views DESC")
    List<Blog> findTopByOrderByLikesDesc(Pageable pageable);

    @Query("SELECT DISTINCT b.category FROM Blog b WHERE b.published = true ORDER BY b.category")
    List<String> findDistinctCategories();

    @Query("SELECT b.category, COUNT(b) FROM Blog b WHERE b.published = true GROUP BY b.category ORDER BY COUNT(b) DESC")
    List<Object[]> getCategoryCounts();

    @Query("UPDATE Blog b SET b.views = b.views + 1 WHERE b.id = :id")
    void incrementViews(@Param("id") Long id);

    @Query("UPDATE Blog b SET b.likes = b.likes + 1 WHERE b.id = :id")
    void incrementLikes(@Param("id") Long id);
    
    Page<Blog> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Date range queries for analytics
    List<Blog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}
