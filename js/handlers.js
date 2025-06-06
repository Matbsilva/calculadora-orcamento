// js/handlers.js
// ... (Conteúdo completo do handlers.js que forneci na Parte 2 de 3 dos JS)
// Este arquivo já estava correto.
import { ui } from './ui.js';
import { calculadora } from './calculadora.js';
import { configManager } from './config.js';

export const handlers = {
    handleAddServico() {
        const selectServico = document.getElementById('selectServico');
        const servicoId = selectServico.value;
        if (servicoId) {
            calculadora.adicionarItem(servicoId);
            selectServico.value = "";
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
                configManager.resetToDefaults();
                calculadora.resetCalculadora();
                // Os valores da simulação BDI também devem ser resetados para os defaults em data.js
                // O ui.resetUI() chamará o populateInputsFromState do simBDI que pegará os defaults de data.js
                ui.resetUI();
                alert('Aplicação resetada para os valores padrão.');
            } catch (error) {
                console.error("Erro ao resetar aplicação:", error);
                alert("Ocorreu um erro ao tentar resetar a aplicação.");
            }
        }
    },
    // A lógica de exportação CSV precisa ser portada do seu 'exportacao.js' original
    // e integrada aqui ou em 'persistencia.js'.
    handleExportCsvConsolidated() {
        alert('Funcionalidade de Exportar CSV Consolidado (Lista de Materiais Agregados) precisa ser implementada/portada.');
    },
    handleExportCsvDetailedByService() {
        alert('Funcionalidade de Exportar CSV Detalhado por Serviço (Lista de Materiais por Serviço) precisa ser implementada/portada.');
    }
};