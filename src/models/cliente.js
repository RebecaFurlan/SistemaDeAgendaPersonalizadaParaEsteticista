const Sequelize = require("sequelize");
const connection = require("../../database/connection");

const Cliente = connection.define('Cliente', {
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    CPF: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, 
    },
    RG: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, 
    },
    endereco: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    whatsapp: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, 
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  });
  
Cliente.sync({force: true});
module.exports = Cliente;