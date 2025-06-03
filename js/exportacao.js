// js/exportacao.js
import { formatNumber, escapeCsvCell } from './util.js';
import { getBudgetData, getMateriaisBase, getMaterialPrices } from './data.js';

function aggregateMaterialsForExportInternal() {
    const budgetDataItems = getBudgetData(); 
    const currentMaterialPrices = getMaterialPrices();
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
                        unitPrice: currentMaterialPrices[materialKey] || materialBase.precoUnitarioDefault
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
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
    let csv = "\ufeff"; 
    const sep = ';';
    let filename = detailed ? "materiais_detalhada_por_servico.csv" : "materiais_consolidada.csv";

    if (detailed) { 
        csv += `Serviço${sep}Material${sep}Qtd Estimada${sep}Unid.${sep}Peso (kg)\n`;
        let foundAny = false;
        budgetDataItems.forEach((item) => {
            const qty = item.initialQuantity;
            if (qty > 0 && item.detailedMaterials && item.detailedMaterials.length > 0) {
                foundAny = true;
                csv += `"${escapeCsvCell(item.description)}"\n`; 
                item.detailedMaterials.forEach(mDet => {
                    const mBase = getMateriaisBase()[mDet.idMaterial]; 
                    if (!mBase) return;
                    const amt = mDet.consumptionPerUnit * qty * (1 + (mDet.lossPercent / 100));
                    const finAmt = (mBase.unidade.match(/m²|ml|kg|L|m³|unidade/i)) ? amt : Math.ceil(amt);
                    const w = (mBase.pesoKg && finAmt > 0) ? finAmt * mBase.pesoKg : 0;
                    csv += ["", 
                           escapeCsvCell(mBase.nomeDisplay),
                           formatNumber(finAmt, mBase.unidade.match(/m²|ml|kg|L|m³/i) ? 2 : 0).replace('.',','),
                           escapeCsvCell(mBase.unidade),
                           formatNumber(w).replace('.',',')
                          ].join(sep) + "\n";
                });
                csv += "\n"; 
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
        csv += `Material${sep}Qtd Estimada${sep}Unid.${sep}Peso (kg)\n`;
        let totalOverallWeight = 0;
        Object.keys(aggregated).sort((a, b) => aggregated[a].nomeDisplay.localeCompare(aggregated[b].nomeDisplay)).forEach(k => {
            const mat = aggregated[k];
            csv += [
                escapeCsvCell(mat.nomeDisplay),
                formatNumber(mat.totalAmount, mat.unidade.match(/m²|ml|kg|L|m³/i) ? 2 : 0).replace('.',','),
                escapeCsvCell(mat.unidade),
                (mat.unitWeight && mat.totalWeight > 0) ? formatNumber(mat.totalWeight).replace('.',',') : "0,00"
            ].join(sep) + "\n";
            if (mat.unitWeight && mat.totalWeight > 0) totalOverallWeight += mat.totalWeight;
        });
        csv += `\n${sep}${sep}Peso Total Estimado:${sep}${formatNumber(totalOverallWeight).replace('.',',')}\n`;
    }

    downloadCSV(csv, filename);
}

export function exportMaterialsByServiceToCSV() { 
    exportMaterialsToCSV(true); 
}