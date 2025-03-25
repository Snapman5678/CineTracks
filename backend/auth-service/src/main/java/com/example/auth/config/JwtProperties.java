package com.example.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties{
    private String secret;
    private long expiration;
    private String issuer;


    public String getSecret(){
        return secret;
    }

    public void setSecret(String secret){
        this.secret = secret;
    }

    public long getExpiration(){
        return expiration;
    }

    public void setExpiration(long expiration){
        this.expiration= expiration;
    }

    public String getIssuer(){
        return issuer;
    }

    public void setIssuer(String issuer){
        this.issuer=issuer;
    }
}
