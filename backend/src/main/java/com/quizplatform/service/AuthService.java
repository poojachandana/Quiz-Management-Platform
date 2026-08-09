package com.quizplatform.service;

import com.quizplatform.dto.*;
import com.quizplatform.entity.User;
import com.quizplatform.enums.Role;
import com.quizplatform.enums.UserStatus;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.exception.UnauthorizedException;
import com.quizplatform.repository.UserRepository;
import com.quizplatform.security.JwtUtil;
import com.quizplatform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    // in-memory store of password reset tokens: token -> (email, expiry)
    private final Map<String, ResetToken> resetTokens = new HashMap<>();

    private record ResetToken(String email, LocalDateTime expiry) {}

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }
        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new UnauthorizedException("This account has been deactivated. Contact the administrator.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword()));

        return buildAuthResponse(user);
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("No account found with this email"));

        String token = UUID.randomUUID().toString();
        resetTokens.put(token, new ResetToken(user.getEmail(), LocalDateTime.now().plusMinutes(30)));

        // In production this token would be emailed to the user instead of returned directly.
        return token;
    }

    public void resetPassword(ResetPasswordRequest request) {
        ResetToken resetToken = resetTokens.get(request.getToken());
        if (resetToken == null || resetToken.expiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        User user = userRepository.findByEmail(resetToken.email())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        resetTokens.remove(request.getToken());
    }

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtUtil.generateToken(principal, user.getId(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
