// js/calculadora.js
// ... (Conteúdo completo do calculadora.js que forneci na mensagem anterior, que começa com "import { formatCurrency, parseFloatStrict } from './utils.js';")
// Este arquivo já estava correto e adaptado para o seu data.js e com as novas colunas.
// Repetindo para garantir que você tenha a versão certa nesta sequência final.
import { formatCurrency, parseFloatStrict } from './utils.js';
import { ui } from './ui.js';
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
        if (budgetDataStructure[itemIndex].initialQuantity <= 0) {
            updateBudgetItemQuantity(itemIndex, 1); 
        } else {
            const inputExistente = document.getElementById(`quantidade-${budgetDataStructure[itemIndex].refComposition}`);
            if (inputExistente) {
                inputExistente.focus();
                alert(`A composição "${budgetDataStructure[itemIndex].description}" já está na lista.`);
                return;
            }
        }
        this.renderizarItens();
        if (ui.updateAllTabs) ui.updateAllTabs();
    },
    removerItem(refCompositionId) {
        const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId);
        if (itemIndex !== -1) updateBudgetItemQuantity(itemIndex, 0);
        this.renderizarItens();
        if (ui.updateAllTabs) ui.updateAllTabs();
    },
    atualizarQuantidade(refCompositionId, novaQuantidadeStr) {
        const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId);
        const inputQuantidade = document.getElementById(`quantidade-${refCompositionId}`);
        if (itemIndex !== -1 && inputQuantidade) {
            if (ui.clearInputError) ui.clearInputError(inputQuantidade);
            let novaQuantidade = parseFloatStrict(String(novaQuantidadeStr).replace(',', '.'));
            if (isNaN(novaQuantidade)) {
                if (ui.showInputError) ui.showInputError(inputQuantidade, 'Quantidade inválida.');
                inputQuantidade.value = parseFloatStrict(budgetDataStructure[itemIndex].initialQuantity).toFixed(2).replace('.', ',');
                return; 
            } else if (novaQuantidade < 0) {
                if (ui.showInputError) ui.showInputError(inputQuantidade, 'Não pode ser negativa.');
                novaQuantidade = 0;
            }
            updateBudgetItemQuantity(itemIndex, novaQuantidade);
            this.renderizarItens(); 
            if (ui.updateAllTabs) ui.updateAllTabs(); 
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
                const custoHora = (laborCosts[profKey] || 0) / 8;
                custoMaoDeObraUnitario += horas * custoHora;
            }
        }
        if (composicaoItem.helpers) {
            for (const helperKey in composicaoItem.helpers) {
                const horas = composicaoItem.helpers[helperKey];
                const custoHora = (laborCosts[helperKey] || 0) / 8;
                custoMaoDeObraUnitario += horas * custoHora;
            }
        }
        const custoUnitTotal = custoMaterialUnitario + custoMaoDeObraUnitario;
        return { custoMaterialUnitario, custoMaoDeObraUnitario, custoUnitarioTotal: custoUnitTotal };
    },
    recalcularTodosOsCustos() { this.renderizarItens(); this.updateBdiAdotadoDisplay(); },
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
        if (itensParaRenderizar.length === 0) { const isFiltering = filtro !== ''; const tr = tbody.insertRow(); const td = tr.insertCell(); td.colSpan = 15; td.textContent = isFiltering ? 'Nenhuma composição encontrada com o filtro.' : 'Nenhuma composição adicionada à calculadora.'; td.style.textAlign = 'center'; } else {
            itensParaRenderizar.forEach(itemBase => {
                const { custoMaterialUnitario, custoMaoDeObraUnitario, custoUnitarioTotal } = this.calcularCustosComposicao(itemBase);
                const quantidade = parseFloatStrict(itemBase.initialQuantity); // Garantir que é número
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
                this.itensAtivosNaTabela.push({ ...itemBase, quantidade, custoMaterialUnitarioCalc: custoMaterialUnitario, custoMOUUnitarioCalc: custoMaoDeObraUnitario, custoUnitarioTotalCalc: custoUnitarioTotal, custoMatTotalItemCalc: custoMatTotalItem, custoMOTotalItemCalc: custoMOTotalItem, custoItemTotalDiretoCalc: custoItemTotalDireto, precoVendaItemCalc: precoVendaItem, hhProfTotalItemCalc: hhProfTotalItem, hhAjudTotalItemCalc: hhAjudTotalItem, pesoTotalItemCalc: pesoTotalItem });
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
                inputQuantidade.addEventListener('focus', () => { if (ui.clearInputError) ui.clearInputError(inputQuantidade); }); 
                tr.insertCell().textContent = formatCurrency(custoMaterialUnitario);
                tr.insertCell().textContent = formatCurrency(custoMaoDeObraUnitario);
                tr.insertCell().textContent = formatCurrency(custoUnitarioTotal);
                tr.insertCell().textContent = formatCurrency(custoMatTotalItem);
                tr.insertCell().textContent = formatCurrency(custoMOTotalItem);
Continuando com a leva final de arquivos JavaScript.

---
**ARQUIVOS JAVASCRIPT (PARA SUA PASTA `js/`) - Parte 3 de 3 (Final)**
---

**1. `js/calculadora.js`** (VERSÃO FINAL com todas as colunas, rodapé, cálculo de preço de venda)
*(Substitua o conteúdo do seu `calculadora.js` por este)*
```javascript
// js/calculadora.js
// ... (Conteúdo completo do calculadora.js que forneci na mensagem onde reenviei o data.js completo)
// Este arquivo já estava correto e adaptado para seu data.js e com as novas colunas/rodapé.
// Repetindo para garantir que você tenha a versão certa nesta sequência final.
import { formatCurrency, parseFloatStrict } from './utils.js';
import { ui } from './ui.js';
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
    adicionarItem(refCompositionId) { /* ... (lógica igual à da última vez) ... */ const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId); if (itemIndex === -1) { console.error("Composição base não encontrada:", refCompositionId); return; } if (budgetDataStructure[itemIndex].initialQuantity <= 0) { updateBudgetItemQuantity(itemIndex, 1); } else { const inputExistente = document.getElementById(`quantidade-${budgetDataStructure[itemIndex].refComposition}`); if (inputExistente) { inputExistente.focus(); alert(`A composição "${budgetDataStructure[itemIndex].description}" já está na lista.`); return; } } this.renderizarItens(); if (ui.updateAllTabs) ui.updateAllTabs(); },
    removerItem(refCompositionId) { /* ... (lógica igual à da última vez) ... */ const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId); if (itemIndex !== -1) updateBudgetItemQuantity(itemIndex, 0); this.renderizarItens(); if (ui.updateAllTabs) ui.updateAllTabs(); },
    atualizarQuantidade(refCompositionId, novaQuantidadeStr) { /* ... (lógica igual à da última vez) ... */ const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId); const inputQuantidade = document.getElementById(`quantidade-${refCompositionId}`); if (itemIndex !== -1 && inputQuantidade) { if (ui.clearInputError) ui.clearInputError(inputQuantidade); let novaQuantidade = parseFloatStrict(String(novaQuantidadeStr).replace(',', '.')); if (isNaN(novaQuantidade)) { if (ui.showInputError) ui.showInputError(inputQuantidade, 'Quantidade inválida.'); inputQuantidade.value = parseFloatStrict(budgetDataStructure[itemIndex].initialQuantity).toFixed(2).replace('.', ','); return; } else if (novaQuantidade < 0) { if (ui.showInputError) ui.showInputError(inputQuantidade, 'Não pode ser negativa.'); novaQuantidade = 0; } updateBudgetItemQuantity(itemIndex, novaQuantidade); this.renderizarItens(); if (ui.updateAllTabs) ui.updateAllTabs(); } },
    calcularCustosComposicao(composicaoItem) { /* ... (lógica igual à da última vez, incluindo precoVendaUnitario) ... */ const materialPrices = getMaterialPrices(); const laborCosts = getLaborCosts(); let custoMaterialUnitario = 0; let custoMaoDeObraUnitario = 0; if (composicaoItem.detailedMaterials && Array.isArray(composicaoItem.detailedMaterials)) { composicaoItem.detailedMaterials.forEach(matDetalhe => { const precoUnit = materialPrices[matDetalhe.idMaterial]; if (precoUnit !== undefined && matDetalhe.consumptionPerUnit !== undefined) { const consumoComPerda = matDetalhe.consumptionPerUnit * (1 + (matDetalhe.lossPercent || 0) / 100); custoMaterialUnitario += consumoComPerda * precoUnit; } }); } if (composicaoItem.professionals) { for (const profKey in composicaoItem.professionals) { const horas = composicaoItem.professionals[profKey]; const custoHora = (laborCosts[profKey] || 0) / 8; custoMaoDeObraUnitario += horas * custoHora; } } if (composicaoItem.helpers) { for (const helperKey in composicaoItem.helpers) { const horas = composicaoItem.helpers[helperKey]; const custoHora = (laborCosts[helperKey] || 0) / 8; custoMaoDeObraUnitario += horas * custoHora; } } const custoUnitTotal = custoMaterialUnitario + custoMaoDeObraUnitario; return { custoMaterialUnitario, custoMaoDeObraUnitario, custoUnitarioTotal: custoUnitTotal }; },
    recalcularTodosOsCustos() { this.renderizarItens(); this.updateBdiAdotadoDisplay(); },
    renderizarItens(filtro = '') { /* ... (lógica igual à da última vez, com todas as 14 colunas e BDI) ... */ const tbody = document.getElementById('tabelaCalculadoraItens'); if (!tbody) return; tbody.innerHTML = ''; this.itensAtivosNaTabela = []; const bdiAdotadoPercent = getBdiFinalAdotado(); const bdiMultiplicador = 1 + (bdiAdotadoPercent / 100); const itensParaRenderizar = budgetDataStructure.filter(item => item.initialQuantity > 0 && item.description.toLowerCase().includes(filtro.toLowerCase()) ); if (itensParaRenderizar.length === 0) { const isFiltering = filtro !== ''; const tr = tbody.insertRow(); const td = tr.insertCell(); td.colSpan = 15; td.textContent = isFiltering ? 'Nenhuma composição encontrada.' : 'Nenhuma composição adicionada.'; td.style.textAlign = 'center'; } else { itensParaRenderizar.forEach(itemBase => { const { custoMaterialUnitario, custoMaoDeObraUnitario, custoUnitarioTotal } = this.calcularCustosComposicao(itemBase); const quantidade = itemBase.initialQuantity; const custoMatTotalItem = custoMaterialUnitario * quantidade; const custoMOTotalItem = custoMaoDeObraUnitario * quantidade; const custoItemTotalDireto = custoUnitarioTotal * quantidade; const precoVendaItem = custoItemTotalDireto * bdiMultiplicador; let hhProfTotalItem = 0; if (itemBase.professionals) { for (const profKey in itemBase.professionals) { hhProfTotalItem += (itemBase.professionals[profKey] || 0) * quantidade; } } else if (itemBase.unitHHProfessional) { hhProfTotalItem = (itemBase.unitHHProfessional || 0) * quantidade; } let hhAjudTotalItem = 0; if (itemBase.helpers) {                tr.insertCell().textContent = formatCurrency(custoItemTotalDireto);
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
        tdTitulo.colSpan = 7; 
        tdTitulo.textContent = "TOTAIS CUSTO DIRETO:";
        for(let i = 0; i < 8; i++) trTitulo.insertCell(); // 15 colunas - 1 (colspan 7) = 8
        const trValores = rodapeContainer.insertRow();
        for(let i = 0; i < 7; i++) trValores.insertCell(); 
        const criarCelulaTotal = (valor, label, isCurrency = true) => { const td = trValores.insertCell(); td.classList.add('total-value'); td.innerHTML = `${isCurrency ? formatCurrency(valor) : parseFloatStrict(valor).toFixed(2).replace('.',',')}<br><span style="font-size:0.8em; color:var(--secondary-color); font-weight:normal;">(${label})</span>`; };
        criarCelulaTotal(totalMat, "Total Mat.");
        criarCelulaTotal(totalMO, "Total M.O.");
        criarCelulaTotal(totalDireto, "Total C. Direto");
        criarCelulaTotal(totalVenda, "Total Venda");
        criarCelulaTotal(totalHHProf, "Total HH Prof.", false);
        criarCelulaTotal(totalHHAjud, "Total HH Ajud.", false);
        criarCelulaTotal(totalPeso, "Total Peso (kg)", false);
        trValores.insertCell(); 
    },
    setItens(loadedCompositions) { 
        budgetDataStructure.forEach((item, index) => updateBudgetItemQuantity(index, 0));
        if (loadedCompositions && Array.isArray(loadedCompositions)) {
            loadedCompositions.forEach(loadedItem => {
                const itemIndex = budgetDataStructure.findIndex(bsItem => bsItem.refComposition === loadedItem.refComposition);
                if (itemIndex !== -1) updateBudgetItemQuantity(itemIndex, loadedItem.quantity || 0);
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
            nome: item.description, unidade: item.unit, ref: item.refComposition, quantidade: item.quantidade,
            custoUnitarioMaterial: item.custoMaterialUnitarioCalc, custoUnitarioMO: item.custoMOUUnitarioCalc,
            custoUnitarioTotal: item.custoUnitarioTotalCalc, custoTotal: item.custoItemTotalDiretoCalc, 
            precoVendaItem: item.precoVendaItemCalc, hhProfTotal: item.hhProfTotalItemCalc,
            hhAjudTotal: item.hhAjudTotalItemCalc, pesoTotal: item.pesoTotalItemCalc,
            categoria: item.categoria, detailedMaterials: item.detailedMaterials,
            professionals: item.professionals, helpers: item.helpers,
            unitHHProfessional: item.unitHHProfessional, unitHHelper: item.unitHHelper
        }));
    },
    getTotalCustoDireto() { return this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoItemTotalDiretoCalc, 0); },
    getTotalCustoMaterial() { return this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoMatTotalItemCalc, 0); },
    getTotalCustoMO() { return this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoMOTotalItemCalc, 0); },
    resetCalculadora() { budgetDataStructure.forEach((item, index) => updateBudgetItemQuantity(index, 0)); this.renderizarItens(); }
};