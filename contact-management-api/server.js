const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

app.use(bodyParser.json());

// Mock Database
let users = [];
let courses = [];

// Secret Key for JWT
const SECRET_KEY = "SuperSecretKey123";

// Register User
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.json({ message: "User registered successfully" });
});

// Login User
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Middleware to verify token
const authenticate = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(403).json({ message: "Access denied" });
    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};

// Create Course
app.post("/courses", authenticate, (req, res) => {
    const { title, description } = req.body;
    const newCourse = { id: courses.length + 1, title, description, creator: req.user.username };
    courses.push(newCourse);
    res.json({ message: "Course created successfully", course: newCourse });
});

// Get All Courses
app.get("/courses", authenticate, (req, res) => {
    res.json(courses);
});

// Update Course
app.put("/courses/:id", authenticate, (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).json({ message: "Course not found" });
    Object.assign(course, req.body);
    res.json({ message: "Course updated successfully", course });
});

// Delete Course
app.delete("/courses/:id", authenticate, (req, res) => {
    courses = courses.filter(c => c.id !== parseInt(req.params.id));
    res.json({ message: "Course deleted successfully" });
});

// Root Route
app.get("/", (req, res) => {
    res.send("Server is running successfully with authentication and CRUD operations!");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






           