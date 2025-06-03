// js/calculadora.js
import { validateNumberInput, debounce } from './util.js';
import { updateInputValidationUI, populateTable } from './ui.js';
import { budgetDataStructure, updateItemQuantityInStructure, calculateAllSubtotalsAndTotal, getFilteredItems } from './data.js';


export function formatCurrency(value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderBudgetTable(searchTerm) {
    const itemsToRender = getFilteredItems(searchTerm);
    populateTable(itemsToRender); 
    // Os event listeners para os inputs de quantidade são delegados no tableBody em setupCalculatorEventListeners
    // e não precisam ser re-adicionados a cada renderização da tabela.
}

export function setupCalculatorEventListeners() {
    const tableBody = document.getElementById('budget-table-body');
    if (!tableBody) return;

    tableBody.addEventListener('blur', (event) => {
        if (event.target.classList.contains('quantity-input')) {
            const inputElement = event.target;
            const itemId = inputElement.dataset.itemId; 
            const originalRawValue = inputElement.value;

            const { isValid, value, numericValue, originalInputWasNumber } = validateNumberInput(originalRawValue, 0, null, false, 3);

            if (!originalInputWasNumber && originalRawValue.trim() !== "") {
                inputElement.value = ''; 
                updateInputValidationUI(inputElement, false, `quantity-error-${itemId}`);
                updateItemQuantityInStructure(itemId, 0); 
            } else {
                inputElement.value = value; 
                updateInputValidationUI(inputElement, isValid && originalInputWasNumber, `quantity-error-${itemId}`);
                updateItemQuantityInStructure(itemId, numericValue); 
            }
            calculateAllSubtotalsAndTotal(); 
            const searchInputValue = document.getElementById('search-input') ? document.getElementById('search-input').value : "";
            renderBudgetTable(searchInputValue); 
        }
    }, true); 

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((event) => {
            renderBudgetTable(event.target.value);
        }, 300));
    }
}

export function initCalculatorTab() {
    const searchInputValue = document.getElementById('search-input') ? document.getElementById('search-input').value : "";
    renderBudgetTable(searchInputValue); // Renderiza a tabela inicial
    // setupCalculatorEventListeners deve ser chamado uma vez, idealmente em main.js ou quando a aba é ativada pela primeira vez.
}