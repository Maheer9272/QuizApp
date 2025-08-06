package com.maheer9272.quizapp.controller;

import com.maheer9272.quizapp.model.Question;
import com.maheer9272.quizapp.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(
        name = "Question Management",
        description = "APIs for managing quiz questions in the admin panel"
)
@RestController()
@RequestMapping("/admin")
public class QuestionController {

    private final QuestionService questionService;
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/add")
    @Operation(
            summary = "Add a new question",
            description = "Adds a new question to the quiz application. The question details are provided in the request body."
    )
    public ResponseEntity<String> addQuestion(@RequestBody Question question) {
        String result = questionService.addQuestion(question);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/allquestions")
    @Operation(
            summary = "Retrieve all questions",
            description = "Fetches a list of all questions available in the quiz application from the database."
    )
    public ResponseEntity<List<Question>> getALllQuestions(){
        return questionService.getAllQuestions();
    }

    @Operation(
            summary = "Retrieve questions by category",
            description = "Fetches a list of questions filtered by the specified category."
    )
    @GetMapping("/allquestions/{category}")
    public List<Question> getQuestionByCategory(@PathVariable String category){
        return questionService.getQuestionByCategory(category);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(
            summary = "Delete a question",
            description = "Deletes a question from the quiz application based on the provided question ID."
    )
    public ResponseEntity<String> deleteQuestion(@PathVariable int id) {
        String result = questionService.deleteQuestion(id);
        if (result.contains("not found")) {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
