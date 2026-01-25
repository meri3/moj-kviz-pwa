const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let attempts = 0;

async function startQuiz() {
    try {
        const response = await fetch('pitanja.json');
        quizData = await response.json();
        loadQuestion();
    } catch (error) {
        quizContainer.innerHTML = "<h2>Greška pri učitavanju pitanja...</h2>";
    }
}

// NOVA FUNKCIJA: Prikazuje poruku koja nestane nakon 2 sekunde
function showMessage(text, callback) {
    // Kreiramo element za poruku
    const msgDiv = document.createElement("div");
    msgDiv.className = "feedback-popup";
    msgDiv.innerText = text;
    document.body.appendChild(msgDiv);

    // Nakon 2 sekunde makni poruku i pokreni sljedeću radnju (callback)
    setTimeout(() => {
        msgDiv.remove();
        if (callback) callback();
    }, 2000);
}

function loadQuestion() {
    attempts = 0;
    const q = quizData[currentQuestionIndex];
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
            btn.onclick = () => checkAnswer(opt);
            quizContainer.appendChild(btn);
        });
    } else if (q.type === "input") {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "user-answer";
        input.placeholder = "Upiši odgovor...";

        // DODANO: Podrška za tipku ENTER
        input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                checkAnswer(input.value);
            }
        });

        const btn = document.createElement("button");
        btn.innerText = "Provjeri";
        btn.className = "quiz-btn";
        btn.onclick = () => checkAnswer(document.getElementById("user-answer").value);

        quizContainer.appendChild(input);
        quizContainer.appendChild(btn);
        input.focus(); // Automatski stavi kursor u polje
    }
}

function checkAnswer(userAnswer) {
    const q = quizData[currentQuestionIndex];
    if (!userAnswer) return; // Ako je prazno, ne radi ništa

    const isCorrect = userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim();

    if (isCorrect) {
        showMessage("Točno! 🌟", () => nextQuestion());
    } else {
        attempts++;
        if (attempts === 1) {
            showMessage("Netočno! Imaš još 1 pokušaj.", () => {
                // Očisti polje za novi pokušaj
                const input = document.getElementById("user-answer");
                if (input) {
                    input.value = "";
                    input.focus();
                }
            });
        } else if (attempts === 2) {
            showMessage(`Netočno. Točan odgovor je: ${q.correct}`, () => nextQuestion());
        }
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        quizContainer.innerHTML = "<h2>Kviz završen! 🏆</h2>";
    }
}

startQuiz();