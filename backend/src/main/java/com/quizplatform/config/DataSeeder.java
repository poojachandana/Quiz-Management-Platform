package com.quizplatform.config;

import com.quizplatform.entity.User;
import com.quizplatform.enums.Role;
import com.quizplatform.enums.UserStatus;
import com.quizplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates a default Admin account on first startup if none exists. */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.countAdmins() == 0) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            System.out.println("======================================================");
            System.out.println(" Default admin created:");
            System.out.println(" Email:    " + adminEmail);
            System.out.println(" Password: " + adminPassword);
            System.out.println("======================================================");
        }
    }
}
