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
        try {
            // The seed only runs if no user with role admin exists in the database
            if (!userRepository.existsByRole("admin")) {
                User admin = new User();
                admin.setEmail("admin@undocked.net");
                admin.setPassword(passwordEncoder.encode("Admin@123")); // IMPORTANT: Change this in production
                admin.setRole("admin");
                admin.setVerified(true);
                admin.setProfileComplete(true);
                userRepository.save(admin);
                System.out.println("✅ Admin account seeded: admin@undocked.net");
            } else {
                System.out.println("✅ Admin account already exists, skipping seed.");
            }
        } catch (Exception e) {
            // Do not crash the app if seeding fails — it can be done manually
            System.err.println("⚠️ Admin seeding skipped due to error: " + e.getMessage());
        }
    }
}
