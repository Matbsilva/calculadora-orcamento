import { validateNumberInput } from './util.js';
import { updateInputValidationUI, loadConfigDataToUI } from './ui.js'; // updateAndSaveConfig removido, será feito via setConfigValue
import { setConfigValue } from './data.js'; // Usando a nova função de data.js

export function setupConfigEventListeners() {
    const configForm = document.getElementById('config-form');
    if (!configForm) return;

    const handleBlurValidation = (event, min, max = null, isInteger = false, configPath, decimalPlaces = 2) => {
        const inputElement = event.target;
        const fieldId = inputElement.id; // Usado para o ID do span de erro
        const originalRawValue = inputElement.value;

        const { isValid, value, numericValue, originalInputWasNumber } = validateNumberInput(originalRawValue, min, max, isInteger, decimalPlaces);

        if (!originalInputWasNumber && originalRawValue.trim() !== "") {
            inputElement.value = ''; // Limpa o campo se a entrada original não era um número
            updateInputValidationUI(inputElement, false, `${fieldId}-error`);
            // setConfigValue(configPath, isInteger ? 0 : 0.0); // Ou null, se preferir, para indicar "não definido"
        } else {
            inputElement.value = value;
            updateInputValidationUI(inputElement, isValid, `${fieldId}-error`); // isValid aqui refere-se ao valor *após* correção
            setConfigValue(configPath, numericValue); // Salva o valor numérico (corrigido ou não)
        }
    };

    // Mapeamento de IDs de input para caminhos de configuração e parâmetros de validação
    const configFields = [
        // Custos de Mão de Obra
        { id: 'laborPedreiro', path: 'laborCosts.pedreiro', min: 0 },
        { id: 'laborServente', path: 'laborCosts.servente', min: 0 },
        // Adicione outros custos de M.O. aqui...

        // Preços de Materiais
        { id: 'materialCimento', path: 'materialPrices.cimento', min: 0 },
        { id: 'materialAreia', path: 'materialPrices.areia', min: 0 },
        // Adicione outros materiais aqui...

        // BDI
        { id: 'bdiFinalAdotado', path: 'bdi.bdiFinalAdotado', min: 0, max: 1000 },

        // Projeto
        { id: 'areaObra', path: 'project.areaObra', min: 1, isInteger: true }
    ];

    configFields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (inputElement) {
            inputElement.addEventListener('blur', (event) => {
                handleBlurValidation(event, field.min, field.max, field.isInteger, field.path, field.isInteger ? 0 : 2);
            });
        }
    });

    // Botão Redefinir para Padrões (simplificado, idealmente os padrões viriam de data.js)
    const defaultConfigButton = document.getElementById('default-config-button');
    if (defaultConfigButton) {
        defaultConfigButton.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja redefinir todas as configurações para os valores padrão?")) {
                // Idealmente, você teria uma função em data.js para redefinir e salvar
                localStorage.removeItem('budgetConfig'); // Exemplo simples: remove e recarrega a página ou os valores default
                window.location.reload(); // Ou chamar uma função que reseta os valores no data.js e atualiza a UI
                alert("Configurações redefinidas. A página será recarregada.");
            }
        });
    }
}

// Não precisa do DOMContentLoaded aqui se main.js já chama loadConfigDataToUI e setupConfigEventListeners
// Mas se este arquivo for carregado independentemente e precisar dessas execuções:
// document.addEventListener('DOMContentLoaded', () => {
//     loadConfigDataToUI();
//     setupConfigEventListeners();
// });