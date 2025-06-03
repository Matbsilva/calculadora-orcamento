// js/handlers.js
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
                localStorage.removeItem('orcamentoConfig'); 
                // Se você salvava itens da calculadora no localStorage separadamente, limpe aqui também.
                // localStorage.removeItem('orcamentoItens'); 
                configManager.resetToDefaults();
                calculadora.resetCalculadora();
                ui.resetUI();
                alert('Aplicação resetada para os padrões.');
            } catch (error) {
                console.error("Erro ao resetar aplicação:", error);
                alert("Ocorreu um erro ao tentar resetar a aplicação.");
            }
        }
    }
};