// js/config.js
// ... (Conteúdo completo do config.js que forneci na mensagem "Parte 2 de 3 (Final)" dos JS,
//      aquela que começa com "// js/config.js" e já estava adaptada para seu data.js e
//      incluía os inputs para todos os profissionais no HTML (que estão no index.html atualizado)).
// Este arquivo já estava correto. Repetindo para garantir que você tenha a versão certa.
import { formatCurrency, formatPercentage, parseFloatStrict } from './utils.js';
import { ui } from './ui.js';
import {
    getLaborCosts, updateLaborCost,
    getMaterialPrices, updateMaterialPrice, getMateriaisBase,
    getBdiFinalAdotado, setBdiFinalAdotado,
    getAreaObra, setAreaObra,
    laborCosts as initialLaborCostsState,
    materiaisBase, 
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
        // Mapeia as chaves de laborCosts para os IDs dos inputs
        const laborInputMap = {
            pedreiro: 'inputCustoPedreiro',
            servente: 'inputCustoServente',
            encarregado: 'inputCustoEncarregado', // Adicionado se existir no seu laborCosts
            impermeabilizador: 'inputCustoImpermeabilizador',
            carpinteiro: 'inputCustoCarpinteiro',
            armador: 'inputCustoArmador'
        };
        for (const profKey in laborInputMap) {
            const inputId = laborInputMap[profKey];
            const inputElement = document.getElementById(inputId);
            if (inputElement && currentLaborCosts.hasOwnProperty(profKey)) {
                inputElement.value = formatCurrency(currentLaborCosts[profKey]);
                if (ui.clearInputError) ui.clearInputError(inputElement);
            } else if (inputElement) { // Se o input existe mas a chave não está em laborCosts (pouco provável)
                inputElement.value = formatCurrency(0); // Define um padrão
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
        if (!container) { console.error("Container de preços de material não encontrado!"); return; }
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
            if (initialLaborCostsState.hasOwnProperty(prof)) { // Garante que estamos usando as chaves do estado inicial
                updateLaborCost(prof, initialLaborCostsState[prof]);
            }
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
        const laborInputMap = {
            pedreiro: 'inputCustoPedreiro', servente: 'inputCustoServente', 
            encarregado: 'inputCustoEncarregado', impermeabilizador: 'inputCustoImpermeabilizador', 
            carpinteiro: 'inputCustoCarpinteiro', armador: 'inputCustoArmador'
        };
        for (const professionalKey in laborInputMap) {
            const inputId = laborInputMap[professionalKey];
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', (event) => {
                    const { value, isValid } = ui.formatCurrencyInputOnBlur(event);
                    if (isValid) {
                        updateLaborCost(professionalKey, value);
                        if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos();
                        if (ui.updateAllTabs) ui.updateAllTabs();
                    }
                });
                input.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(input); });
            }
        }
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
                    if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos(); // Para atualizar preços de venda na calc
                    if (ui.updateAllTabs) ui.updateAllTabs();
                }
            });
            inputBdiFinal.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(inputBdiFinal); });
        }
        // O listener de inputAreaObra está em ui.js
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