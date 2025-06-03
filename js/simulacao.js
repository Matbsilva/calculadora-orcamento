// js/simulacao.js
import { formatCurrency, formatNumber, parseFloatStrict } from './util.js';

let simCustoMoB1, simAdminMoB1, simTributosMoB1, simRiscoMoB1, simCustoFinanceiroMoB1, simLucroMoB1, simBdiBloco1Val;
let simCustoMatB2, simAdminMatB2, simTributosMatB2, simRiscoMatB2, simCustoFinanceiroMatB2, simLucroMatB2, simBdiBloco2Val;
let simPercFatMoB4, simPercFatMaterialB4;
let grandTotalLaborCellRef, grandTotalMaterialCellRef; 

export function initializeSimulacaoDOM(elements) {
    simCustoMoB1 = elements.simCustoMoB1;
    simAdminMoB1 = elements.simAdminMoB1;
    simRiscoMoB1 = elements.simRiscoMoB1;
    simCustoFinanceiroMoB1 = elements.simCustoFinanceiroMoB1;
    simTributosMoB1 = elements.simTributosMoB1;
    simLucroMoB1 = elements.simLucroMoB1;
    simBdiBloco1Val = elements.simBdiBloco1Val;

    simCustoMatB2 = elements.simCustoMatB2;
    simAdminMatB2 = elements.simAdminMatB2;
    simRiscoMatB2 = elements.simRiscoMatB2;
    simCustoFinanceiroMatB2 = elements.simCustoFinanceiroMatB2;
    simTributosMatB2 = elements.simTributosMatB2;
    simLucroMatB2 = elements.simLucroMatB2;
    simBdiBloco2Val = elements.simBdiBloco2Val;

    simPercFatMoB4 = elements.simPercFatMoB4;
    simPercFatMaterialB4 = elements.simPercFatMaterialB4;
    
    grandTotalLaborCellRef = elements.grandTotalLaborCell;
    grandTotalMaterialCellRef = elements.grandTotalMaterialCell;
}

function calculateBDI_Factor(adminPerc_sobre_CD, riscoPerc_sobre_CD, custoFinanceiroPerc_sobre_CD, tributosPerc_sobre_PV, lucroDesejadoPerc_sobre_PV) {
    // console.log("[calculateBDI_Factor] Inputs crus: ", adminPerc_sobre_CD, riscoPerc_sobre_CD, custoFinanceiroPerc_sobre_CD, tributosPerc_sobre_PV, lucroDesejadoPerc_sobre_PV); 

    const AC_cd = adminPerc_sobre_CD / 100;
    const CF_cd = custoFinanceiroPerc_sobre_CD / 100;
    const MI_cd = riscoPerc_sobre_CD / 100;
    const I_pv = tributosPerc_sobre_PV / 100;
    const L_pv = lucroDesejadoPerc_sobre_PV / 100;

    // console.log(`[calculateBDI_Factor] Percentuais: AC_cd=${AC_cd.toFixed(4)}, CF_cd=${CF_cd.toFixed(4)}, MI_cd=${MI_cd.toFixed(4)}, I_pv=${I_pv.toFixed(4)}, L_pv=${L_pv.toFixed(4)}`);

    const numerador = 1 + AC_cd + CF_cd + MI_cd;
    const denominador = 1 - I_pv - L_pv;

    // console.log(`[calculateBDI_Factor] Numerador=${numerador.toFixed(4)}, Denominador=${denominador.toFixed(4)}`);

    if (denominador <= 0.000001 && denominador >= -0.000001) { 
        // console.warn("[calculateBDI_Factor] Denominador é zero ou muito próximo de zero!");
        return Infinity; 
    }
    if (denominador < 0) { 
        //  console.warn("[calculateBDI_Factor] Denominador é negativo, resultaria em BDI ilógico!");
        return NaN; 
    }
    
    const fatorMultiplicador = numerador / denominador;
    // console.log(`[calculateBDI_Factor] Fator Multiplicador Calculado: ${fatorMultiplicador.toFixed(4)}`);
    return fatorMultiplicador;
}

