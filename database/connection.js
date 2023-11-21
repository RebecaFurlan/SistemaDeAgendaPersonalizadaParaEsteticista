const Sequelize = require("sequelize");

const connection = new Sequelize('agenda','root','LES@1234',{
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
});

module.exports= connection;