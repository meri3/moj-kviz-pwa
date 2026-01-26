const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let currentPairs = [];
let pairIndex = 0;

function showStartScreen() {
    quizContainer.innerHTML = `
        <div style="text-align:center;">
            <h1>Dobrodošli u Kviz! 🏆</h1>
            <p>Odgovorite na 20 nasumičnih pitanja</p>
            <button id="start-btn" class="quiz-btn">KRENI</button>
        </div>
    `;
    document.getElementById('start-btn').onclick = startQuiz;
}

async function startQuiz() {
    try {
        const res = await fetch('pitanja.json?v=' + Math.random());
        const allData = await res.json();
        // Uzimamo 20 nasumičnih
        quizData = allData.sort(() => 0.5 - Math.random()).slice(0, 20);
        currentQuestionIndex = 0;
        score = 0;
        loadQuestion();
    } catch (e) {
        quizContainer.innerHTML = "<h2>Greška pri učitavanju pitanja.</h2>";
    }
}

function loadQuestion() {
    quizContainer.style.pointerEvents = "auto";
    const q = quizData[currentQuestionIndex];
    if (q.type === "matching") {
        currentPairs = Object.entries(q.pairs).sort(() => 0.5 - Math.random());
        pairIndex = 0;
        showNextPair();
    } else {
        renderStandardQuestion(q);
    }
}

function renderStandardQuestion(q) {
    quizContainer.innerHTML = `
        <p style="text-align:right; color:#888;">Pitanje: ${currentQuestionIndex + 1}/20</p>
        <h2>${q.question}</h2>
    `;
    if (q.type === "abcd") {
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "quiz-btn";
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(opt);
            quizContainer.appendChild(btn);
        });
    } else {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "user-ans";
        input.placeholder = "Odgovor ili prazno za dalje...";
        input.setAttribute("autocomplete", "off");

        const btn = document.createElement("button");
        btn.className = "quiz-btn";
        btn.innerText = "POTVRDI";
        btn.onclick = () => checkAnswer(input.value || "");

        // Enter podrška
        input.onkeypress = (e) => { if (e.key === 'Enter') checkAnswer(input.value || ""); };

        quizContainer.appendChild(input);
        quizContainer.appendChild(btn);
        input.focus();
    }
}

function checkAnswer(userAnswer) {
    quizContainer.style.pointerEvents = "none";
    const q = quizData[currentQuestionIndex];
    const cleanUser = userAnswer.toLowerCase().trim();
    let isCorrect = false;

    if (Array.isArray(q.correct)) {
        isCorrect = q.correct.some(a => a.toLowerCase().trim() === cleanUser);
    } else {
        isCorrect = q.correct.toLowerCase().trim() === cleanUser;
    }

    if (isCorrect && cleanUser !== "") {
        score++;
        showMessage("Točno! 🌟", "green", () => nextQuestion());
    } else {
        const correctText = Array.isArray(q.correct) ? q.correct[0] : q.correct;
        showMessage(`Točno je: ${correctText}`, "red", () => nextQuestion());
    }
}

function showNextPair() {
    quizContainer.style.pointerEvents = "auto";
    const pair = currentPairs[pairIndex];
    const tocan = pair[1];
    const q = quizData[currentQuestionIndex];

    quizContainer.innerHTML = `
        <p style="text-align:right; color:#888;">Pitanje: ${currentQuestionIndex + 1}/20</p>
        <p style="text-align:center; color:#6a11cb;">Spoji par (${pairIndex + 1}/${currentPairs.length})</p>
        <h2>${pair[0]}</h2>
    `;

    let opts = [tocan, ...Object.values(q.pairs).filter(v => v !== tocan).sort(() => 0.5 - Math.random()).slice(0, 3)].sort(() => 0.5 - Math.random());

    opts.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quiz-btn";
        btn.innerText = opt;
        btn.onclick = () => {
            quizContainer.style.pointerEvents = "none";
            if (opt === tocan) {
                score += (1 / currentPairs.length);
                showMessage("Točno! 🌟", "green", () => {
                    pairIndex++;
                    pairIndex < currentPairs.length ? showNextPair() : nextQuestion();
                });
            } else {
                showMessage(`Netočno! Par je: ${tocan}`, "red", () => {
                    pairIndex++;
                    pairIndex < currentPairs.length ? showNextPair() : nextQuestion();
                });
            }
        };
        quizContainer.appendChild(btn);
    });
}

function showMessage(text, type, callback) {
    const msg = document.createElement("div");
    msg.className = "feedback-popup";
    msg.innerText = text;

    // FIKSIRANA LOGIKA BOJA:
    if (type === "green") {
        msg.style.backgroundColor = "#28a745"; // Zelena
    } else {
        msg.style.backgroundColor = "#dc3545"; // Crvena
    }

    document.body.appendChild(msg);

    setTimeout(() => {
        msg.remove();
        if (callback) callback();
    }, 2500);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        renderFinal();
    }
}

function renderFinal() {
    const finalScore = Math.round(score);
    quizContainer.innerHTML = `
        <div style="text-align:center;">
            <h2>Kviz završen! 🏆</h2>
            <p style="font-size:40px; color:#6a11cb; font-weight:bold; margin:20px 0;">${finalScore} / 20</p>
            <button onclick="location.reload()" class="quiz-btn">Igraj ponovno</button>
        </div>
    `;
}

showStartScreen();