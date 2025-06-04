// js/utils.js

/**
 * Converte uma string de moeda (ex: "R$ 1.234,56" ou "1234.56") para um número.
 * Seu data.js original usava parseFloatStrict, esta é uma versão mais robusta.
 * @param {string|number} currencyString A string da moeda ou um número.
 * @returns {number} O valor numérico ou NaN se inválido.
 */
export function parseCurrency(currencyString) {
    if (typeof currencyString === 'number') return currencyString;
    if (typeof currencyString !== 'string') {
        currencyString = String(currencyString);
    }
    // Remove "R$", todos os pontos (milhares) e troca vírgula por ponto decimal
    const cleanedString = currencyString.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.');
    const value = parseFloat(cleanedString);
    return isNaN(value) ? 0 : value; // Retorna 0 se não for um número válido após limpeza
}

/**
 * Formata um número como uma string de moeda brasileira (R$ 1.234,56).
 * @param {number} value O valor numérico.
 * @param {boolean} includeSymbol Incluir o símbolo "R$ ".
 * @returns {string} A string formatada da moeda.
 */
export function formatCurrency(value, includeSymbol = true) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return includeSymbol ? "R$ 0,00" : "0,00";
    }
    // Usar toLocaleString para formatação correta de milhares e decimais
    let formatted = numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return includeSymbol ? `R$ ${formatted}` : formatted;
}

/**
 * Converte uma string de porcentagem (ex: "25,5%" ou "25.5") para um número.
 * @param {string|number} percentageString A string da porcentagem ou um número.
 * @returns {number} O valor numérico ou NaN se inválido.
 */
export function parsePercentage(percentageString) {
    if (typeof percentageString === 'number') return percentageString;
    if (typeof percentageString !== 'string') {
        percentageString = String(percentageString);
    }
    const cleanedString = percentageString.replace('%', '').replace(',', '.').trim();
    const value = parseFloat(cleanedString);
    return isNaN(value) ? 0 : value; // Retorna 0 se não for um número válido
}

/**
 * Formata um número como uma string de porcentagem (ex: "25,50%").
 * @param {number} value O valor numérico.
 * @param {number} decimalPlaces Número de casas decimais.
 * @returns {string} A string formatada da porcentagem.
 */
export function formatPercentage(value, decimalPlaces = 2) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        let zeroDecimal = '0'.repeat(decimalPlaces);
        return `0,${zeroDecimal}%`;
    }
    return `${numValue.toFixed(decimalPlaces).replace('.', ',')}%`;
}

/**
 * Função Debounce: Atraso na execução de uma função após um período de inatividade.
 * @param {Function} func A função a ser executada com debounce.
 * @param {number} delay O tempo de atraso em milissegundos.
 * @returns {Function} A função "debounced".
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
 * Seu parseFloatStrict - mantido para compatibilidade se alguma lógica específica depender dele,
 * embora parseCurrency e parsePercentage agora sejam mais robustos.
 * @param {*} value
 * @returns {number}
 */
export function parseFloatStrict(value) {
    if (typeof value === 'string') {
        value = value.replace(',', '.'); // Garante que vírgula seja ponto
    }
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num; // Retorna 0 se NaN, como no seu original
}