package com.ministore.config;

import com.ministore.entity.*;
import com.ministore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class SampleDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final BlogRepository blogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createSampleData();
    }

    private void createSampleData() {
        // Create categories if not exist
        if (categoryRepository.count() == 0) {
            Category electronics = new Category();
            electronics.setName("Điện tử");
            electronics.setDescription("Các sản phẩm điện tử và công nghệ");
            electronics.setImageUrl("https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400");
            categoryRepository.save(electronics);

            Category fashion = new Category();
            fashion.setName("Thời trang");
            fashion.setDescription("Quần áo và phụ kiện thời trang");
            fashion.setImageUrl("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400");
            categoryRepository.save(fashion);

            Category home = new Category();
            home.setName("Gia dụng");
            home.setDescription("Đồ dùng gia đình và nội thất");
            home.setImageUrl("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400");
            categoryRepository.save(home);

            Category books = new Category();
            books.setName("Sách");
            books.setDescription("Sách và tài liệu học tập");
            books.setImageUrl("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400");
            categoryRepository.save(books);
        }

        // Create products if not exist
        if (productRepository.count() == 0) {
            Category electronics = categoryRepository.findByName("Điện tử").orElse(null);
            Category fashion = categoryRepository.findByName("Thời trang").orElse(null);
            Category home = categoryRepository.findByName("Gia dụng").orElse(null);
            Category books = categoryRepository.findByName("Sách").orElse(null);

            if (electronics != null) {
                Product laptop = new Product();
                laptop.setName("Laptop Gaming ASUS ROG");
                laptop.setDescription("Laptop gaming hiệu năng cao với card đồ họa RTX 4060");
                laptop.setPrice(BigDecimal.valueOf(25990000));
                laptop.setImageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400");
                laptop.setCategory(electronics);
                laptop.setStock(15);
                laptop.setRating(4.8);
                laptop.setReviews(127);
                productRepository.save(laptop);

                Product phone = new Product();
                phone.setName("iPhone 15 Pro Max");
                phone.setDescription("Điện thoại thông minh cao cấp với camera chuyên nghiệp");
                phone.setPrice(BigDecimal.valueOf(32990000));
                phone.setImageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400");
                phone.setCategory(electronics);
                phone.setStock(8);
                phone.setRating(4.9);
                phone.setReviews(89);
                productRepository.save(phone);
            }

            if (fashion != null) {
                Product shirt = new Product();
                shirt.setName("Áo sơ mi nam cao cấp");
                shirt.setDescription("Áo sơ mi chất liệu cotton 100%, thiết kế thanh lịch");
                shirt.setPrice(BigDecimal.valueOf(450000));
                shirt.setImageUrl("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400");
                shirt.setCategory(fashion);
                shirt.setStock(25);
                shirt.setRating(4.5);
                shirt.setReviews(56);
                productRepository.save(shirt);

                Product dress = new Product();
                dress.setName("Váy dạ hội sang trọng");
                dress.setDescription("Váy dạ hội thiết kế tinh tế, phù hợp cho các dịp đặc biệt");
                dress.setPrice(BigDecimal.valueOf(1200000));
                dress.setImageUrl("https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400");
                dress.setCategory(fashion);
                dress.setStock(12);
                dress.setRating(4.7);
                dress.setReviews(34);
                productRepository.save(dress);
            }

            if (home != null) {
                Product sofa = new Product();
                sofa.setName("Sofa 3 chỗ ngồi hiện đại");
                sofa.setDescription("Sofa chất liệu da cao cấp, thiết kế hiện đại");
                sofa.setPrice(BigDecimal.valueOf(8500000));
                sofa.setImageUrl("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400");
                sofa.setCategory(home);
                sofa.setStock(5);
                sofa.setRating(4.6);
                sofa.setReviews(23);
                productRepository.save(sofa);

                Product lamp = new Product();
                lamp.setName("Đèn bàn LED thông minh");
                lamp.setDescription("Đèn bàn LED có thể điều chỉnh độ sáng và màu sắc");
                lamp.setPrice(BigDecimal.valueOf(650000));
                lamp.setImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400");
                lamp.setCategory(home);
                lamp.setStock(18);
                lamp.setRating(4.4);
                lamp.setReviews(41);
                productRepository.save(lamp);
            }

            if (books != null) {
                Product book1 = new Product();
                book1.setName("Sách lập trình Java");
                book1.setDescription("Sách hướng dẫn lập trình Java từ cơ bản đến nâng cao");
                book1.setPrice(BigDecimal.valueOf(280000));
                book1.setImageUrl("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400");
                book1.setCategory(books);
                book1.setStock(30);
                book1.setRating(4.8);
                book1.setReviews(67);
                productRepository.save(book1);

                Product book2 = new Product();
                book2.setName("Sách kinh doanh và khởi nghiệp");
                book2.setDescription("Sách chia sẻ kinh nghiệm kinh doanh và khởi nghiệp thành công");
                book2.setPrice(BigDecimal.valueOf(320000));
                book2.setImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400");
                book2.setCategory(books);
                book2.setStock(22);
                book2.setRating(4.6);
                book2.setReviews(45);
                productRepository.save(book2);
            }
        }

        // Create blogs if not exist
        if (blogRepository.count() == 0) {
            Blog blog1 = new Blog();
            blog1.setTitle("Xu hướng công nghệ 2024");
            blog1.setContent("Công nghệ đang phát triển với tốc độ chóng mặt. Trong năm 2024, chúng ta sẽ chứng kiến sự bùng nổ của AI, IoT, và blockchain...");
            blog1.setExcerpt("Khám phá những xu hướng công nghệ nổi bật nhất trong năm 2024");
            blog1.setImageUrl("https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800");
            blog1.setAuthor("Admin");
            blog1.setAuthorAvatar("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100");
            blog1.setCategory("Công nghệ");
            blog1.setTags(Arrays.asList("công nghệ", "AI", "IoT", "blockchain"));
            blog1.setPublished(true);
            blog1.setPublishDate(LocalDateTime.now().minusDays(5));
            blog1.setViews(156);
            blog1.setLikes(23);
            blog1.setSlug("xu-huong-cong-nghe-2024");
            blogRepository.save(blog1);

            Blog blog2 = new Blog();
            blog2.setTitle("Hướng dẫn mua sắm thông minh");
            blog2.setContent("Mua sắm thông minh không chỉ là việc tiết kiệm tiền mà còn là việc mua đúng sản phẩm cần thiết...");
            blog2.setExcerpt("Bí quyết mua sắm hiệu quả và tiết kiệm chi phí");
            blog2.setImageUrl("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800");
            blog2.setAuthor("Admin");
            blog2.setAuthorAvatar("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100");
            blog2.setCategory("Mua sắm");
            blog2.setTags(Arrays.asList("mua sắm", "tiết kiệm", "thông minh"));
            blog2.setPublished(true);
            blog2.setPublishDate(LocalDateTime.now().minusDays(3));
            blog2.setViews(89);
            blog2.setLikes(12);
            blog2.setSlug("huong-dan-mua-sam-thong-minh");
            blogRepository.save(blog2);
        }

        System.out.println("Sample data created successfully!");
    }
}
