// js/ui.js
import { configManager } from './config.js';
import { calculadora as calc } from './calculadora.js';
import { simulacoesBDI as simBDI } from './simulacoesBDI.js';
import { parseCurrency, formatCurrency, parsePercentage, formatPercentage, debounce, parseFloatStrict } from './utils.js';
// Importando do SEU data.js
import { budgetDataStructure as baseListaServicos, getAreaObra } from './data.js';
import { persistencia } from './persistencia.js';
import { handlers } from './handlers.js';
// Importando do SEU relatorios.js
import { resumoFinanceiro, listas as moduloListas, curvaABC, cronogramaEstimado } from './relatorios.js';

// Importando os novos módulos de gráficos
import { initGraficoCurvaABC, renderizarGraficoCurvaABC, destroyChartCurvaABC } from './graficoCurvaABC.js';
import { initGraficoPizzaCustos, renderizarGraficoPizzaCustos, destroyChartPizzaCustos } from './graficoPizzaCustos.js';
import { initGraficoGantt, renderizarGraficoGantt, destroyChartGantt } from './graficoGantt.js';

export const ui = {
    currentTab: 'configuracoes', // Aba inicial
    calculadora: calc, // Expondo para simulaçõesBDI poder pegar o total
    simulacoesBDI: simBDI, // Expondo se necessário

    init() {
        this.setupTabNavigation();
        this.populateServicosSelect();
        this.setupEventListeners();
        
        configManager.init(); // Isso deve carregar valores de data.js para a UI e configurar listeners da aba config
        calc.init();      
        simBDI.init();    // Isso deve carregar valores de data.js/configManager e configurar listeners da aba BDI
        
        initGraficoCurvaABC();
        initGraficoPizzaCustos();
        initGraficoGantt();

        this.changeTab(this.currentTab); // Força a atualização da primeira aba ativa e seus gráficos
        // this.updateAllTabs(); // Chamado dentro de changeTab via updateCurrentTabContent
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    },

    setupTabNavigation() {
        const tabLinks = document.querySelectorAll('.tab-link');
        tabLinks.forEach(link => {
            link.addEventListener('click', () => this.changeTab(link.dataset.tab));
            // Adicionar atributos ARIA para acessibilidade
            link.setAttribute('role', 'tab');
            link.setAttribute('aria-selected', 'false');
            link.setAttribute('tabindex', '-1'); // Não focável por Tab inicialmente
            const tabContentId = link.dataset.tab;
            link.setAttribute('aria-controls', tabContentId);
            const tabContent = document.getElementById(tabContentId);
            if (tabContent) {
                tabContent.setAttribute('role', 'tabpanel');
                tabContent.setAttribute('aria-labelledby', link.id || `tab-${tabContentId}`);
                if (!link.id) link.id = `tab-${tabContentId}`;
            }
        });
        // Ativar a primeira aba
        const firstTabLink = document.querySelector('.tab-link[data-tab="configuracoes"]');
        if (firstTabLink) {
            firstTabLink.classList.add('active');
            firstTabLink.setAttribute('aria-selected', 'true');
            firstTabLink.setAttribute('tabindex', '0'); // Focável
            const firstTabContent = document.getElementById(firstTabLink.dataset.tab);
            if (firstTabContent) firstTabContent.classList.add('active');
        }
    },
    
    changeTab(tabId) {
        // Destruir gráficos da aba anterior
        if (this.currentTab === 'curva-abc' && typeof destroyChartCurvaABC === 'function') destroyChartCurvaABC();
        if (this.currentTab === 'resumo' && typeof destroyChartPizzaCustos === 'function') destroyChartPizzaCustos();
        if (this.currentTab === 'cronograma' && typeof destroyChartGantt === 'function') destroyChartGantt();

        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('.tab-link').forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-selected', 'false');
            link.setAttribute('tabindex', '-1');
        });

        const activeTabLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
        const activeTabContent = document.getElementById(tabId);

        if(activeTabLink) {
            activeTabLink.classList.add('active');
            activeTabLink.setAttribute('aria-selected', 'true');
            activeTabLink.setAttribute('tabindex', '0'); // Torna a aba ativa focável
            activeTabLink.focus(); // Opcional: move o foco para a aba clicada
        }
        if(activeTabContent) activeTabContent.classList.add('active');
        
        this.currentTab = tabId;
        this.updateCurrentTabContent();
    },

    updateCurrentTabContent() {
        // Os dados para os relatórios e gráficos são obtidos das fontes atuais (calculadora, configManager/data.js)
        const itensParaRelatorio = calc.getItensComCustosCalculados(); // Itens ativos com custos
        const configAtual = { // Objeto similar ao que resumoFinanceiro espera
            bdiFinal: getBdiFinalAdotado(),
            areaObra: getAreaObra(),
            // Adicionar totais de MO e Material se resumoFinanceiro precisar diretamente
            // Normalmente resumoFinanceiro calcula isso de itensParaRelatorio
        };
        const totalCustoDireto = calc.getTotalCustoDireto();
        const precoVendaTotal = totalCustoDireto * (1 + configAtual.bdiFinal / 100);
        const duracaoInput = document.getElementById('inputDuracaoEstimada');
        const duracao = duracaoInput ? (parseInt(duracaoInput.value, 10) || 6) : 6;

        switch (this.currentTab) {
            case 'resumo':
                resumoFinanceiro.updateResumo(itensParaRelatorio, configAtual); // Seu relatorios.js
                renderizarGraficoPizzaCustos(); // graficoPizzaCustos.js pega os dados do DOM do resumo
                break;
            case 'listas':
                moduloListas.updateListaServicos(itensParaRelatorio); // Seu relatorios.js
                moduloListas.updateListaMateriais(baseListaServicos.filter(item => item.initialQuantity > 0), configAtual, baseListaServicos); // Seu relatorios.js
                break;
            case 'curva-abc':
                const dadosCurva = curvaABC.updateCurvaABC(itensParaRelatorio); // Seu relatorios.js
                renderizarGraficoCurvaABC(dadosCurva); // graficoCurvaABC.js
                break;
            case 'cronograma':
                cronogramaEstimado.updateCronograma(precoVendaTotal, duracao); // Seu relatorios.js
                renderizarGraficoGantt(itensParaRelatorio, duracao, new Date()); // graficoGantt.js
                break;
            case 'simulacoes-bdi':
                if (simBDI.calcularEExibirBDI) simBDI.calcularEExibirBDI();
                break;
        }
    },
    
    updateAllTabs() { // Chamado após mudanças significativas de dados
        // Recalcula e atualiza todas as abas de relatório e gráficos
        const itensParaRelatorio = calc.getItensComCustosCalculados();
        const configAtual = { bdiFinal: getBdiFinalAdotado(), areaObra: getAreaObra() };
        const totalCustoDireto = calc.getTotalCustoDireto();
        const precoVendaTotal = totalCustoDireto * (1 + configAtual.bdiFinal / 100);
        const duracaoInput = document.getElementById('inputDuracaoEstimada');
        const duracao = duracaoInput ? (parseInt(duracaoInput.value, 10) || 6) : 6;

        if (resumoFinanceiro && resumoFinanceiro.updateResumo) resumoFinanceiro.updateResumo(itensParaRelatorio, configAtual);
        if (moduloListas && moduloListas.updateListaServicos) moduloListas.updateListaServicos(itensParaRelatorio);
        if (moduloListas && moduloListas.updateListaMateriais) moduloListas.updateListaMateriais(baseListaServicos.filter(item => item.initialQuantity > 0), configAtual, baseListaServicos);
        if (curvaABC && curvaABC.updateCurvaABC) {
            const dadosCurva = curvaABC.updateCurvaABC(itensParaRelatorio);
            if (this.currentTab === 'curva-abc') renderizarGraficoCurvaABC(dadosCurva);
        }
        if (cronogramaEstimado && cronogramaEstimado.updateCronograma) cronogramaEstimado.updateCronograma(precoVendaTotal, duracao);
        
        if (simBDI.calcularEExibirBDI) simBDI.calcularEExibirBDI();

        // Atualiza gráficos que podem estar visíveis ou precisam ser atualizados em segundo plano
        if (this.currentTab === 'resumo') renderizarGraficoPizzaCustos();
        // A Curva ABC e Gantt são atualizados em updateCurrentTabContent quando a aba é ativada
        // ou aqui se quisermos forçar a atualização mesmo que a aba não esteja ativa (pode ser pesado)
        // Por ora, a atualização principal dos gráficos ocorre ao mudar para a aba.
        if (this.currentTab === 'cronograma') renderizarGraficoGantt(itensParaRelatorio, duracao, new Date());
    },

    populateServicosSelect() {
        const select = document.getElementById('selectServico');
        if (!select) return;
        while (select.options.length > 1) select.remove(1);
        // Usando baseListaServicos (que é budgetDataStructure do seu data.js)
        baseListaServicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.refComposition; // Usando refComposition como ID
            option.textContent = servico.description; // Usando description para o nome
            select.appendChild(option);
        });
    },
    showInputError(inputElement, message) { if (!inputElement) return; const errorElementId = inputElement.id + 'Error'; const errorElement = document.getElementById(errorElementId); inputElement.classList.add('input-error'); if (errorElement) { errorElement.textContent = message; errorElement.style.display = 'block'; } },
    clearInputError(inputElement) { if (!inputElement) return; const errorElementId = inputElement.id + 'Error'; const errorElement = document.getElementById(errorElementId); inputElement.classList.remove('input-error'); if (errorElement) { errorElement.textContent = ''; errorElement.style.display = 'none'; } },
    formatCurrencyInputOnBlur(event) { const input = event.target; this.clearInputError(input); let value = parseCurrency(input.value); let isValid = true; if (isNaN(value)) { this.showInputError(input, 'Valor inválido.'); value = 0; isValid = false; } else if (value < 0) { this.showInputError(input, 'Não pode ser negativo.'); value = 0; isValid = false; } input.value = formatCurrency(value); return { value, isValid }; },
    formatPercentageInputOnBlur(event, min = 0, max = 100) { const input = event.target; this.clearInputError(input); let value = parsePercentage(input.value); let isValid = true; if (isNaN(value)) { this.showInputError(input, 'Valor inválido.'); value = min; isValid = false; } else if (value < min) { this.showInputError(input, `Mínimo ${min}%.`); value = min; isValid = false; } else if (value > max) { this.showInputError(input, `Máximo ${max}%.`); value = max; isValid = false; } input.value = formatPercentage(value); return { value, isValid }; },
    
    setupEventListeners() {
        // Botões do Header
        const btnSalvarOrc = document.getElementById('btnSalvarOrcamento');
        if (btnSalvarOrc) btnSalvarOrc.addEventListener('click', () => persistencia.saveBudget(
            { // Passando o estado atual de data.js para persistencia
                laborCosts: getLaborCosts(),
                materialPrices: getMaterialPrices(),
                bdiFinalAdotado: getBdiFinalAdotado(),
                areaObra: getAreaObra()
            }, 
            calc.getItensParaSalvar() // Passando as composições ativas com suas quantidades
        ));
        const inputCarregarOrc = document.getElementById('inputCarregarOrcamento');
        if (inputCarregarOrc) inputCarregarOrc.addEventListener('change', (event) => persistencia.loadBudget(event));
        const btnResetApp = document.getElementById('btnResetarAplicacao');
        if (btnResetApp) btnResetApp.addEventListener('click', handlers.handleResetApplication);
        
        // Aba Calculadora
        const btnAddServ = document.getElementById('btnAdicionarServico');
        if (btnAddServ) btnAddServ.addEventListener('click', handlers.handleAddServico);
        const inputPesqServ = document.getElementById('inputPesquisaServico');
        if (inputPesqServ) inputPesqServ.addEventListener('input', debounce(handlers.handleSearch, 300));

        // Aba Cronograma
        const inputDuracaoEst = document.getElementById('inputDuracaoEstimada');
        if (inputDuracaoEst) {
            inputDuracaoEst.addEventListener('change', () => {
                this.clearInputError(inputDuracaoEst);
                let duracao = parseInt(inputDuracaoEst.value, 10);
                if (isNaN(duracao) || duracao < 1) {
                    this.showInputError(inputDuracaoEst, "Duração deve ser no mínimo 1 mês.");
                    duracao = 1;
                    inputDuracaoEst.value = duracao;
                }
                if (this.currentTab === 'cronograma') this.updateCurrentTabContent(); else this.updateAllTabs();
            });
            inputDuracaoEst.addEventListener('focus', () => this.clearInputError(inputDuracaoEst));
        }

        // Input Área da Obra (já que tem formatação específica com " m²" e validação)
        const inputArea = document.getElementById('inputAreaObra');
        if (inputArea) {
            inputArea.addEventListener('blur', (event) => {
                const input = event.target;
                this.clearInputError(input);
                let valueStr = input.value.replace(" m²", "").replace(/[^0-9,.]/g, '').replace(',', '.');
                let value = parseFloatStrict(valueStr); // Usar parseFloatStrict
                if (isNaN(value) || value < 1 || !Number.isInteger(value)) {
                    this.showInputError(input, 'Área inválida. Mínimo 1 m² e deve ser inteiro.');
                    value = getAreaObra(); // Reverte para o valor anterior de data.js
                    if (value < 1 || !Number.isInteger(value)) value = 1; // Fallback
                }
                input.value = `${parseInt(value, 10)} m²`; // Garante inteiro na UI
                setAreaObra(parseInt(value, 10)); // Salva como inteiro em data.js
                this.updateAllTabs(); 
            });
            inputArea.addEventListener('focus', () => this.clearInputError(inputArea));
        }
    },

    resetUI() {
        // configManager.resetToDefaults() já deve atualizar os valores em data.js e chamar seu updateUI
        configManager.resetToDefaults(); 
        calc.resetCalculadora(); 
        simBDI.loadInitialValuesFromConfig(); // Para pegar os valores resetados de config/data.js
        simBDI.updateUIFromState(); // Para refletir na UI da simulação
        
        const inputPesquisa = document.getElementById('inputPesquisaServico');
        if(inputPesquisa) inputPesquisa.value = '';
        const selectServ = document.getElementById('selectServico');
        if(selectServ) selectServ.value = '';
        const inputDuracao = document.getElementById('inputDuracaoEstimada');
        if(inputDuracao) {
            inputDuracao.value = 6;
            this.clearInputError(inputDuracao);
        }
        
        this.clearAllErrorMessages();
        this.updateAllTabs(); // Atualiza todos os relatórios e gráficos
        if (this.currentTab !== 'configuracoes') {
            this.changeTab('configuracoes'); // Volta para a primeira aba
        } else {
            this.updateCurrentTabContent(); // Se já estiver na primeira, apenas atualiza
        }
    },
    clearAllErrorMessages() { document.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; el.style.display = 'none'; }); document.querySelectorAll('.input-error').forEach(el => { el.classList.remove('input-error'); }); }
};