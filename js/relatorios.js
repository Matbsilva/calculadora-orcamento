// js/relatorios.js
// Módulo para gerar e atualizar o conteúdo das abas de relatório.

import { budgetDataStructure as composicoesOrcamento, getBdiFinalAdotado, getAreaObra } from './data.js'; // Usando o array de composições
import { getItems as getCalculadoraItems } from './calculadora.js'; // Assumindo que calculadora.js exporta getItems
import { formatCurrency, parseCurrency } from './utils.js'; // Para formatação

// Referências aos containers dos relatórios (serão preenchidos por ui.js)
let resumoContainer = null;
let listasContainer = null;
let curvaABCContainer = null;
let cronogramaContainer = null;

// Variável para controlar qual relatório está visível (para otimizar atualizações)
let currentVisibleReportTabId = null;

export function initRelatorios(uiReportContainers) {
    console.log("relatorios.initRelatorios() chamado");
    if (uiReportContainers) {
        resumoContainer = uiReportContainers.resumo;
        listasContainer = uiReportContainers.listas;
        curvaABCContainer = uiReportContainers.curvaABC;
        cronogramaContainer = uiReportContainers.cronograma;
    }
    // Não há muito mais a inicializar aqui, a lógica principal é em updateAllReports.
}

// Função chamada por ui.js para informar qual aba de relatório está ativa
export function updateReportVisibility(activeTabId) {
    currentVisibleReportTabId = activeTabId;
    // Poderia-se adicionar lógica aqui para apenas atualizar o relatório visível se necessário,
    // mas updateAllReports já pode ser otimizado ou chamado seletivamente.
}

// Função principal para atualizar todos os relatórios.
// Chamada por ui.js quando dados mudam ou ao navegar para uma aba de relatório.
export function updateAllReports() {
    console.log("relatorios.updateAllReports() chamado");
    
    // Os dados necessários vêm de calculadora.js (itens do orçamento) e data.js (configurações, BDI)
    const itensOrcamento = getCalculadoraItems(); // Array de itens da tabela da calculadora
    const bdiAdotado = getBdiFinalAdotado(); // Percentual, ex: 105 para 105%
    const areaDaObra = getAreaObra();

    if (!itensOrcamento) {
        console.warn("Dados da calculadora (itensOrcamento) não disponíveis para gerar relatórios.");
        return;
    }

    // 1. Relatório de Resumo
    if (resumoContainer && (currentVisibleReportTabId === 'resumo' || !currentVisibleReportTabId)) { // Atualiza se for a aba ativa ou se nenhuma específica for dada (ex: na inicialização)
        console.log("Atualizando Relatório de Resumo");
        generateResumoReport(resumoContainer, itensOrcamento, bdiAdotado, areaDaObra);
    }

    // 2. Relatório de Listas
    if (listasContainer && (currentVisibleReportTabId === 'listas' || !currentVisibleReportTabId)) {
        console.log("Atualizando Relatório de Listas");
        generateListasReport(listasContainer, itensOrcamento, bdiAdotado);
    }

    // 3. Relatório Curva ABC
    if (curvaABCContainer && (currentVisibleReportTabId === 'curva-abc' || !currentVisibleReportTabId)) {
        console.log("Atualizando Relatório Curva ABC");
        generateCurvaABCReport(curvaABCContainer, itensOrcamento, bdiAdotado);
    }

    // 4. Relatório Cronograma Estimado (simplificado)
    if (cronogramaContainer && (currentVisibleReportTabId === 'cronograma-estimado' || !currentVisibleReportTabId)) {
        console.log("Atualizando Relatório Cronograma Estimado");
        generateCronogramaReport(cronogramaContainer, itensOrcamento);
    }
    console.log("Todos os relatórios (ou o visível) foram atualizados.");
}


// --- Funções Geradoras para Cada Relatório ---

