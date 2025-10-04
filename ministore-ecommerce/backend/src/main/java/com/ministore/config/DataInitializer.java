package com.ministore.config;

import com.ministore.entity.User;
import com.ministore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Always recreate admin user to ensure correct password
        userRepository.findByEmail("admin@ministore.com").ifPresent(userRepository::delete);
        
        User admin = new User();
        admin.setEmail("admin@ministore.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPhone("0123456789");
        admin.setRole(User.UserRole.ADMIN);
        admin.setActive(true);
        
        userRepository.save(admin);
        System.out.println("Admin user created/updated: admin@ministore.com / admin123");
        
        // Verify password
        boolean matches = passwordEncoder.matches("admin123", admin.getPassword());
        System.out.println("Password verification: " + matches);
    }
}