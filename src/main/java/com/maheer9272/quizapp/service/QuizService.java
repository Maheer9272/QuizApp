package com.maheer9272.quizapp.service;


import com.maheer9272.quizapp.model.Question;
import com.maheer9272.quizapp.model.QuestionWrapper;
import com.maheer9272.quizapp.model.Quiz;
import com.maheer9272.quizapp.repository.QuestionServiceRepository;
import com.maheer9272.quizapp.repository.QuizServiceRepository;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {
    private final QuizServiceRepository quizServiceRepository;
    private final QuestionServiceRepository questionServiceRepository;

    public QuizService(QuizServiceRepository quizServiceRepository, QuestionServiceRepository questionServiceRepository) {
        this.quizServiceRepository = quizServiceRepository;
        this.questionServiceRepository = questionServiceRepository;
    }


    public ResponseEntity<String> createQuiz(String category, int numQ, String title) {
        List<Question> questions = questionServiceRepository.findRandomQuestionsByCategory(category, numQ);
        if (questions.isEmpty()) {
            return new ResponseEntity<>("Not enough questions available in category: " + category, HttpStatus.BAD_REQUEST);
        }
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setQuestions(questions);
        quizServiceRepository.save(quiz);
        return new ResponseEntity<>("Quiz created successfully", HttpStatus.CREATED);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(int id) {
        Optional<Quiz> quiz = quizServiceRepository.findById(id);
        if (quiz.isEmpty()) {
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.NOT_FOUND);
        }
        Hibernate.initialize(quiz.get().getQuestions());
        List<Question> questionsFromDB = quiz.get().getQuestions();
        List<QuestionWrapper> questionsForUser = new ArrayList<>();
        for (Question q : questionsFromDB) {
            QuestionWrapper qw = new QuestionWrapper(q.getId(), q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4(), q.getQuestionTitle());
            questionsForUser.add(qw);
        }
        return new ResponseEntity<>(questionsForUser, HttpStatus.OK);
    }

}