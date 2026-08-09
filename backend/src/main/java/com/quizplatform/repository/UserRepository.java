package com.quizplatform.repository;

import com.quizplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("select count(u) from User u where u.role = com.quizplatform.enums.Role.STUDENT")
    long countStudents();

    @Query("select count(u) from User u where u.role = com.quizplatform.enums.Role.ADMIN")
    long countAdmins();
}
