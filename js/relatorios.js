// js/relatorios.js
import { formatCurrency, formatPercentage, parseFloatStrict } from './utils.js';
import { getMaterialPrices, getLaborCosts, getMateriaisBase, getBudgetDataStructure } from './data.js'; // Importa o necessário de data.js

// --- Módulo Resumo Financeiro ---
export const resumoFinanceiro = {
    updateResumo(itensCalculadoraComCustos, config) {
        const custoDiretoTotal = itensCalculadoraComCustos.reduce((acc, item) => acc + item.custoTotal, 0);
        const bdiPercentual = config.bdiFinal || 0;
        const bdiMultiplicador = 1 + (bdiPercentual / 100);
        const valorBDI = custoDiretoTotal * (bdiPercentual / 100);
        const precoVendaTotal = custoDiretoTotal * bdiMultiplicador;
        const areaObra = config.areaObra > 0 ? config.areaObra : 1;

        const custoPorM2 = areaObra > 0 ? custoDiretoTotal / areaObra : 0;
        const precoVendaPorM2 = areaObra > 0 ? precoVendaTotal / areaObra : 0;

        let totalMateriaisCusto = 0;
        let totalMOCusto = 0;
        itensCalculadoraComCustos.forEach(item => {
            totalMateriaisCusto += item.custoUnitarioMaterial * item.quantidade;
            totalMOCusto += item.custoUnitarioMO * item.quantidade;
        });

        const percentMOnoCD = custoDiretoTotal > 0 ? (totalMOCusto / custoDiretoTotal) * 100 : 0;
        const percentMaterialNoCD = custoDiretoTotal > 0 ? (totalMateriaisCusto / custoDiretoTotal) * 100 : 0;

        this.setElementText('resumoCustoDireto', formatCurrency(custoDiretoTotal));
        this.setElementText('resumoBDI', formatPercentage(bdiPercentual));
        this.setElementText('resumoValorBDI', formatCurrency(valorBDI));
        this.setElementText('resumoPrecoVenda', formatCurrency(precoVendaTotal));
        this.setElementText('resumoCustoPorM2', `${formatCurrency(custoPorM2)} /m²`);
        this.setElementText('resumoPrecoVendaPorM2', `${formatCurrency(precoVendaPorM2)} /m²`);
        this.setElementText('resumoTotalMateriais', formatCurrency(totalMateriaisCusto));
        this.setElementText('resumoTotalMO', formatCurrency(totalMOCusto));
        this.setElementText('resumoPercentMOnoCD', formatPercentage(percentMOnoCD));
        this.setElementText('resumoPercentMaterialNoCD', formatPercentage(percentMaterialNoCD));
    },
    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }
};

// --- Módulo Listas ---
export const listas = {
    updateListaServicos(itensCalculadoraComCustos) {
        const tbody = document.getElementById('tabelaListaServicos')?.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (itensCalculadoraComCustos.length > 0) {
            itensCalculadoraComCustos.forEach(item => {
                const tr = tbody.insertRow();
                tr.insertCell().textContent = item.nome;
                tr.insertCell().textContent = item.unidade;
                tr.insertCell().textContent = parseFloatStrict(item.quantidade).toFixed(2).replace('.', ',');
                tr.insertCell().textContent = formatCurrency(item.custoTotal);
            });
        } else {
            const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 4;
            td.textContent = 'Nenhuma composição na calculadora.';
            td.style.textAlign = 'center';
        }
    },
    updateListaMateriais(itensComposicaoAtivosGlobais, configIgnored, listaServicosBaseIgnored) {
        // itensComposicaoAtivosGlobais: são os itens da budgetDataStructure (de data.js)
        // configIgnored e listaServicosBaseIgnored não são mais necessários como parâmetros aqui,
        // pois podemos pegar de data.js diretamente.
        const tbody = document.getElementById('tabelaListaMateriais')?.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const aggregatedMaterials = {};
        const currentMaterialPrices = getMaterialPrices();
        const materiaisBaseData = getMateriaisBase(); // Pega de data.js

        const budgetItems = getBudgetDataStructure(); // Pega a lista completa de composições de data.js

        budgetItems.forEach(itemComp => {
            if (itemComp.initialQuantity > 0 && itemComp.detailedMaterials) {
                itemComp.detailedMaterials.forEach(matDetalhe => {
                    const materialBaseInfo = materiaisBaseData[matDetalhe.idMaterial];
                    if (!materialBaseInfo) {
                        console.warn(`Informação base não encontrada para material: ${matDetalhe.idMaterial}`);
                        return;
                    }
                    const consumoComPerda = matDetalhe.consumptionPerUnit * (1 + (matDetalhe.lossPercent || 0) / 100);
                    const quantidadeTotalMaterial = consumoComPerda * itemComp.initialQuantity;
                    const precoUnitario = currentMaterialPrices[matDetalhe.idMaterial] !== undefined 
                                        ? currentMaterialPrices[matDetalhe.idMaterial] 
                                        : materialBaseInfo.precoUnitarioDefault;

                    if (aggregatedMaterials[matDetalhe.idMaterial]) {
                        aggregatedMaterials[matDetalhe.idMaterial].quantidade += quantidadeTotalMaterial;
                    } else {
                        aggregatedMaterials[matDetalhe.idMaterial] = {
                            nome: materialBaseInfo.nomeDisplay,
                            unidade: materialBaseInfo.unidade,
                            quantidade: quantidadeTotalMaterial,
                            precoUnitario: precoUnitario
                        };
                    }
                });
            }
        });

        if (Object.keys(aggregatedMaterials).length > 0) {
            for (const matId in aggregatedMaterials) {
                const mat = aggregatedMaterials[matId];
                const custoTotalMaterial = mat.quantidade * mat.precoUnitario;
                const tr = tbody.insertRow();
                tr.insertCell().textContent = mat.nome;
                tr.insertCell().textContent = mat.unidade;
                tr.insertCell().textContent = parseFloatStrict(mat.quantidade).toFixed(3).replace('.', ',');
                tr.insertCell().textContent = formatCurrency(mat.precoUnitario);
                tr.insertCell().textContent = formatCurrency(custoTotalMaterial);
            }
        } else {
            const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 5;
            td.textContent = 'Nenhum material a listar.';
            td.style.textAlign = 'center';
        }
    }
};

