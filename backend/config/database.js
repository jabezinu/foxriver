const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'foxriver-db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '1q0p2w9o',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.NODE_ENV === 'production' ? false : (msg) => logger.debug(msg),
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info(`MySQL Connected: ${sequelize.config.host}`);

        // For development, use alter: true but with error handling
        // For production, use force: false to avoid schema changes
        const syncOptions = process.env.NODE_ENV === 'production' 
            ? { force: false } 
            : { alter: false }; // Changed from alter: true to avoid index issues

        try {
            await sequelize.sync(syncOptions);
            logger.info('Database synchronized');
        } catch (syncError) {
            logger.warn('Database sync failed, continuing without sync', { error: syncError.message });
            // Continue without sync - the database should already exist
        }
    } catch (error) {
        logger.error('MySQL connection failed', { error: error.message });
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
