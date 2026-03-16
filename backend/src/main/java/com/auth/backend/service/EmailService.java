package com.auth.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendVerificationEmail(String to, String token) {
        // MOCK SMTP
        logger.info("=== MOCK EMAIL SERVICE ===");
        logger.info("Sending verification email to: {}", to);
        logger.info("Verification link: http://localhost:5173/verify-email?token={}", token);
        logger.info("==========================");
    }

    public void sendPasswordResetEmail(String to, String token) {
        // MOCK SMTP
        logger.info("=== MOCK EMAIL SERVICE ===");
        logger.info("Sending password reset email to: {}", to);
        logger.info("Reset link: http://localhost:5173/reset-password?token={}", token);
        logger.info("==========================");
    }
}
