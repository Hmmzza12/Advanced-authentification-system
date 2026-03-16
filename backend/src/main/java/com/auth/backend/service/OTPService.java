package com.auth.backend.service;

import com.auth.backend.entity.TOTPSecret;
import com.auth.backend.entity.User;
import com.auth.backend.repository.TOTPSecretRepository;
import com.auth.backend.util.TOTPGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OTPService {

    private final TOTPSecretRepository totpSecretRepository;
    private final TOTPGenerator totpGenerator;

    public TOTPSecret generateSecretForUser(User user) {
        Optional<TOTPSecret> existing = totpSecretRepository.findByUser(user);
        if (existing.isPresent()) {
            return existing.get();
        }

        String secretKey = totpGenerator.generateSecret();
        
        // Generate some backup codes (UUID strings)
        String backupCodes = UUID.randomUUID().toString() + "," + UUID.randomUUID().toString();

        TOTPSecret totpSecret = TOTPSecret.builder()
                .user(user)
                .secretKey(secretKey)
                .backupCodes(backupCodes)
                .enabled(false) // enabled only after first successful verification
                .build();

        return totpSecretRepository.save(totpSecret);
    }

    public boolean verifyOTP(User user, String code) {
        TOTPSecret totpSecret = totpSecretRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("2FA not set up for this user"));

        return totpGenerator.verifyCode(totpSecret.getSecretKey(), code);
    }

    public void enable2FA(User user) {
        TOTPSecret totpSecret = totpSecretRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("2FA not set up"));
        totpSecret.setEnabled(true);
        totpSecretRepository.save(totpSecret);
    }

    public void disable2FA(User user) {
        TOTPSecret totpSecret = totpSecretRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("2FA not set up"));
        totpSecretRepository.delete(totpSecret);
    }

    public boolean is2FAEnabled(User user) {
        return totpSecretRepository.findByUser(user)
                .map(TOTPSecret::isEnabled)
                .orElse(false);
    }
    
    public String getSetupQrCodeUrl(User user, TOTPSecret secret) {
        return String.format("otpauth://totp/AuthApp:%s?secret=%s&issuer=AuthApp", 
                user.getEmail(), secret.getSecretKey());
    }
}
