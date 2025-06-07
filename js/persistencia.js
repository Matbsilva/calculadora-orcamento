// js/persistencia.js
// Módulo para gerenciar o salvamento e carregamento do estado da aplicação.

import { showAlert } from './utils.js'; // Para feedback ao usuário

const LOCAL_STORAGE_KEY = 'calculadoraOrcamentoState';

// Salva o estado atual no LocalStorage (para persistência entre sessões)
// Esta função não foi explicitamente mencionada no "Problema/Solicitação Atual",
// mas é comum ter para guardar pequenas coisas ou o último estado.
export function saveStateToLocalStorage(state) {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
        console.log("Estado salvo no LocalStorage.");
    } catch (error) {
        console.error("Erro ao salvar estado no LocalStorage:", error);
        showAlert("Erro ao tentar salvar o progresso automaticamente.", "error");
    }
}

// Carrega o estado do LocalStorage
export function loadStateFromLocalStorage() {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            console.log("Nenhum estado salvo encontrado no LocalStorage.");
            return undefined; // Ou um estado padrão inicial
        }
        console.log("Estado carregado do LocalStorage.");
        return JSON.parse(serializedState);
    } catch (error) {
        console.error("Erro ao carregar estado do LocalStorage:", error);
        showAlert("Erro ao tentar carregar progresso salvo anteriormente.", "error");
        return undefined; // Ou um estado padrão inicial
    }
}

// Funcionalidade "Salvar Orçamento" para arquivo JSON
export function saveStateToFile(state) {
    console.log("persistencia.saveStateToFile() chamado com estado:", state);
    try {
        const filename = `orcamento_calculadora_${new Date().toISOString().slice(0,10)}.json`;
        const jsonStr = JSON.stringify(state, null, 2); // null, 2 para formatação identada
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`Orçamento salvo como ${filename}`);
        showAlert(`Orçamento salvo como ${filename}`, 'success');
    } catch (error) {
        console.error("Erro ao salvar orçamento para arquivo:", error);
        showAlert("Erro ao salvar orçamento para arquivo.", "error");
    }
}

// Funcionalidade "Carregar Orçamento" de arquivo JSON
export function loadStateFromFile() {
    console.log("persistencia.loadStateFromFile() chamado");
    return new Promise((resolve, reject) => {
        const inputFile = document.createElement('input');
        inputFile.type = 'file';
        inputFile.accept = '.json,application/json';

        inputFile.onchange = event => {
            const file = event.target.files[0];
            if (!file) {
                console.log("Nenhum arquivo selecionado.");
                showAlert("Nenhum arquivo selecionado.", "info");
                resolve(null); // Resolve com null se nenhum arquivo for escolhido
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const state = JSON.parse(e.target.result);
                    console.log("Orçamento carregado do arquivo:", state);
                    showAlert("Orçamento carregado com sucesso!", "success");
                    resolve(state);
                } catch (error) {
                    console.error("Erro ao parsear arquivo JSON do orçamento:", error);
                    showAlert("Erro ao ler o arquivo de orçamento. Verifique se o formato é JSON válido.", "error");
                    reject(error);
                }
            };
            reader.onerror = (error) => {
                console.error("Erro ao ler arquivo:", error);
                showAlert("Ocorreu um erro ao tentar ler o arquivo.", "error");
                reject(error);
            };
            reader.readAsText(file);
        };
        // Simula um clique no input file para abrir o diálogo de seleção de arquivo
        inputFile.click();
    });
}


// Funcionalidade "Resetar Aplicação"
// Limpa o LocalStorage e sinaliza para os módulos resetarem seus estados.
// O reset efetivo dos dados em memória (data.js, calculadora.js, etc.)
// é feito pelos próprios módulos ou coordenado por handlers.js/main.js.
export function resetApplicationState() {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        // Você poderia também limpar sessionStorage ou cookies se os usar.
        console.log("Estado do LocalStorage resetado.");
        // showAlert("Dados locais da aplicação foram resetados.", "info"); // A mensagem de reset geral é dada pelo handler
    } catch (error) {
        console.error("Erro ao resetar estado do LocalStorage:", error);
        showAlert("Erro ao tentar resetar os dados locais da aplicação.", "error");
    }
}