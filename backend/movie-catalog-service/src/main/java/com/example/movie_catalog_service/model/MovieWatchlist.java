package com.example.movie_catalog_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movie_watchlist")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieWatchlist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String movieId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WatchStatus status;
    
    // Timestamp fields can be added for created/updated time
    private Long createdAt;
    private Long updatedAt;
}