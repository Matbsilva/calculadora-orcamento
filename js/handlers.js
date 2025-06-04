// js/handlers.js
import { ui } from './ui.js';
import { calculadora } from './calculadora.js';
import { configManager } from './config.js'; // Usado para resetar defaults em data.js
import { persistencia } from './persistencia.js'; // Para save/load de orçamento global
// Funções de exportação CSV que estavam no seu exportacao.js precisam ser chamadas/recriadas aqui ou em persistencia.js
// Para o momento, vou focar nos handlers principais. A lógica de exportação CSV
// precisaria ser portada do seu exportacao.js original para persistencia.js ou um novo modulo.

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
                // Não há localStorage direto aqui, pois configManager e persistencia lidam com isso
                // A ideia é que o reset coloque os estados em data.js nos seus valores iniciais
                // e a UI reflita isso.
                
                configManager.resetToDefaults(); // Isso deve resetar os valores em data.js para os iniciais
                calculadora.resetCalculadora();  // Isso deve zerar as quantidades em data.js e renderizar
                
                // ui.resetUI() deve ser chamado para atualizar todas as UIs, incluindo
                // a remoção de itens da tabela da calculadora e atualização dos campos de config
                ui.resetUI(); 
                
                alert('Aplicação resetada para os valores padrão.');
            } catch (error) {
                console.error("Erro ao resetar aplicação:", error);
                alert("Ocorreu um erro ao tentar resetar a aplicação.");
            }
        }
    },

    // Handlers para os botões de "Processar" das abas de relatório.
    // Eles basicamente apenas mudam para a aba e a UI se encarrega de atualizar o conteúdo.
    handleProcessSummary() {
        ui.changeTab('resumo');
    },
    handleProcessAbcCurve() {
        ui.changeTab('curva-abc');
    },
    handleProcessSchedule() {
        ui.changeTab('cronograma');
    },

    // Handlers para exportação CSV - Precisam da lógica do seu exportacao.js
    handleExportCsvConsolidated() {
        alert('Funcionalidade de Exportar CSV Consolidado a ser implementada/portada.');
        // Aqui iria a chamada para uma função em persistencia.js (ou um novo modulo de exportacao)
        // que usa getCurrentAggregatedMaterials() do seu data.js
        // Ex: persistencia.exportMaterialsToCSV(false, getCurrentAggregatedMaterials());
    },
    handleExportCsvDetailedByService() {
        alert('Funcionalidade de Exportar CSV Detalhado por Serviço a ser implementada/portada.');
        // Ex: persistencia.exportMaterialsByServiceToCSV(getBudgetData(), getMaterialPrices(), getMateriaisBase());
    }

    // Outros handlers como toggleModoCotação do seu main.js original
    // podem ser adicionados aqui ou diretamente em ui.js se forem muito específicos da UI.
};