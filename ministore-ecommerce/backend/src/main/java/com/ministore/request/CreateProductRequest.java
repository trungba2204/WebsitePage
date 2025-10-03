package com.ministore.request;

import lombok.Data;

@Data
public class CreateProductRequest {
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private Long categoryId;
    private int stock;
    private Double rating;
    private Integer reviews;
}
