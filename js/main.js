// js/main.js
// Arquivo principal da aplicação, responsável por iniciar os módulos.

// Importar os módulos principais da aplicação
import ui from './ui.js';
import { loadStateFromFile, resetApplicationState } from './persistencia.js'; // Assumindo loadStateFromFile e resetApplicationState de persistencia.js
import { budgetDataStructure, updateGlobalDataFromConfigs, resetBudgetDataStructure, loadInitialData } from './data.js';
import configManager from './config.js';
import calculadora from './calculadora.js';
import simBDI from './simulacoesBDI.js'; // Nome do arquivo é simulacoesBDI.js

// A inicialização dos gráficos e relatórios é geralmente gerenciada por ui.js ou por um módulo dedicado que ui.js chama.
// O prompt indicava que ui.init() chama as inicializações dos submódulos.

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente carregado e analisado.");

    try {
        // Carrega os dados iniciais (padrões ou de data.js) primeiro
        // A função loadInitialData() em data.js deve configurar os valores padrão iniciais.
        loadInitialData();
        console.log("Dados iniciais carregados em data.js.");

        // Tenta carregar o estado salvo (localStorage ou arquivo, dependendo da implementação em persistencia.js)
        // A função loadStateFromFile() em persistencia.js tentará carregar de um arquivo,
        // mas o prompt também menciona persistência local (localStorage).
        // Vamos assumir que loadStateFromFile() também pode lidar com o fallback para localStorage ou que há outra função.
        // O prompt original mencionava loadState() para persistência local e saveState() para arquivo.
        // Vou usar loadStateFromFile() por enquanto, pois o nome é mais explícito para a funcionalidade de "Carregar Orçamento".
        // A lógica de inicialização pode precisar de ajuste fino aqui dependendo de como persistencia.js realmente funciona.

        const appState = loadStateFromFile(); // Este é o carregamento de arquivo JSON.
                                            // Para o carregamento automático de localStorage, seria outra função.
                                            // O prompt original era um pouco ambíguo sobre o carregamento inicial automático vs. o "Carregar Orçamento".
                                            // Por agora, vamos focar em fazer os módulos carregarem.

        if (appState && Object.keys(appState).length > 0) { // Verifica se appState não é null e não está vazio
            console.log("Estado carregado (de arquivo/sessão anterior):", appState);

            if (appState.configData) {
                configManager.setConfigData(appState.configData);
                // Atualiza data.js com base nas configurações carregadas
                updateGlobalDataFromConfigs(appState.configData); // Crucial que isso aconteça
            }
            // Se budgetData foi salvo, ele pode sobrescrever/atualizar partes de budgetDataStructure
            if (appState.budgetData) {
                // É importante como isso é mesclado. Object.assign pode ser superficial.
                // Se budgetDataStructure tem objetos aninhados, pode precisar de uma mesclagem profunda.
                // Por agora, vamos assumir que a estrutura salva em appState.budgetData é completa ou
                // que a lógica de data.js lida com isso adequadamente.
                Object.assign(budgetDataStructure, appState.budgetData);
            }
            if (appState.calculadoraItems) {
                calculadora.setItems(appState.calculadoraItems);
            }
            if (appState.simBDIData) {
                simBDI.setSimData(appState.simBDIData);
            }
        } else {
            console.log("Nenhum estado de arquivo carregado ou estado vazio, usando padrões de config e data.");
            // data.js já foi inicializado por loadInitialData().
            // configManager.init() (chamado por ui.init()) deve carregar os defaults de config.
            // A atualização de data.js com configs padrão (se não carregadas de um estado)
            // deve acontecer quando as configurações são aplicadas pela primeira vez.
            // Se configManager.init() já aplica os padrões e chama updateGlobalDataFromConfigs, está ok.
            // Se não, pode ser necessário chamar updateGlobalDataFromConfigs aqui com configManager.getConfigData() padrão.
            if (configManager.getConfigData) { // Garante que configManager está disponível
                 updateGlobalDataFromConfigs(configManager.getConfigData()); // Usa configs padrão de configManager
            }
        }

        // Inicializar a interface do usuário e outros módulos que dependem da UI
        // ui.init() deve chamar internamente configManager.init(), calculadora.init(), simBDI.init(),
        // e as inicializações de gráficos e relatórios.
        ui.init();

        console.log("Aplicação inicializada com sucesso por main.js.");

    } catch (error) {
        console.error("Erro crítico durante a inicialização da aplicação em main.js:", error);
        const body = document.querySelector('body');
        if (body) {
            // Evitar adicionar múltiplas mensagens de erro se main.js for recarregado ou algo assim
            let errorDiv = document.getElementById('critical-error-message');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.id = 'critical-error-message';
                errorDiv.textContent = `Erro crítico ao carregar a aplicação. Verifique o console para mais detalhes. (${error.message})`;
                errorDiv.style.color = 'red';
                errorDiv.style.padding = '20px';
                errorDiv.style.backgroundColor = '#fff0f0';
                errorDiv.style.border = '2px solid red';
                errorDiv.style.position = 'fixed';
                errorDiv.style.top = '10px';
                errorDiv.style.left = '10px';
                errorDiv.style.right = '10px';
                errorDiv.style.zIndex = '10000';
                errorDiv.style.textAlign = 'center';
                body.prepend(errorDiv);
            } else {
                errorDiv.textContent = `Erro crítico ao carregar a aplicação (novo erro): Verifique o console. (${error.message})`;
            }
        }
    }
});

// Funções globais expostas para botões no HTML (se houver)
// Geralmente é melhor evitar isso e usar event listeners em JS (handlers.js).
// Se o prompt original mencionava "Salvar Orçamento" global, seria algo como:
// import { saveStateToFile as globalSave } from './persistencia.js';
// window.salvarOrcamentoGlobal = globalSave;

// window.resetarAplicacaoGlobal = () => {
//     if (confirm("Tem certeza que deseja resetar toda a aplicação? Isso limpará todos os dados salvos e recarregará a página.")) {
//         resetApplicationState(); // De persistencia.js, deve limpar localStorage e talvez mais.
//         // resetBudgetDataStructure(); // De data.js, para resetar os dados em memória.
//         // location.reload(); // Força um recarregamento completo para estado limpo.
//         // Ou, de forma mais controlada:
//         // ui.reset(); // Um método em ui.js que reseta todos os formulários e reinicializa módulos para o padrão.
//     }
// };