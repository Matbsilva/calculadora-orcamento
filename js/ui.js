// js/ui.js
import { configManager } from './config.js';
import { calculadora as calc } from './calculadora.js';
import { simulacoesBDI as simBDI } from './simulacoesBDI.js';
import { parseCurrency, formatCurrency, parsePercentage, formatPercentage, debounce, parseFloatStrict } from './utils.js';
import { budgetDataStructure as baseListaServicos, getAreaObra, getBdiFinalAdotado, getLaborCosts, getMaterialPrices } from './data.js'; // Importando de data.js
import { persistencia } from './persistencia.js';
import { handlers } from './handlers.js';
import { resumoFinanceiro, listas as moduloListas, curvaABC, cronogramaEstimado } from './relatorios.js'; // Usando seu relatorios.js

// Importando os novos módulos de gráficos
import { initGraficoCurvaABC, renderizarGraficoCurvaABC, destroyChartCurvaABC } from './graficoCurvaABC.js';
import { initGraficoPizzaCustos, renderizarGraficoPizzaCustos, destroyChartPizzaCustos } from './graficoPizzaCustos.js';
import { initGraficoGantt, renderizarGraficoGantt, destroyChartGantt } from './graficoGantt.js';

export const ui = {
    currentTab: 'configuracoes', 
    calculadora: calc, 
    simulacoesBDI: simBDI, 

    init() {
        this.setupTabNavigation();
        this.populateServicosSelect();
        this.setupEventListeners();
        
        configManager.init(); 
        calc.init();      
        simBDI.init();    
        
        initGraficoCurvaABC();
        initGraficoPizzaCustos();
        initGraficoGantt();

        // Força a renderização da primeira aba ativa e todos os cálculos dependentes
        this.changeTab(this.currentTab, true); // true para forçar updateAllTabs na primeira carga
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    },

    setupTabNavigation() {
        const tabLinks = document.querySelectorAll('.tab-link');
        tabLinks.forEach(link => {
            const tabContentId = link.dataset.tab; // dataset.tab é o valor 'configuracoes', 'calculadora', etc.
            link.id = `tab-link-${tabContentId}`; // Garante que o link tenha um ID
            link.addEventListener('click', () => this.changeTab(tabContentId));
            link.setAttribute('role', 'tab');
            link.setAttribute('aria-selected', 'false');
            link.setAttribute('tabindex', '-1');
            link.setAttribute('aria-controls', tabContentId);
            
            const tabContent = document.getElementById(tabContentId);
            if (tabContent) {
                tabContent.setAttribute('role', 'tabpanel');
                tabContent.setAttribute('aria-labelledby', link.id);
            }
        });
        // Ativar a primeira aba
        const firstTabLink = document.querySelector(`.tab-link[data-tab="${this.currentTab}"]`);
        if (firstTabLink) {
            firstTabLink.classList.add('active');
            firstTabLink.setAttribute('aria-selected', 'true');
            firstTabLink.setAttribute('tabindex', '0');
            const firstTabContent = document.getElementById(this.currentTab);
            if (firstTabContent) firstTabContent.classList.add('active');
        }
    },
    
    changeTab(tabId, isInitialLoad = false) {
        if (this.currentTab !== tabId || isInitialLoad) { // Evita reprocessar se clicar na mesma aba, exceto na carga inicial
            // Destruir gráficos da aba anterior
            if (this.currentTab === 'curva-abc' && typeof destroyChartCurvaABC === 'function') destroyChartCurvaABC();
            if (this.currentTab === 'resumo' && typeof destroyChartPizzaCustos === 'function') destroyChartPizzaCustos();
            if (this.currentTab === 'cronograma' && typeof destroyChartGantt === 'function') destroyChartGantt();

            document.querySelectorAll('.tab-content.active').forEach(content => content.classList.remove('active'));
            document.querySelectorAll('.tab-link.active').forEach(link => {
                link.classList.remove('active');
                link.setAttribute('aria-selected', 'false');
                link.setAttribute('tabindex', '-1');
            });

            const activeTabLink = document.getElementById(`tab-link-${tabId}`); // Usa o ID que definimos
            const activeTabContent = document.getElementById(tabId);

            if(activeTabLink) {
                activeTabLink.classList.add('active');
                activeTabLink.setAttribute('aria-selected', 'true');
                activeTabLink.setAttribute('tabindex', '0');
                if (!isInitialLoad) activeTabLink.focus(); 
            }
            if(activeTabContent) activeTabContent.classList.add('active');
            
            this.currentTab = tabId;
        }
        // Sempre atualiza o conteúdo da aba (ou todas na carga inicial)
        if (isInitialLoad) {
            this.updateAllTabs();
        } else {
            this.updateCurrentTabContent();
        }
    },

    updateCurrentTabContent() {
        const itensParaRelatorio = calc.getItensComCustosCalculados();
        const configParaResumo = { 
            bdiFinal: getBdiFinalAdotado(), 
            areaObra: getAreaObra(),
            // Para a pizza de custos, passamos os totais de MO e Material
            totalMO: calc.getTotalCustoMO(),
            totalMateriais: calc.getTotalCustoMaterial()
        };
        const totalCustoDireto = calc.getTotalCustoDireto();
        const precoVendaTotal = totalCustoDireto * (1 + configParaResumo.bdiFinal / 100);
        const duracaoInput = document.getElementById('inputDuracaoEstimada');
        const duracao = duracaoInput ? (parseInt(duracaoInput.value, 10) || 6) : 6;

        // Limpar console de erros anteriores de gráficos se houver
        // console.clear(); 

        switch (this.currentTab) {
            case 'resumo':
                if (resumoFinanceiro && resumoFinanceiro.updateResumo) resumoFinanceiro.updateResumo(itensParaRelatorio, configParaResumo);
                if (typeof renderizarGraficoPizzaCustos === 'function') renderizarGraficoPizzaCustos(calc.getTotalCustoMaterial(), calc.getTotalCustoMO());
                break;
            case 'listas':
                if (moduloListas && moduloListas.updateListaServicos) moduloListas.updateListaServicos(itensParaRelatorio);
                if (moduloListas && moduloListas.updateListaMateriais) moduloListas.updateListaMateriais(); // Não precisa mais de params, pega de data.js
                break;
            case 'curva-abc':
                if (curvaABC && curvaABC.updateCurvaABC) {
                    const dadosCurva = curvaABC.updateCurvaABC(itensParaRelatorio);
                    if (typeof renderizarGraficoCurvaABC === 'function') renderizarGraficoCurvaABC(dadosCurva);
                }
                break;
            case 'cronograma':
                if (cronogramaEstimado && cronogramaEstimado.updateCronograma) cronogramaEstimado.updateCronograma(precoVendaTotal, duracao);
                if (typeof renderizarGraficoGantt === 'function') renderizarGraficoGantt(itensParaRelatorio, duracao, new Date());
                break;
            case 'simulacoes-bdi':
                if (simBDI && simBDI.recalculateAllBlocks) simBDI.recalculateAllBlocks();
                break;
             case 'configuracoes':
                if(configManager && configManager.loadConfigValuesToUI) configManager.loadConfigValuesToUI(); // Garante que a UI de config está atual
                break;
            case 'calculadora':
                if(calc && calc.recalcularTodosOsCustos) calc.recalcularTodosOsCustos(); // Garante que a tabela da calculadora e BDI display estão atualizados
                break;
        }
    },
    
    updateAllTabs() {
        // Primeiro, garante que os dados base (calculadora) estejam processados
        if(calc && calc.recalcularTodosOsCustos) calc.recalcularTodosOsCustos();
        
        const itensParaRelatorio = calc.getItensComCustosCalculados();
        const configParaResumo = { bdiFinal: getBdiFinalAdotado(), areaObra: getAreaObra() };
        const totalCustoDireto = calc.getTotalCustoDireto();
        const precoVendaTotal = totalCustoDireto * (1 + configParaResumo.bdiFinal / 100);
        const duracaoInput = document.getElementById('inputDuracaoEstimada');
        const duracao = duracaoInput ? (parseInt(duracaoInput.value, 10) || 6) : 6;

        if (resumoFinanceiro && resumoFinanceiro.updateResumo) resumoFinanceiro.updateResumo(itensParaRelatorio, configParaResumo);
        if (moduloListas && moduloListas.updateListaServicos) moduloListas.updateListaServicos(itensParaRelatorio);
        if (moduloListas && moduloListas.updateListaMateriais) moduloListas.updateListaMateriais();
        if (curvaABC && curvaABC.updateCurvaABC) {
            const dadosCurva = curvaABC.updateCurvaABC(itensParaRelatorio);
            if (this.currentTab === 'curva-abc' && typeof renderizarGraficoCurvaABC === 'function') renderizarGraficoCurvaABC(dadosCurva);
        }
        if (cronogramaEstimado && cronogramaEstimado.updateCronograma) cronogramaEstimado.updateCronograma(precoVendaTotal, duracao);
        if (simBDI && simBDI.recalculateAllBlocks) simBDI.recalculateAllBlocks();

        if (this.currentTab === 'resumo' && typeof renderizarGraficoPizzaCustos === 'function') renderizarGraficoPizzaCustos(calc.getTotalCustoMaterial(), calc.getTotalCustoMO());
        if (this.currentTab === 'cronograma' && typeof renderizarGraficoGantt === 'function') renderizarGraficoGantt(itensParaRelatorio, duracao, new Date());
        
        // Garante que a aba de configurações também reflita quaisquer mudanças (ex: de um loadBudget)
        if (configManager && configManager.loadConfigValuesToUI) configManager.loadConfigValuesToUI();
    },

    populateServicosSelect() {
        const select = document.getElementById('selectServico');
        if (!select) return;
        while (select.options.length > 1) select.remove(1);
        baseListaServicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.refComposition;
            option.textContent = servico.description;
            select.appendChild(option);
        });
    },
    showInputError(inputElement, message) { if (!inputElement) return; const errorElementId = inputElement.id + 'Error'; const errorElement = document.getElementById(errorElementId); inputElement.classList.add('input-error'); if (errorElement) { errorElement.textContent = message; errorElement.style.display = 'block'; } },
    clearInputError(inputElement) { if (!inputElement) return; const errorElementId = inputElement.id + 'Error'; const errorElement = document.getElementById(errorElementId); inputElement.classList.remove('input-error'); if (errorElement) { errorElement.textContent = ''; errorElement.style.display = 'none'; } },
    formatCurrencyInputOnBlur(event) { const input = event.target; this.clearInputError(input); let value = parseCurrency(input.value); let isValid = true; if (isNaN(value)) { this.showInputError(input, 'Valor inválido.'); value = 0; isValid = false; } else if (value < 0) { this.showInputError(input, 'Não pode ser negativo.'); value = 0; isValid = false; } input.value = formatCurrency(value); return { value, isValid }; },
    formatPercentageInputOnBlur(event, min = 0, max = 100) { const input = event.target; this.clearInputError(input); let value = parsePercentage(input.value); let isValid = true; if (isNaN(value)) { this.showInputError(input, 'Valor inválido.'); value = min; isValid = false; } else if (value < min) { this.showInputError(input, `Mínimo ${min}%.`); value = min; isValid = false; } else if (value > max) { this.showInputError(input, `Máximo ${max}%.`); value = max; isValid = false; } input.value = formatPercentage(value); return { value, isValid }; },
    
    setupEventListeners() {
        document.getElementById('btnSalvarOrcamento').addEventListener('click', () => persistencia.saveBudget());
        document.getElementById('inputCarregarOrcamento').addEventListener('change', (event) => persistencia.loadBudget(event));
        document.getElementById('btnResetarAplicacao').addEventListener('click', handlers.handleResetApplication);
        document.getElementById('btnAdicionarServico').addEventListener('click', handlers.handleAddServico);
        
        const inputPesqServ = document.getElementById('inputPesquisaServico');
        if (inputPesqServ) inputPesqServ.addEventListener('input', debounce(handlers.handleSearch, 300));

        const inputDuracaoEst = document.getElementById('inputDuracaoEstimada');
        if (inputDuracaoEst) {
            inputDuracaoEst.addEventListener('blur', () => { // Mudado para blur para validar após sair
                this.clearInputError(inputDuracaoEst);
                let duracao = parseInt(inputDuracaoEst.value, 10);
                if (isNaN(duracao) || duracao < 1) {
                    this.showInputError(inputDuracaoEst, "Duração deve ser no mínimo 1 mês.");
                    duracao = parseInt(inputDuracaoEst.min) || 1; // Usa o min do input ou 1
                }
                 inputDuracaoEst.value = duracao; // Atualiza o valor no input
                if (this.currentTab === 'cronograma') this.updateCurrentTabContent(); else this.updateAllTabs();
            });
            inputDuracaoEst.addEventListener('focus', () => this.clearInputError(inputDuracaoEst));
        }

        const inputArea = document.getElementById('inputAreaObra');
        if (inputArea) {
            inputArea.addEventListener('blur', (event) => {
                const input = event.target;
                this.clearInputError(input);
                let valueStr = input.value.replace(" m²", "").replace(/[^0-9]/g, ''); // Apenas dígitos
                let value = parseInt(valueStr, 10); 
                if (isNaN(value) || value < 1) {
                    this.showInputError(input, 'Área inválida. Mínimo 1 m² e deve ser inteiro.');
                    value = getAreaObra(); 
                    if (value < 1 || !Number.isInteger(value)) value = 1;
                }
                const intValue = value; // Já é inteiro
                input.value = `${intValue} m²`; 
                setAreaObra(intValue); 
                this.updateAllTabs(); 
            });
            inputArea.addEventListener('focus', () => this.clearInputError(inputArea));
        }
    },
    resetUI() { 
        configManager.resetToDefaults(); 
        calc.resetCalculadora(); 
        if (simBDI.populateInputsFromState) simBDI.populateInputsFromState(); // Garante que simBDI use os valores resetados de data.js
        if (simBDI.recalculateAllBlocks) simBDI.recalculateAllBlocks();
        
        const inputPesquisa = document.getElementById('inputPesquisaServico');
        if(inputPesquisa) inputPesquisa.value = '';
        const selectServ = document.getElementById('selectServico');
        if(selectServ) selectServ.value = '';
        const inputDuracao = document.getElementById('inputDuracaoEstimada');
        if(inputDuracao) {
            inputDuracao.value = 6; 
            if (this.clearInputError) this.clearInputError(inputDuracao);
        }
        
        this.clearAllErrorMessages();
        // updateAllTabs é chamado por changeTab ou explicitamente se necessário
        if (this.currentTab !== 'configuracoes') {
            this.changeTab('configuracoes', true); // Força atualização de tudo na volta para config
        } else {
            this.updateAllTabs(); // Se já estiver em config, apenas atualiza tudo
        }
    },
    clearAllErrorMessages() { document.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; el.style.display = 'none'; }); document.querySelectorAll('.input-error').forEach(el => { el.classList.remove('input-error'); }); }
};