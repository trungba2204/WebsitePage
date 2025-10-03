package com.ministore.request;

import lombok.Data;

@Data
public class CreateCategoryRequest {
    private String name;
    private String description;
    private String imageUrl;
}
