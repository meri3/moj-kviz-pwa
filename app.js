const quizContainer = document.getElementById('quiz-container');

const quizData = [
    {
        type: "abcd",
        question: "Koji je ovo uređaj?",
        image: "images/pitanje1.jpg",
        options: ["Televizor", "Kompjuter", "Radio", "Kalkulator"],
        correct: "Kompjuter"
    },
    {
        type: "input",
        question: "Što je prikazano na ovoj slici?",
        image: "images/pitanje2.jpg",
        correct: "Slanina"
    }
];

let currentQuestionIndex = 0;
let attempts = 0; // Brojač pokušaja

function loadQuestion() {
    attempts = 0; // Resetiraj pokušaje za novo pitanje
    const q = quizData[currentQuestionIndex];
    quizContainer.innerHTML = `<h2>${q.question}</h2>`;

    function loadQuestion() {
        attempts = 0;
        const q = quizData[currentQuestionIndex];
        quizContainer.innerHTML = `<h2>${q.question}</h2>`;

        // DODAJ OVO: Ako pitanje ima sliku, prikaži je
        if (q.image) {
            const img = document.createElement("img");
            img.src = q.image;
            img.className = "quiz-image"; // Dodat ćemo stil u CSS
            quizContainer.appendChild(img);
        }

        // Ostatak koda za gumbe i input ostaje isti...
        if (q.type === "abcd") {
            // ... tvoj postojeći kod za abcd ...
        } else if (q.type === "input") {
            // ... tvoj postojeći kod za input ...
        }
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

        const btn = document.createElement("button");
        btn.innerText = "Provjeri";
        btn.className = "quiz-btn";
        btn.onclick = () => checkAnswer(document.getElementById("user-answer").value);

        quizContainer.appendChild(input);
        quizContainer.appendChild(btn);
    }
}

function checkAnswer(userAnswer) {
    const q = quizData[currentQuestionIndex];
    // Pravilo 1: Mala i velika slova nisu bitna
    const isCorrect = userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim();

    if (isCorrect) {
        alert("Točno! 🌟");
        nextQuestion();
    } else {
        attempts++;
        if (attempts < 3) {
            alert(`Netočno! Imaš još ${3 - attempts} pokušaja.`);
        } else {
            // Pravilo 2: Nakon 3 greške, pokaži odgovor i idi dalje
            alert(`Netočno. Točan odgovor je: ${q.correct}`);
            nextQuestion();
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

loadQuestion();