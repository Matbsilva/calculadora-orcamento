// js/calculadora.js
import { formatCurrency, formatNumber, parseFloatStrict, validateNumberInput } from './util.js';
import { 
    updateBudgetItemQuantity, getBudgetData, getBdiFinalAdotado,
    getLaborCosts, getMaterialPrices, getMateriaisBase 
} from './data.js';

let recalculateAllSimulationsCallback; 
let populateCategoryFilterCallback; 
let applySearchAndCategoryFilterCallback; 

export function setCalcCallbacks(simFunc, catFilterFunc, searchFilterFunc) {
    recalculateAllSimulationsCallback = simFunc;
    populateCategoryFilterCallback = catFilterFunc;
    applySearchAndCategoryFilterCallback = searchFilterFunc;
}

let budgetItemsTableBody;
let grandTotalMaterialCell, grandTotalLaborCell, grandTotalCostCell, grandTotalSellPriceCell;
let grandTotalHHProfCell, grandTotalHHHelperCell, grandTotalWeightCell;

export function initializeCalculadoraDOM(elements) {
    budgetItemsTableBody = elements.budgetItemsTableBody;
    grandTotalMaterialCell = elements.grandTotalMaterialCell;
    grandTotalLaborCell = elements.grandTotalLaborCell;
    grandTotalCostCell = elements.grandTotalCostCell;
    grandTotalSellPriceCell = elements.grandTotalSellPriceCell;
    grandTotalHHProfCell = elements.grandTotalHHProfCell;
    grandTotalHHHelperCell = elements.grandTotalHHHelperCell;
    grandTotalWeightCell = elements.grandTotalWeightCell;
}

function calculateItemUnitLaborCost(item) {
    let cost = 0;
    const currentLaborCosts = getLaborCosts();
    if (item.professionals) {
        for (const profType in item.professionals) {
            cost += (item.professionals[profType] || 0) * (currentLaborCosts[profType] || 0);
        }
    }
    if (item.helpers) {
        for (const helperType in item.helpers) {
            cost += (item.helpers[helperType] || 0) * (currentLaborCosts[helperType] || 0);
        }
    }
    return cost;
}

function calculateItemUnitMaterialCost(item) {
    let totalMaterialCost = 0;
    const currentMaterialPrices = getMaterialPrices();
    const currentMateriaisBase = getMateriaisBase();
    if (item.detailedMaterials) {
        item.detailedMaterials.forEach(matDetail => {
            const materialBase = currentMateriaisBase[matDetail.idMaterial];
            if (!materialBase) {
                console.warn(`Material base ID '${matDetail.idMaterial}' não encontrado para '${item.description}'.`);
                return;
            }
            const price = currentMaterialPrices[matDetail.idMaterial] !== undefined ? currentMaterialPrices[matDetail.idMaterial] : materialBase.precoUnitarioDefault;
            const costWithLoss = matDetail.consumptionPerUnit * price * (1 + (matDetail.lossPercent / 100));
            totalMaterialCost += costWithLoss;
        });
    }
    return totalMaterialCost;
}

