package com.ministore.service;

import com.ministore.repository.OrderRepository;
import com.ministore.repository.BlogRepository;
import com.ministore.repository.UserRepository;
import com.ministore.repository.ProductRepository;
import com.ministore.repository.ViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ViewRepository viewRepository;

    public Map<String, Object> getAnalyticsData(String period) {
        Map<String, Object> result = new HashMap<>();
        
        // Calculate date range based on period
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = calculateStartDate(period, endDate);
        
        // Get real data from database
        List<Map<String, Object>> viewsData = getRealViewsData(startDate, endDate);
        List<Map<String, Object>> revenueData = getRealRevenueData(startDate, endDate);
        
        // Calculate totals
        int totalViews = viewsData.stream()
                .mapToInt(view -> (Integer) view.get("count"))
                .sum();
        
        long totalRevenue = revenueData.stream()
                .mapToLong(revenue -> ((Number) revenue.get("amount")).longValue())
                .sum();
        
        double averageOrderValue = calculateRealAverageOrderValue(startDate, endDate);
        double conversionRate = calculateRealConversionRate(startDate, endDate);
        long uniqueVisitors = calculateUniqueVisitors(startDate, endDate);
        
        result.put("views", viewsData);
        result.put("revenue", revenueData);
        result.put("totalViews", totalViews);
        result.put("totalRevenue", totalRevenue);
        result.put("averageOrderValue", averageOrderValue);
        result.put("conversionRate", conversionRate);
        result.put("uniqueVisitors", uniqueVisitors);
        
        return result;
    }

    private LocalDate calculateStartDate(String period, LocalDate endDate) {
        switch (period) {
            case "7d":
                return endDate.minusDays(6);
            case "30d":
                return endDate.minusDays(29);
            case "90d":
                return endDate.minusDays(89);
            default:
                return endDate.minusDays(6);
        }
    }

    private List<Map<String, Object>> getRealViewsData(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> viewsData = new ArrayList<>();
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get real views data from database
        List<Object[]> viewsByDate = viewRepository.getViewsByDateRange(startDateTime, endDateTime);
        
        // Create a map for quick lookup
        Map<LocalDate, Long> viewsMap = new HashMap<>();
        for (Object[] row : viewsByDate) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            Long count = ((Number) row[1]).longValue();
            viewsMap.put(date, count);
        }
        
        // Fill in data for all dates in range
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", currentDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
            
            // Get real view count for this date, or 0 if no data
            Long dailyViews = viewsMap.getOrDefault(currentDate, 0L);
            dayData.put("count", dailyViews.intValue());
            viewsData.add(dayData);
            
            currentDate = currentDate.plusDays(1);
        }
        
        return viewsData;
    }

    private List<Map<String, Object>> getRealRevenueData(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> revenueData = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", currentDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
            
            // Get real orders for this specific day
            List<com.ministore.entity.Order> dailyOrders = orderRepository.findByOrderDateBetween(
                currentDate.atStartOfDay(), 
                currentDate.atTime(23, 59, 59)
            );
            
            // Calculate total revenue for the day
            BigDecimal dailyRevenue = dailyOrders.stream()
                .map(order -> {
                    BigDecimal orderTotal = order.getTotalAmount();
                    // Subtract discount if applied and discountAmount is not null
                    if (order.getDiscountCode() != null && 
                        order.getDiscountAmount() != null && 
                        order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                        orderTotal = orderTotal.subtract(order.getDiscountAmount());
                    }
                    return orderTotal;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            dayData.put("amount", dailyRevenue.longValue());
            revenueData.add(dayData);
            
            currentDate = currentDate.plusDays(1);
        }
        
        return revenueData;
    }

    private double calculateRealAverageOrderValue(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        List<com.ministore.entity.Order> ordersInPeriod = orderRepository.findByOrderDateBetween(startDateTime, endDateTime);
        
        if (ordersInPeriod.isEmpty()) {
            return 0.0;
        }
        
        BigDecimal totalRevenue = ordersInPeriod.stream()
            .map(order -> {
                BigDecimal orderTotal = order.getTotalAmount();
                if (order.getDiscountCode() != null && 
                    order.getDiscountAmount() != null && 
                    order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    orderTotal = orderTotal.subtract(order.getDiscountAmount());
                }
                return orderTotal;
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return totalRevenue.divide(BigDecimal.valueOf(ordersInPeriod.size()), 2, BigDecimal.ROUND_HALF_UP)
                .doubleValue();
    }

    private double calculateRealConversionRate(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get total views in period
        long totalViews = viewRepository.countByDateRange(startDateTime, endDateTime);
        
        // Get total orders in period
        List<com.ministore.entity.Order> ordersInPeriod = orderRepository.findByOrderDateBetween(startDateTime, endDateTime);
        
        if (totalViews == 0) {
            return 0.0;
        }
        
        // Calculate conversion rate: (Orders / Views) * 100
        return (double) ordersInPeriod.size() / totalViews * 100;
    }

    private long calculateUniqueVisitors(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get unique visitors by IP address
        return viewRepository.countUniqueVisitorsByDateRange(startDateTime, endDateTime);
    }
}