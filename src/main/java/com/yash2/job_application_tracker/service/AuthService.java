package com.yash2.job_application_tracker.service;

import com.yash2.job_application_tracker.dto.AuthResponse;
import com.yash2.job_application_tracker.dto.LoginResult;
import com.yash2.job_application_tracker.dto.RegisterRequest;
import com.yash2.job_application_tracker.dto.VerifyEmailRequest;
import com.yash2.job_application_tracker.entity.User;
import com.yash2.job_application_tracker.exception.InvalidTokenException;
import com.yash2.job_application_tracker.exception.UserAlreadyExistsException;
import com.yash2.job_application_tracker.repository.UserRepository;
import com.yash2.job_application_tracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.yash2.job_application_tracker.dto.LoginRequest;
import com.yash2.job_application_tracker.exception.InvalidCredentialsException;

import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;
import java.security.SecureRandom;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;
    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(100000, 1000000);
        return String.valueOf(otp);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) throw new UserAlreadyExistsException("An account with this email already exists.");
        String rawToken = generateOtp();

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("applicant");
        user.setVerified(false);
        user.setVerificationTokenHash(hashToken(rawToken));
        user.setVerificationTokenExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));

        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), rawToken);
//        System.out.println("DEV ONLY - verification token for " + user.getEmail() + ": " + rawToken);
        return new AuthResponse("Account created. Please check your email to verify.", true);
    }

    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidTokenException("Invalid email or token."));

        if (user.isVerified())  return new AuthResponse("Account is already verified.", true);

        if (user.getVerificationTokenExpiry() == null
                || user.getVerificationTokenExpiry().isBefore(Instant.now())) {
            throw new InvalidTokenException("Verification token has expired. Please request a new one.");
        }
        String incomingTokenHash = hashToken(request.getToken());

        if (!incomingTokenHash.equals(user.getVerificationTokenHash())) throw new InvalidTokenException("Invalid email or token.");
        user.setVerified(true);
        user.setVerificationTokenHash(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        return new AuthResponse("Email verified successfully. You can now log in.", true);
    }

    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) throw new InvalidCredentialsException("Invalid email or password.");
        if (!user.isVerified()) throw new InvalidCredentialsException("Please verify your email before logging in.");

        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        String rawRefreshToken = generateAndStoreRefreshToken(user);

        return new LoginResult(accessToken, rawRefreshToken, user.getRole(), user.isProfileComplete());
    }

    public LoginResult refresh(String rawRefreshToken) {
        String hash = hashToken(rawRefreshToken);
        User user = userRepository.findByRefreshTokenHash(hash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired refresh token."));

        if (user.getRefreshTokenExpiry() == null
                || user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            // Expired — clear it from DB and reject
            user.setRefreshTokenHash(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new InvalidTokenException("Refresh token has expired. Please log in again.");
        }

        // Issue new access token + rotate refresh token
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        String newRawRefreshToken = generateAndStoreRefreshToken(user);

        return new LoginResult(accessToken, newRawRefreshToken, user.getRole(), user.isProfileComplete());
    }

    public void logout(String rawRefreshToken) {
        String hash = hashToken(rawRefreshToken);
        userRepository.findByRefreshTokenHash(hash).ifPresent(user -> {
            user.setRefreshTokenHash(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
        });
    }

    private String generateAndStoreRefreshToken(User user) {
        String rawRefreshToken = UUID.randomUUID().toString();
        user.setRefreshTokenHash(hashToken(rawRefreshToken));
        user.setRefreshTokenExpiry(Instant.now().plusMillis(refreshTokenExpirationMs));
        userRepository.save(user);
        return rawRefreshToken;
    }

    private String hashToken(String token) {
        try {
            // Message Digest is better than regular BCrpyt hashing as it adds
            // salting and slowness. Salting is adding extra bits of character
            // to make it difficult to guess
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Token hashing failed", e);
        }
    }
}