package com.maheer9272.quizapp.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(
        name = "Question sent to the user for attempting the quiz",
        description = "Question sent to the user for attempting the quiz without the right answer and the id"
)
public class QuestionWrapper {
    private Integer id;
    private String questionTitle;
    private String option1;
    private String option2;
    private String option3;
    private String option4;

    public QuestionWrapper(Integer id, String option1, String option2, String option3, String option4, String questionTitle) {
        this.id = id;
        this.option4 = option4;
        this.option3 = option3;
        this.option2 = option2;
        this.option1 = option1;
        this.questionTitle = questionTitle;
    }
}
