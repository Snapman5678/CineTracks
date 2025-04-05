package com.example.movie_catalog_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.movie_catalog_service.model.Movie;
import com.example.movie_catalog_service.service.TmdbService;

import java.util.List;

@RestController
@RequestMapping("api/movie-catalog/movies")
public class MovieController {
    
    @Autowired
    private TmdbService tmdbService;
    
    @GetMapping("/popular")
    public ResponseEntity<List<Movie>> getPopularMovies(
            @RequestParam(defaultValue = "1") int page) {
        List<Movie> movies = tmdbService.getPopularMovies(page);
        return ResponseEntity.ok(movies);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {
        return tmdbService.getMovieDetails(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Movie>> searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        List<Movie> movies = tmdbService.searchMovies(query, page);
        return ResponseEntity.ok(movies);
    }
}