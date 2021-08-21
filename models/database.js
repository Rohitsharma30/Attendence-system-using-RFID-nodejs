const Sequelize = require('sequelize');
const db = require('../connection/connect');

module.exports = db.define('attend', {
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    name:{
        type: Sequelize.TEXT
    },
    rfid:{
        type: Sequelize.TEXT,
        primaryKey: true
    },
    attendence:{
        type: Sequelize.INTEGER
    }
})