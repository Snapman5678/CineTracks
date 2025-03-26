package com.example.auth.service;

import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        try{
        if(findByUsername(user.getUsername()).isPresent()){
            throw new IllegalArgumentException("Username Already taken");

        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);

        }
        catch (DataIntegrityViolationException e){
            throw new RuntimeException("Database exception:" + e.getMessage());
        }
        catch (Exception e){
            throw new RuntimeException(" Registration failed:" + e.getMessage());
        }
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean loginUser(String username, String rawpassword){
        Optional<User>  userOptional = findByUsername(username);
        if(userOptional.isPresent()){
            User user= userOptional.get();
            return passwordEncoder.matches(rawpassword, user.getPassword());
        }
        return false;

    }

    public boolean updateUser(Long id, User user) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                User existingUser = userOptional.get();
                existingUser.setUsername(user.getUsername());
                existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
                userRepository.save(existingUser);
                return true;
            } else {
                return false;
            }
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Database exception: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Update failed: " + e.getMessage());
        }
    }

}