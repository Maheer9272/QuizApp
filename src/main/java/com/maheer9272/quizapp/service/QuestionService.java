package com.maheer9272.quizapp.service;

import com.maheer9272.quizapp.model.Question;
import com.maheer9272.quizapp.repository.QuestionServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {
    @Autowired
    private final QuestionServiceRepository questionServiceRepository;
    @Autowired
    private QuestionRepository questionRepository;

    public QuestionService(QuestionServiceRepository questionServiceRepository) {
        this.questionServiceRepository = questionServiceRepository;
    }

    public ResponseEntity<List<Question>> getAllQuestions() {
        try {
            return new ResponseEntity<>(questionServiceRepository.findAll(), HttpStatus.OK);
        }catch (ResponseStatusException e){
            e.printStackTrace();
        }
        return new ResponseEntity<>(new ArrayList<>(), HttpStatus.BAD_REQUEST);
    }

    public List<Question> getQuestionByCategory(String category) {
        return questionServiceRepository.findByCategory(category);
    }

    public String addQuestion(Question question) {
        questionServiceRepository.save(question);
        return "Success";
    }

    public String deleteQuestion(int id) {
        questionServiceRepository.deleteById(id);
        return "Successfully deleted";
    }

}
