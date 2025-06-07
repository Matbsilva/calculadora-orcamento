// js/relatorios.js
import { formatCurrency, formatNumber, parseFloatStrict, escapeCsvCell, copySectionText } from './util.js';
import { 
    getBudgetData, 
    setCurrentAggregatedMaterials, 
    getAreaObra, 
    getMateriaisBase, 
    getMaterialPrices 
} from './data.js';
import { openTab, updateSummaryIndicators } from './ui.js';

function aggregateMaterialsForReports() {
    const budgetDataItems = getBudgetData();
    const materialPricesData = getMaterialPrices(); 
    const materiaisBaseData = getMateriaisBase();
    let aggregated = {};
    let totalWeight = 0;

    budgetDataItems.forEach((item) => {
        const quantity = item.initialQuantity;
        if (quantity > 0 && item.detailedMaterials) {
            item.detailedMaterials.forEach(matDetail => {
                const materialBase = materiaisBaseData[matDetail.idMaterial];
                if (!materialBase) return;
                const materialKey = matDetail.idMaterial;
                const pureAmount = matDetail.consumptionPerUnit * quantity;
                const amountWithLoss = pureAmount * (1 + (matDetail.lossPercent / 100));
                const finalAmount = (materialBase.unidade.match(/m²|ml|kg|L|m³|unidade/i)) ? amountWithLoss : Math.ceil(amountWithLoss);

                if (!aggregated[materialKey]) {
                    aggregated[materialKey] = {
                        nomeDisplay: materialBase.nomeDisplay,
                        unidade: materialBase.unidade,
                        totalAmount: 0,
                        totalWeight: 0,
                        unitWeight: materialBase.pesoKg,
                        unitPrice: materialPricesData[materialKey] !== undefined ? materialPricesData[materialKey] : materialBase.precoUnitarioDefault
                    };
                }
                aggregated[materialKey].totalAmount += finalAmount;
                if (materialBase.pesoKg && materialBase.pesoKg > 0) {
                    const weightForThis = finalAmount * materialBase.pesoKg;
                    aggregated[materialKey].totalWeight += weightForThis;
                    totalWeight += weightForThis;
                }
            });
        }
    });
    setCurrentAggregatedMaterials(aggregated); 
    return { aggregated, totalWeight };
}


