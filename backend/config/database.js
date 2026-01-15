const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize('foxriver-db', 'root', '1q0p2w9o', {
    host: 'localhost',
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
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
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info(`MySQL Connected: ${sequelize.config.host}`);
        
        // Sync all models (in development)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: false });
            logger.info('Database synchronized');
        }
    } catch (error) {
        logger.error('MySQL connection failed', { error: error.message });
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
