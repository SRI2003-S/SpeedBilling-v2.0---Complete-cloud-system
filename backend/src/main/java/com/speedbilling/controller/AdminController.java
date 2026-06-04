package com.speedbilling.controller;

import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.entity.User;
import com.speedbilling.repository.UserRepository;
import com.speedbilling.service.AuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final AuthService authService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers(HttpSession session) {
        authService.requireAdmin(session);
        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll()));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(
            @RequestBody User user,
            HttpSession session) {
        authService.requireAdmin(session);
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Username already exists"));
        }
        return ResponseEntity.ok(ApiResponse.success("User created",
                userRepository.save(user)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @RequestBody User updates,
            HttpSession session) {
        authService.requireAdmin(session);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (updates.getRole() != null) user.setRole(updates.getRole());
        if (updates.getIsActive() != null) user.setIsActive(updates.getIsActive());
        if (updates.getExpirationDate() != null) user.setExpirationDate(updates.getExpirationDate());
        return ResponseEntity.ok(ApiResponse.success("User updated",
                userRepository.save(user)));
    }
}
