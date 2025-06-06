// js/utils.js
export function parseCurrency(currencyString) {
    if (typeof currencyString === 'number') return currencyString;
    if (typeof currencyString !== 'string') {
        currencyString = String(currencyString);
    }
    const cleanedString = currencyString.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.');
    const value = parseFloat(cleanedString);
    return isNaN(value) ? 0 : value;
}
export function formatCurrency(value, includeSymbol = true) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return includeSymbol ? "R$ 0,00" : "0,00";
    }
    let formatted = numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return includeSymbol ? `R$ ${formatted}` : formatted;
}
export function parsePercentage(percentageString) {
    if (typeof percentageString === 'number') return percentageString;
    if (typeof percentageString !== 'string') {
        percentageString = String(percentageString);
    }
    const cleanedString = percentageString.replace('%', '').replace(',', '.').trim();
    const value = parseFloat(cleanedString);
    return isNaN(value) ? 0 : value;
}
export function formatPercentage(value, decimalPlaces = 2) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        let zeroDecimal = '0'.repeat(decimalPlaces);
        return `0,${zeroDecimal}%`;
    }
    return `${numValue.toFixed(decimalPlaces).replace('.', ',')}%`;
}
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
export function parseFloatStrict(value) {
    if (typeof value === 'string') {
        value = value.replace(',', '.'); 
    }
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num; 
}