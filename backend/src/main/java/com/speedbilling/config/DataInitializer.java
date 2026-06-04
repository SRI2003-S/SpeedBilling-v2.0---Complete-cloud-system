package com.speedbilling.config;

import com.speedbilling.entity.User;
import com.speedbilling.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed if no users exist
        if (userRepository.count() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        // Create admin user
        User admin = User.builder()
                .username("Srinesh")
                .passwordHash(passwordEncoder.encode("Srinesh@2003"))
                .role("admin")
                .createdAt(now)
                .updatedAt(now)
                .expirationDate(now.plusYears(1))
                .isActive(true)
                .build();
        userRepository.save(admin);
        System.out.println("Created admin user: Srinesh / Srinesh@2003");

        // Create cashier user
        User cashier = User.builder()
                .username("Employee1")
                .passwordHash(passwordEncoder.encode("BeemBoy@123"))
                .role("cashier")
                .createdAt(now)
                .updatedAt(now)
                .expirationDate(now.plusYears(1))
                .isActive(true)
                .build();
        userRepository.save(cashier);
        System.out.println("Created cashier user: Employee1 / BeemBoy@123");
    }
}