function calculateSingleRow(index) {
    const budgetDataItems = getBudgetData(); 
    if (!budgetDataItems[index] || !budgetItemsTableBody) return;

    const item = budgetDataItems[index];
    const qty = item.initialQuantity;

    item.unitCostMaterial = calculateItemUnitMaterialCost(item);
    item.unitCostLabor = calculateItemUnitLaborCost(item);
    const custoItemTotalUnit = item.unitCostMaterial + item.unitCostLabor;

    const unitMatCostEl = document.getElementById(`unit-material-cost-${index}`);
    const unitLabCostEl = document.getElementById(`unit-labor-cost-${index}`);
    const unitTotCostEl = document.getElementById(`unit-total-cost-${index}`);
    if(unitMatCostEl) unitMatCostEl.textContent = formatCurrency(item.unitCostMaterial);
    if(unitLabCostEl) unitLabCostEl.textContent = formatCurrency(item.unitCostLabor);
    if(unitTotCostEl) unitTotCostEl.textContent = formatCurrency(custoItemTotalUnit);

    const itemTotalMaterial = qty * (item.unitCostMaterial || 0);
    const itemTotalLabor = qty * (item.unitCostLabor || 0);
    const itemTotalCost = itemTotalMaterial + itemTotalLabor;

    let itemTotalHHProf = 0, itemTotalHHHelper = 0;
    if (item.professionals) for (const p in item.professionals) itemTotalHHProf += (item.professionals[p] || 0) * qty;
    if (item.helpers) for (const h in item.helpers) itemTotalHHHelper += (item.helpers[h] || 0) * qty;
    
    const itemTotalWeight = qty * (item.unitWeight || 0);
    const currentBdiFinalAdotado = getBdiFinalAdotado();
    const itemSellPrice = itemTotalCost * (1 + (currentBdiFinalAdotado / 100));

    if(document.getElementById(`item-total-material-${index}`)) document.getElementById(`item-total-material-${index}`).textContent = formatCurrency(itemTotalMaterial);
    if(document.getElementById(`item-total-labor-${index}`)) document.getElementById(`item-total-labor-${index}`).textContent = formatCurrency(itemTotalLabor);
    if(document.getElementById(`item-total-cost-${index}`)) document.getElementById(`item-total-cost-${index}`).textContent = formatCurrency(itemTotalCost);
    if(document.getElementById(`item-bdi-adopted-${index}`)) document.getElementById(`item-bdi-adopted-${index}`).textContent = formatNumber(currentBdiFinalAdotado, 2) + "%";
    if(document.getElementById(`item-sell-price-${index}`)) document.getElementById(`item-sell-price-${index}`).textContent = formatCurrency(itemSellPrice);
    if(document.getElementById(`item-total-hh-prof-${index}`)) document.getElementById(`item-total-hh-prof-${index}`).textContent = formatNumber(itemTotalHHProf);
    if(document.getElementById(`item-total-hh-helper-${index}`)) document.getElementById(`item-total-hh-helper-${index}`).textContent = formatNumber(itemTotalHHHelper);
    if(document.getElementById(`item-total-weight-${index}`)) document.getElementById(`item-total-weight-${index}`).textContent = formatNumber(itemTotalWeight);
            
    const row = budgetItemsTableBody.querySelector(`tr[data-index='${index}']`);
    if (row) row.setAttribute('data-total-cost', itemTotalCost.toString()); 
}

export function calculateGrandTotals() {
    if (!grandTotalMaterialCell) {
        // console.warn("calculateGrandTotals: Elementos de totais não encontrados no DOM.");
        return; 
    }
    const budgetDataItems = getBudgetData();
    let curGTMat = 0, curGTLab = 0, curGTCost = 0, curGTSell = 0, 
        curGTHHProf = 0, curGTHHHelp = 0, curGTWeight = 0;

    budgetDataItems.forEach((item) => {
        const qty = item.initialQuantity; 
        curGTMat += qty * (item.unitCostMaterial || 0);
        curGTLab += qty * (item.unitCostLabor || 0);
        if (item.professionals) for (const p in item.professionals) curGTHHProf += (item.professionals[p] || 0) * qty;
        if (item.helpers) for (const h in item.helpers) curGTHHHelp += (item.helpers[h] || 0) * qty;
        curGTWeight += qty * (item.unitWeight || 0);
    });
    curGTCost = curGTMat + curGTLab;
    const currentBdiFinalAdotado = getBdiFinalAdotado();
    curGTSell = curGTCost * (1 + (currentBdiFinalAdotado / 100));

    grandTotalMaterialCell.textContent = formatCurrency(curGTMat);
    grandTotalLaborCell.textContent = formatCurrency(curGTLab);
    grandTotalCostCell.textContent = formatCurrency(curGTCost);
    grandTotalSellPriceCell.textContent = formatCurrency(curGTSell);
    grandTotalHHProfCell.textContent = formatNumber(curGTHHProf);
    grandTotalHHHelperCell.textContent = formatNumber(curGTHHHelp);
    grandTotalWeightCell.textContent = formatNumber(curGTWeight);
}

function handleQuantityChange(event) {
    const input = event.target;
    const rowIndex = parseInt(input.closest('tr').dataset.index, 10);
    
    // O valor já deve estar formatado com ponto pelo validateNumberInput no blur
    // ou ser um valor parcial durante a digitação. parseFloatStrict lida com ambos.
    const numericValue = parseFloatStrict(input.value); // parseFloatStrict lida com '.' ou ','
    updateBudgetItemQuantity(rowIndex, numericValue); 

    calculateSingleRow(rowIndex); 
    calculateGrandTotals(); 
    if (recalculateAllSimulationsCallback) recalculateAllSimulationsCallback();
}

