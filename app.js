const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let attempts = 0;

let currentPairs = [];
let pairIndex = 0;

async function startQuiz() {
    try {
        const response = await fetch('pitanja.json?v=' + Math.random());
        if (!response.ok) throw new Error("Problem s JSON-om");
        let allData = await response.json();

        quizData = allData.sort(() => 0.5 - Math.random()).slice(0, 20);
        loadQuestion();
    } catch (error) {
        quizContainer.innerHTML = "<h2>Greška pri učitavanju...</h2>";
    }
}

function loadQuestion() {
    attempts = 0;
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

function showNextPair() {
    const q = quizData[currentQuestionIndex];
    const pair = currentPairs[pairIndex];
    const pojamLijevo = pair[0];
    const tocanOdgovor = pair[1];

    quizContainer.innerHTML = `
        <p style="text-align:center; color:#6a11cb; font-weight:bold;">Poveži par (${pairIndex + 1}/${currentPairs.length})</p>
        <h2 style="font-size:32px; margin-bottom:10px;">${pojamLijevo}</h2>
        <p style="text-align:center; margin-bottom:20px;">Odaberi točan par:</p>
    `;

    // Generiranje opcija
    let sveMoguceOpcije = Object.values(q.pairs);
    let opcije = [tocanOdgovor];

    // Dodaj krive odgovore iz trenutnog pitanja
    let kriviFilter = sveMoguceOpcije.filter(o => o !== tocanOdgovor);
    kriviFilter.sort(() => 0.5 - Math.random());
    opcije.push(...kriviFilter.slice(0, 3));

    opcije.sort(() => 0.5 - Math.random());

    const btnWrapper = document.createElement("div");
    opcije.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "quiz-btn";
        btn.onclick = () => {
            quizContainer.style.pointerEvents = "none"; // Blokiraj duple klikove

            if (opt === tocanOdgovor) {
                score += (1 / currentPairs.length); // Dodaj proporcionalni dio boda
                showMessage("Točno! 🌟", () => handlePairTransition());
            } else {
                // STROGO PRAVILO: Ako je krivo, pokaži točno i idi dalje
                showMessage(`Netočno! Točno je: ${tocanOdgovor}`, () => handlePairTransition());
            }
        };
        btnWrapper.appendChild(btn);
    });
    quizContainer.appendChild(btnWrapper);
}

function handlePairTransition() {
    pairIndex++;
    if (pairIndex < currentPairs.length) {
        quizContainer.style.pointerEvents = "auto";
        showNextPair();
    } else {
        nextQuestion();
    }
}

function renderStandardQuestion(q) {
    quizContainer.innerHTML = `<h2>${q.question}</h2>`;
    if (q.image) {
        const img = document.createElement("img");
        img.src = q.image;
        img.className = "quiz-image";
        quizContainer.appendChild(img);
    }

    if (q.type === "abcd") {
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
    } else if (q.type === "input") {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "user-answer";
        input.placeholder = "Upiši odgovor...";
        input.setAttribute("autocomplete", "off");

        const btn = document.createElement("button");
        btn.innerText = "Provjeri";
        btn.className = "quiz-btn";
        btn.onclick = () => {
            quizContainer.style.pointerEvents = "none";
            checkAnswer(input.value);
        };

        input.onkeypress = (e) => {
            if (e.key === "Enter") {
                quizContainer.style.pointerEvents = "none";
                checkAnswer(input.value);
            }
        };

        quizContainer.appendChild(input);
        quizContainer.appendChild(btn);
        input.focus();
    }
}

function checkAnswer(userAnswer) {
    const q = quizData[currentQuestionIndex];
    if (!userAnswer) return;

    const inputCleaned = userAnswer.toLowerCase().trim();
    let isCorrect = false;

    // Provjera ako imamo listu točnih odgovora ili samo jedan string
    if (Array.isArray(q.correct)) {
        isCorrect = q.correct.some(ans => ans.toLowerCase().trim() === inputCleaned);
    } else {
        isCorrect = q.correct.toLowerCase().trim() === inputCleaned;
    }
    if (isCorrect) {
        if (attempts === 0) score++;
        showMessage("Točno! 🌟", () => nextQuestion());
    } else {
        attempts++;
        if (attempts === 1) {
            quizContainer.style.pointerEvents = "auto";
            showMessage("Pokušaj opet! ↩️", () => {
                const inp = document.getElementById("user-answer");
                if (inp) { inp.value = ""; inp.focus(); }
            });
        } else {
            showMessage(`Točno je: ${q.correct}`, () => nextQuestion());
        }
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
    }, 1200); // Malo duže da se stigne pročitati točan odgovor ako se pogriješi
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        renderFinalScore();
    }
}

function renderFinalScore() {
    // Zaokružujemo bodove na cijeli broj jer matching daje decimale
    const finalScore = Math.round(score);
    quizContainer.innerHTML = `
        <div style="text-align:center;">
            <h2>Kviz završen! 🏆</h2>
            <p style="font-size:24px; font-weight:bold; margin-bottom:20px;">Rezultat: ${finalScore} / ${quizData.length}</p>
            <button id="restart-btn" class="quiz-btn">Igraj ponovno</button>
        </div>
    `;
    document.getElementById('restart-btn').onclick = () => {
        window.location.reload();
    };
}

startQuiz();