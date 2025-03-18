package com.example.auth;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(classes = {TestConfig.class})
@ActiveProfiles("test")
@Import(com.example.auth.config.TestSecurityConfig.class)
class AuthServiceApplicationTests {

    @Autowired
    private UserRepository userRepository;

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
}