package com.quizplatform.entity;

import com.quizplatform.enums.AttemptStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    private Double score = 0.0;

    @Builder.Default
    private Double percentage = 0.0;

    @Builder.Default
    private Integer correctAnswers = 0;

    @Builder.Default
    private Integer incorrectAnswers = 0;

    @Builder.Default
    private Integer unanswered = 0;

    /** time taken in seconds */
    private Long timeTaken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        if (this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
    }
}
