package com.quizplatform.service;

import com.quizplatform.entity.Attempt;
import com.quizplatform.entity.User;
import com.quizplatform.enums.AttemptStatus;
import com.quizplatform.enums.UserStatus;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.repository.AttemptRepository;
import com.quizplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AttemptRepository attemptRepository;

    public List<User> getAllStudents(String search) {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.quizplatform.enums.Role.STUDENT)
                .toList();

        if (search == null || search.isBlank()) {
            return students;
        }
        String q = search.toLowerCase();
        return students.stream()
                .filter(u -> u.getName().toLowerCase().contains(q) || u.getEmail().toLowerCase().contains(q))
                .toList();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public Map<String, Object> getStudentProfile(Long id) {
        User user = getById(id);
        List<Attempt> attempts = attemptRepository.findByUserIdOrderByStartedAtDesc(id);

        double avgScore = attempts.stream()
                .filter(a -> a.getStatus() != AttemptStatus.IN_PROGRESS)
                .mapToDouble(Attempt::getPercentage)
                .average().orElse(0.0);

        double highestScore = attempts.stream()
                .filter(a -> a.getStatus() != AttemptStatus.IN_PROGRESS)
                .mapToDouble(Attempt::getPercentage)
                .max().orElse(0.0);

        return Map.of(
                "user", user,
                "quizzesAttempted", attempts.size(),
                "averageScore", Math.round(avgScore * 100.0) / 100.0,
                "highestScore", Math.round(highestScore * 100.0) / 100.0,
                "attempts", attempts
        );
    }

    public User updateUser(Long id, User updates) {
        User user = getById(id);
        if (updates.getName() != null) user.setName(updates.getName());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getById(id);
        userRepository.delete(user);
    }

    public User updateStatus(Long id, UserStatus status) {
        User user = getById(id);
        user.setStatus(status);
        return userRepository.save(user);
    }
}
