const express = require("express");
const router  =  express.Router();
const session = require('express-session');
const Login = require("../models/login");

router.use(session({
    // A opção 'secret' é usada para criar uma chave secreta para assinar as sessões.
    secret: 'secretpassword',

    // A opção 'resave' controla se as sessões devem ser regravadas no armazenamento,
    // mesmo que não tenham sido modificadas durante a solicitação.
    resave: false,

    // A opção 'saveUninitialized' determina se as sessões devem ser salvas para solicitações
    // que ainda não inicializaram dados de sessão.
    saveUninitialized: true
}));


// Rota GET para a página de login
router.get('/', (req, res) => {
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;

    try {
        res.render('login', { error: errorMessage });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});


// Rota POST para autenticação
router.post('/', async (req, res) => {
    const usuario = req.body;
    try {


        const login = await Login.findOne({
            where: {
              user: 'admin'
            }
          });

        const user = login.user;
        const pass = login.pass;

        console.log(user, pass);
        if (usuario.user === user && usuario.pass === pass) {
            req.session.user = { username: usuario.user };
            res.status(200).redirect('agendamento/agenda-dia');
        } else {
            // Defina a mensagem de erro na sessão
            req.session.errorMessage = 'Credenciais incorretas';
            res.status(401).redirect('/login');
        }
    } catch (err) {
        res.status(500).send('Erro interno do servidor');
    }
});


// Rota para fazer o logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        } else {
            res.redirect('/'); // Redirecione para a página inicial após o logout
        }
    }); 
});

module.exports = router;
