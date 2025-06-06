// js/config.js
// ... (Conteúdo completo do config.js que forneci na mensagem onde reenviei o data.js completo)
// Este arquivo já estava correto e adaptado para o seu data.js.
// Repetindo para garantir que você tenha a versão certa nesta sequência final.
import { formatCurrency, formatPercentage, parseFloatStrict } from './utils.js';
import { ui } from './ui.js';
import {
    getLaborCosts, updateLaborCost,
    getMaterialPrices, updateMaterialPrice, getMateriaisBase,
    getBdiFinalAdotado, setBdiFinalAdotado,
    getAreaObra, setAreaObra,
    laborCosts as initialLaborCostsState, // Renomeando para evitar conflito com a função getter
    // materialPrices as initialMaterialPrices, // Não precisamos do estado inicial aqui, pois populamos de materiaisBase
    materiaisBase, // Para pegar os default prices
    bdiFinalAdotado as initialBdiFinalAdotadoState,
    areaObra as initialAreaObraState
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
        const currentMaterialPrices = getMaterialPrices();
        const baseMaterials = getMateriaisBase(); 
        for (const matId in baseMaterials) { 
            const inputElement = document.getElementById(`inputPreco${matId}`);
            if (inputElement) {
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
        const defaultLaborCosts = initialLaborCostsState;
        for (const prof in defaultLaborCosts) {
            updateLaborCost(prof, defaultLaborCosts[prof]);
        }
        for (const matId in materiaisBase) {
            updateMaterialPrice(matId, materiaisBase[matId].precoUnitarioDefault);
        }
        setBdiFinalAdotado(initialBdiFinalAdotadoState);
        setAreaObra(initialAreaObraState);
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
        // O listener de inputAreaObra foi movido para ui.js por causa da formatação " m²"
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