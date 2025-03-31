package com.example.movie_catalog_service.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

// This is for testing purposes only. It will be removed in the future.
// This controller is used for unauthenticated routes and which does not need usernames

@RestController
@RequestMapping("api/movie-catalog")
public class MovieCatalogController {
    
    @GetMapping("test")
    public ResponseEntity<Map<String,Object>> getTest() {
        
        
        return ResponseEntity.ok(Map.of(
                "message", "Success"));
    }
    
}