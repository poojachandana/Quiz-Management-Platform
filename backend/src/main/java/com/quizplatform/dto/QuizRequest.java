package com.quizplatform.dto;

import com.quizplatform.enums.Difficulty;
import com.quizplatform.enums.QuizStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizRequest {
    @NotBlank
    private String title;
    private String description;
    private Long categoryId;
    private Difficulty difficulty;

    @NotNull
    private Integer duration;

    @NotNull
    private Double passingScore;

    private Integer maxAttempts;
    private QuizStatus status;
    private String thumbnail;
}
