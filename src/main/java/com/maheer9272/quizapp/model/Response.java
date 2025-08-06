package com.maheer9272.quizapp.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;


@Data
@RequiredArgsConstructor
@Schema(
        name = "Getting the response form the user"
)
public class Response {
    private Integer id;
    private String response;

}
