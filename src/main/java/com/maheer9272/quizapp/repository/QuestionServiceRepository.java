package com.maheer9272.quizapp.repository;

import com.maheer9272.quizapp.model.Question;
import com.maheer9272.quizapp.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionServiceRepository extends JpaRepository<Question,Integer> {

    @Query("SELECT q FROM Question q WHERE LOWER(q.category) = LOWER(:category)")
    List<Question> findByCategory(String category);

    @Query(value = "SELECT * FROM question q WHERE LOWER(q.category) = LOWER(:category) ORDER BY RANDOM() LIMIT :numQ", nativeQuery = true)
    List<Question> findRandomQuestionsByCategory(String category, int numQ);

    @Query("SELECT DISTINCT q FROM Quiz q JOIN FETCH q.questions WHERE q.id = :id")
    Optional<Quiz> findByIdWithQuestions(@Param("id") Integer id);

    @Query("SELECT DISTINCT q FROM Quiz q JOIN q.questions quest WHERE quest.id = :questionId")
    List<Quiz> findQuizzesContainingQuestion(@Param("questionId") Integer questionId);
}
