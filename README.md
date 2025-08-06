# QuizApp

QuizApp is a robust and modular Java-based application designed to deliver interactive quizzes to users. Built using the Spring Boot framework and JPA for data management, it provides RESTful APIs for both quiz-taking and administrative question management. The application is suitable for educational platforms, training sites.

## Features

- **Quiz Creation:** Create quizzes by specifying a category, number of questions, and a title. The system randomly selects questions from the chosen category.
- **Quiz Participation:** Users can retrieve quiz questions and submit their responses to receive instant scoring.
- **Question Management (Admin Panel):**
  - Add new questions with multiple options, correct answer, difficulty level, and category.
  - Fetch all questions or filter them by category.
  - Delete questions from the database.
- **RESTful APIs:** All core functionalities are exposed via well-documented REST endpoints using Swagger/OpenAPI.
- **Modular Architecture:** Separation of concerns between services, controllers, and data models for easy maintenance and extension.

## Tech Stack

- **Java 17+**
- **Spring Boot**
- **Spring Data JPA (Hibernate)**
- **Swagger/OpenAPI** for API documentation

## Main Components

### Controllers

- `QuizController`: Handles endpoints for creating quizzes, retrieving questions, and submitting answers.
- `QuestionController`: Handles endpoints for adding, fetching, and deleting quiz questions (admin functionality).

### Services

- `QuizService`: Business logic for quiz creation, question retrieval, and result calculation.
- `QuestionService`: Manages question operations, including CRUD and category filtering.

### Models

- `Quiz`: Represents a quiz with a title and a list of questions.
- `Question`: Represents a quiz question, including options, correct answer, difficulty, and category.
- `QuestionWrapper`: Used to present questions to users without exposing answers.
- `Response`: Used to encapsulate user-submitted answers.

### Repositories

- `QuizServiceRepository`: JPA repository for `Quiz` entities.
- `QuestionServiceRepository`: JPA repository for `Question` entities.

## Example REST API Endpoints

### Quiz Endpoints

- `POST /quiz/create`  
  Create a new quiz.  
  *Parameters*: `category`, `numQ`, `title`

- `GET /quiz/get/{id}`  
  Retrieve quiz questions by quiz ID.

- `POST /quiz/submit/{id}`  
  Submit user responses for a quiz and get the score.

### Question Endpoints (Admin)

- `POST /admin/add`  
  Add a new question.

- `GET /admin/allquestions`  
  Fetch all questions.

- `GET /admin/category/{category}`  
  Fetch questions by category.

- `DELETE /admin/delete/{id}`  
  Delete a question by ID.

## Contact

Created and maintained by [Maheer Shaik](mailto:maheershaik.connect@gmail.com).

