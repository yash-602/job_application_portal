package com.yash2.job_application_tracker.controller;

import com.yash2.job_application_tracker.dto.AuthResponse;
import com.yash2.job_application_tracker.dto.LoginRequest;
import com.yash2.job_application_tracker.dto.LoginResult;
import com.yash2.job_application_tracker.dto.RegisterRequest;
import com.yash2.job_application_tracker.dto.VerifyEmailRequest;
import com.yash2.job_application_tracker.exception.InvalidTokenException;
import com.yash2.job_application_tracker.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Value("${cookie.secure}")
    private boolean cookieSecure;
    @Value("${jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;
    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        AuthResponse response = authService.verifyEmail(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResult result = authService.login(request);

        HttpHeaders headers = buildTokenCookieHeaders(result.getAccessToken(), result.getRefreshToken());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new AuthResponse("Login successful.", true, result.getRole(), result.getProfileComplete()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String refreshToken = extractCookieValue(request, "refreshToken");
        if (refreshToken == null) {
            throw new InvalidTokenException("Refresh token is missing.");
        }

        LoginResult result = authService.refresh(refreshToken);

        HttpHeaders headers = buildTokenCookieHeaders(result.getAccessToken(), result.getRefreshToken());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new AuthResponse("Token refreshed successfully.", true));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request) {
        // Try to invalidate the refresh token in DB
        String refreshToken = extractCookieValue(request, "refreshToken");
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        // Clear both cookies by setting maxAge to 0
        ResponseCookie accessCookie = buildCookie("token", "", Duration.ZERO);
        ResponseCookie refreshCookie = buildCookie("refreshToken", "", Duration.ZERO);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new AuthResponse("Logged out successfully.", true));
    }

    // ---- helpers ----

    private HttpHeaders buildTokenCookieHeaders(String accessToken, String refreshToken) {
        ResponseCookie accessCookie = buildCookie("token", accessToken,
                Duration.ofMillis(accessTokenExpirationMs));
        ResponseCookie refreshCookie = buildCookie("refreshToken", refreshToken,
                Duration.ofMillis(refreshTokenExpirationMs));

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return headers;
    }

    private ResponseCookie buildCookie(String name, String value, Duration maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    private String extractCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}