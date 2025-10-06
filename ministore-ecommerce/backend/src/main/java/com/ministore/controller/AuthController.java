package com.ministore.controller;

import com.ministore.dto.AuthRequest;
import com.ministore.dto.AuthResponse;
import com.ministore.dto.RegisterRequest;
import com.ministore.dto.UserDTO;
import com.ministore.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<UserDTO> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        return ResponseEntity.ok(authService.updateUserAvatar(file, authentication.getName()));
    }
}

