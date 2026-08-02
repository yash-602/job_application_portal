package com.yash2.job_application_tracker.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;
    private String password;
    private String role = "applicant";
    private boolean verified = false;
    private String verificationTokenHash;
    private Instant verificationTokenExpiry ;
    private String refreshTokenHash;
    private Instant refreshTokenExpiry;
    private Instant createdAt = Instant.now();
    private boolean profileComplete = false;
}
