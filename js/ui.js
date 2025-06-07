// js/ui.js
// Módulo responsável por interações com a interface do usuário,
// manipulação do DOM, e coordenação da inicialização de outros módulos visuais.

import configManager from './config.js';
import calculadora from './calculadora.js';
import simBDI from './simulacoesBDI.js';
import { updateAllReports, updateReportVisibility, getReportData, generateResumoHTML } from './relatorios.js'; // Assumindo que relatorios.js exporta estas.
import { initGraficoPizzaCustos, updateGraficoPizzaCustos, getChartDataPizza } from './graficoPizzaCustos.js';
import { initGraficoCurvaABC, updateGraficoCurvaABC, getChartDataCurvaABC } from './graficoCurvaABC.js';
import { initGraficoGanttEstimado, updateGraficoGanttEstimado, getChartDataGantt } from './graficoGantt.js';
import { setupEventListeners } from './handlers.js';
import { formatCurrency, parseCurrency, showAlert, debounce } from './utils.js'; // Adicionado debounce como exemplo de utilitário comum
import { budgetDataStructure, getMaterialList, getComposicaoPorNome } from './data.js'; // Funções de data.js podem ser necessárias para popular UIs.
// persistencia.js é mais provável de ser chamado por handlers.js ou main.js, mas ui pode precisar de feedback
// import { saveStateToFile, loadStateFromFile, resetApplicationState } from './persistencia.js';