function updateSimulacaoBloco(blocoTipoSuffix, custoDireto) { 
    // console.log(`--- Iniciando updateSimulacaoBloco para: ${blocoTipoSuffix} ---`);
    // console.log(`Custo Direto recebido: ${custoDireto}`);

    const adminPerc = parseFloatStrict(document.getElementById(`sim-admin-${blocoTipoSuffix}`).value);
    const riscoPerc = parseFloatStrict(document.getElementById(`sim-risco-${blocoTipoSuffix}`).value);
    const custoFinanceiroPerc = parseFloatStrict(document.getElementById(`sim-custo-financeiro-${blocoTipoSuffix}`).value);
    const tributosPerc = parseFloatStrict(document.getElementById(`sim-tributos-${blocoTipoSuffix}`).value);
    const lucroDesejadoPerc = parseFloatStrict(document.getElementById(`sim-lucro-${blocoTipoSuffix}`).value);

    // console.log(`Valores lidos dos inputs para ${blocoTipoSuffix}: Admin%: ${adminPerc}, Risco%: ${riscoPerc}, CF%: ${custoFinanceiroPerc}, Tributos%: ${tributosPerc}, Lucro%: ${lucroDesejadoPerc}`);
    
    const fatorMultiplicadorBDI = calculateBDI_Factor(adminPerc, riscoPerc, custoFinanceiroPerc, tributosPerc, lucroDesejadoPerc);
    // console.log(`Fator BDI bruto retornado por calculateBDI_Factor para ${blocoTipoSuffix}: ${fatorMultiplicadorBDI}`);
    const blocoNum = blocoTipoSuffix === 'mo-b1' ? '1' : '2';
    
    let textoFatorBDIExibido;
    const todosInputsBDIZero = adminPerc === 0 && riscoPerc === 0 && custoFinanceiroPerc === 0 && tributosPerc === 0 && lucroDesejadoPerc === 0;
    // console.log(`todosInputsBDIZero para ${blocoTipoSuffix}: ${todosInputsBDIZero}`);

    if (!isFinite(fatorMultiplicadorBDI) || fatorMultiplicadorBDI < 0) {
        textoFatorBDIExibido = "Erro";
    } else {
        if (custoDireto === 0 && todosInputsBDIZero) {
            textoFatorBDIExibido = "100,00%";
        } else {
            textoFatorBDIExibido = formatNumber(fatorMultiplicadorBDI * 100) + "%";
        }
    }
    // console.log(`Texto BDI final para exibir para ${blocoTipoSuffix}: ${textoFatorBDIExibido}`);
    
    const bdiField = document.getElementById(`sim-bdi-bloco${blocoNum}-val`);
    if (bdiField) bdiField.textContent = textoFatorBDIExibido;

    const fatorAplicavel = (isFinite(fatorMultiplicadorBDI) && fatorMultiplicadorBDI >= 0) ? fatorMultiplicadorBDI : 1;
    const valorTotalComBDI = custoDireto * fatorAplicavel;
    
    const valorImpostos = valorTotalComBDI * (tributosPerc / 100);
    const receitaLiquida = valorTotalComBDI - valorImpostos;
    const custoAdminRS = custoDireto * (adminPerc / 100);
    const custoFinanceiroRS = custoDireto * (custoFinanceiroPerc / 100);
    const custoRiscoRS = custoDireto * (riscoPerc / 100);
    const lucroRS_calculado = receitaLiquida - custoDireto - custoAdminRS - custoFinanceiroRS - custoRiscoRS;
    
    const porcentagemLucroNova = (valorTotalComBDI > 0 && isFinite(lucroRS_calculado)) ? (lucroRS_calculado / valorTotalComBDI) * 100 : 0;

    // console.log(`Resultados para ${blocoTipoSuffix}: PV=${formatCurrency(valorTotalComBDI)}, RL=${formatCurrency(receitaLiquida)}, Lucro=${formatCurrency(lucroRS_calculado)}, %Lucro (nova fórmula)=${formatNumber(porcentagemLucroNova)}%`);

    const tableBody = document.getElementById(`sim-detalhe-${blocoTipoSuffix}`) ? document.getElementById(`sim-detalhe-${blocoTipoSuffix}`).querySelector('tbody') : null;
    if(tableBody) {
        if(tableBody.querySelector('[data-field="custo"]')) tableBody.querySelector('[data-field="custo"]').textContent = formatCurrency(custoDireto);
        if(tableBody.querySelector('[data-field="valor_total"]')) tableBody.querySelector('[data-field="valor_total"]').textContent = formatCurrency(valorTotalComBDI);
        if(tableBody.querySelector('[data-field="valor_total_menos_imposto"]')) tableBody.querySelector('[data-field="valor_total_menos_imposto"]').textContent = formatCurrency(receitaLiquida);
        if(tableBody.querySelector('[data-field="lucro_rs"]')) tableBody.querySelector('[data-field="lucro_rs"]').textContent = formatCurrency(lucroRS_calculado);
        if(tableBody.querySelector('[data-field="lucro_perc"]')) tableBody.querySelector('[data-field="lucro_perc"]').textContent = formatNumber(porcentagemLucroNova) + "%";
    }
    return { 
        valorTotalComBDI, receitaLiquida, custoDireto, lucroRS: lucroRS_calculado,
        porcentagemLucro: porcentagemLucroNova, custoAdminRS, custoFinanceiroRS, custoRiscoRS, valorImpostos
    };
}
        
