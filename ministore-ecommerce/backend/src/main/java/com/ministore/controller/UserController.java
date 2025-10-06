package com.ministore.controller;

import com.ministore.dto.UserDTO;
import com.ministore.entity.User;
import com.ministore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            UserDTO userDTO = UserDTO.fromEntity(user);
            return ResponseEntity.ok(userDTO);
        }
        
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/avatar")
    public ResponseEntity<UserDTO> updateAvatar(@RequestBody UpdateAvatarRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setAvatar(request.getAvatar());
            user = userRepository.save(user);
            
            UserDTO userDTO = UserDTO.fromEntity(user);
            return ResponseEntity.ok(userDTO);
        }
        
        return ResponseEntity.notFound().build();
    }

    @Data
    public static class UpdateAvatarRequest {
        private String avatar;
    }
}
