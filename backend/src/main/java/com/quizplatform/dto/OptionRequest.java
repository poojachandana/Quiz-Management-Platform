package com.quizplatform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OptionRequest {
    private Long id;
    @NotBlank
    private String optionText;
    private Boolean isCorrect;
}
