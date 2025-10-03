package com.ministore.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AdminDashboardStats {
    private long totalUsers;
    private long totalProducts;
    private long totalCategories;
    private long totalOrders;
    private long totalBlogs;
    private BigDecimal totalRevenue;
    private long ordersThisMonth;
    private long usersThisMonth;
}
