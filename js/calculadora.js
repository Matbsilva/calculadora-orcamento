// js/calculadora.js
import { validateNumberInput } from './util.js';
import { updateInputValidationUI, populateTable } from './ui.js';
import { budgetDataStructure, updateItemQuantityInStructure, calculateAllSubtotalsAndTotal, getFilteredItems } from './data.js';
import { debounce } from './util.js';


export function formatCurrency(value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


function renderBudgetTable(itemsToRender) {
    populateTable(itemsToRender || budgetDataStructure); // Usa items filtrados se fornecidos, senão todos
    // Re-setup dos listeners é crucial se populateTable recria os inputs
    // ou garantir que populateTable não remova os listeners se eles estiverem no tableBody
    // A abordagem com event delegation no tableBody é mais robusta.
}


export function setupCalculatorEventListeners() {
    const tableBody = document.getElementById('budget-table-body');
    if (!tableBody) return;

    // Event delegation para inputs de quantidade
    tableBody.addEventListener('blur', (event) => {
        if (event.target.classList.contains('quantity-input')) {
            const inputElement = event.target;
            const itemId = inputElement.dataset.itemId; // Assumindo que o ID/index está no dataset
            const originalRawValue = inputElement.value;

            // Quantidades podem ser 0, min 0. Max não definido. 3 casas decimais.
            const { isValid, value, numericValue, originalInputWasNumber } = validateNumberInput(originalRawValue, 0, null, false, 3);

            if (!originalInputWasNumber && originalRawValue.trim() !== "") {
                inputElement.value = ''; // Limpa o campo
                updateInputValidationUI(inputElement, false, `quantity-error-${itemId}`);
                // updateItemQuantityInStructure(itemId, 0); // Atualiza no data.js para 0 ou valor que representa vazio
            } else {
                inputElement.value = value; // Coloca valor formatado/corrigido
                updateInputValidationUI(inputElement, isValid, `quantity-error-${itemId}`);
                updateItemQuantityInStructure(itemId, numericValue); // Atualiza no data.js
            }
            calculateAllSubtotalsAndTotal(); // Recalcula tudo após a mudança
            renderBudgetTable(getFilteredItems(document.getElementById('search-input').value)); // Re-renderiza a tabela com os itens atuais (filtrados ou não)
        }
    }, true); // Use capturing phase for blur

    // Listener para a barra de busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((event) => {
            const searchTerm = event.target.value;
            renderBudgetTable(getFilteredItems(searchTerm));
        }, 300)); // 300ms debounce
    }
}

// Inicialização da tabela na aba Calculadora
// Isso pode ser chamado quando a aba Calculadora é ativada em main.js
export function initCalculatorTab() {
    renderBudgetTable(budgetDataStructure); // Renderiza a tabela inicial
    // setupCalculatorEventListeners já configura os listeners no tableBody,
    // então não precisa ser chamado a cada render se a delegação for usada corretamente.
}