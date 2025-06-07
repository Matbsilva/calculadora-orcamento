// js/util.js
export function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return "R$ 0,00";
    }
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function formatNumber(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) {
        return (0).toFixed(decimals).replace('.', ',');
    }
    return value.toFixed(decimals).replace('.', ',');
}

export function parseFloatStrict(value) {
    if (typeof value === 'number') {
        return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
        let cleanValue = String(value).replace('R$', '').trim();
        cleanValue = cleanValue.replace(',', '.'); 
        const num = parseFloat(cleanValue);
        return isNaN(num) ? 0 : num;
    }
    return 0; 
}

export function escapeCsvCell(cellData) {
    let s = String(cellData == null ? "" : cellData);
    if (s.includes(';') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export function copyTextToClipboard(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Copiado!';
            setTimeout(() => { btn.textContent = orig; }, 1500);
        }
    } catch (err) {
        console.error('Erro ao copiar para a área de transferência: ', err);
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Erro!';
            setTimeout(() => { btn.textContent = orig; }, 1500);
        }
    } finally {
        if (document.body.contains(ta)) document.body.removeChild(ta);
    }
}

export function copySectionText(sectionId, btn) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error("Elemento da seção não encontrado para cópia:", sectionId);
        return;
    }
    let txt = "";
    if (section.tagName === 'UL' || section.classList.contains('copyable-list')) {
        section.querySelectorAll('li').forEach(li => { txt += li.innerText.trim() + "\n"; });
    } else if (section.tagName === 'TABLE' || section.classList.contains('copyable-table')) {
        const headers = [];
        section.querySelectorAll('thead th').forEach(th => headers.push(th.innerText.trim()));
        txt += headers.join("\t") + "\n";
        section.querySelectorAll('tbody tr').forEach(tr => {
            const rowData = [];
            tr.querySelectorAll('td').forEach(td => rowData.push(td.innerText.trim()));
            txt += rowData.join("\t") + "\n";
        });
    } else if (section.classList.contains('copyable-text-block')) {
        section.querySelectorAll('p, div > p').forEach(p => { txt += p.textContent.trim() + "\n"; });
    }
    copyTextToClipboard(txt.trim(), btn);
}

export function validateNumberInput(inputElement, min = 0, max = Infinity, decimals = 2, errorMessageElementId = null) {
    if (!inputElement) {
        // console.warn("validateNumberInput: inputElement não fornecido.");
        return min; 
    }
    
    let cleanValueStr = String(inputElement.value).replace(',', '.');
    let val = parseFloat(cleanValueStr);
    let needsCorrection = false;
    let message = "";

    const errorElement = errorMessageElementId ? document.getElementById(errorMessageElementId) : null;
    if (errorElement) errorElement.textContent = ''; 
    inputElement.classList.remove('input-error'); 

    if (isNaN(val)) {
        const defaultValueNum = parseFloatStrict(inputElement.defaultValue); 
        val = isNaN(defaultValueNum) || defaultValueNum === null ? min : defaultValueNum;
        needsCorrection = true;
        message = "Valor inválido. Corrigido para o padrão/mínimo.";
    }
    
    if (val < min) {
        val = min;
        needsCorrection = true;
        message = `Valor abaixo do mínimo permitido (${formatNumber(min, decimals).replace('.',',')}). Corrigido.`;
    }
    if (val > max) {
        val = max;
        needsCorrection = true;
        message = `Valor acima do máximo permitido (${formatNumber(max, decimals).replace('.',',')}). Corrigido.`;
    }
    
    const formattedValForInput = val.toFixed(decimals); // Para .value, use ponto
    
    // Atualiza o value do input apenas se o valor numérico mudou ou se o formato precisa ser fixado
    if (inputElement.value.replace(',', '.') !== formattedValForInput) {
         inputElement.value = formattedValForInput; // Input type number espera ponto
    }

    if (needsCorrection) {
        inputElement.classList.add('input-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'inline'; 
        }
    } else if (errorElement) {
        errorElement.style.display = 'none';
    }
    return val; 
}


export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}