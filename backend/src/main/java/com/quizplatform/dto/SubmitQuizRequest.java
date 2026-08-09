package com.quizplatform.dto;

import lombok.Data;

import java.util.List;

@Data
public class SubmitQuizRequest {
    private List<SubmitAnswerRequest> answers;
}
