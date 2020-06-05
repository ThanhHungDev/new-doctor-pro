var Sequelize = require("sequelize");
const sequelize = require("../Model/index.js");
const USER = sequelize.define('USER', {
    id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    email: { 
        type: Sequelize.STRING,
        unique: { args: true, msg: 'Email address already in use!' }
    }, 
    password : { type: Sequelize.STRING },
    mobile : { type: Sequelize.STRING },
    name : { type: Sequelize.STRING },
    avatar : { type: Sequelize.STRING },
    create_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    update_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
},{
    timestamps: false,
    tableName: "user_accounts",
});
module.exports = USER;