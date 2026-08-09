package com.quizplatform.repository;

import com.quizplatform.entity.Attempt;
import com.quizplatform.enums.AttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findByUserIdOrderByStartedAtDesc(Long userId);
    List<Attempt> findByQuizIdAndUserId(Long quizId, Long userId);
    long countByQuizIdAndUserId(Long quizId, Long userId);
    long countByQuizId(Long quizId);
    List<Attempt> findAllByOrderByStartedAtDesc();
    long countByStatus(AttemptStatus status);

    @org.springframework.data.jpa.repository.Query(
        "select a from Attempt a where a.user.id = :userId order by a.percentage desc")
    List<Attempt> findByUserOrderByPercentageDesc(Long userId);
}
