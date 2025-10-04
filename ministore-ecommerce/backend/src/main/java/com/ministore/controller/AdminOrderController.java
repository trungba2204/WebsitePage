package com.ministore.controller;

import com.ministore.entity.Order;
import com.ministore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<Page<Order>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> orders = orderRepository.findAll(pageable);
        
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        return order.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {
        
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        try {
            order.setStatus(Order.OrderStatus.valueOf(request.getStatus()));
            order = orderRepository.save(order);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        orderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<OrderStats> getOrderStats() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(Order.OrderStatus.CONFIRMED);
        long shippingOrders = orderRepository.countByStatus(Order.OrderStatus.SHIPPING);
        long deliveredOrders = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);
        
        OrderStats stats = new OrderStats();
        stats.setTotalOrders(totalOrders);
        stats.setPendingOrders(pendingOrders);
        stats.setConfirmedOrders(confirmedOrders);
        stats.setShippingOrders(shippingOrders);
        stats.setDeliveredOrders(deliveredOrders);
        stats.setCancelledOrders(cancelledOrders);
        
        return ResponseEntity.ok(stats);
    }

    // DTOs
    public static class UpdateOrderStatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class OrderStats {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long shippingOrders;
        private long deliveredOrders;
        private long cancelledOrders;

        // Getters and setters
        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
        public long getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
        public long getConfirmedOrders() { return confirmedOrders; }
        public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }
        public long getShippingOrders() { return shippingOrders; }
        public void setShippingOrders(long shippingOrders) { this.shippingOrders = shippingOrders; }
        public long getDeliveredOrders() { return deliveredOrders; }
        public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }
        public long getCancelledOrders() { return cancelledOrders; }
        public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }
    }
}
