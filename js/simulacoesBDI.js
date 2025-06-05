// js/simulacoesBDI.js
import { formatPercentage, formatCurrency, parseFloatStrict } from './utils.js';
import { ui } from './ui.js';
// Importa funções de data.js para ler/escrever os percentuais da simulação,
// que agora serão armazenados lá para persistência.
import {
    laborCosts, // Para pegar os nomes dos campos de input de % da simulação
    getBdiFinalAdotado, // Não usado diretamente aqui, mas para referência
    // Precisamos de getters e setters em data.js para os campos de % da simulação BDI.
    // Ex: getSimAdminMO, setSimAdminMO, etc.
    // Por ora, vamos assumir que eles são parte de um objeto 'simulacaoConfig' em data.js
    // ou que configManager pode lê-los/escrevê-los se estiverem em 'laborCosts' ou 'materialPrices'
    // com prefixos específicos.
    // Para simplificar, vamos ler/escrever em variáveis locais ao módulo e
    // o persistencia.js vai salvar/carregar esses valores específicos.
} from './data.js'; 
// configManager não é mais diretamente necessário aqui se os valores da simulação
// são locais ou gerenciados por data.js via persistencia

// Estado local para os inputs da simulação BDI.
// Estes serão preenchidos pelo loadBudget ou terão valores padrão.
const simValues = {
    simAdminMO: 10.0, simRiscoMO: 5.0, simCustoFinMO: 1.0, simTributosMO: 5.0, simLucroMO: 15.0,
    simAdminMat: 10.0, simRiscoMat: 5.0, simCustoFinMat: 1.0, simTributosMat: 13.0, simLucroMat: 15.0,
    simPercFatMO: 50.0
};

