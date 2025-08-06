package com.maheer9272.quizapp;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
        info = @Info(
                title = "Quiz App REST API Documentation",
                description = "QuizApp is a robust and modular Java-based application designed to deliver interactive quizzes to users.",
                contact = @Contact(
                        name = "Maheer Shaik",
                        email = "maheershaik.connect@gmail.com"
                )
        )
)
public class QuizAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuizAppApplication.class, args);
	}
}
