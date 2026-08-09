package com.quizplatform.controller;

import com.quizplatform.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(categoryId, period, sortBy));
    }
}
