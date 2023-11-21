const express = require("express");
const router = express.Router();
const Agendamento = require("../models/agendamento");
const Servico = require("../models/servico");
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

//Verificar a lista de horarios alocados e horários vagos para "agenda-dia.ejs"
router.get('/agenda-dia', verificaAutenticacao, async (req, res) => {
    try {
        const agora = new Date();
        
        if (agora.getDay() === 0) {
            res.render('admin/agendamentos/agenda-indisponivel-no-domingo');
        } else {
            const dataFormatada = format(agora, 'yyyy-MM-dd');

            const horariosPossiveis = [
                '09:00:00',
                '10:00:00',
                '11:00:00',
                '13:00:00',
                '14:00:00',
                '15:00:00',
                '16:00:00',
                '17:00:00',
                '18:00:00'
            ];

            const agendamentos = await Agendamento.findAll({
                where: {
                    data: dataFormatada
                },
                include: [
                    { model: Cliente },
                    { model: Servico }
                ]
            });



            const horariosAgendados = agendamentos.map(agendamento => agendamento.hora);

            const horariosDisponiveis = horariosPossiveis.filter(horario => !horariosAgendados.includes(horario));

            // Criar uma lista única de horários com status
            const horariosComStatus = [];

            for (let i = 0; i < horariosPossiveis.length; i++) {
                const horario = horariosPossiveis[i];
                const agendado = agendamentos.find(ag => ag.hora === horario);
                const dataHorarioPossiveis = new Date(dataFormatada + ' ' + horario);
                const dataAtual = new Date();
            
                if (agendado) {
                    horariosComStatus.push({
                        horario,
                        status: `${agendado.Cliente.nome} | Serviço: ${agendado.Servico.nome}  | CPF: ${agendado.Cliente.CPF} | TELEFONE: ${agendado.Cliente.whatsapp} `
                    });
                } else if (dataHorarioPossiveis <= dataAtual) {
                    horariosComStatus.push({
                        horario,
                        status: 'Horario não agendado!'
                    });
                } else {
                    horariosComStatus.push({
                        horario,
                        status: 'Disponível'
                    });
                }
            }



            const agendamentosParaInativar = await Agendamento.findAll({ });
             // Verificar se algum agendamento passou do horário atual e atualizar para Inativo
             for (let i = 0; i < agendamentosParaInativar.length; i++) {
                const agendamento = agendamentosParaInativar[i];
                const dataAgendamento = new Date(`${dataFormatada} ${agendamento.hora}`);
                const dataAtual = new Date();

                if (agendamento.status === 'Ativo' && dataAgendamento <= dataAtual) {
                    await Agendamento.update({ status: 'Inativo' }, { where: { id: agendamento.id } });
                }
            }

            
            
            res.render('admin/agendamentos/agenda-dia', { horariosComStatus });
        }
    } catch (err) {
        res.status(500).send('Erro interno do servidor');
    }
});


