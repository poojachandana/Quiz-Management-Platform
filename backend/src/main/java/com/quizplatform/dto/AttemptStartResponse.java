package com.quizplatform.dto;

import com.quizplatform.entity.Attempt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptStartResponse {
    private Attempt attempt;
    private List<QuestionPublicResponse> questions;
}
