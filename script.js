// O evento 'DOMContentLoaded' garante que o script só rode depois que o HTML estiver totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variáveis Globais Comuns ---
    const body = document.getElementById('body');
    const logoutModal = document.getElementById('logoutModal');
    const logoutLink = document.getElementById('logoutLink');
    const STORAGE_KEY_THEME = 'flowpoint_theme';

    // ----------------------------------------------------
    // Lógica de Confirmação de Saída (Comum a todas as páginas)
    // ----------------------------------------------------
    if (logoutLink) {
        // Abre o modal de confirmação
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (logoutModal) {
                logoutModal.style.display = 'flex';
                logoutModal.style.alignItems = 'center';
                logoutModal.style.justifyContent = 'center';
            } else {
                // Caso o modal não exista na página atual (para debug)
                console.error("Modal de logout não encontrado.");
                confirmLogout(); 
            }
        });
    }

    // Fechar o modal
    window.closeLogoutModal = function() {
        if (logoutModal) {
            logoutModal.style.display = 'none';
        }
    }

    // Confirma a saída e redireciona (Simulação)
    window.confirmLogout = function() {
        console.log("Usuário confirmou a saída. Redirecionando para a tela de login...");
        // Em um sistema real, aqui você chamaria a API de logout
        window.location.href = "index.html"; 
    }

    // Fechar o modal ao clicar fora dele
    window.onclick = function(event) {
        if (event.target == logoutModal) {
            closeLogoutModal();
        }
    }
    
    // ----------------------------------------------------
    // Lógica Específica da Página: CONFIGURAÇÕES
    // ----------------------------------------------------
    
    if (body && document.getElementById('darkModeToggle')) {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const profileForm = document.getElementById('profileForm');

        // Inicializa o tema ao carregar
        function initializeTheme() {
            const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
            if (savedTheme === 'dark') {
                body.classList.add('dark-mode');
                darkModeToggle.checked = true;
            } else {
                body.classList.remove('dark-mode');
                darkModeToggle.checked = false;
            }
        }

        // Alterna entre modo claro/escuro
        window.toggleDarkMode = function() {
            body.classList.toggle('dark-mode');
            const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem(STORAGE_KEY_THEME, newTheme);
            console.log(`Tema alterado para: ${newTheme}`);
        }

        darkModeToggle.addEventListener('change', toggleDarkMode);
        
        // Simulação de salvamento do Perfil
        if (profileForm) {
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const fullName = document.getElementById('fullName').value;
                const email = document.getElementById('userEmail').value;
                alert(`Perfil de ${fullName} atualizado com sucesso!`);
            });
        }
        
        // Simulação de salvamento da Aparência
        window.saveAppearanceSettings = function() {
            const language = document.getElementById('languageSelect').value;
            alert(`Configurações de aparência e idioma (${language}) salvas!`);
        }
        
        initializeTheme();
    }
    
    // ----------------------------------------------------
    // Lógica Específica da Página: BATER PONTO
    // ----------------------------------------------------
    if (document.getElementById('punchButton')) {
        const currentTimeElement = document.getElementById('currentTime');
        const currentDateElement = document.getElementById('currentDate');
        const systemDateElement = document.getElementById('systemDate');
        const statusBox = document.getElementById('statusBox');
        const currentStatusElement = document.getElementById('currentStatus');
        const punchButton = document.getElementById('punchButton');
        const lastPunchTimeElement = document.getElementById('lastPunchTime');
        
        const STORAGE_KEY_STATUS = 'flowpoint_status';
        const STORAGE_KEY_LAST_PUNCH = 'flowpoint_last_punch';
        
        const PUNCH_TYPES = {
            OUT: { text: "Saída", next: "IN", status: "Fora do Expediente", buttonText: "ENTRADA", statusClass: "" },
            IN: { text: "Entrada", next: "BREAK_START", status: "Em Trabalho", buttonText: "INÍCIO INTERVALO", statusClass: "status-work" },
            BREAK_START: { text: "Início Intervalo", next: "BREAK_END", status: "Em Intervalo", buttonText: "FIM INTERVALO", statusClass: "status-break" },
            BREAK_END: { text: "Fim Intervalo", next: "OUT", status: "Em Trabalho", buttonText: "SAÍDA", statusClass: "status-work" }
        };

        let currentPunchState = PUNCH_TYPES.OUT; 
        
        function updateDateTime() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { hour12: false });
            currentTimeElement.textContent = timeString;
            const dateString = now.toLocaleDateString('pt-BR', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            currentDateElement.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
            systemDateElement.textContent = now.toISOString().slice(0, 19).replace('T', ' ');
        }

        function initializePunchState() {
            const storedStateKey = localStorage.getItem(STORAGE_KEY_STATUS);
            const storedLastPunch = localStorage.getItem(STORAGE_KEY_LAST_PUNCH);
            
            if (storedStateKey && PUNCH_TYPES[storedStateKey]) {
                currentPunchState = PUNCH_TYPES[storedStateKey];
            } else {
                currentPunchState = PUNCH_TYPES.OUT;
                localStorage.setItem(STORAGE_KEY_STATUS, 'OUT');
            }

            if (storedLastPunch) {
                lastPunchTimeElement.textContent = storedLastPunch;
            }

            updateUI();
        }

        function updateUI() {
            const nextStateKey = currentPunchState.next;
            const nextState = PUNCH_TYPES[nextStateKey];
            
            punchButton.textContent = nextState.buttonText;
            currentStatusElement.textContent = currentPunchState.status;
            statusBox.className = `status-box ${currentPunchState.statusClass}`;
        }
        
        window.handlePunch = function() {
            const now = new Date();
            const nextStateKey = currentPunchState.next;
            const nextState = PUNCH_TYPES[nextStateKey];
            
            const punchType = nextState.text;
            
            const punchData = {
                matricula: document.getElementById('matricula').textContent,
                data: now.toLocaleDateString('pt-BR'),
                hora: now.toLocaleTimeString('pt-BR', { hour12: false }),
                tipo: punchType
            };

            console.log('Registro de Ponto Enviado:', punchData);
            alert(`Ponto registrado com sucesso: ${punchType} às ${punchData.hora}`);
            
            currentPunchState = nextState;
            localStorage.setItem(STORAGE_KEY_STATUS, nextStateKey);
            localStorage.setItem(STORAGE_KEY_LAST_PUNCH, `${punchType} em ${punchData.data} às ${punchData.hora}`);
            
            lastPunchTimeElement.textContent = ` ${punchType} em ${punchData.data} às ${punchData.hora}`;
            updateUI();
        }

        setInterval(updateDateTime, 1000); 
        updateDateTime(); 
        initializePunchState();
    }
    
    // ----------------------------------------------------
    // Lógica Específica da Página: MEU PONTO
    // ----------------------------------------------------
    if (document.getElementById('mirrorTableBody')) {
        const mirrorTableBody = document.getElementById('mirrorTableBody');
        const adjustmentModal = document.getElementById('adjustmentModal');
        const adjustmentForm = document.getElementById('adjustmentForm');
        
        const mockRecords = [
            { day: '01/Set', status: 'Presente', p_in: '08:00', p_out: '17:00', marks: ['08:02', '12:00', '13:00', '17:05'], total: '08:03', adjusted: false },
            { day: '02/Set', status: 'Presente', p_in: '08:00', p_out: '17:00', marks: ['07:59', '12:05', '13:05', '17:00'], total: '08:01', adjusted: false },
            { day: '03/Set', status: 'Falta', p_in: '08:00', p_out: '17:00', marks: ['-'], total: '00:00', adjusted: false },
            { day: '04/Set', status: 'Presente', p_in: '08:00', p_out: '17:00', marks: ['08:00', '12:00', '13:00'], total: '07:00', adjusted: true },
            { day: '05/Set', status: 'Atestado', p_in: '08:00', p_out: '17:00', marks: ['Atestado Médico'], total: '08:00', adjusted: true },
        ];

        function renderMirrorTable(records) {
            mirrorTableBody.innerHTML = '';
            records.forEach(record => {
                const statusClass = record.status === 'Presente' || record.status === 'Atestado' ? 'present-status' : 'falta-status';
                const statusDisplay = record.status === 'Atestado' ? `<span style="color:var(--blue-info);">Atestado</span>` : record.status;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.day}</td>
                    <td class="status-cell ${statusClass}">${statusDisplay}</td>
                    <td>${record.p_in} - ${record.p_out}</td>
                    <td>${record.marks.join(', ')}</td>
                    <td>${record.total}</td>
                    <td>${record.adjusted ? 'Sim' : 'Não'}</td>
                `;
                mirrorTableBody.appendChild(row);
            });
        }
        
        window.openAdjustmentModal = function() {
            if (adjustmentModal) {
                adjustmentModal.style.display = 'flex';
                adjustmentModal.style.alignItems = 'center';
                adjustmentModal.style.justifyContent = 'center';
            }
        }

        window.closeAdjustmentModal = function() {
            if (adjustmentModal) {
                adjustmentModal.style.display = 'none';
            }
        }
        
        if (adjustmentForm) {
            adjustmentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const data = document.getElementById('adjustmentDate').value;
                const tipo = document.getElementById('adjustmentType').value;
                const motivo = document.getElementById('adjustmentReason').value;

                if (!data || !tipo || !motivo) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }

                alert(`Solicitação de ajuste para ${data} (${tipo}) enviada com sucesso ao gestor!`);
                adjustmentForm.reset();
                closeAdjustmentModal();
            });
        }
        
        renderMirrorTable(mockRecords);
    }
    
    // ----------------------------------------------------
    // Lógica Específica da Página: RELATÓRIOS
    // ----------------------------------------------------
    if (document.getElementById('employee-select')) {
        const employeeSelect = document.getElementById('employee-select');
        const employeeDetailsDiv = document.getElementById('employeeDetails');
        const employeeNameSpan = document.getElementById('employeeName');
        const employeeRoleSpan = document.getElementById('employeeRole');
        const pointTableBody = document.getElementById('pointTableBody');
        
        const employeeData = {
            1: {
                name: "Ana Lima Silva",
                role: "Desenvolvedora Web Júnior",
                records: [
                    { status: 'Presente', day: 'Segunda, 10/11', p_in: '08:00', p_out: '12:00', r_in1: '08:02', r_out1: '12:05', r_in2: '13:00', r_out2: '17:01' },
                    { status: 'Falta', day: 'Terça, 11/11', p_in: '08:00', p_out: '12:00', r_in1: '-', r_out1: '-', r_in2: '-', r_out2: '-' },
                    { status: 'Presente', day: 'Hoje, 12/11', p_in: '08:00', p_out: '12:00', r_in1: '07:58', r_out1: '12:00', r_in2: '13:00', r_out2: '17:00' },
                ]
            },
            2: {
                name: "Bruno Costa",
                role: "Analista de Marketing Pleno",
                records: [
                     { status: 'Presente', day: 'Segunda, 10/11', p_in: '09:00', p_out: '13:00', r_in1: '09:01', r_out1: '13:01', r_in2: '14:00', r_out2: '18:00' },
                ]
            },
        };

        window.fetchEmployeeData = function() {
            const employeeId = employeeSelect.value;

            if (!employeeId) {
                alert("Por favor, selecione um colaborador.");
                employeeDetailsDiv.style.display = 'none';
                return;
            }

            const data = employeeData[employeeId];
            
            employeeNameSpan.textContent = data.name;
            employeeRoleSpan.textContent = data.role;

            renderReportTable(data.records);
            employeeDetailsDiv.style.display = 'block';
        }

        function renderReportTable(records) {
            pointTableBody.innerHTML = '';

            records.forEach((record, index) => {
                const statusClass = record.status === 'Presente' ? 'present-status' : 'falta-status';
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td class="status-cell ${statusClass}">${record.status}</td>
                    <td>${record.day}</td>
                    <td>${record.p_in}</td>
                    <td>${record.p_out}</td>
                    <td>${record.r_in1}</td>
                    <td>${record.r_out1}</td>
                    <td>${record.r_in2}</td>
                    <td>${record.r_out2}</td>
                    <td>
                        <button class="edit-btn" onclick="openModal(${index})">
                            <i class="fas fa-edit"></i> Alterar
                        </button>
                    </td>
                `;
                pointTableBody.appendChild(row);
            });
        }
        
        // Simulação de abertura de modal de edição
        window.openModal = function(rowIndex) {
            alert(`Modal de Alteração aberto para o registro #${rowIndex + 1} (Esta função está aqui para simular a edição do registro na tela de relatórios).`);
        }
    }
