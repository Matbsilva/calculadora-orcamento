// js/ui.js
import { configManager } from './config.js';
import { calculadora as calc } from './calculadora.js';
import { simulacoesBDI as simBDI } from './simulacoesBDI.js';
import { parseCurrency, formatCurrency, parsePercentage, formatPercentage, debounce } from './utils.js';
import { listaServicos } from './data.js'; // Usando seu data.js
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
        
        // Inicializa os gráficos (eles podem não renderizar nada se não houver dados ainda)
        initGraficoCurvaABC();
        initGraficoPizzaCustos();
        initGraficoGantt();

        this.updateAllTabs(); // Isso também deve chamar a renderização/atualização dos gráficos
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    },

    changeTab(tabId) {
        // Destruir gráficos da aba anterior para evitar problemas de renderização e memória
        if (this.currentTab === 'curva-abc') destroyChartCurvaABC();
        if (this.currentTab === 'resumo') destroyChartPizzaCustos(); // Pizza está no Resumo
        if (this.currentTab === 'cronograma') destroyChartGantt();

        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('active');
        this.currentTab = tabId;
        this.updateCurrentTabContent(); // Isso renderizará o gráfico da nova aba, se houver
    },

    updateCurrentTabContent() {
        const config = configManager.getConfig();
        const itensCalc = calc.getItens();
        const totalCustoDireto = calc.getTotalCustoDireto();
        const precoVendaTotal = totalCustoDireto * (1 + config.bdiFinal / 100);
        const duracaoInput = document.getElementById('inputDuracaoEstimada');
        const duracao = duracaoInput ? (parseInt(duracaoInput.value, 10) || 6) : 6;

        switch (this.currentTab) {
            case 'resumo':
                resumoFinanceiro.updateResumo(itensCalc, config);
                renderizarGraficoPizzaCustos(totalCustoDireto > 0 ? configManager.config : null); // Passa config para pegar totais de MO/Mat
                break;
            case 'listas':
                moduloListas.updateListaServicos(itensCalc);
                moduloListas.updateListaMateriais(itensCalc, config, listaServicos);
                break;
            case 'curva-abc':
                const dadosCurva = curvaABC.updateCurvaABC(itensCalc); // Supondo que updateCurvaABC retorne os dados para o gráfico
                renderizarGraficoCurvaABC(dadosCurva); // Passa os dados processados
                break;
            case 'cronograma':
                cronogramaEstimado.updateCronograma(precoVendaTotal, duracao);
                renderizarGraficoGantt(itensCalc, duracao, new Date()); // Passa itens, duração e data de início
                break;
            case 'simulacoes-bdi':
                simBDI.calcularEExibirBDI(); // Já atualiza seus próprios elementos
                break;
            // Abas 'configuracoes' e 'calculadora' são atualizadas por seus próprios módulos ou interações
        }
    },
    
    updateAllTabs() {
        const config = configManager.getConfig();
        const itensCalc = calc.getItens();
        const totalCustoDireto = calc.getTotalCustoDireto();
        const precoVendaTotal = totalCustoDireto * (1 + config.bdiFinal / 100);
        const duracaoInput = document.getElementById('inputDuracaoEstimada');
        const duracao = duracaoInput ? (parseInt(duracaoInput.value, 10) || 6) : 6;

        // Atualiza dados das abas de relatório
        resumoFinanceiro.updateResumo(itensCalc, config);
        moduloListas.updateListaServicos(itensCalc);
        moduloListas.updateListaMateriais(itensCalc, config, listaServicos);
        const dadosCurva = curvaABC.updateCurvaABC(itensCalc); // Pega os dados para o gráfico
        cronogramaEstimado.updateCronograma(precoVendaTotal, duracao);
        
        // Atualiza simulações BDI (que depende do total da calculadora)
        simBDI.calcularEExibirBDI();

        // Atualiza gráficos se as abas estiverem ativas ou se os dados mudaram
        // Idealmente, a renderização do gráfico é chamada quando a aba é ativada (em updateCurrentTabContent)
        // Mas se os dados mudam enquanto a aba do gráfico está visível, ela precisa ser re-renderizada.
        if (this.currentTab === 'resumo') renderizarGraficoPizzaCustos(totalCustoDireto > 0 ? config : null);
        if (this.currentTab === 'curva-abc') renderizarGraficoCurvaABC(dadosCurva);
        if (this.currentTab === 'cronograma') renderizarGraficoGantt(itensCalc, duracao, new Date());
    },

    populateServicosSelect() { /* ... (código igual ao fornecido anteriormente) ... */ const select = document.getElementById('selectServico'); if (!select) return; while (select.options.length > 1) select.remove(1); listaServicos.forEach(servico => { const option = document.createElement('option'); option.value = servico.id; option.textContent = servico.nome; select.appendChild(option); }); },
    showInputError(inputElement, message) { /* ... (código igual ao fornecido anteriormente) ... */ if (!inputElement) return; const errorElementId = inputElement.id + 'Error'; const errorElement = document.getElementById(errorElementId); inputElement.classList.add('input-error'); if (errorElement) { errorElement.textContent = message; errorElement.style.display = 'block'; } },
    clearInputError(inputElement) { /* ... (código igual ao fornecido anteriormente) ... */ if (!inputElement) return; const errorElementId = inputElement.id + 'Error'; const errorElement = document.getElementById(errorElementId); inputElement.classList.remove('input-error'); if (errorElement) { errorElement.textContent = ''; errorElement.style.display = 'none'; } },
    formatCurrencyInputOnBlur(event) { /* ... (código igual ao fornecido anteriormente) ... */ const input = event.target; this.clearInputError(input); let value = parseCurrency(input.value); let isValid = true; if (isNaN(value)) { this.showInputError(input, 'Valor inválido. Use apenas números.'); value = 0; isValid = false; } else if (value < 0) { this.showInputError(input, 'Valor não pode ser negativo.'); value = 0; isValid = false; } input.value = formatCurrency(value); return { value, isValid }; },
    formatPercentageInputOnBlur(event, min = 0, max = 100) { /* ... (código igual ao fornecido anteriormente) ... */ const input = event.target; this.clearInputError(input); let value = parsePercentage(input.value); let isValid = true; if (isNaN(value)) { this.showInputError(input, 'Valor inválido. Use apenas números.'); value = min; isValid = false; } else if (value < min) { this.showInputError(input, `Valor mínimo é ${min}%.`); value = min; isValid = false; } else if (value > max) { this.showInputError(input, `Valor máximo é ${max}%.`); value = max; isValid = false; } input.value = formatPercentage(value); return { value, isValid }; },
    setupEventListeners() { /* ... (código igual ao fornecido anteriormente, incluindo inputAreaObra) ... */ document.getElementById('btnSalvarOrcamento').addEventListener('click', () => persistencia.saveBudget(configManager.getConfig(), calc.getItens())); document.getElementById('inputCarregarOrcamento').addEventListener('change', (event) => persistencia.loadBudget(event)); document.getElementById('btnResetarAplicacao').addEventListener('click', handlers.handleResetApplication); document.getElementById('btnAdicionarServico').addEventListener('click', handlers.handleAddServico); const inputPesquisaServico = document.getElementById('inputPesquisaServico'); if (inputPesquisaServico) { inputPesquisaServico.addEventListener('input', debounce(handlers.handleSearch, 300)); } const inputDuracaoEstimada = document.getElementById('inputDuracaoEstimada'); if (inputDuracaoEstimada) { inputDuracaoEstimada.addEventListener('change', () => { this.clearInputError(inputDuracaoEstimada); let duracao = parseInt(inputDuracaoEstimada.value, 10); if (isNaN(duracao) || duracao < 1) { this.showInputError(inputDuracaoEstimada, "Duração deve ser no mínimo 1 mês."); duracao = 1; inputDuracaoEstimada.value = duracao; } if (this.currentTab === 'cronograma') this.updateCurrentTabContent(); else this.updateAllTabs(); }); inputDuracaoEstimada.addEventListener('focus', () => this.clearInputError(inputDuracaoEstimada)); } const inputAreaObra = document.getElementById('inputAreaObra'); if (inputAreaObra) { inputAreaObra.addEventListener('blur', (event) => { const input = event.target; this.clearInputError(input); let valueStr = input.value.replace(/[^0-9,.]/g, '').replace(',', '.'); let value = parseFloat(valueStr); if (isNaN(value) || value === 0) { this.showInputError(input, 'Área inválida. Mínimo 1 m².'); value = 1; } else if (value < 1) { this.showInputError(input, 'Área mínima é 1 m².'); value = 1; } else if (!Number.isInteger(value)) { this.showInputError(input, 'Área deve ser um número inteiro.'); value = Math.round(value); if (value < 1) value = 1; } input.value = `${value} m²`; configManager.setConfig('areaObra', value); this.updateAllTabs(); }); inputAreaObra.addEventListener('focus', () => this.clearInputError(inputAreaObra)); } },
    resetUI() { /* ... (código igual ao fornecido anteriormente) ... */ configManager.loadConfig(); configManager.updateUI(); simBDI.loadInitialValuesFromConfig(); simBDI.updateUIFromState(); calc.resetCalculadora(); const inputPesquisa = document.getElementById('inputPesquisaServico'); if(inputPesquisa) inputPesquisa.value = ''; const selectServ = document.getElementById('selectServico'); if(selectServ) selectServ.value = ''; const inputDuracao = document.getElementById('inputDuracaoEstimada'); if(inputDuracao) inputDuracao.value = 6; this.clearAllErrorMessages(); this.updateAllTabs(); this.changeTab('configuracoes'); },
    clearAllErrorMessages() { /* ... (código igual ao fornecido anteriormente) ... */ document.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; el.style.display = 'none'; }); document.querySelectorAll('.input-error').forEach(el => { el.classList.remove('input-error'); }); }
};