//Admin Agendamneto
router.get('/admin-agendamentos', verificaAutenticacao, async (req, res) => {
    try {
        const agendamentos = await Agendamento.findAll({
            include: [
                { model: Cliente },
                { model: Servico }
            ]
        });
        res.render('admin/agendamentos/admin-agendamentos', { agendamentos });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});


//Listar Serviços e Clientes na tela agendamento.ejs
router.get('/', verificaAutenticacao, async (req, res) => {
    try {
        const clientes = await Cliente.findAll();
        const servicos = await Servico.findAll(); 

        res.render('admin/agendamentos/agendamento', { servicos, clientes });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});


router.post('/horarios-disponiveis',verificaAutenticacao, async (req, res) => {
    try {
        const data = req.body.data;
        const clienteid = req.body.ClienteId;
        const servicoid = req.body.ServicoId;

        const cliente = await Cliente.findOne({
            where: {
                id: clienteid
            }
        });

        const servico = await Servico.findOne({
            where: {
                id: servicoid
            }
        });

        const agora = new Date();
        const horariosPossiveis = [
            '09:00:00',
            '10:00:00',
            '11:00:00',
            '13:00:00',
            '14:00:00',
            '15:00:00',
            '16:00:00',
            '17:00:00',
            '18:00:00'
        ];
        
        const horariosFiltrados = [];
        
        for (let i = 0; i < horariosPossiveis.length; i++) {
            const horario = horariosPossiveis[i];
            const horaAgendamento = new Date(data + ' ' + horario);
        
            if (horaAgendamento > agora) {
                horariosFiltrados.push(horario);
            }
        }

        // findAll para encontrar os agendamentos existentes para a data específica
        const agendamentos = await Agendamento.findAll({
            where: {
                data: data
            }
        });

        // Cria uma lista dos horários já agendados para esta data
        const horariosAgendados = agendamentos.map(agendamento => agendamento.hora);
        console.log({horariosAgendados})
        // Remove os horários agendados dos horários possíveis para obter os horários disponíveis
        const horariosDisponiveis = horariosFiltrados.filter(horario => !horariosAgendados.includes(horario));
        
       

        res.render('admin/agendamentos/horarios-disponiveis', { horariosDisponiveis,cliente,servico,data })
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});


//Criar agendamento
router.post('/agendar', verificaAutenticacao, async (req, res) => {
    try {
        const agendamento = await new Agendamento(req.body).save();
        res.redirect("/agendamento/admin-agendamentos");
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});



//deletar
router.post('/deletar', verificaAutenticacao, async (req, res) => {
    try {
       const idAgendamento = req.body.id;

       if(!isNaN(idAgendamento)){
            Agendamento.destroy({
                where:{
                    id: idAgendamento
                }
            }).then(()=>{
                res.redirect("/agendamento/admin-agendamentos");
            }).catch((err) => {
                res.status(500).json({ error: true, message: err.message });
            })
        }   
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});



// Rota para editar um agendamento
router.get("/:id", verificaAutenticacao, async (req, res) => {
    const idAgendamento = req.params.id;
    try {
        if (idAgendamento != undefined) {
            const agendamento = await Agendamento.findOne({
                where: {
                    id: idAgendamento,
                },
            });


            const cliente = await Cliente.findAll();
            const servico = await Servico.findAll(); 

           
            const dataAgendamento = agendamento.data;
          
            res.render("admin/agendamentos/atualizar-agendamento", { agendamento, cliente, servico, dataAgendamento });
        } else {
            res.redirect("/agendamento/admin-agendamentos");
        }
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

router.post('/horarios-disponiveis-atua',verificaAutenticacao, async (req, res) => {
    try {
        const data = req.body.data;
        const clienteid = req.body.ClienteId;
        const servicoid = req.body.ServicoId;
        const agendamentoID = req.body.agendamento;

        const cliente = await Cliente.findOne({
            where: {
                id: clienteid
            }
        });

        const servico = await Servico.findOne({
            where: {
                id: servicoid
            }
        });

        const agendamentoHora = await Agendamento.findOne({
            where: {
                id: agendamentoID
            }
        });

        const agora = new Date();
        const horariosPossiveis = [
            '09:00:00',
            '10:00:00',
            '11:00:00',
            '13:00:00',
            '14:00:00',
            '15:00:00',
            '16:00:00',
            '17:00:00',
            '18:00:00'
        ];
        
        const horariosFiltrados = [];
        
        for (let i = 0; i < horariosPossiveis.length; i++) {
            const horario = horariosPossiveis[i];
            const horaAgendamento = new Date(data + ' ' + horario);
        
            if (horaAgendamento > agora) {
                horariosFiltrados.push(horario);
            }
        }

        // findAll para encontrar os agendamentos existentes para a data específica
        const agendamentos = await Agendamento.findAll({
            where: {
                data: data
            }
        });

        // Cria uma lista dos horários já agendados para esta data
        const horariosAgendados = agendamentos.map(agendamento => agendamento.hora);

        // Remove os horários agendados dos horários possíveis para obter os horários disponíveis
        const horariosDisponiveis = horariosFiltrados.filter(horario => !horariosAgendados.includes(horario));
        horariosDisponiveis.push(agendamentoHora.hora);
        
       

        res.render('admin/agendamentos/horarios-disponiveis-atua', { horariosDisponiveis,cliente,servico,data, agendamentoID})
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});


// Rota para atualizar um agendamento
router.post('/atualizar', verificaAutenticacao, async (req, res) => {
    try {
        const { data, ClienteId, ServicoId, hora } = req.body;


        const idAgendamento = req.body.agendamentoID;


        await Agendamento.update(
            {
                data,
                ClienteId,
                ServicoId,
                hora
            },
            {
                where: {
                    id: idAgendamento,
                },
            }
        );


        res.redirect('/agendamento/admin-agendamentos');

    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});



router.post('/verifica-agendamentos', async (req, res) => {
    try {
        const cpf = req.body.cpf;
        const whatsapp = req.body.whatsapp;
        let cliente = {};
        let agendamentos = [];

        if (cpf) {
            cliente = await Cliente.findOne({
                where: {
                    CPF: cpf
                }
            });
        } else if (whatsapp) {
            cliente = await Cliente.findOne({
                where: {
                    whatsapp: whatsapp
                }
            });
        } else {
            cliente = {
                mensagem: 'Usuário Inválido'
            };
        }

        if (cliente != undefined) {
            agendamentos = await Agendamento.findAll({
                where: {
                    ClienteId: cliente.id
                }
            });

            const agendamentosInfo = [];

            const dataAtual = new Date();
            
            for (let i = 0; i < agendamentos.length; i++) {
                const agendamento = agendamentos[i];
                const dataAgendamento = new Date(agendamento.data);
            
              
                const anoAtual = dataAtual.getFullYear();
                const mesAtual = dataAtual.toLocaleDateString('pt-BR', { month: '2-digit' });
                const diaAtual = dataAtual.toLocaleDateString('pt-BR', { day: '2-digit' });
                const dataAtualFormatada = `${anoAtual}-${mesAtual}-${diaAtual}`;
                const dataAtualComparacao = new Date(dataAtualFormatada);
            
            
                if (dataAgendamento >= dataAtualComparacao) {
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
            }
            

            res.render('admin/agendamentos/meus-agendamentos', {
                cliente,
                agendamentos: agendamentosInfo
            });
        } else {
            res.render('admin/agendamentos/meus-agendamentos', { cliente, agendamentos });
        }
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});






module.exports = router;