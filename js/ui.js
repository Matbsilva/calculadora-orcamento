// js/ui.js
import { configManager } from './config.js';
import { calculadora as calc } from './calculadora.js';
import { simulacoesBDI as simBDI } from './simulacoesBDI.js';
import { parseCurrency, formatCurrency, parsePercentage, formatPercentage, debounce } from './utils.js'; // Usando utils.js
import { listaServicos } from './data.js'; // ALTERAÇÃO: Importando do seu data.js
import { persistencia } from './persistencia.js';
import { handlers } from './handlers.js';
// ALTERAÇÃO: Importando do seu relatorios.js
import { resumoFinanceiro, listas as moduloListas, curvaABC, cronogramaEstimado } from './relatorios.js';


export const ui = {
    currentTab: 'configuracoes',
    // listaServicos agora é importado e usado diretamente onde necessário (ex: populateServicosSelect, calculadora)
    calculadora: calc,
    simulacoesBDI: simBDI,

    init() {
        this.setupTabNavigation();
        this.populateServicosSelect(); // Usa listaServicos importado
        this.setupEventListeners();
        
        configManager.init();
        calc.init();      // calculadora.js agora importa listaServicos de data.js
        simBDI.init();
        
        this.updateAllTabs();
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    },

    changeTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('active');
        this.currentTab = tabId;
        this.updateCurrentTabContent();
    },

    updateCurrentTabContent() {
        switch (this.currentTab) {
            case 'configuracoes':
                // configManager.updateUI(); // Chamado no init e blurs
                break;
            case 'calculadora':
                // calc.renderizarItens(); // Chamado no init e interações
                break;
            case 'simulacoes-bdi':
                simBDI.calcularEExibirBDI();
                break;
            case 'resumo':
                resumoFinanceiro.updateResumo(calc.getItens(), configManager.getConfig());
                break;
            case 'listas':
                // ALTERAÇÃO: Usando moduloListas do seu relatorios.js
                moduloListas.updateListaServicos(calc.getItens());
                moduloListas.updateListaMateriais(calc.getItens(), configManager.getConfig(), listaServicos); // Passando listaServicos importada
                break;
            case 'curva-abc':
                curvaABC.updateCurvaABC(calc.getItens());
                break;
            case 'cronograma':
                const duracao = parseInt(document.getElementById('inputDuracaoEstimada').value, 10) || 6;
                cronogramaEstimado.updateCronograma(calc.getTotalCustoDireto() * (1 + configManager.getConfig('bdiFinal') / 100), duracao);
                break;
        }
    },
    
    updateAllTabs() {
        resumoFinanceiro.updateResumo(calc.getItens(), configManager.getConfig());
        // ALTERAÇÃO: Usando moduloListas do seu relatorios.js
        moduloListas.updateListaServicos(calc.getItens());
        moduloListas.updateListaMateriais(calc.getItens(), configManager.getConfig(), listaServicos); // Passando listaServicos importada
        curvaABC.updateCurvaABC(calc.getItens());
        simBDI.calcularEExibirBDI();
        const duracaoInput = document.getElementById('inputDuracaoEstimada');
        if(duracaoInput) { // Adiciona verificação se o elemento existe
             const duracao = parseInt(duracaoInput.value, 10) || 6;
             cronogramaEstimado.updateCronograma(calc.getTotalCustoDireto() * (1 + configManager.getConfig('bdiFinal') / 100), duracao);
        }
    },

    populateServicosSelect() {
        const select = document.getElementById('selectServico');
        if (!select) return;
        while (select.options.length > 1) select.remove(1);
        listaServicos.forEach(servico => { // Usando listaServicos importado de data.js
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = servico.nome;
            select.appendChild(option);
        });
    },

    showInputError(inputElement, message) {
        if (!inputElement) return;
        const errorElementId = inputElement.id + 'Error';
        const errorElement = document.getElementById(errorElementId);
        inputElement.classList.add('input-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    },

    clearInputError(inputElement) {
        if (!inputElement) return;
        const errorElementId = inputElement.id + 'Error';
        const errorElement = document.getElementById(errorElementId);
        inputElement.classList.remove('input-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    },
    
    formatCurrencyInputOnBlur(event) {
        const input = event.target;
        this.clearInputError(input); 
        let value = parseCurrency(input.value);
        let isValid = true;
        if (isNaN(value)) {
            this.showInputError(input, 'Valor inválido. Use apenas números.');
            value = 0; 
            isValid = false;
        } else if (value < 0) {
            this.showInputError(input, 'Valor não pode ser negativo.');
            value = 0;
            isValid = false;
        }
        input.value = formatCurrency(value);
        return { value, isValid };
    },

    formatPercentageInputOnBlur(event, min = 0, max = 100) {
        const input = event.target;
        this.clearInputError(input);
        let value = parsePercentage(input.value);
        let isValid = true;
        if (isNaN(value)) {
            this.showInputError(input, 'Valor inválido. Use apenas números.');
            value = min;
            isValid = false;
        } else if (value < min) {
            this.showInputError(input, `Valor mínimo é ${min}%.`);
            value = min;
            isValid = false;
        } else if (value > max) {
            this.showInputError(input, `Valor máximo é ${max}%.`);
            value = max;
            isValid = false;
        }
        input.value = formatPercentage(value);
        return { value, isValid };
    },

    setupEventListeners() {
        document.getElementById('btnSalvarOrcamento').addEventListener('click', () => persistencia.saveBudget(configManager.getConfig(), calc.getItens()));
        document.getElementById('inputCarregarOrcamento').addEventListener('change', (event) => persistencia.loadBudget(event));
        document.getElementById('btnResetarAplicacao').addEventListener('click', handlers.handleResetApplication);
        document.getElementById('btnAdicionarServico').addEventListener('click', handlers.handleAddServico);
        
        const inputPesquisaServico = document.getElementById('inputPesquisaServico');
        if (inputPesquisaServico) {
             inputPesquisaServico.addEventListener('input', debounce(handlers.handleSearch, 300));
        }

        const inputDuracaoEstimada = document.getElementById('inputDuracaoEstimada');
        if (inputDuracaoEstimada) {
            inputDuracaoEstimada.addEventListener('change', () => {
                this.clearInputError(inputDuracaoEstimada);
                let duracao = parseInt(inputDuracaoEstimada.value, 10);
                if (isNaN(duracao) || duracao < 1) {
                    this.showInputError(inputDuracaoEstimada, "Duração deve ser no mínimo 1 mês.");
                    duracao = 1;
                    inputDuracaoEstimada.value = duracao;
                }
                // Recalcular cronograma se a aba estiver ativa ou em updateAllTabs
                if (this.currentTab === 'cronograma') this.updateCurrentTabContent(); else this.updateAllTabs();
            });
            inputDuracaoEstimada.addEventListener('focus', () => this.clearInputError(inputDuracaoEstimada));
        }

        const inputAreaObra = document.getElementById('inputAreaObra');
        if (inputAreaObra) {
            inputAreaObra.addEventListener('blur', (event) => {
                const input = event.target;
                this.clearInputError(input);
                let valueStr = input.value.replace(/[^0-9,.]/g, '').replace(',', '.');
                let value = parseFloat(valueStr);
                if (isNaN(value) || value === 0) {
                    this.showInputError(input, 'Área inválida. Mínimo 1 m².');
                    value = 1; 
                } else if (value < 1) {
                    this.showInputError(input, 'Área mínima é 1 m².');
                    value = 1;
                } else if (!Number.isInteger(value)) {
                    this.showInputError(input, 'Área deve ser um número inteiro.');
                    value = Math.round(value);
                    if (value < 1) value = 1;
                }
                input.value = `${value} m²`;
                configManager.setConfig('areaObra', value);
                this.updateAllTabs(); 
            });
            inputAreaObra.addEventListener('focus', () => this.clearInputError(inputAreaObra));
        }
    },

    resetUI() {
        configManager.loadConfig(); 
        configManager.updateUI();
        simBDI.loadInitialValuesFromConfig();
        simBDI.updateUIFromState();
        calc.resetCalculadora(); 
        
        const inputPesquisa = document.getElementById('inputPesquisaServico');
        if(inputPesquisa) inputPesquisa.value = '';
        
        const selectServ = document.getElementById('selectServico');
        if(selectServ) selectServ.value = '';
        
        const inputDuracao = document.getElementById('inputDuracaoEstimada');
        if(inputDuracao) inputDuracao.value = 6; 
        
        this.clearAllErrorMessages();
        this.updateAllTabs();
        this.changeTab('configuracoes');
    },

    clearAllErrorMessages() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
    }
};