package com.example.auth.controller;

import com.example.auth.model.User;
import com.example.auth.service.UserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody User user) {
        try {
            String token = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful",
                    "token", token,
                    "expiresIn", 86400000));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody User user) {
        try {
            String token = userService.loginUser(user.getUsername(), user.getPassword());
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "expiresIn", 86400000));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", e.getMessage()));
        }
    }

    @PutMapping("/user")
    public ResponseEntity<Map<String, Object>> updateUser(@Valid @RequestBody User userUpdate) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        try {
            String updatedToken = userService.updateUser(username, userUpdate);

            return ResponseEntity.ok(Map.of(
                    "message", "User updated successfully",
                    "username", userUpdate.getUsername(),
                    "token", updatedToken,
                    "expiresIn", 86400000));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "Username already exists",
                    "error", "CONFLICT"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "error", "BAD_REQUEST"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to update user",
                    "error", "INTERNAL_SERVER_ERROR"));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUser() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        Optional<User> userDetails = userService.findByUsername(username);

        if (userDetails.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Details obtained successfully",
                    "user", Map.of(
                            "username", userDetails.get().getUsername(),
                            "role", userDetails.get().getRole())));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "User not found",
                    "error", "NOT_FOUND"));
        }
    }

    @DeleteMapping("/user")
    public ResponseEntity<Map<String, Object>> deleteUser() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        try {
            boolean isDeleted = userService.deleteUser(username);
            if (isDeleted) {
                return ResponseEntity.ok(Map.of(
                        "message", "User deleted successfully",
                        "username", username));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "User not found",
                    "error", "NOT_FOUND"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "User not found",
                    "error", "NOT_FOUND"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to delete user",
                    "error", "INTERNAL_SERVER_ERROR"));
        }

    }

}
