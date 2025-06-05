// js/handlers.js
import { ui } from './ui.js';
import { calculadora } from './calculadora.js';
import { configManager } from './config.js';
// persistencia é importada em ui.js para os botões do header de Salvar/Carregar Orçamento
// A lógica de exportação CSV específica precisaria ser portada do seu 'exportacao.js'
// para 'persistencia.js' ou um novo módulo e chamada aqui.
// Por enquanto, os botões CSV apenas alertarão.

export const handlers = {
    handleAddServico() {
        const selectServico = document.getElementById('selectServico');
        const servicoId = selectServico.value; // O valor será refComposition
        if (servicoId) {
            calculadora.adicionarItem(servicoId);
            selectServico.value = ""; // Limpa o select
        } else {
            alert("Por favor, selecione uma composição para adicionar.");
        }
    },

    handleSearch() {
        const termoPesquisa = document.getElementById('inputPesquisaServico').value;
        calculadora.renderizarItens(termoPesquisa);
    },

    handleResetApplication() {
        if (confirm("Tem certeza que deseja resetar TODA a aplicação? Isso inclui configurações e itens da calculadora. Esta ação não pode ser desfeita.")) {
            try {
                // localStorage.removeItem('orcamentoConfig'); // persistencia.loadBudget (se chamado sem arquivo) ou configManager.resetToDefaults cuida disso.
                configManager.resetToDefaults(); // Reseta os valores em data.js para os iniciais
                calculadora.resetCalculadora();  // Zera quantidades em data.js e renderiza
                
                if (ui.simulacoesBDI && ui.simulacoesBDI.populateInputsFromState) { // Reseta inputs da simulação BDI
                     // Os valores padrão de simValues já estão definidos em simulacoesBDI.js
                     // Para um reset completo, poderíamos ter uma função resetSimValues em simulacoesBDI
                     // ou apenas chamar populateInputsFromState que pegará os defaults se nada foi carregado.
                     // Por agora, resetToDefaults no configManager já deve resetar os % de BDI em data.js,
                     // e simulacoesBDI.init ou populateInputsFromState deve refletir isso.
                     // Se persistencia.loadBudget for chamado com dados vazios (após um reset de localStorage),
                     // ele também chamará os setters com os valores default de data.js
                }
                
                ui.resetUI(); // Atualiza todas as UIs
                
                alert('Aplicação resetada para os valores padrão.');
            } catch (error) {
                console.error("Erro ao resetar aplicação:", error);
                alert("Ocorreu um erro ao tentar resetar a aplicação.");
            }
        }
    },

    // Seu main.js antigo tinha botões para processar relatórios,
    // mas agora a ideia é que eles atualizem ao mudar de aba.
    // Se você quiser botões explícitos, podemos adicioná-los e ligá-los aqui.
    // Ex:
    // handleProcessSummary() { ui.changeTab('resumo'); },
    // handleProcessAbcCurve() { ui.changeTab('curva-abc'); },
    // handleProcessSchedule() { ui.changeTab('cronograma'); },

    // A lógica de exportação CSV precisa ser portada do seu 'exportacao.js'
    handleExportCsvConsolidated() {
        alert('Funcionalidade de Exportar CSV Consolidado (Lista de Materiais Agregados) ainda precisa ser portada da sua versão anterior.');
        // Exemplo: persistencia.exportarListaMateriaisAgregadosCSV();
    },
    handleExportCsvDetailedByService() {
        alert('Funcionalidade de Exportar CSV Detalhado por Serviço (Lista de Materiais por Serviço) ainda precisa ser portada da sua versão anterior.');
        // Exemplo: persistencia.exportarListaMateriaisPorServicoCSV();
    }
};