// js/simulacoesBDI.js
import { configManager } from './config.js'; 
import { parsePercentage, formatPercentage, formatCurrency } from './utils.js'; 
import { ui } from './ui.js'; 
// Importar getters de data.js se precisar ler diretamente, mas configManager já deve fornecer
import { getBdiFinalAdotado, setBdiFinalAdotado } from './data.js';


export const simulacoesBDI = {
    camposBDI: ['Admin', 'Risco', 'CustoFin', 'Tributos', 'Lucro', 'PercentMoBdi'],
    // Os valores para os campos de simulação agora são lidos/escritos no estado de data.js
    // através do configManager, para manter uma fonte única de verdade para esses percentuais.

    init() {
        // Os valores iniciais são carregados em data.js, e configManager.updateUI() os reflete.
        // Aqui, garantimos que os campos desta aba também reflitam esses valores.
        this.loadInitialValuesFromData(); 
        this.setupEventListeners();
        // this.updateUIFromState(); // Não mais necessário se loadInitialValuesFromData faz o trabalho
        this.calcularEExibirBDI();
    },
    
    loadInitialValuesFromData() {
        // Os valores de admin, risco, etc., agora estão em data.js (via configManager)
        const currentGlobalConfig = configManager.getConfig(); // Pega todo o estado de data.js via configManager
        this.camposBDI.forEach(keyBase => {
            const configKey = keyBase.charAt(0).toLowerCase() + keyBase.slice(1); // ex: Admin -> admin
            const inputElement = document.getElementById(`input${keyBase}`);
            if (inputElement) {
                if (currentGlobalConfig[configKey] !== undefined) {
                    inputElement.value = formatPercentage(currentGlobalConfig[configKey]);
                } else {
                    // Se não estiver no config global (data.js), usa o valor do input HTML ou um padrão
                    inputElement.value = formatPercentage(parsePercentage(inputElement.value) || 0);
                }
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        });
    },

    // updateUIFromState não é mais necessário se os valores são lidos de data.js
    // updateUIFromConfig também não é mais necessário da mesma forma, pois configManager
    // já atualiza data.js e ui.updateAllTabs deve propagar as mudanças.

    setupEventListeners() {
        this.camposBDI.forEach(keyBase => {
            const inputElement = document.getElementById(`input${keyBase}`);
            if (inputElement) {
                inputElement.addEventListener('blur', (event) => {
                    const targetInput = event.target;
                    const configKey = targetInput.id.replace('input', '').charAt(0).toLowerCase() + targetInput.id.replace('input', '').slice(1);
                    const { value, isValid } = ui.formatPercentageInputOnBlur(event, 0, 100); // Min 0, Max 100

                    if (isValid) {
                        // Atualiza o valor em data.js através de uma função setter em data.js
                        // ou através de configManager se ele tiver um setter genérico para esses campos.
                        // Por ora, vamos assumir que o configManager.setConfig pode lidar com isso
                        // se as chaves existirem em laborCosts, materialPrices, ou os campos diretos.
                        // Idealmente, data.js teria setters para admin, risco, etc.
                        // Como eles já estão no objeto config do configManager (que agora é uma fachada para data.js)
                        configManager.setConfig(configKey, value); // Isso irá atualizar em data.js

                        this.calcularEExibirBDI();
                        if (ui.updateAllTabs) ui.updateAllTabs(); 
                    }
                });
                inputElement.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(inputElement); }); 
            }
        });

        const btnAplicar = document.getElementById('btnAplicarBdiSimulado');
        if (btnAplicar) {
            btnAplicar.addEventListener('click', () => {
                const bdiCalculadoObj = this.calcularBDI();
                if (bdiCalculadoObj !== null && !isNaN(bdiCalculadoObj.bdiPercentual)) {
                    const bdiFinalInput = document.getElementById('inputBdiFinal'); // Na aba Configurações
                    if (bdiFinalInput && ui.clearInputError) ui.clearInputError(bdiFinalInput);

                    const bdiParaAplicar = bdiCalculadoObj.bdiPercentual;
                    if (bdiParaAplicar < 0 || bdiParaAplicar > 1000) { // Limite do seu bdiFinalAdotado
                        if(bdiFinalInput && ui.showInputError) ui.showInputError(bdiFinalInput, 'BDI simulado fora do limite (0-1000%). Não aplicado.');
                        alert('O BDI simulado está fora do intervalo permitido (0% a 1000%) e não pode ser aplicado diretamente.');
                        return;
                    }
                    
                    setBdiFinalAdotado(bdiParaAplicar); // Atualiza em data.js
                    
                    if (bdiFinalInput) { // Atualiza o campo na aba Configurações
                        bdiFinalInput.value = formatPercentage(bdiParaAplicar);
                    }
                    alert(`BDI de ${formatPercentage(bdiParaAplicar)} aplicado às configurações.`);
                    if (ui.changeTab) ui.changeTab('configuracoes'); 
                    if (ui.updateAllTabs) ui.updateAllTabs(); // Garante que o resumo reflita o novo BDI
                } else {
                    alert('Não foi possível calcular o BDI simulado. Verifique os valores.');
                }
            });
        }
    },

    getValoresSimulacaoParaCalculo() { // Para pegar os valores atuais dos inputs desta aba para o cálculo
        const result = {};
        const currentGlobalConfig = configManager.getConfig(); // Pega do data.js
        this.camposBDI.forEach(keyBase => {
            const configKey = keyBase.charAt(0).toLowerCase() + keyBase.slice(1);
            // Prioriza o valor do estado global em data.js
            result[configKey] = currentGlobalConfig[configKey] !== undefined ? currentGlobalConfig[configKey] : 0;
        });
        return result;
    },

    calcularBDI() {
        const { admin, risco, custoFin, tributos, lucro } = this.getValoresSimulacaoParaCalculo();
        const AC = admin / 100;
        const R = risco / 100;
        const CF = custoFin / 100;
        const T = tributos / 100;
        const L = lucro / 100;
        const denominador = 1 - T - L;
        if (denominador <= 0) return null; 
        const bdiMultiplicador = (1 + AC + R + CF) / denominador;
        const bdiPercentual = (bdiMultiplicador - 1) * 100;
        return { bdiMultiplicador, bdiPercentual };
    },

    calcularEExibirBDI() {
        const resultadoBDI = this.calcularBDI();
        const bdiResultElement = document.getElementById('bdiCalculadoResultado');
        const precoVendaElement = document.getElementById('precoVendaEstimado');
        const lucroBrutoElement = document.getElementById('lucroBrutoEstimado');

        if (resultadoBDI && bdiResultElement && precoVendaElement && lucroBrutoElement) {
            bdiResultElement.textContent = `${formatPercentage(resultadoBDI.bdiPercentual)}`;
            const custoDiretoTotal = (ui.calculadora && typeof ui.calculadora.getTotalCustoDireto === 'function') 
                                     ? ui.calculadora.getTotalCustoDireto() 
                                     : 0;
            if (custoDiretoTotal > 0) {
                const precoDeVenda = custoDiretoTotal * resultadoBDI.bdiMultiplicador;
                const valoresSimulacao = this.getValoresSimulacaoParaCalculo();
                const lucroBrutoEstimadoVal = precoDeVenda * (valoresSimulacao.lucro / 100);
                precoVendaElement.textContent = formatCurrency(precoDeVenda);
                lucroBrutoElement.textContent = formatCurrency(lucroBrutoEstimadoVal);
            } else {
                precoVendaElement.textContent = formatCurrency(0);
                lucroBrutoElement.textContent = formatCurrency(0);
            }
        } else if (bdiResultElement) {
            bdiResultElement.textContent = 'N/A'; // Ou Erro
            if (precoVendaElement) precoVendaElement.textContent = formatCurrency(0);
            if (lucroBrutoElement) lucroBrutoElement.textContent = formatCurrency(0);
        }
    }
};