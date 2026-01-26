const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;

let currentPairs = [];
let pairIndex = 0;

// 1. FUNKCIJA ZA POČETNI EKRAN
function showStartScreen() {
    quizContainer.innerHTML = `
        <div style="text-align:center; padding: 20px;">
            <h1 style="color: #6a11cb;">Dobrodošli u Kviz! 🏆</h1>
            <p style="font-size: 18px; margin-bottom: 30px;">
                Pred vama je 20 nasumičnih pitanja.<br>
                Ako ne znate odgovor, samo kliknite gumb za dalje.
            </p>
            <button id="start-btn" class="quiz-btn" style="width: 200px;">KRENI NA KVIZ</button>
        </div>
    `;
    document.getElementById('start-btn').onclick = startQuiz;
}

async function startQuiz() {
    try {
        const response = await fetch('pitanja.json?v=' + Math.random());
        if (!response.ok) throw new Error("Problem s JSON-om");
        let allData = await response.json();

        // Miješanje i uzimanje 20 pitanja
        quizData = allData.sort(() => 0.5 - Math.random()).slice(0, 20);
        currentQuestionIndex = 0;
        score = 0;
        loadQuestion();
    } catch (error) {
        quizContainer.innerHTML = "<h2>Greška pri učitavanju...</h2>";
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
        <p style="text-align:right; font-weight:bold; color:#888;">Pitanje: ${currentQuestionIndex + 1}/20</p>
        <h2>${q.question}</h2>
    `;

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
        input.placeholder = "Tvoj odgovor (ili ostavi prazno za skip)";
        input.setAttribute("autocomplete", "off");

        const btn = document.createElement("button");
        btn.innerText = "POTVRDI";
        btn.className = "quiz-btn";

        // POPRAVAK: Ako klikne bez unosa, šalje prazan string koji checkAnswer prepoznaje kao netočno
        btn.onclick = () => {
            quizContainer.style.pointerEvents = "none";
            checkAnswer(input.value || "");
        };

        input.onkeypress = (e) => {
            if (e.key === "Enter") {
                quizContainer.style.pointerEvents = "none";
                checkAnswer(input.value || "");
            }
        };

        quizContainer.appendChild(input);
        quizContainer.appendChild(btn);
        input.focus();
    }
}

function checkAnswer(userAnswer) {
    const q = quizData[currentQuestionIndex];
    const inputCleaned = userAnswer.toLowerCase().trim();
    let isCorrect = false;

    if (Array.isArray(q.correct)) {
        isCorrect = q.correct.some(ans => ans.toLowerCase().trim() === inputCleaned);
    } else {
        isCorrect = q.correct.toLowerCase().trim() === inputCleaned;
    }

    if (isCorrect && inputCleaned !== "") {
        score++;
        // Čekamo 4 sekunde prije nextQuestion
        showMessage("Točno! 🌟", () => {
            nextQuestion();
        });
    } else {
        const displayAnswer = Array.isArray(q.correct) ? q.correct[0] : q.correct;
        // Čekamo 3 sekunde da igrač vidi točan odgovor na starom pitanju
        showMessage(`Točno je: ${displayAnswer}`, () => {
            nextQuestion();
        });
    }
}

// LOGIKA ZA SPAJANJE (Matching)
function showNextPair() {
    const q = quizData[currentQuestionIndex];
    const pair = currentPairs[pairIndex];
    const pojamLijevo = pair[0];
    const tocanOdgovor = pair[1];

    quizContainer.innerHTML = `
        <p style="text-align:right; font-weight:bold; color:#888;">Pitanje: ${currentQuestionIndex + 1}/20</p>
        <p style="text-align:center; color:#6a11cb;">Poveži par (${pairIndex + 1}/${currentPairs.length})</p>
        <h2 style="font-size:32px;">${pojamLijevo}</h2>
    `;

    let sveMoguceOpcije = Object.values(q.pairs);
    let opcije = [tocanOdgovor];
    let kriviFilter = sveMoguceOpcije.filter(o => o !== tocanOdgovor).sort(() => 0.5 - Math.random());
    opcije.push(...kriviFilter.slice(0, 3));
    opcije.sort(() => 0.5 - Math.random());

    opcije.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "quiz-btn";
        btn.onclick = () => {
            quizContainer.style.pointerEvents = "none";
            if (opt === tocanOdgovor) {
                // Dodaje dio boda za točan par
                score += (1 / currentPairs.length);
                showMessage("Točno! 🌟", () => handlePairTransition());
            } else {
                showMessage(`Netočno! Par je: ${tocanOdgovor}`, () => handlePairTransition());
            }
        };
        quizContainer.appendChild(btn);
    });
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

function showMessage(text, callback) {
    // 1. Odmah zaključaj ekran da se ništa ne može kliknuti
    quizContainer.style.pointerEvents = "none";

    // 2. Stvori poruku
    const msgDiv = document.createElement("div");
    msgDiv.className = "feedback-popup";
    msgDiv.innerText = text;

    // Ako je odgovor kriv, stavljamo jarku crvenu da upada u oči
    if (text.includes("Točno je:")) {
        msgDiv.style.backgroundColor = "#ff4b2b";
        msgDiv.style.color = "white";
    } else {
        msgDiv.style.backgroundColor = "#2ecc71";
    }

    document.body.appendChild(msgDiv);

    // 3. TEST: Dodajemo alert koji će zaustaviti sve dok ga ne klikneš (samo za provjeru)
    // Ako se ovaj alert NE pojavi, znači da tvoj mobitel uopće ne vidi novi kod
    // console.log("Poruka bi trebala trajati 4 sekunde"); 

    // 4. Postavljamo na 4000ms (4 pune sekunde)
    setTimeout(() => {
        msgDiv.remove();

        // TEK KAD PORUKA NESTANE, zovemo iduće pitanje
        if (typeof callback === "function") {
            callback();
        }

        // Vrati mogućnost klika
        quizContainer.style.pointerEvents = "auto";
    }, 3000);
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
    const finalScore = Math.round(score);
    let poruka = "Može to i bolje! 🤨";
    if (finalScore > 10) poruka = "Dobro odrađeno! 🙂";
    if (finalScore > 17) poruka = "Svaka čast, majstore! 👑";

    quizContainer.innerHTML = `
        <div style="text-align:center;">
            <h2>Kviz završen! 🏆</h2>
            <p style="font-size: 20px;">${poruka}</p>
            <p style="font-size:40px; font-weight:bold; color:#6a11cb; margin: 20px 0;">${finalScore} / 20</p>
            <button type="button" class="quiz-btn restart-trigger">Igraj ponovno</button>
        </div>
    `;
}

// Globalni slušač za gumb "Igraj ponovno"
document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('restart-trigger')) {
        window.location.reload();
    }
});

// Pokreni uvodni ekran
showStartScreen();