const ui = {
    // Cache de elementos DOM
    tabs: null,
    tabContents: null,
    activeTab: 'configuracoes', // Aba inicial padrão
    // Adicione mais seletores aqui conforme necessário
    // Ex: configForm: document.getElementById('form-configuracoes'),

    init() {
        console.log("ui.init() chamado");
        this.cacheDOMElements(); // Fundamental chamar primeiro
        if (!this.tabs || this.tabs.length === 0) {
            console.error("UI Init: Abas não encontradas. Verifique seletores em cacheDOMElements.");
            // Não prosseguir se elementos básicos da UI não forem encontrados.
            return;
        }
        this.setupTabNavigation();

        // Inicializar módulos de componentes/abas
        // É importante a ordem de inicialização se houver dependências
        configManager.init(this); // Passa 'this' (ui) se configManager precisar interagir com ui
        calculadora.init(this);
        simBDI.init(this);

        // Inicializar gráficos (os elementos canvas devem existir no HTML)
        this.initAllCharts();

        // Configurar manipuladores de eventos globais e específicos da UI
        // handlers.js pode precisar de referências a ui, configManager, calculadora, simBDI, etc.
        setupEventListeners(this, configManager, calculadora, simBDI /*, persistencia, data etc. */);

        // Exibir a primeira aba por padrão
        this.showTab(this.activeTab, true); // true para forçar atualização inicial de conteúdo

        // Atualizar dinamicamente o conteúdo (relatórios, gráficos) uma vez na inicialização
        // Isso deve ocorrer APÓS os módulos de dados (config, calculadora, simBDI) serem inicializados
        // e, idealmente, após o estado ser carregado (se houver).
        // A chamada em showTab(..., true) pode já cobrir isso.
        // this.updateDynamicDataDisplay(); // Chamada explícita se necessário

        console.log("ui.init() concluído.");
    },

    cacheDOMElements() {
        console.log("ui.cacheDOMElements()");
        this.tabs = document.querySelectorAll('.tab-link'); // Confirme sua classe CSS
        this.tabContents = document.querySelectorAll('.tab-content'); // Confirme sua classe CSS

        // Cache para outros elementos importantes usados frequentemente
        // Aba Configurações
        this.configForm = document.getElementById('form-configuracoes');
        this.inputCustoMOProfissional = document.getElementById('custo-mo-profissional');
        this.inputCustoMOAjudante = document.getElementById('custo-mo-ajudante');
        this.inputBDIPrevisto = document.getElementById('bdi-previsto'); // Ou bdi-final? Verificar HTML.
        this.inputAreaObra = document.getElementById('area-obra');
        this.materiaisConfigContainer = document.getElementById('materiais-config-container'); // Container para inputs de materiais

        // Aba Calculadora
        this.selectComposicao = document.getElementById('select-composicao');
        this.calculadoraTableBody = document.getElementById('tabela-orcamento-body'); // Ou o ID correto
        this.calculadoraTableFooter = document.getElementById('tabela-orcamento-footer'); // Ou o ID correto
        this.searchInputCalculadora = document.getElementById('search-input-calculadora'); // Ou o ID correto
        this.bdiAdotadoDisplayCalculadora = document.getElementById('bdi-adotado-calculadora'); // Elemento para mostrar BDI

        // Aba Simulações BDI (Exemplos de IDs, ajuste conforme seu HTML)
        // Bloco 1
        this.simBDIcustoMODireto = document.getElementById('sim-bdi-custo-mo-direto');
        // ... mais elementos da Simulação BDI

        // Abas de Relatório (Containers)
        this.resumoContainer = document.getElementById('relatorio-resumo-container');
        this.listasContainer = document.getElementById('relatorio-listas-container');
        this.curvaABCContainer = document.getElementById('relatorio-curva-abc-container');
        this.cronogramaContainer = document.getElementById('relatorio-cronograma-container');

        // Gráficos (Canvas)
        this.graficoPizzaCanvas = document.getElementById('graficoPizzaCustos');
        this.graficoCurvaABCCanvas = document.getElementById('graficoCurvaABC');
        this.graficoGanttCanvas = document.getElementById('graficoGanttEstimado');

        // Botões Globais (se não gerenciados inteiramente por handlers.js e seus próprios módulos)
        this.btnSalvarOrcamento = document.getElementById('btn-salvar-orcamento');
        this.btnCarregarOrcamento = document.getElementById('btn-carregar-orcamento');
        this.btnResetarAplicacao = document.getElementById('btn-resetar-aplicacao');

        console.log("Elementos do DOM cacheados.");
    },

    setupTabNavigation() {
        console.log("ui.setupTabNavigation()");
        if (!this.tabs) return;
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                event.preventDefault();
                const targetTabId = tab.getAttribute('data-tab'); // data-tab="configuracoes"
                if (targetTabId) {
                    this.showTab(targetTabId);
                } else {
                    console.warn("Atributo data-tab não encontrado no link da aba:", tab);
                }
            });
        });
    },

    showTab(tabId, forceUpdate = false) {
        console.log(`ui.showTab('${tabId}', forceUpdate: ${forceUpdate})`);
        if (!this.tabContents || !this.tabs) {
            console.error("showTab: Conteúdo das abas ou links das abas não cacheados.");
            return;
        }

        let tabFound = false;
        this.tabContents.forEach(content => {
            if (content.id === tabId) {
                content.classList.add('active');
                tabFound = true;
            } else {
                content.classList.remove('active');
            }
        });

        if (!tabFound) {
            console.warn(`Conteúdo da aba com ID '${tabId}' não encontrado.`);
            // Poderia tentar mostrar uma aba padrão se a solicitada não existir
            // this.showTab(this.defaultTabId, true);
            // return;
        }

        this.tabs.forEach(tabLink => {
            if (tabLink.getAttribute('data-tab') === tabId) {
                tabLink.classList.add('active');
            } else {
                tabLink.classList.remove('active');
            }
        });

        this.activeTab = tabId;

        // Atualizar conteúdo dinâmico (relatórios, gráficos) ao mudar de aba
        // ou se for uma atualização forçada (inicialização)
        if (forceUpdate || this.isDynamicTab(tabId)) {
            this.updateDynamicDataDisplay(tabId);
        }
        updateReportVisibility(tabId); // De relatorios.js para mostrar/ocultar seções específicas
    },

    isDynamicTab(tabId) {
        // Define quais abas precisam de atualização de dados ao serem exibidas
        const dynamicTabs = ['resumo', 'listas', 'curva-abc', 'cronograma-estimado', 'calculadora', 'simulacoes-bdi']; // Adicione 'calculadora' e 'simulacoes-bdi' se elas buscam/recalculam algo ao serem mostradas
        return dynamicTabs.some(dynamicTabPrefix => tabId.startsWith(dynamicTabPrefix) || tabId.startsWith('relatorio-'));
    },
    
    initAllCharts() {
        console.log("ui.initAllCharts()");
        try {
            if (this.graficoPizzaCanvas) initGraficoPizzaCustos(this.graficoPizzaCanvas);
            else console.warn("Canvas para Gráfico de Pizza não encontrado.");

            if (this.graficoCurvaABCCanvas) initGraficoCurvaABC(this.graficoCurvaABCCanvas);
            else console.warn("Canvas para Gráfico Curva ABC não encontrado.");

            if (this.graficoGanttCanvas) initGraficoGanttEstimado(this.graficoGanttCanvas);
            else console.warn("Canvas para Gráfico de Gantt não encontrado.");
        } catch (error) {
            console.error("Erro ao inicializar gráficos:", error);
        }
    },

    updateAllChartsUI() {
        console.log("ui.updateAllChartsUI()");
        try {
            // As funções updateXXX devem buscar os dados mais recentes de data.js ou receber os dados.
            // O prompt original sugere que elas são chamadas e internamente buscam os dados.
            if (this.graficoPizzaCanvas && typeof updateGraficoPizzaCustos === 'function') updateGraficoPizzaCustos();
            if (this.graficoCurvaABCCanvas && typeof updateGraficoCurvaABC === 'function') updateGraficoCurvaABC();
            if (this.graficoGanttCanvas && typeof updateGraficoGanttEstimado === 'function') updateGraficoGanttEstimado();
        } catch (error) {
            console.error("Erro ao atualizar gráficos:", error);
        }
    },

    // Chamado quando dados mudam e a UI inteira precisa ser potencialmente atualizada
    refreshAll() {
        console.log("ui.refreshAll() chamado");
        // Atualizar os dados nos módulos que gerenciam os formulários/tabelas
        configManager.populateForm();       // Popula formulário de configurações com dados atuais
        calculadora.renderTable();          // Renderiza a tabela da calculadora com itens atuais
        simBDI.updateAllBlocks();           // Atualiza todos os blocos de Simulação BDI

        // Atualizar todas as partes dinâmicas (relatórios, gráficos)
        this.updateDynamicDataDisplay(this.activeTab); // Atualiza com base na aba ativa
        console.log("UI completamente atualizada.");
    },

    // Atualiza relatórios e gráficos. Pode ser chamado ao mudar de aba ou após alteração de dados.
    updateDynamicDataDisplay(activeTabId = null) {
        console.log(`ui.updateDynamicDataDisplay() para aba: ${activeTabId || 'todas as dinâmicas'}`);
        // Atualizar todos os relatórios
        // relatorios.js deve ter uma função que pega os dados de budgetDataStructure e configData
        const configData = configManager.getConfigData(); // Pega as configurações atuais
        // A função updateAllReports em relatorios.js deve usar budgetDataStructure e configData
        if (typeof updateAllReports === 'function') {
            updateAllReports(budgetDataStructure, configData);
        }

        // Atualizar todos os gráficos
        this.updateAllChartsUI();

        // Atualizar outras informações dinâmicas na UI
        if (this.bdiAdotadoDisplayCalculadora) {
            this.bdiAdotadoDisplayCalculadora.textContent = `${formatCurrency(configData.bdiFinal || 0, 2, false)}%`;
        }
        // ... outras atualizações de UI que dependem do estado global.
    },

    // Feedback visual (ex: para validação, salvar, carregar)
    showGlobalMessage(message, type = 'info', duration = 3000) {
        // Reutilizando a lógica de showAlert de utils.js se ela for adequada
        // ou implementando uma barra de notificação global.
        showAlert(message, type, duration); // de utils.js
        console.log(`Mensagem Global (${type}): ${message}`);
    },

    displayValidationFeedback(element, message, isValid) {
        // Remove feedback antigo
        let feedbackElement = element.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('validation-feedback')) {
            feedbackElement.remove();
        }
        element.classList.remove('is-valid', 'is-invalid');

        if (message) {
            feedbackElement = document.createElement('div');
            feedbackElement.classList.add('validation-feedback');
            if (isValid) {
                element.classList.add('is-valid');
                feedbackElement.classList.add('valid-feedback'); // Para estilização CSS (ex: text-success)
            } else {
                element.classList.add('is-invalid');
                feedbackElement.classList.add('invalid-feedback'); // Para estilização CSS (ex: text-danger)
            }
            feedbackElement.textContent = message;
            // Insere depois do elemento, mas dentro do mesmo pai para melhor controle de layout
            element.parentNode.insertBefore(feedbackElement, element.nextSibling);
        }
    },

    clearValidationFeedback(formElement) {
        formElement.querySelectorAll('.validation-feedback').forEach(el => el.remove());
        formElement.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
            el.classList.remove('is-valid', 'is-invalid');
        });
    }

    // Adicione mais métodos de UI conforme necessário (ex: exibir modais, spinners de carregamento)
};

export default ui;