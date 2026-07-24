package com.yash2.job_application_tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
public class JobApplicationTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobApplicationTrackerApplication.class, args);
	}

}