// --- Módulo Curva ABC ---
export const curvaABC = {
    updateCurvaABC(itensCalculadoraComCustos) {
        const tbody = document.getElementById('tabelaCurvaABC')?.querySelector('tbody');
        if (!tbody) return [];
        tbody.innerHTML = '';
        if (itensCalculadoraComCustos.length === 0) {
            const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 5;
            td.textContent = 'Nenhuma composição para gerar a Curva ABC.';
            td.style.textAlign = 'center';
            return [];
        }
        const custoTotalGeral = itensCalculadoraComCustos.reduce((acc, item) => acc + item.custoTotal, 0);
        const itensOrdenados = [...itensCalculadoraComCustos].sort((a, b) => b.custoTotal - a.custoTotal);
        let percentualAcumulado = 0;
        const dadosParaGrafico = [];
        itensOrdenados.forEach(item => {
            const tr = tbody.insertRow();
            const percentualIndividual = custoTotalGeral > 0 ? (item.custoTotal / custoTotalGeral) * 100 : 0;
            percentualAcumulado += percentualIndividual;
            let classeABC = '';
            if (percentualAcumulado <= 70) classeABC = 'A';
            else if (percentualAcumulado <= 90) classeABC = 'B';
            else classeABC = 'C';
            tr.insertCell().textContent = item.nome;
            tr.insertCell().textContent = formatCurrency(item.custoTotal);
            tr.insertCell().textContent = formatPercentage(percentualIndividual, 2);
            tr.insertCell().textContent = formatPercentage(percentualAcumulado, 2);
            tr.insertCell().textContent = classeABC;
            dadosParaGrafico.push({ nome: item.nome, custo: item.custoTotal, percentualAcumulado: percentualAcumulado });
        });
        return dadosParaGrafico;
    }
};

// --- Módulo Cronograma Estimado ---
export const cronogramaEstimado = {
    curvaS_tipica: { 1:0.02, 2:0.08, 3:0.18, 4:0.35, 5:0.55, 6:0.75, 7:0.88, 8:0.95, 9:0.98, 10:1.0, 11:1.0, 12:1.0 },
    updateCronograma(precoVendaTotal, duracaoMeses) {
        const tbody = document.getElementById('tabelaCronograma')?.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (precoVendaTotal <= 0 || duracaoMeses <= 0) {
            const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 4;
            td.textContent = 'Dados insuficientes para o cronograma.';
            td.style.textAlign = 'center';
            return;
        }
        let valorAcumuladoAnterior = 0;
        for (let mes = 1; mes <= duracaoMeses; mes++) {
            const tr = tbody.insertRow();
            let percentualDesembolsoAcumulado;
            const ultimoMesCurvaDefinida = Math.max(...Object.keys(this.curvaS_tipica).map(Number));
            if (mes <= ultimoMesCurvaDefinida) {
                percentualDesembolsoAcumulado = this.curvaS_tipica[mes] || this.curvaS_tipica[ultimoMesCurvaDefinida];
            } else {
                const ultimoPercentCurva = this.curvaS_tipica[ultimoMesCurvaDefinida];
                if (duracaoMeses > ultimoMesCurvaDefinida && ultimoPercentCurva < 1.0) {
                    percentualDesembolsoAcumulado = ultimoPercentCurva + ((1.0 - ultimoPercentCurva) / (duracaoMeses - ultimoMesCurvaDefinida)) * (mes - ultimoMesCurvaDefinida);
                } else {
                    percentualDesembolsoAcumulado = 1.0;
                }
            }
            percentualDesembolsoAcumulado = Math.min(percentualDesembolsoAcumulado, 1.0);
            const valorAcumuladoAtual = precoVendaTotal * percentualDesembolsoAcumulado;
            const valorNoMes = valorAcumuladoAtual - valorAcumuladoAnterior;
            tr.insertCell().textContent = mes;
            tr.insertCell().textContent = formatPercentage(percentualDesembolsoAcumulado * 100, 2);
            tr.insertCell().textContent = formatCurrency(valorNoMes);
            tr.insertCell().textContent = formatCurrency(valorAcumuladoAtual);
            valorAcumuladoAnterior = valorAcumuladoAtual;
        }
    }
};