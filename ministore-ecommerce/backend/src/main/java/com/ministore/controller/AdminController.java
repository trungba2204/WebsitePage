package com.ministore.controller;

import com.ministore.entity.*;
import com.ministore.repository.*;
import com.ministore.request.CreateProductRequest;
import com.ministore.request.CreateCategoryRequest;
import com.ministore.request.CreateBlogRequest;
import com.ministore.request.CreateUserRequest;
import com.ministore.dto.AdminDashboardStats;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== PRODUCTS ====================
    
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam(required = false) String search) {
        
        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && "asc".equals(sortParams[1]) 
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Product> products;
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody CreateProductRequest request) {
        try {
            Optional<Category> category = categoryRepository.findById(request.getCategoryId());
            if (category.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Product product = new Product();
            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(BigDecimal.valueOf(request.getPrice()));
            product.setImageUrl(request.getImageUrl());
            product.setCategory(category.get());
            product.setStock(request.getStock());
            product.setRating(request.getRating() != null ? request.getRating() : 0.0);
            product.setReviews(request.getReviews() != null ? request.getReviews() : 0);

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody CreateProductRequest request) {
        try {
            Optional<Product> existingProduct = productRepository.findById(id);
            if (existingProduct.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Optional<Category> category = categoryRepository.findById(request.getCategoryId());
            if (category.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Product product = existingProduct.get();
            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(BigDecimal.valueOf(request.getPrice()));
            product.setImageUrl(request.getImageUrl());
            product.setCategory(category.get());
            product.setStock(request.getStock());
            product.setRating(request.getRating() != null ? request.getRating() : 0.0);
            product.setReviews(request.getReviews() != null ? request.getReviews() : 0);

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            if (productRepository.existsById(id)) {
                productRepository.deleteById(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== CATEGORIES ====================
    
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody CreateCategoryRequest request) {
        try {
            Category category = new Category();
            category.setName(request.getName());
            category.setDescription(request.getDescription());
            category.setImageUrl(request.getImageUrl());

            Category savedCategory = categoryRepository.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody CreateCategoryRequest request) {
        try {
            Optional<Category> existingCategory = categoryRepository.findById(id);
            if (existingCategory.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Category category = existingCategory.get();
            category.setName(request.getName());
            category.setDescription(request.getDescription());
            category.setImageUrl(request.getImageUrl());

            Category savedCategory = categoryRepository.save(category);
            return ResponseEntity.ok(savedCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            if (categoryRepository.existsById(id)) {
                categoryRepository.deleteById(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== BLOGS ====================
    
    @GetMapping("/blogs")
    public ResponseEntity<Page<Blog>> getBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam(required = false) String search) {
        
        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && "asc".equals(sortParams[1]) 
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Blog> blogs;
        if (search != null && !search.trim().isEmpty()) {
            blogs = blogRepository.findByTitleContainingIgnoreCase(search.trim(), pageable);
        } else {
            blogs = blogRepository.findAll(pageable);
        }
        
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/blogs/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        return blogRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/blogs")
    public ResponseEntity<Blog> createBlog(@RequestBody CreateBlogRequest request) {
        try {
            Blog blog = new Blog();
            blog.setTitle(request.getTitle());
            blog.setContent(request.getContent());
            blog.setExcerpt(request.getExcerpt());
            blog.setImageUrl(request.getImageUrl());
            blog.setAuthor(request.getAuthor());
            blog.setAuthorAvatar(request.getAuthorAvatar());
            blog.setCategory(request.getCategory());
            blog.setTags(request.getTags());
            blog.setPublished(request.isPublished());
            blog.setPublishDate(LocalDateTime.now());
            blog.setViews(0);
            blog.setLikes(0);

            Blog savedBlog = blogRepository.save(blog);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedBlog);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/blogs/{id}")
    public ResponseEntity<Blog> updateBlog(@PathVariable Long id, @RequestBody CreateBlogRequest request) {
        try {
            Optional<Blog> existingBlog = blogRepository.findById(id);
            if (existingBlog.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Blog blog = existingBlog.get();
            blog.setTitle(request.getTitle());
            blog.setContent(request.getContent());
            blog.setExcerpt(request.getExcerpt());
            blog.setImageUrl(request.getImageUrl());
            blog.setAuthor(request.getAuthor());
            blog.setAuthorAvatar(request.getAuthorAvatar());
            blog.setCategory(request.getCategory());
            blog.setTags(request.getTags());
            blog.setPublished(request.isPublished());

            Blog savedBlog = blogRepository.save(blog);
            return ResponseEntity.ok(savedBlog);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/blogs/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        try {
            if (blogRepository.existsById(id)) {
                blogRepository.deleteById(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== USERS ====================
    
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam(required = false) String search) {
        
        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && "asc".equals(sortParams[1]) 
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCase(
                search.trim(), search.trim(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
        try {
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setAvatar(request.getAvatar());
            user.setRole(User.UserRole.valueOf(request.getRole()));
            user.setActive(request.isActive());
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            User savedUser = userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody CreateUserRequest request) {
        try {
            Optional<User> existingUser = userRepository.findById(id);
            if (existingUser.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = existingUser.get();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setAvatar(request.getAvatar());
            user.setRole(User.UserRole.valueOf(request.getRole()));
            user.setActive(request.isActive());
            
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    // ==================== DASHBOARD STATS ====================
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long totalProducts = productRepository.count();
            long totalCategories = categoryRepository.count();
            long totalBlogs = blogRepository.count();
            
            // Users this month
            LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            long usersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);

            AdminDashboardStats stats = new AdminDashboardStats();
            stats.setTotalUsers(totalUsers);
            stats.setTotalProducts(totalProducts);
            stats.setTotalCategories(totalCategories);
            stats.setTotalOrders(0); // Will be handled by AdminOrderController
            stats.setTotalBlogs(totalBlogs);
            stats.setTotalRevenue(BigDecimal.ZERO); // Will be handled by AdminOrderController
            stats.setOrdersThisMonth(0); // Will be handled by AdminOrderController
            stats.setUsersThisMonth(usersThisMonth);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
