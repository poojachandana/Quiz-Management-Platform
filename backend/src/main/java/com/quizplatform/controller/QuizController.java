package com.quizplatform.controller;

import com.quizplatform.dto.QuizRequest;
import com.quizplatform.entity.Quiz;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /** Public/student listing: published quizzes only, with optional search & filters. */
    @GetMapping
    public ResponseEntity<List<Quiz>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "false") boolean all,
            @AuthenticationPrincipal com.quizplatform.security.UserPrincipal principal) {

        boolean isAdmin = principal != null && principal.getUser().getRole() == com.quizplatform.enums.Role.ADMIN;
        if (all && isAdmin) {
            return ResponseEntity.ok(quizService.getAllQuizzes());
        }
        return ResponseEntity.ok(quizService.getPublishedQuizzes(search, categoryId, difficulty, maxDuration, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Quiz> create(@Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> update(@PathVariable Long id, @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        quizService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully"));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<Quiz> publish(@PathVariable Long id, @RequestBody Map<String, String> body) {
        QuizStatus status = QuizStatus.valueOf(body.getOrDefault("status", "PUBLISHED"));
        return ResponseEntity.ok(quizService.setPublishStatus(id, status));
    }
}
