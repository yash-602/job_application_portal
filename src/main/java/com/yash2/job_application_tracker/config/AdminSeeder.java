package com.yash2.job_application_tracker.config;

import com.yash2.job_application_tracker.entity.User;
import com.yash2.job_application_tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // The seed only runs if no user with role admin exists in the database
        if (!userRepository.existsByRole("admin")) {
            User admin = new User();
            admin.setEmail("admin@undocked.net");
            admin.setPassword(passwordEncoder.encode("Admin@123")); // IMPORTANT: Change this password in production
            admin.setRole("admin");
            admin.setVerified(true);
            userRepository.save(admin);
            System.out.println("✅ Admin account seeded: admin@undocked.net / Admin@123");
        }
    }
}
