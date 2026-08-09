package com.quizplatform.service;

import com.quizplatform.dto.OptionRequest;
import com.quizplatform.dto.QuestionRequest;
import com.quizplatform.entity.Option;
import com.quizplatform.entity.Question;
import com.quizplatform.entity.Quiz;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.repository.QuestionRepository;
import com.quizplatform.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public List<Question> getByQuiz(Long quizId) {
        return questionRepository.findByQuizId(quizId);
    }

    public Question getById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
    }

    public Question create(Long quizId, QuestionRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        validateOptions(request);

        Question question = Question.builder()
                .quiz(quiz)
                .questionText(request.getQuestionText())
                .marks(request.getMarks() != null ? request.getMarks() : 1.0)
                .explanation(request.getExplanation())
                .difficulty(request.getDifficulty())
                .build();

        List<Option> options = new ArrayList<>();
        for (OptionRequest optionRequest : request.getOptions()) {
            options.add(Option.builder()
                    .question(question)
                    .optionText(optionRequest.getOptionText())
                    .isCorrect(Boolean.TRUE.equals(optionRequest.getIsCorrect()))
                    .build());
        }
        question.setOptions(options);

        return questionRepository.save(question);
    }

    public Question update(Long id, QuestionRequest request) {
        Question question = getById(id);
        validateOptions(request);

        question.setQuestionText(request.getQuestionText());
        question.setMarks(request.getMarks() != null ? request.getMarks() : 1.0);
        question.setExplanation(request.getExplanation());
        question.setDifficulty(request.getDifficulty());

        question.getOptions().clear();
        for (OptionRequest optionRequest : request.getOptions()) {
            question.getOptions().add(Option.builder()
                    .question(question)
                    .optionText(optionRequest.getOptionText())
                    .isCorrect(Boolean.TRUE.equals(optionRequest.getIsCorrect()))
                    .build());
        }

        return questionRepository.save(question);
    }

    public void delete(Long id) {
        Question question = getById(id);
        questionRepository.delete(question);
    }

    private void validateOptions(QuestionRequest request) {
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new BadRequestException("A question requires at least 2 options");
        }
        long correctCount = request.getOptions().stream()
                .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                .count();
        if (correctCount != 1) {
            throw new BadRequestException("A question must have exactly one correct answer");
        }
    }
}
