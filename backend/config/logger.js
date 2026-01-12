/**
 * Centralized logging configuration
 * Replaces console.log with structured logging
 */

const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }

    _formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };

        if (this.isDevelopment) {
            // Pretty print in development
            const emoji = {
                ERROR: '❌',
                WARN: '⚠️',
                INFO: 'ℹ️',
                DEBUG: '🔍'
            }[level] || '📝';
            
            console.log(`${emoji} [${timestamp}] ${level}: ${message}`, meta);
        } else {
            // JSON format in production for log aggregation
            console.log(JSON.stringify(logEntry));
        }
    }

    error(message, meta = {}) {
        this._formatMessage(LOG_LEVELS.ERROR, message, meta);
    }

    warn(message, meta = {}) {
        this._formatMessage(LOG_LEVELS.WARN, message, meta);
    }

    info(message, meta = {}) {
        this._formatMessage(LOG_LEVELS.INFO, message, meta);
    }

    debug(message, meta = {}) {
        if (this.isDevelopment) {
            this._formatMessage(LOG_LEVELS.DEBUG, message, meta);
        }
    }
}

module.exports = new Logger();
