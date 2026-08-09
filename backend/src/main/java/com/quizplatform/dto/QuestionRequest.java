package com.quizplatform.dto;

import com.quizplatform.enums.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {
    @NotBlank
    private String questionText;
    private Double marks;
    private String explanation;
    private Difficulty difficulty;

    @NotEmpty(message = "At least 2 options are required")
    @Valid
    private List<OptionRequest> options;
}
