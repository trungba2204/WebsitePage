package com.ministore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateDiscountCodeRequest {
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotBlank(message = "Loại giảm giá không được để trống")
    private String discountType;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    @PositiveOrZero(message = "Giá trị giảm giá phải là số dương hoặc bằng 0")
    private BigDecimal discountValue;

    @NotNull(message = "Số tiền đơn hàng tối thiểu không được để trống")
    @PositiveOrZero(message = "Số tiền đơn hàng tối thiểu phải là số dương hoặc bằng 0")
    private BigDecimal minOrderAmount;

    @NotNull(message = "Số tiền giảm tối đa không được để trống")
    @PositiveOrZero(message = "Số tiền giảm tối đa phải là số dương hoặc bằng 0")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @NotNull(message = "Giới hạn sử dụng không được để trống")
    @PositiveOrZero(message = "Giới hạn sử dụng phải là số dương hoặc bằng 0")
    private Integer usageLimit;

    @NotNull(message = "Trạng thái hoạt động không được để trống")
    private Boolean isActive;
    
    // Helper methods to convert LocalDate to LocalDateTime
    public LocalDateTime getStartDateTime() {
        return startDate != null ? startDate.atStartOfDay() : null;
    }
    
    public LocalDateTime getEndDateTime() {
        return endDate != null ? endDate.atTime(LocalTime.MAX) : null;
    }
}
