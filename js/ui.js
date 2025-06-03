// js/ui.js
import { getConfig, budgetDataStructure } from './data.js'; // Removidas importações diretas de partes do config
import { formatCurrency } from './calculadora.js';


export function loadConfigDataToUI() {
    const currentConfig = getConfig(); 

    // Aba Configurações
    if (currentConfig.laborCosts) {
        Object.keys(currentConfig.laborCosts).forEach(key => {
            const input = document.getElementById(key);
            if (input) input.value = (currentConfig.laborCosts[key] || 0).toFixed(2);
        });
    }
    if (currentConfig.materialPrices) {
        Object.keys(currentConfig.materialPrices).forEach(key => {
            const input = document.getElementById(key); 
            if (input) input.value = (currentConfig.materialPrices[key] || 0).toFixed(2);
        });
    }

    if (document.getElementById('bdiFinalAdotado') && currentConfig.bdi) {
        document.getElementById('bdiFinalAdotado').value = (currentConfig.bdi.bdiFinalAdotado || 0).toFixed(2);
    }
    if (document.getElementById('areaObra') && currentConfig.project) {
        document.getElementById('areaObra').value = currentConfig.project.areaObra || 1;
    }

    // Aba Simulação BDI
    if (currentConfig.bdiSimulation) {
        Object.keys(currentConfig.bdiSimulation).forEach(key => {
            const input = document.getElementById(key);
            if (input && typeof currentConfig.bdiSimulation[key] === 'number') {
                input.value = (currentConfig.bdiSimulation[key] * 100).toFixed(2); 
            } else if (input) {
                input.value = "0.00"; // Default se não for número
            }
        });
    }
}

export function updateInputValidationUI(inputElement, isCurrentlyValid, errorSpanId = null) {
    const errorSpan = errorSpanId ? document.getElementById(errorSpanId) : null;

    if (isCurrentlyValid) {
        inputElement.classList.remove('is-invalid');
        if (errorSpan) {
            errorSpan.classList.remove('error-message-visible');
        }
    } else {
        inputElement.classList.add('is-invalid');
        if (errorSpan) {
            errorSpan.classList.add('error-message-visible');
        }
    }
}

export function populateTable(items, tableBodyId = 'budget-table-body') {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) {
        console.error(`Elemento com ID '${tableBodyId}' não encontrado.`);
        return;
    }
    tableBody.innerHTML = ''; 

    if (!items || items.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6; 
        cell.textContent = "Nenhum item para exibir.";
        return;
    }

    items.forEach((item) => { 
        const row = tableBody.insertRow();
        row.insertCell().textContent = item.id || item.refComposition || 'N/A'; 
        row.insertCell().textContent = item.description;
        row.insertCell().textContent = item.unit;

        const quantityCell = row.insertCell();
        const quantityInput = document.createElement('input');
        quantityInput.type = 'text';
        quantityInput.classList.add('quantity-input');
        quantityInput.dataset.itemId = item.id;
        quantityInput.value = (item.initialQuantity || 0).toFixed(3);
        const quantityErrorId = `quantity-error-${item.id}`;
        quantityInput.setAttribute('aria-describedby', quantityErrorId);
        quantityCell.appendChild(quantityInput);

        const errorSpan = document.createElement('span');
        errorSpan.id = quantityErrorId;
        errorSpan.classList.add('sr-only');
        errorSpan.textContent = "Quantidade inválida.";
        quantityCell.appendChild(errorSpan);

        row.insertCell().textContent = formatCurrency(item.unitPrice || 0);
        row.insertCell().textContent = formatCurrency(item.subtotal || 0);
    });
}

export function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('nav ul li button').forEach(button => button.classList.remove('active'));

    const tabToShow = document.getElementById(tabId);
    const buttonToActivate = document.querySelector(`nav ul li button[onclick="showTab('${tabId}')"]`);

    if (tabToShow) {
        tabToShow.classList.add('active');
        // Se a aba calculadora for ativada, renderizar a tabela
        if (tabId === 'calculadora') {
            // Esta importação precisa ser feita aqui ou a função precisa estar neste arquivo ou ser global
            // Para evitar dependência circular, main.js deve orquestrar isso.
            // initCalculatorTab(); // Movido para main.js
        }
    }
    if (buttonToActivate) buttonToActivate.classList.add('active');
}