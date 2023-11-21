const express = require("express");
const router  =  express.Router();
const Cliente = require("../models/cliente");
const Agendamento = require("../models/agendamento");
const { Op } = require('sequelize');
const cpfValidator = require('cpf');
const { id } = require("date-fns/locale");

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

//Admin Cliente
router.get('/admin-clientes', async (req, res) => {
    try {
        const clientes = await Cliente.findAll({});
        res.render('admin/clientes/admin-clientes', { clientes });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});


//Renderiza formulario para Cadastro
router.get('/', verificaAutenticacao, async (req, res) => {
    try {
        res.render("admin/clientes/cliente");
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});


//Criar Cliente
router.post('/', verificaAutenticacao, async (req, res) => {
    try {
        // Extrai informações do corpo da requisição
        const { CPF, RG, email } = req.body;

        // Verifica se CPF, RG ou e-mail já foram cadastrados
        const clienteExistente = await Cliente.findOne({
            where: {
                [Op.or]: [
                    { cpf: CPF },
                    { rg: RG },
                    { email: email }
                ]
            }
        });

          // Verifica se o CPF é válido usando a biblioteca cpf
          if (!cpfValidator.isValid(CPF)) {
            return res.render('admin/clientes/cliente', { error: 'CPF inválido.' });
            }

        // Se já existe um cliente com o mesmo CPF, RG ou e-mail, retorna uma mensagem
        if (clienteExistente) {
            return res.render('admin/clientes/cliente', { error: 'CPF, RG ou e-mail já cadastrado.' });
        }

        // Se não existe, cadastra o novo cliente
        const novoCliente = await new Cliente(req.body).save();
        
        res.redirect("/cliente/admin-clientes");
    } catch (err) {
        console.error(err);
        res.json({ error: true, message: err.message });
    }
});


router.post('/atualizando', verificaAutenticacao, async (req, res) => {
    try {
        const idCliente = req.body.id;

        if (!isNaN(idCliente)) {
            // Verificar se o cliente tem agendamento ativo
            const cliente = await Cliente.findOne({
                where: {
                    id: idCliente
                }
            });

            res.render("admin/clientes/atualizar-cliente",{cliente});
        }
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

//Atualizar
router.post('/atualizar', verificaAutenticacao, async (req, res) => {
    try {
        const { nome, CPF, RG, endereco, whatsapp, email} = req.body;
        const idCliente = req.body.id;


        if(!isNaN(idCliente)){
            const cliente = await Cliente.findOne({
                where: {
                    id: idCliente
                }
            });


            // Verifica se o CPF é válido usando a biblioteca cpf
            if (!cpfValidator.isValid(cliente.CPF)) {
                return res.render('admin/clientes/atualizar-cliente', { error: 'CPF inválido.',cliente });
            }



            await Cliente.update(
                {
                    nome,
                    CPF,
                    RG,
                    endereco,
                    whatsapp,
                    email
                },
                {
                    where: {
                        id: idCliente,
                    },
                }
            );


            res.redirect('/cliente/admin-clientes');
        }
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});
//deletar
router.post('/deletar', verificaAutenticacao, async (req, res) => {
    try {
        const idCliente = req.body.id;

        if (!isNaN(idCliente)) {
            // Verificar se o cliente tem agendamento ativo
            const clienteComAgendamentoAtivo = await Cliente.findOne({
                where: {
                    id: idCliente
                },
                include: [Agendamento], 
            });

            const clientes = await Cliente.findAll({});

            if (clienteComAgendamentoAtivo.Agendamentos.some(agendamento => agendamento.status === 'Ativo')) {

                return res.render('admin/clientes/admin-clientes', { error: 'Não é possível excluir. O cliente tem um agendamento ativo.', clientes });
            }else{
                // Se não houver agendamento ativo, proceder com a exclusão
                await Agendamento.destroy({
                    where: {
                        clienteId: idCliente,
                        status: 'Inativo'
                    }
                });

                await Cliente.destroy({
                    where: {
                        id: idCliente
                    }
                });

            }

            

            res.redirect("/cliente/admin-clientes");
        }
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});




module.exports = router;