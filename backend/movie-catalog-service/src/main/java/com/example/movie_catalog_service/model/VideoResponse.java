package com.example.movie_catalog_service.model;

import java.util.List;

public class VideoResponse {
    private Long id;
    private List<Video> results;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Video> getResults() {
        return results;
    }

    public void setResults(List<Video> results) {
        this.results = results;
    }
}