function generateResumoReport(container, itens, bdiPercent, area) {
    if (!container) return;

    let custoTotalMaterial = 0;
    let custoTotalMO = 0;
    let custoTotalDireto = 0;
    let precoVendaTotal = 0;
    let totalHHProf = 0;
    let totalHHAjud = 0;

    itens.forEach(item => {
        custoTotalMaterial += parseFloatStrict(item.custoTotalMaterial) || 0;
        custoTotalMO += parseFloatStrict(item.custoTotalMO) || 0;
        totalHHProf += parseFloatStrict(item.hhProfTotalItem) || 0;
        totalHHAjud += parseFloatStrict(item.hhAjudTotalItem) || 0;
    });

    custoTotalDireto = custoTotalMaterial + custoTotalMO;
    // Preço de Venda = CustoDireto * (1 + BDI%/100)
    precoVendaTotal = custoTotalDireto * (1 + (parseFloatStrict(bdiPercent) / 100));
    const valorBDI = precoVendaTotal - custoTotalDireto;

    // Layout Reorganizado conforme prompt original (seções lado a lado ou empilhadas)
    // Usarei uma estrutura de tabela para simplicidade, pode ser estilizado com CSS Grid/Flexbox
    let html = `
        <h2>Resumo do Orçamento</h2>
        <div class="resumo-grid">
            <div class="resumo-secao">
                <h3>Custos Diretos</h3>
                <table>
                    <tr><td>Custo Total de Materiais:</td><td class="text-right">${formatCurrency(custoTotalMaterial)}</td></tr>
                    <tr><td>Custo Total de Mão de Obra:</td><td class="text-right">${formatCurrency(custoTotalMO)}</td></tr>
                    <tr><td><strong>Custo Direto Total (CD):</strong></td><td class="text-right"><strong>${formatCurrency(custoTotalDireto)}</strong></td></tr>
                </table>
            </div>

            <div class="resumo-secao">
                <h3>Detalhamento do Preço de Venda</h3>
                <table>
                    <tr><td>BDI Adotado:</td><td class="text-right">${formatCurrency(bdiPercent, 2, false)}%</td></tr>
                    <tr><td>Valor do BDI (BDI * CD / 100):</td><td class="text-right">${formatCurrency(valorBDI)}</td></tr>
                    <tr><td><strong>Preço de Venda Total (PV):</strong></td><td class="text-right"><strong>${formatCurrency(precoVendaTotal)}</strong></td></tr>
                </table>
            </div>

            <div class="resumo-secao">
                <h3>Indicadores Globais</h3>
                <table>
                    <tr><td>Área da Obra:</td><td class="text-right">${formatCurrency(area, 2, false)} m²</td></tr>
                    <tr><td>Custo por m² (CD / Área):</td><td class="text-right">${area > 0 ? formatCurrency(custoTotalDireto / area) : 'N/A'} /m²</td></tr>
                    <tr><td>Preço de Venda por m² (PV / Área):</td><td class="text-right">${area > 0 ? formatCurrency(precoVendaTotal / area) : 'N/A'} /m²</td></tr>
                </table>
            </div>

            <div class="resumo-secao">
                <h3>Horas Homem (HH)</h3>
                <table>
                    <tr><td>Total HH Profissional:</td><td class="text-right">${formatCurrency(totalHHProf, 2, false)} HH</td></tr>
                    <tr><td>Total HH Ajudante:</td><td class="text-right">${formatCurrency(totalHHAjud, 2, false)} HH</td></tr>
                    <tr><td><strong>Total HH Geral:</strong></td><td class="text-right"><strong>${formatCurrency(totalHHProf + totalHHAjud, 2, false)} HH</strong></td></tr>
                </table>
            </div>
        </div>
        <div id="graficoPizzaCustosContainer" class="chart-container">
             <!-- O gráfico de pizza será renderizado aqui por graficoPizzaCustos.js -->
             <canvas id="graficoPizzaCustosRelatorio"></canvas> 
        </div>
    `;
    // Nota: O ID 'graficoPizzaCustosRelatorio' é diferente do canvas na aba Resumo do prompt
    // 'graficoPizzaCustos'. Se for o mesmo gráfico, deve ter o mesmo ID ou ser atualizado em ambos os locais.
    // Por ora, vou assumir que é um novo canvas para este relatório.
    container.innerHTML = html;
}