export function processAndDisplaySummaryContent(
    summaryContentArea, summaryExportButtonsContainer,
    grandTotalsElements 
) {
    if (!summaryContentArea || !summaryExportButtonsContainer || !grandTotalsElements || 
        !grandTotalsElements.grandTotalCostCell || !grandTotalsElements.grandTotalSellPriceCell ||
        !grandTotalsElements.grandTotalHHProfCell || !grandTotalsElements.grandTotalHHHelperCell) {
        console.error("Elementos para resumo ou seus sub-elementos não encontrados.");
        if(summaryContentArea) summaryContentArea.innerHTML = '<p class="note-text">Erro ao carregar o resumo. Verifique o console.</p>';
        return;
    }

    const { aggregated, totalWeight } = aggregateMaterialsForReports(); 
    let obsHtml = `<h3 class="summary-section-title">Observações e Dicas: <button type="button" class="copy-button" data-section-id="summary-observations-list">Copiar</button></h3><ul id="summary-observations-list" class="copyable-list">`;
    let equipSet = new Set();
    const budgetDataItems = getBudgetData();
    let hasActiveItems = false;

    const totHHProf = parseFloatStrict(grandTotalsElements.grandTotalHHProfCell.textContent);
    const totHHHelper = parseFloatStrict(grandTotalsElements.grandTotalHHHelperCell.textContent);


    budgetDataItems.forEach((item) => {
        const qty = item.initialQuantity;
        if (qty > 0) {
            hasActiveItems = true;
            if (item.observationsText) obsHtml += `<li><strong>${escapeCsvCell(item.description)}:</strong> ${escapeCsvCell(item.observationsText)}</li>`;
            if (item.equipmentList) item.equipmentList.forEach(eq => equipSet.add(eq));
        }
    });

    if (!hasActiveItems) obsHtml += "<li class='note-text'>Nenhuma observação (nenhum item com quantidade > 0).</li>";
    obsHtml += "</ul>";

    let matTableHtml = `<h3 class="summary-section-title">Materiais Consolidados: <button type="button" class="copy-button" data-section-id="summary-materials-table">Copiar</button></h3>`;
    if (Object.keys(aggregated).length > 0) {
        matTableHtml += `<table id="summary-materials-table" class="report-table copyable-table"><thead><tr><th>Material</th><th>Qtd.</th><th>Unid.</th><th>Peso (kg)</th></tr></thead><tbody>`;
        Object.keys(aggregated).sort((a, b) => aggregated[a].nomeDisplay.localeCompare(aggregated[b].nomeDisplay)).forEach(k => {
            const mi = aggregated[k];
            matTableHtml += `<tr><td>${escapeCsvCell(mi.nomeDisplay)}</td><td class="number-value">${formatNumber(mi.totalAmount, mi.unidade.match(/m²|ml|kg|L|m³/i) ? 2 : 0)}</td><td class="unit-measure">${escapeCsvCell(mi.unidade)}</td><td class="number-value">${(mi.unitWeight && mi.totalWeight > 0) ? formatNumber(mi.totalWeight) : "0,00"}</td></tr>`;
        });
        matTableHtml += `</tbody></table><p class="mt-2 font-semibold">Peso Total Materiais: ${formatNumber(totalWeight)} kg</p>`;
        summaryExportButtonsContainer.style.display = 'flex';
    } else {
        matTableHtml += "<p class='note-text'>Nenhum material a ser listado (verifique as quantidades).</p>";
        summaryExportButtonsContainer.style.display = 'none';
    }

    let equipHtml = `<h3 class="summary-section-title">Equipamentos: <button type="button" class="copy-button" data-section-id="summary-equipment-list">Copiar</button></h3><ul id="summary-equipment-list" class="copyable-list">`;
    if (equipSet.size > 0) Array.from(equipSet).sort().forEach(eq => equipHtml += `<li>${escapeCsvCell(eq)}</li>`);
    else equipHtml += "<li class='note-text'>Nenhum equipamento específico listado.</li>";
    equipHtml += "</ul>";

    const daysProf = Math.ceil(totHHProf / 8);
    const daysHelp = Math.ceil(totHHHelper / 8);
    let teamHtml = `<h3 class="summary-section-title">Equipe (Referência): <button type="button" class="copy-button" data-section-id="summary-team-duration">Copiar</button></h3><div id="summary-team-duration" class="copyable-text-block"><p>Total HH Profissionais: ${formatNumber(totHHProf)} HH (${daysProf} diárias/1 prof)</p><p>Total HH Ajudantes: ${formatNumber(totHHHelper)} HH (${daysHelp} diárias/1 ajud.)</p></div>`;

    updateSummaryIndicators(
        grandTotalsElements.grandTotalCostCell,
        grandTotalsElements.grandTotalSellPriceCell,
        grandTotalsElements.grandTotalHHProfCell,
        grandTotalsElements.grandTotalHHHelperCell
    );

    summaryContentArea.innerHTML = matTableHtml + teamHtml + obsHtml + equipHtml;
    summaryContentArea.querySelectorAll('.copy-button').forEach(b => b.addEventListener('click', function () { copySectionText(this.dataset.sectionId, this); }));
    openTab('tab-resumo');
}