function updateSimulacaoBloco1() {
    const custoMO = grandTotalLaborCellRef ? parseFloatStrict(grandTotalLaborCellRef.textContent) : 0;
    if(simCustoMoB1) simCustoMoB1.value = formatCurrency(custoMO);
    return updateSimulacaoBloco('mo-b1', custoMO);
}

function updateSimulacaoBloco2() {
    const custoMat = grandTotalMaterialCellRef ? parseFloatStrict(grandTotalMaterialCellRef.textContent) : 0;
    if(simCustoMatB2) simCustoMatB2.value = formatCurrency(custoMat);
    return updateSimulacaoBloco('mat-b2', custoMat);
}

function updateSimulacaoBloco3(resultadosB1, resultadosB2) {
    const pvBrutoTotal = resultadosB1.valorTotalComBDI + resultadosB2.valorTotalComBDI;
    const custoDiretoTotalCalc = resultadosB1.custoDireto + resultadosB2.custoDireto;
    const receitaLiquidaTotalResumo = resultadosB1.receitaLiquida + resultadosB2.receitaLiquida;
    const lucroTotalResumoRS = resultadosB1.lucroRS + resultadosB2.lucroRS; 
    const lucroTotalResumoPerc_nova = pvBrutoTotal > 0 ? (lucroTotalResumoRS / pvBrutoTotal) * 100 : 0;

    const tableBodyB3 = document.getElementById('sim-resumo-b3') ? document.getElementById('sim-resumo-b3').querySelector('tbody') : null;
    if (tableBodyB3) {
        if(tableBodyB3.querySelector('[data-field="valor_total_resumo"]')) tableBodyB3.querySelector('[data-field="valor_total_resumo"]').textContent = formatCurrency(pvBrutoTotal);
        if(tableBodyB3.querySelector('[data-field="valor_total_menos_imposto_resumo"]')) tableBodyB3.querySelector('[data-field="valor_total_menos_imposto_resumo"]').textContent = formatCurrency(receitaLiquidaTotalResumo);
        if(tableBodyB3.querySelector('[data-field="custo_total_resumo"]')) tableBodyB3.querySelector('[data-field="custo_total_resumo"]').textContent = formatCurrency(custoDiretoTotalCalc);
        if(tableBodyB3.querySelector('[data-field="lucro_rs_resumo"]')) tableBodyB3.querySelector('[data-field="lucro_rs_resumo"]').textContent = formatCurrency(lucroTotalResumoRS);
        if(tableBodyB3.querySelector('[data-field="lucro_perc_resumo"]')) tableBodyB3.querySelector('[data-field="lucro_perc_resumo"]').textContent = formatNumber(lucroTotalResumoPerc_nova) + "%";
    }
    return { 
        pvBrutoTotal, custoDiretoTotalCalc, lucroTotalRS: lucroTotalResumoRS,
        porcentagemLucro: lucroTotalResumoPerc_nova,
        totalImpostos: resultadosB1.valorImpostos + resultadosB2.valorImpostos,
        totalCustosIndiretosCD: (resultadosB1.custoAdminRS + resultadosB1.custoFinanceiroRS + resultadosB1.custoRiscoRS) +
                                (resultadosB2.custoAdminRS + resultadosB2.custoFinanceiroRS + resultadosB2.custoRiscoRS)
    }; 
}

