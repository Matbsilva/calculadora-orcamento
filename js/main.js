// js/main.js
import { setupConfigEventListeners } from './configuracao.js';
import { setupCalculatorEventListeners, initCalculatorTab } from './calculadora.js';
import { setupSimulationEventListeners } from './simulacao.js';
import { exportMaterialsToCSV, exportMaterialsByServiceToCSV } from './exportacao.js';
import { showTab, loadConfigDataToUI } from './ui.js';
import { loadBudgetFromLocalStorage, saveBudgetToLocalStorage, calculateAllSubtotalsAndTotal, budgetDataStructure } from './data.js'; // Adicionado budgetDataStructure


// Torna showTab global para os onclicks no HTML
window.showTab = showTab;

document.addEventListener('DOMContentLoaded', () => {
    // Tenta carregar dados do LocalStorage primeiro
    const loadedFromStorage = loadBudgetFromLocalStorage();
    
    // Popula a UI com os dados (do localStorage ou defaults do data.js)
    loadConfigDataToUI();
    
    // Calcula totais iniciais (importante se dados foram carregados do localStorage)
    if (budgetDataStructure && budgetDataStructure.length > 0) {
        calculateAllSubtotalsAndTotal();
    }

    // Configura todos os event listeners das abas
    setupConfigEventListeners();
    setupCalculatorEventListeners(); // Configura listeners da tabela
    setupSimulationEventListeners();

    // Botões de Exportação
    const saveBudgetButton = document.getElementById('save-budget-button');
    if (saveBudgetButton) {
        saveBudgetButton.addEventListener('click', () => {
            // Antes de salvar, talvez recalcular tudo para garantir consistência
            calculateAllSubtotalsAndTotal(); 
            const budgetJSON = {
                config: getConfigForSave(), // Uma função que pega o config de data.js
                budgetItems: getBudgetDataForSave() // Uma função que pega os itens com suas quantidades
            };
            const dataStr = JSON.stringify(budgetJSON, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = 'orcamento_calculadora.json';
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            saveBudgetToLocalStorage(); // Também salva no localStorage ao salvar arquivo
        });
    }

    const loadBudgetInput = document.getElementById('load-budget-input');
    if (loadBudgetInput) {
        loadBudgetInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const loadedData = JSON.parse(e.target.result);
                        if (loadedData.config && loadedData.budgetItems) {
                            // Aqui você precisaria de funções para aplicar esses dados carregados
                            // ao seu estado global em data.js e depois atualizar a UI.
                            // Ex: applyLoadedConfig(loadedData.config); applyLoadedItems(loadedData.budgetItems);
                            // Por enquanto, vamos simular recarregando do localStorage após um "save" manual
                            // que viria de uma importação bem-sucedida.
                            // Para uma importação real, você precisaria de:
                            // 1. setConfig(loadedData.config) em data.js
                            // 2. Atualizar budgetDataStructure[].initialQuantity em data.js
                            // 3. Chamar loadConfigDataToUI()
                            // 4. Chamar calculateAllSubtotalsAndTotal()
                            // 5. Chamar initCalculatorTab() para re-renderizar a tabela
                            alert('Funcionalidade de carregar JSON precisa de implementação detalhada para aplicar os dados.');
                            // saveToLocalStorage(); // Se o carregamento fosse para o localStorage
                            // window.location.reload();
                        } else {
                            throw new Error("Estrutura do JSON inválida.");
                        }
                    } catch (err) {
                        console.error("Erro ao carregar orçamento do arquivo:", err);
                        alert(`Erro ao carregar o orçamento: ${err.message}. Verifique se o arquivo é um JSON válido com a estrutura esperada.`);
                        updateInputValidationUI(loadBudgetInput, false, 'load-budget-input-error');
                    } finally {
                        event.target.value = null; // Limpa o input de arquivo
                    }
                };
                reader.readAsText(file);
            }
        });
    }
    
    // Inicializa a aba ativa e a tabela da calculadora
    showTab('configuracoes'); // Mostra a primeira aba por padrão
    if (document.getElementById('calculadora').classList.contains('active')) {
        initCalculatorTab(); // Se calculadora for a aba ativa inicialmente (improvável com o acima)
    }

    // Lógica para o ano no footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});

// Funções auxiliares para salvar/carregar (precisam estar alinhadas com data.js)
function getConfigForSave() {
    // Esta função deve retornar o objeto 'config' de data.js
    // Supondo que getConfig() de data.js retorna o que precisamos
    return import('./data.js').then(dataModule => dataModule.getConfig());
}

function getBudgetDataForSave() {
    // Esta função deve retornar os itens do orçamento com suas quantidades
    // Ex: budgetDataStructure.map(item => ({id: item.id, initialQuantity: item.initialQuantity}))
    return import('./data.js').then(dataModule => 
        dataModule.getBudgetData().map(item => ({id: item.id, initialQuantity: item.initialQuantity}))
    );
}

// Para os botões de exportação CSV, se eles estiverem no HTML globalmente
// ou se você quiser expô-los globalmente (geralmente não recomendado)
// window.exportMaterialsToCSV = exportMaterialsToCSV;
// window.exportMaterialsByServiceToCSV = exportMaterialsByServiceToCSV;
// É melhor adicioná-los via event listeners em main.js se os botões estiverem no HTML.
// Se os botões de export CSV estiverem na aba "Exportação", adicione os listeners aqui:
document.addEventListener('DOMContentLoaded', () => {
    const exportConsolidatedButton = document.getElementById('export-consolidated-csv-button'); // CRIE ESTE BOTÃO NO HTML
    if (exportConsolidatedButton) {
        exportConsolidatedButton.addEventListener('click', () => exportMaterialsToCSV(false));
    }

    const exportDetailedButton = document.getElementById('export-detailed-csv-button'); // CRIE ESTE BOTÃO NO HTML
    if (exportDetailedButton) {
        exportDetailedButton.addEventListener('click', () => exportMaterialsToCSV(true));
    }
});