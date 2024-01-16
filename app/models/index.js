const config = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  config.DATABASE_URL,
  {
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.dataType = DataTypes;

db.user = require("../models/user.model.js")(sequelize, DataTypes);
db.consumer = require("../models/consumer.model.js")(sequelize, DataTypes);
module.exports = db;