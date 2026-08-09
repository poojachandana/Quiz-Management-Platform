package com.quizplatform.controller;

import com.quizplatform.entity.Attempt;
import com.quizplatform.service.AnalyticsService;
import com.quizplatform.service.AttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AttemptService attemptService;
    private final AnalyticsService analyticsService;

    @GetMapping("/attempts")
    public ResponseEntity<List<Attempt>> getAllAttempts() {
        return ResponseEntity.ok(attemptService.getAllAttempts());
    }

    @GetMapping("/attempts/{id}")
    public ResponseEntity<Map<String, Object>> getAttempt(@PathVariable Long id) {
        Attempt attempt = attemptService.getById(id);
        return ResponseEntity.ok(Map.of(
                "attempt", attempt,
                "answers", attemptService.getAttemptAnswers(id)
        ));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> stats = new java.util.LinkedHashMap<>(analyticsService.getDashboardStats());
        stats.putAll(analyticsService.getAnalytics());
        return ResponseEntity.ok(stats);
    }
}
