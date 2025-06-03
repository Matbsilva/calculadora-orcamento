// js/simulacoesBDI.js
import { configManager } from './config.js'; 
import { parsePercentage, formatPercentage, formatCurrency } from './utils.js'; 
import { ui } from './ui.js'; 

export const simulacoesBDI = {
    camposBDI: ['Admin', 'Risco', 'CustoFin', 'Tributos', 'Lucro', 'PercentMoBdi'],
    valores: {}, 

    init() {
        this.loadInitialValuesFromConfig(); 
        this.setupEventListeners();
        this.updateUIFromState(); 
        this.calcularEExibirBDI();
    },
    
    loadInitialValuesFromConfig() {
        const config = configManager.getConfig(); 
        this.camposBDI.forEach(keyBase => {
            const configKey = keyBase.charAt(0).toLowerCase() + keyBase.slice(1); 
            const inputElement = document.getElementById(`input${keyBase}`);
            if (config[configKey] !== undefined) {
                this.valores[configKey] = parseFloat(config[configKey]);
            } else if (inputElement) {
                 this.valores[configKey] = parsePercentage(inputElement.value);
            } else {
                this.valores[configKey] = 0; 
            }
        });
    },

    updateUIFromState() {
        this.camposBDI.forEach(keyBase => {
            const inputElement = document.getElementById(`input${keyBase}`);
            const configKey = keyBase.charAt(0).toLowerCase() + keyBase.slice(1);
            if (inputElement && this.valores[configKey] !== undefined) {
                inputElement.value = formatPercentage(this.valores[configKey]);
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        });
    },
    
    updateUIFromConfig(mainConfig) {
        this.camposBDI.forEach(keyBase => {
            const configKey = keyBase.charAt(0).toLowerCase() + keyBase.slice(1);
            const inputElement = document.getElementById(`input${keyBase}`);
            if (inputElement && mainConfig[configKey] !== undefined) {
                this.valores[configKey] = parseFloat(mainConfig[configKey]); 
                inputElement.value = formatPercentage(mainConfig[configKey]); 
                if (ui.clearInputError) ui.clearInputError(inputElement);
            }
        });
        this.calcularEExibirBDI(); 
    },

    setupEventListeners() {
        this.camposBDI.forEach(keyBase => {
            const inputElement = document.getElementById(`input${keyBase}`);
            if (inputElement) {
                inputElement.addEventListener('blur', (event) => {
                    const targetInput = event.target;
                    const configKey = targetInput.id.replace('input', '').charAt(0).toLowerCase() + targetInput.id.replace('input', '').slice(1);
                    const { value, isValid } = ui.formatPercentageInputOnBlur(event, 0, 100);
                    if (isValid) {
                        this.valores[configKey] = value; 
                        configManager.setConfig(configKey, value); 
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
                    const bdiFinalInput = document.getElementById('inputBdiFinal');
                    if (bdiFinalInput && ui.clearInputError) ui.clearInputError(bdiFinalInput);

                    const bdiParaAplicar = bdiCalculadoObj.bdiPercentual;
                    if (bdiParaAplicar < 0 || bdiParaAplicar > 1000) {
                        if(bdiFinalInput && ui.showInputError) ui.showInputError(bdiFinalInput, 'BDI simulado fora do limite (0-1000%). Não aplicado.');
                        alert('O BDI simulado está fora do intervalo permitido (0% a 1000%) e não pode ser aplicado diretamente. Verifique os valores da simulação.');
                        return;
                    }
                    configManager.setConfig('bdiFinal', bdiParaAplicar);
                    if (bdiFinalInput) {
                        bdiFinalInput.value = formatPercentage(bdiParaAplicar);
                    }
                    alert(`BDI de ${formatPercentage(bdiParaAplicar)} aplicado às configurações.`);
                    if (ui.changeTab) ui.changeTab('configuracoes'); 
                    if (ui.updateAllTabs) ui.updateAllTabs();
                } else {
                    alert('Não foi possível calcular o BDI simulado. Verifique os valores e se há um Custo Direto na Calculadora.');
                }
            });
        }
    },

    getValoresSimulacao() {
        const result = {};
        this.camposBDI.forEach(keyBase => {
            const configKey = keyBase.charAt(0).toLowerCase() + keyBase.slice(1);
            result[configKey] = this.valores[configKey] !== undefined ? this.valores[configKey] : 0;
        });
        return result;
    },

    calcularBDI() {
        const { admin, risco, custoFin, tributos, lucro } = this.getValoresSimulacao();
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
            // Certifique-se que ui.calculadora está disponível e tem getTotalCustoDireto
            const custoDiretoTotal = (ui.calculadora && typeof ui.calculadora.getTotalCustoDireto === 'function') 
                                     ? ui.calculadora.getTotalCustoDireto() 
                                     : 0;
            if (custoDiretoTotal > 0) {
                const precoDeVenda = custoDiretoTotal * resultadoBDI.bdiMultiplicador;
                const lucroBrutoEstimadoVal = precoDeVenda * (this.getValoresSimulacao().lucro / 100); // Renomeado para evitar conflito
                precoVendaElement.textContent = formatCurrency(precoDeVenda);
                lucroBrutoElement.textContent = formatCurrency(lucroBrutoEstimadoVal);
            } else {
                precoVendaElement.textContent = formatCurrency(0);
                lucroBrutoElement.textContent = formatCurrency(0);
            }
        } else if (bdiResultElement) {
            bdiResultElement.textContent = 'Erro no cálculo';
            if (precoVendaElement) precoVendaElement.textContent = formatCurrency(0);
            if (lucroBrutoElement) lucroBrutoElement.textContent = formatCurrency(0);
        }
    }
};