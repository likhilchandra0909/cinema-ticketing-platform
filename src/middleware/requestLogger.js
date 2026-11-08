const logger = require("./logger");

function requestLogger(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
        logger.info("HTTP request", {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTimeMs: Date.now() - start
        });
    });

    next();
}

module.exports = requestLogger;
