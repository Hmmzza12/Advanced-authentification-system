package com.auth.backend.controller;

import com.auth.backend.dto.*;
import com.auth.backend.entity.RefreshToken;
import com.auth.backend.entity.User;
import com.auth.backend.repository.UserRepository;
import com.auth.backend.security.UserDetailsImpl;
import com.auth.backend.service.AuthService;
import com.auth.backend.service.OTPService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final OTPService otpService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        authService.registerUser(signUpRequest);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        String token = authService.refreshToken(requestRefreshToken);
        
        return ResponseEntity.ok(new JwtResponse(token, requestRefreshToken, null, null, null, false, false));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        authService.deleteRefreshTokenForUser(userDetails.getId());
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean is2faEnabled = otpService.is2FAEnabled(user);
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("is2faEnabled", is2faEnabled);
        
        return ResponseEntity.ok(profile);
    }
}

