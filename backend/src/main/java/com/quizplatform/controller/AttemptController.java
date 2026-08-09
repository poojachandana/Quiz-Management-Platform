package com.quizplatform.controller;

import com.quizplatform.dto.AttemptStartResponse;
import com.quizplatform.dto.SubmitQuizRequest;
import com.quizplatform.entity.Answer;
import com.quizplatform.entity.Attempt;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.security.UserPrincipal;
import com.quizplatform.service.AttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping("/api/quizzes/{quizId}/start")
    public ResponseEntity<AttemptStartResponse> start(@PathVariable Long quizId,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        Attempt attempt = attemptService.startAttempt(quizId, principal.getId());
        List<com.quizplatform.dto.QuestionPublicResponse> questions = attemptService.getSanitizedQuestions(quizId);
        return ResponseEntity.ok(AttemptStartResponse.builder().attempt(attempt).questions(questions).build());
    }

    @PostMapping("/api/quizzes/{quizId}/submit")
    public ResponseEntity<Attempt> submit(@PathVariable Long quizId,
                                           @RequestParam Long attemptId,
                                           @RequestBody SubmitQuizRequest request,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        Attempt attempt = attemptService.submitAttempt(attemptId, principal.getId(), request);
        if (!attempt.getQuiz().getId().equals(quizId)) {
            throw new BadRequestException("Attempt does not match this quiz");
        }
        return ResponseEntity.ok(attempt);
    }

    /** Lets a student resume an in-progress attempt after a page refresh without leaking answers. */
    @GetMapping("/api/attempts/{id}/resume")
    public ResponseEntity<AttemptStartResponse> resume(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        Attempt attempt = attemptService.getById(id);
        if (!attempt.getUser().getId().equals(principal.getId())) {
            throw new BadRequestException("This attempt does not belong to you");
        }
        List<com.quizplatform.dto.QuestionPublicResponse> questions =
                attemptService.getSanitizedQuestions(attempt.getQuiz().getId());
        return ResponseEntity.ok(AttemptStartResponse.builder().attempt(attempt).questions(questions).build());
    }

    @GetMapping("/api/attempts")
    public ResponseEntity<List<Attempt>> myAttempts(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attemptService.getUserAttempts(principal.getId()));
    }

    @GetMapping("/api/attempts/{id}")
    public ResponseEntity<Map<String, Object>> getAttempt(@PathVariable Long id,
                                                            @AuthenticationPrincipal UserPrincipal principal) {
        Attempt attempt = attemptService.getById(id);

        boolean isOwner = attempt.getUser().getId().equals(principal.getId());
        boolean isAdmin = principal.getUser().getRole() == com.quizplatform.enums.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You do not have access to this attempt");
        }

        List<Answer> answers = attemptService.getAttemptAnswers(id);
        return ResponseEntity.ok(Map.of("attempt", attempt, "answers", answers));
    }
}
