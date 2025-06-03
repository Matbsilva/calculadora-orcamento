// js/configuracao.js
import { validateNumberInput } from './util.js';
import { updateInputValidationUI } from './ui.js'; 
import { setConfigValue } from './data.js'; 

export function setupConfigEventListeners() {
    const configForm = document.getElementById('config-form');
    if (!configForm) return;

    const handleBlurValidation = (event, min, max = null, isInteger = false, configPath, decimalPlaces = 2) => {
        const inputElement = event.target;
        const fieldId = inputElement.id; 
        const originalRawValue = inputElement.value;

        const { isValid, value, numericValue, originalInputWasNumber } = validateNumberInput(originalRawValue, min, max, isInteger, decimalPlaces);

        if (!originalInputWasNumber && originalRawValue.trim() !== "") {
            inputElement.value = ''; 
            updateInputValidationUI(inputElement, false, `${fieldId}-error`);
            // setConfigValue(configPath, isInteger ? 0 : 0.0); // Define um valor default se limpo
        } else {
            inputElement.value = value;
            updateInputValidationUI(inputElement, isValid && originalInputWasNumber, `${fieldId}-error`);
            setConfigValue(configPath, numericValue); 
        }
    };

    const configFields = [
        { id: 'laborPedreiro', path: 'laborCosts.pedreiro', min: 0 },
        { id: 'laborServente', path: 'laborCosts.servente', min: 0 },
        { id: 'laborImpermeabilizador', path: 'laborCosts.impermeabilizador', min: 0 },
        { id: 'laborCarpinteiro', path: 'laborCosts.carpinteiro', min: 0 },
        { id: 'laborArmador', path: 'laborCosts.armador', min: 0 },

        { id: 'materialAreiaSaco20kg', path: 'materialPrices.areiaSaco20kg', min: 0 },
        { id: 'materialCimento50kg', path: 'materialPrices.cimento50kg', min: 0 },
        // Adicione os IDs corretos para todos os seus materiais aqui
        // Exemplo: { id: 'materialBlocoCeramico9cm', path: 'materialPrices.blocoCeramico9cm', min: 0 },


        { id: 'bdiFinalAdotado', path: 'bdi.bdiFinalAdotado', min: 0, max: 1000 },
        { id: 'areaObra', path: 'project.areaObra', min: 1, isInteger: true }
    ];

    configFields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (inputElement) {
            // Adiciona um data-attribute para o configPath se não quiser construir no JS
            // inputElement.dataset.configPath = field.path; 
            inputElement.addEventListener('blur', (event) => {
                handleBlurValidation(event, field.min, field.max, field.isInteger, field.path, field.isInteger ? 0 : 2);
            });
        } else {
            console.warn(`Elemento de configuração com ID '${field.id}' não encontrado no HTML.`);
        }
    });

    const defaultConfigButton = document.getElementById('default-config-button');
    if (defaultConfigButton) {
        defaultConfigButton.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja redefinir todas as configurações para os valores padrão?")) {
                localStorage.removeItem('budgetManagerData'); 
                window.location.reload(); 
                alert("Configurações redefinidas. A página será recarregada.");
            }
        });
    }
}