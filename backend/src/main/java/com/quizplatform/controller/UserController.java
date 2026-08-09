package com.quizplatform.controller;

import com.quizplatform.dto.UserStatusRequest;
import com.quizplatform.entity.User;
import com.quizplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAll(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.getAllStudents(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getStudentProfile(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User updates) {
        return ResponseEntity.ok(userService.updateUser(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<User> updateStatus(@PathVariable Long id, @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(userService.updateStatus(id, request.getStatus()));
    }
}
