// js/main.js
import { ui } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o módulo principal da UI, que por sua vez
    // orquestra a inicialização dos outros módulos.
    ui.init();
});