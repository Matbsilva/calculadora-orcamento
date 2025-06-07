// js/utils.js
// Funções utilitárias diversas para a aplicação.

// Tenta converter uma string (possivelmente com R$, vírgula decimal) para float.
// Retorna NaN se a conversão falhar.
export function parseFloatStrict(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value !== 'string') {
        return NaN;
    }
    // Remove "R$", espaços, e substitui vírgula por ponto.
    const cleanedValue = value.replace("R$", "").replace(/\s/g, "").replace(",", ".");
    // Se após limpar, a string estiver vazia ou for apenas um ponto, considera NaN.
    if (cleanedValue === "" || cleanedValue === ".") {
        return NaN;
    }
    const num = parseFloat(cleanedValue);
    return isNaN(num) ? NaN : num;
}


// Formata um número como moeda (BRL) ou número genérico.
export function formatCurrency(
    value,
    decimalPlaces = 2,
    useGrouping = true,
    showCurrencySymbol = true // true para R$, false para apenas número formatado
) {
    const numValue = parseFloatStrict(value);
    if (isNaN(numValue)) {
        // return "N/A"; // Ou string vazia, ou 0.00, dependendo do contexto
        return showCurrencySymbol ? "R$ 0,00" : "0,00";
    }

    const options = {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
        useGrouping: useGrouping
    };

    if (showCurrencySymbol) {
        options.style = 'currency';
        options.currency = 'BRL';
    }

    return new Intl.NumberFormat('pt-BR', options).format(numValue);
}

// Gera um UUID v4 simples (suficiente para IDs únicos no frontend)
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Função Debounce: Atrasar a execução de uma função até que um certo tempo tenha passado sem chamadas.
// Útil para inputs de pesquisa, validações em tempo real, etc.
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Função para exibir alertas/mensagens simples para o usuário.
// Pode ser expandida para usar um sistema de notificações mais robusto.
export function showAlert(message, type = 'info', duration = 3000) {
    // Tipos podem ser 'info', 'success', 'warning', 'error'
    console.log(`[${type.toUpperCase()}] Alert: ${message}`);

    // Criação de um elemento de alerta simples no DOM
    const alertBox = document.createElement('div');
    alertBox.className = `custom-alert alert-${type}`; // Adiciona classes para estilização
    alertBox.textContent = message;

    // Estilização básica (pode ser movida para CSS)
    alertBox.style.position = 'fixed';
    alertBox.style.bottom = '20px';
    alertBox.style.right = '20px';
    alertBox.style.padding = '15px';
    alertBox.style.borderRadius = '5px';
    alertBox.style.color = 'white';
    alertBox.style.zIndex = '10001'; // Acima de outros elementos
    alertBox.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    alertBox.style.opacity = '0';
    alertBox.style.transition = 'opacity 0.5s ease-in-out';

    switch (type) {
        case 'success':
            alertBox.style.backgroundColor = '#28a745'; // Verde
            break;
        case 'warning':
            alertBox.style.backgroundColor = '#ffc107'; // Amarelo
            alertBox.style.color = '#333';
            break;
        case 'error':
            alertBox.style.backgroundColor = '#dc3545'; // Vermelho
            break;
        case 'info':
        default:
            alertBox.style.backgroundColor = '#17a2b8'; // Azul info
            break;
    }

    document.body.appendChild(alertBox);

    // Fade in
    setTimeout(() => {
        alertBox.style.opacity = '1';
    }, 100);

    // Remove o alerta após a duração especificada
    if (duration > 0) {
        setTimeout(() => {
            alertBox.style.opacity = '0';
            setTimeout(() => {
                if (alertBox.parentNode) {
                    alertBox.parentNode.removeChild(alertBox);
                }
            }, 500); // Tempo para a transição de fade out
        }, duration);
    }
    // Se duration for 0 ou negativo, o alerta permanece até ser fechado manualmente (não implementado aqui)
}

// Adicione outras funções utilitárias que você possa precisar.
// Ex: capitalizeString, sortArrayOfObjects, etc.