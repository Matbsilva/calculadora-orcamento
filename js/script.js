function calcularOrcamento() {
    // Obter elementos de input
    const precoInput = document.getElementById('preco');
    const quantidadeInput = document.getElementById('quantidade');
    const maoDeObraInput = document.getElementById('maoDeObra');
    const margemLucroInput = document.getElementById('margemLucro');

    // Obter elementos de mensagem de erro
    const precoError = document.getElementById('precoError');
    const quantidadeError = document.getElementById('quantidadeError');
    const maoDeObraError = document.getElementById('maoDeObraError');
    const margemLucroError = document.getElementById('margemLucroError');

    // Obter elemento do resultado
    const resultadoDiv = document.getElementById('resultado');

    // Resetar erros anteriores
    let hasError = false;
    const inputs = [
        { el: precoInput, errEl: precoError, name: "Preço do Produto" },
        { el: quantidadeInput, errEl: quantidadeError, name: "Quantidade" },
        { el: maoDeObraInput, errEl: maoDeObraError, name: "Custo de Mão de Obra" },
        { el: margemLucroInput, errEl: margemLucroError, name: "Margem de Lucro" }
    ];

    inputs.forEach(item => {
        item.el.classList.remove('input-error');
        item.errEl.textContent = '';
    });
    resultadoDiv.textContent = 'Total: R$ 0.00'; // Resetar resultado inicial

    // Validar cada campo
    const preco = parseFloat(precoInput.value);
    const quantidade = parseFloat(quantidadeInput.value);
    const maoDeObra = parseFloat(maoDeObraInput.value);
    const margemLucro = parseFloat(margemLucroInput.value);

    // Validação para Preço
    if (precoInput.value.trim() === '') {
        precoError.textContent = 'Este campo é obrigatório.';
        precoInput.classList.add('input-error');
        hasError = true;
    } else if (isNaN(preco) || preco < 0) {
        precoError.textContent = 'Por favor, insira um valor numérico positivo.';
        precoInput.classList.add('input-error');
        hasError = true;
    }

    // Validação para Quantidade
    if (quantidadeInput.value.trim() === '') {
        quantidadeError.textContent = 'Este campo é obrigatório.';
        quantidadeInput.classList.add('input-error');
        hasError = true;
    } else if (isNaN(quantidade) || quantidade <= 0 || !Number.isInteger(quantidade)) {
        quantidadeError.textContent = 'Por favor, insira um número inteiro positivo.';
        quantidadeInput.classList.add('input-error');
        hasError = true;
    }

    // Validação para Mão de Obra
    if (maoDeObraInput.value.trim() === '') {
        maoDeObraError.textContent = 'Este campo é obrigatório.';
        maoDeObraInput.classList.add('input-error');
        hasError = true;
    } else if (isNaN(maoDeObra) || maoDeObra < 0) {
        maoDeObraError.textContent = 'Por favor, insira um valor numérico positivo.';
        maoDeObraInput.classList.add('input-error');
        hasError = true;
    }

    // Validação para Margem de Lucro
    if (margemLucroInput.value.trim() === '') {
        margemLucroError.textContent = 'Este campo é obrigatório.';
        margemLucroInput.classList.add('input-error');
        hasError = true;
    } else if (isNaN(margemLucro) || margemLucro < 0) { // Permitindo margem 0, mas não negativa
        margemLucroError.textContent = 'Por favor, insira um valor numérico positivo ou zero.';
        margemLucroInput.classList.add('input-error');
        hasError = true;
    }

    // Se houver erros, não calcular e exibir mensagem genérica no total
    if (hasError) {
        resultadoDiv.textContent = 'Por favor, corrija os erros nos campos acima.';
        return;
    }

    // Cálculo do orçamento
    const custoProdutos = preco * quantidade;
    const custoTotalSemLucro = custoProdutos + maoDeObra;
    const valorLucro = custoTotalSemLucro * (margemLucro / 100);
    const orcamentoFinal = custoTotalSemLucro + valorLucro;

    // Exibir o resultado
    if (isNaN(orcamentoFinal)) {
        resultadoDiv.textContent = 'Erro no cálculo. Verifique os valores.';
    } else {
        resultadoDiv.textContent = `Total: R$ ${orcamentoFinal.toFixed(2)}`;
    }
}