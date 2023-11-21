const Sequelize = require("sequelize");
const connection =  require("../../database/connection");

const Servico = connection.define('Servico', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
    descricao: {
        type: Sequelize.STRING
      }
      
})



Servico.sync({force: true});
module.exports = Servico;