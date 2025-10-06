package com.ministore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogCategoryDTO {
    private Long id;
    private String name;
    private String description;
    private String slug;
}
