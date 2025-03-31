package com.example.movie_catalog_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties{
    private String secret;

    public String getSecret(){
        return secret;
    }

    public void setSecret(String secret){
        this.secret = secret;
    }

}
