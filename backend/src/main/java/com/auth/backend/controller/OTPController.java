package com.auth.backend.controller;

import com.auth.backend.dto.JwtResponse;
import com.auth.backend.dto.MessageResponse;
import com.auth.backend.dto.OTPRequest;
import com.auth.backend.entity.TOTPSecret;
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
@RequestMapping("/api/2fa")
@RequiredArgsConstructor
public class OTPController {

    private final OTPService otpService;
    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/setup")
    public ResponseEntity<?> setup2FA(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        TOTPSecret secret = otpService.generateSecretForUser(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("secret", secret.getSecretKey());
        response.put("qrCodeUrl", otpService.getSetupQrCodeUrl(user, secret));
        response.put("backupCodes", secret.getBackupCodes());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify2FASetup(@AuthenticationPrincipal UserDetailsImpl userDetails, 
                                            @Valid @RequestBody OTPRequest otpRequest) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        boolean isValid = otpService.verifyOTP(user, otpRequest.getCode());
        if (isValid) {
            otpService.enable2FA(user);
            return ResponseEntity.ok(new MessageResponse("2FA has been successfully enabled."));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid OTP code."));
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate2FA(@RequestParam("username") String username,
                                             @Valid @RequestBody OTPRequest otpRequest) {
        // This endpoint is used during login when requires2fa is true
        JwtResponse response = authService.authenticate2FA(username, otpRequest.getCode());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<?> get2FAStatus(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        boolean enabled = otpService.is2FAEnabled(user);
        Map<String, Boolean> response = new HashMap<>();
        response.put("enabled", enabled);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/disable")
    public ResponseEntity<?> disable2FA(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        otpService.disable2FA(user);
        return ResponseEntity.ok(new MessageResponse("2FA has been disabled."));
    }
}
