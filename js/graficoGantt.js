// js/graficoGantt.js
// Frappe Gantt é uma variável global quando carregado via CDN

let ganttInstance = null;

export function initGraficoGantt() {
    const container = document.getElementById('graficoGantt'); // Frappe usa o SVG diretamente
    if (!container) {
        console.warn('Container SVG para Gráfico de Gantt não encontrado.');
        return;
    }
    // A instância do Gantt é criada/recriada em renderizarGraficoGantt
}

export function destroyChartGantt() {
    const container = document.getElementById('graficoGanttContainer');
    if (container) {
        container.innerHTML = '<svg id="graficoGantt"></svg>'; // Limpa o container recriando o SVG
    }
    ganttInstance = null; // Limpa a referência da instância
}


export function renderizarGraficoGantt(itensCalculadora, duracaoTotalObraMeses, dataInicioObra = new Date()) {
    destroyChartGantt(); // Limpa o gráfico anterior

    const ganttContainerId = 'graficoGantt'; // ID do elemento SVG
    const ganttElement = document.getElementById(ganttContainerId);

    if (!ganttElement) {
        console.error('Elemento SVG para Gantt não encontrado:', ganttContainerId);
        return;
    }
    
    if (duracaoTotalObraMeses <= 0) {
        ganttElement.innerHTML = ''; // Limpa se não houver duração
        return;
    }

    // Formatar data de início para 'YYYY-MM-DD'
    const inicioAno = dataInicioObra.getFullYear();
    const inicioMes = String(dataInicioObra.getMonth() + 1).padStart(2, '0'); // Meses são 0-indexados
    const inicioDia = String(dataInicioObra.getDate()).padStart(2, '0');
    const dataInicioFormatada = `${inicioAno}-${inicioMes}-${inicioDia}`;

    // Calcular data de fim
    let dataFimObra = new Date(dataInicioObra);
    dataFimObra.setMonth(dataFimObra.getMonth() + duracaoTotalObraMeses);
    const fimAno = dataFimObra.getFullYear();
    const fimMes = String(dataFimObra.getMonth() + 1).padStart(2, '0');
    const fimDia = String(dataFimObra.getDate()).padStart(2, '0');
    const dataFimFormatada = `${fimAno}-${fimMes}-${fimDia}`;
    
    const tasks = [
        {
            id: 'obra_total',
            name: 'Duração Total Estimada da Obra',
            start: dataInicioFormatada,
            end: dataFimFormatada,
            progress: 5, // Progresso inicial simbólico, pode ser atualizado
            custom_class: 'bar-milestone' // Exemplo de classe customizada
        }
    ];

    // TODO: Detalhar tarefas com base nos itens da calculadora se desejado no futuro.
    // Por agora, uma única barra representando o projeto total.

    if (tasks.length > 0) {
        try {
            ganttInstance = new Gantt(`#${ganttContainerId}`, tasks, {
                // header_height: 50,
                // bar_height: 20,
                // step: 24, // 1 dia
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_corner_radius: 3,
                // arrow_curve: 5,
                padding: 18,
                view_mode: 'Month', // Modo de visualização inicial
                date_format: 'YYYY-MM-DD',
                language: 'pt', // Se houver tradução disponível na lib ou customizada
                custom_popup_html: function(task) {
                    // Customizar o popup que aparece ao clicar na barra
                    const start_date = new Date(task._start).toLocaleDateString('pt-BR');
                    const end_date = new Date(task._end).toLocaleDateString('pt-BR');
                    return `
                        <div class="gantt-popup">
                            <strong>${task.name}</strong><br/>
                            Início: ${start_date}<br/>
                            Fim: ${end_date}<br/>
                            Progresso: ${task.progress}%
                        </div>
                    `;
                }
            });
        } catch (e) {
            console.error("Erro ao renderizar gráfico de Gantt:", e);
            ganttElement.innerHTML = '<p style="color:red;">Erro ao renderizar o gráfico de Gantt.</p>';
        }
    } else {
        ganttElement.innerHTML = ''; // Limpa se não houver tarefas
    }
}