// js/graficoCurvaABC.js
// Módulo para o gráfico de Curva ABC (Pareto).

import { getReportDataForCharts } from './relatorios.js'; // Para buscar os dados formatados
// Chart.js é carregado via CDN

let chartCurvaABCInstance = null;
let canvasElementABC = null;

export function initGraficoCurvaABC(canvasEl) {
    console.log("graficoCurvaABC.initGraficoCurvaABC() chamado");
    if (!canvasEl) {
        console.error("Elemento canvas para o gráfico Curva ABC não fornecido.");
        return;
    }
    canvasElementABC = canvasEl;

    if (typeof Chart === 'undefined') {
        console.error("Chart.js não está carregado. Verifique a inclusão do CDN.");
        return;
    }

    const dataForChart = getReportDataForCharts().curvaABC;

    const chartData = {
        labels: dataForChart.labels.length > 0 ? dataForChart.labels : ['Nenhum item'],
        datasets: [
            {
                type: 'bar',
                label: 'Valor do Item (R$)',
                data: dataForChart.dataValores.length > 0 ? dataForChart.dataValores : [0],
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                yAxisID: 'y', // Eixo Y primário para os valores
            },
            {
                type: 'line',
                label: '% Acumulada',
                data: dataForChart.dataPercentAcumulado.length > 0 ? dataForChart.dataPercentAcumulado : [0],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1,
                fill: false,
                yAxisID: 'y1', // Eixo Y secundário para a porcentagem
            }
        ]
    };

    const config = {
        // type: 'bar', // Definido nos datasets
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index', // Mostra tooltips para todos os datasets no mesmo índice
                intersect: false,
            },
            stacked: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Curva ABC de Serviços (Pareto)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.dataset.type === 'line') {
                                    label += context.parsed.y.toFixed(2) + '%';
                                } else {
                                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true, // Embora não haja barras empilhadas, é comum para Pareto visualmente
                },
                y: { // Eixo Y primário (valores)
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    beginAtZero: true
                },
                y1: { // Eixo Y secundário (percentual acumulado)
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100, // Percentual vai de 0 a 100
                    title: {
                        display: true,
                        text: '% Acumulada'
                    },
                    grid: {
                        drawOnChartArea: false, // Apenas desenha a linha do eixo, não as grades no gráfico
                    },
                    ticks: {
                        callback: function(value) {
                            return value + "%";
                        }
                    }
                }
            }
        }
    };
    
    try {
        if (chartCurvaABCInstance) {
            chartCurvaABCInstance.destroy();
        }
        chartCurvaABCInstance = new Chart(canvasElementABC, config);
        console.log("Gráfico Curva ABC inicializado/atualizado.");
    } catch (error) {
        console.error("Erro ao criar/atualizar o gráfico Curva ABC:", error);
    }
}

export function updateGraficoCurvaABC() {
    console.log("graficoCurvaABC.updateGraficoCurvaABC() chamado");
    if (!chartCurvaABCInstance) {
        console.warn("Instância do gráfico Curva ABC não existe. Tentando inicializar.");
        if (canvasElementABC) {
            initGraficoCurvaABC(canvasElementABC);
        } else {
            console.error("Não é possível atualizar o gráfico Curva ABC: instância e canvas não encontrados.");
        }
        return;
    }

    const dataForChart = getReportDataForCharts().curvaABC;

    if (dataForChart.labels.length === 0) {
        chartCurvaABCInstance.data.labels = ['Nenhum item para Curva ABC'];
        chartCurvaABCInstance.data.datasets[0].data = [0]; // Barras
        chartCurvaABCInstance.data.datasets[1].data = [0]; // Linha
    } else {
        chartCurvaABCInstance.data.labels = dataForChart.labels;
        chartCurvaABCInstance.data.datasets[0].data = dataForChart.dataValores;
        chartCurvaABCInstance.data.datasets[1].data = dataForChart.dataPercentAcumulado;
    }
    chartCurvaABCInstance.update();
    console.log("Gráfico Curva ABC atualizado.");
}