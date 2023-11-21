const Sequelize = require("sequelize");
const connection = require("../../database/connection");


const Login = connection.define('Login', {
  user: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pass: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Após a sincronização para criar o usuário administrador
Login.afterSync(() => {
  return Login.findOrCreate({
    where: { user: 'admin' },
    defaults: { pass: '12345' },
  }).then(([user, created]) => {
    if (created) {
      console.log('Usuário administrador criado com sucesso.');
    } else {
      console.log('Usuário administrador já existe.');
    }
  }).catch(error => {
    console.error('Erro ao criar usuário administrador:', error);
  });
});


Login.sync({force: true});
module.exports = Login;