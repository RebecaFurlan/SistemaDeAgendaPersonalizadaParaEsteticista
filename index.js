const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // Importe o módulo de sessão
const connection = require('./database/connection');
const app = express();
const path = require('path');

// Middlewares - Recebe as mensagens JSON
app.use(express.json());

// Database
connection.authenticate()
  .then(() => {
    console.log('Conexão feita com sucesso no banco!');
  })
  .catch(error => {
    console.log(error);
  });

// Models
const cliente = require('./src/models/cliente');
const servico = require('./src/models/servico');
const agendamento = require('./src/models/agendamento');
const login = require('./src/models/login');


// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Static
app.use(express.static('public'));

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurar a sessão
app.use(session({
  secret: 'secretpassword',
  resave: false,
  saveUninitialized: true
}));

// Rotas
app.use('/login', require('./src/routes/login.route'));
app.use('/servico', require('./src/routes/servico.route'));
app.use('/agendamento', require('./src/routes/agendamento.route'));
app.use('/cliente', require('./src/routes/cliente.route'));


app.get('/', (req, res) => {
  res.render('./index.ejs');
});

app.listen(3000, () => {
  console.log('Servidor Iniciado, porta 3000');
});
