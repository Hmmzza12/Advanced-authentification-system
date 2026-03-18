package com.auth.backend.controller;

import com.auth.backend.dto.MessageResponse;
import com.auth.backend.entity.LinkedAccount;
import com.auth.backend.entity.User;
import com.auth.backend.repository.LinkedAccountRepository;
import com.auth.backend.repository.UserRepository;
import com.auth.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth/providers")
@RequiredArgsConstructor
public class OAuth2ProviderController {

    private final LinkedAccountRepository linkedAccountRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getLinkedProviders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        List<String> providers = linkedAccountRepository.findByUser(user)
                .stream()
                .map(LinkedAccount::getProviderName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(providers);
    }

    @DeleteMapping("/{providerName}")
    public ResponseEntity<?> unlinkProvider(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable String providerName) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        List<LinkedAccount> accounts = linkedAccountRepository.findByUser(user);
        
        // Ensure they don't lock themselves out
        if (accounts.size() == 1 && (user.getPasswordHash() == null || user.getPasswordHash().isEmpty())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Cannot unlink the only login method. Please set a password first."));
        }

        linkedAccountRepository.findByUserAndProviderName(user, providerName)
                .ifPresent(linkedAccountRepository::delete);

        return ResponseEntity.ok(new MessageResponse("Unlinked " + providerName + " account successfully."));
    }
}
