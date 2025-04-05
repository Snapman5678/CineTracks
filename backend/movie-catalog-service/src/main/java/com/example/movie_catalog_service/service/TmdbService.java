package com.example.movie_catalog_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.movie_catalog_service.config.TmdbProperties;
import com.example.movie_catalog_service.model.Movie;
import com.example.movie_catalog_service.model.MovieResponse;
import com.example.movie_catalog_service.model.VideoResponse;

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
            if (response != null && response.getResults() != null) {
                // Fetch trailer URLs for each movie
                List<Movie> movies = response.getResults();
                for (Movie movie : movies) {
                    fetchAndSetTrailerUrl(movie);
                }
                return movies;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
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
            if (movie != null) {
                fetchAndSetTrailerUrl(movie);
            }
            return Optional.ofNullable(movie);
        } catch (Exception e) {
            e.printStackTrace();
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
            if (response != null && response.getResults() != null) {
                // Fetch trailer URLs for each movie
                List<Movie> movies = response.getResults();
                for (Movie movie : movies) {
                    fetchAndSetTrailerUrl(movie);
                }
                return movies;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    
    /**
     * Fetch and set the trailer URL for a movie
     */
    private void fetchAndSetTrailerUrl(Movie movie) {
        if (movie == null || movie.getId() == null) {
            return;
        }
        
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movie.getId() + "/videos")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            VideoResponse videoResponse = restTemplate.getForObject(url, VideoResponse.class);
            if (videoResponse != null && videoResponse.getResults() != null && !videoResponse.getResults().isEmpty()) {
                // Find a YouTube trailer
                videoResponse.getResults().stream()
                    .filter(video -> "YouTube".equalsIgnoreCase(video.getSite()) && 
                                    ("Trailer".equalsIgnoreCase(video.getType()) || "Teaser".equalsIgnoreCase(video.getType())))
                    .findFirst()
                    .ifPresent(video -> {
                        String youtubeUrl = "https://www.youtube.com/watch?v=" + video.getKey();
                        movie.setTrailerUrl(youtubeUrl);
                    });
            }
        } catch (Exception e) {
            // Log error but continue
            System.err.println("Error fetching trailer for movie " + movie.getId() + ": " + e.getMessage());
        }
    }
}