package com.example.movie_catalog_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, TmdbProperties.class})
public class AppConfig {
    
}