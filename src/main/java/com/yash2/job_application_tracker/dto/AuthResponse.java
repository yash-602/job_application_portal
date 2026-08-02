package com.yash2.job_application_tracker.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String message;
    private boolean success;
    private String role;
    private Boolean profileComplete;

    public AuthResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    public AuthResponse(String message, boolean success, String role, Boolean profileComplete) {
        this.message = message;
        this.success = success;
        this.role = role;
        this.profileComplete = profileComplete;
    }
}