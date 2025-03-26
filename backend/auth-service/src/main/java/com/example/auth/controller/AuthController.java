package com.example.auth.controller;

import com.example.auth.model.User;
import com.example.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        try{
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body("User " + registeredUser.getUsername() + " created successfully with ID: " + registeredUser.getId());
        }
        catch(IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
     

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody User user) {
        try {
            boolean isAuthenticated = userService.loginUser(user.getUsername(), user.getPassword());
            if (isAuthenticated) {
                return ResponseEntity.status(HttpStatus.OK).body("Login successful");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            boolean isUpdated = userService.updateUser(id, user);
            if (isUpdated) {
                return ResponseEntity.status(HttpStatus.OK).body("User updated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
