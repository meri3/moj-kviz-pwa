const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;
let selectedLeft = null;
let selectedLeftBtn = null; // Dodano da možemo obojati lijevi gumb

async function startQuiz() {
    try {
        const response = await fetch('pitanja.json');
        let allData = await response.json();

        // 1. NASUMIČNI ODABIR 20 PITANJA
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
    attempts = 0;
    selectedLeft = null;
    selectedLeftBtn = null;
    const q = quizData[currentQuestionIndex];
    quizContainer.innerHTML = `<h2>${q.question}</h2>`;

    if (q.image) {
        const img = document.createElement("img");
        img.src = q.image;
        img.className = "quiz-image";
        quizContainer.appendChild(img);
    }

    // LOGIKA ZA SPAJANJE PAROVA (Matching)
    if (q.type === "matching") {
        const wrapper = document.createElement("div");
        wrapper.className = "matching-wrapper"; // Poveznica s CSS-om

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
                document.querySelectorAll('.matching-col:first-child .match-btn').forEach(b => b.classList.remove('selected'));
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
                if (!selectedLeft) {
                    showMessage("Prvo odaberi pojam lijevo!");
                    return;
                }

                const correctRightValue = q.pairs[selectedLeft];

                if (correctRightValue === item) {
                    // TOČNO SPAJANJE
                    btn.classList.add('matched');
                    selectedLeftBtn.classList.add('matched');
                    btn.disabled = true;
                    selectedLeftBtn.disabled = true;
                    matchedCount++;
                    showMessage("Točno! 🌟");
                } else {
                    // NETOČNO SPAJANJE - AUTOMATSKO SPAJANJE TOCNOG
                    // 1. Nađi gumb na desnoj strani koji je zapravo točan
                    const allRightBtns = rightCol.querySelectorAll('.match-btn');
                    let correctRightBtn;
                    allRightBtns.forEach(rb => {
                        if (rb.innerText === correctRightValue) correctRightBtn = rb;
                    });

                    // 2. Označi oba (lijevi i onaj koji je trebao biti desni) kao "error" (crveno)
                    selectedLeftBtn.classList.add('error-match');
                    correctRightBtn.classList.add('error-match');

                    // 3. Onemogući ih da se više ne mogu birati
                    selectedLeftBtn.disabled = true;
                    correctRightBtn.disabled = true;

                    matchedCount++;
                    showMessage("Netočno! Točan par je spojen crvenom bojom.");
                }

                // Resetiraj selekciju za sljedeći pokušaj
                selectedLeftBtn.classList.remove('selected');
                selectedLeft = null;
                selectedLeftBtn = null;

                // Provjeri jesu li svi parovi gotovi (bilo točno ili netočno)
                if (matchedCount === totalPairs) {
                    setTimeout(() => nextQuestion(), 2500);
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
            btn.onclick = () => checkAnswer(opt);
            quizContainer.appendChild(btn);
        });
    } else if (q.type === "input") {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "user-answer";
    input.placeholder = "Upiši odgovor...";

    // OVO ISKLJUČUJE DOSADNU AUTO-ISPUNU NA IPHONEU
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("spellcheck", "false");

    input.addEventListener("keypress", (e) => { if (e.key === "Enter") checkAnswer(input.value); });

    const btn = document.createElement("button");
    btn.innerText = "Provjeri";
    btn.className = "quiz-btn";
    btn.onclick = () => checkAnswer(document.getElementById("user-answer").value);

    quizContainer.appendChild(input);
    quizContainer.appendChild(btn);
    input.focus();
}

        const btn = document.createElement("button");
        btn.innerText = "Provjeri";
        btn.className = "quiz-btn";
        btn.onclick = () => checkAnswer(document.getElementById("user-answer").value);

        quizContainer.appendChild(input);
        quizContainer.appendChild(btn);
        input.focus();
    }


function checkAnswer(userAnswer) {
    const q = quizData[currentQuestionIndex];
    if (!userAnswer) return;

    const isCorrect = userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim();

    if (isCorrect) {
        if (attempts === 0) score++;
        showMessage("Točno! 🌟", () => nextQuestion());
    } else {
        attempts++;
        if (attempts === 1) {
            showMessage("Netočno! Imaš još 1 pokušaj.", () => {
                const input = document.getElementById("user-answer");
                if (input) { input.value = ""; input.focus(); }
            });
        } else {
            showMessage(`Netočno. Točan odgovor je: ${q.correct}`, () => nextQuestion());
        }
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        quizContainer.innerHTML = `
            <div class="score-display">
                <h2>Kviz završen! 🏆</h2>
                <p>Tvoj rezultat: ${score} / ${quizData.length}</p>
                <button class="quiz-btn" onclick="location.reload()">Igraj ponovno</button>
            </div>
        `;
    }
}

startQuiz();