// js/simulacao.js
import { validateNumberInput } from './util.js';
import { updateInputValidationUI } from './ui.js';
import { setConfigValue, getConfig } from './data.js'; // Usando getConfig para ler valores atuais para cálculo

// Função para calcular e exibir o BDI Sugerido
function calculateAndDisplayBDISuggested() {
    const config = getConfig(); // Pega a configuração atual
    const sim = config.bdiSimulation;

    const admin = sim.adminPercent || 0;
    const risk = sim.riskPercent || 0;
    const financial = sim.financialCostPercent || 0;
    const taxes = sim.taxesPercent || 0;
    const profit = sim.profitPercent || 0;

    // Fórmula BDI: ( (1 + Admin + Risco + CustoFin) / (1 - (Tributos + Lucro)) ) - 1
    // Multiplicado por 100 para exibir como percentual
    // Certifique-se de que os valores de 'sim' estejam como decimais (ex: 0.1 para 10%)
    
    let bdiCalculado = 0;
    const denominador = 1 - (taxes + profit);

    if (denominador > 0) { // Evita divisão por zero ou negativo
        bdiCalculado = ( ( (1 + admin + risk + financial) / denominador ) - 1 ) * 100;
    } else {
        bdiCalculado = NaN; // Indica um erro no cálculo
    }
    
    const bdiSugeridoDisplay = document.getElementById('bdiSugerido');
    if (bdiSugeridoDisplay) {
        if (isNaN(bdiCalculado)) {
            bdiSugeridoDisplay.textContent = "Erro (valores inválidos)";
            bdiSugeridoDisplay.style.color = 'red';
        } else {
            bdiSugeridoDisplay.textContent = bdiCalculado.toFixed(2) + '%';
            bdiSugeridoDisplay.style.color = ''; // Reseta a cor
        }
    }
}


export function setupSimulationEventListeners() {
    const bdiSimulacaoForm = document.getElementById('bdi-simulation-form');
    if (!bdiSimulacaoForm) return;

    // Mapeamento de IDs de input para caminhos de configuração e parâmetros de validação
    const simulationFields = [
        { id: 'adminPercent', path: 'bdiSimulation.adminPercent', min: 0, max: 100 },
        { id: 'riskPercent', path: 'bdiSimulation.riskPercent', min: 0, max: 100 },
        { id: 'financialCostPercent', path: 'bdiSimulation.financialCostPercent', min: 0, max: 100 },
        { id: 'taxesPercent', path: 'bdiSimulation.taxesPercent', min: 0, max: 100 },
        { id: 'profitPercent', path: 'bdiSimulation.profitPercent', min: 0, max: 100 },
        { id: 'percentFaturamentoMO', path: 'bdiSimulation.percentFaturamentoMO', min: 0, max: 100 } // Supondo que este também seja um percentual
    ];

    simulationFields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (inputElement) {
            inputElement.addEventListener('blur', (event) => {
                const originalRawValue = inputElement.value;
                // Para percentuais, queremos salvar como decimal (ex: 25% como 0.25) mas validar como 0-100
                const { isValid, value, numericValue, originalInputWasNumber } = validateNumberInput(originalRawValue, field.min, field.max, false, 2);

                if (!originalInputWasNumber && originalRawValue.trim() !== "") {
                    inputElement.value = ''; // Limpa o campo
                    updateInputValidationUI(inputElement, false, `${field.id}-error`);
                    // setConfigValue(field.path, 0); // Ou null
                } else {
                    inputElement.value = value; // Mostra 0-100 no campo
                    updateInputValidationUI(inputElement, isValid, `${field.id}-error`);
                    setConfigValue(field.path, numericValue / 100); // Salva como decimal (0.00 - 1.00)
                }
                calculateAndDisplayBDISuggested(); // Recalcula após cada mudança válida
            });
        }
    });
    // Carregar valores iniciais e calcular BDI ao carregar a aba
    // loadSimulationDataToUI(); // Função para popular os campos da simulação do data.js
    calculateAndDisplayBDISuggested();
}

// Se este módulo for carregado e precisar de inicialização independente:
// document.addEventListener('DOMContentLoaded', () => {
//     // loadSimulationDataToUI(); // Se precisar carregar dados para os campos
//     setupSimulationEventListeners();
// });