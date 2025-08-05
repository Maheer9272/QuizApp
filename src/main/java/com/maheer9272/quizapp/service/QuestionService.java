package com.maheer9272.quizapp.service;

import com.maheer9272.quizapp.model.Question;
import com.maheer9272.quizapp.model.QuestionWrapper;
import com.maheer9272.quizapp.model.Quiz;
import com.maheer9272.quizapp.repository.QuestionServiceRepository;
import com.maheer9272.quizapp.repository.QuizServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
    @Autowired
    private final QuestionServiceRepository questionServiceRepository;
    @Autowired
    private final QuizServiceRepository quizServiceRepository;

    public QuestionService(QuestionServiceRepository questionServiceRepository, QuizServiceRepository quizServiceRepository) {
        this.questionServiceRepository = questionServiceRepository;
        this.quizServiceRepository = quizServiceRepository;
    }

    public ResponseEntity<List<Question>> getAllQuestions() {
        try {
            return new ResponseEntity<>(questionServiceRepository.findAll(), HttpStatus.OK);
        }catch (ResponseStatusException e){
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public List<Question> getQuestionByCategory(String category) {
        return questionServiceRepository.findByCategory(category);
    }

    public String addQuestion(Question question) {
        questionServiceRepository.save(question);
        return "Success";
    }

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(int id) {
        Optional<Quiz> quiz = quizServiceRepository.findByIdWithQuestions(id);
        if (quiz.isEmpty()) {
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.NOT_FOUND);
        }
        List<Question> questionsFromDB = quiz.get().getQuestions();
        List<QuestionWrapper> questionsForUser = new ArrayList<>();
        for (Question q : questionsFromDB) {
            QuestionWrapper qw = new QuestionWrapper(q.getId(), q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4(), q.getQuestionTitle());
            questionsForUser.add(qw);
        }
        return new ResponseEntity<>(questionsForUser, HttpStatus.OK);
    }

    @Transactional
    public String deleteQuestion(int id) {
        // Check if question exists
        Optional<Question> questionOpt = questionServiceRepository.findById(id);
        if (questionOpt.isEmpty()) {
            return "Question not found";
        }

        // Find all quizzes that contain this question
        List<Quiz> quizzesContainingQuestion = quizServiceRepository.findQuizzesContainingQuestion(id);

        // Remove the question from all quizzes
        for (Quiz quiz : quizzesContainingQuestion) {
            quiz.getQuestions().removeIf(q -> q.getId().equals(id));
            quizServiceRepository.save(quiz);
        }

        // Now safely delete the question
        questionServiceRepository.deleteById(id);

        // Return informative message
        if (!quizzesContainingQuestion.isEmpty()) {
            return "Question deleted and removed from " + quizzesContainingQuestion.size() + " quiz(s)";
        }
        return "Question deleted successfully";
    }
}
