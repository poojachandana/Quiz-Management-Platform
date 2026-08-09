package com.quizplatform.service;

import com.quizplatform.entity.Attempt;
import com.quizplatform.entity.Quiz;
import com.quizplatform.enums.AttemptStatus;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AttemptRepository attemptRepository;

    public Map<String, Object> getDashboardStats() {
        List<Attempt> allAttempts = attemptRepository.findAll();
        List<Attempt> completed = allAttempts.stream()
                .filter(a -> a.getStatus() != AttemptStatus.IN_PROGRESS)
                .toList();

        double avgScore = completed.stream().mapToDouble(Attempt::getPercentage).average().orElse(0.0);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalStudents", userRepository.countStudents());
        stats.put("totalQuizzes", quizRepository.count());
        stats.put("publishedQuizzes", quizRepository.countByStatus(QuizStatus.PUBLISHED));
        stats.put("draftQuizzes", quizRepository.countByStatus(QuizStatus.DRAFT));
        stats.put("totalQuestions", questionRepository.count());
        stats.put("totalAttempts", allAttempts.size());
        stats.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
        stats.put("totalPassed", completed.stream().filter(a -> a.getStatus() == AttemptStatus.PASSED).count());
        stats.put("totalFailed", completed.stream().filter(a -> a.getStatus() == AttemptStatus.FAILED).count());
        return stats;
    }

    public Map<String, Object> getAnalytics() {
        List<Attempt> attempts = attemptRepository.findAll().stream()
                .filter(a -> a.getStatus() != AttemptStatus.IN_PROGRESS)
                .toList();

        // Attempts over time (last 14 days)
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> attemptsOverTime = new LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            attemptsOverTime.put(day.format(fmt), 0L);
        }
        for (Attempt a : attempts) {
            if (a.getCompletedAt() == null) continue;
            String key = a.getCompletedAt().toLocalDate().format(fmt);
            if (attemptsOverTime.containsKey(key)) {
                attemptsOverTime.put(key, attemptsOverTime.get(key) + 1);
            }
        }

        // Average quiz score trend (last 14 days) - mean percentage of attempts completed each day
        Map<String, List<Double>> scoresByDay = new LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            scoresByDay.put(day.format(fmt), new java.util.ArrayList<>());
        }
        for (Attempt a : attempts) {
            if (a.getCompletedAt() == null) continue;
            String key = a.getCompletedAt().toLocalDate().format(fmt);
            if (scoresByDay.containsKey(key)) {
                scoresByDay.get(key).add(a.getPercentage());
            }
        }
        Map<String, Double> averageScoreOverTime = new LinkedHashMap<>();
        scoresByDay.forEach((day, scores) -> {
            double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            averageScoreOverTime.put(day, Math.round(avg * 100.0) / 100.0);
        });

        // Student registrations (last 14 days)
        Map<String, Long> registrations = new LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            registrations.put(day.format(fmt), 0L);
        }
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.quizplatform.enums.Role.STUDENT)
                .forEach(u -> {
                    String key = u.getCreatedAt().toLocalDate().format(fmt);
                    if (registrations.containsKey(key)) {
                        registrations.put(key, registrations.get(key) + 1);
                    }
                });

        double avgScore = attempts.stream().mapToDouble(Attempt::getPercentage).average().orElse(0.0);
        long passed = attempts.stream().filter(a -> a.getStatus() == AttemptStatus.PASSED).count();
        long failed = attempts.stream().filter(a -> a.getStatus() == AttemptStatus.FAILED).count();

        // Most popular quizzes (by attempt count)
        Map<Quiz, Long> byQuiz = attempts.stream()
                .collect(Collectors.groupingBy(Attempt::getQuiz, Collectors.counting()));
        List<Map<String, Object>> popularQuizzes = byQuiz.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("quizTitle", e.getKey().getTitle());
                    m.put("attempts", e.getValue());
                    return m;
                })
                .toList();

        // Most popular categories
        Map<String, Long> byCategory = attempts.stream()
                .filter(a -> a.getQuiz().getCategory() != null)
                .collect(Collectors.groupingBy(a -> a.getQuiz().getCategory().getName(), Collectors.counting()));
        List<Map<String, Object>> popularCategories = byCategory.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("category", e.getKey());
                    m.put("attempts", e.getValue());
                    return m;
                })
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("attemptsOverTime", attemptsOverTime);
        result.put("averageScoreOverTime", averageScoreOverTime);
        result.put("studentRegistrations", registrations);
        result.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
        result.put("passFailRatio", Map.of("passed", passed, "failed", failed));
        result.put("mostPopularQuizzes", popularQuizzes);
        result.put("mostPopularCategories", popularCategories);
        return result;
    }
}
