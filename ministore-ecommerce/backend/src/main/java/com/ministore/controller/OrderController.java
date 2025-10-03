package com.ministore.controller;

import com.ministore.entity.Order;
import com.ministore.entity.OrderItem;
import com.ministore.entity.Product;
import com.ministore.entity.User;
import com.ministore.repository.CartRepository;
import com.ministore.repository.OrderRepository;
import com.ministore.repository.ProductRepository;
import com.ministore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders() {
        // For demo purposes, return all orders
        // In real app, this would filter by authenticated user
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        return order.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            // Get current cart (for demo, get first cart)
            var cart = cartRepository.findAll().stream().findFirst().orElse(null);
            if (cart == null || cart.getItems().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Create new order
            Order order = new Order();
            order.setOrderNumber(generateOrderNumber());
            order.setOrderDate(LocalDateTime.now());
            order.setStatus(Order.OrderStatus.PENDING);
            order.setTotalAmount(cart.getTotalPrice());
            order.setShippingAddress(convertToShippingAddress(request.getShippingAddress()));
            order.setPaymentMethod(request.getPaymentMethod());
            order.setNote(request.getNote());
            // For demo purposes, set user to null (anonymous orders)
            // In real app, this would be set from authenticated user
            order.setUser(null);

            // Convert cart items to order items
            for (var cartItem : cart.getItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(cartItem.getProduct());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getProduct().getPrice());
                orderItem.setOrder(order);
                order.getItems().add(orderItem);
            }

            // Save order
            order = orderRepository.save(order);

            // Clear cart after successful order creation
            cart.getItems().clear();
            cartRepository.save(cart);

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private com.ministore.entity.ShippingAddress convertToShippingAddress(CreateOrderRequest.AddressDto addressDto) {
        com.ministore.entity.ShippingAddress shippingAddress = new com.ministore.entity.ShippingAddress();
        shippingAddress.setFullName(addressDto.getFullName());
        shippingAddress.setPhone(addressDto.getPhone());
        shippingAddress.setAddress(addressDto.getAddress());
        shippingAddress.setCity(addressDto.getCity());
        shippingAddress.setDistrict(addressDto.getDistrict());
        shippingAddress.setWard(addressDto.getWard());
        shippingAddress.setPostalCode(addressDto.getPostalCode());
        return shippingAddress;
    }

    // DTOs
    public static class CreateOrderRequest {
        private AddressDto shippingAddress;
        private String paymentMethod;
        private String note;

        public AddressDto getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(AddressDto shippingAddress) { this.shippingAddress = shippingAddress; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public static class AddressDto {
            private String fullName;
            private String phone;
            private String address;
            private String city;
            private String district;
            private String ward;
            private String postalCode;

            public String getFullName() { return fullName; }
            public void setFullName(String fullName) { this.fullName = fullName; }
            public String getPhone() { return phone; }
            public void setPhone(String phone) { this.phone = phone; }
            public String getAddress() { return address; }
            public void setAddress(String address) { this.address = address; }
            public String getCity() { return city; }
            public void setCity(String city) { this.city = city; }
            public String getDistrict() { return district; }
            public void setDistrict(String district) { this.district = district; }
            public String getWard() { return ward; }
            public void setWard(String ward) { this.ward = ward; }
            public String getPostalCode() { return postalCode; }
            public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        }
    }
}