function generateListasReport(container, itens, bdiPercent) {
    if (!container) return;

    let html = `<h2>Listas Detalhadas</h2>`;

    // Lista de Serviços (Itens do Orçamento)
    html += `<h3>Lista de Serviços Orçados</h3>`;
    if (itens.length > 0) {
        html += `<table class="table table-striped table-sm">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Ref.</th>
                            <th>Descrição</th>
                            <th>UM</th>
                            <th class="text-right">Qtde</th>
                            <th class="text-right">C.U. Material</th>
                            <th class="text-right">C.U. M.O.</th>
                            <th class="text-right">Custo Unit. Total</th>
                            <th class="text-right">Preço Venda Unit.</th>
                            <th class="text-right">Preço Venda Total</th>
                        </tr>
                    </thead>
                    <tbody>`;
        itens.forEach(item => {
            const custoUnitTotal = (parseFloatStrict(item.custoUnitMaterial) || 0) + (parseFloatStrict(item.custoUnitMO) || 0);
            const precoVendaUnit = custoUnitTotal * (1 + (parseFloatStrict(bdiPercent) / 100));
            const precoVendaTotalItem = precoVendaUnit * (parseFloatStrict(item.quantidade) || 0);
            html += `<tr>
                        <td>${item.itemNumero}</td>
                        <td>${item.ref}</td>
                        <td>${item.descricao}</td>
                        <td>${item.unidade}</td>
                        <td class="text-right">${formatCurrency(item.quantidade, 2, false)}</td>
                        <td class="text-right">${formatCurrency(item.custoUnitMaterial)}</td>
                        <td class="text-right">${formatCurrency(item.custoUnitMO)}</td>
                        <td class="text-right">${formatCurrency(custoUnitTotal)}</td>
                        <td class="text-right">${formatCurrency(precoVendaUnit)}</td>
                        <td class="text-right">${formatCurrency(precoVendaTotalItem)}</td>
                    </tr>`;
        });
        html += `   </tbody>
                </table>`;
    } else {
        html += `<p>Nenhum serviço adicionado ao orçamento.</p>`;
    }

    // Lista de Materiais Agregados (Exemplo Simples - precisa de mais lógica em data.js para agregar)
    // currentAggregatedMaterials de data.js precisaria ser populado
    html += `<h3>Lista de Materiais Agregados (Total)</h3>`;
    // Esta parte requer que 'currentAggregatedMaterials' em data.js seja preenchido
    // com a soma de todos os materiais de todos os itens da calculadora.
    // Por enquanto, vou deixar um placeholder, pois a lógica de agregação não está aqui.
    html += `<p><i>Funcionalidade de lista de materiais agregados a ser implementada com base na agregação dos itens da calculadora.</i></p>`;
    // Exemplo de como seria se currentAggregatedMaterials estivesse populado:
    // const aggregatedMaterials = getCurrentAggregatedMaterials(); // de data.js
    // if (Object.keys(aggregatedMaterials).length > 0) {
    //     html += `<table class="table table-striped table-sm">...<thead>...</thead><tbody>`;
    //     for (const matId in aggregatedMaterials) {
    //         const mat = aggregatedMaterials[matId];
    //         html += `<tr><td>${mat.nomeDisplay}</td><td>${mat.unidade}</td><td class="text-right">${formatCurrency(mat.quantidadeTotal, 2, false)}</td><td class="text-right">${formatCurrency(mat.custoTotal)}</td></tr>`;
    //     }
    //     html += `</tbody></table>`;
    // } else {
    //     html += `<p>Nenhum material para listar.</p>`;
    // }

    container.innerHTML = html;
}

