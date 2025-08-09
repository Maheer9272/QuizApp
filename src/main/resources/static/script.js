// API Base URL - Update this to match your Spring Boot server
const API_BASE_URL = 'http://localhost:8080';

// Global variables
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizQuestions = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showSection('home');
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Create Quiz Form
    document.getElementById('create-quiz-form').addEventListener('submit', handleCreateQuiz);

    // Add Question Form
    document.getElementById('add-question-form').addEventListener('submit', handleAddQuestion);
}

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Load data for specific sections
    if (sectionId === 'admin') {
        loadAllQuestions();
    }
}

function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabId).classList.add('active');

    // Add active class to clicked tab button
    event.target.classList.add('active');
}

// Quiz creation functions
async function handleCreateQuiz(event) {
    event.preventDefault();

    const title = document.getElementById('quiz-title').value;
    const category = document.getElementById('quiz-category').value;
    const numQuestions = document.getElementById('num-questions').value;

    try {
        showLoading('Creating quiz...');

        const response = await fetch(`${API_BASE_URL}/quiz/create?category=${category}&numQ=${numQuestions}&title=${encodeURIComponent(title)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const result = await response.text();
            showSuccess('Quiz created successfully!');

            // Extract quiz ID from response (assuming it returns something like "Quiz created with ID: 123")
            const quizIdMatch = result.match(/ID:\s*(\d+)/);
            if (quizIdMatch) {
                const quizId = parseInt(quizIdMatch[1]);
                loadQuiz(quizId, title);
            } else {
                showError('Quiz created but unable to load. Please try again.');
            }
        } else {
            throw new Error('Failed to create quiz');
        }
    } catch (error) {
        console.error('Error creating quiz:', error);
        showError('Failed to create quiz. Please try again.');
    }
}

async function loadQuiz(quizId, title) {
    try {
        showLoading('Loading quiz questions...');

        const response = await fetch(`${API_BASE_URL}/quiz/get/${quizId}`);

        if (response.ok) {
            const questions = await response.json();
            startQuiz(quizId, title, questions);
        } else {
            throw new Error('Failed to load quiz questions');
        }
    } catch (error) {
        console.error('Error loading quiz:', error);
        showError('Failed to load quiz questions. Please try again.');
    }
}

function startQuiz(quizId, title, questions) {
    currentQuiz = { id: quizId, title: title };
    quizQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);

    document.getElementById('quiz-title-display').textContent = title;

    showSection('take-quiz');
    displayQuestion();
}

function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const totalQuestions = quizQuestions.length;

    // Update progress
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;

    // Display question
    document.getElementById('question-text').textContent = question.questionTitle;

    // Display options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    [question.option1, question.option2, question.option3, question.option4].forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index, optionElement));

        // Restore previous selection
        if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }

        optionsContainer.appendChild(optionElement);
    });

    // Update button states
    document.getElementById('prev-btn').style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    document.getElementById('next-btn').style.display = currentQuestionIndex < totalQuestions - 1 ? 'block' : 'none';
    document.getElementById('submit-btn').style.display = currentQuestionIndex === totalQuestions - 1 ? 'block' : 'none';
}

function selectOption(optionIndex, optionElement) {
    // Remove previous selection
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));

    // Add selection to clicked option
    optionElement.classList.add('selected');

    // Store user answer
    userAnswers[currentQuestionIndex] = optionIndex;
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

async function submitQuiz() {
    if (userAnswers.includes(null)) {
        showError('Please answer all questions before submitting.');
        return;
    }

    try {
        showLoading('Calculating your score...');

        // Format responses for API
        const responses = userAnswers.map((answerIndex, questionIndex) => {
            const question = quizQuestions[questionIndex];
            const options = [question.option1, question.option2, question.option3, question.option4];

            return {
                id: question.id,
                response: options[answerIndex]
            };
        });

        const response = await fetch(`${API_BASE_URL}/quiz/submit/${currentQuiz.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(responses)
        });

        if (response.ok) {
            const score = await response.json();
            displayResults(score);
        } else {
            throw new Error('Failed to submit quiz');
        }
    } catch (error) {
        console.error('Error submitting quiz:', error);
        showError('Failed to submit quiz. Please try again.');
    }
}

