// js/main.js
import { formatCurrency, formatNumber, parseFloatStrict, validateNumberInput, debounce, copySectionText } from './util.js';
import { 
    getLaborCosts, getMaterialPrices, getMateriaisBase, getBdiFinalAdotado as getBdiFinalAdotadoFromData, getAreaObra as getAreaObraFromData,
    getBudgetData, 
    updateLaborCost, updateMaterialPrice, setBdiFinalAdotado, setAreaObra, 
    updateBudgetItemQuantity,
    setCurrentAggregatedMaterials,
    laborCosts as initialLaborCostsState, 
    materialPrices as initialMaterialPricesState, 
    materiaisBase as dataMateriaisBase,
    budgetDataStructure 
} from './data.js';

import { openTab, populateCategoryFilter as populateCategoryFilterUI, toggleModoCotação, applySearchAndCategoryFilter, updateSummaryIndicators, setupTabButtonsAria } from './ui.js';

import { populateMaterialPricesConfigUI, setupConfiguracoesEventListeners, initializeConfigInputs, setCallbacks as setConfigCallbacks } from './configuracao.js';

import { initializeCalculadoraDOM, populateAndCalculateTable, calculateGrandTotals, calculateAllRowsAndGrandTotals, setCalcCallbacks } from './calculadora.js';

import { initializeSimulacaoDOM, recalculateAllSimulations as runSimulations } from './simulacao.js'; 

import { exportMaterialsToCSV, exportMaterialsByServiceToCSV } from './exportacao.js';

import { processAndDisplaySummaryContent, processAndDisplayAbcCurveContent, processAndDisplayScheduleContent } from './relatorios.js';

// Referências Globais para elementos do DOM 
let budgetItemsTableBody, grandTotalMaterialCell, grandTotalLaborCell, grandTotalCostCell, grandTotalSellPriceCell,
    grandTotalHHProfCell, grandTotalHHHelperCell, grandTotalWeightCell,
    summaryContentArea, summaryExportButtonsContainer, abcCurveContentArea, scheduleContentArea,
    processSummaryButton, processAbcCurveButton, processScheduleButton, exportCsvByServiceButton,
    exportCsvConsolidatedButton, exportCsvDetailedButton,
    saveBudgetButton, loadBudgetButton, loadBudgetFile, searchInput, clearSearchButton,
    updateLaborCostsButton, updateMaterialCostsButton, materialPricesContainer,
    bdiFinalAdotadoConfigInput, areaObraConfigInput, updateGeneralConfigsButton,
    modeCotacaoToggle, mainBudgetTable, labelTotalCusto,
    simCustoMoB1, simAdminMoB1, simTributosMoB1, simRiscoMoB1, simCustoFinanceiroMoB1, simLucroMoB1, simBdiBloco1Val,
    simCustoMatB2, simAdminMatB2, simTributosMatB2, simRiscoMatB2, simCustoFinanceiroMatB2, simLucroMatB2, simBdiBloco2Val,
    simRecalcularBdiTudoButton,
    simPercFatMoB4, simPercFatMaterialB4,
    categoryFilterSelect;


