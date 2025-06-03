// js/simulacao.js
import { validateNumberInput } from './util.js';
import { updateInputValidationUI } from './ui.js';
import { setConfigValue, getConfig } from './data.js'; 

function calculateAndDisplayBDISuggested() {
    const currentConfig = getConfig(); 
    const sim = currentConfig.bdiSimulation;

    // Garante que os valores são números e default para 0 se não definidos
    const admin = sim.adminPercent || 0;
    const risk = sim.riskPercent || 0;
    const financial = sim.financialCostPercent || 0;
    const taxes = sim.taxesPercent || 0;
    const profit = sim.profitPercent || 0;
    
    let bdiCalculado = 0;
    const denominador = 1 - (taxes + profit);

    if (denominador > 0 && denominador !== Infinity && !isNaN(denominador)) {
        bdiCalculado = ( ( (1 + admin + risk + financial) / denominador ) - 1 ) * 100;
    } else {
        bdiCalculado = NaN; 
    }
    
    const bdiSugeridoDisplay = document.getElementById('bdiSugerido');
    if (bdiSugeridoDisplay) {
        if (isNaN(bdiCalculado) || !isFinite(bdiCalculado)) {
            bdiSugeridoDisplay.textContent = "Erro";
            bdiSugeridoDisplay.style.color = 'red';
        } else {
            bdiSugeridoDisplay.textContent = bdiCalculado.toFixed(2) + '%';
            bdiSugeridoDisplay.style.color = ''; 
        }
    }
}


export function setupSimulationEventListeners() {
    const bdiSimulacaoForm = document.getElementById('bdi-simulation-form');
    if (!bdiSimulacaoForm) return;

    const simulationFields = [
        { id: 'adminPercent', path: 'bdiSimulation.adminPercent', min: 0, max: 1000 }, // Permitindo mais de 100 se necessário
        { id: 'riskPercent', path: 'bdiSimulation.riskPercent', min: 0, max: 1000 },
        { id: 'financialCostPercent', path: 'bdiSimulation.financialCostPercent', min: 0, max: 1000 },
        { id: 'taxesPercent', path: 'bdiSimulation.taxesPercent', min: 0, max: 1000 }, // Tributos podem ser altos
        { id: 'profitPercent', path: 'bdiSimulation.profitPercent', min: 0, max: 1000 },
        { id: 'percentFaturamentoMO', path: 'bdiSimulation.percentFaturamentoMO', min: 0, max: 100 }
    ];

    simulationFields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (inputElement) {
            inputElement.addEventListener('blur', (event) => {
                const originalRawValue = inputElement.value;
                const { isValid, value, numericValue, originalInputWasNumber } = validateNumberInput(originalRawValue, field.min, field.max, false, 2);

                if (!originalInputWasNumber && originalRawValue.trim() !== "") {
                    inputElement.value = ''; 
                    updateInputValidationUI(inputElement, false, `${field.id}-error`);
                    // setConfigValue(field.path, 0); // Salva 0 se limpo (convertido para decimal)
                } else {
                    inputElement.value = value; 
                    updateInputValidationUI(inputElement, isValid && originalInputWasNumber, `${field.id}-error`);
                    setConfigValue(field.path, numericValue / 100); 
                }
                calculateAndDisplayBDISuggested(); 
            });
        } else {
            console.warn(`Elemento de simulação BDI com ID '${field.id}' não encontrado no HTML.`);
        }
    });
    calculateAndDisplayBDISuggested(); // Calcula ao carregar
}