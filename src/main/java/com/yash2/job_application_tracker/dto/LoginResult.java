package com.yash2.job_application_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResult {
    private String accessToken;
    private String refreshToken;
}
