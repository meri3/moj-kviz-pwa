const quizContainer = document.getElementById('quiz-container');

// 1. Tvoji podaci (Ovdje dodaješ nova pitanja)
const quizData = [
    {
        type: "abcd",
        question: "Koji je glavni grad Hrvatske?",
        options: ["Split", "Rijeka", "Zagreb", "Osijek"],
        correct: "Zagreb"
    },
    {
        type: "input",
        question: "Upiši ime najvećeg planeta u Sunčevom sustavu:",
        correct: "Jupiter"
    },
    {
        type: "image-select",
        question: "Što se nalazi na slici?",
        image: "https://via.placeholder.com/300", // Ovdje ćeš staviti pravi URL slike
        correct: "krug"
    }
];

let currentQuestionIndex = 0;

// 2. Funkcija za prikaz pitanja
function loadQuestion() {
    const q = quizData[currentQuestionIndex];
    quizContainer.innerHTML = ""; // Očisti prethodno pitanje

    const questionText = document.createElement("h2");
    questionText.innerText = q.question;
    quizContainer.appendChild(questionText);

    // Ako je pitanje ABCD
    if (q.type === "abcd") {
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "quiz-btn";
            btn.onclick = () => checkAnswer(opt);
            quizContainer.appendChild(btn);
        });
    }
    // Ako je pitanje tipa UNOS
    else if (q.type === "input") {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "user-answer";
        input.placeholder = "Tvoj odgovor...";

        const submitBtn = document.createElement("button");
        submitBtn.innerText = "Provjeri";
        submitBtn.className = "quiz-btn primary";
        submitBtn.onclick = () => checkAnswer(document.getElementById("user-answer").value);

        quizContainer.appendChild(input);
        quizContainer.appendChild(submitBtn);
    }
}

// 3. Provjera odgovora
function checkAnswer(answer) {
    const q = quizData[currentQuestionIndex];

    if (answer.toLowerCase().trim() === q.correct.toLowerCase().trim()) {
        alert("Točno! 🎉");
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            loadQuestion();
        } else {
            quizContainer.innerHTML = "<h2>Kviz završen! Bravo! 🏆</h2>";
        }
    } else {
        alert("Pokušaj ponovo! ❌");
    }
}

// Pokreni kviz odmah
loadQuestion();