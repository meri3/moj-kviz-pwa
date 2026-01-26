const quizContainer = document.getElementById('quiz-container');
let quizData = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;
let selectedLeft = null; // Za spajanje parova

async function startQuiz() {
    try {
        const response = await fetch('pitanja.json');
        let allData = await response.json();

        // 1. NASUMIČNI ODABIR 20 PITANJA
        quizData = allData.sort(() => 0.5 - Math.random()).slice(0, 20);

        loadQuestion();
    } catch (error) {
        quizContainer.innerHTML = "<h2>Greška pri učitavanju...</h2>";
    }
}

function loadQuestion() {
    attempts = 0;
    selectedLeft = null;
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
        const leftCol = document.createElement("div");
        const rightCol = document.createElement("div");
        leftCol.className = "matching-col";
        rightCol.className = "matching-col";

        const leftItems = Object.keys(q.pairs).sort(() => 0.5 - Math.random());
        const rightItems = Object.values(q.pairs).sort(() => 0.5 - Math.random());

        leftItems.forEach(item => {
            const btn = document.createElement("button");
            btn.innerText = item;
            btn.className = "match-btn";
            btn.onclick = () => {
                document.querySelectorAll('.match-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedLeft = item;
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
                if (q.pairs[selectedLeft] === item) {
                    btn.style.backgroundColor = "#4cd964"; // Zeleno za točno
                    btn.disabled = true;
                    // Ovdje bi išla dodatna logika za micanje spojenih, ali za početak:
                    showMessage("Točan par!");
                } else {
                    showMessage("Krivo!");
                }
            };
            rightCol.appendChild(btn);
        });

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.justifyContent = "space-between";
        wrapper.appendChild(leftCol);
        wrapper.appendChild(rightCol);
        quizContainer.appendChild(wrapper);

        // Gumb za dalje kod spajanja
        const nextBtn = document.createElement("button");
        nextBtn.innerText = "Sljedeće pitanje";
        nextBtn.className = "quiz-btn";
        nextBtn.onclick = () => nextQuestion();
        quizContainer.appendChild(nextBtn);
    }
    // ... ostatak koda (abcd i input) ostaje isti kao prije ...
}

// ... funkcije checkAnswer i showMessage ostaju iste ...