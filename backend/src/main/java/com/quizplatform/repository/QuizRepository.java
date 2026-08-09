package com.quizplatform.repository;

import com.quizplatform.entity.Quiz;
import com.quizplatform.enums.QuizStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByStatus(QuizStatus status);
    long countByStatus(QuizStatus status);
    List<Quiz> findByCategoryId(Long categoryId);
}
