package com.yash2.job_application_tracker.repository;

import com.yash2.job_application_tracker.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByRefreshTokenHash(String refreshTokenHash);
    boolean existsByRole(String role);
}