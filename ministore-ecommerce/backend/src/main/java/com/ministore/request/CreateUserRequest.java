package com.ministore.request;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String avatar;
    private String role;
    private boolean active;
    private String password;
}
