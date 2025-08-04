package com.maheer9272.quizapp.repository;

import com.maheer9272.quizapp.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizServiceRepository extends JpaRepository<Quiz,Integer> {
}
