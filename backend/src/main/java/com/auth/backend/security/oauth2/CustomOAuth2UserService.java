package com.auth.backend.security.oauth2;

import com.auth.backend.entity.LinkedAccount;
import com.auth.backend.entity.User;
import com.auth.backend.repository.LinkedAccountRepository;
import com.auth.backend.repository.UserRepository;
import com.auth.backend.security.UserDetailsImpl;
import com.auth.backend.security.oauth2.user.OAuth2UserInfo;
import com.auth.backend.security.oauth2.user.OAuth2UserInfoFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final LinkedAccountRepository linkedAccountRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String email = oAuth2UserInfo.getEmail();

        // GitHub often returns null email from main profile.
        // We need to fetch it from their /user/emails API.
        if (!StringUtils.hasText(email) && "github".equalsIgnoreCase(registrationId)) {
            email = fetchGitHubEmail(oAuth2UserRequest);
        }

        if (!StringUtils.hasText(email)) {
            throw new RuntimeException("Email not found from OAuth2 provider. Please make sure your email is public or grant email permission.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            user = registerNewUser(email, oAuth2UserInfo);
        }

        linkAccount(user, registrationId, oAuth2UserInfo.getId());

        return UserDetailsImpl.build(user, oAuth2User.getAttributes());
    }

    /**
     * GitHub's /user endpoint often returns email as null even with user:email scope.
     * This method calls /user/emails to get the primary verified email.
     */
    private String fetchGitHubEmail(OAuth2UserRequest oAuth2UserRequest) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(oAuth2UserRequest.getAccessToken().getTokenValue());
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            List<Map<String, Object>> body = response.getBody();
            if (body != null) {
                // Find primary email first, then fall back to any verified email
                for (Map<String, Object> emailObj : body) {
                    if (Boolean.TRUE.equals(emailObj.get("primary")) && Boolean.TRUE.equals(emailObj.get("verified"))) {
                        return (String) emailObj.get("email");
                    }
                }
                // Fallback: any verified email
                for (Map<String, Object> emailObj : body) {
                    if (Boolean.TRUE.equals(emailObj.get("verified"))) {
                        return (String) emailObj.get("email");
                    }
                }
            }
        } catch (Exception e) {
            // Log but don't crash - we'll handle missing email in the caller
        }
        return null;
    }

    private User registerNewUser(String email, OAuth2UserInfo oAuth2UserInfo) {
        User user = new User();
        user.setUsername("user_" + UUID.randomUUID().toString().substring(0, 8));
        user.setEmail(email);
        user.setEmailVerified(true);
        
        // Fix for SQLite constraint: provide a secure randomized dummy password
        // because the underlying database column password_hash is defined as NOT NULL
        user.setPasswordHash(UUID.randomUUID().toString()); 
        
        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        if (!existingUser.isEmailVerified()) {
            existingUser.setEmailVerified(true);
            return userRepository.save(existingUser);
        }
        return existingUser;
    }

    private void linkAccount(User user, String providerName, String providerId) {
        Optional<LinkedAccount> linkedAccountOpt = linkedAccountRepository.findByUserAndProviderName(user, providerName);
        if (linkedAccountOpt.isEmpty()) {
            LinkedAccount linkedAccount = LinkedAccount.builder()
                    .user(user)
                    .providerName(providerName)
                    .providerId(providerId)
                    .build();
            linkedAccountRepository.save(linkedAccount);
        } else {
            LinkedAccount linkedAccount = linkedAccountOpt.get();
            if (!linkedAccount.getProviderId().equals(providerId)) {
                linkedAccount.setProviderId(providerId);
                linkedAccountRepository.save(linkedAccount);
            }
        }
    }
}

