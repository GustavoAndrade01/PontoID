// O evento 'DOMContentLoaded' garante que o script só rode depois que o HTML estiver totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variáveis Globais Comuns ---
    const body = document.getElementById('body');
    const ModalSaida = document.getElementById('ModalSaida');
    const LinkSaida = document.getElementById('LinkSaida');
    const STORAGE_KEY_THEME = 'flowpoint_theme';

    // ----------------------------------------------------
    // Lógica de Confirmação de Saída (Comum a todas as páginas)
    // ----------------------------------------------------
    if (LinkSaida) {
        // Abre o modal de confirmação
        LinkSaida.addEventListener('click', (e) => {
            e.preventDefault();
            if (ModalSaida) {
                ModalSaida.style.display = 'flex';
                ModalSaida.style.alignItems = 'center';
                ModalSaida.style.justifyContent = 'center';
            } else {
                // Caso o modal não exista na página atual (para debug)
                console.error("Modal de logout não encontrado.");
                confirmarSaida(); 
            }
        });
    }

    // Fechar o modal
    window.fecharModalSaida = function() {
        if (ModalSaida) {
            ModalSaida.style.display = 'none';
        }
    }

    // Confirma a saída e redireciona (Simulação)
    window.confirmarSaida = function() {
        console.log("Usuário confirmou a saída. Redirecionando para a tela de login...");
        // Em um sistema real, aqui você chamaria a API de logout
        window.location.href = "login.html"; 
    }

    // Fechar o modal ao clicar fora dele
    window.onclick = function(event) {
        if (event.target == ModalSaida) {
            fecharModalSaida();
        }
    }
    
    // ----------------------------------------------------
    // Lógica Específica da Página: BATER PONTO
    // ----------------------------------------------------
    if (document.getElementById('botaoPonto')) {
        const horaAtual = document.getElementById('horaAtual');
        const dataAtual = document.getElementById('dataAtual');
        const dataSistema = document.getElementById('dataSistema');
        const caixaStatus = document.getElementById('caixaStatus');
        const statusAtual = document.getElementById('statusAtual');
        const botaoPonto = document.getElementById('botaoPonto');
        const ultimoPonto = document.getElementById('ultimoPonto');
        
        const STORAGE_KEY_STATUS = 'pontoID_status';
        const STORAGE_KEY_LAST_PUNCH = 'pontoID_last_punch';
        
        const TIPO_PONTO = {
            OUT: { text: "Saída", next: "IN", status: "Fora do Expediente", buttonText: "ENTRADA", statusClass: "" },
            IN: { text: "Entrada", next: "BREAK_START", status: "Em Trabalho", buttonText: "INÍCIO INTERVALO", statusClass: "status-work" },
            BREAK_START: { text: "Início Intervalo", next: "BREAK_END", status: "Em Intervalo", buttonText: "FIM INTERVALO", statusClass: "status-break" },
            BREAK_END: { text: "Fim Intervalo", next: "OUT", status: "Em Trabalho", buttonText: "SAÍDA", statusClass: "status-work" }
        };

        let statusPontoAtual = TIPO_PONTO.OUT; 
        
        function atualizarDataHora() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { hour12: false });
            horaAtual.textContent = timeString;
            const dateString = now.toLocaleDateString('pt-BR', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            dataAtual.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
            dataSistema.textContent = now.toISOString().slice(0, 19).replace('T', ' ');
        }

        function iniciarStatusPonto() {
            const pontoArmazenado = localStorage.getItem(STORAGE_KEY_STATUS);
            const ultimoPontoArmazenado = localStorage.getItem(STORAGE_KEY_LAST_PUNCH);
            
            if (pontoArmazenado && TIPO_PONTO[pontoArmazenado]) {
                statusPontoAtual = TIPO_PONTO[pontoArmazenado];
            } else {
                statusPontoAtual = TIPO_PONTO.OUT;
                localStorage.setItem(STORAGE_KEY_STATUS, 'OUT');
            }

            if (ultimoPontoArmazenado) {
                ultimoPonto.textContent = ultimoPontoArmazenado;
            }

            atualizarInterface();
        }

        function atualizarInterface() {
            const statusProximaChave = statusPontoAtual.next;
            const proximoStatus = TIPO_PONTO[statusProximaChave];
            
            botaoPonto.textContent = proximoStatus.buttonText;
            statusAtual.textContent = statusPontoAtual.status;
            caixaStatus.className = `status-atual ${statusPontoAtual.statusClass}`;
        }
        
        window.registrarPonto = function() {
            const now = new Date();
            const statusProximaChave = statusPontoAtual.next;
            const proximoStatus = TIPO_PONTO[statusProximaChave];
            
            const tipoPonto = proximoStatus.text;
            
            const dadosPonto = {
                matricula: document.getElementById('matricula').textContent,
                data: now.toLocaleDateString('pt-BR'),
                hora: now.toLocaleTimeString('pt-BR', { hour12: false }),
                tipo: tipoPonto
            };

            console.log('Registro de Ponto Enviado:', dadosPonto);
            alert(`Ponto registrado com sucesso: ${tipoPonto} às ${dadosPonto.hora}`);
            
            statusPontoAtual = proximoStatus;
            localStorage.setItem(STORAGE_KEY_STATUS, statusProximaChave);
            localStorage.setItem(STORAGE_KEY_LAST_PUNCH, `${tipoPonto} em ${dadosPonto.data} às ${dadosPonto.hora}`);
            
            ultimoPonto.textContent = ` ${tipoPonto} em ${dadosPonto.data} às ${dadosPonto.hora}`;
            atualizarInterface();
        }

        setInterval(atualizarDataHora, 1000); 
        atualizarDataHora(); 
        iniciarStatusPonto();
    }
    
    // ----------------------------------------------------
    // Lógica Específica da Página: MEU PONTO
    // ----------------------------------------------------
    if (document.getElementById('corpoTabela')) {
        const corpoTabela = document.getElementById('corpoTabela');
        const modalAjuste = document.getElementById('modalAjuste');
        const formAjuste = document.getElementById('formAjuste');
        
        const registrosmarcados = [
            { day: '01/Set', status: 'Presente', p_in: '08:00', p_out: '17:00', horasmarcadas: ['08:02', '12:00', '13:00', '17:05'], total: '08:03', ajuste: false },
            { day: '02/Set', status: 'Presente', p_in: '08:00', p_out: '17:00', horasmarcadas: ['07:59', '12:05', '13:05', '17:00'], total: '08:01', ajuste: false },
            { day: '03/Set', status: 'Falta', p_in: '08:00', p_out: '17:00', horasmarcadas: ['-'], total: '00:00', ajuste: false },
            { day: '04/Set', status: 'Presente', p_in: '08:00', p_out: '17:00', horasmarcadas: ['08:00', '12:00', '13:00'], total: '07:00', ajuste: true },
            { day: '05/Set', status: 'Atestado', p_in: '08:00', p_out: '17:00', horasmarcadas: ['Atestado Médico'], total: '08:00', ajuste: true },
        ];

        function renderTabela(registros) {
            corpoTabela.innerHTML = '';
            registros.forEach(registro => {
                const statusClass = registro.status === 'Presente' || registro.status === 'Atestado' ? 'present-status' : 'falta-status';
                const statusDisplay = registro.status === 'Atestado' ? `<span style="color:var(--blue-info);">Atestado</span>` : registro.status;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${registro.day}</td>
                    <td class="status-cell ${statusClass}">${statusDisplay}</td>
                    <td>${registro.p_in} - ${registro.p_out}</td>
                    <td>${registro.horasmarcadas.join(', ')}</td>
                    <td>${registro.total}</td>
                    <td>${registro.ajuste ? 'Sim' : 'Não'}</td>
                `;
                corpoTabela.appendChild(row);
            });
        }
        
        window.abrirModalAjuste = function() {
            if (modalAjuste) {
                modalAjuste.style.display = 'flex';
                modalAjuste.style.alignItems = 'center';
                modalAjuste.style.justifyContent = 'center';
            }
        }

        window.fecharModalAjuste = function() {
            if (modalAjuste) {
                modalAjuste.style.display = 'none';
            }
        }
        
        if (formAjuste) {
            formAjuste.addEventListener('submit', function(e) {
                e.preventDefault();
                const data = document.getElementById('dataAjuste').value;
                const tipo = document.getElementById('tipoAjuste').value;
                const motivo = document.getElementById('motivoAjuste').value;

                if (!data || !tipo || !motivo) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }

                alert(`Solicitação de ajuste para ${data} (${tipo}) enviada com sucesso ao gestor!`);
                formAjuste.reset();
                fecharModalAjuste();
            });
        }
        
        renderTabela(registrosmarcados);
    }
    
    // ----------------------------------------------------
    // Lógica Específica da Página: RELATÓRIOS
    // ----------------------------------------------------
    if (document.getElementById('seletor-colaborador')) {
        const seletorColaborador = document.getElementById('seletor-colaborador');
        const divDetalhes = document.getElementById('detalhesColaborador');
        const spanNomeColaborador = document.getElementById('nomeColaborador');
        const spanFuncaoColaborador = document.getElementById('funcaoColaborador');
        const corpoTabelaPonto = document.getElementById('corpoTabelaPonto');
        
        const dadosColaborador = {
            1: {
                name: "Ana Lima Silva",
                role: "Desenvolvedora Web Júnior",
                registros: [
                    { status: 'Presente', day: 'Segunda, 10/11', p_in: '08:00', p_out: '12:00', r_in1: '08:02', r_out1: '12:05', r_in2: '13:00', r_out2: '17:01' },
                    { status: 'Falta', day: 'Terça, 11/11', p_in: '08:00', p_out: '12:00', r_in1: '-', r_out1: '-', r_in2: '-', r_out2: '-' },
                    { status: 'Presente', day: 'Hoje, 12/11', p_in: '08:00', p_out: '12:00', r_in1: '07:58', r_out1: '12:00', r_in2: '13:00', r_out2: '17:00' },
                ]
            },
            2: {
                name: "Bruno Costa",
                role: "Analista de Marketing Pleno",
                registros: [
                     { status: 'Presente', day: 'Segunda, 10/11', p_in: '09:00', p_out: '13:00', r_in1: '09:01', r_out1: '13:01', r_in2: '14:00', r_out2: '18:00' },
                ]
            },
        };

        window.buscarDadosColaborador = function() {
            const colaboradorID = seletorColaborador.value;

            if (!colaboradorID) {
                alert("Por favor, selecione um colaborador.");
                divDetalhes.style.display = 'none';
                return;
            }

            const dados = dadosColaborador[colaboradorID];
            
            spanNomeColaborador.textContent = dados.name;
            spanFuncaoColaborador.textContent = dados.role;

            renderTabelaRelatorio(dados.registros);
            divDetalhes.style.display = 'block';
        }

        function renderTabelaRelatorio(registros) {
            corpoTabelaPonto.innerHTML = '';

            registros.forEach((registro, index) => {
                const statusClass = registro.status === 'Presente' ? 'present-status' : 'falta-status';
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td class="status-cell ${statusClass}">${registro.status}</td>
                    <td>${registro.day}</td>
                    <td>${registro.p_in}</td>
                    <td>${registro.p_out}</td>
                    <td>${registro.r_in1}</td>
                    <td>${registro.r_out1}</td>
                    <td>${registro.r_in2}</td>
                    <td>${registro.r_out2}</td>
                    <td>
                        <button class="edit-btn" onclick="#">
                            <i class="fas fa-edit"></i> Alterar
                        </button>
                    </td>
                `;
                corpoTabelaPonto.appendChild(row);
            });
        }
    }
});
