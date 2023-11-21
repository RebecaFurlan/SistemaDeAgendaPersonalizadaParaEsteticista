const Sequelize = require("sequelize");
const connection = require("../../database/connection");
const Cliente = require('./cliente'); 
const Servico = require('./servico'); 

const Agendamento = connection.define('Agendamento', {
    data: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    status: {
        type: Sequelize.ENUM('Ativo', 'Inativo', 'Cancelado'),
        allowNull: false,
    }
    // Outros campos do agendamento
});
  


// Relacionamentos

//Um Cliente pode ter vários Agendamentos
Cliente.hasMany(Agendamento, { onDelete: 'RESTRICT' });
//Um Agendamento pertence a um Cliente
Agendamento.belongsTo(Cliente);


//Um Serviço pode ter vários Agendamentos
Servico.hasMany(Agendamento, { onDelete: 'RESTRICT' });
//Um Agendamento está relacionado a um Serviço
Agendamento.belongsTo(Servico);

Agendamento.sync({force: true});
module.exports = Agendamento;