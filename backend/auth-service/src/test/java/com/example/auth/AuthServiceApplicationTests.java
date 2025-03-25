package com.example.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {TestConfig.class})
@ActiveProfiles("test")
@Import(com.example.auth.config.TestSecurityConfig.class)
class AuthServiceApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @Transactional
    void contextLoads() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("testpassword");
        user.setRole("ROLE_USER");

        User savedUser = userRepository.save(user);
        assertNotNull(savedUser.getId());
    }

    @Test
    void testRegisterUser() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("testpassword");
        user.setRole("ROLE_USER");

        ResponseEntity<User> response = restTemplate.postForEntity("/api/auth/register", user, User.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("testuser", response.getBody().getUsername());
    }

    @Test
    void testLoginUser() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("testpassword");

        // Register the user first
        restTemplate.postForEntity("/api/auth/register", user, User.class);

        // Attempt login
        ResponseEntity<Boolean> response = restTemplate.postForEntity("/api/auth/login", user, Boolean.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody());
    }
}