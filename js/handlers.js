// js/handlers.js
// Módulo para registrar todos os manipuladores de eventos da aplicação.

import ui from './ui.js'; // ui pode ser necessário para chamar funções de atualização da UI
import configManager from './config.js';
import calculadora from './calculadora.js';
import simBDI from './simulacoesBDI.js';
import { saveStateToFile, loadStateFromFile, resetApplicationState } from './persistencia.js';
import { budgetDataStructure, resetBudgetDataStructure, updateGlobalDataFromConfigs } from './data.js'; // Para resetar ou interagir com dados
import { showAlert, debounce, parseCurrency } from './utils.js'; // Para feedback e otimizações

export function setupEventListeners(uiInstance, configManagerInstance, calculadoraInstance, simBDIInstance) {
    console.log("handlers.setupEventListeners() chamado");

    // --- Navegação (já configurada em ui.js, mas pode haver handlers gerais aqui) ---
    // uiInstance.tabs.forEach(tab => { ... }); // Já feito em ui.js

    // --- Aba Configurações ---
    const configForm = document.getElementById('form-configuracoes'); // ID do seu formulário
    if (configForm) {
        // Botão "Aplicar Configurações"
        const btnAplicarConfigs = configForm.querySelector('#btn-aplicar-configuracoes'); // Verifique o ID
        if (btnAplicarConfigs) {
            btnAplicarConfigs.addEventListener('click', (event) => {
                event.preventDefault();
                console.log("Botão Aplicar Configurações clicado");
                uiInstance.clearValidationFeedback(configForm); // Limpa validações antigas
                const success = configManagerInstance.handleAplicarConfiguracoes();
                if (success) {
                    uiInstance.showGlobalMessage('Configurações aplicadas com sucesso!', 'success');
                    uiInstance.updateDynamicDataDisplay(); // Atualiza relatórios e gráficos
                } else {
                    // configManager.handleAplicarConfiguracoes deve ter mostrado mensagens de erro específicas
                    uiInstance.showGlobalMessage('Erro ao aplicar configurações. Verifique os campos.', 'error');
                }
            });
        }

        // Inputs com validação ou comportamento dinâmico
        // Exemplo: Validação em tempo real (debounced)
        const inputsToValidate = configForm.querySelectorAll('input[type="text"], input[type="number"]');
        inputsToValidate.forEach(input => {
            input.addEventListener('input', debounce((event) => {
                // Aqui você pode adicionar lógica de validação específica por campo
                // e usar uiInstance.displayValidationFeedback(event.target, message, isValid);
                // Por exemplo, para campos numéricos:
                if (event.target.type === 'number' || event.target.dataset.type === 'currency') {
                    const value = parseCurrency(event.target.value);
                    if (isNaN(value) || value < 0) {
                        uiInstance.displayValidationFeedback(event.target, "Valor deve ser um número positivo.", false);
                    } else {
                        uiInstance.displayValidationFeedback(event.target, "", true); // Limpa se válido
                    }
                }
            }, 500)); // Valida 500ms após o usuário parar de digitar
        });

    } else {
        console.warn("Formulário de Configurações não encontrado.");
    }


    // --- Aba Calculadora ---
    const btnAdicionarItem = document.getElementById('btn-adicionar-composicao'); // Verifique o ID
    if (btnAdicionarItem) {
        btnAdicionarItem.addEventListener('click', () => {
            console.log("Botão Adicionar Item (Calculadora) clicado");
            const selectComposicaoEl = document.getElementById('select-composicao'); // Verifique o ID
            if (selectComposicaoEl && selectComposicaoEl.value) {
                calculadoraInstance.adicionarItem(selectComposicaoEl.value);
                // calculadora.adicionarItem já deve chamar ui.renderTable() e ui.updateTotals()
            } else {
                showAlert('Selecione uma composição para adicionar.', 'warning');
            }
        });
    }

    // Event listeners para botões de remover/alterar quantidade na tabela da calculadora
    // Usar delegação de eventos no corpo da tabela
    const tabelaOrcamentoBody = document.getElementById('tabela-orcamento-body'); // Verifique o ID
    if (tabelaOrcamentoBody) {
        tabelaOrcamentoBody.addEventListener('click', (event) => {
            const target = event.target;
            const itemId = target.closest('tr')?.dataset.itemId;

            if (!itemId) return;

            if (target.classList.contains('btn-remover-item')) { // Classe do botão de remover
                console.log(`Botão Remover Item ${itemId} clicado`);
                if (confirm('Tem certeza que deseja remover este item?')) {
                    calculadoraInstance.removerItem(itemId);
                }
            }
            // Adicionar outros handlers (ex: editar) aqui se necessário
        });

        tabelaOrcamentoBody.addEventListener('change', (event) => {
            const target = event.target;
            const itemId = target.closest('tr')?.dataset.itemId;

            if (!itemId) return;

            if (target.classList.contains('input-quantidade-item')) { // Classe do input de quantidade
                console.log(`Input Quantidade Item ${itemId} alterado para ${target.value}`);
                const novaQuantidade = parseFloat(target.value);
                if (!isNaN(novaQuantidade) && novaQuantidade >= 0) {
                    calculadoraInstance.alterarQuantidadeItem(itemId, novaQuantidade);
                } else {
                    showAlert('Quantidade inválida.', 'error');
                    // Reverter para valor antigo ou buscar de calculadoraInstance.items e setar de volta
                    const itemAtual = calculadoraInstance.items.find(it => it.id === itemId);
                    if(itemAtual) target.value = itemAtual.quantidade;
                }
            }
        });
    }

    // Barra de pesquisa na Calculadora
    const searchInputCalculadora = document.getElementById('search-input-calculadora'); // Verifique o ID
    if (searchInputCalculadora) {
        searchInputCalculadora.addEventListener('input', debounce((event) => {
            console.log(`Pesquisa na Calculadora: ${event.target.value}`);
            calculadoraInstance.filtrarItens(event.target.value);
        }, 300));
    }


    // --- Aba Simulações BDI ---
    // Os inputs da aba Simulações BDI devem ter event listeners para recalcular dinamicamente.
    // Isso pode ser gerenciado dentro de simBDI.js em seu método init,
    // ou configurado aqui se preferir centralizar.
    // Exemplo:
    const formSimulacoesBDI = document.getElementById('form-simulacoes-bdi'); // Supondo um form wrapper
    if (formSimulacoesBDI) {
        formSimulacoesBDI.addEventListener('input', debounce((event) => {
            // Apenas inputs relevantes devem disparar recálculo
            if (event.target.tagName === 'INPUT' && event.target.type !== 'button') {
                console.log(`Input alterado em Simulações BDI: ${event.target.id}`);
                // simBDIInstance.updateSomeBlock() ou simBDIInstance.updateAllBlocks()
                // Idealmente, simBDI.js tem funções que sabem o que atualizar com base no input alterado.
                // Uma chamada genérica pode ser:
                simBDIInstance.handleInputChange(event.target); // simBDI lida com a lógica
            }
        }, 250)); // Debounce para evitar recálculos excessivos
    }


    // --- Botões Globais de Persistência ---
    const btnSalvar = document.getElementById('btn-salvar-orcamento'); // Verifique o ID
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async () => {
            console.log("Botão Salvar Orçamento clicado");
            try {
                // Coletar todos os dados necessários para salvar
                const configData = configManagerInstance.getConfigData();
                const calculadoraItems = calculadoraInstance.getItems();
                const simBDIData = simBDIInstance.getSimData();
                // budgetDataStructure já é global, mas pode ser bom passar uma cópia ou garantir que está atualizado

                // Garante que budgetDataStructure reflita as últimas configs aplicadas
                updateGlobalDataFromConfigs(configData);

                const stateToSave = {
                    version: "1.0.0", // Versão da estrutura de dados, para futuras migrações
                    timestamp: new Date().toISOString(),
                    configData: configData,
                    budgetData: { ...budgetDataStructure }, // Salva uma cópia dos dados globais
                    calculadoraItems: calculadoraItems,
                    simBDIData: simBDIData
                };
                await saveStateToFile(stateToSave); // persistencia.js
                uiInstance.showGlobalMessage('Orçamento salvo com sucesso!', 'success');
            } catch (error) {
                console.error("Erro ao salvar orçamento:", error);
                uiInstance.showGlobalMessage(`Erro ao salvar orçamento: ${error.message}`, 'error');
            }
        });
    }

    const btnCarregar = document.getElementById('btn-carregar-orcamento'); // Verifique o ID
    if (btnCarregar) {
        btnCarregar.addEventListener('click', async () => {
            console.log("Botão Carregar Orçamento clicado");
            if (!confirm("Carregar um orçamento substituirá os dados atuais. Deseja continuar?")) {
                return;
            }
            try {
                const loadedState = await loadStateFromFile(); // persistencia.js
                if (loadedState) {
                    // Aplicar o estado carregado
                    if (loadedState.configData) {
                        configManagerInstance.setConfigData(loadedState.configData);
                        // É crucial atualizar data.js após carregar configData
                        updateGlobalDataFromConfigs(loadedState.configData);
                    }
                    if (loadedState.budgetData) {
                        // Cuidado ao sobrescrever budgetDataStructure. Pode ser melhor uma função de "load" em data.js
                        Object.assign(budgetDataStructure, loadedState.budgetData);
                    }
                    if (loadedState.calculadoraItems) {
                        calculadoraInstance.setItems(loadedState.calculadoraItems);
                    }
                    if (loadedState.simBDIData) {
                        simBDIInstance.setSimData(loadedState.simBDIData);
                    }

                    // Atualizar toda a UI para refletir os novos dados
                    uiInstance.refreshAll();
                    uiInstance.showGlobalMessage('Orçamento carregado com sucesso!', 'success');
                     // Navegar para uma aba relevante, ex: configurações ou calculadora
                    uiInstance.showTab('configuracoes', true);
                } else {
                    // loadStateFromFile deve ter tratado o caso de nenhum arquivo selecionado.
                    // uiInstance.showGlobalMessage('Nenhum arquivo selecionado ou arquivo inválido.', 'warning');
                }
            } catch (error) {
                console.error("Erro ao carregar orçamento:", error);
                uiInstance.showGlobalMessage(`Erro ao carregar orçamento: ${error.message}`, 'error');
            }
        });
    }

    const btnResetar = document.getElementById('btn-resetar-aplicacao'); // Verifique o ID
    if (btnResetar) {
        btnResetar.addEventListener('click', () => {
            console.log("Botão Resetar Aplicação clicado");
            if (confirm("Tem certeza que deseja resetar toda a aplicação? Todos os dados não salvos serão perdidos e as configurações voltarão ao padrão.")) {
                resetApplicationState(); // Limpa persistência (localStorage, etc.)
                resetBudgetDataStructure(); // Reseta os dados em memória (data.js)
                
                // Reinicializa os módulos para seus estados padrão
                configManagerInstance.resetToDefaults(); // Necessário implementar em config.js
                calculadoraInstance.resetToDefaults();   // Necessário implementar em calculadora.js
                simBDIInstance.resetToDefaults();      // Necessário implementar em simBDI.js
                
                // Atualiza data.js com as configurações padrão
                updateGlobalDataFromConfigs(configManagerInstance.getConfigData());

                // Atualiza toda a UI
                uiInstance.refreshAll(); // Atualiza formulários, tabelas, relatórios e gráficos
                
                uiInstance.showGlobalMessage('Aplicação resetada para os padrões.', 'info');
                uiInstance.showTab('configuracoes', true); // Volta para a aba de configurações
            }
        });
    }

    console.log("Manipuladores de eventos configurados.");
}