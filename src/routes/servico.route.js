const express = require("express");
const router  =  express.Router();
const Servico =  require("../models/servico");
const Agendamento = require("../models/agendamento");

//VALIDA SESSÃO

function verificaAutenticacao(req, res, next) {
    // Verifique se a sessão do usuário existe
    if (req.session.user) {
        // Se estiver autenticado, continue com a próxima rota
        next();
    } else {
        // Se não estiver autenticado, redirecione para a página de login
        res.redirect('/');
    }
}

//INSERT


//Renderiza formulario para Cadastro
router.get('/', verificaAutenticacao, async (req, res) => {
    try {
        res.render("admin/servicos/servico");
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});


//Criar serviço
router.post('/', verificaAutenticacao, async (req, res) => {
    try{
        const servico = await new Servico(req.body).save();
        res.redirect("/servico/admin-servicos");
    }catch(err){
        res.json({error: true, message: err.message});
    }
}); 

//SELECT

//Buscar Serviços
router.get('/admin-servicos', verificaAutenticacao,async (req, res)=>{
    try{
        const servicos = await Servico.findAll();
        res.render('admin/servicos/admin-servicos', { servicos });
    }catch(err){
        res.status(500).json({ error: true, message: err.message });
    }
});


//UPDATE

router.post('/atualizando', verificaAutenticacao, async (req, res) => {
    try {
        const idServico = req.body.id;

        if (!isNaN(idServico)) {
            // Verificar se o cliente tem agendamento ativo
            const servico = await Servico.findOne({
                where: {
                    id: idServico
                }
            });

            res.render("admin/servicos/atualizar-servicos",{servico});
        }
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});


//Atualizar
router.post('/atualizar', verificaAutenticacao, async (req, res) => {
    try {
        const { nome, descricao} = req.body;
        const idServico = req.body.id;


        if(!isNaN(idServico)){

            const servico = await Servico.findOne({
                where: {
                    id: idServico
                }
            });

            await Servico.update(
                {
                    nome
                },
                {
                    where: {
                        id: idServico,
                    },
                }
            );


            res.redirect('/servico/admin-servicos');
        }
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});


//DELETE

//deletar
router.post('/deletar',verificaAutenticacao,  async (req, res) => {
    try {
        const idServico = req.body.id;

        if (!isNaN(idServico)) {
            // Verificar se o cliente tem agendamento ativo
            const servicoComAgendamentoAtivo = await Servico.findOne({
                where: {
                    id: idServico
                },
                include: [Agendamento],
            });

            const servicos = await Servico.findAll({});

            if (servicoComAgendamentoAtivo.Agendamentos.some(agendamento => agendamento.status === 'Ativo')) {

                return res.render('admin/servicos/admin-servicos', { error: 'Não é possível excluir. O servico esta em um agendamento ativo.', servicos });
            }else{

                await Agendamento.destroy({
                    where: {
                        servicoId: idServico,
                        status: 'Inativo'
                    }
                });
            }
               
                await Servico.destroy({
                    where: {
                        id: idServico
                    }
                });

            res.redirect("/servico/admin-servicos");
        }
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

module.exports = router;