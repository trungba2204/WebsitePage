package com.ministore.controller;

import com.ministore.entity.User;
import com.ministore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin-reset")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminPasswordResetController {
    
    @Autowired
    private UserRepository userRepository;
    
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetAdminPassword() {
        try {
            Optional<User> adminOpt = userRepository.findByEmail("admin@ministore.com");
            
            if (adminOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Admin user not found");
            }
            
            User admin = adminOpt.get();
            String newPassword = "admin123";
            String hashedPassword = passwordEncoder.encode(newPassword);
            
            admin.setPassword(hashedPassword);
            userRepository.save(admin);
            
            // Verify the password
            boolean matches = passwordEncoder.matches(newPassword, hashedPassword);
            
            return ResponseEntity.ok("Admin password reset successfully. Verification: " + matches + 
                                   ". New hash: " + hashedPassword.substring(0, 20) + "...");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/test-login")
    public ResponseEntity<String> testAdminLogin(@RequestParam String password) {
        try {
            Optional<User> adminOpt = userRepository.findByEmail("admin@ministore.com");
            
            if (adminOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Admin user not found");
            }
            
            User admin = adminOpt.get();
            boolean matches = passwordEncoder.matches(password, admin.getPassword());
            
            return ResponseEntity.ok("Password test for admin@ministore.com: " + matches + 
                                   ". Current hash: " + admin.getPassword().substring(0, 20) + "...");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
