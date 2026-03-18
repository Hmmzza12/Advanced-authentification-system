package com.auth.backend.service;

import com.auth.backend.entity.PasswordReset;
import com.auth.backend.entity.User;
import com.auth.backend.repository.PasswordResetRepository;
import com.auth.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void createPasswordResetToken(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            // We don't want to reveal if a user exists or not for security reasons
            logger.warn("Password reset requested for non-existent email: {}", email);
            return;
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString();
        
        PasswordReset passwordReset = PasswordReset.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();

        passwordResetRepository.save(passwordReset);

        // Simulate sending email by logging the reset link
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        logger.info("**********************************************************");
        logger.info("PASSWORD RESET LINK FOR {}: {}", email, resetLink);
        logger.info("**********************************************************");
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordReset passwordReset = passwordResetRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid password reset token"));

        if (passwordReset.isUsed()) {
            throw new RuntimeException("This password reset token has already been used");
        }

        if (passwordReset.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This password reset token has expired");
        }

        User user = passwordReset.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordReset.setUsed(true);
        passwordResetRepository.save(passwordReset);
        
        logger.info("Password successfully reset for user: {}", user.getEmail());
    }
}
