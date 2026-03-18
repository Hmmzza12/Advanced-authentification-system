package com.auth.backend.repository;

import com.auth.backend.entity.LinkedAccount;
import com.auth.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LinkedAccountRepository extends JpaRepository<LinkedAccount, Long> {
    Optional<LinkedAccount> findByProviderNameAndProviderId(String providerName, String providerId);
    List<LinkedAccount> findByUser(User user);
    Optional<LinkedAccount> findByUserAndProviderName(User user, String providerName);
}
