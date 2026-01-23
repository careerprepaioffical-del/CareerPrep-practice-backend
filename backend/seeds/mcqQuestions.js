const MCQQuestion = require('./models/MCQQuestion');

// Sample MCQ questions for web development topics
const sampleQuestions = [
  // HTML Questions
  {
    question: "Which HTML5 element is used to draw graphics via JavaScript?",
    options: [
      { text: "<graphics>", isCorrect: false },
      { text: "<canvas>", isCorrect: true },
      { text: "<draw>", isCorrect: false },
      { text: "<svg>", isCorrect: false }
    ],
    explanation: "The <canvas> element is used in HTML5 to draw graphics, animations, and other visual images on the fly via JavaScript.",
    topic: "html",
    difficulty: "easy",
    tags: ["html5", "canvas", "graphics"]
  },
  {
    question: "What is the purpose of the 'alt' attribute in an <img> tag?",
    options: [
      { text: "To specify the image source", isCorrect: false },
      { text: "To provide alternative text for screen readers", isCorrect: true },
      { text: "To set the image alignment", isCorrect: false },
      { text: "To define the image size", isCorrect: false }
    ],
    explanation: "The 'alt' attribute provides alternative text for an image, which is important for accessibility and displays when the image cannot be loaded.",
    topic: "html",
    difficulty: "easy",
    tags: ["html", "accessibility", "img"]
  },
  {
    question: "Which semantic HTML5 element would be most appropriate for navigation links?",
    options: [
      { text: "<navigation>", isCorrect: false },
      { text: "<menu>", isCorrect: false },
      { text: "<nav>", isCorrect: true },
      { text: "<links>", isCorrect: false }
    ],
    explanation: "The <nav> element is specifically designed to contain navigation links, providing semantic meaning to navigation sections.",
    topic: "html",
    difficulty: "easy",
    tags: ["html5", "semantic", "navigation"]
  },
  {
    question: "What does the 'defer' attribute do when used with a <script> tag?",
    options: [
      { text: "Stops script execution", isCorrect: false },
      { text: "Loads script asynchronously", isCorrect: false },
      { text: "Executes script after HTML parsing", isCorrect: true },
      { text: "Caches the script", isCorrect: false }
    ],
    explanation: "The 'defer' attribute tells the browser to download the script but wait until the HTML document has been fully parsed before executing it.",
    topic: "html",
    difficulty: "medium",
    tags: ["html", "script", "performance"]
  },

  // CSS Questions
  {
    question: "Which CSS property is used to change the text color of an element?",
    options: [
      { text: "text-color", isCorrect: false },
      { text: "font-color", isCorrect: false },
      { text: "color", isCorrect: true },
      { text: "text-style", isCorrect: false }
    ],
    explanation: "The 'color' property in CSS is used to set the text color of an element.",
    topic: "css",
    difficulty: "easy",
    tags: ["css", "text", "color"]
  },
  {
    question: "What does CSS stand for?",
    options: [
      { text: "Computer Style Sheets", isCorrect: false },
      { text: "Creative Style Sheets", isCorrect: false },
      { text: "Cascading Style Sheets", isCorrect: true },
      { text: "Colorful Style Sheets", isCorrect: false }
    ],
    explanation: "CSS stands for Cascading Style Sheets, which describes how HTML elements should be displayed.",
    topic: "css",
    difficulty: "easy",
    tags: ["css", "basics", "terminology"]
  },
  {
    question: "Which CSS selector selects elements with a specific class?",
    options: [
      { text: "#classname", isCorrect: false },
      { text: ".classname", isCorrect: true },
      { text: "*classname", isCorrect: false },
      { text: "classname", isCorrect: false }
    ],
    explanation: "The class selector in CSS uses a dot (.) followed by the class name to select elements with that specific class.",
    topic: "css",
    difficulty: "easy",
    tags: ["css", "selectors", "class"]
  },
  {
    question: "What is the CSS box model?",
    options: [
      { text: "A way to create 3D boxes", isCorrect: false },
      { text: "A layout model for HTML elements", isCorrect: true },
      { text: "A method for organizing CSS files", isCorrect: false },
      { text: "A CSS framework", isCorrect: false }
    ],
    explanation: "The CSS box model is a layout model that consists of content, padding, border, and margin that wraps around every HTML element.",
    topic: "css",
    difficulty: "medium",
    tags: ["css", "box-model", "layout"]
  },
  {
    question: "Which CSS property is used to create flexible layouts?",
    options: [
      { text: "display: block", isCorrect: false },
      { text: "display: flex", isCorrect: true },
      { text: "display: grid", isCorrect: false },
      { text: "display: inline", isCorrect: false }
    ],
    explanation: "The 'display: flex' property creates a flexible container that enables flexible layout and alignment of items.",
    topic: "css",
    difficulty: "medium",
    tags: ["css", "flexbox", "layout"]
  },

  // JavaScript Questions
  {
    question: "What is the correct syntax for referring to an external script called 'script.js'?",
    options: [
      { text: "<script href='script.js'>", isCorrect: false },
      { text: "<script name='script.js'>", isCorrect: false },
      { text: "<script src='script.js'>", isCorrect: true },
      { text: "<script file='script.js'>", isCorrect: false }
    ],
    explanation: "The 'src' attribute is used to specify the URL of an external script file in HTML.",
    topic: "javascript",
    difficulty: "easy",
    tags: ["javascript", "script", "html"]
  },
  {
    question: "How do you create a function in JavaScript?",
    options: [
      { text: "function = myFunction() {}", isCorrect: false },
      { text: "function myFunction() {}", isCorrect: true },
      { text: "function:myFunction() {}", isCorrect: false },
      { text: "create myFunction() {}", isCorrect: false }
    ],
    explanation: "Functions in JavaScript are declared using the 'function' keyword followed by the function name and parentheses.",
    topic: "javascript",
    difficulty: "easy",
    tags: ["javascript", "functions", "basics"]
  },
  {
    question: "How do you call a function named 'myFunction'?",
    options: [
      { text: "call myFunction()", isCorrect: false },
      { text: "myFunction()", isCorrect: true },
      { text: "execute myFunction()", isCorrect: false },
      { text: "run myFunction()", isCorrect: false }
    ],
    explanation: "Functions are called by using the function name followed by parentheses.",
    topic: "javascript",
    difficulty: "easy",
    tags: ["javascript", "functions", "calling"]
  },
  {
    question: "What is the correct JavaScript syntax to change the content of an HTML element?",
    options: [
      { text: "document.getElement('p').innerHTML = 'Hello';", isCorrect: false },
      { text: "#demo.innerHTML = 'Hello';", isCorrect: false },
      { text: "document.getElementById('demo').innerHTML = 'Hello';", isCorrect: true },
      { text: "document.getElementByName('p').innerHTML = 'Hello';", isCorrect: false }
    ],
    explanation: "The getElementById() method is used to access an HTML element by its ID, and innerHTML property changes its content.",
    topic: "javascript",
    difficulty: "medium",
    tags: ["javascript", "dom", "manipulation"]
  },
  {
    question: "What is the difference between 'let' and 'const' in JavaScript?",
    options: [
      { text: "There is no difference", isCorrect: false },
      { text: "'let' can be reassigned, 'const' cannot", isCorrect: true },
      { text: "'const' can be reassigned, 'let' cannot", isCorrect: false },
      { text: "'let' is function scoped, 'const' is block scoped", isCorrect: false }
    ],
    explanation: "Both 'let' and 'const' are block scoped, but 'let' allows reassignment while 'const' creates a constant that cannot be reassigned.",
    topic: "javascript",
    difficulty: "medium",
    tags: ["javascript", "es6", "variables"]
  },

  // React Questions
  {
    question: "What is React?",
    options: [
      { text: "A database system", isCorrect: false },
      { text: "A JavaScript library for building user interfaces", isCorrect: true },
      { text: "A CSS framework", isCorrect: false },
      { text: "A backend framework", isCorrect: false }
    ],
    explanation: "React is a JavaScript library developed by Facebook for building user interfaces, particularly web applications with complex UIs.",
    topic: "react",
    difficulty: "easy",
    tags: ["react", "basics", "library"]
  },
  {
    question: "What is JSX?",
    options: [
      { text: "JavaScript XML", isCorrect: true },
      { text: "Java Syntax Extension", isCorrect: false },
      { text: "JavaScript Extension", isCorrect: false },
      { text: "JSON XML", isCorrect: false }
    ],
    explanation: "JSX stands for JavaScript XML. It is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.",
    topic: "react",
    difficulty: "easy",
    tags: ["react", "jsx", "syntax"]
  },
  {
    question: "What hook is used to manage state in functional components?",
    options: [
      { text: "useEffect", isCorrect: false },
      { text: "useState", isCorrect: true },
      { text: "useContext", isCorrect: false },
      { text: "useReducer", isCorrect: false }
    ],
    explanation: "The useState hook is used to add state to functional components in React.",
    topic: "react",
    difficulty: "easy",
    tags: ["react", "hooks", "state"]
  },
  {
    question: "What is the purpose of useEffect hook?",
    options: [
      { text: "To manage state", isCorrect: false },
      { text: "To handle side effects", isCorrect: true },
      { text: "To create context", isCorrect: false },
      { text: "To optimize performance", isCorrect: false }
    ],
    explanation: "The useEffect hook is used to handle side effects in functional components, such as data fetching, subscriptions, or DOM manipulation.",
    topic: "react",
    difficulty: "medium",
    tags: ["react", "hooks", "effects"]
  },
  {
    question: "What is props in React?",
    options: [
      { text: "Private data for components", isCorrect: false },
      { text: "Read-only inputs to components", isCorrect: true },
      { text: "State management", isCorrect: false },
      { text: "CSS properties", isCorrect: false }
    ],
    explanation: "Props (short for properties) are read-only inputs that are passed from parent to child components in React.",
    topic: "react",
    difficulty: "medium",
    tags: ["react", "props", "components"]
  },

  // Node.js Questions
  {
    question: "What is Node.js?",
    options: [
      { text: "A JavaScript framework", isCorrect: false },
      { text: "A JavaScript runtime built on Chrome's V8 engine", isCorrect: true },
      { text: "A database system", isCorrect: false },
      { text: "A CSS preprocessor", isCorrect: false }
    ],
    explanation: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine that allows running JavaScript on the server side.",
    topic: "nodejs",
    difficulty: "easy",
    tags: ["nodejs", "basics", "runtime"]
  },
  {
    question: "What is NPM?",
    options: [
      { text: "Node Package Manager", isCorrect: true },
      { text: "New Package Manager", isCorrect: false },
      { text: "Node Program Manager", isCorrect: false },
      { text: "Network Package Manager", isCorrect: false }
    ],
    explanation: "NPM stands for Node Package Manager and is the default package manager for Node.js, used to install and manage JavaScript packages.",
    topic: "nodejs",
    difficulty: "easy",
    tags: ["nodejs", "npm", "packages"]
  },
  {
    question: "Which module is used to create a web server in Node.js?",
    options: [
      { text: "http", isCorrect: true },
      { text: "server", isCorrect: false },
      { text: "web", isCorrect: false },
      { text: "createServer", isCorrect: false }
    ],
    explanation: "The built-in 'http' module in Node.js is used to create HTTP servers and handle web requests.",
    topic: "nodejs",
    difficulty: "easy",
    tags: ["nodejs", "http", "server"]
  },
  {
    question: "What is the purpose of package.json in Node.js?",
    options: [
      { text: "To store application metadata", isCorrect: true },
      { text: "To compile JavaScript", isCorrect: false },
      { text: "To run tests", isCorrect: false },
      { text: "To style the application", isCorrect: false }
    ],
    explanation: "The package.json file contains metadata about the project, including dependencies, scripts, version, and other configuration information.",
    topic: "nodejs",
    difficulty: "medium",
    tags: ["nodejs", "package", "configuration"]
  },
  {
    question: "What is Express.js?",
    options: [
      { text: "A database for Node.js", isCorrect: false },
      { text: "A web application framework for Node.js", isCorrect: true },
      { text: "A testing framework", isCorrect: false },
      { text: "A CSS framework", isCorrect: false }
    ],
    explanation: "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.",
    topic: "nodejs",
    difficulty: "medium",
    tags: ["nodejs", "express", "framework"]
  }
];

// Seed function to populate the database
async function seedMCQQuestions() {
  try {
    await MCQQuestion.deleteMany({}); // Clear existing questions
    
    const questions = await MCQQuestion.insertMany(sampleQuestions);
    console.log(`Successfully seeded ${questions.length} MCQ questions`);
    return questions;
  } catch (error) {
    console.error('Error seeding MCQ questions:', error);
    throw error;
  }
}

module.exports = {
  seedMCQQuestions,
  sampleQuestions
};
