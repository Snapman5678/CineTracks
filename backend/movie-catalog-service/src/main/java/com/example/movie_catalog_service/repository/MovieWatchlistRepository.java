package com.example.movie_catalog_service.repository;

import com.example.movie_catalog_service.model.MovieWatchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieWatchlistRepository extends JpaRepository<MovieWatchlist, Long> {
    List<MovieWatchlist> findByUsername(String username);
    Optional<MovieWatchlist> findByUsernameAndMovieId(String username, String movieId);
}