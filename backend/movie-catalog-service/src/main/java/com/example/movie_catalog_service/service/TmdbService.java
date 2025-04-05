package com.example.movie_catalog_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.movie_catalog_service.config.TmdbProperties;
import com.example.movie_catalog_service.model.Movie;
import com.example.movie_catalog_service.model.MovieResponse;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class TmdbService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private TmdbProperties tmdbProperties;
    
    public List<Movie> getPopularMovies(int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/movie/popular")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            MovieResponse response = restTemplate.getForObject(url, MovieResponse.class);
            return response != null ? response.getResults() : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
    
    public Optional<Movie> getMovieDetails(Long movieId) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movieId)
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            Movie movie = restTemplate.getForObject(url, Movie.class);
            return Optional.ofNullable(movie);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public List<Movie> searchMovies(String query, int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/search/movie")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("query", query)
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            MovieResponse response = restTemplate.getForObject(url, MovieResponse.class);
            return response != null ? response.getResults() : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}