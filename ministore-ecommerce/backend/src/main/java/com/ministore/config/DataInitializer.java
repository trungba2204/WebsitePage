package com.ministore.config;

import com.ministore.entity.User;
import com.ministore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin user exists and update password if needed
        Optional<User> existingAdmin = userRepository.findByEmail("admin@ministore.com");
        
        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            // Update password to ensure it's correct
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            System.out.println("Admin user password updated: admin@ministore.com / admin123");
        } else {
            // Create new admin user
            User admin = new User();
            admin.setEmail("admin@ministore.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setPhone("0123456789");
            admin.setRole(User.UserRole.ADMIN);
            admin.setActive(true);
            
            userRepository.save(admin);
            System.out.println("Admin user created: admin@ministore.com / admin123");
        }
        
        // Verify password
        User admin = userRepository.findByEmail("admin@ministore.com").get();
        boolean matches = passwordEncoder.matches("admin123", admin.getPassword());
        System.out.println("Password verification: " + matches);
    }
}