function displayResults(score) {
    const totalQuestions = quizQuestions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    document.getElementById('score-text').textContent = `${percentage}%`;
    document.getElementById('score-message').textContent =
        `You scored ${score} out of ${totalQuestions} questions correctly!`;

    showSection('results');
}

// Admin functions
async function handleAddQuestion(event) {
    event.preventDefault();

    const questionData = {
        questionTitle: document.getElementById('question-title').value,
        option1: document.getElementById('option1').value,
        option2: document.getElementById('option2').value,
        option3: document.getElementById('option3').value,
        option4: document.getElementById('option4').value,
        rightAnswer: document.getElementById(document.getElementById('correct-answer').value).value,
        category: document.getElementById('question-category').value,
        difficultylevel: document.getElementById('difficulty-level').value
    };

    try {
        showLoading('Adding question...');

        const response = await fetch(`${API_BASE_URL}/admin/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData)
        });

        if (response.ok) {
            const result = await response.text();
            showSuccess('Question added successfully!');
            document.getElementById('add-question-form').reset();
            loadAllQuestions();
        } else {
            throw new Error('Failed to add question');
        }
    } catch (error) {
        console.error('Error adding question:', error);
        showError('Failed to add question. Please try again.');
    }
}

async function loadAllQuestions() {
    try {
        showLoading('Loading questions...');

        const response = await fetch(`${API_BASE_URL}/admin/allquestions`);

        if (response.ok) {
            const questions = await response.json();
            displayQuestions(questions);
        } else {
            throw new Error('Failed to load questions');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showError('Failed to load questions. Please try again.');
    }
}

function displayQuestions(questions) {
    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';

    if (questions.length === 0) {
        questionsList.innerHTML = '<p>No questions found.</p>';
        return;
    }

    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.innerHTML = `
            <h4>${question.questionTitle}</h4>
            <p><strong>Options:</strong> ${question.option1}, ${question.option2}, ${question.option3}, ${question.option4}</p>
            <p><strong>Correct Answer:</strong> ${question.rightAnswer}</p>
            <div class="question-meta">
                <div>
                    <span class="question-category">${question.category}</span>
                    <span class="question-difficulty">${question.difficultylevel}</span>
                </div>
                <button class="delete-btn" onclick="deleteQuestion(${question.id})">Delete</button>
            </div>
        `;
        questionsList.appendChild(questionElement);
    });
}

async function filterQuestions() {
    const category = document.getElementById('category-filter').value;

    if (!category) {
        loadAllQuestions();
        return;
    }

    try {
        showLoading('Filtering questions...');

        const response = await fetch(`${API_BASE_URL}/admin/allquestions/${category}`);

        if (response.ok) {
            const questions = await response.json();
            displayQuestions(questions);
        } else {
            throw new Error('Failed to filter questions');
        }
    } catch (error) {
        console.error('Error filtering questions:', error);
        showError('Failed to filter questions. Please try again.');
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }

    try {
        showLoading('Deleting question...');

        const response = await fetch(`${API_BASE_URL}/admin/delete/${questionId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showSuccess('Question deleted successfully!');
            loadAllQuestions();
        } else {
            throw new Error('Failed to delete question');
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        showError('Failed to delete question. Please try again.');
    }
}

// Utility functions
function showLoading(message) {
    // Remove existing messages
    removeMessages();

    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.textContent = message;
    loadingElement.id = 'loading-message';

    document.querySelector('.section.active').prepend(loadingElement);
}

function showError(message) {
    removeMessages();

    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.textContent = message;
    errorElement.id = 'error-message';

    document.querySelector('.section.active').prepend(errorElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    removeMessages();

    const successElement = document.createElement('div');
    successElement.className = 'success';
    successElement.textContent = message;
    successElement.id = 'success-message';

    document.querySelector('.section.active').prepend(successElement);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.remove();
        }
    }, 3000);
}

function removeMessages() {
    const messages = document.querySelectorAll('#loading-message, #error-message, #success-message');
    messages.forEach(message => message.remove());
}