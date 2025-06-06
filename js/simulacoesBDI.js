// js/simulacoesBDI.js
// ... (Conteúdo completo do simulacoesBDI.js que forneci na mensagem anterior, que começa com "import { configManager } from './config.js';")
// Este arquivo já estava correto e com a lógica dos 4 blocos e persistência dos simValues.
// Repetindo para garantir que você tenha a versão certa nesta sequência final.
import { formatPercentage, formatCurrency, parseFloatStrict } from './utils.js';
import { ui } from './ui.js';
import { getSimulationBdiValues, setSimulationBdiValues, simDefaultValues } from './data.js';

export const simulacoesBDI = {
    // Os valores agora são gerenciados em data.js via getSimulationBdiValues/setSimulationBdiValues
    
    init() {
        this.loadValuesFromData(); 
        this.setupEventListeners();
        this.recalculateAllBlocks(); 
    },

    loadValuesFromData() {
        const currentSimValues = getSimulation for (const helperKey in itemBase.helpers) { hhAjudTotalItem += (itemBase.helpers[helperKey] || 0) * quantidade; } } else if (itemBase.unitHHelper) { hhAjudTotalItem = (itemBase.unitHHelper || 0) * quantidade; } const pesoTotalItem = (itemBase.unitWeight || 0) * quantidade; this.itensAtivosNaTabela.push({ ...itemBase, quantidade: quantidade, custoMaterialUnitarioCalc: custoMaterialUnitario, custoMOUUnitarioCalc: custoMaoDeObraUnitario, custoUnitarioTotalCalc: custoUnitarioTotal, custoMatTotalItemCalc: custoMatTotalItem, custoMOTotalItemCalc: custoMOTotalItem, custoItemTotalDiretoCalc: custoItemTotalDireto, precoVendaItemCalc: precoVendaItem, hhProfTotalItemCalc: hhProfTotalItem, hhAjudTotalItemCalc: hhAjudTotalItem, pesoTotalItemCalc: pesoTotalItem }); const tr = tbody.insertRow(); tr.setAttribute('data-id', itemBase.refComposition); tr.insertCell().textContent = itemBase.description; tr.insertCell().textContent = itemBase.refComposition; tr.insertCell().textContent = itemBase.unit; const tdQuantidade = tr.insertCell(); const inputQuantidade = document.createElement('input'); inputQuantidade.type = 'text'; inputQuantidade.value = parseFloatStrict(quantidade).toFixed(2).replace('.', ','); inputQuantidade.classList.add('input-quantidade'); inputQuantidade.id = `quantidade-${itemBase.refComposition}`; const errorSpanQuantidade = document.createElement('span'); errorSpanQuantidade.classList.add('error-message'); errorSpanQuantidade.id = `quantidade-${itemBase.refComposition}Error`; tdQuantidade.appendChild(inputQuantidade); tdQuantidade.appendChild(errorSpanQuantidade); inputQuantidade.addEventListener('blur', (event) => { this.atualizarQuantidade(itemBase.refComposition, event.target.value); }); inputQuantidade.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(inputQuantidade); }); tr.insertCell().textContent = formatCurrency(custoMaterialUnitario); tr.insertCell().textContent = formatCurrency(custoMaoDeObraUnitario); tr.insertCell().textContent = formatCurrency(custoUnitarioTotal); tr.insertCell().textContent = formatCurrency(custoMatTotalItem); tr.insertCell().textContent = formatCurrency(custoMOTotalItem); tr.insertCell().textContent = formatCurrency(custoItemTotalDireto); tr.insertCell().textContent = formatCurrency(precoVendaItem); tr.insertCell().textContent = hhProfTotalItem.toFixed(2).replace('.',','); tr.insertCell().textContent = hhAjudTotalItem.toFixed(2).replace('.',','); tr.insertCell().textContent = pesoTotalItem.toFixed(2).replace('.',','); const tdControles = tr.insertCell(); const btnRemover = document.createElement('button'); btnRemover.textContent = 'Excluir'; btnRemover.classList.add('btn-remover'); btnRemover.setAttribute('aria-label', `Excluir item ${itemBase.description}`); btnRemover.addEventListener('click', () => this.removerItem(itemBase.refComposition)); tdControles.appendChild(btnRemover); }); } this.atualizarTotalTabela(); this.updateBdiAdotadoDisplay(); },
    atualizarTotalTabela() { /* ... (lógica igual à da última vez, com todas as colunas do rodapé) ... */ const rodapeContainer = document.getElementById('tabelaCalculadoraRodape'); if (!rodapeContainer) return; rodapeContainer.innerHTML = ''; const totalMat = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoMatTotalItemCalc, 0); const totalMO = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoMOTotalItemCalc, 0); const totalDireto = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoItemTotalDiretoCalc, 0); const totalVenda = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.precoVendaItemCalc, 0BdiValues();
        for (const key in currentSimValues) {
            const inputElement = document.getElementById(key); // IDs dos inputs devem ser iguais às chaves em simValues
            if (inputElement) {
                inputElement.value = formatPercentage(currentSimValues[key], (key === 'simPercFatMO' ? 2 : 1) );
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        }
        this.updateDependentFields(currentSimValues.simPercFatMO); // Atualiza % Mat Faturamento
    },

    // Chamado por persistencia.js ao carregar orçamento
    restoreSimulationValues(loadedValues) {
        setSimulationBdiValues(loadedValues); // Atualiza em data.js
        this.loadValuesFromData(); // Recarrega na UI
        this.recalculateAllBlocks();
    },

    // Chamado por persistencia.js ao salvar orçamento
    getCurrentSimulationValues() {
        return getSimulationBdiValues(); // Pega de data.js
    },
    
    updateDependentFields(percFatMO) {
        const percFatMatInput = document.getElementById('simPercFatMat');
        if (percFatMatInput) {
            const percMat = 100 - parseFloatStrict(percFatMO);
            percFatMatInput.value = formatPercentage(percMat);
        }
    },

    setupEventListeners() {
        const simValueKeys = Object.keys(simDefaultValues); // Usa as chaves dos defaults para identificar inputs
        simValueKeys.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement && !inputElement.readOnly) { // Não adiciona listener para campos readonly como simPercFatMat
                inputElement.addEventListener('blur', (event) => {
                    if (ui.clearInputError) ui.clearInputError(inputElement);
                    let value = parseFloatStrict(event.target.value.replace('%','').replace(',','.'));
                    let min = 0, max = 100;
                    if (id.includes('Lucro')) max = 1000; 
                    else if (id === 'simTributosMat') max = 100; // Pode ser alto

                    if (isNaN(value)) {
                        if(ui.showInputError) ui.showInputError(inputElement, 'Valor inválido.');
                        value = getSimulationBdiValues()[id]; // Reverte para valor de data.js
                    } else if (value < min) {
                        if(ui.showInputError) ui.showInputError(inputElement, `Mínimo ${min}%.`);
                        value = min;
                    } else if (value > max) {
                        if(ui.showInputError) ui.showInputError(inputElement, `Máximo ${max}%.`);
                        value = max;
                    }
                    event.target.value = formatPercentage(value, (id === 'simPercFatMO' ? 2 : 1) );
                    
                    // Atualiza o valor em data.js
                    const currentSimData = getSimulationBdiValues();
                    currentSimData[id] = value;
                    setSimulationBdiValues(currentSimData);

                    if (id === 'simPercFatMO') {
                        this.updateDependentFields(value);
                    }
                    this.recalculateAllBlocks();
                });
                 inputElement.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(inputElement); });
            }
        });
    },

    recalculateAllBlocks() {
        const custoTotalMO = ui.calculadora.getTotalCustoMO();
        const custoTotalMat = ui.calculadora.getTotalCustoMaterial();
        const currentSimData = getSimulationBdiValues();

        const simCustoDiretoMOEl = document.getElementById('simCustoDiretoMO');
        if(simCustoDiretoMOEl) simCustoDiretoMOEl.value = formatCurrency(custoTotalMO);
        const simCustoDiretoMatEl = document.getElementById('simCustoDiretoMat');
        if(simCustoDiretoMatEl) simCustoDiretoMatEl.value = formatCurrency(custoTotalMat);

        // Bloco 1: Mão de Obra
        const bdiMultiplicadorMO = this.calculateBdiMultiplier(currentSimData.simAdminMO, currentSimData.simRiscoMO, currentSimData.simCustoFinMO, currentSimData.simTributosMO, currentSimData.simLucroMO);
        document.getElementById('simBdiFatorMO').textContent = formatPercentage(bdiMultiplicadorMO * 100); // Exibe como multiplicador * 100%
        const totalComBdiMO = custoTotalMO * bdiMultiplicadorMO;
        const impostoValorMO = totalComBdiMO * (currentSimData.simTributosMO / 100);
        const totalMenosImpostoMO = totalComBdiMO - impostoValorMO;
        // Lucro sobre (Custo Direto + Custos Indiretos)
        const lucroBaseMO = custoTotalMO * (1 + (currentSimData.simAdminMO/100) + (currentSimData.simRiscoMO/100) + (currentSimData.simCustoFinMO/100));
        const lucroValorMO = lucroBaseMO / (1 - (currentSimData.simTributosMO/100) - (currentSimData.simLucroMO/100)) * (currentSimData.simLucroMO/100);
        
        this.updateResumoTable('simResumoBloco1Body', { custoMO: custoTotalMO, totalComBdiMO, totalMenosImpostoMO, lucroMO: lucroValorMO, percLucroMO: custoTotalMO > 0 ? (lucroValorMO / custoTotalMO) * 100 : 0 });

        // Bloco 2: Materiais
        const bdiMultiplicadorMat = this.calculateBdiMultiplier(currentSimData.simAdminMat, currentSimData.simRiscoMat, currentSimData.simCustoFinMat, currentSimData.simTributosMat, currentSimData.simLucroMat);
        document.getElementById('simBdiFatorMat').textContent = formatPercentage(bdiMultiplicadorMat * 100);
        const totalComBdiMat = custoTotalMat * bdiMultiplicadorMat;
        const impostoValorMat = totalComBdiMat * (currentSimData.simTributosMat / 100);
        const totalMenosImpostoMat = totalComBdiMat - impostoValorMat;
        const lucroBaseMat = custoTotalMat * (1 + (currentSimData.simAdminMat/100) + (currentSimData.simRiscoMat/100) + (currentSimData.simCustoFinMat/100));
        const lucroValorMat = lucroBaseMat / (1 - (currentSimData.simTributosMat/100) - (currentSimData.simLucroMat/100)) * (currentSimData.simLucroMat/100);

        this.updateResumoTable('simResumoBloco2Body', { custoMat: custoTotalMat, totalComBdiMat, totalMenosImpostoMat, lucroMat: lucroValorMat, percLucroMat: custoTotalMat > 0 ? (lucroValorMat / custoTotalMat) * 100 : 0 });

        // Bloco 3: Resumo da Simulação
        const valorTotalSimulado = totalComBdiMO + totalComBdiMat;
        const valorTotalMenosImpostosSimulado = totalMenosImpostoMO + totalMenosImpostoMat;
        const custoDiretoTotalSimulado = custoTotalMO + custoTotalMat;
        const lucroTotalSimulado = lucroValorMO + lucroValorMat;
        this.updateResumoTable('simResumoBloco3Body', { valorTotalSimulado, valorTotalMenosImpostosSimulado, custoDiretoTotalSimulado, lucroTotalSimulado, percLucroTotalSimulado: custoDiretoTotalSimulado > 0 ? (lucroTotalSimulado / custoDiretoTotalSimulado) * 100 : 0 });

        // Bloco 4: Ajustes de Faturamento
        const percFatMOVal = currentSimData.simPercFatMO;
        const percFatMatVal = 100 - percFatMOVal;
        const faturamentoBase = valorTotalSimulado;
        const valorTotalFaturadoMO = faturamentoBase * (percFatMOVal / 100);
        const valorTotalFaturadoMat = faturamentoBase * (percFatMatVal / 100);
        const impostoValorFatMO = valorTotalFaturadoMO * (currentSimData.simTributosMO / 100);
        const impostoValorFatMat = valorTotalFaturadoMat * (currentSimData.simTributosMat / 100);
        const valorMenosImpostoFatMO = valorTotalFaturadoMO - impostoValorFatMO;
        const valorMenosImpostoFatMat = valorTotalFaturadoMat - impostoValorFatMat;
        this.updateResumoTable('simResumoBloco4AjusteBody', { faturamentoPercMO: percFatMOVal, faturamentoPercMat: percFatMatVal, valorTotalFaturadoMO, valorTotalFaturadoMat, impostoValorMO: impostoValorFatMO, impostoValorMat: impostoValorFatMat, valorMenosImpostoMO: valorMenosImpostoFatMO, valorMenosImpostoMat: valorMenosImpostoFatMat, }, true);
        const valorTotalFaturadoGeral = valorTotalFaturadoMO + valorTotalFaturadoMat;
        const valorTotalFaturadoMenosImpostoGeral = valorMenosImpostoFatMO + valorMenosImpostoFatMat;
        const custoDiretoTotalAjuste = custoTotalMO + custoTotalMat;
        const lucroAjustado = valorTotalFaturadoMenosImpostoGeral - custoDiretoTotalAjuste;
        this.updateResumoTable('simResumoBloco4FinalBody', { valorTotalFaturadoGeral, valorTotalFaturadoMenosImpostoGeral, custoDiretoTotalAjuste, lucroAjustado, percLucroAjustado: custoDiretoTotalAjuste > 0 ? (lucroAjustado / custoDiretoTotalAjuste) * 100 : 0 });
    },
    calculateBdiMultiplier(admin, risco, custoFin, tributos, lucro) {
        const AC = admin / 100;
        const R = risco / 100;
        const CF = custoFin / 100;
        const T = tributos / 100;
        const L = lucro / 100;
        const denominador = 1 - T - L;
        if (denominador <= 0) return 1;
        return (1 + AC + R + CF) / denominador;
    },
    updateResumoTable(tbodyId, data, isAdjustmentTable = false) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        tbody.querySelectorAll('tr').forEach(row => {
            const dataValueKey = row.cells[isAdjustmentTable ? 1 : 1].dataset.value; // Pega do segundo td se não for adjustment, ou do primeiro td de valor
            if (isAdjustmentTable) {
                const keyMO = row.cells[1].dataset.value;
                const keyMat = row.cells[2].dataset.value;
                if (data[keyMO] !== undefined) row.cells[1].textContent = keyMO.toLowerCase().includes('perc') ? formatPercentage(data[keyMO]) : formatCurrency(data[keyMO]);
                if (data[keyMat] !== undefined) row.cells[2].textContent = keyMat.toLowerCase().includes('perc') ? formatPercentage(data[keyMat]) : formatCurrency(data[keyMat]);
            } else {
                if (data[dataValueKey] !== undefined) {
                    const value = data[dataValueKey];
                    row.cells[1].textContent = dataValueKey.toLowerCase().includes('perc') ? formatPercentage(value) : formatCurrency(value);
                }
            }
        });
    }
};