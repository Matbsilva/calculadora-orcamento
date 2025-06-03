// js/graficoPizzaCustos.js
import { formatCurrency, formatPercentage } from './utils.js';

let chartPizzaCustosInstance = null;

export function initGraficoPizzaCustos() {
    const canvas = document.getElementById('graficoPizzaCustosCanvas');
    if (!canvas) {
        console.warn('Canvas para Gráfico de Pizza de Custos não encontrado.');
        return;
    }
}

export function destroyChartPizzaCustos() {
    if (chartPizzaCustosInstance) {
        chartPizzaCustosInstance.destroy();
        chartPizzaCustosInstance = null;
    }
}

export function renderizarGraficoPizzaCustos(config) { // config contém os totais de MO e Materiais
    destroyChartPizzaCustos();

    const canvas = document.getElementById('graficoPizzaCustosCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    if (!config || (config.totalMateriais === 0 && config.totalMO === 0)) {
         // Se não há dados (ou seja, config é null ou os totais são zero)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Opcional: ctx.fillText("Sem dados para exibir.", 10, 50);
        return;
    }
    
    // Precisa buscar os totais de materiais e MO.
    // Isso deve vir do resumoFinanceiro ou ser passado para esta função.
    // Por agora, vamos assumir que configManager.config contém esses totais ou eles são passados.
    // No ui.js, a chamada deve ser tipo: renderizarGraficoPizzaCustos(resumoFinanceiro.getTotaisMoMaterial());
    // Ou, se estiverem no config:
    const totalMateriais = config.totalMateriais || 0; // Supondo que esses valores estão no objeto config passado
    const totalMO = config.totalMO || 0;               // Ou que foram calculados e passados.
                                                    // No `ui.js`, `resumoFinanceiro.updateResumo` calcula isso.
                                                    // Podemos pegar do DOM ou fazer `resumoFinanceiro` expor esses totais.
                                                    // Para simplificar AGORA, vamos pegar do config,
                                                    // mas o ideal é que `resumoFinanceiro` forneça esses dados.
                                                    // NO `ui.js` eu passei `configManager.config` para esta função.
                                                    // Vamos recalcular a partir dele ou usar os valores de resumo do DOM.
                                                    // Para ser mais robusto, é melhor recalcular ou ter uma fonte de dados direta.
    
    // A forma correta é pegar do resumo que já calculou:
    const elTotalMat = document.getElementById('resumoTotalMateriais');
    const elTotalMO = document.getElementById('resumoTotalMO');

    const custoTotalMateriais = elTotalMat ? parseCurrency(elTotalMat.textContent) : 0;
    const custoTotalMO = elTotalMO ? parseCurrency(elTotalMO.textContent) : 0;

    if (custoTotalMateriais === 0 && custoTotalMO === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }


    chartPizzaCustosInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Custo Total de Materiais', 'Custo Total de Mão de Obra'],
            datasets: [{
                label: 'Distribuição de Custos',
                data: [custoTotalMateriais, custoTotalMO],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)', // Azul para Materiais
                    'rgba(255, 159, 64, 0.7)'  // Laranja para M.O.
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Custos (Material vs. M.O.)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.parsed;
                            const sum = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = sum > 0 ? (value / sum * 100).toFixed(2) : 0;
                            label += formatCurrency(value) + ` (${percentage}%)`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}