function generateCurvaABCReport(container, itens, bdiPercent) {
    if (!container) return;

    let html = `<h2>Curva ABC de Serviços</h2>`;
    if (itens.length === 0) {
        html += `<p>Nenhum serviço no orçamento para gerar a Curva ABC.</p>`;
        container.innerHTML = html;
        return;
    }

    const itensComValor = itens.map(item => {
        const custoUnitTotal = (parseFloatStrict(item.custoUnitMaterial) || 0) + (parseFloatStrict(item.custoUnitMO) || 0);
        const precoVendaUnit = custoUnitTotal * (1 + (parseFloatStrict(bdiPercent) / 100));
        return {
            ...item,
            valorTotalCalculado: precoVendaUnit * (parseFloatStrict(item.quantidade) || 0)
        };
    }).sort((a, b) => b.valorTotalCalculado - a.valorTotalCalculado); // Ordena por valor decrescente

    const valorTotalOrcamento = itensComValor.reduce((sum, item) => sum + item.valorTotalCalculado, 0);
    
    html += `<p>Ordenado pelo Preço de Venda Total do Item.</p>`;
    html += `<table class="table table-striped table-sm">
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th class="text-right">Valor Total</th>
                        <th class="text-right">% Individual</th>
                        <th class="text-right">% Acumulada</th>
                        <th>Classe</th>
                    </tr>
                </thead>
                <tbody>`;

    let acumuladoPercent = 0;
    itensComValor.forEach(item => {
        const percentIndividual = valorTotalOrcamento > 0 ? (item.valorTotalCalculado / valorTotalOrcamento) * 100 : 0;
        acumuladoPercent += percentIndividual;
        let classeABC = '';
        if (acumuladoPercent <= 70) classeABC = 'A'; // Critério comum: A até 70-80%
        else if (acumuladoPercent <= 95) classeABC = 'B'; // B até 90-95%
        else classeABC = 'C'; // Restante é C

        html += `<tr>
                    <td>${item.descricao}</td>
                    <td class="text-right">${formatCurrency(item.valorTotalCalculado)}</td>
                    <td class="text-right">${formatCurrency(percentIndividual, 2, false)}%</td>
                    <td class="text-right">${formatCurrency(acumuladoPercent, 2, false)}%</td>
                    <td class="text-center"><strong>${classeABC}</strong></td>
                </tr>`;
    });
    html += `   </tbody>
            </table>`;
    
    html += `
        <div id="graficoCurvaABCContainer" class="chart-container">
            <!-- O gráfico de Pareto será renderizado aqui por graficoCurvaABC.js -->
            <canvas id="graficoCurvaABCRelatorio"></canvas>
        </div>`;
    // Nota: ID 'graficoCurvaABCRelatorio' diferente do canvas na aba Curva ABC.

    container.innerHTML = html;
}


function generateCronogramaReport(container, itens) {
    if (!container) return;
    // Cronograma Estimado Simplificado (baseado no prompt: tarefa única para duração do projeto)
    // Uma implementação mais complexa envolveria durações por item, predecessores, etc.

    let totalHH = 0;
    itens.forEach(item => {
        totalHH += (parseFloatStrict(item.hhProfTotalItem) || 0) + (parseFloatStrict(item.hhAjudTotalItem) || 0);
    });

    // Estimativa de duração MUITO simplificada:
    // Assumir uma equipe e X horas/dia de trabalho.
    const horasPorDiaEquipe = 8 * 2; // Ex: 2 pessoas trabalhando 8h/dia
    const diasUteisEstimados = horasPorDiaEquipe > 0 ? Math.ceil(totalHH / horasPorDiaEquipe) : 0;
    const semanasEstimadas = Math.ceil(diasUteisEstimados / 5); // Assumindo 5 dias úteis/semana

    let html = `<h2>Cronograma Estimado (Simplificado)</h2>
                <p>Esta é uma estimativa muito básica da duração do projeto.</p>
                <p>Total de Horas-Homem (HH) calculadas: <strong>${formatCurrency(totalHH, 2, false)} HH</strong></p>
                <p>Considerando uma equipe dedicando ${horasPorDiaEquipe} HH/dia, a estimativa é de:</p>
                <p><strong>${diasUteisEstimados} dias úteis</strong> ou aproximadamente <strong>${semanasEstimadas} semanas</strong>.</p>
                
                <div id="graficoGanttEstimadoContainer" class="chart-container-gantt">
                     <!-- O gráfico de Gantt será renderizado aqui por graficoGantt.js -->
                     <div id="ganttChartRelatorio"></div> 
                </div>`;
    // Nota: ID 'ganttChartRelatorio' diferente do container na aba Cronograma.

    container.innerHTML = html;
}


