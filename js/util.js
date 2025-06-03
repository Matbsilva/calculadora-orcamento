// js/util.js

/**
 * Valida e formata um valor numérico de um input.
 * @param {string} value O valor do input.
 * @param {number} min O valor mínimo permitido.
 * @param {number|null} max O valor máximo permitido (null se não houver máximo).
 * @param {boolean} isInteger Se o valor deve ser um inteiro.
 * @param {number} decimalPlaces O número de casas decimais para arredondamento (padrão 2).
 * @returns {{
 *  isValid: boolean, // Se o valor final é válido após correções
 *  value: string, // O valor formatado (string)
 *  numericValue: number, // O valor numérico
 *  originalInputWasNumber: boolean // Se a entrada original era um número (antes de verificar min/max)
 * }}
 */
export function validateNumberInput(value, min, max = null, isInteger = false, decimalPlaces = 2) {
    const originalValueStr = String(value).trim();
    let parsedValue = isInteger ? parseInt(originalValueStr, 10) : parseFloat(originalValueStr);
    let numericValue = parsedValue; 

    let isValid = true;
    let originalInputWasNumber = !isNaN(parsedValue) && originalValueStr !== "";

    if (!originalInputWasNumber) {
        numericValue = min; 
        isValid = false;
    } else { 
        if (numericValue < min) {
            numericValue = min;
            isValid = false;
        }
        if (max !== null && numericValue > max) {
            numericValue = max;
            isValid = false;
        }
    }

    if (isInteger) {
        const finalNumericValue = Math.round(numericValue);
        return {
            isValid: isValid && originalInputWasNumber, 
            value: String(finalNumericValue),
            numericValue: finalNumericValue,
            originalInputWasNumber
        };
    } else {
        const factor = Math.pow(10, decimalPlaces);
        const roundedValue = Math.round(numericValue * factor) / factor;
        return {
            isValid: isValid && originalInputWasNumber,
            value: roundedValue.toFixed(decimalPlaces),
            numericValue: roundedValue,
            originalInputWasNumber
        };
    }
}


/**
 * Função Debounce para atrasar a execução de uma função.
 * @param {Function} func A função a ser executada após o debounce.
 * @param {number} delay O tempo de atraso em milissegundos.
 * @returns {Function}
 */
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Escapa uma string para ser usada com segurança em uma célula CSV.
 * @param {*} cellData O dado da célula.
 * @returns {string} A string escapada para CSV.
 */
export function escapeCsvCell(cellData) {
    if (cellData == null) { 
        return '';
    }
    const stringData = String(cellData);
    if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n') || stringData.includes('\r')) {
        const escapedString = stringData.replace(/"/g, '""');
        return `"${escapedString}"`;
    }
    return stringData;
}

/**
 * Formata um número para uma string com um número fixo de casas decimais.
 * @param {number | string} numberToFormat O número ou string numérica a ser formatada.
 * @param {number} decimalPlaces O número de casas decimais desejadas (padrão 2).
 * @returns {string} O número formatado como string, ou string vazia se a entrada não for um número válido.
 */
export function formatNumber(numberToFormat, decimalPlaces = 2) {
    const num = parseFloat(numberToFormat);
    if (isNaN(num)) {
        // Retorna '0.00' formatado para consistência na UI, se um número é esperado.
        // Para exportação, pode ser melhor retornar string vazia se a intenção for omitir.
        // Ajuste conforme a necessidade do contexto de uso.
        return (0).toFixed(decimalPlaces); 
    }
    return num.toFixed(decimalPlaces);
}