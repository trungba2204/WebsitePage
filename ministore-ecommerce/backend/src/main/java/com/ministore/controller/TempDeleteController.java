package com.ministore.controller;

import com.ministore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/temp")
@RequiredArgsConstructor
public class TempDeleteController {

    private final UserRepository userRepository;

    @DeleteMapping("/users/{ids}")
    public ResponseEntity<String> deleteUsers(@PathVariable String ids) {
        try {
            // Parse comma-separated IDs
            List<Long> userIds = Arrays.stream(ids.split(","))
                    .map(String::trim)
                    .map(Long::parseLong)
                    .toList();

            // Check if users exist
            for (Long id : userIds) {
                if (!userRepository.existsById(id)) {
                    return ResponseEntity.badRequest()
                            .body("User with ID " + id + " does not exist");
                }
            }

            // Delete users
            for (Long id : userIds) {
                userRepository.deleteById(id);
                System.out.println("Deleted user with ID: " + id);
            }

            return ResponseEntity.ok("Successfully deleted users: " + userIds);
        } catch (Exception e) {
            System.err.println("Error deleting users: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Error deleting users: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<String> listUsers() {
        try {
            var users = userRepository.findAll();
            StringBuilder result = new StringBuilder("Current users:\n");
            for (var user : users) {
                result.append("ID: ").append(user.getId())
                        .append(", Email: ").append(user.getEmail())
                        .append(", Name: ").append(user.getFirstName()).append(" ").append(user.getLastName())
                        .append(", Role: ").append(user.getRole())
                        .append("\n");
            }
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error listing users: " + e.getMessage());
        }
    }
}
