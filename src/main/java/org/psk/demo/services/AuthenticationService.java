package org.psk.demo.services;

import org.psk.demo.dto.request.LoginRequest;
import org.psk.demo.dto.request.SignUpRequest;
import org.psk.demo.dto.response.AuthenticationResponse;
import org.psk.demo.entity.User;
import org.psk.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthenticationResponse signUp(SignUpRequest signUpRequest) {
        if(!signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            return new AuthenticationResponse("Passwords do not match!", null, null, false);
        }
        if(userRepository.existsByUsername(signUpRequest.getUsername())) {
            return new AuthenticationResponse("Username already exists!", null, null, false);
        }
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        try {
            User savedUser = userRepository.save(user);
            return new AuthenticationResponse("User registered successfully!", savedUser.getUsername(), savedUser.getId(), true);
        } catch (Exception e) {
            return new AuthenticationResponse("Could not sign up! " + e.getMessage(), null, null, false);
        }
    }

    public AuthenticationResponse login(LoginRequest loginRequest) {
        Optional<User> user = userRepository.findByUsername(loginRequest.getUsername());
        if(user.isEmpty()) {
            return new AuthenticationResponse("Invalid username or password!", null, null, false);
        }
        if(!passwordEncoder.matches(loginRequest.getPassword(), user.get().getPassword())) {
            return new AuthenticationResponse("Invalid username or password!", null, null, false);
        }
        return new AuthenticationResponse("Login successful!", user.get().getUsername(), user.get().getId(), true);
    }
}
