package com.quizplatform.service;

import com.quizplatform.dto.OptionPublicResponse;
import com.quizplatform.dto.QuestionPublicResponse;
import com.quizplatform.dto.SubmitAnswerRequest;
import com.quizplatform.dto.SubmitQuizRequest;
import com.quizplatform.entity.*;
import com.quizplatform.enums.AttemptStatus;
import com.quizplatform.enums.QuizStatus;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final AnswerRepository answerRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final UserRepository userRepository;

    /** Starts a new attempt. Enforces publish status and max-attempts server-side. */
    @Transactional
    public Attempt startAttempt(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        if (quiz.getStatus() != QuizStatus.PUBLISHED) {
            throw new BadRequestException("This quiz is not available to attempt");
        }

        long previousAttempts = attemptRepository.countByQuizIdAndUserId(quizId, userId);
        if (previousAttempts >= quiz.getMaxAttempts()) {
            throw new BadRequestException("You have reached the maximum number of attempts for this quiz");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        Attempt attempt = Attempt.builder()
                .quiz(quiz)
                .user(user)
                .status(AttemptStatus.IN_PROGRESS)
                .startedAt(now)
                .expiresAt(now.plusMinutes(quiz.getDuration()))
                .build();

        return attemptRepository.save(attempt);
    }

    /**
     * Submits and scores a quiz attempt. All scoring happens here on the backend;
     * the frontend never determines correctness or the final score.
     */
    @Transactional
    public Attempt submitAttempt(Long attemptId, Long userId, SubmitQuizRequest request) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new BadRequestException("This attempt does not belong to you");
        }
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("This attempt has already been submitted");
        }

        Quiz quiz = attempt.getQuiz();
        List<Question> questions = questionRepository.findByQuizId(quiz.getId());

        // Build a lookup of questionId -> selectedOptionId from the student's submission
        Map<Long, Long> submitted = new HashMap<>();
        if (request.getAnswers() != null) {
            for (SubmitAnswerRequest ans : request.getAnswers()) {
                if (ans.getQuestionId() != null) {
                    submitted.put(ans.getQuestionId(), ans.getSelectedOptionId());
                }
            }
        }

        int correct = 0, incorrect = 0, unanswered = 0;
        double totalMarks = 0, obtainedMarks = 0;

        for (Question question : questions) {
            totalMarks += question.getMarks();
            Long selectedOptionId = submitted.get(question.getId());

            Option selectedOption = null;
            boolean isCorrect = false;

            if (selectedOptionId == null) {
                unanswered++;
            } else {
                selectedOption = optionRepository.findById(selectedOptionId).orElse(null);
                // Validate the option actually belongs to this question (prevent tampering)
                if (selectedOption != null && selectedOption.getQuestion().getId().equals(question.getId())) {
                    isCorrect = Boolean.TRUE.equals(selectedOption.getIsCorrect());
                    if (isCorrect) {
                        correct++;
                        obtainedMarks += question.getMarks();
                    } else {
                        incorrect++;
                    }
                } else {
                    // invalid/tampered option id -> treat as unanswered
                    unanswered++;
                    selectedOption = null;
                }
            }

            Answer answer = Answer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedOption(selectedOption)
                    .isCorrect(isCorrect)
                    .build();
            answerRepository.save(answer);
        }

        double percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100.0 : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0;

        LocalDateTime now = LocalDateTime.now();
        long timeTakenSeconds = Duration.between(attempt.getStartedAt(), now).getSeconds();

        attempt.setCorrectAnswers(correct);
        attempt.setIncorrectAnswers(incorrect);
        attempt.setUnanswered(unanswered);
        attempt.setScore(obtainedMarks);
        attempt.setPercentage(percentage);
        attempt.setTimeTaken(timeTakenSeconds);
        attempt.setCompletedAt(now);
        attempt.setStatus(percentage >= quiz.getPassingScore() ? AttemptStatus.PASSED : AttemptStatus.FAILED);

        return attemptRepository.save(attempt);
    }

    /** Auto-submits an expired attempt with whatever was recorded (used defensively). */
    @Transactional
    public Attempt autoSubmitIfExpired(Long attemptId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS && LocalDateTime.now().isAfter(attempt.getExpiresAt())) {
            return submitAttempt(attemptId, attempt.getUser().getId(), new SubmitQuizRequest());
        }
        return attempt;
    }

    public List<Attempt> getUserAttempts(Long userId) {
        return attemptRepository.findByUserIdOrderByStartedAtDesc(userId);
    }

    public Attempt getById(Long id) {
        return attemptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
    }

    public List<Answer> getAttemptAnswers(Long attemptId) {
        return answerRepository.findByAttemptId(attemptId);
    }

    public List<Attempt> getAllAttempts() {
        return attemptRepository.findAllByOrderByStartedAtDesc();
    }

    /** Returns quiz questions WITHOUT correct-answer info, safe to send to a student mid-attempt. */
    public List<QuestionPublicResponse> getSanitizedQuestions(Long quizId) {
        List<Question> questions = questionRepository.findByQuizId(quizId);
        return questions.stream().map(q -> QuestionPublicResponse.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .marks(q.getMarks())
                .difficulty(q.getDifficulty())
                .options(q.getOptions().stream()
                        .map(o -> OptionPublicResponse.builder()
                                .id(o.getId())
                                .optionText(o.getOptionText())
                                .build())
                        .toList())
                .build()
        ).toList();
    }
}
