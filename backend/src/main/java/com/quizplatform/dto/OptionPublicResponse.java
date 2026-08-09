package com.quizplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Option shape sent to students while a quiz is IN PROGRESS - never reveals isCorrect. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionPublicResponse {
    private Long id;
    private String optionText;
}
