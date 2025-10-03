package com.ministore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MiniStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(MiniStoreApplication.class, args);
    }
}

