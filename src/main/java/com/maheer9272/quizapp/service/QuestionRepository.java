package com.maheer9272.quizapp.service;

import com.maheer9272.quizapp.model.Question;
import org.springframework.data.repository.Repository;

interface QuestionRepository extends Repository<Question, Integer> {
}
