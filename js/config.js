// js/config.js
import { formatCurrency, formatPercentage, parseFloatStrict } from './utils.js'; // parseFloatStrict de data.js não é mais necessário aqui
import { ui } from './ui.js';
// Importando diretamente do seu data.js as funções e o estado que precisamos
import {
    getLaborCosts, updateLaborCost,
    getMaterialPrices, updateMaterialPrice, getMateriaisBase,
    getBdiFinalAdotado, setBdiFinalAdotado,
    getAreaObra, setAreaObra,
    // Para resetar para os valores iniciais do seu data.js
    laborCosts as initialLaborCosts, // Renomeando para evitar conflito com a função getter
    materialPrices as initialMaterialPrices, // Renomeando
    materiaisBase, // Para pegar os default prices
    bdiFinalAdotado as initialBdiFinalAdotado,
    areaObra as initialAreaObra
} from './data.js';

export const configManager = {
    // Não há mais um objeto 'this.config' interno aqui.
    // As operações leem/escrevem diretamente no estado de 'data.js'

    init() {
        this.populateMaterialPricesUI(); // Popula os campos de preço de material dinamicamente
        this.loadConfigValuesToUI();   // Carrega os valores atuais de data.js para a UI
        this.setupEventListeners();
    },

    loadConfigValuesToUI() {
        const currentLaborCosts = getLaborCosts();
        // Campos de Custo de Mão de Obra
        for (const prof in currentLaborCosts) {
            const inputId = `inputCusto${prof.charAt(0).toUpperCase() + prof.slice(1)}`;
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.value = formatCurrency(currentLaborCosts[prof]);
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        }

        // Campos de Preço de Material (já populados por populateMaterialPricesUI, aqui apenas atualiza valores)
        const currentMaterialPrices = getMaterialPrices();
        for (const matId in currentMaterialPrices) {
            const inputElement = document.getElementById(`inputPreco${matId}`);
            if (inputElement) {
                inputElement.value = formatCurrency(currentMaterialPrices[matId]);
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        }
        
        // Parâmetros Gerais
        const inputBdi = document.getElementById('inputBdiFinal');
        if (inputBdi) {
            inputBdi.value = formatPercentage(getBdiFinalAdotado());
            if (ui.clearInputError) ui.clearInputError(inputBdi);
        }
        const inputArea = document.getElementById('inputAreaObra');
        if (inputArea) {
            inputArea.value = `${getAreaObra()} m²`; // Formatado com unidade
            if (ui.clearInputError) ui.clearInputError(inputArea);
        }
    },
    
    populateMaterialPricesUI() {
        const container = document.getElementById('materialPricesConfigContainer');
        if (!container) return;
        container.innerHTML = ''; // Limpa container

        const currentMaterialPrices = getMaterialPrices(); // Pega os preços atuais (podem ter sido carregados)
        const baseMaterials = getMateriaisBase();       // Pega a estrutura base com nomes e unidades

        for (const materialId in baseMaterials) {
            const materialInfo = baseMaterials[materialId];
            const price = currentMaterialPrices[materialId] !== undefined ? currentMaterialPrices[materialId] : materialInfo.precoUnitarioDefault;

            const group = document.createElement('div');
            group.classList.add('input-group');

            const label = document.createElement('label');
            label.setAttribute('for', `inputPreco${materialId}`);
            label.textContent = `${materialInfo.nomeDisplay} (${materialInfo.unidade}):`; // Usa nomeDisplay e unidade
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `inputPreco${materialId}`;
            input.value = formatCurrency(price);
            input.setAttribute('data-material-id', materialId); // Para identificar o material no event listener

            const errorSpan = document.createElement('span');
            errorSpan.classList.add('error-message');
            errorSpan.id = `inputPreco${materialId}Error`;

            group.appendChild(label);
            group.appendChild(input);
            group.appendChild(errorSpan);
            container.appendChild(group);
        }
    },

    resetToDefaults() {
        // Reseta os valores no data.js para os iniciais
        for (const prof in initialLaborCosts) {
            updateLaborCost(prof, initialLaborCosts[prof]);
        }
        for (const matId in materiaisBase) { // Usa materiaisBase para pegar os defaults
            updateMaterialPrice(matId, materiaisBase[matId].precoUnitarioDefault);
        }
        setBdiFinalAdotado(initialBdiFinalAdotado);
        setAreaObra(initialAreaObra);

        this.loadConfigValuesToUI(); // Atualiza a UI com os valores resetados
        
        if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos();
        if (ui.updateAllTabs) ui.updateAllTabs();
    },

    // saveConfig e loadConfig (para localStorage) foram movidos para persistencia.js
    // e gerenciados globalmente, pois salvam/carregam todo o orçamento.
    // O botão "Salvar Configurações" na UI agora apenas confirma que os valores estão no data.js
    // A persistência real acontece com "Salvar Orçamento"
    
    handleSaveLocalConfig() { // Chamado pelo botão "Salvar Configurações"
        // Esta função agora serve mais como uma confirmação ou um gatilho para salvar o estado
        // completo do orçamento, se desejado, ou apenas garantir que data.js está atualizado.
        // Por simplicidade, vamos assumir que data.js já é a fonte da verdade e
        // o "Salvar Orçamento" global cuida da persistência.
        // Se quisermos um localStorage específico para configurações, essa lógica iria aqui.
        alert('Configurações aplicadas. Use "Salvar Orçamento" para persistir todas as alterações.');
    },


    setupEventListeners() {
        // Mão de Obra
        const laborCostInputs = [
            'inputCustoPedreiro', 'inputCustoServente', 'inputCustoEncarregado',
            'inputCustoImpermeabilizador', 'inputCustoCarpinteiro', 'inputCustoArmador'
        ];
        laborCostInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('blur', (event) => {
                    const { value, isValid } = ui.formatCurrencyInputOnBlur(event);
                    if (isValid) {
                        const professionalKey = id.replace('inputCusto', '').toLowerCase();
                        updateLaborCost(professionalKey, value); // Atualiza em data.js
                        if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos();
                        if (ui.updateAllTabs) ui.updateAllTabs();
                    }
                });
                input.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(input); });
            }
        });

        // Preços de Materiais (delegado, pois são criados dinamicamente)
        const materialPricesContainer = document.getElementById('materialPricesConfigContainer');
        if (materialPricesContainer) {
            materialPricesContainer.addEventListener('blur', (event) => {
                const target = event.target;
                if (target.tagName === 'INPUT' && target.id.startsWith('inputPreco')) {
                    const { value, isValid } = ui.formatCurrencyInputOnBlur(event);
                    if (isValid) {
                        const materialId = target.dataset.materialId;
                        updateMaterialPrice(materialId, value); // Atualiza em data.js
                        if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos();
                        if (ui.updateAllTabs) ui.updateAllTabs();
                    }
                }
            }, true); // Use capturing para o evento blur em elementos dinâmicos

            materialPricesContainer.addEventListener('focus', (event) => {
                const target = event.target;
                if (target.tagName === 'INPUT' && target.id.startsWith('inputPreco')) {
                    if (ui.clearInputError) ui.clearInputError(target);
                }
            }, true);
        }
        
        // Parâmetros Gerais
        const inputBdiFinal = document.getElementById('inputBdiFinal');
        if (inputBdiFinal) {
            inputBdiFinal.addEventListener('blur', (event) => {
                const { value, isValid } = ui.formatPercentageInputOnBlur(event, 0, 1000);
                if (isValid) {
                    setBdiFinalAdotado(value); // Atualiza em data.js
                    if (ui.updateAllTabs) ui.updateAllTabs();
                }
            });
            inputBdiFinal.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(inputBdiFinal); });
        }
        
        // Listener para inputAreaObra já está em ui.js devido à sua formatação específica (com " m²")

        // Botões
        const btnSalvar = document.getElementById('btnSalvarConfig');
        // O botão "Salvar Configurações" agora é mais um "Aplicar Mudanças Locais",
        // a persistência real é feita pelo "Salvar Orçamento" global.
        // Poderíamos fazer um localStorage.setItem('configSnapshot', JSON.stringify({laborCosts: getLaborCosts(), ...}))
        // aqui se quiséssemos uma persistência leve só das configs. Por ora, vamos simplificar.
        if (btnSalvar) btnSalvar.addEventListener('click', () => this.handleSaveLocalConfig()); 
        
        const btnCarregarPadrao = document.getElementById('btnCarregarConfigPadrao');
        if (btnCarregarPadrao) {
            btnCarregarPadrao.addEventListener('click', () => {
                if (confirm('Deseja carregar as configurações padrão? As alterações atuais (não salvas no orçamento) serão perdidas.')) {
                    this.resetToDefaults();
                    alert('Configurações padrão carregadas e aplicadas.');
                }
            });
        }
    }
};