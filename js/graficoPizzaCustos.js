// js/graficoPizzaCustos.js
// Módulo para o gráfico de Pizza/Doughnut de Custos (Material vs M.O.).

import { getReportDataForCharts } from './relatorios.js'; // Para buscar os dados formatados
// Chart.js é carregado via CDN, então não há import local do módulo Chart.js

let chartPizzaInstance = null;
let canvasElement = null;

export function initGraficoPizzaCustos(canvasEl) {
    console.log("graficoPizzaCustos.initGraficoPizzaCustos() chamado");
    if (!canvasEl) {
        console.error("Elemento canvas para o gráfico de pizza não fornecido.");
        return;
    }
    canvasElement = canvasEl; // Armazena a referência ao canvas

    // Verifica se Chart já está disponível (carregado via CDN)
    if (typeof Chart === 'undefined') {
        console.error("Chart.js não está carregado. Verifique a inclusão do CDN.");
        return;
    }
    
    const dataForChart = getReportDataForCharts().pizzaCustos;

    const chartData = {
        labels: dataForChart.labels.length > 0 ? dataForChart.labels : ['Nenhum dado'],
        datasets: [{
            label: 'Composição de Custos Diretos',
            data: dataForChart.data.length > 0 ? dataForChart.data : [100], // Mostra algo se vazio
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)', // Vermelho para Material
                'rgba(54, 162, 235, 0.7)'  // Azul para M.O.
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'doughnut', // ou 'pie'
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Custos Diretos (Material vs M.O.)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    };

    try {
        if (chartPizzaInstance) {
            chartPizzaInstance.destroy(); // Destrói instância anterior se houver
        }
        chartPizzaInstance = new Chart(canvasElement, config);
        console.log("Gráfico de Pizza de Custos inicializado/atualizado.");
    } catch (error) {
        console.error("Erro ao criar/atualizar o gráfico de Pizza de Custos:", error);
    }
}

// Função para atualizar o gráfico quando os dados mudarem
export function updateGraficoPizzaCustos() {
    console.log("graficoPizzaCustos.updateGraficoPizzaCustos() chamado");
    if (!chartPizzaInstance) {
        console.warn("Instância do gráfico de pizza não existe. Tentando inicializar.");
        if (canvasElement) { // Tenta reinicializar se o canvas existir
             initGraficoPizzaCustos(canvasElement);
        } else {
            console.error("Não é possível atualizar o gráfico de pizza: instância e canvas não encontrados.");
        }
        return;
    }

    const dataForChart = getReportDataForCharts().pizzaCustos;

    if (dataForChart.labels.length === 0 || dataForChart.data.reduce((a, b) => a + b, 0) === 0) {
        // Se não há dados ou todos os dados são zero, mostra mensagem ou estado vazio
        chartPizzaInstance.data.labels = ['Sem dados para exibir'];
        chartPizzaInstance.data.datasets[0].data = [1]; // Para o gráfico não quebrar
        chartPizzaInstance.data.datasets[0].backgroundColor = ['rgba(200, 200, 200, 0.7)'];
        chartPizzaInstance.data.datasets[0].borderColor = ['rgba(200, 200, 200, 1)'];
    } else {
        chartPizzaInstance.data.labels = dataForChart.labels;
        chartPizzaInstance.data.datasets[0].data = dataForChart.data;
        chartPizzaInstance.data.datasets[0].backgroundColor = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)'
        ];
        chartPizzaInstance.data.datasets[0].borderColor = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)'
        ];
    }
    chartPizzaInstance.update();
    console.log("Gráfico de Pizza de Custos atualizado.");
}

// Não há getChartDataPizza porque os dados são buscados de relatorios.js