export const simulacoesBDI = {
    init() {
        this.populateInputsFromState(); // Popula inputs com simValues
        this.setupEventListeners();
        this.recalculateAllBlocks(); // Calcula tudo na inicialização
    },

    populateInputsFromState() {
        for (const key in simValues) {
            const inputElement = document.getElementById(key);
            if (inputElement) {
                inputElement.value = formatPercentage(simValues[key], (key === 'simPercFatMO' ? 2 : 1) ); // Ajusta casas decimais
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        }
        // Atualiza simPercFatMat que depende de simPercFatMO
        const percFatMatInput = document.getElementById('simPercFatMat');
        if (percFatMatInput) {
            percFatMatInput.value = formatPercentage(100 - simValues.simPercFatMO);
        }
    },
    
    // Função para persistencia.js carregar os valores salvos
    setSimulationValues(loadedSimValues) {
        for (const key in loadedSimValues) {
            if (simValues.hasOwnProperty(key)) {
                simValues[key] = loadedSimValues[key];
            }
        }
        this.populateInputsFromState();
        this.recalculateAllBlocks();
    },

    // Função para persistencia.js obter os valores para salvar
    getSimulationValues() {
        return { ...simValues };
    },

    setupEventListeners() {
        const inputIds = Object.keys(simValues); // Todos os inputs que afetam os cálculos
        inputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) {
                inputElement.addEventListener('blur', (event) => {
                    if (ui.clearInputError) ui.clearInputError(inputElement);
                    let value = parseFloatStrict(event.target.value.replace('%','').replace(',','.'));
                    let min = 0, max = 100;
                    // Validação específica
                    if (id === 'simTributosMat') max = 100; // Pode ser alto com ICMS+IPI
                    else if (id.includes('Lucro')) max = 1000; // Lucro pode ser > 100%

                    if (isNaN(value)) {
                        if(ui.showInputError) ui.showInputError(inputElement, 'Valor inválido.');
                        value = simValues[id]; // Reverte
                    } else if (value < min) {
                        if(ui.showInputError) ui.showInputError(inputElement, `Mínimo ${min}%.`);
                        value = min;
                    } else if (value > max) {
                        if(ui.showInputError) ui.showInputError(inputElement, `Máximo ${max}%.`);
                        value = max;
                    }
                    event.target.value = formatPercentage(value, (id === 'simPercFatMO' ? 2 : 1) );
                    simValues[id] = value;

                    // Se simPercFatMO mudou, atualiza simPercFatMat
                    if (id === 'simPercFatMO') {
                        const percFatMatInput = document.getElementById('simPercFatMat');
                        if (percFatMatInput) {
                            const percMat = 100 - value;
                            percFatMatInput.value = formatPercentage(percMat);
                            // simValues.simPercFatMat não é um input direto, mas usado no cálculo do Bloco 4
                        }
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

        document.getElementById('simCustoDiretoMO').value = formatCurrency(custoTotalMO);
        document.getElementById('simCustoDiretoMat').value = formatCurrency(custoTotalMat);

        // Bloco 1: Mão de Obra
        const bdiFatorMO = this.calculateBdiFactor(simValues.simAdminMO, simValues.simRiscoMO, simValues.simCustoFinMO, simValues.simTributosMO, simValues.simLucroMO);
        document.getElementById('simBdiFatorMO').textContent = formatPercentage(bdiFatorMO * 100 - 100);
        const totalComBdiMO = custoTotalMO * bdiFatorMO;
        const impostoValorMO = totalComBdiMO * (simValues.simTributosMO / 100);
        const totalMenosImpostoMO = totalComBdiMO - impostoValorMO;
        const lucroMO = totalComBdiMO * (simValues.simLucroMO / 100) / (1 - (simValues.simTributosMO / 100)); // Ajuste para lucro sobre preço de venda - imposto
        
        this.updateResumoTable('simResumoBloco1', {
            custoMO: custoTotalMO, totalComBdiMO, totalMenosImpostoMO, lucroMO,
            percLucroMO: custoTotalMO > 0 ? (lucroMO / custoTotalMO) * 100 : 0
        });

        // Bloco 2: Materiais
        const bdiFatorMat = this.calculateBdiFactor(simValues.simAdminMat, simValues.simRiscoMat, simValues.simCustoFinMat, simValues.simTributosMat, simValues.simLucroMat);
        document.getElementById('simBdiFatorMat').textContent = formatPercentage(bdiFatorMat * 100 - 100);
        const totalComBdiMat = custoTotalMat * bdiFatorMat;
        const impostoValorMat = totalComBdiMat * (simValues.simTributosMat / 100);
        const totalMenosImpostoMat = totalComBdiMat - impostoValorMat;
        const lucroMat = totalComBdiMat * (simValues.simLucroMat / 100) / (1 - (simValues.simTributosMat / 100));

        this.updateResumoTable('simResumoBloco2', {
            custoMat: custoTotalMat, totalComBdiMat, totalMenosImpostoMat, lucroMat,
            percLucroMat: custoTotalMat > 0 ? (lucroMat / custoTotalMat) * 100 : 0
        });

        // Bloco 3: Resumo da Simulação
        const valorTotalSimulado = totalComBdiMO + totalComBdiMat;
        const valorTotalMenosImpostosSimulado = totalMenosImpostoMO + totalMenosImpostoMat;
        const custoDiretoTotalSimulado = custoTotalMO + custoTotalMat;
        const lucroTotalSimulado = lucroMO + lucroMat;
        this.updateResumoTable('simResumoBloco3', {
            valorTotalSimulado, valorTotalMenosImpostosSimulado, custoDiretoTotalSimulado, lucroTotalSimulado,
            percLucroTotalSimulado: custoDiretoTotalSimulado > 0 ? (lucroTotalSimulado / custoDiretoTotalSimulado) * 100 : 0
        });

        // Bloco 4: Ajustes de Faturamento
        const percFatMOVal = simValues.simPercFatMO;
        const percFatMatVal = 100 - percFatMOVal;
        
        const faturamentoBase = valorTotalSimulado; // Preço de Venda Bruto do Bloco 3

        const valorTotalFaturadoMO = faturamentoBase * (percFatMOVal / 100);
        const valorTotalFaturadoMat = faturamentoBase * (percFatMatVal / 100);

        // Impostos sobre o faturamento (usando os % de tributos dos blocos 1 e 2)
        const impostoValorFatMO = valorTotalFaturadoMO * (simValues.simTributosMO / 100);
        const impostoValorFatMat = valorTotalFaturadoMat * (simValues.simTributosMat / 100);
        
        const valorMenosImpostoFatMO = valorTotalFaturadoMO - impostoValorFatMO;
        const valorMenosImpostoFatMat = valorTotalFaturadoMat - impostoValorFatMat;

        this.updateResumoTable('simResumoBloco4_Ajuste', {
            faturamentoPercMO: percFatMOVal, faturamentoPercMat: percFatMatVal,
            valorTotalFaturadoMO, valorTotalFaturadoMat,
            impostoValorMO: impostoValorFatMO, impostoValorMat: impostoValorFatMat,
            valorMenosImpostoMO: valorMenosImpostoFatMO, valorMenosImpostoMat: valorMenosImpostoFatMat,
        }, true); // true para indicar que é a tabela de ajuste com colunas MO/Mat

        const valorTotalFaturadoGeral = valorTotalFaturadoMO + valorTotalFaturadoMat;
        const valorTotalFaturadoMenosImpostoGeral = valorMenosImpostoFatMO + valorMenosImpostoFatMat;
        const custoDiretoTotalAjuste = custoTotalMO + custoTotalMat; // Permanece o mesmo
        const lucroAjustado = valorTotalFaturadoMenosImpostoGeral - custoDiretoTotalAjuste;
        
        this.updateResumoTable('simResumoBloco4_Final', {
            valorTotalFaturadoGeral, valorTotalFaturadoMenosImpostoGeral,
            custoDiretoTotalAjuste, lucroAjustado,
            percLucroAjustado: custoDiretoTotalAjuste > 0 ? (lucroAjustado / custoDiretoTotalAjuste) * 100 : 0
        });
    },

    calculateBdiFactor(admin, risco, custoFin, tributos, lucro) {
        const AC = admin / 100;
        const R = risco / 100;
        const CF = custoFin / 100;
        const T = tributos / 100;
        const L = lucro / 100;
        const denominador = 1 - T - L;
        if (denominador <= 0) return 1; // Evita divisão por zero, BDI de 0%
        return (1 + AC + R + CF) / denominador;
    },

    updateResumoTable(tableBodyId, data, isAdjustmentTable = false) {
        const tbody = document.getElementById(tableBodyId);
        if (!tbody) return;

        tbody.querySelectorAll('tr').forEach(row => {
            const key = row.cells[0].textContent.trim(); // Ou use um data-key se preferir
            let dataKeyToFind = Object.keys(data).find(dk => row.cells[1].dataset.value === dk); // Usa data-value

            if (isAdjustmentTable) { // Tabela com colunas MO e Material
                const keyMO = row.cells[1].dataset.value;
                const keyMat = row.cells[2].dataset.value;
                if (data[keyMO] !== undefined) {
                    row.cells[1].textContent = keyMO.toLowerCase().includes('perc') ? formatPercentage(data[keyMO]) : formatCurrency(data[keyMO]);
                }
                if (data[keyMat] !== undefined) {
                     row.cells[2].textContent = keyMat.toLowerCase().includes('perc') ? formatPercentage(data[keyMat]) : formatCurrency(data[keyMat]);
                }
            } else { // Tabela normal com uma coluna de valor
                 if (dataKeyToFind && data[dataKeyToFind] !== undefined) {
                    const value = data[dataKeyToFind];
                    row.cells[1].textContent = dataKeyToFind.toLowerCase().includes('perc') ? formatPercentage(value) : formatCurrency(value);
                }
            }
        });
    }
};