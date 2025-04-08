package com.example.movie_catalog_service.controller;

import com.example.movie_catalog_service.model.MovieWatchlist;
import com.example.movie_catalog_service.model.TvShowWatchlist;
import com.example.movie_catalog_service.model.WatchStatus;
import com.example.movie_catalog_service.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin
public class WatchlistController {

    private final WatchlistService watchlistService;

    @Autowired
    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    // Movie watchlist endpoints
    @GetMapping("/movies/{username}")
    public ResponseEntity<List<MovieWatchlist>> getMovieWatchlist(@PathVariable String username) {
        return ResponseEntity.ok(watchlistService.getMovieWatchlistForUser(username));
    }

    @PostMapping("/movies")
    public ResponseEntity<MovieWatchlist> addMovieToWatchlist(@RequestBody MovieWatchlist movieWatchlist) {
        return new ResponseEntity<>(watchlistService.addMovieToWatchlist(movieWatchlist), HttpStatus.CREATED);
    }

    @PutMapping("/movies/{username}/{movieId}")
    public ResponseEntity<MovieWatchlist> updateMovieWatchStatus(
            @PathVariable String username,
            @PathVariable String movieId,
            @RequestBody Map<String, String> statusUpdate) {
        
        WatchStatus status = WatchStatus.valueOf(statusUpdate.get("status"));
        MovieWatchlist updated = watchlistService.updateMovieWatchStatus(username, movieId, status);
        
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/movies/{username}/{movieId}")
    public ResponseEntity<Void> removeMovieFromWatchlist(
            @PathVariable String username,
            @PathVariable String movieId) {
        
        watchlistService.removeMovieFromWatchlist(username, movieId);
        return ResponseEntity.noContent().build();
    }

    // TV Show watchlist endpoints
    @GetMapping("/tvshows/{username}")
    public ResponseEntity<List<TvShowWatchlist>> getTvShowWatchlist(@PathVariable String username) {
        return ResponseEntity.ok(watchlistService.getTvShowWatchlistForUser(username));
    }

    @PostMapping("/tvshows")
    public ResponseEntity<TvShowWatchlist> addTvShowToWatchlist(@RequestBody TvShowWatchlist tvShowWatchlist) {
        return new ResponseEntity<>(watchlistService.addTvShowToWatchlist(tvShowWatchlist), HttpStatus.CREATED);
    }

    @PutMapping("/tvshows/{username}/{tvShowId}")
    public ResponseEntity<TvShowWatchlist> updateTvShowWatchStatus(
            @PathVariable String username,
            @PathVariable String tvShowId,
            @RequestBody Map<String, Object> statusUpdate) {
        
        WatchStatus status = WatchStatus.valueOf((String) statusUpdate.get("status"));
        Integer currentSeason = (Integer) statusUpdate.get("currentSeason");
        Integer currentEpisode = (Integer) statusUpdate.get("currentEpisode");
        
        TvShowWatchlist updated = watchlistService.updateTvShowWatchStatus(
            username, tvShowId, status, currentSeason, currentEpisode);
        
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/tvshows/{username}/{tvShowId}")
    public ResponseEntity<Void> removeTvShowFromWatchlist(
            @PathVariable String username,
            @PathVariable String tvShowId) {
        
        watchlistService.removeTvShowFromWatchlist(username, tvShowId);
        return ResponseEntity.noContent().build();
    }
}