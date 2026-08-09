package com.quizplatform.dto;

import com.quizplatform.enums.UserStatus;
import lombok.Data;

@Data
public class UserStatusRequest {
    private UserStatus status;
}
