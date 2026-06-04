package com.speedbilling.service;

import com.speedbilling.dto.request.LoginRequest;
import com.speedbilling.dto.response.LoginResponse;
import com.speedbilling.entity.User;
import com.speedbilling.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request, HttpSession session) {
        User user = userRepository.findByUsernameAndIsActiveTrue(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (user.getExpirationDate() != null && user.getExpirationDate().isBefore(LocalDateTime.now())) {
            if (!"admin".equals(user.getRole())) {
                throw new RuntimeException("License expired. Billing disabled.");
            }
        }

        session.setAttribute("userId", user.getUserId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole());

        return LoginResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public User getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("Not authenticated");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public boolean isAdmin(HttpSession session) {
        return "admin".equals(session.getAttribute("role"));
    }

    public void requireAdmin(HttpSession session) {
        if (!isAdmin(session)) {
            throw new RuntimeException("Access denied. Admin role required.");
        }
    }
}
