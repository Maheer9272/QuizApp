// Robust SPA for QuizApp using same-origin API base
(() => {
    const API_BASE = window.location.origin;

    // State
    let currentQuizId = null;
    let questions = [];
    let answers = new Map(); // questionId -> selected value (option1..option4)
    let idx = 0;

    // Elements
    const $ = (id) => document.getElementById(id);
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // Tabs
    function showTab(tabId) {
        qsa('.tab').forEach(s => s.classList.remove('active'));
        qsa('.tab-btn').forEach(b => b.classList.remove('active'));
        const tab = $('#' + tabId);
        if (tab) tab.classList.add('active');
        const btn = qsa(`.tab-btn[data-tab="${tabId}"]`)[0];
        if (btn) btn.classList.add('active');
    }

    function initTabs() {
        qsa('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => showTab(btn.dataset.tab));
        });
    }

    // Helpers
    async function safeFetch(url, options = {}) {
        const res = await fetch(url, options);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`${res.status} ${res.statusText}: ${text}`);
        }
        return res;
    }

    function setLoading(el, msg) {
        if (el) { el.textContent = msg; el.classList.remove('error'); el.classList.remove('hidden'); }
    }
    function setError(el, msg) {
        if (el) { el.textContent = msg; el.classList.add('error'); el.classList.remove('hidden'); }
    }
    function clearStatus(...els) {
        els.forEach(el => el && (el.textContent = '', el.classList.remove('error')));
    }

    // Create Quiz
    async function handleCreateQuiz(e) {
        e.preventDefault();
        clearStatus($('create-quiz-result'));
        const title = $('quiz-title')?.value?.trim();
        const category = $('quiz-category')?.value?.trim();
        const numQ = parseInt($('num-questions')?.value || '0', 10);

        if (!title || !category || !numQ || numQ < 1) {
            setError($('create-quiz-result'), 'Please provide valid Title, Category and Number of Questions.');
            return;
        }
        setLoading($('create-quiz-result'), 'Creating quiz...');

        try {
            // Backend expects @RequestParam; send as query string on POST
            const url = `${API_BASE}/quiz/create?category=${encodeURIComponent(category)}&numQ=${encodeURIComponent(numQ)}&title=${encodeURIComponent(title)}`;
            const res = await safeFetch(url, { method: 'POST' });
            const text = await res.text();

            // Try to extract a numeric ID; fall back to showing the message
            const match = text.match(/(\d+)/);
            if (match) {
                currentQuizId = Number(match[1]);
                $('create-quiz-result').textContent = `Quiz created with ID ${currentQuizId}. Loading questions...`;
                await loadQuiz(currentQuizId, title);
                showTab('take-quiz');
            } else {
                $('create-quiz-result').textContent = text || 'Quiz created.';
            }
        } catch (err) {
            setError($('create-quiz-result'), `Failed to create quiz: ${err.message}`);
        }
    }

    // Load Quiz
    async function handleLoadQuiz(e) {
        e.preventDefault();
        clearStatus($('load-quiz-status'));
        const id = parseInt($('quiz-id')?.value || '0', 10);
        if (!id) {
            setError($('load-quiz-status'), 'Enter a valid Quiz ID.');
            return;
        }
        try {
            setLoading($('load-quiz-status'), 'Loading quiz...');
            await loadQuiz(id);
            $('load-quiz-status').textContent = `Quiz #${id} loaded.`;
            showTab('take-quiz');
        } catch (err) {
            setError($('load-quiz-status'), `Failed to load quiz: ${err.message}`);
        }
    }

    async function loadQuiz(id, titleFromCreate) {
        const res = await safeFetch(`${API_BASE}/quiz/get/${id}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No questions returned for this quiz.');
        }

        currentQuizId = id;
        questions = data;
        answers = new Map();
        idx = 0;

        // Title if available
        const titleEl = $('quiz-title-display');
        if (titleEl) titleEl.textContent = titleFromCreate || `Quiz #${id}`;

        $('quiz-loading')?.classList.add('hidden');
        $('quiz-error')?.classList.add('hidden');
        $('quiz-area')?.classList.remove('hidden');

        renderQuestion();
        updateNav();
    }

    function extractOptions(q) {
        // Try option1..option4
        const optKeys = ['option1', 'option2', 'option3', 'option4'].filter(k => q[k]);
        if (optKeys.length) {
            return optKeys.map(k => ({ key: k, text: q[k] }));
        }
        // Fallback: any keys starting with option
        const dynamic = Object.keys(q).filter(k => /^option/i.test(k)).map(k => ({ key: k, text: q[k] }));
        if (dynamic.length) return dynamic;
        // Last resort: array field
        if (Array.isArray(q.options)) {
            return q.options.map((text, i) => ({ key: `option${i + 1}`, text }));
        }
        return [];
    }

    function renderQuestion() {
        const q = questions[idx];
        if (!q) return;

        const qText = q.questionTitle || q.title || q.question || `Question ${idx + 1}`;
        $('question-text').textContent = qText;

        const options = extractOptions(q);
        const container = $('options-container');
        container.innerHTML = '';

        const selected = answers.get(q.id) || null;

        options.forEach(opt => {
            const id = `q${q.id}_${opt.key}`;
            const wrap = document.createElement('label');
            wrap.className = 'option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `q_${q.id}`;
            input.value = opt.key;
            input.id = id;
            if (selected === opt.key) input.checked = true;
            input.addEventListener('change', () => {
                answers.set(q.id, opt.key);
                updateNav();
            });

            const span = document.createElement('span');
            span.textContent = opt.text;

            wrap.appendChild(input);
            wrap.appendChild(span);
            container.appendChild(wrap);
        });

        $('question-counter').textContent = `${idx + 1}/${questions.length}`;
    }

    function updateNav() {
        $('prev-btn').disabled = idx === 0;
        $('next-btn').disabled = idx >= questions.length - 1;
        const allAnswered = questions.every(q => answers.has(q.id));
        $('submit-btn').disabled = !allAnswered || questions.length === 0;
    }

    function go(delta) {
        const ni = idx + delta;
        if (ni < 0 || ni >= questions.length) return;
        idx = ni;
        renderQuestion();
        updateNav();
    }

    async function handleSubmitQuiz() {
        if (!currentQuizId || questions.length === 0) return;

        // Build payload expected by backend: List<Response> where each has id and response
        const payload = questions
            .map(q => ({ id: q.id, response: answers.get(q.id) }))
            .filter(x => x.id != null && x.response != null);

        if (payload.length !== questions.length) {
            setError($('quiz-error'), 'Please answer all questions.');
            return;
        }

        try {
            $('quiz-error').classList.add('hidden');
            $('submit-btn').disabled = true;
            $('submit-btn').textContent = 'Submitting...';

            const res = await safeFetch(`${API_BASE}/quiz/submit/${currentQuizId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // Backend returns integer score (JSON or text)
            let score;
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                score = await res.json();
            } else {
                const text = await res.text();
                score = parseInt(text, 10);
            }
            if (Number.isNaN(score)) {
                throw new Error('Unexpected score response.');
            }

            showResults(score, questions.length);
        } catch (err) {
            setError($('quiz-error'), `Submit failed: ${err.message}`);
        } finally {
            $('submit-btn').textContent = 'Submit';
            updateNav();
        }
    }

    function showResults(score, total) {
        const pct = Math.round((score / total) * 100);
        $('score-text').textContent = `Score: ${score}/${total} (${pct}%)`;
        $('score-message').textContent =
            pct === 100 ? 'Perfect! 🎉' :
                pct >= 80 ? 'Great job! ✅' :
                    pct >= 50 ? 'Good effort! 👍' :
                        'Keep practicing! 💪';

        $('results').classList.remove('hidden');
        showTab('take-quiz');
    }

    function resetToHome() {
        currentQuizId = null;
        questions = [];
        answers = new Map();
        idx = 0;

        $('quiz-area')?.classList.add('hidden');
        $('quiz-loading').classList.remove('hidden');
        $('quiz-loading').textContent = 'Load a quiz to begin.';
        $('results').classList.add('hidden');
        $('quiz-error').classList.add('hidden');

        showTab('home');
    }

    // Admin
    async function handleAddQuestion(e) {
        e.preventDefault();
        clearStatus($('add-question-status'));
        const questionTitle = $('question-title')?.value?.trim();
        const option1 = $('option1')?.value?.trim();
        const option2 = $('option2')?.value?.trim();
        const option3 = $('option3')?.value?.trim();
        const option4 = $('option4')?.value?.trim();
        const correct = $('correct-answer')?.value;
        const difficultyLevel = $('difficulty-level')?.value;
        const category = $('question-category')?.value?.trim();

        if (!questionTitle || !option1 || !option2 || !option3 || !option4 || !correct || !difficultyLevel || !category) {
            setError($('add-question-status'), 'Please fill in all fields.');
            return;
        }

        const body = {
            questionTitle,
            option1, option2, option3, option4,
            rightAnswer: correct,       // common field name used in many variants
            difficultyLevel,
            category,
        };

        try {
            setLoading($('add-question-status'), 'Adding question...');
            const res = await safeFetch(`${API_BASE}/admin/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const text = await res.text();
            $('add-question-status').textContent = text || 'Question added.';
            $('add-question-form').reset();
            await refreshQuestions();
        } catch (err) {
            setError($('add-question-status'), `Failed to add: ${err.message}`);
        }
    }

    async function fetchQuestions(category) {
        const url = category && category.trim()
            ? `${API_BASE}/admin/allquestions/${encodeURIComponent(category.trim())}`
            : `${API_BASE}/admin/allquestions`;
        const res = await safeFetch(url);
        return res.json();
    }

    function renderQuestionsList(list) {
        const wrap = $('questions-list');
        wrap.innerHTML = '';
        if (!Array.isArray(list) || list.length === 0) {
            wrap.innerHTML = '<p class="muted">No questions found.</p>';
            return;
        }
        list.forEach(q => {
            const card = document.createElement('div');
            card.className = 'list-item';
            const title = q.questionTitle || q.title || q.question || `Question ${q.id}`;
            const meta = `
        <div class="meta">
          <span>#${q.id}</span>
          <span>${q.category || 'No category'}</span>
          <span>${q.difficultyLevel || 'No difficulty'}</span>
        </div>
      `;
            card.innerHTML = `
        <div class="content">
          <strong>${title}</strong>
          ${meta}
        </div>
        <div class="actions">
          <button class="danger" data-delete="${q.id}">Delete</button>
        </div>
      `;
            wrap.appendChild(card);
        });

        qsa('button[data-delete]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-delete');
                if (!id) return;
                btn.disabled = true;
                btn.textContent = 'Deleting...';
                try {
                    const res = await safeFetch(`${API_BASE}/admin/delete/${id}`, { method: 'DELETE' });
                    const text = await res.text();
                    await refreshQuestions();
                } catch (err) {
                    alert(`Delete failed: ${err.message}`);
                }
            });
        });
    }

    async function refreshQuestions() {
        try {
            const cat = $('category-filter')?.value || '';
            const list = await fetchQuestions(cat);
            renderQuestionsList(list);
        } catch (err) {
            $('questions-list').innerHTML = `<p class="error">Failed to load questions: ${err.message}</p>`;
        }
    }

    function wireEvents() {
        $('create-quiz-form')?.addEventListener('submit', handleCreateQuiz);
        $('load-quiz-form')?.addEventListener('submit', handleLoadQuiz);

        $('prev-btn')?.addEventListener('click', () => go(-1));
        $('next-btn')?.addEventListener('click', () => go(1));
        $('submit-btn')?.addEventListener('click', handleSubmitQuiz);
        $('retry-btn')?.addEventListener('click', resetToHome);

        $('add-question-form')?.addEventListener('submit', handleAddQuestion);
        $('filter-btn')?.addEventListener('click', (e) => { e.preventDefault(); refreshQuestions(); });
        $('refresh-btn')?.addEventListener('click', (e) => { e.preventDefault(); $('category-filter').value = ''; refreshQuestions(); });
    }

    function ready() {
        initTabs();
        wireEvents();
        // Initialize quiz area buttons disabled state properly
        updateNav();
        // Load initial admin list
        refreshQuestions().catch(() => {});
    }

    document.addEventListener('DOMContentLoaded', ready);
})();