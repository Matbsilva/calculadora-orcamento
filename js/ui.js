// js/ui.js
import { formatNumber, parseFloatStrict, formatCurrency } from './util.js';
import { getBudgetData, getAreaObra } from './data.js'; 

export function openTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => {
        tc.style.display = "none";
        tc.setAttribute('aria-hidden', 'true');
        tc.setAttribute('tabindex', '-1');
    });
    document.querySelectorAll(".tab-buttons button").forEach(btn => {
        btn.classList.remove("active");
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('tabindex', '-1');
    });

    const tabToOpen = document.getElementById(tabName);
    const buttonToActivate = document.querySelector(`.tab-buttons button[data-tab='${tabName}']`);
    
    if (tabToOpen) {
        tabToOpen.style.display = "block";
        tabToOpen.setAttribute('aria-hidden', 'false');
        tabToOpen.setAttribute('tabindex', '0'); 
    }
    if (buttonToActivate) {
        buttonToActivate.classList.add("active");
        buttonToActivate.setAttribute('aria-selected', 'true');
        buttonToActivate.setAttribute('tabindex', '0');
    }
}

export function populateCategoryFilter(filterCallback) { 
    const budgetDataItems = getBudgetData();
    const categories = new Set(budgetDataItems.map(item => item.categoria));
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) {
        console.error("Elemento 'category-filter' não encontrado.");
        return;
    }

    const firstOption = categoryFilter.options[0]; 
    categoryFilter.innerHTML = ''; 
    categoryFilter.appendChild(firstOption); 
    firstOption.selected = true; 

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    if (categoryFilter._filterCallback) {
        categoryFilter.removeEventListener('change', categoryFilter._filterCallback);
    }
    categoryFilter._filterCallback = filterCallback; 
    categoryFilter.addEventListener('change', filterCallback);
}


export function toggleModoCotação(mainBudgetTable, labelTotalCusto) {
    if (!mainBudgetTable || !labelTotalCusto) {
        console.error("Elementos da tabela principal ou label de total não encontrados para toggleModoCotação.");
        return;
    }
    mainBudgetTable.classList.toggle('modo-cotacao-ativo');
    if (mainBudgetTable.classList.contains('modo-cotacao-ativo')) {
        labelTotalCusto.colSpan = 4; 
    } else {
        labelTotalCusto.colSpan = 7; 
    }
}

export function applySearchAndCategoryFilter(searchInput, categoryFilterSelect, budgetItemsTableBody) {
    if (!searchInput || !categoryFilterSelect || !budgetItemsTableBody) {
        return;
    }
    const terms = searchInput.value.toLowerCase().split(' ').filter(t => t.length > 0);
    const selectedCategory = categoryFilterSelect.value;

    budgetItemsTableBody.querySelectorAll('tr').forEach(row => {
        const desc = row.cells && row.cells[0] ? row.cells[0].textContent.toLowerCase() : "";
        const ref = row.cells && row.cells[1] ? row.cells[1].textContent.toLowerCase() : "";
        
        const categoryMatch = selectedCategory === 'all' || row.dataset.category === selectedCategory;
        
        let searchMatch = true;
        if (terms.length > 0) {
            searchMatch = terms.every(term => desc.includes(term) || ref.includes(term));
        }
        
        row.style.display = categoryMatch && searchMatch ? '' : 'none';
    });
}

export function updateSummaryIndicators(
    grandTotalCostCell, grandTotalSellPriceCell, 
    grandTotalHHProfCell, grandTotalHHHelperCell
) {
    const indicatorCostM2 = document.getElementById('indicator-cost-m2');
    const indicatorSellPriceM2 = document.getElementById('indicator-sell-price-m2');
    const indicatorCostHh = document.getElementById('indicator-cost-hh');
    const indicatorSellPriceHh = document.getElementById('indicator-sell-price-hh');

    const areaObraValue = getAreaObra(); 

    const custoTotalDireto = grandTotalCostCell ? parseFloatStrict(grandTotalCostCell.textContent) : 0;
    const pvTotal = grandTotalSellPriceCell ? parseFloatStrict(grandTotalSellPriceCell.textContent) : 0;
    const totHHProf = grandTotalHHProfCell ? parseFloatStrict(grandTotalHHProfCell.textContent) : 0;
    const totHHHelper = grandTotalHHHelperCell ? parseFloatStrict(grandTotalHHHelperCell.textContent) : 0;
    const hhTotalGlobal = totHHProf + totHHHelper;

    if(indicatorCostM2) indicatorCostM2.textContent = areaObraValue > 0 ? formatCurrency(custoTotalDireto / areaObraValue) : 'N/A';
    if(indicatorSellPriceM2) indicatorSellPriceM2.textContent = areaObraValue > 0 ? formatCurrency(pvTotal / areaObraValue) : 'N/A';
    if(indicatorCostHh) indicatorCostHh.textContent = hhTotalGlobal > 0 ? formatCurrency(custoTotalDireto / hhTotalGlobal) : 'N/A';
    if(indicatorSellPriceHh) indicatorSellPriceHh.textContent = hhTotalGlobal > 0 ? formatCurrency(pvTotal / hhTotalGlobal) : 'N/A';
}

export function setupTabButtonsAria() {
    const tabButtons = document.querySelectorAll('.tab-buttons button');
    let firstActiveButton = null;

    tabButtons.forEach((button, index) => {
        button.id = button.id || `tab-btn-auto-${index}`; 
        const isActive = button.classList.contains('active');
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        button.setAttribute('aria-controls', button.dataset.tab);
        button.setAttribute('tabindex', isActive ? '0' : '-1');
        
        if (isActive && !firstActiveButton) {
            firstActiveButton = button;
        }
        
        const tabPanel = document.getElementById(button.dataset.tab);
        if (tabPanel) {
            tabPanel.setAttribute('role', 'tabpanel');
            tabPanel.setAttribute('aria-labelledby', button.id);
            tabPanel.setAttribute('aria-hidden', !isActive ? 'true' : 'false');
            tabPanel.setAttribute('tabindex', !isActive ? '-1' : '0');
        }
    });

    if (!firstActiveButton && tabButtons.length > 0) {
        tabButtons[0].setAttribute('tabindex', '0');
    }
}