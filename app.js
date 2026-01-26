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
        // Miješanje i uzimanje 20 nasumičnih pitanja
        quizData = allData.sort(() => 0.5 - Math.random()).slice(0, 20);
        loadQuestion();
    } catch (error) {
        quizContainer.innerHTML = "<h2>Greška pri učitavanju...</h2><p>Provjeri format u pitanja.json!</p>";
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
    }, 1000); // Blic traje 1 sekundu
}

function loadQuestion() {
    attempts = 0;
    selectedLeft = null;
    selectedLeftBtn = null;
    quizContainer.style.pointerEvents = "auto"; // Osiguraj da su klikovi dopušteni

    const q = quizData[currentQuestionIndex];
    quizContainer.innerHTML = `<h2>${q.question}</h2>`;

    if (q.image) {
        const img = document.createElement("img");
        img.src = q.image;
        img.className = "quiz-image";
        quizContainer.appendChild(img);
    }

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
                // Ako je već spojen, ignoriraj
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
                // Osiguranje: ne radi ništa ako lijeva strana nije odabrana ili je ovaj desni već spojen
                if (!selectedLeft || btn.classList.contains('matched') || btn.classList.contains('error-match')) return;

                const correctRightValue = q.pairs[selectedLeft];

                if (correctRightValue === item) {
                    btn.classList.add('matched');
                    selectedLeftBtn.classList.add('matched');
                    btn.disabled = true;
                    selectedLeftBtn.disabled = true;
                } else {
                    const allRightBtns = rightCol.querySelectorAll('.match-btn');
                    allRightBtns.forEach(rb => {
                        if (rb.innerText === correctRightValue) {
                            rb.classList.add('error-match');
                            rb.disabled = true;
                        }
                    });
                    selectedLeftBtn.classList.add('error-match');
                    selectedLeftBtn.disabled = true;
                }

                // RESETIRANJE SELEKCIJE - Uvijek i bez odgađanja
                selectedLeftBtn.classList.remove('selected');
                selectedLeft = null;
                selectedLeftBtn = null;
                matchedCount++;

                // Provjera kraja
                if (matchedCount === totalPairs) {
                    quizContainer.style.pointerEvents = "none"; // Blokiraj sve klikove do novog pitanja
                    setTimeout(() => nextQuestion(), 1000);
                }
            };
            rightCol.appendChild(btn);
        });

        wrapper.appendChild(leftCol);
        wrapper.appendChild(rightCol);
        quizContainer.appendChild(wrapper);

    } else if (q.type === "abcd") {
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "quiz-btn";
            btn.onclick = () => {
                const allButtons = quizContainer.querySelectorAll('.quiz-btn');
                allButtons.forEach(b => b.disabled = true); // Spriječi duple klikove
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
        input.setAttribute("autocorrect", "off");
        input.setAttribute("spellcheck", "false");

        const btn = document.createElement("button");
        btn.innerText = "Provjeri";
        btn.className = "quiz-btn";
        btn.onclick = () => {
            btn.disabled = true; // Spriječi duple klikove
            checkAnswer(input.value);
        };

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                btn.disabled = true;
                checkAnswer(input.value);
            }
        });

        quizContainer.appendChild(input);
        quizContainer.appendChild(btn);
        input.focus();
    }
}

function checkAnswer(userAnswer) {
    const q = quizData[currentQuestionIndex];
    if (!userAnswer) return;

    // ONEMOGUĆI DALJNJE KLIKANJE (da se ne može kliknuti više puta)
    const allBtns = quizContainer.querySelectorAll('button');
    allBtns.forEach(btn => btn.disabled = true);

    const isCorrect = userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim();

    if (isCorrect) {
        if (attempts === 0) score++;
        showMessage("Točno! 🌟", () => nextQuestion());
    } else {
        attempts++;
        if (attempts === 1) {
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