package com.quizplatform.controller;

import com.quizplatform.dto.QuestionRequest;
import com.quizplatform.entity.Question;
import com.quizplatform.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/api/quizzes/{quizId}/questions")
    public ResponseEntity<List<Question>> getByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(questionService.getByQuiz(quizId));
    }

    @PostMapping("/api/quizzes/{quizId}/questions")
    public ResponseEntity<Question> create(@PathVariable Long quizId, @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.create(quizId, request));
    }

    @PutMapping("/api/questions/{id}")
    public ResponseEntity<Question> update(@PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.update(id, request));
    }

    @DeleteMapping("/api/questions/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        questionService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }
}
