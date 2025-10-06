package com.ministore.controller;

import com.ministore.entity.Blog;
import com.ministore.entity.BlogComment;
import com.ministore.service.BlogService;
import com.ministore.dto.CategoryCountDTO;
import com.ministore.dto.BlogCategoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    @GetMapping
    public ResponseEntity<Page<Blog>> getBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        return ResponseEntity.ok(blogService.getBlogs(category, search, page, size, sortBy, sortOrder));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Blog> getBlogBySlug(@PathVariable String slug) {
        return blogService.getBlogBySlug(slug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getBlogById(id));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<BlogCategoryDTO>> getCategories() {
        List<BlogCategoryDTO> categories = blogService.getCategories();
        System.out.println("🔍 BlogController getCategories - DTO categories: " + categories);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/categories/count")
    public ResponseEntity<List<CategoryCountDTO>> getCategoryCounts() {
        List<CategoryCountDTO> counts = blogService.getCategoryCounts();
        System.out.println("🔍 BlogController getCategoryCounts - DTO data: " + counts);
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Blog>> getRecentBlogs(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(blogService.getRecentBlogs(limit));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Blog>> getPopularBlogs(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(blogService.getPopularBlogs(limit));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<BlogComment>> getBlogComments(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getBlogComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<BlogComment> createComment(@PathVariable Long id, @RequestBody BlogComment comment) {
        return ResponseEntity.ok(blogService.createComment(id, comment));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeBlog(@PathVariable Long id) {
        blogService.likeBlog(id);
        return ResponseEntity.ok().build();
    }
}
