// js/persistencia.js
// ... (Conteúdo completo do persistencia.js que forneci na Parte 1 de 3 (Final) dos JS,
//      que começa com "// js/persistencia.js")
// Este arquivo já estava correto.
import { ui } from './ui.js';
import {
    updateLaborCost, updateMaterialPrice, setBdiFinalAdotado, setAreaObra,
    getLaborCosts, getMaterialPrices, getBdiFinalAdotado, getAreaObra,
    materiaisBase, 
    budgetDataStructure, updateBudgetItemQuantity,
    setSimulationBdiValues, getSimulationBdiValues, simDefaultValues // Adicionado para simBDI
} from './data.js';
import { calculadora } from './calculadora.js';
// simulacoesBDI é importado em ui.js e persistencia interage com data.js para os valores da simulação

export const persistencia = {
    saveBudget() {
        const budgetToSave = {
            configData: { 
                laborCosts: getLaborCosts(),
                materialPrices: getMaterialPrices(),
                bdiFinalAdotado: getBdiFinalAdotado(),
                areaObra: getAreaObra(),
                simulationBdiValues: getSimulationBdiValues() 
            },
            composicoes: calculadora.getItensParaSalvar(),
            timestamp: new Date().toISOString()
        };
        try {
            const jsonData = JSON.stringify(budgetToSave, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dataFormatada = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            a.download = `orcamento_calc_${dataFormatada}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("Orçamento salvo com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar orçamento:", error);
            alert('Ocorreu um erro ao tentar salvar o orçamento.');
        }
    },
    loadBudget(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target.result);
                if (!loadedData || typeof loadedData.configData !== 'object' || !Array.isArray(loadedData.composicoes)) {
                    throw new Error("Estrutura do JSON inválida.");
                }
                event.target.value = null;
                if (confirm("Deseja carregar este orçamento? Alterações não salvas serão perdidas.")) {
                    const { configData, composicoes } = loadedData;
                    if (configData.laborCosts) { Object.keys(configData.laborCosts).forEach(k => { if (getLaborCosts().hasOwnProperty(k)) updateLaborCost(k, configData.laborCosts[k]); }); }
                    Object.keys(materiaisBase).forEach(idMat => updateMaterialPrice(idMat, materiaisBase[idMat].precoUnitarioDefault)); // Reseta primeiro
                    if (configData.materialPrices) { Object.keys(configData.materialPrices).forEach(k => { if (materiaisBase.hasOwnProperty(k)) updateMaterialPrice(k, configData.materialPrices[k]); }); }
                    setBdiFinalAdotado(configData.bdiFinalAdotado !== undefined ? configData.bdiFinalAdotado : simDefaultValues.bdiFinalAdotado); // Usar o default de data.js se não vier
                    setAreaObra(configData.areaObra !== undefined ? configData.areaObra : simDefaultValues.areaObra); // Usar o default de data.js
                    if (configData.simulationBdiValues) { setSimulationBdiValues(configData.simulationBdiValues); }
                    else { setSimulationBdiValues(simDefaultValues); } // Se não houver no arquivo, usa os defaults
                    
                    calculadora.setItens(composicoes);
                    if (ui.resetUI) ui.resetUI(); // resetUI deve atualizar todas as UIs com os novos dados
                    alert('Orçamento carregado com sucesso!');
                }
            } catch (error) {
                console.error("Erro ao carregar orçamento:", error);
                alert('Erro ao carregar orçamento: Arquivo inválido ou estrutura incorreta.');
                event.target.value = null;
            }
        };
        reader.onerror = () => { alert('Erro ao ler o arquivo.'); event.target.value = null; };
        reader.readAsText(file);
    }
};