// Função para obter dados para os gráficos (chamada pelos módulos de gráficos)
// Esta função pode ser expandida para retornar dados específicos para cada tipo de gráfico.
export function getReportDataForCharts() {
    const itensOrcamento = getCalculadoraItems();
    const bdiAdotado = getBdiFinalAdotado();

    if (!itensOrcamento || itensOrcamento.length === 0) {
        return {
            pizzaCustos: { labels: [], data: [] },
            curvaABC: { labels: [], dataValores: [], dataPercentAcumulado: [] },
            gantt: [] // Formato esperado por Frappe Gantt
        };
    }

    // Dados para Pizza de Custos (Material vs M.O.)
    let custoTotalMaterial = 0;
    let custoTotalMO = 0;
    itensOrcamento.forEach(item => {
        custoTotalMaterial += parseFloatStrict(item.custoTotalMaterial) || 0;
        custoTotalMO += parseFloatStrict(item.custoTotalMO) || 0;
    });
    const pizzaData = {
        labels: ['Material', 'Mão de Obra'],
        data: [custoTotalMaterial, custoTotalMO]
    };

    // Dados para Curva ABC (Pareto)
    const itensComValorABC = itensOrcamento.map(item => {
        const custoUnitTotal = (parseFloatStrict(item.custoUnitMaterial) || 0) + (parseFloatStrict(item.custoUnitMO) || 0);
        const precoVendaUnit = custoUnitTotal * (1 + (parseFloatStrict(bdiAdotado) / 100));
        return {
            descricao: item.descricao,
            valor: precoVendaUnit * (parseFloatStrict(item.quantidade) || 0)
        };
    }).sort((a, b) => b.valor - a.valor);

    const valorTotalOrcamentoABC = itensComValorABC.reduce((sum, item) => sum + item.valor, 0);
    let acumuladoPercentABC = 0;
    const curvaABCLabels = [];
    const curvaABCValores = [];
    const curvaABCPercentAcumulado = [];

    itensComValorABC.forEach(item => {
        curvaABCLabels.push(item.descricao.substring(0, 20) + '...'); // Limita tamanho da label
        curvaABCValores.push(item.valor);
        if (valorTotalOrcamentoABC > 0) {
            acumuladoPercentABC += (item.valor / valorTotalOrcamentoABC) * 100;
        }
        curvaABCPercentAcumulado.push(acumuladoPercentABC);
    });
    const curvaABCData = {
        labels: curvaABCLabels,
        dataValores: curvaABCValores,
        dataPercentAcumulado: curvaABCPercentAcumulado
    };

    // Dados para Gantt Estimado (Tarefa Única)
    let totalHHGantt = 0;
    itensOrcamento.forEach(item => {
        totalHHGantt += (parseFloatStrict(item.hhProfTotalItem) || 0) + (parseFloatStrict(item.hhAjudTotalItem) || 0);
    });
    const horasPorDiaEquipeGantt = 16; // Ex: 2 pessoas * 8h/dia
    const diasUteisGantt = horasPorDiaEquipeGantt > 0 ? Math.ceil(totalHHGantt / horasPorDiaEquipeGantt) : 1; // Min 1 dia
    
    const hoje = new Date();
    const fimEstimado = new Date(hoje);
    fimEstimado.setDate(hoje.getDate() + diasUteisGantt); // Simplista, não considera fds/feriados

    const ganttData = [{
        id: 'proj1',
        name: 'Projeto Completo (Estimativa)',
        start: hoje.toISOString().split('T')[0], // YYYY-MM-DD
        end: fimEstimado.toISOString().split('T')[0], // YYYY-MM-DD
        progress: 0, // Pode ser atualizado com base no andamento real
        // dependencies: '' // Se houver tarefas dependentes
    }];


    return {
        pizzaCustos: pizzaData,
        curvaABC: curvaABCData,
        gantt: ganttData
    };
}