package com.quizplatform.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for auth endpoints to slow down brute force attempts.
 * Limits each client IP to a fixed number of requests per rolling minute window.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 30;
    private final ConcurrentHashMap<String, Window> requestCounts = new ConcurrentHashMap<>();

    private static class Window {
        long windowStart = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(0);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/")) {
            String clientIp = request.getRemoteAddr();
            Window window = requestCounts.computeIfAbsent(clientIp, k -> new Window());

            long now = System.currentTimeMillis();
            if (now - window.windowStart > 60_000) {
                window.windowStart = now;
                window.count.set(0);
            }

            if (window.count.incrementAndGet() > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Too many requests. Please try again later.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
