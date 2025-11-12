const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { GoogleGenAI } = require('@google/genai');

// Initialize Google GenAI client
// NOTE: Ensure the GEMINI_API_KEY environment variable is set.
const ai = new GoogleGenAI({});
const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: "You are NeuroNest, a friendly and supportive AI companion for a kid-friendly app that supports users with ADHD and dyslexia. Your persona is encouraging, patient, and gentle. Your primary goal is to provide emotional support, validate feelings, and offer constructive, simple suggestions. When a user expresses a feeling (e.g., 'I'm sad' or 'I'm anxious'), suggest a relevant activity from the app, such as a calming game (like Color Mixer), a focus game (like Focus Quest), or a relaxation exercise (like Deep Breathing). Keep your responses short, easy to read, and use positive language. Do not provide medical advice or complex instructions. Your tone should be like a helpful cartoon character."
    }
});

const app = express();
const PORT = 3003;
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files (index.html, script.js, style.css)


// Helper function to read users
const readUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading users file:", error.message);
        return [];
    }
};

// Helper function to write users
const writeUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing users file:", error.message);
    }
};

// Registration Endpoint
// Registration Endpoint
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = readUsers();

    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: 'User already exists.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, password: hashedPassword };
        users.push(newUser);
        writeUsers(users);
        res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    try {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // In a real application, you would generate and send a JWT or session token here.
            // For simplicity, we just confirm success.
            res.json({ message: 'Login successful.', user: { username: user.username } });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    try {
        const response = await chat.sendMessage({ message });
        res.json({ reply: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ message: 'Failed to get response from AI.', error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Remember to run "npm install" first if you haven\'t already.');
});