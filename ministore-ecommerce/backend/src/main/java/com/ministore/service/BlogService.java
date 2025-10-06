package com.ministore.service;

import com.ministore.entity.Blog;
import com.ministore.entity.BlogComment;
import com.ministore.repository.BlogRepository;
import com.ministore.repository.BlogCommentRepository;
import com.ministore.dto.CategoryCountDTO;
import com.ministore.dto.BlogCategoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final BlogCommentRepository blogCommentRepository;

    public Page<Blog> getBlogs(String category, String search, int page, int size, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        if (category != null && !category.isEmpty()) {
            if (search != null && !search.isEmpty()) {
                return blogRepository.findByFilters(category, search, pageable);
            } else {
                return blogRepository.findByPublishedTrueAndCategory(category, pageable);
            }
        } else if (search != null && !search.isEmpty()) {
            return blogRepository.findByFilters(null, search, pageable);
        } else {
            return blogRepository.findByPublishedTrue(pageable);
        }
    }

    public Optional<Blog> getBlogBySlug(String slug) {
        Optional<Blog> blog = blogRepository.findBySlugAndPublishedTrue(slug);
        blog.ifPresent(this::incrementViews);
        return blog;
    }

    public Blog getBlogById(Long id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
    }

    public List<BlogCategoryDTO> getCategories() {
        List<String> categoryNames = blogRepository.findDistinctCategories();
        System.out.println("🔍 BlogService getCategories - Raw categories: " + categoryNames);
        
        return categoryNames.stream()
                .map(categoryName -> new BlogCategoryDTO(
                    (long) categoryName.hashCode(), // Generate ID from hash
                    categoryName,                   // name
                    "",                             // description (empty for now)
                    categoryName.toLowerCase().replace(" ", "-") // slug
                ))
                .collect(Collectors.toList());
    }

    public List<CategoryCountDTO> getCategoryCounts() {
        List<Object[]> rawCounts = blogRepository.getCategoryCounts();
        System.out.println("🔍 BlogService getCategoryCounts - Raw counts: " + rawCounts);
        
        return rawCounts.stream()
                .map(row -> new CategoryCountDTO(
                    (String) row[0],  // category
                    (Long) row[1]     // count
                ))
                .collect(Collectors.toList());
    }

    public List<Blog> getRecentBlogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return blogRepository.findTopByOrderByCreatedAtDesc(pageable);
    }

    public List<Blog> getPopularBlogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return blogRepository.findTopByOrderByLikesDesc(pageable);
    }

    public List<BlogComment> getBlogComments(Long blogId) {
        return blogCommentRepository.findByBlogIdAndApprovedTrueOrderByCreatedAtDesc(blogId);
    }

    @Transactional
    public BlogComment createComment(Long blogId, BlogComment comment) {
        Blog blog = getBlogById(blogId);
        comment.setBlog(blog);
        comment.setApproved(false); // Comments need approval
        return blogCommentRepository.save(comment);
    }

    @Transactional
    public void likeBlog(Long blogId) {
        Blog blog = getBlogById(blogId);
        blog.setLikes(blog.getLikes() + 1);
        blogRepository.save(blog);
    }

    @Transactional
    public void incrementViews(Blog blog) {
        blog.setViews(blog.getViews() + 1);
        blogRepository.save(blog);
    }
}
