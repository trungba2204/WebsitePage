package com.ministore.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddress {

    private String fullName;
    private String phone;
    private String address;
    private String city;
    private String district;
    private String ward;
    private String postalCode;
}

