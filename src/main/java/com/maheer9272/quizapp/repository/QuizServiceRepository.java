package com.maheer9272.quizapp.repository;

import com.maheer9272.quizapp.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizServiceRepository extends JpaRepository<Quiz,Integer> {

    @Query("SELECT DISTINCT q FROM Quiz q JOIN q.questions quest WHERE quest.id = :questionId")
    List<Quiz> findQuizzesContainingQuestion(@Param("questionId") Integer questionId);
}
