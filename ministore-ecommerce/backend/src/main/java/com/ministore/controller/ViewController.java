package com.ministore.controller;

import com.ministore.service.ViewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/views")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class ViewController {

    private final ViewService viewService;

    @PostMapping("/track")
    public ResponseEntity<Void> trackView(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String page = request.get("page");
            if (page == null || page.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            log.info("Tracking view for page: {}", page);
            viewService.trackView(page, httpRequest);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error tracking view", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/track-authenticated")
    public ResponseEntity<Void> trackAuthenticatedView(@RequestBody Map<String, String> request, 
                                                      Authentication authentication, 
                                                      HttpServletRequest httpRequest) {
        try {
            String page = request.get("page");
            if (page == null || page.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Get user ID from authentication
            Long userId = null;
            if (authentication != null && authentication.isAuthenticated()) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof Map) {
                    Map<String, Object> userMap = (Map<String, Object>) principal;
                    userId = Long.valueOf(userMap.get("id").toString());
                }
            }
            
            log.info("Tracking authenticated view for page: {} by user: {}", page, userId);
            if (userId != null) {
                viewService.trackView(page, userId, httpRequest);
            } else {
                viewService.trackView(page, httpRequest);
            }
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error tracking authenticated view", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
