import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// Database Authentication
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Project",
  password: "Joseph123",
  port: 5432,
});

db.connect();

// Arrays to store quiz data
let quiz = [];
let quiz1 = [];
let totalCorrect = 0;



const port = 3000;
const app = express();

// Middleware to render the application and pass values from database
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Store the current question and flag question
let currentQuestion = {};

// Fetch quiz data from the database asynchronously
async function fetchQuizData() {
  try {
    const capitalsRes = await db.query("SELECT * FROM capitals");
    quiz = capitalsRes.rows;
    
    const flagsRes = await db.query("SELECT * FROM flags");
    quiz1 = flagsRes.rows;
  } catch (err) {
    console.error("Error fetching quiz data:", err.stack);
  }
}

// Function to randomly generate the next question
async function nextQuestion() {
  if (quiz.length === 0 || quiz1.length === 0) {
    throw new Error("Quiz data not available");
  }

  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
  
  console.log('Selected Country:', currentQuestion);
}

// GET home page (getting the homepage)
app.get("/", async (req, res) => {
  try {
    // Ensure quiz is populated before proceeding
    if (quiz.length === 0 || quiz1.length === 0) {
      return res.status(500).send('Quiz data not available');
    }
    totalCorrect = 0;
    await nextQuestion();
    res.render("index.ejs", { question: currentQuestion});
  } catch (error) {
    console.error('Error while loading home page:', error);
    res.status(500).send('Internal server error');
  }
});

// POST submit answer
app.post("/submit", async (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }

  await nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Start the server
app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);

  // Fetch the quiz data when the server starts
  await fetchQuizData();
});
