package com.quizplatform.config;

import com.quizplatform.security.CustomUserDetailsService;
import com.quizplatform.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    // =========================
    // Password Encoder
    // =========================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================
    // Authentication Provider
    // =========================

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    // =========================
    // Authentication Manager
    // =========================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }

    // =========================
    // Security Configuration
    // =========================

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http) throws Exception {

        http
                // Disable CSRF because this is a stateless JWT API
                .csrf(csrf -> csrf.disable())

                // Enable CORS
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                // Stateless authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // IMPORTANT:
                        // Allow browser CORS preflight requests
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // =========================
                        // Authentication
                        // =========================

                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()

                        .requestMatchers(
                                "/api/auth/me"
                        ).authenticated()

                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // =========================
                        // Questions
                        // =========================

                        .requestMatchers(
                                "/api/quizzes/*/questions"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/questions/**"
                        ).hasRole("ADMIN")

                        // =========================
                        // Public Quiz APIs
                        // =========================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/quizzes",
                                "/api/quizzes/*"
                        ).permitAll()

                        // =========================
                        // Leaderboard
                        // =========================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/leaderboard",
                                "/api/leaderboard/**"
                        ).permitAll()

                        // =========================
                        // Categories
                        // =========================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories"
                        ).permitAll()

                        .requestMatchers(
                                "/api/categories/**"
                        ).hasRole("ADMIN")

                        // =========================
                        // Users
                        // =========================

                        .requestMatchers(
                                "/api/users/**"
                        ).hasRole("ADMIN")

                        // =========================
                        // Quiz Management
                        // =========================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/quizzes",
                                "/api/quizzes/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/quizzes/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/quizzes/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/quizzes/*/publish"
                        ).hasRole("ADMIN")

                        // =========================
                        // Admin APIs
                        // =========================

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // =========================
                        // Student / Admin Quiz Actions
                        // =========================

                        .requestMatchers(
                                "/api/quizzes/*/start",
                                "/api/quizzes/*/submit",
                                "/api/attempts/**"
                        ).hasAnyRole(
                                "STUDENT",
                                "ADMIN"
                        )

                        // =========================
                        // Everything Else
                        // =========================

                        .anyRequest().authenticated()
                )

                // Authentication provider
                .authenticationProvider(
                        authenticationProvider()
                )

                // JWT authentication filter
                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =========================
    // CORS Configuration
    // =========================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * app.cors.allowed-origins comes from
         * application.properties or Render environment variables.
         *
         * Example:
         *
         * app.cors.allowed-origins=https://your-frontend.vercel.app
         *
         * Multiple origins can be separated by commas.
         */

        List<String> origins = Arrays.stream(
                        allowedOrigins.split(",")
                )
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();

        configuration.setAllowedOrigins(origins);

        // Allowed HTTP methods
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        // Allow all request headers
        configuration.setAllowedHeaders(
                List.of("*")
        );

        // Allow credentials such as Authorization headers/cookies
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}