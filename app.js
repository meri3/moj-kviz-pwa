const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;

async function startQuiz() {
    try {
        const response = await fetch('pitanja.json?v=' + Math.random());
        let allData = await response.json();

        // Pretvaramo stare "matching" podatke u obična ABCD pitanja da ništa ne propadne
        const processedData = [];
        allData.forEach(q => {
            if (q.type === "matching") {
                // Od spajanja radimo više malih ABCD pitanja
                Object.keys(q.pairs).forEach(key => {
                    processedData.push({
                        type: "abcd",
                        question: `Što odgovara pojmu: ${key}?`,
                        options: shuffleArray([q.pairs[key], "Pariz", "London", "Berlin", "Madrid"]).slice(0, 4),
                        correct: q.pairs[key]
                    });
                });
            } else {
                processedData.push(q);
            }
        });

        quizData = processedData.sort(() => 0.5 - Math.random()).slice(0, 20);
        loadQuestion();
    } catch (error) {
        quizContainer.innerHTML = "<h2>Greška pri učitavanju...</h2>";
    }
}

// Pomoćna funkcija za miješanje opcija
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function loadQuestion() {
    attempts = 0;
    quizContainer.style.pointerEvents = "auto";
    const q = quizData[currentQuestionIndex];

    quizContainer.innerHTML = `<h2>${q.question}</h2>`;

    if (q.image) {
        const img = document.createElement("img");
        img.src = q.image;
        img.className = "quiz-image";
        quizContainer.appendChild(img);
    }

    if (q.type === "abcd") {
        const optionsWrapper = document.createElement("div");
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "quiz-btn";
            btn.onclick = () => {
                quizContainer.style.pointerEvents = "none";
                checkAnswer(opt);
            };
            optionsWrapper.appendChild(btn);
        });
        quizContainer.appendChild(optionsWrapper);

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
            quizContainer.style.pointerEvents = "auto";
            showMessage("Pokušaj opet!", () => {
                const inp = document.getElementById("user-answer");
                if (inp) { inp.value = ""; inp.focus(); }
                // Za ABCD samo vratimo klikove
                const btns = quizContainer.querySelectorAll('.quiz-btn');
                btns.forEach(b => b.disabled = false);
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