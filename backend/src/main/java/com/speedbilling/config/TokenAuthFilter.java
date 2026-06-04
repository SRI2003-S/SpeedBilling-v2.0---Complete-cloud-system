package com.speedbilling.config;

import com.speedbilling.entity.User;
import com.speedbilling.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Token-based authentication filter that reads session ID from
 * Authorization header (sent by frontend via localStorage)
 */
@Component
public class TokenAuthFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public TokenAuthFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Check for Authorization header with Bearer token
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Token format: userId:role:timestamp
            // Simple implementation: parse and set authentication
            try {
                String[] parts = token.split(":");
                if (parts.length >= 2) {
                    Long userId = Long.parseLong(parts[0]);
                    String role = parts[1];

                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null && user.getIsActive() != null && user.getIsActive()) {
                        String springRole = "ROLE_" + role.toUpperCase();
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(userId, null,
                                        List.of(new SimpleGrantedAuthority(springRole)));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception e) {
                // Token parsing failed, continue without auth
            }
        }

        filterChain.doFilter(request, response);
    }
}