export function processAndDisplayAbcCurveContent(abcCurveContentArea) {
    if (!abcCurveContentArea) {
        console.error("Elemento abcCurveContentArea não encontrado.");
        return;
    }
    const budgetDataItems = getBudgetData();
    const servicesData = [];
    let totalCostServices = 0;

    budgetDataItems.forEach((item, index) => {
        const qty = item.initialQuantity;
        if (qty > 0) {
            const itemTotalCostElement = document.getElementById(`item-total-cost-${index}`);
            if (itemTotalCostElement) {
                const cost = parseFloatStrict(itemTotalCostElement.textContent);
                servicesData.push({ name: item.description, cost });
                totalCostServices += cost;
            }
        }
    });

    const { aggregated: aggregatedMaterials } = aggregateMaterialsForReports();
    const materialsData = [];
    let totalCostMaterials = 0;
    for (const idMat in aggregatedMaterials) {
        const mat = aggregatedMaterials[idMat];
        const cost = mat.totalAmount * (mat.unitPrice || 0); // Garante que unitPrice exista
        materialsData.push({ name: mat.nomeDisplay, cost, unit: mat.unidade, quantity: mat.totalAmount });
        totalCostMaterials += cost;
    }

    function genAbcTable(data, total, title) {
        if (data.length === 0) return `<div class="report-section"><h4 class="text-lg">${title}</h4><p class="note-text">Nenhum item para análise.</p></div>`;
        data.sort((a, b) => b.cost - a.cost);
        let accCost = 0;
        let html = `<div class="report-section"><h4 class="text-lg">${title}</h4><table class="report-table"><thead><tr><th>Item</th><th>Custo (R$)</th><th>% Ind.</th><th>Custo Acum. (R$)</th><th>% Acum.</th><th>Classe</th></tr></thead><tbody>`;
        data.forEach(it => {
            accCost += it.cost;
            const indP = total > 0 ? (it.cost / total) * 100 : 0;
            const accP = total > 0 ? (accCost / total) * 100 : 0;
            let cls = 'C';
            if (accP <= 80) cls = 'A';
            else if (accP <= 95) cls = 'B';
            html += `<tr><td>${escapeCsvCell(it.name)}</td><td class="currency">${formatCurrency(it.cost)}</td><td class="number-value">${formatNumber(indP, 1)}%</td><td class="currency">${formatCurrency(accCost)}</td><td class="number-value">${formatNumber(accP, 1)}%</td><td>${cls}</td></tr>`;
        });
        return html + `</tbody></table></div>`;
    }
    abcCurveContentArea.innerHTML = genAbcTable(servicesData, totalCostServices, "Curva ABC de Serviços") + genAbcTable(materialsData, totalCostMaterials, "Curva ABC de Materiais");
    openTab('tab-curva-abc');
}

export function processAndDisplayScheduleContent(scheduleContentArea) {
    if (!scheduleContentArea) {
        console.error("Elemento scheduleContentArea não encontrado.");
        return;
    }
    const budgetDataItems = getBudgetData();
    const grandTotalHHProfCell = document.getElementById('grand-total-hh-prof'); 
    const totHHProf = grandTotalHHProfCell ? parseFloatStrict(grandTotalHHProfCell.textContent) : 0;

    const daysTotal1P = Math.ceil(totHHProf / 8);
    const daysTotal2P = Math.ceil(daysTotal1P / 2);
    let html = `<div class="report-section"><h4 class="text-lg">Estimativa Geral do Projeto</h4><p>Total de Horas-Homem Profissional (HH): ${formatNumber(totHHProf)} HH</p><p>Dias de Trabalho (se 1 profissional, 8h/dia): ${daysTotal1P} dias</p><p><strong>Duração Estimada do Projeto (com equipe de 2 profissionais): ${daysTotal2P} dias úteis</strong></p><p class="note-text"><em>Equipe Padrão Considerada para Duração: 2 Profissionais + 2 Ajudantes.</em></p></div>`;
    
    html += `<div class="report-section"><h4 class="text-lg">Detalhamento Estimado por Serviço (Duração Isolada)</h4><table class="report-table"><thead><tr><th>Serviço</th><th>Área/Qtd. Total</th><th>HH Prof. Total</th><th>Dias Estimados (1 Prof.)</th><th>Dias Estimados (2 Profs.)</th></tr></thead><tbody>`;
    let hasActive = false;
    budgetDataItems.forEach((item) => {
        const qty = item.initialQuantity;
        if (qty > 0) {
            hasActive = true;
            let hhSvc = 0;
            if (item.professionals) for (const p in item.professionals) hhSvc += (item.professionals[p] || 0) * qty;
            const d1P = Math.ceil(hhSvc / 8);
            const d2P = Math.ceil(d1P / 2);
            const formattedQty = formatNumber(qty, item.unit.toLowerCase() === 'm²' || item.unit.toLowerCase() === 'm³' || item.unit.toLowerCase() === 'ml' ? 2 : 0);
            html += `<tr><td>${escapeCsvCell(item.description)}</td><td class="number-value">${formattedQty} ${escapeCsvCell(item.unit)}</td><td class="number-value">${formatNumber(hhSvc)}</td><td class="number-value">${d1P}</td><td class="number-value">${d2P}</td></tr>`;
        }
    });
    if (!hasActive) html += `<tr><td colspan="5" class="note-text">Nenhum serviço com quantidade maior que zero para detalhar.</td></tr>`;
    html += `</tbody></table><p class="text-sm mt-2 note-text"><em>Nota: As durações por serviço são estimativas isoladas e não consideram interdependências ou sequenciamento real de um cronograma.</em></p></div>`;
    scheduleContentArea.innerHTML = html;
    openTab('tab-cronograma');
}