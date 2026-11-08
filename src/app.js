
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Cinema Ticketing Platform API",
        version: "1.0.0"
    });
});

// Health endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Cinema Ticketing API",
        timestamp: new Date().toISOString()
    });
});

module.exports = app;
