package com.quizplatform.dto;

import com.quizplatform.enums.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Question shape sent to students while a quiz is IN PROGRESS - never reveals correct answer or explanation. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionPublicResponse {
    private Long id;
    private String questionText;
    private Double marks;
    private Difficulty difficulty;
    private List<OptionPublicResponse> options;
}
