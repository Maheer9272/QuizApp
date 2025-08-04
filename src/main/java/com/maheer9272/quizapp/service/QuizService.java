package com.maheer9272.quizapp.service;


import com.maheer9272.quizapp.model.Question;
import com.maheer9272.quizapp.model.QuestionWrapper;
import com.maheer9272.quizapp.model.Quiz;
import com.maheer9272.quizapp.repository.QuestionServiceRepository;
import com.maheer9272.quizapp.repository.QuizServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {
    @Autowired
    private final QuizServiceRepository quizServiceRepository;
    @Autowired
    private final QuestionServiceRepository questionServiceRepository;

    public QuizService(QuizServiceRepository quizServiceRepository, QuestionServiceRepository questionServiceRepository) {
        this.quizServiceRepository = quizServiceRepository;
        this.questionServiceRepository = questionServiceRepository;
    }


    public ResponseEntity<String> createQuiz(String category, int numQ, String title) {
        List<Question> questions=questionServiceRepository.findRandomQuestionsByCategory(category,numQ);
        Quiz quiz=new Quiz();
        quiz.setTitle(title);
        quiz.setQuestions(questions);
        quizServiceRepository.save(quiz);
        return new ResponseEntity<>("It is success", HttpStatus.CREATED);
    }

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(int id) {
        Optional<Quiz> quiz = quizServiceRepository.findById(id);
        List<Question> questionsFromDB = quiz.get().getQuestions();
        if (questionsFromDB == null || questionsFromDB.isEmpty()) {
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.OK);
        }
        List<QuestionWrapper> questionsForUser = new ArrayList<>();
        for (Question q : questionsFromDB) {
            QuestionWrapper qw = new QuestionWrapper(q.getId(),
                    q.getOption1(),
                    q.getOption2(),
                    q.getOption3(),
                    q.getOption4(),
                    q.getQuestionTitle());
            questionsForUser.add(qw);
        }
        return new ResponseEntity<>(questionsForUser, HttpStatus.OK);
    }
}