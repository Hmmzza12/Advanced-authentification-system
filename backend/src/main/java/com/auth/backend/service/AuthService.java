package com.auth.backend.service;

import com.auth.backend.dto.JwtResponse;
import com.auth.backend.dto.LoginRequest;
import com.auth.backend.dto.SignupRequest;
import com.auth.backend.entity.RefreshToken;
import com.auth.backend.entity.User;
import com.auth.backend.exception.TokenRefreshException;
import com.auth.backend.repository.RefreshTokenRepository;
import com.auth.backend.repository.UserRepository;
import com.auth.backend.security.JwtTokenProvider;
import com.auth.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwtUtils;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OTPService otpService;

    // 7 days expiration for refresh tokens
    private final Long refreshTokenDurationMs = 604800000L;

    @Transactional
    public void registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .passwordHash(encoder.encode(signUpRequest.getPassword()))
                .emailVerified(false)
                .build();

        userRepository.save(user);
    }

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean is2FAEnabled = otpService.is2FAEnabled(user);
        
        if (is2FAEnabled) {
            // Do not issue full tokens yet, requires 2FA step
            return new JwtResponse(null, null, user.getId(), user.getUsername(), user.getEmail(), true, true);
        }

        String jwt = jwtUtils.generateJwtToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user.getId());

        return new JwtResponse(jwt, refreshToken.getToken(), userDetails.getId(),
                userDetails.getUsername(), userDetails.getEmail(), false, false);
    }
    
    @Transactional
    public JwtResponse authenticate2FA(String username, String code) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (!otpService.is2FAEnabled(user)) {
             throw new RuntimeException("2FA is not enabled for this user");
        }
        
        if (!otpService.verifyOTP(user, code)) {
             throw new RuntimeException("Invalid OTP code");
        }
        
        String jwt = jwtUtils.generateTokenFromUsername(username);
        RefreshToken refreshToken = createRefreshToken(user.getId());
        
        return new JwtResponse(jwt, refreshToken.getToken(), user.getId(),
                user.getUsername(), user.getEmail(), true, false);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        RefreshToken refreshToken = new RefreshToken();

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Revoke existing tokens
        refreshTokenRepository.deleteByUser(user);

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(LocalDateTime.now().plusSeconds(refreshTokenDurationMs / 1000));
        refreshToken.setToken(UUID.randomUUID().toString());

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(LocalDateTime.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Transactional
    public String refreshToken(String requestRefreshToken) {
        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> jwtUtils.generateTokenFromUsername(user.getUsername()))
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token is not in database!"));
    }

    @Transactional
    public void deleteRefreshTokenForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenRepository.deleteByUser(user);
    }
}
