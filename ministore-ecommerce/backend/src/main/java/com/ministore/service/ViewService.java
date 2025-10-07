package com.ministore.service;

import com.ministore.entity.View;
import com.ministore.repository.ViewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ViewService {

    private final ViewRepository viewRepository;

    public void trackView(String page, HttpServletRequest request) {
        try {
            View view = new View();
            view.setPage(page);
            view.setIpAddress(getClientIpAddress(request));
            view.setUserAgent(request.getHeader("User-Agent"));
            view.setSessionId(request.getSession().getId());
            
            // Try to get user ID from session or authentication context
            Object userId = request.getSession().getAttribute("userId");
            if (userId != null) {
                view.setUserId(Long.valueOf(userId.toString()));
            }
            
            viewRepository.save(view);
            log.debug("Tracked view for page: {} from IP: {}", page, view.getIpAddress());
        } catch (Exception e) {
            log.error("Error tracking view for page: {}", page, e);
        }
    }

    public void trackView(String page, Long userId, HttpServletRequest request) {
        try {
            View view = new View();
            view.setPage(page);
            view.setUserId(userId);
            view.setIpAddress(getClientIpAddress(request));
            view.setUserAgent(request.getHeader("User-Agent"));
            view.setSessionId(request.getSession().getId());
            
            viewRepository.save(view);
            log.debug("Tracked view for page: {} by user: {} from IP: {}", page, userId, view.getIpAddress());
        } catch (Exception e) {
            log.error("Error tracking view for page: {} by user: {}", page, userId, e);
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }
}
