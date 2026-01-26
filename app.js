const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;
let selectedLeft = null;
let selectedLeftBtn = null;

async function startQuiz() {
    try {
        const response = await fetch('pitanja.json?v=' + Math.random());
        if (!response.ok) throw new Error("JSON nije pronađen");
        let allData = await response.json();
        quizData = allData.sort(() => 0.5 - Math.random()).slice(0, 20);
        loadQuestion();
    } catch (error) {
        quizContainer.innerHTML = "<h2>Greška pri učitavanju...</h2>";
        console.error(error);
    }
}

function showMessage(text, callback) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "feedback-popup";
    msgDiv.innerText = text;
    document.body.appendChild(msgDiv);
    setTimeout(() => {
        msgDiv.remove();
        if (callback) callback();
    }, 1000);
}

function loadQuestion() {
    // 1. POTPUNI RESET STANJA ZA NOVO PITANJE
    attempts = 0;
    selectedLeft = null;
    selectedLeftBtn = null;
    quizContainer.style.pointerEvents = "auto"; // Odblokiraj klikove
    quizContainer.style.opacity = "1";

    const q = quizData[currentQuestionIndex];
    quizContainer.innerHTML = `<h2>${q.question}</h2>`;

    if (q.image) {
        const img = document.createElement("img");
        img.src = q.image;
        img.className = "quiz-image";
        quizContainer.appendChild(img);
    }

    // --- TIP: MATCHING ---
    if (q.type === "matching") {
        const wrapper = document.createElement("div");
        wrapper.className = "matching-wrapper";
        const leftCol = document.createElement("div");
        const rightCol = document.createElement("div");
        leftCol.className = "matching-col";
        rightCol.className = "matching-col";

        const leftItems = Object.keys(q.pairs).sort(() => 0.5 - Math.random());
        const rightItems = Object.values(q.pairs).sort(() => 0.5 - Math.random());
        let matchedCount = 0;
        const totalPairs = leftItems.length;

        leftItems.forEach(item => {
            const btn = document.createElement("button");
            btn.innerText = item;
            btn.className = "match-btn";
            btn.onclick = () => {
                if (btn.classList.contains('matched') || btn.classList.contains('error-match')) return;
                leftCol.querySelectorAll('.match-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedLeft = item;
                selectedLeftBtn = btn;
            };
            leftCol.appendChild(btn);
        });

        rightItems.forEach(item => {
            const btn = document.createElement("button");
            btn.innerText = item;
            btn.className = "match-btn";
            btn.onclick = () => {
                if (!selectedLeft || btn.classList.contains('matched') || btn.classList.contains('error-match')) return;

                const correctValue = q.pairs[selectedLeft];
                if (correctValue === item) {
                    btn.classList.add('matched');
                    selectedLeftBtn.classList.add('matched');
                } else {
                    rightCol.querySelectorAll('.match-btn').forEach(rb => {
                        if (rb.innerText === correctValue) rb.classList.add('error-match');
                    });
                    selectedLeftBtn.classList.add('error-match');
                }

                selectedLeftBtn.classList.remove('selected');
                btn.disabled = true;
                selectedLeftBtn.disabled = true;
                selectedLeft = null;
                matchedCount++;

                if (matchedCount === totalPairs) {
                    quizContainer.style.pointerEvents = "none";
                    setTimeout(() => nextQuestion(), 1000);
                }
            };
            rightCol.appendChild(btn);
        });
        wrapper.appendChild(leftCol);
        wrapper.appendChild(rightCol);
        quizContainer.appendChild(wrapper);

        // --- TIP: ABCD ---
    } else if (q.type === "abcd") {
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "quiz-btn";
            btn.onclick = () => {
                quizContainer.style.pointerEvents = "none";
                checkAnswer(opt);
            };
            quizContainer.appendChild(btn);
        });

        // --- TIP: INPUT ---
    } else if (q.type === "input") {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "user-answer";
        input.placeholder = "Upiši odgovor...";
        input.setAttribute("autocomplete", "off");

        const btn = document.createElement("button");
        btn.innerText = "Provjeri";
        btn.className = "quiz-btn";

        const submitAction = () => {
            quizContainer.style.pointerEvents = "none";
            checkAnswer(input.value);
        };

        btn.onclick = submitAction;
        input.onkeypress = (e) => { if (e.key === "Enter") submitAction(); };

        quizContainer.appendChild(input);
        quizContainer.appendChild(btn);
        input.focus();
    }
}

function checkAnswer(userAnswer) {
    const q = quizData[currentQuestionIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim();

    if (isCorrect) {
        if (attempts === 0) score++;
        showMessage("Točno! 🌟", () => nextQuestion());
    } else {
        attempts++;
        if (attempts === 1) {
            quizContainer.style.pointerEvents = "auto"; // Vrati klikove za drugi pokušaj
            showMessage("Još 1 pokušaj!", () => {
                const inp = document.getElementById("user-answer");
                if (inp) { inp.value = ""; inp.focus(); }
            });
        } else {
            showMessage(`Točno je: ${q.correct}`, () => nextQuestion());
        }
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        quizContainer.style.pointerEvents = "auto";
        quizContainer.innerHTML = `
            <div style="text-align:center;">
                <h2>Kviz završen! 🏆</h2>
                <p style="font-size:24px; font-weight:bold;">Rezultat: ${score} / ${quizData.length}</p>
                <button class="quiz-btn" onclick="location.reload()">Igraj ponovno</button>
            </div>
        `;
    }
}

startQuiz();