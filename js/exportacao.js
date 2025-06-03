// js/exportacao.js
import { formatNumber, escapeCsvCell } from './util.js';
// ALTERAÇÃO: Removida importação de getMaterialPrices, usaremos getConfig()
import { getBudgetData, getMateriaisBase, getConfig } from './data.js';

function aggregateMaterialsForExportInternal() {
    const budgetDataItems = getBudgetData(); 
    // ALTERAÇÃO: Obtendo preços dos materiais a partir do config
    const currentMaterialPrices = getConfig().materialPrices;
    const currentMateriaisBase = getMateriaisBase();
    let aggregated = {};
    let totalWeight = 0;

    budgetDataItems.forEach((item) => {
        const quantity = item.initialQuantity;
        if (quantity > 0 && item.detailedMaterials) {
            item.detailedMaterials.forEach(matDetail => {
                const materialBase = currentMateriaisBase[matDetail.idMaterial];
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
                        unitPrice: currentMaterialPrices[materialKey] != null ? currentMaterialPrices[materialKey] : materialBase.precoUnitarioDefault
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
    return { aggregated, totalWeight };
}

function downloadCSV(csv, filename) {
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }); // Adicionado BOM aqui
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); 
}

export function exportMaterialsToCSV(detailed = false) {
    const budgetDataItems = getBudgetData();
    const { aggregated } = aggregateMaterialsForExportInternal(); 
    let csvRows = [];
    const sep = ';';
    let filename = detailed ? "materiais_detalhada_por_servico.csv" : "materiais_consolidada.csv";

    if (detailed) { 
        csvRows.push(`Serviço${sep}Material${sep}Qtd Estimada${sep}Unid.${sep}Peso (kg)`);
        let foundAny = false;
        budgetDataItems.forEach((item) => {
            const qty = item.initialQuantity;
            if (qty > 0 && item.detailedMaterials && item.detailedMaterials.length > 0) {
                foundAny = true;
                csvRows.push(`"${escapeCsvCell(item.description)}"`); 
                item.detailedMaterials.forEach(mDet => {
                    const mBase = getMateriaisBase()[mDet.idMaterial]; 
                    if (!mBase) return;
                    const amt = mDet.consumptionPerUnit * qty * (1 + (mDet.lossPercent / 100));
                    const finAmt = (mBase.unidade.match(/m²|ml|kg|L|m³|unidade/i)) ? amt : Math.ceil(amt);
                    const w = (mBase.pesoKg && finAmt > 0) ? finAmt * mBase.pesoKg : 0;
                    csvRows.push([ "", 
                           escapeCsvCell(mBase.nomeDisplay),
                           formatNumber(finAmt, mBase.unidade.match(/m²|ml|kg|L|m³/i) ? 2 : 0).replace('.',','),
                           escapeCsvCell(mBase.unidade),
                           formatNumber(w, 2).replace('.',',') // Garante 2 casas para peso
                          ].join(sep));
                });
                csvRows.push(""); // Linha em branco entre serviços
            }
        });
        if (!foundAny) {
            alert("Nenhum serviço com materiais para exportar detalhadamente.");
            return;
        }
    } else { 
        if (Object.keys(aggregated).length === 0) {
            alert("Sem materiais consolidados para exportar.");
            return;
        }
        csvRows.push(`Material${sep}Qtd Estimada${sep}Unid.${sep}Peso (kg)`);
        let totalOverallWeight = 0;
        Object.keys(aggregated).sort((a, b) => aggregated[a].nomeDisplay.localeCompare(aggregated[b].nomeDisplay)).forEach(k => {
            const mat = aggregated[k];
            csvRows.push([
                escapeCsvCell(mat.nomeDisplay),
                formatNumber(mat.totalAmount, mat.unidade.match(/m²|ml|kg|L|m³/i) ? 2 : 0).replace('.',','),
                escapeCsvCell(mat.unidade),
                (mat.unitWeight && mat.totalWeight > 0) ? formatNumber(mat.totalWeight, 2).replace('.',',') : "0,00" // Garante 2 casas para peso
            ].join(sep));
            if (mat.unitWeight && mat.totalWeight > 0) totalOverallWeight += mat.totalWeight;
        });
        csvRows.push("");
        csvRows.push(`${sep}${sep}Peso Total Estimado:${sep}${formatNumber(totalOverallWeight, 2).replace('.',',')}`);
    }
    
    const csvString = csvRows.join("\n");
    downloadCSV(csvString, filename);
}

export function exportMaterialsByServiceToCSV() { 
    exportMaterialsToCSV(true); 
}