export function populateAndCalculateTable() {
    // console.log("calculadora.js: populateAndCalculateTable chamada");
    const budgetDataItems = getBudgetData();
    if (!budgetItemsTableBody) {
        console.error("budgetItemsTableBody não está definido. A tabela não pode ser populada.");
        return;
    }
    budgetItemsTableBody.innerHTML = '';
    budgetDataItems.forEach((item, index) => {
        item.unitCostLabor = calculateItemUnitLaborCost(item); 
        item.unitCostMaterial = calculateItemUnitMaterialCost(item);
        const custoItemTotalUnit = item.unitCostMaterial + item.unitCostLabor;

        const row = budgetItemsTableBody.insertRow();
        row.setAttribute('data-index', index.toString());
        row.setAttribute('data-description', item.description);
        row.setAttribute('data-category', item.categoria);

        const quantityInputId = `quantity-${index}`;
        const quantityErrorMsgId = `${quantityInputId}-error-msg`;

        row.innerHTML = `
            <td class="item-description col-identificacao">${item.description}</td>
            <td class="unit-measure col-identificacao">${item.refComposition}</td>
            <td class="unit-measure col-identificacao">${item.unit}</td>
            <td class="col-quantidade">
                <input type="number" id="${quantityInputId}" value="${item.initialQuantity.toFixed(2)}" 
                       min="0" step="0.01" class="quantity-input" 
                       aria-label="Quantidade para ${item.description}"
                       aria-describedby="${quantityErrorMsgId}">
                <span id="${quantityErrorMsgId}" class="validation-message" aria-live="polite"></span>
            </td>
            <td class="currency col-custo-unit" id="unit-material-cost-${index}">${formatCurrency(item.unitCostMaterial)}</td>
            <td class="currency col-custo-unit" id="unit-labor-cost-${index}">${formatCurrency(item.unitCostLabor)}</td>
            <td class="currency font-semibold col-custo-unit td-borda-custo-unit-total" id="unit-total-cost-${index}">${formatCurrency(custoItemTotalUnit)}</td>
            <td id="item-total-material-${index}" class="currency col-custo-total">R$ 0,00</td>
            <td id="item-total-labor-${index}" class="currency col-custo-total">R$ 0,00</td>
            <td id="item-total-cost-${index}" class="currency font-bold col-custo-total td-borda-custo-item-total">R$ 0,00</td>
            <td id="item-bdi-adopted-${index}" class="number-value col-bdi">0,00%</td>
            <td id="item-sell-price-${index}" class="currency font-bold col-bdi td-borda-preco-venda-item">R$ 0,00</td>
            <td id="item-total-hh-prof-${index}" class="number-value col-produtividade">0,00</td>
            <td id="item-total-hh-helper-${index}" class="number-value col-produtividade">0,00</td>
            <td id="item-total-weight-${index}" class="number-value col-peso">0,00</td>`;
        
        const quantityInput = row.querySelector(`#${quantityInputId}`);
        if (quantityInput) {
            quantityInput.addEventListener('input', handleQuantityChange);
            quantityInput.addEventListener('blur', (event) => {
                const validatedQty = validateNumberInput(event.target, 0, Infinity, 2, quantityErrorMsgId);
                const budgetData = getBudgetData();
                if (budgetData[index] && validatedQty !== budgetData[index].initialQuantity) {
                     updateBudgetItemQuantity(index, validatedQty);
                }
                handleQuantityChange(event); // Recalcula com o valor possivelmente corrigido
            });
        }
    });
    calculateAllRowsAndGrandTotals(); 
    if(populateCategoryFilterCallback && applySearchAndCategoryFilterCallback) {
        populateCategoryFilterCallback(applySearchAndCategoryFilterCallback);
    }
}

export function calculateAllRowsAndGrandTotals() {
    const budgetDataItems = getBudgetData();
    budgetDataItems.forEach((item, index) => {
        calculateSingleRow(index);
    });
    calculateGrandTotals();
}