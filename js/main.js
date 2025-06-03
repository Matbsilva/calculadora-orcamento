// js/main.js
import { ui } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Inicializa o módulo principal da UI.
     * O ui.init() é responsável por configurar a navegação das abas,
     * popular seletores, configurar event listeners globais e
     * inicializar outros módulos da aplicação como configManager,
     * calculadora e simulacoesBDI.
     */
    ui.init();
});