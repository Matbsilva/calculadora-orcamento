// js/persistencia.js
import { ui } from './ui.js';
import {
    // Funções para ATUALIZAR o estado em data.js
    updateLaborCost, updateMaterialPrice, setBdiFinalAdotado, setAreaObra,
    // Funções para OBTER o estado atual de data.js para salvar
    getLaborCosts, getMaterialPrices, getBdiFinalAdotado, getAreaObra,
    // Para resetar para os padrões de material
    materiaisBase,
    // Para interagir com as quantidades das composições
    budgetDataStructure, updateBudgetItemQuantity
} from './data.js';
import { calculadora } from './calculadora.js'; // Para pegar itens para salvar

export const persistencia = {
    saveBudget() {
        // Coleta todos os dados relevantes do estado atual (via data.js e calculadora.js)
        const budgetToSave = {
            laborCosts: getLaborCosts(),
            materialPrices: getMaterialPrices(),
            bdiFinalAdotado: getBdiFinalAdotado(),
            areaObra: getAreaObra(),
            // Salva apenas as composições que têm quantidade definida (similar ao seu main.js antigo)
            composicoes: budgetDataStructure
                .filter(item => item.initialQuantity > 0)
                .map(item => ({
                    refComposition: item.refComposition,
                    quantity: item.initialQuantity
                }))
        };

        try {
            const jsonData = JSON.stringify(budgetToSave, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dataFormatada = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            a.download = `orcamento_${dataFormatada}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("Orçamento salvo com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar orçamento:", error);
            alert('Ocorreu um erro ao tentar salvar o orçamento. Verifique o console.');
        }
    },

    loadBudget(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target.result);

                // Validar estrutura básica do JSON carregado
                if (!loadedData || typeof loadedData.laborCosts !== 'object' ||
                    typeof loadedData.materialPrices !== 'object' ||
                    !Array.isArray(loadedData.composicoes)) {
                    throw new Error("Estrutura do JSON do orçamento inválida ou dados essenciais ausentes.");
                }
                
                event.target.value = null; // Limpa o input de arquivo

                if (confirm("Deseja carregar este orçamento? Todas as alterações não salvas serão perdidas.")) {
                    // Atualizar laborCosts em data.js
                    if (loadedData.laborCosts) {
                        for (const key in loadedData.laborCosts) {
                            if (getLaborCosts().hasOwnProperty(key)) { // Verifica se a chave existe no estado atual
                                updateLaborCost(key, loadedData.laborCosts[key]);
                            }
                        }
                    }

                    // Atualizar materialPrices em data.js
                    // Primeiro, reseta para os defaults para limpar valores antigos não presentes no arquivo carregado
                    Object.keys(materiaisBase).forEach(idMat => updateMaterialPrice(idMat, materiaisBase[idMat].precoUnitarioDefault));
                    // Depois, aplica os preços do arquivo carregado
                    if (loadedData.materialPrices) {
                        for (const key in loadedData.materialPrices) {
                             // Apenas atualiza se o material base existir, para evitar poluir com chaves desconhecidas
                            if (materiaisBase.hasOwnProperty(key)) {
                                updateMaterialPrice(key, loadedData.materialPrices[key]);
                            }
                        }
                    }
                    
                    // Atualizar BDI e Área em data.js
                    setBdiFinalAdotado(loadedData.bdiFinalAdotado !== undefined ? loadedData.bdiFinalAdotado : initialBdiFinalAdotado);
                    setAreaObra(loadedData.areaObra !== undefined ? loadedData.areaObra : initialAreaObra);

                    // Atualizar quantidades na budgetDataStructure (em data.js)
                    // Primeiro zera todas as quantidades
                    budgetDataStructure.forEach((item, index) => updateBudgetItemQuantity(index, 0));
                    // Depois aplica as quantidades do arquivo carregado
                    if (loadedData.composicoes) {
                        loadedData.composicoes.forEach(savedItem => {
                            const itemIndex = budgetDataStructure.findIndex(bsItem => bsItem.refComposition === savedItem.refComposition);
                            if (itemIndex !== -1) {
                                updateBudgetItemQuantity(itemIndex, savedItem.quantity || 0);
                            }
                        });
                    }
                    
                    ui.resetUI(); // Isso deve recarregar a UI de config, calculadora, e atualizar todas as abas
                    alert('Orçamento carregado com sucesso!');
                }

            } catch (error) {
                console.error("Erro ao carregar orçamento:", error);
                alert('Erro ao carregar orçamento: O arquivo selecionado não é um JSON válido, está corrompido ou não corresponde à estrutura esperada.');
                event.target.value = null;
            }
        };
        reader.onerror = () => {
            alert('Erro ao ler o arquivo.');
            event.target.value = null;
        };
        reader.readAsText(file);
    }
};