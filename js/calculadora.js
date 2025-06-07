// js/calculadora.js
import { formatCurrency, parseFloatStrict } from './utils.js';
import { ui } from './ui.js'; // Será definido depois, mas a estrutura modular prevê
import {
    getMaterialPrices, getLaborCosts,
    budgetDataStructure, 
    updateBudgetItemQuantity,
    getBdiFinalAdotado 
} from './data.js';

export const calculadora = {
    itensAtivosNaTabela: [], 

    init() { 
        this.renderizarItens(); 
        this.updateBdiAdotadoDisplay();
    },

    updateBdiAdotadoDisplay() {
        const bdiDisplayElement = document.getElementById('bdiAdotadoDisplayCalculadora');
        if (bdiDisplayElement) {
            bdiDisplayElement.textContent = formatPercentage(getBdiFinalAdotado());
        }
    },

    adicionarItem(refCompositionId) {
        const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId);
        if (itemIndex === -1) { console.error("Composição base não encontrada:", refCompositionId); return; }
        
        const itemJaExiste = this.itensAtivosNaTabela.find(item => item.refComposition === refCompositionId);
        if (itemJaExiste || budgetDataStructure[itemIndex].initialQuantity > 0) {
            const inputExistente = document.getElementById(`quantidade-${budgetDataStructure[itemIndex].refComposition}`);
            if (inputExistente) {
                inputExistente.focus();
                alert(`A composição "${budgetDataStructure[itemIndex].description}" já está na lista. Você pode alterar a quantidade diretamente na tabela.`);
            }
            return; 
        }
        updateBudgetItemQuantity(itemIndex, 1); 
        this.renderizarItens();
        if (ui && ui.updateAllTabs) ui.updateAllTabs(); else console.warn("ui.updateAllTabs não disponível em calculadora.adicionarItem");
    },

    removerItem(refCompositionId) {
        const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId);
        if (itemIndex !== -1) updateBudgetItemQuantity(itemIndex, 0);
        this.renderizarItens();
        if (ui && ui.updateAllTabs) ui.updateAllTabs(); else console.warn("ui.updateAllTabs não disponível em calculadora.removerItem");
    },

    atualizarQuantidade(refCompositionId, novaQuantidadeStr) {
        const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId);
        const inputQuantidade = document.getElementById(`quantidade-${refCompositionId}`);
        if (itemIndex !== -1 && inputQuantidade) {
            if (ui && ui.clearInputError) ui.clearInputError(inputQuantidade); else console.warn("ui.clearInputError não disponível");
            let novaQuantidade = parseFloatStrict(String(novaQuantidadeStr).replace(',', '.'));
            if (isNaN(novaQuantidade)) {
                if (ui && ui.showInputError) ui.showInputError(inputQuantidade, 'Quantidade inválida.');
                inputQuantidade.value = parseFloatStrict(budgetDataStructure[itemIndex].initialQuantity).toFixed(2).replace('.', ',');
                return; 
            } else if (novaQuantidade < 0) {
                if (ui && ui.showInputError) ui.showInputError(inputQuantidade, 'Não pode ser negativa.');
                novaQuantidade = 0;
            }
            updateBudgetItemQuantity(itemIndex, novaQuantidade);
            this.renderizarItens(); 
            if (ui && ui.updateAllTabs) ui.updateAllTabs(); else console.warn("ui.updateAllTabs não disponível em calculadora.atualizarQuantidade");
        }
    },
    
    calcularCustosComposicao(composicaoItem) {
        const materialPrices = getMaterialPrices();
        const laborCosts = getLaborCosts();
        let custoMaterialUnitario = 0;
        let custoMaoDeObraUnitario = 0;

        if (composicaoItem.detailedMaterials && Array.isArray(composicaoItem.detailedMaterials)) {
            composicaoItem.detailedMaterials.forEach(matDetalhe => {
                const precoUnit = materialPrices[matDetalhe.idMaterial];
                if (precoUnit !== undefined && matDetalhe.consumptionPerUnit !== undefined) {
                    const consumoComPerda = matDetalhe.consumptionPerUnit * (1 + (matDetalhe.lossPercent || 0) / 100);
                    custoMaterialUnitario += consumoComPerda * precoUnit;
                }
            });
        }
        if (composicaoItem.professionals) {
            for (const profKey in composicaoItem.professionals) {
                const horas = composicaoItem.professionals[profKey];
                const custoDia = laborCosts[profKey] || 0;
                const custoHora = custoDia / 8; // Assume 8h/dia
                custoMaoDeObraUnitario += horas * custoHora;
            }
        }
        if (composicaoItem.helpers) {
            for (const helperKey in composicaoItem.helpers) {
                const horas = composicaoItem.helpers[helperKey];
                const custoDia = laborCosts[helperKey] || 0;
                const custoHora = custoDia / 8; 
                custoMaoDeObraUnitario += horas * custoHora;
            }
        }
        const custoUnitTotal = custoMaterialUnitario + custoMaoDeObraUnitario;
        return { custoMaterialUnitario, custoMaoDeObraUnitario, custoUnitarioTotal: custoUnitTotal };
    },

    recalcularTodosOsCustos() { 
        this.renderizarItens(); 
        this.updateBdiAdotadoDisplay(); 
    },

    renderizarItens(filtro = '') {
        const tbody = document.getElementById('tabelaCalculadoraItens');
        if (!tbody) return;
        tbody.innerHTML = ''; 
        this.itensAtivosNaTabela = [];
        
        const bdiAdotadoPercent = getBdiFinalAdotado();
        const bdiMultiplicador = 1 + (bdiAdotadoPercent / 100);

        const itensParaRenderizar = budgetDataStructure.filter(item => 
            item.initialQuantity > 0 &&
            item.description.toLowerCase().includes(filtro.toLowerCase())
        );

        if (itensParaRenderizar.length === 0) {
            const isFiltering = filtro !== '';
            const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 15; 
            td.textContent = isFiltering ? 'Nenhuma composição encontrada com o filtro.' : 'Nenhuma composição adicionada à calculadora.';
            td.style.textAlign = 'center';
        } else {
            itensParaRenderizar.forEach(itemBase => {
                const { custoMaterialUnitario, custoMaoDeObraUnitario, custoUnitarioTotal } = this.calcularCustosComposicao(itemBase);
                const quantidade = parseFloatStrict(itemBase.initialQuantity); 
                const custoMatTotalItem = custoMaterialUnitario * quantidade;
                const custoMOTotalItem = custoMaoDeObraUnitario * quantidade;
                const custoItemTotalDireto = custoUnitarioTotal * quantidade;
                const precoVendaItem = custoItemTotalDireto * bdiMultiplicador;
                
                let hhProfTotalItem = 0;
                if (itemBase.professionals) { for (const profKey in itemBase.professionals) { hhProfTotalItem += (itemBase.professionals[profKey] || 0) * quantidade; } } 
                else if (itemBase.unitHHProfessional) { hhProfTotalItem = (itemBase.unitHHProfessional || 0) * quantidade; }

                let hhAjudTotalItem = 0;
                if (itemBase.helpers) { for (const helperKey in itemBase.helpers) { hhAjudTotalItem += (itemBase.helpers[helperKey] || 0) * quantidade; } } 
                else if (itemBase.unitHHelper) { hhAjudTotalItem = (itemBase.unitHHelper || 0) * quantidade; }
                
                const pesoTotalItem = (itemBase.unitWeight || 0) * quantidade;

                this.itensAtivosNaTabela.push({ 
                    ...itemBase, 
                    quantidade: quantidade, 
                    custoMaterialUnitarioCalc: custoMaterialUnitario,
                    custoMOUUnitarioCalc: custoMaoDeObraUnitario,
                    custoUnitarioTotalCalc: custoUnitarioTotal,
                    custoMatTotalItemCalc: custoMatTotalItem,
                    custoMOTotalItemCalc: custoMOTotalItem,
                    custoItemTotalDiretoCalc: custoItemTotalDireto,
                    precoVendaItemCalc: precoVendaItem,
                    hhProfTotalItemCalc: hhProfTotalItem,
                    hhAjudTotalItemCalc: hhAjudTotalItem,
                    pesoTotalItemCalc: pesoTotalItem
                });

                const tr = tbody.insertRow();
                tr.setAttribute('data-id', itemBase.refComposition); 
                tr.insertCell().textContent = itemBase.description;
                tr.insertCell().textContent = itemBase.refComposition;
                tr.insertCell().textContent = itemBase.unit;
                
                const tdQuantidade = tr.insertCell();
                const inputQuantidade = document.createElement('input');
                inputQuantidade.type = 'text'; 
                inputQuantidade.value = quantidade.toFixed(2).replace('.', ','); 
                inputQuantidade.classList.add('input-quantidade');
                inputQuantidade.id = `quantidade-${itemBase.refComposition}`;
                const errorSpanQuantidade = document.createElement('span');
                errorSpanQuantidade.classList.add('error-message');
                errorSpanQuantidade.id = `quantidade-${itemBase.refComposition}Error`;
                tdQuantidade.appendChild(inputQuantidade);
                tdQuantidade.appendChild(errorSpanQuantidade); 
                inputQuantidade.addEventListener('blur', (event) => { this.atualizarQuantidade(itemBase.refComposition, event.target.value); });
                inputQuantidade.addEventListener('focus', () => { if (ui && ui.clearInputError) ui.clearInputError(inputQuantidade); else console.warn("ui.clearInputError não disponível")}); 
                
                tr.insertCell().textContent = formatCurrency(custoMaterialUnitario);
                tr.insertCell().textContent = formatCurrency(custoMaoDeObraUnitario);
                tr.insertCell().textContent = formatCurrency(custoUnitarioTotal);
                tr.insertCell().textContent = formatCurrency(custoMatTotalItem);
                tr.insertCell().textContent = formatCurrency(custoMOTotalItem);
                tr.insertCell().textContent = formatCurrency(custoItemTotalDireto);
                tr.insertCell().textContent = formatCurrency(precoVendaItem);
                tr.insertCell().textContent = hhProfTotalItem.toFixed(2).replace('.',',');
                tr.insertCell().textContent = hhAjudTotalItem.toFixed(2).replace('.',',');
                tr.insertCell().textContent = pesoTotalItem.toFixed(2).replace('.',',');

                const tdControles = tr.insertCell();
                const btnRemover = document.createElement('button');
                btnRemover.textContent = 'Excluir';
                btnRemover.classList.add('btn-remover');
                btnRemover.setAttribute('aria-label', `Excluir item ${itemBase.description}`);
                btnRemover.addEventListener('click', () => this.removerItem(itemBase.refComposition));
                tdControles.appendChild(btnRemover);
            });
        }
        this.atualizarTotalTabela();
        this.updateBdiAdotadoDisplay();
    },

    atualizarTotalTabela() {
        const rodapeContainer = document.getElementById('tabelaCalculadoraRodape');
        if (!rodapeContainer) return;
        rodapeContainer.innerHTML = ''; 

        const totalMat = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoMatTotalItemCalc, 0);
        const totalMO = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoMOTotalItemCalc, 0);
        const totalDireto = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoItemTotalDiretoCalc, 0);
        const totalVenda = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.precoVendaItemCalc, 0);
        const totalHHProf = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.hhProfTotalItemCalc, 0);
        const totalHHAjud = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.hhAjudTotalItemCalc, 0);
        const totalPeso = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.pesoTotalItemCalc, 0);

        const trTitulo = rodapeContainer.insertRow();
        const tdTitulo = trTitulo.insertCell();
        // Colspan para alinhar o texto "TOTAIS:" antes das colunas de valores.
        // Número de colunas antes dos totais: Item, Ref, UM, Qtde, CustoMatUnit, CustoMOUnit, CustoUnitTotal = 7
        tdTitulo.colSpan = 7; 
        tdTitulo.textContent = "TOTAIS CUSTO DIRETO:";
        // As células restantes nesta linha do título podem ser deixadas vazias ou preenchidas se necessário
        for(let i = 0; i < (14 - 7) ; i++) { // 14 colunas totais na tabela - 7 da colspan = 7 células restantes
            trTitulo.insertCell();
        }


        const trValores = rodapeContainer.insertRow();
        // Adiciona células vazias para alinhar com as colunas da tabela antes dos totais
        for(let i = 0; i < 7; i++) trValores.insertCell(); 
        
        const criarCelulaTotal = (valor, label, isCurrency = true) => {
            const td = trValores.insertCell();
            td.classList.add('total-value');
            // O valor e o label ficam na mesma célula, com o label abaixo
            const valorFormatado = isCurrency ? formatCurrency(valor) : parseFloatStrict(valor).toFixed(2).replace('.',',');
            td.innerHTML = `${valorFormatado}<br><span style="font-size:0.8em; color:var(--secondary-color); font-weight:normal;">(${label})</span>`;
            td.style.textAlign = "right"; // Garante alinhamento à direita para os totais
            return td;
        };

        criarCelulaTotal(totalMat, "Total Mat.");
        criarCelulaTotal(totalMO, "Total M.O.");
        criarCelulaTotal(totalDireto, "Total C. Direto");
        criarCelulaTotal(totalVenda, "Total Venda");
        criarCelulaTotal(totalHHProf, "Total HH Prof.", false);
        criarCelulaTotal(totalHHAjud, "Total HH Ajud.", false);
        criarCelulaTotal(totalPeso, "Total Peso (kg)", false);
        trValores.insertCell(); // Célula vazia para a coluna "Ações"
    },
    
    setItens(loadedCompositions) { 
        budgetDataStructure.forEach((item, index) => updateBudgetItemQuantity(index, 0));
        if (loadedCompositions && Array.isArray(loadedCompositions)) {
            loadedCompositions.forEach(loadedItem => {
                const itemIndex = budgetDataStructure.findIndex(bsItem => bsItem.refComposition === loadedItem.refComposition);
                if (itemIndex !== -1) {
                    updateBudgetItemQuantity(itemIndex, loadedItem.quantity || 0);
                }
            });
        }
        this.recalcularTodosOsCustos();
    },

    getItensParaSalvar() {
        return budgetDataStructure
            .filter(item => item.initialQuantity > 0)
            .map(item => ({ refComposition: item.refComposition, quantity: item.initialQuantity }));
    },

    getItensComCustosCalculados() { 
        return this.itensAtivosNaTabela.map(item => ({ 
            nome: item.description, 
            unidade: item.unit, 
            ref: item.refComposition, 
            quantidade: item.quantidade,
            custoUnitarioMaterial: item.custoMaterialUnitarioCalc, 
            custoUnitarioMO: item.custoMOUUnitarioCalc,
            custoUnitarioTotal: item.custoUnitarioTotalCalc, 
            custoTotal: item.custoItemTotalDiretoCalc, 
            precoVendaItem: item.precoVendaItemCalc, 
            hhProfTotal: item.hhProfTotalItemCalc,
            hhAjudTotal: item.hhAjudTotalItemCalc, 
            pesoTotal: item.pesoTotalItemCalc,
            categoria: item.categoria, 
            // Não precisa passar detailedMaterials, professionals, helpers aqui, a menos que relatorios.js precise deles crus.
            // A lógica de cálculo já os usou.
        }));
    },

    getTotalCustoDireto() { return this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoItemTotalDiretoCalc, 0); },
    getTotalCustoMaterial() { return this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoMatTotalItemCalc, 0); },
    getTotalCustoMO() { return this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoMOTotalItemCalc, 0); },
    resetCalculadora() { 
        budgetDataStructure.forEach((item, index) => updateBudgetItemQuantity(index, 0));
        this.renderizarItens(); 
    }
};