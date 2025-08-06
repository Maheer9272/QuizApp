package com.maheer9272.quizapp.controller;

import com.maheer9272.quizapp.model.QuestionWrapper;
import com.maheer9272.quizapp.model.Response;
import com.maheer9272.quizapp.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(
        name = "Quiz Management",
        description = "APIs for creating and managing quizzes in the quiz application")
@RestController
@RequestMapping("/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @Operation(
            summary = "Create a new quiz",
            description = "Creates a new quiz with the of random questions form a specified category, number of questions, and title."
    )
    @PostMapping("/create")
    public ResponseEntity<String> createQuiz(@RequestParam String category,@RequestParam int numQ,@RequestParam String title){
        return quizService.createQuiz(category,numQ,title);
    }

    @Operation(
            summary = "Retrieve quiz questions",
            description = "Fetches the list of questions for a quiz identified by the provided quiz ID."
    )
    @GetMapping("/get/{id}")
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(@PathVariable int id){
        return quizService.getQuizQuestions(id);
    }

    @Operation(
            summary = "Submit quiz responses",
            description = "Submits user responses for a quiz identified by the provided quiz ID and calculates the score."
    )
    @PostMapping("submit/{id}")
    public ResponseEntity<Integer>scrore(@PathVariable Integer id, @RequestBody List<Response> responses){
        return quizService.calculateResult(id,responses);
    }
}
