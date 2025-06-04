// js/configuracao.js
import { parseFloatStrict, validateNumberInput, formatNumber } from './util.js';
import { 
    getLaborCosts, 
    getMaterialPrices, 
    getMateriaisBase, 
    getBdiFinalAdotado, 
    getAreaObra,
    updateLaborCost, 
    updateMaterialPrice, 
    setBdiFinalAdotado, 
    setAreaObra 
} from './data.js';

let populateAndCalculateTableCallback; 
let recalculateAllSimulationsCallback; 

export function setCallbacks(populateFunc, simulateFunc) {
    populateAndCalculateTableCallback = populateFunc;
    recalculateAllSimulationsCallback = simulateFunc;
}

export function populateMaterialPricesConfigUI(materialPricesContainer) {
    // console.log("configuracao.js: populateMaterialPricesConfigUI chamada");
    if (!materialPricesContainer) {
        console.error("Elemento materialPricesContainer não encontrado em populateMaterialPricesConfigUI.");
        return;
    }
    materialPricesContainer.innerHTML = ''; 
    const currentMaterialPrices = getMaterialPrices(); 
    const currentMateriaisBase = getMateriaisBase();

    Object.keys(currentMateriaisBase).sort((a, b) => currentMateriaisBase[a].nomeDisplay.localeCompare(currentMateriaisBase[b].nomeDisplay)).forEach(idMaterial => {
        const materialBase = currentMateriaisBase[idMaterial];
        
        let currentPrice = currentMaterialPrices[idMaterial];
        if (currentPrice === undefined || currentPrice === null || isNaN(currentPrice)) { 
            currentPrice = materialBase.precoUnitarioDefault;
            updateMaterialPrice(idMaterial, currentPrice); 
        }

        const div = document.createElement('div');
        div.classList.add('material-config-item');

        const label = document.createElement('label');
        const inputId = `price-${idMaterial}`;
        label.htmlFor = inputId;
        label.textContent = `${materialBase.nomeDisplay}:`;
        label.setAttribute('aria-label', `Preço unitário para ${materialBase.nomeDisplay}`);


        const input = document.createElement('input');
        input.type = 'number';
        input.id = inputId;
        input.value = currentPrice.toFixed(2); 
        input.step = "0.01";
        input.min = "0";
        input.setAttribute('data-material-id', idMaterial);
        input.setAttribute('aria-describedby', `${inputId}-desc ${inputId}-error-msg`);

        const unitSpan = document.createElement('span');
        unitSpan.id = `${inputId}-desc`; 
        unitSpan.textContent = `(R$ / ${materialBase.unidade})`;
        
        const errorSpan = document.createElement('span'); 
        errorSpan.id = `${inputId}-error-msg`;
        errorSpan.classList.add('validation-message');
        errorSpan.setAttribute('aria-live', 'polite');

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(unitSpan); 
        div.appendChild(errorSpan); 
        materialPricesContainer.appendChild(div);

        input.addEventListener('blur', (event) => {
            const errorMsgSpanId = `${event.target.id}-error-msg`;
            const validatedValue = validateNumberInput(event.target, 0, Infinity, 2, errorMsgSpanId);
            updateMaterialPrice(event.target.getAttribute('data-material-id'), validatedValue);
        });
    });
}

export function setupConfiguracoesEventListeners(
    costPedreiroInput, costServenteInput, costImpermeabilizadorInput, costCarpinteiroInput, costArmadorInput,
    updateLaborCostsButton,
    materialPricesContainerElement, updateMaterialCostsButton,
    bdiFinalAdotadoConfigInput, areaObraConfigInput, updateGeneralConfigsButton
) {
    if (updateLaborCostsButton) {
        updateLaborCostsButton.addEventListener('click', () => {
            if(costPedreiroInput) updateLaborCost('pedreiro', parseFloatStrict(costPedreiroInput.value));
            if(costServenteInput) updateLaborCost('servente', parseFloatStrict(costServenteInput.value));
            if(costImpermeabilizadorInput) updateLaborCost('impermeabilizador', parseFloatStrict(costImpermeabilizadorInput.value));
            if(costCarpinteiroInput) updateLaborCost('carpinteiro', parseFloatStrict(costCarpinteiroInput.value));
            if(costArmadorInput) updateLaborCost('armador', parseFloatStrict(costArmadorInput.value));
            
            if (populateAndCalculateTableCallback) populateAndCalculateTableCallback();
            if (recalculateAllSimulationsCallback) recalculateAllSimulationsCallback();
            alert("Custos de Mão de Obra atualizados e aplicados!");
        });
    }

    if (updateMaterialCostsButton && materialPricesContainerElement) {
        updateMaterialCostsButton.addEventListener('click', () => {
            // console.log("Botão 'Atualizar Preços de Materiais' clicado.");
            if (populateAndCalculateTableCallback) populateAndCalculateTableCallback();
            if (recalculateAllSimulationsCallback) recalculateAllSimulationsCallback();
            alert("Preços de Materiais (re)aplicados na calculadora!");
        });
    }

    if (updateGeneralConfigsButton) {
        updateGeneralConfigsButton.addEventListener('click', () => {
            if(bdiFinalAdotadoConfigInput) setBdiFinalAdotado(parseFloatStrict(bdiFinalAdotadoConfigInput.value));
            if(areaObraConfigInput) setAreaObra(parseFloatStrict(areaObraConfigInput.value));
            
            if (populateAndCalculateTableCallback) populateAndCalculateTableCallback();
            if (recalculateAllSimulationsCallback) recalculateAllSimulationsCallback(); 
            alert("Configurações Gerais atualizadas e aplicadas!");
        });
    }
}

export function initializeConfigInputs(
    costPedreiroInput, costServenteInput, costImpermeabilizadorInput, costCarpinteiroInput, costArmadorInput,
    bdiFinalAdotadoConfigInput, areaObraConfigInput
) {
    const currentLaborCosts = getLaborCosts(); 
    const currentBdi = getBdiFinalAdotado();
    const currentArea = getAreaObra();

    if(costPedreiroInput) costPedreiroInput.value = currentLaborCosts.pedreiro.toFixed(2);
    if(costServenteInput) costServenteInput.value = currentLaborCosts.servente.toFixed(2);
    if(costImpermeabilizadorInput) costImpermeabilizadorInput.value = currentLaborCosts.impermeabilizador.toFixed(2);
    if(costCarpinteiroInput) costCarpinteiroInput.value = currentLaborCosts.carpinteiro.toFixed(2);
    if(costArmadorInput) costArmadorInput.value = currentLaborCosts.armador.toFixed(2);

    if(bdiFinalAdotadoConfigInput) bdiFinalAdotadoConfigInput.value = currentBdi.toFixed(2);
    if(areaObraConfigInput) areaObraConfigInput.value = currentArea.toString();
}