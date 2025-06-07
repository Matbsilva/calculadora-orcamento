// js/simulacoesBDI.js
// Módulo para gerenciar a aba de Simulações BDI.

import { budgetDataStructure } from './data.js'; // Para obter totais de custo da calculadora, se necessário, e salvar dados da simulação
import ui from './ui.js'; // Para interagir com a UI, se necessário (ex: mostrar mensagens)
import { formatCurrency, parseCurrency } from './utils.js'; // Para formatação e parsing

const simBDI = {
    // Referências aos elementos do DOM da aba Simulações BDI
    // Estes devem ser cacheados no init. Os IDs são exemplos.
    form: null,

    // Bloco 1: Custo da Mão de Obra e Encargos
    inputMODiretaOrcamento: null, // Custo Total de M.O. (vem da Calculadora)
    inputPercentEncargosSociaisBasicos: null,
    inputPercentEncargosSociaisIncidentes: null,
    inputPercentEncargosComplementares: null,
    outputValorEncargosSociaisBasicos: null,
    outputValorEncargosSociaisIncidentes: null,
    outputValorEncargosComplementares: null,
    outputTotalMaoObraEncargos: null,

    // Bloco 2: Custo Indireto da Obra (Administração Local)
    // ... (adicione inputs e outputs para este bloco conforme sua estrutura)
    // Ex: inputAluguelEquipamentos, inputMobilizacao, etc.
    // outputTotalCustoIndireto: null,

    // Bloco 3: Simulação do BDI (Bonificações e Despesas Indiretas)
    // ... (adicione inputs e outputs)
    // Ex: inputPercentAdministracaoCentral, inputPercentRiscos, inputPercentSeguros, etc.
    // inputPercentLucroPrevisto, inputPercentImpostosFederais, inputPercentImpostoMunicipal
    // outputBDIProposto: null,

    // Bloco 4: Ajustes de Faturamento
    inputPercentFaturamentoMO: null,
    inputPercentFaturamentoMaterial: null,
    // ... (outros inputs e outputs, como preços de venda, faturamento líquido, etc.)

    // Estado interno dos dados da simulação BDI
    // (pode ser espelhado/sincronizado com budgetDataStructure.simulacoesBDIData)
    simData: {
        // Valores padrão, conforme o prompt ou sua versão anterior
        // Bloco 1
        custoMODiretoCalculadora: 0, // Preenchido a partir dos totais da calculadora
        percentEncargosSociaisBasicos: 80.00,
        percentEncargosSociaisIncidentes: 40.00,
        percentEncargosComplementares: 10.00,
        // ... outros campos com seus valores padrão
        
        // Bloco 4
        percentFaturamentoMO: 50.00,
        percentFaturamentoMaterial: 50.00, // Inicialmente igual, mas pode ser ajustado
    },

    uiInstance: null,

    init(uiRef) {
        console.log("simBDI.init() chamado");
        this.uiInstance = uiRef;
        this.cacheDOMElements();

        if (!this.form) {
            console.warn("Formulário da aba Simulações BDI não encontrado. Verifique o ID.");
            return;
        }
        
        // Carregar dados padrão ou salvos nos campos do formulário
        this.loadAndPopulate();
        
        // Configurar event listeners específicos para esta aba (se não centralizados em handlers.js)
        // O prompt sugere que handlers.js pode chamar handleInputChange deste módulo.
        // this.setupInternalEventListeners(); // Se houver lógica de listeners aqui

        this.updateAllBlocks(); // Calcula e exibe todos os valores iniciais
        console.log("simBDI.init() concluído");
    },

    cacheDOMElements() {
        console.log("simBDI.cacheDOMElements()");
        this.form = document.getElementById('form-simulacoes-bdi'); // Confirme o ID do form wrapper
        if (!this.form) return;

        // Bloco 1 - Exemplo de IDs (VERIFIQUE E AJUSTE CONFORME SEU HTML)
        this.inputMODiretaOrcamento = this.form.querySelector('#sim-bdi-mo-direta-orcamento');
        this.inputPercentEncargosSociaisBasicos = this.form.querySelector('#sim-bdi-enc-sociais-basicos-percent');
        this.inputPercentEncargosSociaisIncidentes = this.form.querySelector('#sim-bdi-enc-sociais-incidentes-percent');
        this.inputPercentEncargosComplementares = this.form.querySelector('#sim-bdi-enc-complementares-percent');
        this.outputValorEncargosSociaisBasicos = this.form.querySelector('#sim-bdi-enc-sociais-basicos-valor');
        this.outputValorEncargosSociaisIncidentes = this.form.querySelector('#sim-bdi-enc-sociais-incidentes-valor');
        this.outputValorEncargosComplementares = this.form.querySelector('#sim-bdi-enc-complementares-valor');
        this.outputTotalMaoObraEncargos = this.form.querySelector('#sim-bdi-total-mo-encargos');

        // Bloco 4 - Exemplo
        this.inputPercentFaturamentoMO = this.form.querySelector('#sim-bdi-faturamento-mo-percent');
        this.inputPercentFaturamentoMaterial = this.form.querySelector('#sim-bdi-faturamento-material-percent');

        // ... Cachear TODOS os inputs e outputs relevantes dos 4 blocos.
        // É crucial que os IDs aqui correspondam exatamente ao seu HTML.
    },

    loadAndPopulate() {
        console.log("simBDI.loadAndPopulate()");
        // Se main.js chamou setSimData(loadedState.simBDIData), this.simData estará atualizado.
        // Caso contrário, this.simData terá os padrões definidos acima.
        // Agora, popule os campos do formulário com this.simData.
        
        // Atualiza o Custo de M.O. Direta vindo da calculadora
        // Este valor é dinâmico e deve ser atualizado sempre que a calculadora mudar.
        if (budgetDataStructure.dadosRelatorios && budgetDataStructure.dadosRelatorios.resumoCustos) {
            this.simData.custoMODiretoCalculadora = budgetDataStructure.dadosRelatorios.resumoCustos.moTotal || 0;
        }
        if (this.inputMODiretaOrcamento) {
            this.inputMODiretaOrcamento.value = formatCurrency(this.simData.custoMODiretaCalculadora);
            // Este campo é geralmente um display, não um input editável pelo usuário aqui.
        }

        // Popular outros campos do Bloco 1
        if (this.inputPercentEncargosSociaisBasicos) this.inputPercentEncargosSociaisBasicos.value = formatCurrency(this.simData.percentEncargosSociaisBasicos, 2, false, false);
        if (this.inputPercentEncargosSociaisIncidentes) this.inputPercentEncargosSociaisIncidentes.value = formatCurrency(this.simData.percentEncargosSociaisIncidentes, 2, false, false);
        if (this.inputPercentEncargosComplementares) this.inputPercentEncargosComplementares.value = formatCurrency(this.simData.percentEncargosComplementares, 2, false, false);

        // Popular campos do Bloco 4
        if (this.inputPercentFaturamentoMO) this.inputPercentFaturamentoMO.value = formatCurrency(this.simData.percentFaturamentoMO, 2, false, false);
        if (this.inputPercentFaturamentoMaterial) this.inputPercentFaturamentoMaterial.value = formatCurrency(this.simData.percentFaturamentoMaterial, 2, false, false);

        // ... Popular TODOS os campos de input dos 4 blocos com os valores de this.simData.
        console.log("Formulário de Simulações BDI populado.");
    },
    
    // Chamado por handlers.js quando um input na aba Simulações BDI muda
    handleInputChange(inputElement) {
        if (!inputElement || !inputElement.id) return;
        console.log(`simBDI.handleInputChange para: ${inputElement.id}`);

        // Atualizar o valor correspondente em this.simData
        const fieldId = inputElement.id; // O ID do input deve mapear para uma chave em this.simData
                                      // (ex: 'sim-bdi-enc-sociais-basicos-percent' -> 'percentEncargosSociaisBasicos')
                                      // É preciso um mapeamento ou nomes de chaves consistentes.
                                      // Por simplicidade, vamos assumir que podemos derivar a chave ou usar um switch/map.

        // Exemplo de como atualizar this.simData (simplificado, requer mapeamento robusto ID -> chave simData)
        const value = parseCurrency(inputElement.value);
        if (isNaN(value)) {
            // this.uiInstance.displayValidationFeedback(inputElement, "Valor inválido.", false); // Se houver validação aqui
            return; // Não prosseguir com valor inválido
        }

        // Mapeamento (exemplo, precisará ser expandido para todos os campos)
        const keyMap = {
            'sim-bdi-enc-sociais-basicos-percent': 'percentEncargosSociaisBasicos',
            'sim-bdi-enc-sociais-incidentes-percent': 'percentEncargosSociaisIncidentes',
            'sim-bdi-enc-complementares-percent': 'percentEncargosComplementares',
            'sim-bdi-faturamento-mo-percent': 'percentFaturamentoMO',
            'sim-bdi-faturamento-material-percent': 'percentFaturamentoMaterial',
            // Adicione todos os seus inputs aqui
        };
        const simDataKey = keyMap[fieldId];
        if (simDataKey) {
            this.simData[simDataKey] = value;
        } else {
            console.warn(`Nenhuma chave em simData mapeada para o input ID: ${fieldId}`);
        }
        
        // Lógica específica para "% Faturamento como Material" baseado no "% Faturamento como M.O."
        if (fieldId === this.inputPercentFaturamentoMO?.id) {
            if (value >= 0 && value <= 100) {
                this.simData.percentFaturamentoMaterial = 100 - value;
                if (this.inputPercentFaturamentoMaterial) { // Atualiza o campo no DOM
                    this.inputPercentFaturamentoMaterial.value = formatCurrency(this.simData.percentFaturamentoMaterial, 2, false, false);
                }
            }
        }
        // (Opcional) Lógica inversa se o usuário editar diretamente o % Material:
        // else if (fieldId === this.inputPercentFaturamentoMaterial?.id) {
        //     if (value >= 0 && value <= 100) {
        //         this.simData.percentFaturamentoMO = 100 - value;
        //         if (this.inputPercentFaturamentoMO) {
        //             this.inputPercentFaturamentoMO.value = formatCurrency(this.simData.percentFaturamentoMO, 2, false, false);
        //         }
        //     }
        // }

        // Recalcular e atualizar todos os blocos
        this.updateAllBlocks();
        // Sincronizar com budgetDataStructure.simulacoesBDIData
        Object.assign(budgetDataStructure.simulacoesBDIData, this.simData);
    },

    updateAllBlocks() {
        console.log("simBDI.updateAllBlocks()");
        
        // Atualiza o Custo de M.O. Direta vindo da calculadora, caso tenha mudado
        if (budgetDataStructure.dadosRelatorios && budgetDataStructure.dadosRelatorios.resumoCustos) {
            this.simData.custoMODiretoCalculadora = budgetDataStructure.dadosRelatorios.resumoCustos.moTotal || 0;
        }
        if (this.inputMODiretaOrcamento) { // Atualiza o campo no DOM
            this.inputMODiretaOrcamento.value = formatCurrency(this.simData.custoMODiretaCalculadora);
        }

        // --- Bloco 1: Custo da Mão de Obra e Encargos ---
        let custoMODireto = this.simData.custoMODiretoCalculadora;
        let valEncSociaisBasicos = custoMODireto * (this.simData.percentEncargosSociaisBasicos / 100);
        let valEncSociaisIncidentes = custoMODireto * (this.simData.percentEncargosSociaisIncidentes / 100);
        let valEncComplementares = custoMODireto * (this.simData.percentEncargosComplementares / 100);
        let totalMOEncargos = custoMODireto + valEncSociaisBasicos + valEncSociaisIncidentes + valEncComplementares;

        if (this.outputValorEncargosSociaisBasicos) this.outputValorEncargosSociaisBasicos.textContent = formatCurrency(valEncSociaisBasicos);
        if (this.outputValorEncargosSociaisIncidentes) this.outputValorEncargosSociaisIncidentes.textContent = formatCurrency(valEncSociaisIncidentes);
        if (this.outputValorEncargosComplementares) this.outputValorEncargosComplementares.textContent = formatCurrency(valEncComplementares);
        if (this.outputTotalMaoObraEncargos) this.outputTotalMaoObraEncargos.textContent = formatCurrency(totalMOEncargos);

        // Armazenar resultados calculados em this.simData se forem usados em outros blocos
        this.simData.valorEncargosSociaisBasicos = valEncSociaisBasicos;
        this.simData.valorEncargosSociaisIncidentes = valEncSociaisIncidentes;
        this.simData.valorEncargosComplementares = valEncComplementares;
        this.simData.totalMaoObraEncargos = totalMOEncargos;

        // --- Bloco 2: Custo Indireto da Obra (Administração Local) ---
        // Implementar cálculos e atualizações do DOM para este bloco...
        // Ex: let totalCustoIndireto = ... ;
        // if (this.outputTotalCustoIndireto) this.outputTotalCustoIndireto.textContent = formatCurrency(totalCustoIndireto);
        // this.simData.totalCustoIndireto = totalCustoIndireto;


        // --- Bloco 3: Simulação do BDI ---
        // Implementar cálculos e atualizações do DOM para este bloco...
        // Ex: let bdiProposto = ... ;
        // if (this.outputBDIProposto) this.outputBDIProposto.textContent = formatCurrency(bdiProposto, 2) + "%";
        // this.simData.bdiProposto = bdiProposto;

        // --- Bloco 4: Ajustes de Faturamento ---
        // Implementar cálculos e atualizações do DOM para este bloco...
        // Ex: let precoVendaTotal = (Custo Direto Total + Custo Indireto Total) / (1 - (BDI / 100))
        // if (this.outputPrecoVendaTotal) this.outputPrecoVendaTotal.textContent = formatCurrency(precoVendaTotal);
        // this.simData.precoVendaTotalSimulado = precoVendaTotal;

        // Sincronizar com budgetDataStructure.simulacoesBDIData ao final
        Object.assign(budgetDataStructure.simulacoesBDIData, this.simData);
        console.log("Blocos de Simulações BDI atualizados. simData:", JSON.parse(JSON.stringify(this.simData)));
    },

    // Para carregar dados de um estado salvo
    setSimData(loadedSimData) {
        console.log("simBDI.setSimData() com:", loadedSimData);
        if (loadedSimData) {
            this.simData = { ...this.simData, ...loadedSimData }; // Mescla, priorizando loadedSimData
            this.loadAndPopulate(); // Repopula o formulário com os novos dados
            this.updateAllBlocks(); // Recalcula tudo
        }
    },

    getSimData() {
        // Garante que os valores mais recentes dos inputs (se não houver "aplicar") estejam em simData
        // Se os inputs atualizam simData em 'input', então simData já está atual.
        return { ...this.simData }; // Retorna uma cópia
    },

    resetToDefaults() {
        console.log("simBDI.resetToDefaults()");
        // Redefine this.simData para os padrões originais
        this.simData = {
            custoMODiretoCalculadora: 0, // Será atualizado de budgetDataStructure
            percentEncargosSociaisBasicos: 80.00,
            percentEncargosSociaisIncidentes: 40.00,
            percentEncargosComplementares: 10.00,
            // ... outros campos com seus valores padrão
            percentFaturamentoMO: 50.00,
            percentFaturamentoMaterial: 50.00,
        };
        // Atualiza o custo de M.O. da calculadora (que pode ter sido resetada também)
        if (budgetDataStructure.dadosRelatorios && budgetDataStructure.dadosRelatorios.resumoCustos) {
             this.simData.custoMODiretoCalculadora = budgetDataStructure.dadosRelatorios.resumoCustos.moTotal || 0;
        }

        this.loadAndPopulate(); // Repopula o formulário
        this.updateAllBlocks(); // Recalcula
        Object.assign(budgetDataStructure.simulacoesBDIData, this.simData); // Sincroniza com data.js
    }
};

export default simBDI;