function updateSimulacaoBloco4(pvBrutoTotalB3, custoDiretoTotalB3, totalImpostosB3, totalCustosIndiretosCDB3) {
     if (!simPercFatMoB4 || !simPercFatMaterialB4 || !simTributosMoB1 || !simTributosMatB2) { 
        console.error("Elementos do Bloco 4 (inputs editáveis ou de dependência) não encontrados.");
        return;
    }

    let percFatMO = parseFloatStrict(simPercFatMoB4.value); 
    if (percFatMO > 100) { percFatMO = 100; simPercFatMoB4.value = formatNumber(100); }
    if (percFatMO < 0) { percFatMO = 0; simPercFatMoB4.value = formatNumber(0); }
    
    const percFatMaterial = 100 - percFatMO; 
    
    if (simPercFatMaterialB4) { 
        simPercFatMaterialB4.value = formatNumber(percFatMaterial) + "%";
    } else {
        console.error("Elemento sim-perc-fat-material-b4 não encontrado no DOM.");
    }

    const fatValorTotalMO_Bruto = pvBrutoTotalB3 * (percFatMO / 100);
    const fatValorTotalMat_Bruto = pvBrutoTotalB3 * (percFatMaterial / 100);
    const tributosMOB1_perc = parseFloatStrict(simTributosMoB1.value) / 100;
    const tributosMatB2_perc = parseFloatStrict(simTributosMatB2.value) / 100;
    const fatImpostoMO = fatValorTotalMO_Bruto * tributosMOB1_perc;
    const fatImpostoMat = fatValorTotalMat_Bruto * tributosMatB2_perc;
    const fatReceitaLiquidaMO = fatValorTotalMO_Bruto - fatImpostoMO;
    const fatReceitaLiquidaMat = fatValorTotalMat_Bruto - fatImpostoMat;

    const tableDetalheB4 = document.getElementById('sim-detalhe-faturamento-b4') ? document.getElementById('sim-detalhe-faturamento-b4').querySelector('tbody') : null;
    if (tableDetalheB4) {
        if(tableDetalheB4.querySelector('[data-field="fat_perc_mo"]')) tableDetalheB4.querySelector('[data-field="fat_perc_mo"]').textContent = formatNumber(percFatMO) + "%";
        if(tableDetalheB4.querySelector('[data-field="fat_perc_mat"]')) tableDetalheB4.querySelector('[data-field="fat_perc_mat"]').textContent = formatNumber(percFatMaterial) + "%";
        if(tableDetalheB4.querySelector('[data-field="fat_valor_total_mo"]')) tableDetalheB4.querySelector('[data-field="fat_valor_total_mo"]').textContent = formatCurrency(fatValorTotalMO_Bruto);
        if(tableDetalheB4.querySelector('[data-field="fat_valor_total_mat"]')) tableDetalheB4.querySelector('[data-field="fat_valor_total_mat"]').textContent = formatCurrency(fatValorTotalMat_Bruto);
        if(tableDetalheB4.querySelector('[data-field="fat_imposto_mo"]')) tableDetalheB4.querySelector('[data-field="fat_imposto_mo"]').textContent = formatCurrency(fatImpostoMO);
        if(tableDetalheB4.querySelector('[data-field="fat_imposto_mat"]')) tableDetalheB4.querySelector('[data-field="fat_imposto_mat"]').textContent = formatCurrency(fatImpostoMat);
        if(tableDetalheB4.querySelector('[data-field="fat_valor_menos_imposto_mo"]')) tableDetalheB4.querySelector('[data-field="fat_valor_menos_imposto_mo"]').textContent = formatCurrency(fatReceitaLiquidaMO);
        if(tableDetalheB4.querySelector('[data-field="fat_valor_menos_imposto_mat"]')) tableDetalheB4.querySelector('[data-field="fat_valor_menos_imposto_mat"]').textContent = formatCurrency(fatReceitaLiquidaMat);
    }

    const resFatValorTotal = fatValorTotalMO_Bruto + fatValorTotalMat_Bruto; 
    const resFatReceitaLiquidaTotal = fatReceitaLiquidaMO + fatReceitaLiquidaMat;
    const resFatCustoTotal = custoDiretoTotalB3;
    const resFatLucroRS = resFatReceitaLiquidaTotal - resFatCustoTotal; 
    
    const resFatLucroPerc_nova = resFatValorTotal > 0 ? (resFatLucroRS / resFatValorTotal) * 100 : 0;
    
    const tableResumoB4 = document.getElementById('sim-resumo-faturamento-b4') ? document.getElementById('sim-resumo-faturamento-b4').querySelector('tbody') : null;
    if (tableResumoB4) {
        if(tableResumoB4.querySelector('[data-field="res_fat_valor_total"]')) tableResumoB4.querySelector('[data-field="res_fat_valor_total"]').textContent = formatCurrency(resFatValorTotal);
        if(tableResumoB4.querySelector('[data-field="res_fat_valor_total_menos_imposto"]')) tableResumoB4.querySelector('[data-field="res_fat_valor_total_menos_imposto"]').textContent = formatCurrency(resFatReceitaLiquidaTotal);
        if(tableResumoB4.querySelector('[data-field="res_fat_custo_total"]')) tableResumoB4.querySelector('[data-field="res_fat_custo_total"]').textContent = formatCurrency(resFatCustoTotal);
        if(tableResumoB4.querySelector('[data-field="res_fat_lucro_rs"]')) tableResumoB4.querySelector('[data-field="res_fat_lucro_rs"]').textContent = formatCurrency(resFatLucroRS);
        if(tableResumoB4.querySelector('[data-field="res_fat_lucro_perc"]')) tableResumoB4.querySelector('[data-field="res_fat_lucro_perc"]').textContent = formatNumber(resFatLucroPerc_nova) + "%";
    }
}

export function recalculateAllSimulations() {
    // console.log("--- CHAMANDO recalculateAllSimulations ---");
    if (!grandTotalLaborCellRef || !grandTotalMaterialCellRef) {
        // console.warn("Referências de totais da calculadora não inicializadas para simulação.");
        return;
    }
    const resultadosB1 = updateSimulacaoBloco1();
    const resultadosB2 = updateSimulacaoBloco2();
    const resultadosB3 = updateSimulacaoBloco3(resultadosB1, resultadosB2);
    updateSimulacaoBloco4(
        resultadosB3.pvBrutoTotal, 
        resultadosB3.custoDiretoTotalCalc, 
        resultadosB3.totalImpostos,
        resultadosB3.totalCustosIndiretosCD
    );
    // console.log("--- FIM recalculateAllSimulations ---");
}