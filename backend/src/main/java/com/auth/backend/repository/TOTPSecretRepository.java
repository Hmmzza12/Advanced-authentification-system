package com.auth.backend.repository;

import com.auth.backend.entity.TOTPSecret;
import com.auth.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TOTPSecretRepository extends JpaRepository<TOTPSecret, Long> {
    Optional<TOTPSecret> findByUser(User user);
}
