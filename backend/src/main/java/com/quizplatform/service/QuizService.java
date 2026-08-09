package com.quizplatform.service;

import com.quizplatform.dto.QuizRequest;
import com.quizplatform.entity.Category;
import com.quizplatform.entity.Quiz;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.repository.CategoryRepository;
import com.quizplatform.repository.QuestionRepository;
import com.quizplatform.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final com.quizplatform.repository.AttemptRepository attemptRepository;

    /** Publicly visible quizzes (students) - only PUBLISHED ones, with optional search/filter/sort. */
    public List<Quiz> getPublishedQuizzes(String search, Long categoryId, String difficulty,
                                           Integer maxDuration, String sortBy) {
        List<Quiz> quizzes = quizRepository.findByStatus(QuizStatus.PUBLISHED);

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            quizzes = quizzes.stream()
                    .filter(quiz -> quiz.getTitle().toLowerCase().contains(q)
                            || (quiz.getCategory() != null && quiz.getCategory().getName().toLowerCase().contains(q)))
                    .toList();
        }
        if (categoryId != null) {
            quizzes = quizzes.stream()
                    .filter(quiz -> quiz.getCategory() != null && quiz.getCategory().getId().equals(categoryId))
                    .toList();
        }
        if (difficulty != null && !difficulty.isBlank()) {
            quizzes = quizzes.stream()
                    .filter(quiz -> quiz.getDifficulty() != null && quiz.getDifficulty().name().equalsIgnoreCase(difficulty))
                    .toList();
        }
        if (maxDuration != null) {
            quizzes = quizzes.stream()
                    .filter(quiz -> quiz.getDuration() != null && quiz.getDuration() <= maxDuration)
                    .toList();
        }

        if (sortBy != null) {
            quizzes = new java.util.ArrayList<>(quizzes);
            switch (sortBy.toLowerCase()) {
                case "recent" -> quizzes.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
                case "duration" -> quizzes.sort(java.util.Comparator.comparing(Quiz::getDuration));
                case "popularity" -> {
                    java.util.Map<Long, Long> attemptCounts = new java.util.HashMap<>();
                    for (Quiz quiz : quizzes) {
                        attemptCounts.put(quiz.getId(), attemptRepository.countByQuizId(quiz.getId()));
                    }
                    quizzes.sort((a, b) -> Long.compare(
                            attemptCounts.getOrDefault(b.getId(), 0L),
                            attemptCounts.getOrDefault(a.getId(), 0L)));
                }
                default -> { /* no-op: keep default order */ }
            }
        }

        return quizzes;
    }

    /** Quizzes belonging to a category (any status) - used by the admin category view. */
    public List<Quiz> getByCategory(Long categoryId) {
        return quizRepository.findByCategoryId(categoryId);
    }

    /** Admin view: all quizzes regardless of status. */
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Quiz getById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
    }

    public Quiz create(QuizRequest request) {
        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .duration(request.getDuration())
                .passingScore(request.getPassingScore())
                .maxAttempts(request.getMaxAttempts() != null ? request.getMaxAttempts() : 1)
                .status(request.getStatus() != null ? request.getStatus() : QuizStatus.DRAFT)
                .thumbnail(request.getThumbnail())
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            quiz.setCategory(category);
        }

        return quizRepository.save(quiz);
    }

    public Quiz update(Long id, QuizRequest request) {
        Quiz quiz = getById(id);
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setDifficulty(request.getDifficulty());
        quiz.setDuration(request.getDuration());
        quiz.setPassingScore(request.getPassingScore());
        if (request.getMaxAttempts() != null) quiz.setMaxAttempts(request.getMaxAttempts());
        if (request.getStatus() != null) quiz.setStatus(request.getStatus());
        if (request.getThumbnail() != null) quiz.setThumbnail(request.getThumbnail());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            quiz.setCategory(category);
        }
        return quizRepository.save(quiz);
    }

    public void delete(Long id) {
        Quiz quiz = getById(id);
        quizRepository.delete(quiz);
    }

    public Quiz setPublishStatus(Long id, QuizStatus status) {
        Quiz quiz = getById(id);
        if (status == QuizStatus.PUBLISHED && questionRepository.countByQuizId(id) == 0) {
            throw new com.quizplatform.exception.BadRequestException(
                    "Cannot publish a quiz with no questions. Add at least one question first.");
        }
        quiz.setStatus(status);
        return quizRepository.save(quiz);
    }
}
