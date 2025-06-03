// js/handlers.js
import { ui } from './ui.js';
import { calculadora } from './calculadora.js';
import { configManager } from './config.js';
// persistencia é importada em ui.js para os botões do header,
// mas se o reset precisar explicitamente, pode ser importado aqui também.

export const handlers = {
    handleAddServico() {
        const selectServico = document.getElementById('selectServico');
        const servicoId = selectServico.value;
        if (servicoId) {
            calculadora.adicionarItem(servicoId);
            selectServico.value = "";
        } else {
            alert("Por favor, selecione um serviço para adicionar.");
        }
    },

    handleSearch() {
        const termoPesquisa = document.getElementById('inputPesquisaServico').value;
        calculadora.renderizarItens(termoPesquisa);
    },

    handleResetApplication() {
        if (confirm("Tem certeza que deseja resetar TODA a aplicação? Isso inclui configurações e itens da calculadora. Esta ação não pode ser desfeita.")) {
            try {
                // localStorage.removeItem('orcamentoConfig'); // configManager.resetToDefaults lida com a lógica de config
                // localStorage.removeItem('orcamentoItens'); // Se houver persistência de itens separados
                
                configManager.resetToDefaults();
                calculadora.resetCalculadora();
                ui.resetUI(); // resetUI deve ser abrangente
                
                alert('Aplicação resetada para os padrões.');
            } catch (error) {
                console.error("Erro ao resetar aplicação:", error);
                alert("Ocorreu um erro ao tentar resetar a aplicação.");
            }
        }
    }
};