package com.yash2.job_application_tracker.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test/whoami")
    public String whoAmI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "Not authenticated.";
        }
        return "You are user: " + auth.getName() + ", authorities: " + auth.getAuthorities();
    }
}