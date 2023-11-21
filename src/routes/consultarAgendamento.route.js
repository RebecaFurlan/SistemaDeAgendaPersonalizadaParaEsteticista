const express = require("express");
const router = express.Router();
const Agendamento = require("../models/agendamento");
const Cliente = require("../models/cliente");
const { format } = require('date-fns');

function verificaAutenticacao(req, res, next) {
    // Verificar se a sessão do usuário existe
    if (req.session.user) {
        // Se estiver autenticado, continua com a próxima rota
        next();
    } else {
        // Se não estiver autenticado, redireciona para a página home
        res.redirect('/');
    }
}

router.post('/verifica-agendamentos', async (req, res) => {
    try {
        const cpf = req.body.cpf;
        const numero = req.body.numero;
        let cliente;

        if (cpf != undefined) {
            cliente = await Cliente.findOne({
                where: {
                    CPF: cpf
                }
            });
        } else if (numero != undefined) {
            cliente = await Cliente.findOne({
                where: {
                    whatsapp: numero
                }
            });
        } else {
            cliente = {
                mensagem: 'Usuário Inválido'
            };
        }

        if (cliente != undefined) {
            const agendamentos = await Agendamento.findAll({
                where: {
                    ClientId: cliente.id
                }
            });

            const agendamentosInfo = [];

            for (const agendamento of agendamentos) {
                const servico = await Servico.findOne({
                    where: {
                        id: agendamento.ServicoId
                    }
                });
                agendamentosInfo.push({
                    data: agendamento.data,
                    hora: agendamento.hora,
                    servico: servico.nome
                });
            }

            res.render('meus-agendamentos', {
                cliente,
                agendamentos: agendamentosInfo
            });
        } else {
            res.render('meus-agendamentos', { cliente });
        }
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});



module.exports = router;