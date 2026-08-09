package com.quizplatform.service;

import com.quizplatform.entity.Attempt;
import com.quizplatform.enums.AttemptStatus;
import com.quizplatform.repository.AttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final AttemptRepository attemptRepository;

    public List<Map<String, Object>> getLeaderboard(Long categoryId, String period, String sortBy) {
        List<Attempt> attempts = attemptRepository.findAll().stream()
                .filter(a -> a.getStatus() != AttemptStatus.IN_PROGRESS)
                .toList();

        if (categoryId != null) {
            attempts = attempts.stream()
                    .filter(a -> a.getQuiz().getCategory() != null
                            && a.getQuiz().getCategory().getId().equals(categoryId))
                    .toList();
        }

        if (period != null) {
            java.time.LocalDateTime cutoff = switch (period.toLowerCase()) {
                case "weekly" -> java.time.LocalDateTime.now().minusWeeks(1);
                case "monthly" -> java.time.LocalDateTime.now().minusMonths(1);
                default -> null;
            };
            if (cutoff != null) {
                java.time.LocalDateTime finalCutoff = cutoff;
                attempts = attempts.stream()
                        .filter(a -> a.getCompletedAt() != null && a.getCompletedAt().isAfter(finalCutoff))
                        .toList();
            }
        }

        Map<Long, List<Attempt>> byStudent = attempts.stream()
                .collect(Collectors.groupingBy(a -> a.getUser().getId()));

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        for (Map.Entry<Long, List<Attempt>> entry : byStudent.entrySet()) {
            List<Attempt> studentAttempts = entry.getValue();
            double avgScore = studentAttempts.stream().mapToDouble(Attempt::getPercentage).average().orElse(0);
            double highest = studentAttempts.stream().mapToDouble(Attempt::getPercentage).max().orElse(0);

            Map<String, Object> row = new HashMap<>();
            row.put("studentId", entry.getKey());
            row.put("studentName", studentAttempts.get(0).getUser().getName());
            row.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
            row.put("highestScore", Math.round(highest * 100.0) / 100.0);
            row.put("quizzesCompleted", studentAttempts.size());
            leaderboard.add(row);
        }

        String sort = sortBy == null ? "averageScore" : sortBy;
        leaderboard.sort((a, b) -> switch (sort) {
            case "highestScore" -> Double.compare((double) b.get("highestScore"), (double) a.get("highestScore"));
            case "quizzesCompleted" -> Integer.compare((int) b.get("quizzesCompleted"), (int) a.get("quizzesCompleted"));
            default -> Double.compare((double) b.get("averageScore"), (double) a.get("averageScore"));
        });

        int rank = 1;
        for (Map<String, Object> row : leaderboard) {
            row.put("rank", rank++);
        }

        return leaderboard;
    }
}
