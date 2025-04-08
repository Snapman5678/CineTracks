package com.example.catalog_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.catalog_service.config.TmdbProperties;
import com.example.catalog_service.model.DetailedMovie;
import com.example.catalog_service.model.Movie;
import com.example.catalog_service.model.MovieResponse;
import com.example.catalog_service.model.VideoResponse;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class TmdbService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private TmdbProperties tmdbProperties;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    
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
    
    /**
     * Get comprehensive details about a movie including credits and similar movies
     */
    public Optional<DetailedMovie> getDetailedMovieInfo(Long movieId) {
        try {
            // 1. Get basic movie details
            String movieUrl = UriComponentsBuilder
                .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movieId)
                .queryParam("api_key", tmdbProperties.getApiKey())
                .build()
                .toUriString();
                
            DetailedMovie movie = restTemplate.getForObject(movieUrl, DetailedMovie.class);
            if (movie == null) {
                return Optional.empty();
            }
            
            // 2. Get credits (cast and crew)
            String creditsUrl = UriComponentsBuilder
                .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movieId + "/credits")
                .queryParam("api_key", tmdbProperties.getApiKey())
                .build()
                .toUriString();
                
            DetailedMovie.Credits credits = restTemplate.getForObject(creditsUrl, DetailedMovie.Credits.class);
            if (credits != null) {
                movie.setCredits(credits);
                
                // Fetch IMDb IDs for cast and crew in parallel (for better performance)
                if (credits.getCast() != null) {
                    List<CompletableFuture<Void>> castFutures = credits.getCast().stream()
                        .map(castMember -> CompletableFuture.runAsync(() -> {
                            fetchAndSetImdbId(castMember.getId(), castMember::setImdbId);
                        }, executorService))
                        .toList();
                    
                    // Wait for all cast IMDb IDs to be fetched
                    CompletableFuture.allOf(castFutures.toArray(new CompletableFuture[0])).join();
                }
                
                if (credits.getCrew() != null) {
                    List<CompletableFuture<Void>> crewFutures = credits.getCrew().stream()
                        .map(crewMember -> CompletableFuture.runAsync(() -> {
                            fetchAndSetImdbId(crewMember.getId(), crewMember::setImdbId);
                        }, executorService))
                        .toList();
                    
                    // Wait for all crew IMDb IDs to be fetched
                    CompletableFuture.allOf(crewFutures.toArray(new CompletableFuture[0])).join();
                }
            }
            
            // 3. Get similar movies
            String similarUrl = UriComponentsBuilder
                .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movieId + "/similar")
                .queryParam("api_key", tmdbProperties.getApiKey())
                .build()
                .toUriString();
                
            DetailedMovie.Similar similar = restTemplate.getForObject(similarUrl, DetailedMovie.Similar.class);
            if (similar != null) {
                movie.setSimilar(similar);
            }
            
            // 4. Get trailer URL
            fetchTrailerForDetailedMovie(movie);
            
            return Optional.of(movie);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }
    
    /**
     * Fetch external IDs (including IMDb ID) for a person from TMDB API
     */
    private void fetchAndSetImdbId(Integer personId, ImdbIdSetter setter) {
        if (personId == null) {
            return;
        }
        
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/person/" + personId + "/external_ids")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            if (response != null && response.has("imdb_id") && !response.get("imdb_id").isNull()) {
                setter.setImdbId(response.get("imdb_id").asText());
            }
        } catch (Exception e) {
            System.err.println("Error fetching IMDB ID for person " + personId + ": " + e.getMessage());
        }
    }
    
    /**
     * Functional interface for setting the IMDB ID
     */
    @FunctionalInterface
    private interface ImdbIdSetter {
        void setImdbId(String imdbId);
    }
    
    /**
     * Fetch and set the trailer URL for a DetailedMovie
     */
    private void fetchTrailerForDetailedMovie(DetailedMovie movie) {
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