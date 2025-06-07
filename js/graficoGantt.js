// js/graficoGantt.js
// Módulo para o gráfico de Gantt Estimado.

import { getReportDataForCharts } from './relatorios.js'; // Para buscar os dados formatados
// Frappe Gantt é carregado via CDN

let ganttInstance = null;
let ganttElementContainer = null; // O elemento DIV onde o Gantt será renderizado

export function initGraficoGanttEstimado(ganttElContainer) {
    console.log("graficoGantt.initGraficoGanttEstimado() chamado");
    if (!ganttElContainer) {
        console.error("Elemento container para o gráfico de Gantt não fornecido.");
        return;
    }
    ganttElementContainer = ganttElContainer;

    // Verifica se Gantt (Frappe Gantt) já está disponível
    if (typeof Gantt === 'undefined') {
        console.error("Frappe Gantt não está carregado. Verifique a inclusão do CDN.");
        return;
    }

    // Limpa o container antes de renderizar um novo gráfico
    ganttElementContainer.innerHTML = '';

    const tasks = getReportDataForCharts().gantt;

    if (!tasks || tasks.length === 0) {
        console.warn("Nenhuma tarefa para exibir no gráfico de Gantt.");
        ganttElementContainer.textContent = 'Não há dados suficientes para gerar o cronograma estimado.';
        return;
    }
    
    try {
        // Frappe Gantt não tem um método destroy fácil como Chart.js.
        // A recriação é feita limpando o container e instanciando novamente.
        ganttInstance = new Gantt(ganttElementContainer, tasks, {
            // Opções de configuração do Frappe Gantt
            header_height: 50,
            column_width: 30,
            step: 24, // Horas
            view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'], // Modos de visualização
            bar_height: 20,
            bar_corner_radius: 3,
            arrow_curve: 5,
            padding: 18,
            view_mode: 'Week', // Modo de visualização padrão
            date_format: 'YYYY-MM-DD',
            language: 'ptBr', // Se você tiver tradução para ptBr
            custom_popup_html: function(task) {
                // Popup customizado ao passar o mouse sobre uma tarefa
                const start_date = new Date(task._start).toLocaleDateString('pt-BR');
                const end_date = new Date(task._end).toLocaleDateString('pt-BR');
                return `
                    <div class="gantt-popup-content">
                        <h5>${task.name}</h5>
                        <p>Início: ${start_date}</p>
                        <p>Fim: ${end_date}</p>
                        <p>Progresso: ${task.progress}%</p>
                    </div>
                `;
            }
            // onClick: (task) => { console.log(task.name + ' clicada'); },
            // on_date_change: (task, start, end) => { /* ... */ },
            // on_progress_change: (task, progress) => { /* ... */ },
        });
        console.log("Gráfico de Gantt inicializado/atualizado.");
    } catch (error) {
        console.error("Erro ao criar/atualizar o gráfico de Gantt:", error);
        ganttElementContainer.textContent = 'Erro ao renderizar o gráfico de Gantt.';
    }
}

export function updateGraficoGanttEstimado() {
    console.log("graficoGantt.updateGraficoGanttEstimado() chamado");
    if (!ganttElementContainer) { // Se o container não foi definido, não pode atualizar
        console.error("Container do gráfico de Gantt não definido. Não é possível atualizar.");
        return;
    }
    // Frappe Gantt não tem um método 'update' simples como Chart.js.
    // A forma mais segura de atualizar com novos dados é reinicializar.
    console.log("Reinicializando gráfico de Gantt para atualização.");
    initGraficoGanttEstimado(ganttElementContainer);
}