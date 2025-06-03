// js/persistencia.js
import { ui } from './ui.js';
import { configManager } from './config.js';
import { calculadora } from './calculadora.js';

export const persistencia = {
    saveBudget(config, itensCalculadora) {
        if (!config || !itensCalculadora) {
            alert('Não há dados suficientes para salvar.');
            return;
        }
        const budgetData = {
            config: config,
            itensCalculadora: itensCalculadora,
            timestamp: new Date().toISOString()
        };
        try {
            const jsonData = JSON.stringify(budgetData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dataFormatada = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            a.download = `orcamento_${dataFormatada}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erro ao salvar orçamento:", error);
            alert('Erro ao tentar salvar o orçamento. Verifique o console.');
        }
    },
    loadBudget(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const budgetData = JSON.parse(e.target.result);
                if (!budgetData || typeof budgetData.config !== 'object' || !Array.isArray(budgetData.itensCalculadora)) {
                    throw new Error("Estrutura do JSON inválida.");
                }
                event.target.value = null;
                if (confirm("Deseja carregar este orçamento? Todas as alterações não salvas serão perdidas.")) {
                    const defaultConfig = configManager.config; // Pega a estrutura padrão atual
                    const loadedConfig = budgetData.config;
                    configManager.config = { ...defaultConfig, ...loadedConfig }; // Mescla, priorizando o carregado
                    calculadora.setItens(budgetData.itensCalculadora);
                    ui.resetUI(); // Isso deve chamar updateUI de config e calculadora, e updateAllTabs
                    alert('Orçamento carregado com sucesso!');
                }
            } catch (error) {
                console.error("Erro ao carregar orçamento:", error);
                alert('Erro ao carregar orçamento: O arquivo selecionado não é um JSON válido ou não corresponde à estrutura esperada.');
                event.target.value = null;
            }
        };
        reader.onerror = () => {
            alert('Erro ao ler o arquivo.');
            event.target.value = null;
        };
        reader.readAsText(file);
    }
};