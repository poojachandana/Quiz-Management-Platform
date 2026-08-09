package com.quizplatform.controller;

import com.quizplatform.dto.CategoryRequest;
import com.quizplatform.entity.Category;
import com.quizplatform.entity.Quiz;
import com.quizplatform.service.CategoryService;
import com.quizplatform.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    /** Admin: view all quizzes under a given category (any status), per spec section 8. */
    @GetMapping("/{id}/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzesInCategory(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getByCategory(id));
    }

    @PostMapping
    public ResponseEntity<Category> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}