document.addEventListener('DOMContentLoaded', () => {
    console.log("MAIN.JS: DOMContentLoaded - INÍCIO");

    budgetItemsTableBody = document.getElementById('budget-items');
    grandTotalMaterialCell = document.getElementById('grand-total-material');
    grandTotalLaborCell = document.getElementById('grand-total-labor');
    grandTotalCostCell = document.getElementById('grand-total-cost');
    grandTotalSellPriceCell = document.getElementById('grand-total-sell-price');
    grandTotalHHProfCell = document.getElementById('grand-total-hh-prof');
    grandTotalHHHelperCell = document.getElementById('grand-total-hh-helper');
    grandTotalWeightCell = document.getElementById('grand-total-weight');
    summaryContentArea = document.getElementById('summary-content-area');
    summaryExportButtonsContainer = document.getElementById('summary-export-buttons');
    abcCurveContentArea = document.getElementById('abc-curve-content-area');
    scheduleContentArea = document.getElementById('schedule-content-area');
    processSummaryButton = document.getElementById('process-summary-button');
    processAbcCurveButton = document.getElementById('process-abc-curve-button');
    processScheduleButton = document.getElementById('process-schedule-button');
    exportCsvConsolidatedButton = document.getElementById('export-csv-consolidated-button');
    exportCsvDetailedButton = document.getElementById('export-csv-detailed-button');
    exportCsvByServiceButton = document.getElementById('export-csv-by-service-button');
    saveBudgetButton = document.getElementById('save-budget-button');
    loadBudgetButton = document.getElementById('load-budget-button');
    loadBudgetFile = document.getElementById('load-budget-file');
    searchInput = document.getElementById('search-composition-input');
    clearSearchButton = document.getElementById('clear-search-button');
    updateLaborCostsButton = document.getElementById('update-labor-costs-button');
    updateMaterialCostsButton = document.getElementById('update-material-costs-button');
    materialPricesContainer = document.getElementById('material-prices-container');
    bdiFinalAdotadoConfigInput = document.getElementById('bdi-final-adotado-config');
    areaObraConfigInput = document.getElementById('area-obra-config');
    updateGeneralConfigsButton = document.getElementById('update-general-configs-button');
    modeCotacaoToggle = document.getElementById('mode-cotacao-toggle');
    mainBudgetTable = document.getElementById('main-budget-table');
    labelTotalCusto = document.getElementById('label-total-custo');
    categoryFilterSelect = document.getElementById('category-filter');

    simCustoMoB1 = document.getElementById('sim-custo-mo-b1');
    simAdminMoB1 = document.getElementById('sim-admin-mo-b1');
    simRiscoMoB1 = document.getElementById('sim-risco-mo-b1');
    simCustoFinanceiroMoB1 = document.getElementById('sim-custo-financeiro-mo-b1');
    simTributosMoB1 = document.getElementById('sim-tributos-mo-b1');
    simLucroMoB1 = document.getElementById('sim-lucro-mo-b1');
    simBdiBloco1Val = document.getElementById('sim-bdi-bloco1-val'); 
    simCustoMatB2 = document.getElementById('sim-custo-mat-b2');
    simAdminMatB2 = document.getElementById('sim-admin-mat-b2');
    simRiscoMatB2 = document.getElementById('sim-risco-mat-b2');
    simCustoFinanceiroMatB2 = document.getElementById('sim-custo-financeiro-mat-b2');
    simTributosMatB2 = document.getElementById('sim-tributos-mat-b2');
    simLucroMatB2 = document.getElementById('sim-lucro-mat-b2');
    simBdiBloco2Val = document.getElementById('sim-bdi-bloco2-val');
    simRecalcularBdiTudoButton = document.getElementById('sim-recalcular-bdi-tudo');
    simPercFatMoB4 = document.getElementById('sim-perc-fat-mo-b4');
    simPercFatMaterialB4 = document.getElementById('sim-perc-fat-material-b4');

    console.log("MAIN.JS: DOMContentLoaded - Elementos do DOM atribuídos");

    initializeCalculadoraDOM({
        budgetItemsTableBody, grandTotalMaterialCell, grandTotalLaborCell, grandTotalCostCell,
        grandTotalSellPriceCell, grandTotalHHProfCell, grandTotalHHHelperCell, grandTotalWeightCell
    });
    initializeSimulacaoDOM({
        simCustoMoB1, simAdminMoB1, simRiscoMoB1, simCustoFinanceiroMoB1, simTributosMoB1, simLucroMoB1, simBdiBloco1Val,
        simCustoMatB2, simAdminMatB2, simRiscoMatB2, simCustoFinanceiroMatB2, simTributosMatB2, simLucroMatB2, simBdiBloco2Val,
        simPercFatMoB4, simPercFatMaterialB4,
        grandTotalLaborCell, grandTotalMaterialCell 
    });

    setConfigCallbacks(populateAndCalculateTable, runSimulations);
    const filterCallbackForCalculadora = () => applySearchAndCategoryFilter(searchInput, categoryFilterSelect, budgetItemsTableBody);
    setCalcCallbacks(runSimulations, () => populateCategoryFilterUI(filterCallbackForCalculadora), filterCallbackForCalculadora);
    
    document.querySelectorAll('.tab-buttons button').forEach(button => {
        button.addEventListener('click', (e) => openTab(e.currentTarget.dataset.tab));
    });
    setupTabButtonsAria();

    initializeConfigInputs(
        document.getElementById('cost-pedreiro'), document.getElementById('cost-servente'), document.getElementById('cost-impermeabilizador'),
        document.getElementById('cost-carpinteiro'), document.getElementById('cost-armador'),
        bdiFinalAdotadoConfigInput, areaObraConfigInput
    );
    populateMaterialPricesConfigUI(materialPricesContainer); 
    setupConfiguracoesEventListeners(
        document.getElementById('cost-pedreiro'), document.getElementById('cost-servente'), document.getElementById('cost-impermeabilizador'),
        document.getElementById('cost-carpinteiro'), document.getElementById('cost-armador'),
        updateLaborCostsButton,
        materialPricesContainer, updateMaterialCostsButton,
        bdiFinalAdotadoConfigInput, areaObraConfigInput, updateGeneralConfigsButton
    );
    
     document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.classList.contains('quantity-input')) return; 

        input.addEventListener('blur', (event) => {
            const el = event.target;
            let maxVal = Infinity;
            let minVal = 0;
            let decimals = 2;
            const errorMsgId = `${el.id}-error-msg`; 

            if (el.hasAttribute('min')) {
                minVal = parseFloatStrict(el.min);
            }
             if (el.hasAttribute('max')) {
                 maxVal = parseFloatStrict(el.max);
            } else {
                if (el.id.includes('perc-fat') || el.id.includes('lucro') || 
                    (el.id.startsWith('sim-') && (el.id.includes('admin') || el.id.includes('risco') || el.id.includes('financeiro') || el.id.includes('tributos'))) ) {
                     maxVal = 100;
                } else if (el.id.startsWith('bdi-final-adotado')) {
                     maxVal = 1000; 
                }
            }
            
            if (el.step === "1" || el.id === "area-obra-config") {
                decimals = 0;
            } else if (el.step === "0.01") {
                decimals = 2;
            }
            
            if (!el.readOnly) {
                validateNumberInput(el, minVal, maxVal, decimals, errorMsgId);
            }
        });
    });

    if(saveBudgetButton) saveBudgetButton.addEventListener('click', () => {
        try {
            const budgetToSave = {
                laborCosts: getLaborCosts(),
                materialPrices: getMaterialPrices(),
                bdiFinalAdotado: getBdiFinalAdotadoFromData(),
                areaObra: getAreaObraFromData(),
                compositions: getBudgetData().map((item) => ({ 
                    refComposition: item.refComposition,
                    quantity: item.initialQuantity 
                }))
            };
            const jsonData = JSON.stringify(budgetToSave, null, 2); 
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob); 
            const link = document.createElement('a'); 
            link.href = url;
            link.download = `orcamento_${new Date().toISOString().slice(0, 19).replace(/:/g, "-").replace("T", "_")}.json`;
            document.body.appendChild(link); 
            link.click(); 
            document.body.removeChild(link); 
            URL.revokeObjectURL(url);
            alert("Orçamento salvo com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar orçamento:", error);
            alert("Ocorreu um erro ao tentar salvar o orçamento. Verifique o console para mais detalhes.");
        }
    });

    if(loadBudgetButton) loadBudgetButton.addEventListener('click', () => loadBudgetFile.click());
    if(loadBudgetFile) loadBudgetFile.addEventListener('change', (event) => {
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const loadedData = JSON.parse(e.target.result);
                if (loadedData.laborCosts && typeof loadedData.laborCosts === 'object') {
                    Object.keys(loadedData.laborCosts).forEach(k => {
                        if (initialLaborCostsState.hasOwnProperty(k)) { 
                            updateLaborCost(k, loadedData.laborCosts[k]);
                        }
                    });
                     Object.keys(getLaborCosts()).forEach(k => { const el = document.getElementById(`cost-${k}`); if (el) el.value = getLaborCosts()[k].toFixed(2); });
                }
                if (loadedData.materialPrices && typeof loadedData.materialPrices === 'object') { 
                    Object.keys(loadedData.materialPrices).forEach(idMat => {
                        if (dataMateriaisBase.hasOwnProperty(idMat)) { 
                             updateMaterialPrice(idMat, loadedData.materialPrices[idMat]);
                        }
                    });
                } else { 
                    Object.keys(dataMateriaisBase).forEach(idMat => updateMaterialPrice(idMat, dataMateriaisBase[idMat].precoUnitarioDefault));
                }
                populateMaterialPricesConfigUI(materialPricesContainer);


                setBdiFinalAdotado(loadedData.bdiFinalAdotado !== undefined ? loadedData.bdiFinalAdotado : 105.00);
                setAreaObra(loadedData.areaObra !== undefined ? loadedData.areaObra : 100);
                if(bdiFinalAdotadoConfigInput) bdiFinalAdotadoConfigInput.value = getBdiFinalAdotadoFromData().toFixed(2);
                if(areaObraConfigInput) areaObraConfigInput.value = getAreaObraFromData().toString();

                if (loadedData.compositions && Array.isArray(loadedData.compositions)) {
                    const currentBudgetData = getBudgetData(); 
                    currentBudgetData.forEach(item => item.initialQuantity = 0); 

                    loadedData.compositions.forEach(savedItem => {
                        const itemIndex = currentBudgetData.findIndex(budgetItem => budgetItem.refComposition === (savedItem.refComposition || savedItem.ref));
                        if (itemIndex !== -1) {
                            updateBudgetItemQuantity(itemIndex, savedItem.quantity || 0);
                        }
                    });
                }
                
                populateAndCalculateTable(); 
                runSimulations();
                alert("Orçamento carregado com sucesso!");
            } catch (error) { 
                console.error("Erro ao carregar o arquivo JSON:", error); 
                alert("Erro ao carregar o arquivo: Formato JSON inválido, arquivo corrompido ou dados esperados ausentes. Verifique o console para mais detalhes."); 
            }
        };
        reader.readAsText(file); 
        if(loadBudgetFile) loadBudgetFile.value = '';
    });
    
    if(searchInput) searchInput.addEventListener('input', debounce(() => applySearchAndCategoryFilter(searchInput, categoryFilterSelect, budgetItemsTableBody), 300));
    if(clearSearchButton) clearSearchButton.addEventListener('click', () => {
        if(searchInput) searchInput.value = '';
        applySearchAndCategoryFilter(searchInput, categoryFilterSelect, budgetItemsTableBody);
    });
    
    if(modeCotacaoToggle) modeCotacaoToggle.addEventListener('change', () => toggleModoCotação(mainBudgetTable, labelTotalCusto));

    if(processSummaryButton) processSummaryButton.addEventListener('click', () => {
        processAndDisplaySummaryContent(
            summaryContentArea,
            summaryExportButtonsContainer,
            { grandTotalCostCell, grandTotalSellPriceCell, grandTotalHHProfCell, grandTotalHHHelperCell }
        );
    });
    if(processAbcCurveButton) processAbcCurveButton.addEventListener('click', () => {
        processAndDisplayAbcCurveContent(abcCurveContentArea);
    });
    if(processScheduleButton) processScheduleButton.addEventListener('click', () => {
        processAndDisplayScheduleContent(scheduleContentArea);
    });

    if(exportCsvConsolidatedButton) exportCsvConsolidatedButton.addEventListener('click', () => exportMaterialsToCSV(false));
    if(exportCsvDetailedButton) exportCsvDetailedButton.addEventListener('click', () => exportMaterialsByServiceToCSV()); 
    if(exportCsvByServiceButton) exportCsvByServiceButton.addEventListener('click', exportMaterialsByServiceToCSV);

    const simInputsToListen = [
        simAdminMoB1, simRiscoMoB1, simCustoFinanceiroMoB1, simTributosMoB1, simLucroMoB1,
        simAdminMatB2, simRiscoMatB2, simCustoFinanceiroMatB2, simTributosMatB2, simLucroMatB2,
        simPercFatMoB4
    ];
    simInputsToListen.forEach(input => {
        if (input) {
            input.addEventListener('input', runSimulations); 
            if (!input.readOnly) { 
                input.addEventListener('blur', (event) => {
                    const el = event.target;
                    let maxVal = 100; 
                    const errorMsgId = `${el.id}-error-msg`;
                    validateNumberInput(el, 0, maxVal, 2, errorMsgId);
                    runSimulations(); 
                });
            }
        }
    });
    if (simRecalcularBdiTudoButton) simRecalcularBdiTudoButton.addEventListener('click', runSimulations);
            
    console.log("MAIN.JS: Chamando funções de população e cálculo iniciais...");
    openTab('tab-calculadora');
    populateMaterialPricesConfigUI(materialPricesContainer); 
    populateAndCalculateTable(); 
    runSimulations(); 
    console.log("MAIN.JS: DOMContentLoaded - FIM");
});