package com.quizplatform.dto;

import lombok.Data;

@Data
public class SubmitAnswerRequest {
    private Long questionId;
    private Long selectedOptionId; // null if unanswered
}
