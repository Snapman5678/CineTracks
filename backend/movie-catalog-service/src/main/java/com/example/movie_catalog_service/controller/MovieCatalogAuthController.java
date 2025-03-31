package com.example.movie_catalog_service.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;

// This is for testing purposes only. It will be removed in the future.
// This controller is used for authenticated routes and which needs usernames

@RestController
@RequestMapping("api/movie-catalog/auth")
public class MovieCatalogAuthController {
    
    @GetMapping("test")
    public ResponseEntity<Map<String,Object>> postMethodName() {

        
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        
        return ResponseEntity.ok(Map.of(
                "message", "Success",

                "username", username));
    }
    
} 
    

