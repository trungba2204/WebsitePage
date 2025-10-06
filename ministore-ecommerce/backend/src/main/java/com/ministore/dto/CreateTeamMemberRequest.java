package com.ministore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTeamMemberRequest {
    
    @NotBlank(message = "Tên thành viên không được để trống")
    private String name;
    
    @NotBlank(message = "Vị trí không được để trống")
    private String position;
    
    @NotBlank(message = "Ảnh đại diện không được để trống")
    private String image;
    
    @NotBlank(message = "Mô tả không được để trống")
    private String bio;
    
    @NotNull(message = "Trạng thái hoạt động không được để trống")
    private Boolean isActive;
}
