package com.maheer9272.quizapp.service;

import com.maheer9272.quizapp.model.Question;
import com.maheer9272.quizapp.repository.QuestionServiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

    private final QuestionServiceRepository questionServiceRepository;

    public QuestionService(QuestionServiceRepository questionServiceRepository) {
        this.questionServiceRepository = questionServiceRepository;
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

    public String deleteQuestion(int id) {
        questionServiceRepository.deleteById(id);
        return "Successfully deleted";
    }

}
