// js/utils.js

export function parseCurrency(currencyString) {
    if (typeof currencyString !== 'string') {
        if (typeof currencyString === 'number') return currencyString;
        currencyString = String(currencyString);
    }
    const cleanedString = currencyString.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanedString);
}

export function formatCurrency(value, includeSymbol = true) {
    if (isNaN(parseFloat(value))) {
        return includeSymbol ? "R$ 0,00" : "0,00";
    }
    let formatted =  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return includeSymbol ? `R$ ${formatted}` : formatted;
}

export function parsePercentage(percentageString) {
    if (typeof percentageString !== 'string') {
        if (typeof percentageString === 'number') return percentageString;
        percentageString = String(percentageString);
    }
    const cleanedString = percentageString.replace('%', '').replace(',', '.').trim();
    return parseFloat(cleanedString);
}

export function formatPercentage(value, decimalPlaces = 2) {
    if (isNaN(parseFloat(value))) {
        return `0,${'0'.repeat(decimalPlaces)}%`;
    }
    return `${Number(value).toFixed(decimalPlaces).replace('.', ',')}%`;
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