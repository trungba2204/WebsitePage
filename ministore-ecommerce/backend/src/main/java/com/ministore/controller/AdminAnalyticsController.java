package com.ministore.controller;

import com.ministore.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalyticsData(@RequestParam(defaultValue = "7d") String period) {
        Map<String, Object> analyticsData = analyticsService.getAnalyticsData(period);
        return ResponseEntity.ok(analyticsData);
    }
}
