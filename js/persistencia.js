// js/persistencia.js
import { ui } from './ui.js';
import {
    updateLaborCost, updateMaterialPrice, setBdiFinalAdotado, setAreaObra,
    getLaborCosts, getMaterialPrices, getBdiFinalAdotado, getAreaObra,
    materiaisBase, // Para resetar materialPrices para os defaults ao carregar
    budgetDataStructure, updateBudgetItemQuantity,
    // Adicionando os valores da simulação BDI para persistência
    // Assumindo que simulacoesBDI.js terá getters/setters para seu estado interno 'simValues'
} from './data.js';
import { calculadora } from './calculadora.js';
import { simulacoesBDI } from './simulacoesBDI.js'; // Para salvar/carregar os valores da simulação

export const persistencia = {
    saveBudget() {
        const budgetToSave = {
            configData: { // Agrupando os dados de config que vêm de data.js
                laborCosts: getLaborCosts(),
                materialPrices: getMaterialPrices(),
                bdiFinalAdotado: getBdiFinalAdotado(),
                areaObra: getAreaObra(),
                // Adicionar aqui os valores dos inputs da simulação BDI
                simulationValues: simulacoesBDI.getSimulationValues ? simulacoesBDI.getSimulationValues() : {}
            },
            composicoes: calculadora.getItensParaSalvar(), // Pega apenas {refComposition, quantity}
            timestamp: new Date().toISOString()
        };

        try {
            const jsonData = JSON.stringify(budgetToSave, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dataFormatada = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            a.download = `orcamento_calc_${dataFormatada}.json`; // Nome do arquivo um pouco mais específico
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

                if (!loadedData || typeof loadedData.configData !== 'object' ||
                    !Array.isArray(loadedData.composicoes)) {
                    throw new Error("Estrutura do JSON do orçamento inválida ou dados essenciais ausentes.");
                }
                
                event.target.value = null; 

                if (confirm("Deseja carregar este orçamento? Todas as alterações não salvas serão perdidas.")) {
                    const { configData, composicoes } = loadedData;

                    // Restaurar dados de config em data.js
                    if (configData.laborCosts) {
                        for (const key in configData.laborCosts) {
                            if (getLaborCosts().hasOwnProperty(key)) {
                                updateLaborCost(key, configData.laborCosts[key]);
                            }
                        }
                    }
                    // Resetar e carregar preços de materiais
                    Object.keys(materiaisBase).forEach(idMat => updateMaterialPrice(idMat, materiaisBase[idMat].precoUnitarioDefault));
                    if (configData.materialPrices) {
                        for (const key in configData.materialPrices) {
                            if (materiaisBase.hasOwnProperty(key)) {
                                updateMaterialPrice(key, configData.materialPrices[key]);
                            }
                        }
                    }
                    setBdiFinalAdotado(configData.bdiFinalAdotado !== undefined ? configData.bdiFinalAdotado : 105.00);
                    setAreaObra(configData.areaObra !== undefined ? configData.areaObra : 100);

                    // Restaurar valores da simulação BDI
                    if (configData.simulationValues && simulacoesBDI.setSimulationValues) {
                        simulacoesBDI.setSimulationValues(configData.simulationValues);
                    }
                    
                    // Restaurar quantidades na calculadora
                    calculadora.setItens(composicoes); // setItens já lida com zerar e aplicar quantidades
                    
                    ui.resetUI(); // Isso deve recarregar todas as UIs e atualizar abas
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