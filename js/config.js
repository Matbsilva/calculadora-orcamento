// js/config.js
import { parseCurrency, formatCurrency, parsePercentage, formatPercentage } from './utils.js';
import { ui } from './ui.js'; 

export const configManager = {
    config: {
        // Valores padrão iniciais
        custoPedreiro: 150.00,
        custoServente: 100.00,
        custoEncarregado: 200.00,
        precoCimento: 28.00,
        precoAreia: 120.00,
        precoBrita: 100.00,
        precoTijolo: 700.00,
        precoAco: 7.50,
        precoMadeira: 2500.00,
        bdiFinal: 25.0,
        areaObra: 100,
        // Incluir chaves para os campos de simulação de BDI para consistência no reset/load
        admin: 10.0, 
        risco: 5.0, 
        custoFin: 1.0, 
        tributos: 5.0, 
        lucro: 15.0, 
        percentMoBdi: 40.0 
    },

    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.updateUI();
    },

    setConfig(key, value) {
        this.config[key] = value;
        if (key === 'bdiFinal' || key === 'areaObra') {
            if (ui.updateAllTabs) ui.updateAllTabs(); 
        }
        // Se um campo de simulação de BDI for alterado aqui, refletir na aba Simulações BDI
        if (ui.simulacoesBDI && ui.simulacoesBDI.camposBDI && ui.simulacoesBDI.camposBDI.map(k => k.toLowerCase()).includes(key.toLowerCase())) {
             if (ui.simulacoesBDI.updateUIFromConfig) ui.simulacoesBDI.updateUIFromConfig(this.config);
        }
    },

    getConfig(key) {
        if (key) return this.config[key];
        return { ...this.config };
    },

    saveConfig() {
        try {
            localStorage.setItem('orcamentoConfig', JSON.stringify(this.config));
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            alert('Erro ao salvar configurações. Verifique o console para mais detalhes.');
        }
    },

    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('orcamentoConfig');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsedConfig }; 
            }
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        }
    },
    
    resetToDefaults() {
        this.config = {
            custoPedreiro: 150.00, custoServente: 100.00, custoEncarregado: 200.00,
            precoCimento: 28.00, precoAreia: 120.00, precoBrita: 100.00,
            precoTijolo: 700.00, precoAco: 7.50, precoMadeira: 2500.00,
            bdiFinal: 25.0, areaObra: 100,
            admin: 10.0, risco: 5.0, custoFin: 1.0, tributos: 5.0, lucro: 15.0, percentMoBdi: 40.0
        };
        this.updateUI(); 
        if (ui.simulacoesBDI && ui.simulacoesBDI.updateUIFromConfig) {
            ui.simulacoesBDI.updateUIFromConfig(this.config);
        }
        if (ui.updateAllTabs) ui.updateAllTabs(); 
    },

    updateUI() {
        const fieldsToUpdate = {
            'inputCustoPedreiro': formatCurrency(this.config.custoPedreiro),
            'inputCustoServente': formatCurrency(this.config.custoServente),
            'inputCustoEncarregado': formatCurrency(this.config.custoEncarregado),
            'inputPrecoCimento': formatCurrency(this.config.precoCimento),
            'inputPrecoAreia': formatCurrency(this.config.precoAreia),
            'inputPrecoBrita': formatCurrency(this.config.precoBrita),
            'inputPrecoTijolo': formatCurrency(this.config.precoTijolo),
            'inputPrecoAco': formatCurrency(this.config.precoAco),
            'inputPrecoMadeira': formatCurrency(this.config.precoMadeira),
            'inputBdiFinal': formatPercentage(this.config.bdiFinal),
            'inputAreaObra': `${this.config.areaObra} m²`
        };

        for (const id in fieldsToUpdate) {
            const element = document.getElementById(id);
            if (element) {
                element.value = fieldsToUpdate[id];
                if (ui.clearInputError) ui.clearInputError(element); // Limpa erros ao recarregar
            }
        }
    },

    setupEventListeners() {
        const configFieldsCurrency = [
            'inputCustoPedreiro', 'inputCustoServente', 'inputCustoEncarregado',
            'inputPrecoCimento', 'inputPrecoAreia', 'inputPrecoBrita',
            'inputPrecoTijolo', 'inputPrecoAco', 'inputPrecoMadeira'
        ];

        configFieldsCurrency.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('blur', (event) => {
                    const { value, isValid } = ui.formatCurrencyInputOnBlur(event);
                    if (isValid) {
                        const configKey = id.replace('input', '').charAt(0).toLowerCase() + id.replace('input', '').slice(1);
                        this.setConfig(configKey, value);
                        if (ui.calculadora && ui.calculadora.recalcularTodosOsCustos) ui.calculadora.recalcularTodosOsCustos();
                        if (ui.updateAllTabs) ui.updateAllTabs();
                    }
                });
                input.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(input); }); 
            }
        });

        const inputBdiFinal = document.getElementById('inputBdiFinal');
        if (inputBdiFinal) {
            inputBdiFinal.addEventListener('blur', (event) => {
                const { value, isValid } = ui.formatPercentageInputOnBlur(event, 0, 1000);
                if (isValid) {
                    this.setConfig('bdiFinal', value);
                    if (ui.updateAllTabs) ui.updateAllTabs();
                }
            });
            inputBdiFinal.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(inputBdiFinal); }); 
        }
        
        // Event listener para inputAreaObra está em ui.js

        const btnSalvar = document.getElementById('btnSalvarConfig');
        if (btnSalvar) btnSalvar.addEventListener('click', () => this.saveConfig());
        
        const btnCarregarPadrao = document.getElementById('btnCarregarConfigPadrao');
        if (btnCarregarPadrao) {
            btnCarregarPadrao.addEventListener('click', () => {
                if (confirm('Deseja carregar as configurações padrão? As alterações não salvas serão perdidas.')) {
                    this.resetToDefaults();
                    alert('Configurações padrão carregadas.');
                }
            });
        }
    }
};