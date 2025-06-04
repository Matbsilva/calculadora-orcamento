// js/calculadora.js
import { formatCurrency, parseFloatStrict } from './utils.js'; // Usando parseFloatStrict de utils.js
import { ui } from './ui.js';
// Importando do seu data.js
import {
    getMaterialPrices, getLaborCosts,
    budgetDataStructure, // Esta é a sua lista de composições/serviços
    updateBudgetItemQuantity // Função para atualizar a quantidade no data.js
} from './data.js';

export const calculadora = {
    // Itens ativos na calculadora. Cada item aqui será uma referência a um item
    // da budgetDataStructure, mais os custos calculados e a quantidade efetivamente usada.
    // Poderia ser: { refComposition: 'COMP-SC001', quantidade: X, custoMaterialCalc: Y, custoMOCalc: Z, custoTotalCalc: W }
    // Ou podemos manter a quantidade em budgetDataStructure[index].initialQuantity
    // e recalcular tudo na renderização.
    // Para simplificar e alinhar com sua estrutura original, vamos operar sobre initialQuantity
    // da budgetDataStructure e filtrar os itens com initialQuantity > 0 para a tabela.
    // Os custos calculados serão adicionados dinamicamente aos itens da tabela.

    itensAtivosNaTabela: [], // Cache dos itens renderizados para não reprocessar tudo sempre

    init() {
        this.renderizarItens(); // Renderiza com base nas initialQuantities da budgetDataStructure
    },

    // Adicionar um item da budgetDataStructure à "calculadora" (basicamente, definir sua quantidade > 0)
    adicionarItem(refCompositionId) {
        const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId);
        if (itemIndex === -1) {
            console.error("Composição base não encontrada para adicionar:", refCompositionId);
            return;
        }

        // Se o item já tem quantidade > 0, talvez focar nele ou alertar.
        // Por agora, se não tem, definimos como 1. Se já tem, não faz nada aqui, a qtde é editada na tabela.
        if (budgetDataStructure[itemIndex].initialQuantity <= 0) {
            updateBudgetItemQuantity(itemIndex, 1); // Define quantidade inicial como 1 em data.js
        } else {
            // Foca no input de quantidade do item já existente
            const inputExistente = document.getElementById(`quantidade-${budgetDataStructure[itemIndex].refComposition}`);
            if (inputExistente) {
                inputExistente.focus();
                alert(`A composição "${budgetDataStructure[itemIndex].description}" já está na lista. Você pode alterar a quantidade diretamente na tabela.`);
                return;
            }
        }
        this.renderizarItens();
        ui.updateAllTabs();
    },

    removerItem(refCompositionId) {
        const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId);
        if (itemIndex !== -1) {
            updateBudgetItemQuantity(itemIndex, 0); // Zera a quantidade em data.js
        }
        this.renderizarItens();
        ui.updateAllTabs();
    },

    atualizarQuantidade(refCompositionId, novaQuantidadeStr) {
        const itemIndex = budgetDataStructure.findIndex(item => item.refComposition === refCompositionId);
        const inputQuantidade = document.getElementById(`quantidade-${refCompositionId}`);
        
        if (itemIndex !== -1 && inputQuantidade) {
            ui.clearInputError(inputQuantidade);
            // Seu data.js usa parseFloatStrict, vamos usar ele aqui também.
            // utils.js também tem parseFloatStrict agora.
            let novaQuantidade = parseFloatStrict(String(novaQuantidadeStr).replace(',', '.'));

            if (isNaN(novaQuantidade)) {
                ui.showInputError(inputQuantidade, 'Quantidade inválida.');
                // Reverte para valor antigo formatado
                inputQuantidade.value = parseFloatStrict(budgetDataStructure[itemIndex].initialQuantity).toFixed(2).replace('.', ',');
                return; 
            } else if (novaQuantidade < 0) {
                ui.showInputError(inputQuantidade, 'Não pode ser negativa.');
                novaQuantidade = 0; // Corrige para 0
            }
            
            updateBudgetItemQuantity(itemIndex, novaQuantidade); // Atualiza em data.js
            
            // A renderização da linha e totais será feita por renderizarItens
            this.renderizarItens(); // Re-renderiza para atualizar custos e totais
            ui.updateAllTabs(); 
        }
    },
    
    calcularCustosComposicao(composicaoItem) {
        // composicaoItem é um item da sua budgetDataStructure
        const materialPrices = getMaterialPrices();
        const laborCosts = getLaborCosts();
        let custoMaterialUnitario = 0;
        let custoMaoDeObraUnitario = 0;

        // Calcular custo de material
        if (composicaoItem.detailedMaterials && Array.isArray(composicaoItem.detailedMaterials)) {
            composicaoItem.detailedMaterials.forEach(matDetalhe => {
                const precoUnit = materialPrices[matDetalhe.idMaterial];
                if (precoUnit !== undefined && matDetalhe.consumptionPerUnit !== undefined) {
                    const consumoComPerda = matDetalhe.consumptionPerUnit * (1 + (matDetalhe.lossPercent || 0) / 100);
                    custoMaterialUnitario += consumoComPerda * precoUnit;
                } else {
                    // console.warn(`Preço ou consumo não definido para material ${matDetalhe.idMaterial} na composição ${composicaoItem.description}`);
                }
            });
        }

        // Calcular custo de mão de obra
        // Seu data.js tem unitHHProfessional e unitHHelper direto no item, e um objeto professionals/helpers
        // Vamos usar o unitHHProfessional e unitHHelper se existirem, ou somar do objeto.
        // A estrutura mais granular 'professionals' e 'helpers' é melhor.
        if (composicaoItem.professionals) {
            for (const profKey in composicaoItem.professionals) {
                const horas = composicaoItem.professionals[profKey];
                const custoHora = (laborCosts[profKey] || 0) / 8; // Assume 8h/dia
                custoMaoDeObraUnitario += horas * custoHora;
            }
        }
        if (composicaoItem.helpers) {
            for (const helperKey in composicaoItem.helpers) {
                const horas = composicaoItem.helpers[helperKey];
                const custoHora = (laborCosts[helperKey] || 0) / 8; // Assume 8h/dia
                custoMaoDeObraUnitario += horas * custoHora;
            }
        }
        
        return {
            custoMaterialUnitario,
            custoMaoDeObraUnitario,
            custoTotalUnitario: custoMaterialUnitario + custoMaoDeObraUnitario
        };
    },

    recalcularTodosOsCustos() { // Chamado quando preços de materiais/MO mudam
        // Não precisa fazer nada aqui se renderizarItens sempre recalcula.
        // Mas é bom ter para forçar uma atualização se necessário.
        this.renderizarItens();
        // ui.updateAllTabs(); // renderizarItens já pode chamar isso ou ser chamado por isso
    },

    renderizarItens(filtro = '') {
        const tbody = document.getElementById('tabelaCalculadoraItens');
        if (!tbody) return;
        tbody.innerHTML = ''; 
        this.itensAtivosNaTabela = []; // Limpa cache

        const itensParaRenderizar = budgetDataStructure.filter(item => 
            item.initialQuantity > 0 &&
            item.description.toLowerCase().includes(filtro.toLowerCase())
        );

        if (itensParaRenderizar.length === 0) {
            const isFiltering = filtro !== '';
            const hasItemsOverall = budgetDataStructure.some(item => item.initialQuantity > 0);
            const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 7;
            td.textContent = isFiltering ? 'Nenhuma composição encontrada com o filtro.' : 'Nenhuma composição adicionada à calculadora.';
            td.style.textAlign = 'center';
        } else {
            itensParaRenderizar.forEach(itemBase => {
                const { custoMaterialUnitario, custoMaoDeObraUnitario, custoTotalUnitario } = this.calcularCustosComposicao(itemBase);
                const custoTotalItem = custoTotalUnitario * itemBase.initialQuantity;

                // Adiciona ao cache de itens ativos para cálculo de totais
                this.itensAtivosNaTabela.push({
                    ...itemBase, // Dados base da composição
                    quantidade: itemBase.initialQuantity,
                    custoMaterialCalc: custoMaterialUnitario * itemBase.initialQuantity,
                    custoMOCalc: custoMaoDeObraUnitario * itemBase.initialQuantity,
                    custoTotalCalc: custoTotalItem
                });

                const tr = tbody.insertRow();
                tr.setAttribute('data-id', itemBase.refComposition); 
                tr.insertCell().textContent = itemBase.description;
                tr.insertCell().textContent = itemBase.unit;
                
                const tdQuantidade = tr.insertCell();
                const inputQuantidade = document.createElement('input');
                inputQuantidade.type = 'text'; 
                inputQuantidade.value = parseFloatStrict(itemBase.initialQuantity).toFixed(2).replace('.', ','); 
                inputQuantidade.classList.add('input-quantidade');
                inputQuantidade.id = `quantidade-${itemBase.refComposition}`;
                
                const errorSpanQuantidade = document.createElement('span');
                errorSpanQuantidade.classList.add('error-message');
                errorSpanQuantidade.id = `quantidade-${itemBase.refComposition}Error`;
                errorSpanQuantidade.style.display = 'none'; 
                
                tdQuantidade.appendChild(inputQuantidade);
                tdQuantidade.appendChild(errorSpanQuantidade); 

                inputQuantidade.addEventListener('blur', (event) => {
                    this.atualizarQuantidade(itemBase.refComposition, event.target.value);
                });
                inputQuantidade.addEventListener('focus', () => ui.clearInputError(inputQuantidade)); 

                tr.insertCell().textContent = formatCurrency(custoMaterialUnitario);
                tr.insertCell().textContent = formatCurrency(custoMaoDeObraUnitario);
                tr.insertCell().textContent = formatCurrency(custoTotalItem); // Custo total do item (unitário * qtde)

                const tdControles = tr.insertCell();
                const btnRemover = document.createElement('button');
                btnRemover.textContent = 'Excluir';
                btnRemover.classList.add('btn-remover');
                btnRemover.setAttribute('aria-label', `Excluir item ${itemBase.description}`);
                btnRemover.addEventListener('click', () => this.removerItem(itemBase.refComposition));
                tdControles.appendChild(btnRemover);
            });
        }
        this.atualizarTotalTabela();
    },
    
    atualizarTotalTabela() {
        // Usa this.itensAtivosNaTabela que foi populado em renderizarItens
        const totalCalculadora = this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoTotalCalc, 0);
        const tdTotalCalculadora = document.getElementById('totalCalculadora');
        if (tdTotalCalculadora) {
            tdTotalCalculadora.textContent = formatCurrency(totalCalculadora);
        }
        // TODO: Atualizar outros totais no rodapé se eles existiam (HH, Peso)
        // Ex: grandTotalHHProfCell, grandTotalHHHelperCell, grandTotalWeightCell
        // Isso exigiria somar item.unitHHProfessional * item.quantidade, etc.
    },
    
    // Função para ser chamada pelo persistencia.js ao carregar um orçamento
    setItens(loadedCompositions) { // loadedCompositions é [{ refComposition, quantity }]
        // Primeiro, reseta todas as initialQuantities na budgetDataStructure principal
        budgetDataStructure.forEach((item, index) => {
            updateBudgetItemQuantity(index, 0);
        });
        // Depois, atualiza as quantidades para os itens carregados
        loadedCompositions.forEach(loadedItem => {
            const itemIndex = budgetDataStructure.findIndex(bsItem => bsItem.refComposition === loadedItem.refComposition);
            if (itemIndex !== -1) {
                updateBudgetItemQuantity(itemIndex, loadedItem.quantity);
            }
        });
        this.recalcularTodosOsCustos(); // Isso vai chamar renderizarItens e atualizar tudo
    },

    // Retorna os itens que têm quantidade > 0, formatados para persistência
    getItensParaSalvar() {
        return budgetDataStructure
            .filter(item => item.initialQuantity > 0)
            .map(item => ({
                refComposition: item.refComposition,
                quantity: item.initialQuantity
            }));
    },

    // Retorna os itens ATIVOS na tabela com seus custos calculados para uso em relatórios/gráficos
    getItensComCustosCalculados() {
        return this.itensAtivosNaTabela.map(item => ({ // Retorna uma cópia para evitar mutação externa
            nome: item.description,
            unidade: item.unit,
            quantidade: item.quantidade,
            custoUnitarioMaterial: item.custoMaterialCalc / (item.quantidade || 1), // Evita divisão por zero
            custoUnitarioMO: item.custoMOCalc / (item.quantidade || 1),
            custoTotal: item.custoTotalCalc,
            // Adicionar mais propriedades se necessário para relatórios, como categoria
            categoria: item.categoria 
        }));
    },

    getTotalCustoDireto() {
        return this.itensAtivosNaTabela.reduce((acc, item) => acc + item.custoTotalCalc, 0);
    },
    
    resetCalculadora() {
        budgetDataStructure.forEach((item, index) => {
            updateBudgetItemQuantity(index, 0);
        });
        this.renderizarItens();
    }
};