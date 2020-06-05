var Sequelize = require("sequelize");
const sequelize = require("../Model/index.js");
const TOKEN_REFESH = sequelize.define('TOKEN_REFESH', {
    id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: Sequelize.BIGINT, allowNull: false },
    token_refesh: { type: Sequelize.STRING(255), allowNull: false },
    client : { type: Sequelize.STRING(1024) },
    create_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
}, {
    timestamps: false,
    tableName: "token_refesh",
});
module.exports = TOKEN_REFESH;