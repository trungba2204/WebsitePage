package com.ministore.request;

import lombok.Data;
import java.util.List;

@Data
public class CreateBlogRequest {
    private String title;
    private String content;
    private String excerpt;
    private String imageUrl;
    private String author;
    private String authorAvatar;
    private String category;
    private List<String> tags;
    private boolean published;
}
