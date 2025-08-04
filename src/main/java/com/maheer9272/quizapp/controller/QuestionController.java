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
    public String addQuestion(@RequestBody Question question){
        return questionService.addQuestion(question);
    }

    @DeleteMapping("/delete/{id}")
        public String deleteQuestion(@PathVariable int id){
        return questionService.deleteQuestion(id);
    }
}
