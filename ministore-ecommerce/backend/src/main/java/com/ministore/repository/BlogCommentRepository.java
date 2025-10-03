package com.ministore.repository;

import com.ministore.entity.BlogComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, Long> {

    List<BlogComment> findByBlogIdAndApprovedTrueOrderByCreatedAtDesc(Long blogId);
}
