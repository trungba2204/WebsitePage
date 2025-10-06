package com.ministore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUploadController {

    private static final String UPLOAD_DIR = "uploads/";
    private static final String BASE_URL = "http://localhost:8080/uploads/";

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Validate file type - only web-compatible formats
            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            
            // Check content type
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }
            
            // Check file extension for web-compatible formats
            if (originalFilename == null || !isWebCompatibleImage(originalFilename, contentType)) {
                return ResponseEntity.badRequest().body("Only JPG, JPEG, PNG, GIF, and WEBP formats are supported for web display. HEIC format is not supported by web browsers.");
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size must be less than 10MB");
            }

            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return URL
            String fileUrl = BASE_URL + filename;
            return ResponseEntity.ok().body(new UploadResponse(fileUrl));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }

    // Helper method to check if image format is web-compatible
    private boolean isWebCompatibleImage(String filename, String contentType) {
        String lowerFilename = filename.toLowerCase();
        
        // Check file extension
        boolean hasValidExtension = lowerFilename.endsWith(".jpg") || 
                                   lowerFilename.endsWith(".jpeg") || 
                                   lowerFilename.endsWith(".png") || 
                                   lowerFilename.endsWith(".gif") || 
                                   lowerFilename.endsWith(".webp");
        
        // Check content type
        boolean hasValidContentType = contentType.equals("image/jpeg") || 
                                     contentType.equals("image/png") || 
                                     contentType.equals("image/gif") || 
                                     contentType.equals("image/webp");
        
        // Both extension and content type must be valid
        return hasValidExtension && hasValidContentType;
    }

    // Response class
    public static class UploadResponse {
        private String url;

        public UploadResponse(String url) {
            this.url = url;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }
}
