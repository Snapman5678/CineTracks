package com.example.auth.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.auth.config.JwtUtil;
import com.example.auth.dto.UpdateProfileRequest;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Value("${app.password-reset.expiry:3600000}")
    private long passwordResetTokenExpiry;

    public String registerUser(User user) {
        try {
            if (findByUsername(user.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already taken");
            }
            
            // Handle if email already exists (if provided)
            if (user.getEmail() != null && !user.getEmail().isEmpty() && 
                userRepository.findByEmail(user.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already registered");
            }
            
            // Set default role if none provided
            if (user.getRole() == null) {
                user.setRole(Role.USER);
            }
            
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            return jwtUtil.generateToken(savedUser.getUsername());
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Database exception: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
    
    public String registerGuestUser() {
        try {
            // Create a temporary guest user
            User guestUser = new User();
            String guestUsername = "guest_" + UUID.randomUUID().toString().substring(0, 8);
            guestUser.setUsername(guestUsername);
            guestUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            guestUser.setRole(Role.GUEST);
            
            User savedUser = userRepository.save(guestUser);
            return jwtUtil.generateToken(savedUser.getUsername());
        } catch (Exception e) {
            throw new RuntimeException("Guest registration failed: " + e.getMessage());
        }
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String loginUser(String username, String rawPassword) {
        Optional<User> userOptional = findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                return jwtUtil.generateToken(user.getUsername());
            }
        }
        throw new RuntimeException("Invalid username or password");
    }

    @Transactional  
    public String updateUser(String username, User userUpdate) {
        try {
            User existingUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            // Check if new username already exists
            if (!existingUser.getUsername().equals(userUpdate.getUsername()) && 
                userRepository.findByUsername(userUpdate.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already exists");
            }
            
            // Only update password if provided
            if (userUpdate.getPassword() != null && !userUpdate.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(userUpdate.getPassword()));
            }
            
            // Update only provided fields
            if (userUpdate.getUsername() != null && !userUpdate.getUsername().isEmpty()) {
                existingUser.setUsername(userUpdate.getUsername());
            }
            
            if (userUpdate.getEmail() != null && !userUpdate.getEmail().isEmpty() &&
                !userUpdate.getEmail().equals(existingUser.getEmail())) {
                // Check if email is already in use
                if (userRepository.findByEmail(userUpdate.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("Email already in use");
                }
                existingUser.setEmail(userUpdate.getEmail());
            }
            
            userRepository.save(existingUser);
            
            return jwtUtil.generateToken(existingUser.getUsername());
            
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Username already exists: " + e.getMessage());
        }
    }
    
    @Transactional
    public void updateUserProfile(String username, UpdateProfileRequest profileUpdate) {
        User existingUser = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Update username if provided
        if (profileUpdate.getUsername() != null && !profileUpdate.getUsername().isEmpty() &&
            !profileUpdate.getUsername().equals(existingUser.getUsername())) {
            // Check if username is already in use
            if (userRepository.findByUsername(profileUpdate.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already in use");
            }
            existingUser.setUsername(profileUpdate.getUsername());
        }
        
        // Update email if provided
        if (profileUpdate.getEmail() != null && !profileUpdate.getEmail().isEmpty() && 
            !profileUpdate.getEmail().equals(existingUser.getEmail())) {
            // Check if email is already in use
            if (userRepository.findByEmail(profileUpdate.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }
            existingUser.setEmail(profileUpdate.getEmail());
        }
        
        userRepository.save(existingUser);
    }

    @Transactional
    public boolean deleteUser(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
        return true;
    }
    
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Email not found"));
        
        // Generate a unique reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(Instant.now().toEpochMilli() + passwordResetTokenExpiry); // 1 hour expiry
        
        userRepository.save(user);
        
        // In a real application, you would send an email here with the resetToken
        // For this demo, we'll just save it to the database
    }
    
    @Transactional
    public void confirmPasswordReset(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
        
        // Check if token is expired
        if (user.getResetTokenExpiry() < Instant.now().toEpochMilli()) {
            throw new IllegalArgumentException("Token expired");
        }
        
        // Reset the password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        userRepository.save(user);
    }
    
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    @Transactional
    public String upgradeGuestToUser(String guestUsername, String username, String email, String password) {
        User guestUser = userRepository.findByUsername(guestUsername)
            .orElseThrow(() -> new IllegalArgumentException("Guest user not found"));
        
        // Verify this is a guest account
        if (guestUser.getRole() != Role.GUEST) {
            throw new IllegalArgumentException("Not a guest account");
        }
        
        // Check if new username already exists
        if (!guestUser.getUsername().equals(username) && 
            userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        // Check if email already exists
        if (email != null && !email.isEmpty() && 
            userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        // Update guest user to regular user
        guestUser.setUsername(username);
        guestUser.setEmail(email);
        guestUser.setPassword(passwordEncoder.encode(password));
        guestUser.setRole(Role.USER);
        
        userRepository.save(guestUser);
        
        // Return new token with updated username
        return jwtUtil.generateToken(guestUser.getUsername());
    }
    
    @Transactional
    public String upgradeGuestToUser(String guestUsername, User userDetails) {
        return upgradeGuestToUser(guestUsername, userDetails.getUsername(), userDetails.getEmail(), userDetails.getPassword());
    }
}