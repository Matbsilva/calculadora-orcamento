// js/config.js
// ... (Conteúdo completo do config.js que forneci na mensagem anterior)
// Nenhuma mudança neste arquivo em relação à última vez que o enviei,
// pois ele já estava adaptado para interagir com as funções e estado do seu data.js
// (usando getLaborCosts, updateMaterialPrice, etc.).
import { formatCurrency, formatPercentage, parseFloatStrict } from './utils.js';
import { ui } from './ui.js';
import {
    getLaborCosts, updateLaborCost,
    getMaterialPrices, updateMaterialPrice, getMateriaisBase,
    getBdiFinalAdotado, setBdiFinalAdotado,
    getAreaObra, setAreaObra,
    laborCosts as initialLaborCosts, 
    materialPrices as initialMaterialPrices,
    materiaisBase,
    bdiFinalAdotado as initialBdiFinalAdotado,
    areaObra as initialAreaObra
} from './data.js';

export const configManager = {
    init() {
        this.populateMaterialPricesUI(); 
        this.loadConfigValuesToUI();   
        this.setupEventListeners();
    },
    loadConfigValuesToUI() {
        const currentLaborCosts = getLaborCosts();
        for (const prof in currentLaborCosts) {
            const inputId = `inputCusto${prof.charAt(0).toUpperCase() + prof.slice(1)}`;
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.value = formatCurrency(currentLaborCosts[prof]);
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        }
        const currentMaterialPrices = getMaterialPrices(); // Atualizado aqui para pegar do data.js
        const baseMaterials = getMateriaisBase(); // Para ter os nomes e unidades
        for (const matId in baseMaterials) { // Itera sobre a base para garantir que todos os campos sejam considerados
            const inputElement = document.getElementById(`inputPreco${matId}`);
            if (inputElement) {
                // Pega o preço de currentMaterialPrices se existir, senão o default de materiaisBase
                const price = currentMaterialPrices[matId] !== undefined ? currentMaterialPrices[matId] : baseMaterials[matId].precoUnitarioDefault;
                inputElement.value = formatCurrency(price);
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        }
        const inputBdi = document.getElementById('inputBdiFinal');
        if (inputBdi) {
            inputBdi.value = formatPercentage(getBdiFinalAdotado());
            if (ui.clearInputError) ui.clearInputError(inputBdi);
        }
        const inputArea = document.getElementById('inputAreaObra');
        if (inputArea) {
            inputArea.value = `${getAreaObra()} m²`; 
            if (ui.clearInputError) ui.clearInputError(inputArea);
        }
    },
    populateMaterialPricesUI() {
        const container = document.getElementById('materialPricesConfigContainer');
        if (!container) return;
        container.innerHTML = ''; 
        const currentMaterialPrices = getMaterialPrices(); 
        const baseMaterials = getMateriaisBase();       
        for (const materialId in baseMaterials) {
            const materialInfo = baseMaterials[materialId];
            const price = currentMaterialPrices[materialId] !== undefined ? currentMaterialPrices[materialId] : materialInfo.precoUnitarioDefault;
            const group = document.createElement('div');
            group.classList.add('input-group');
            const label = document.createElement('label');
            label.setAttribute('for', `inputPreco${materialId}`);
            label.textContent = `${materialInfo.nomeDisplay} (${materialInfo.unidade}):`; 
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `inputPreco${materialId}`;
            input.value = formatCurrency(price);
            input.setAttribute('data-material-id', materialId); 
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
        const defaultLaborCosts = initialLaborCosts; // Vem do data.js
        for (const prof in defaultLaborCosts) { // Usa o objeto inicial de data.js
            updateLaborCost(prof, defaultLaborCosts[prof]);
        }
        for (const matId in materiaisBase) {
            updateMaterialPrice(matId, materiaisBase[matId].precoUnitarioDefault);
        }
        setBdiFinalAdotado(initialBdiFinalAdotado); // Vem do data.js
        setAreaObra(initialAreaObra); // Vem do data.js
        this.loadConfigValuesToUI(); 
        if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos();
        if (ui.updateAllTabs) ui.updateAllTabs();
    },
    handleSaveLocalConfig() { 
        alert('Configurações aplicadas localmente. Use "Salvar Orçamento" no topo para persistir todas as alterações em um arquivo.');
    },
    setupEventListeners() {
        const laborCostInputs = [ 'inputCustoPedreiro', 'inputCustoServente', 'inputCustoEncarregado', 'inputCustoImpermeabilizador', 'inputCustoCarpinteiro', 'inputCustoArmador' ];
        laborCostInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('blur', (event) => {
                    const { value, isValid } = ui.formatCurrencyInputOnBlur(event);
                    if (isValid) {
                        const professionalKey = id.replace('inputCusto', '').toLowerCase();
                        updateLaborCost(professionalKey, value);
                        if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos();
                        if (ui.updateAllTabs) ui.updateAllTabs();
                    }
                });
                input.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(input); });
            }
        });
        const materialPricesContainer = document.getElementById('materialPricesConfigContainer');
        if (materialPricesContainer) {
            materialPricesContainer.addEventListener('blur', (event) => {
                const target = event.target;
                if (target.tagName === 'INPUT' && target.id.startsWith('inputPreco')) {
                    const { value, isValid } = ui.formatCurrencyInputOnBlur(event);
                    if (isValid) {
                        const materialId = target.dataset.materialId;
                        updateMaterialPrice(materialId, value);
                        if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos();
                        if (ui.updateAllTabs) ui.updateAllTabs();
                    }
                }
            }, true); 
            materialPricesContainer.addEventListener('focus', (event) => {
                const target = event.target;
                if (target.tagName === 'INPUT' && target.id.startsWith('inputPreco')) {
                    if (ui.clearInputError) ui.clearInputError(target);
                }
            }, true);
        }
        const inputBdiFinal = document.getElementById('inputBdiFinal');
        if (inputBdiFinal) {
            inputBdiFinal.addEventListener('blur', (event) => {
                const { value, isValid } = ui.formatPercentageInputOnBlur(event, 0, 1000);
                if (isValid) {
                    setBdiFinalAdotado(value);
                    if (ui.updateAllTabs) ui.updateAllTabs();
                }
            });
            inputBdiFinal.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(inputBdiFinal); });
        }
        const btnSalvar = document.getElementById('btnSalvarConfig');
        if (btnSalvar) btnSalvar.addEventListener('click', () => this.handleSaveLocalConfig()); 
        const btnCarregarPadrao = document.getElementById('btnCarregarConfigPadrao');
        if (btnCarregarPadrao) {
            btnCarregarPadrao.addEventListener('click', () => {
                if (confirm('Deseja carregar as configurações padrão para mão de obra, materiais, BDI e área? As alterações atuais (não salvas no orçamento) serão perdidas.')) {
                    this.resetToDefaults();
                    alert('Configurações padrão carregadas e aplicadas.');
                }
            });
        }
    }
};