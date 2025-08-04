package com.maheer9272.quizapp.controller;

import com.maheer9272.quizapp.model.Question;
import com.maheer9272.quizapp.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class QuestionController {

    @Autowired
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/allquestions")
    public ResponseEntity<List<Question>> getALllQuestions(){
        return questionService.getAllQuestions();
    }


    @GetMapping("/allquestions/{category}")
    public List<Question> getQuestionByCategory(@PathVariable String category){
        return questionService.getQuestionByCategory(category);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addQuestion(@RequestBody Question question) {
        String result = questionService.addQuestion(question);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable int id) {
        String result = questionService.deleteQuestion(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
