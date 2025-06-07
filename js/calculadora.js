// js/calculadora.js
// Módulo para gerenciar a aba Calculadora (tabela de orçamento).

import { getComposicoesList, getComposicaoById, budgetDataStructure } from './data.js';
import configManager from './config.js'; // Para obter o BDI Final
import ui from './ui.js'; // Para atualizar a tabela e totais na UI
import { formatCurrency, parseCurrency, generateUUID } from './utils.js'; // Para formatação e IDs únicos

const calculadora = {
    items: [], // Array para armazenar os itens adicionados à calculadora
               // { idUnico, composicaoId, descricao, um, qtde, ..., todos os 14 campos }
    
    uiInstance: null, // Referência à instância de ui.js
    selectComposicaoElement: null,
    tableBodyElement: null,
    tableFooterElement: null,
    searchInput: null,

    init(uiRef) {
        console.log("calculadora.init() chamado");
        this.uiInstance = uiRef;

        // Cache de elementos DOM específicos da Calculadora
        this.selectComposicaoElement = document.getElementById('select-composicao'); // Confirme ID
        this.tableBodyElement = document.getElementById('tabela-orcamento-body');    // Confirme ID
        this.tableFooterElement = document.getElementById('tabela-orcamento-footer'); // Confirme ID
        this.searchInput = document.getElementById('search-input-calculadora');   // Confirme ID

        if (!this.selectComposicaoElement || !this.tableBodyElement || !this.tableFooterElement) {
            console.error("Elementos da Calculadora (select, table body/footer) não encontrados. Verifique os IDs.");
            return;
        }

        this.populateComposicoesDropdown();
        this.renderTable(); // Renderiza a tabela vazia ou com itens carregados
        this.updateTotals();

        // Event listeners específicos (ex: pesquisa) podem ser adicionados aqui
        // ou em handlers.js. Se em handlers.js, ele chamaria métodos deste módulo.
        if (this.searchInput) {
            // O handler para pesquisa já está configurado em handlers.js e chama this.filtrarItens()
        }
        console.log("calculadora.init() concluído");
    },

    populateComposicoesDropdown() {
        console.log("calculadora.populateComposicoesDropdown()");
        if (!this.selectComposicaoElement) return;

        const composicoes = getComposicoesList(); // Pega de data.js
        this.selectComposicaoElement.innerHTML = '<option value="">Selecione um Serviço/Composição...</option>'; // Opção padrão

        if (composicoes && composicoes.length > 0) {
            composicoes.forEach(comp => {
                // As composições em data.js já devem ter custos unitários recalculados por data.recalculateAllComposicoesCustos()
                const option = document.createElement('option');
                option.value = comp.id; // ou comp.ref, dependendo do que você usa como ID
                option.textContent = `${comp.ref} - ${comp.descricao} (${comp.unidade})`;
                this.selectComposicaoElement.appendChild(option);
            });
        } else {
            console.warn("Nenhuma composição de serviço encontrada em data.js para popular o dropdown.");
        }
    },

    adicionarItem(composicaoId) {
        console.log(`calculadora.adicionarItem('${composicaoId}')`);
        const composicaoBase = getComposicaoById(composicaoId); // Pega de data.js
        if (!composicaoBase) {
            console.error(`Composição com ID ${composicaoId} não encontrada.`);
            this.uiInstance.showGlobalMessage(`Erro: Serviço com ID ${composicaoId} não encontrado.`, 'error');
            return;
        }

        // Verificar se o item já existe (opcional, poderia apenas adicionar outro)
        // const itemExistente = this.items.find(item => item.composicaoId === composicaoId);
        // if (itemExistente) {
        //     this.uiInstance.showGlobalMessage('Este serviço já foi adicionado. Altere a quantidade se necessário.', 'warning');
        //     // Aumentar quantidade? Ou permitir duplicados? O prompt sugere permitir adicionar.
        //     // itemExistente.quantidade += 1;
        //     // this.recalculateItem(itemExistente.idUnico);
        //     // return;
        // }

        const bdiAdotadoPercent = configManager.getConfigData().bdiFinal || 0;

        const novoItem = {
            idUnico: generateUUID(), // ID único para este item na tabela
            composicaoId: composicaoBase.id,
            itemNumero: this.items.length + 1, // Número sequencial do item
            ref: composicaoBase.ref,
            descricao: composicaoBase.descricao,
            unidade: composicaoBase.unidade,
            quantidade: 1, // Quantidade padrão inicial
            
            // Custos Unitários (baseados na composição, já calculados em data.js)
            custoUnitMaterial: composicaoBase.custoUnitarioMaterial || 0,
            custoUnitMO: composicaoBase.custoUnitarioMO || 0,
            custoUnitarioItem: (composicaoBase.custoUnitarioMaterial || 0) + (composicaoBase.custoUnitarioMO || 0),
            
            // Preço de Venda Unitário com BDI
            precoVendaUnitarioItemBDI: 0, // Será calculado abaixo

            // Valores Totais (inicialmente para quantidade 1)
            custoTotalMaterial: 0,
            custoTotalMO: 0,
            custoTotalItem: 0,
            precoVendaTotalItemBDI: 0,

            // HH Totais (baseados na composição)
            hhProfTotalComposicao: composicaoBase.hhProfTotal || 0, // HH por unidade da composição
            hhAjudTotalComposicao: composicaoBase.hhAjudTotal || 0, // HH por unidade da composição
            hhProfTotalItem: 0, // Será calculado abaixo
            hhAjudTotalItem: 0, // Será calculado abaixo

            pesoTotal: composicaoBase.pesoTotal || 0, // Se aplicável e definido na composição

            // Visibilidade para filtro de pesquisa
            _visible: true
        };
        
        this.items.push(novoItem);
        this.recalculateSingleItem(novoItem.idUnico, bdiAdotadoPercent); // Calcula todos os campos para o novo item
        
        this.renderTable();
        this.updateTotals();
        this.uiInstance.showGlobalMessage(`Serviço "${novoItem.descricao}" adicionado.`, 'success', 1500);
    },

    recalculateSingleItem(idUnico, bdiPercent) {
        const item = this.items.find(it => it.idUnico === idUnico);
        if (!item) return;

        const quantidade = parseFloat(item.quantidade) || 0;
        const custoUnitMaterial = parseFloat(item.custoUnitMaterial) || 0;
        const custoUnitMO = parseFloat(item.custoUnitMO) || 0;
        
        item.custoUnitarioItem = custoUnitMaterial + custoUnitMO;
        item.precoVendaUnitarioItemBDI = item.custoUnitarioItem * (1 + (bdiPercent / 100));

        item.custoTotalMaterial = custoUnitMaterial * quantidade;
        item.custoTotalMO = custoUnitMO * quantidade;
        item.custoTotalItem = item.custoUnitarioItem * quantidade;
        item.precoVendaTotalItemBDI = item.precoVendaUnitarioItemBDI * quantidade;

        item.hhProfTotalItem = (item.hhProfTotalComposicao || 0) * quantidade;
        item.hhAjudTotalItem = (item.hhAjudTotalComposicao || 0) * quantidade;
        // item.pesoTotalItem = (item.pesoTotalComposicaoBase || 0) * quantidade; // Se houver peso por unidade na composição
    },

    recalculateAllItems() {
        console.log("calculadora.recalculateAllItems()");
        const bdiAdotadoPercent = configManager.getConfigData().bdiFinal || 0;
        this.items.forEach(item => {
            // Se os custos unitários da composição base mudaram (ex: preço de material alterado em config),
            // precisamos buscar a composição atualizada de data.js.
            const composicaoBaseAtualizada = getComposicaoById(item.composicaoId);
            if (composicaoBaseAtualizada) {
                item.custoUnitMaterial = composicaoBaseAtualizada.custoUnitarioMaterial || 0;
                item.custoUnitMO = composicaoBaseAtualizada.custoUnitarioMO || 0;
                item.hhProfTotalComposicao = composicaoBaseAtualizada.hhProfTotal || 0;
                item.hhAjudTotalComposicao = composicaoBaseAtualizada.hhAjudTotal || 0;
                // item.pesoTotalComposicaoBase = composicaoBaseAtualizada.pesoTotal || 0;
            }
            this.recalculateSingleItem(item.idUnico, bdiAdotadoPercent);
        });
        this.renderTable();
        this.updateTotals();
    },

    removerItem(idUnico) {
        console.log(`calculadora.removerItem('${idUnico}')`);
        this.items = this.items.filter(item => item.idUnico !== idUnico);
        // Renumerar itens após remoção
        this.items.forEach((item, index) => item.itemNumero = index + 1);
        this.renderTable();
        this.updateTotals();
    },

    alterarQuantidadeItem(idUnico, novaQuantidade) {
        console.log(`calculadora.alterarQuantidadeItem('${idUnico}', ${novaQuantidade})`);
        const item = this.items.find(it => it.idUnico === idUnico);
        if (item) {
            item.quantidade = parseFloat(novaQuantidade) || 0;
            const bdiAdotadoPercent = configManager.getConfigData().bdiFinal || 0;
            this.recalculateSingleItem(idUnico, bdiAdotadoPercent);
            this.renderTable(); // Poderia otimizar para atualizar só a linha, mas renderizar tudo é mais simples por ora
            this.updateTotals();
        }
    },

    filtrarItens(termoBusca) {
        const termo = termoBusca.toLowerCase().trim();
        if (!termo) {
            this.items.forEach(item => item._visible = true);
        } else {
            this.items.forEach(item => {
                const textoItem = `${item.ref} ${item.descricao} ${item.unidade}`.toLowerCase();
                item._visible = textoItem.includes(termo);
            });
        }
        this.renderTable();
        // Não precisa recalcular totais, pois apenas a visibilidade muda.
    },

    renderTable() {
        console.log("calculadora.renderTable()");
        if (!this.tableBodyElement) return;
        this.tableBodyElement.innerHTML = ''; // Limpa a tabela

        const bdiAdotadoDisplay = document.getElementById('bdiAdotadoDisplay'); // ID do prompt
        const configData = configManager.getConfigData();
        if (bdiAdotadoDisplay) {
            bdiAdotadoDisplay.textContent = `${formatCurrency(configData.bdiFinal || 0, 2, false)}%`;
        }


        this.items.forEach(item => {
            if (!item._visible) return; // Pula itens filtrados

            const row = this.tableBodyElement.insertRow();
            row.dataset.itemId = item.idUnico; // Para facilitar a seleção do item

            // Colunas conforme o prompt:
            // Item, Ref, UM, Qtde, Custos Unitários (Mat, MO), Custo Unitário Total,
            // Preço de Venda Unitário com BDI, Custos Totais (Mat, MO), Custo Total Item,
            // Preço de Venda Total com BDI, HH Prof. Total, HH Ajud. Total, Peso Total.
            // Total 14 colunas + Ações
            row.innerHTML = `
                <td>${item.itemNumero}</td>
                <td>${item.ref}</td>
                <td>${item.descricao}</td>
                <td>${item.unidade}</td>
                <td><input type="number" class="form-control input-quantidade-item" value="${item.quantidade}" min="0" step="any" style="width: 80px;"></td>
                <td class="text-right">${formatCurrency(item.custoUnitMaterial)}</td>
                <td class="text-right">${formatCurrency(item.custoUnitMO)}</td>
                <td class="text-right">${formatCurrency(item.custoUnitarioItem)}</td>
                <td class="text-right">${formatCurrency(item.precoVendaUnitarioItemBDI)}</td>
                <td class="text-right">${formatCurrency(item.custoTotalMaterial)}</td>
                <td class="text-right">${formatCurrency(item.custoTotalMO)}</td>
                <td class="text-right">${formatCurrency(item.custoTotalItem)}</td>
                <td class="text-right">${formatCurrency(item.precoVendaTotalItemBDI)}</td>
                <td class="text-right">${formatCurrency(item.hhProfTotalItem, 2, false)}</td>
                <td class="text-right">${formatCurrency(item.hhAjudTotalItem, 2, false)}</td>
                <td class="text-right">${formatCurrency(item.pesoTotal || 0, 2, false)}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-remover-item" title="Remover Item">
                        <i class="fas fa-trash"></i> <!-- Ícone do FontAwesome, ajuste se não usar -->
                    </button>
                </td>
            `;
        });
    },

    updateTotals() {
        console.log("calculadora.updateTotals()");
        if (!this.tableFooterElement) return;

        const totais = {
            quantidade: 0, // Não faz sentido somar quantidades de unidades diferentes
            custoUnitMaterial: 0, // Não faz sentido somar custos unitários
            custoUnitMO: 0,
            custoUnitarioItem: 0,
            precoVendaUnitarioItemBDI: 0,
            custoTotalMaterial: 0,
            custoTotalMO: 0,
            custoTotalItem: 0,
            precoVendaTotalItemBDI: 0,
            hhProfTotalItem: 0,
            hhAjudTotalItem: 0,
            pesoTotal: 0,
        };

        this.items.forEach(item => {
            if (!item._visible) return; // Soma apenas itens visíveis
            // totais.quantidade += parseFloat(item.quantidade) || 0; // Desabilitado - soma de unidades diferentes
            totais.custoTotalMaterial += parseFloat(item.custoTotalMaterial) || 0;
            totais.custoTotalMO += parseFloat(item.custoTotalMO) || 0;
            totais.custoTotalItem += parseFloat(item.custoTotalItem) || 0;
            totais.precoVendaTotalItemBDI += parseFloat(item.precoVendaTotalItemBDI) || 0;
            totais.hhProfTotalItem += parseFloat(item.hhProfTotalItem) || 0;
            totais.hhAjudTotalItem += parseFloat(item.hhAjudTotalItem) || 0;
            totais.pesoTotal += parseFloat(item.pesoTotal * item.quantidade) || 0; // Assumindo que item.pesoTotal é unitário
        });

        // O rodapé deve ter 14 colunas + 1 de ações, espelhando a tabela
        // As primeiras 4 colunas (Item, Ref, Descrição, UM) não têm totais diretos, mas a Qtde pode ter um "Total de Itens"
        // A coluna de quantidade pode mostrar o número total de linhas (itens distintos)
        this.tableFooterElement.innerHTML = `
            <tr class="font-weight-bold">
                <td colspan="4" class="text-right">TOTAIS (${this.items.filter(it => it._visible).length} itens):</td>
                <td></td> <!-- Total Qtde (não aplicável soma direta) -->
                <td></td> <!-- Total Custo Unit. Mat. -->
                <td></td> <!-- Total Custo Unit. M.O. -->
                <td></td> <!-- Total Custo Unit. Item -->
                <td></td> <!-- Total Preço Venda Unit. BDI -->
                <td class="text-right">${formatCurrency(totais.custoTotalMaterial)}</td>
                <td class="text-right">${formatCurrency(totais.custoTotalMO)}</td>
                <td class="text-right">${formatCurrency(totais.custoTotalItem)}</td>
                <td class="text-right">${formatCurrency(totais.precoVendaTotalItemBDI)}</td>
                <td class="text-right">${formatCurrency(totais.hhProfTotalItem, 2, false)}</td>
                <td class="text-right">${formatCurrency(totais.hhAjudTotalItem, 2, false)}</td>
                <td class="text-right">${formatCurrency(totais.pesoTotal, 2, false)}</td>
                <td></td> <!-- Coluna de Ações -->
            </tr>
        `;
        // Atualizar budgetDataStructure.dadosRelatorios com os totais da calculadora para uso em relatórios
        if (budgetDataStructure.dadosRelatorios && budgetDataStructure.dadosRelatorios.resumoCustos) {
            budgetDataStructure.dadosRelatorios.resumoCustos.materialTotal = totais.custoTotalMaterial;
            budgetDataStructure.dadosRelatorios.resumoCustos.moTotal = totais.custoTotalMO;
            budgetDataStructure.dadosRelatorios.resumoCustos.precoVendaTotal = totais.precoVendaTotalItemBDI;
            // BDI aplicado total pode ser a diferença ou calculado
            budgetDataStructure.dadosRelatorios.resumoCustos.bdiAplicadoTotal = totais.precoVendaTotalItemBDI - totais.custoTotalItem;
        }
    },

    // Para carregar itens de um estado salvo
    setItems(loadedItems) {
        console.log("calculadora.setItems() com:", loadedItems);
        this.items = loadedItems.map((item, index) => ({
            ...item,
            itemNumero: index + 1, // Garante renumeração
            _visible: true // Garante visibilidade inicial
        }));
        // É crucial recalcular todos os itens após carregá-los, pois os custos base (materiais, MO)
        // ou o BDI podem ter mudado desde que foram salvos.
        this.recalculateAllItems(); // Isso já chama renderTable e updateTotals
    },

    getItems() {
        return this.items.map(item => ({ ...item })); // Retorna uma cópia dos itens
    },

    resetToDefaults() {
        console.log("calculadora.resetToDefaults()");
        this.items = [];
        this.populateComposicoesDropdown(); // Repopula dropdown caso as composições tenham mudado
        this.renderTable();
        this.updateTotals();
        if(this.searchInput) this.searchInput.value = ''; // Limpa pesquisa
    }
};

export default calculadora;