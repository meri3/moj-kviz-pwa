const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let attempts = 0;

// Za potrebe nove logike spajanja
let currentPairs = [];
let pairIndex = 0;

async function startQuiz() {
    try {
        const response = await fetch('pitanja.json?v=' + Math.random());
        if (!response.ok) throw new Error("Problem s JSON-om");
        let allData = await response.json();

        // Miješanje i uzimanje 20 pitanja
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

    // Ako je pitanje tipa 'matching', pripremamo parove za 'jedan po jedan' sustav
    if (q.type === "matching") {
        currentPairs = Object.entries(q.pairs); // Pretvara {Hrvatska: Zagreb} u [["Hrvatska", "Zagreb"]]
        pairIndex = 0;
        showNextPair();
    } else {
        renderStandardQuestion(q);
    }
}

// NOVA LOGIKA ZA SPAJANJE (prikazuje jedan po jedan par iz pitanja)
function showNextPair() {
    const q = quizData[currentQuestionIndex];
    const pair = currentPairs[pairIndex]; // npr. ["Hrvatska", "Zagreb"]
    const pojamLijevo = pair[0];
    const tocanOdgovor = pair[1];

    quizContainer.innerHTML = `
        <p style="text-align:center; color:#6a11cb; font-weight:bold;">Poveži parove (${pairIndex + 1}/${currentPairs.length})</p>
        <h2 style="font-size:32px; margin-bottom:10px;">${pojamLijevo}</h2>
        <p style="text-align:center; margin-bottom:20px;">Što pripada ovom pojmu?</p>
    `;

    // Generiraj opcije (točna + 3 nasumične iz svih parova tog pitanja)
    let sveMoguceOpcije = currentPairs.map(p => p[1]);
    let opcije = [tocanOdgovor];

    // Dodaj krive odgovore iz ostalih parova da bude izazovno
    sveMoguceOpcije.filter(o => o !== tocanOdgovor).forEach(o => {
        if (opcije.length < 4) opcije.push(o);
    });

    opcije.sort(() => 0.5 - Math.random());

    const btnWrapper = document.createElement("div");
    opcije.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "quiz-btn";
        btn.onclick = () => {
            if (opt === tocanOdgovor) {
                pairIndex++;
                if (pairIndex < currentPairs.length) {
                    showMessage("Točno! Idemo dalje...", () => showNextPair());
                } else {
                    score++; // Dobiva bod tek kad spoji sve parove u pitanju
                    showMessage("Svi parovi spojeni! 🌟", () => nextQuestion());
                }
            } else {
                showMessage("Krivo! Pokušaj ponovno.");
            }
        };
        btnWrapper.appendChild(btn);
    });
    quizContainer.appendChild(btnWrapper);
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
        btn.onclick = () => checkAnswer(input.value);

        input.onkeypress = (e) => { if (e.key === "Enter") checkAnswer(input.value); };

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
            quizContainer.style.pointerEvents = "auto";
            showMessage("Pokušaj opet!", () => {
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
    }, 1000);
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
    quizContainer.innerHTML = `
        <div style="text-align:center;">
            <h2>Kviz završen! 🏆</h2>
            <p style="font-size:24px; font-weight:bold; margin-bottom:20px;">Rezultat: ${score} / ${quizData.length}</p>
            <button id="restart-btn" class="quiz-btn">Igraj ponovno</button>
        </div>
    `;
    // FIX: Direktno dodjeljivanje eventa nakon što se gumb stvori u DOM-u
    document.getElementById('restart-btn').onclick = () => {
        window.location.reload();
    };
}

startQuiz();