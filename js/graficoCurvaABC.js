// js/graficoCurvaABC.js
import { formatCurrency, formatPercentage } from './utils.js';

let chartCurvaABCInstance = null;

export function initGraficoCurvaABC() {
    const canvas = document.getElementById('graficoCurvaABCCanvas');
    if (!canvas) {
        console.warn('Canvas para Gráfico Curva ABC não encontrado.');
        return;
    }
    // Inicialização pode ser adiada para a primeira renderização se necessário
}

export function destroyChartCurvaABC() {
    if (chartCurvaABCInstance) {
        chartCurvaABCInstance.destroy();
        chartCurvaABCInstance = null;
    }
}

export function renderizarGraficoCurvaABC(dadosCurvaABC) {
    destroyChartCurvaABC(); // Destrói gráfico anterior, se existir

    const canvas = document.getElementById('graficoCurvaABCCanvas');
    if (!canvas || !dadosCurvaABC || dadosCurvaABC.length === 0) {
        // Limpar o canvas ou mostrar mensagem de "sem dados"
        if(canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Opcional: ctx.fillText("Sem dados para exibir.", 10, 50);
        }
        return;
    }

    const ctx = canvas.getContext('2d');

    const labels = dadosCurvaABC.map(item => item.nome.length > 30 ? item.nome.substring(0,27)+'...' : item.nome); // Nomes dos serviços (labels)
    const custosIndividuais = dadosCurvaABC.map(item => item.custo); // Custos individuais (barras)
    const percentuaisAcumulados = dadosCurvaABC.map(item => item.percentualAcumulado); // Percentual acumulado (linha)

    chartCurvaABCInstance = new Chart(ctx, {
        type: 'bar', // Gráfico de barras principal
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Custo Individual (R$)',
                    data: custosIndividuais,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Azul
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'yCusto', // Eixo Y primário para custo
                    order: 2 // Para garantir que a barra fique atrás da linha
                },
                {
                    label: '% Acumulada',
                    data: percentuaisAcumulados,
                    type: 'line', // Tipo de gráfico de linha sobreposto
                    borderColor: 'rgba(255, 99, 132, 1)', // Vermelho
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'yPercentual', // Eixo Y secundário para percentual
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    stacked: false, // Barras não empilhadas
                     ticks: {
                        autoSkip: false, // Não pular labels automaticamente
                        maxRotation: 70, // Rotacionar labels para caber
                        minRotation: 45
                    }
                },
                yCusto: { // Eixo Y primário para os custos
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Custo (R$)'
                    },
                    beginAtZero: true
                },
                yPercentual: { // Eixo Y secundário para o percentual acumulado
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100, // Percentual vai de 0 a 100
                    title: {
                        display: true,
                        text: '% Acumulada'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + "%";
                        }
                    },
                    grid: { // Para não sobrepor a grade do eixo primário
                        drawOnChartArea: false, 
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.yAxisID === 'yCusto' && context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            if (context.dataset.yAxisID === 'yPercentual' && context.parsed.y !== null) {
                                label += formatPercentage(context.parsed.y, 2);
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Curva ABC de Custos de Serviços'
                }
            }
        }
    });
}