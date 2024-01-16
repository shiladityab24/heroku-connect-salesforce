require('dotenv').config()
module.exports = {
    DATABASE_URL: process.env.DATABASE_URL,
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000
    }
};
