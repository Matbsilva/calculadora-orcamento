// js/calculadora.js
import { parseCurrency, formatCurrency } from './utils.js'; // OK
import { ui } from './ui.js'; // OK
import { configManager } from './config.js'; // OK
import { listaServicos } from './data.js'; // ALTERAÇÃO: Importando do seu data.js

export const calculadora = {
    itens: [],
    
    init() {
        // listaServicos é usado em adicionarItem, que por sua vez usa calcularCustosItem
        // A renderização inicial é chamada se houver itens carregados (ex: do localStorage)
        this.renderizarItens();
    },

    adicionarItem(servicoId) {
        const servicoBase = listaServicos.find(s => s.id === servicoId); // Usando listaServicos importado
        if (!servicoBase) {
            console.error("Serviço base não encontrado para adicionar:", servicoId);
            return;
        }
        const itemExistente = this.itens.find(item => item.servicoId === servicoId);
        if (itemExistente) {
            alert(`O serviço "${itemExistente.nome}" já foi adicionado.`);
            const inputExistente = document.getElementById(`quantidade-${itemExistente.id}`); // Corrigido ID para input
            if(inputExistente) inputExistente.focus();
            return;
        }
        const novoItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            servicoId: servicoBase.id,
            nome: servicoBase.nome,
            unidade: servicoBase.unidade,
            quantidade: 1, 
        };
        this.calcularCustosItem(novoItem); 
        this.itens.push(novoItem);
        this.renderizarItens();
        ui.updateAllTabs();
    },

    removerItem(itemId) {
        this.itens = this.itens.filter(item => item.id !== itemId);
        this.renderizarItens();
        ui.updateAllTabs();
    },

    atualizarQuantidade(itemId, novaQuantidadeStr) {
        const item = this.itens.find(i => i.id === itemId);
        const inputQuantidade = document.getElementById(`quantidade-${itemId}`);
        if (item && inputQuantidade) {
            ui.clearInputError(inputQuantidade);
            let novaQuantidade = parseFloat(String(novaQuantidadeStr).replace(',', '.'));
            if (isNaN(novaQuantidade)) {
                ui.showInputError(inputQuantidade, 'Quantidade inválida.');
                inputQuantidade.value = parseFloat(item.quantidade).toFixed(2).replace('.', ',');
                return; 
            } else if (novaQuantidade < 0) {
                ui.showInputError(inputQuantidade, 'Não pode ser negativa.');
                novaQuantidade = 0;
            }
            item.quantidade = novaQuantidade;
            this.calcularCustosItem(item); 
            inputQuantidade.value = parseFloat(novaQuantidade).toFixed(2).replace('.', ',');
            this.atualizarLinhaItemUI(item);
            this.atualizarTotalTabela();
            ui.updateAllTabs(); 
        }
    },
    
    atualizarLinhaItemUI(item) {
        const row = document.querySelector(`tr[data-id="${item.id}"]`);
        if (row) {
            row.cells[3].textContent = formatCurrency(item.custoUnitarioMaterial);
            row.cells[4].textContent = formatCurrency(item.custoUnitarioMO);
            row.cells[5].textContent = formatCurrency(item.custoTotal);
        }
    },

    atualizarTotalTabela() {
        const totalCalculadora = this.itens.reduce((acc, item) => acc + item.custoTotal, 0);
        const tdTotalCalculadora = document.getElementById('totalCalculadora');
        if (tdTotalCalculadora) {
            tdTotalCalculadora.textContent = formatCurrency(totalCalculadora);
        }
    },

    calcularCustosItem(item) {
        const servicoBase = listaServicos.find(s => s.id === item.servicoId); // Usando listaServicos importado
        if (!servicoBase || !servicoBase.coeficientes) {
            item.custoUnitarioMaterial = 0;
            item.custoUnitarioMO = 0;
            item.custoTotal = 0;
            return;
        }
        const config = configManager.getConfig();
        let custoMaterial = 0;
        let custoMO = 0;
        if (servicoBase.coeficientes.materiais) {
            for (const mat in servicoBase.coeficientes.materiais) {
                const precoMaterialKey = `preco${mat.charAt(0).toUpperCase() + mat.slice(1)}`;
                const precoMaterial = config[precoMaterialKey];
                if (precoMaterial !== undefined) {
                    custoMaterial += servicoBase.coeficientes.materiais[mat] * precoMaterial;
                }
            }
        }
        item.custoUnitarioMaterial = custoMaterial;
        if (servicoBase.coeficientes.maoDeObra) {
            for (const mo in servicoBase.coeficientes.maoDeObra) {
                const configKey = `custo${mo.charAt(0).toUpperCase() + mo.slice(1)}`;
                const custoDiaMO = config[configKey]; 
                if (custoDiaMO !== undefined) {
                    const custoHoraMO = custoDiaMO / 8; 
                    custoMO += servicoBase.coeficientes.maoDeObra[mo] * custoHoraMO;
                }
            }
        }
        item.custoUnitarioMO = custoMO;
        item.custoTotal = (item.custoUnitarioMaterial + item.custoUnitarioMO) * item.quantidade;
    },

    recalcularTodosOsCustos() {
        this.itens.forEach(item => this.calcularCustosItem(item));
        this.renderizarItens(); 
        ui.updateAllTabs();
    },

    renderizarItens(filtro = '') {
        const tbody = document.getElementById('tabelaCalculadoraItens');
        if (!tbody) return;
        tbody.innerHTML = ''; 
        const itensFiltrados = this.itens.filter(item => 
            item.nome.toLowerCase().includes(filtro.toLowerCase())
        );
        if (itensFiltrados.length === 0 && this.itens.length > 0 && filtro) {
            const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 7; 
            td.textContent = 'Nenhum serviço encontrado com o filtro aplicado.';
            td.style.textAlign = 'center';
        } else if (this.itens.length === 0) {
             const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 7;
            td.textContent = 'Nenhum item adicionado à calculadora.';
            td.style.textAlign = 'center';
        } else {
            itensFiltrados.forEach(item => {
                const tr = tbody.insertRow();
                tr.setAttribute('data-id', item.id); 
                tr.insertCell().textContent = item.nome;
                tr.insertCell().textContent = item.unidade;
                const tdQuantidade = tr.insertCell();
                const inputQuantidade = document.createElement('input');
                inputQuantidade.type = 'text'; 
                inputQuantidade.value = parseFloat(item.quantidade).toFixed(2).replace('.', ','); 
                inputQuantidade.classList.add('input-quantidade');
                inputQuantidade.id = `quantidade-${item.id}`;
                const errorSpanQuantidade = document.createElement('span');
                errorSpanQuantidade.classList.add('error-message');
                errorSpanQuantidade.id = `quantidade-${item.id}Error`;
                errorSpanQuantidade.style.display = 'none'; 
                tdQuantidade.appendChild(inputQuantidade);
                tdQuantidade.appendChild(errorSpanQuantidade); 
                inputQuantidade.addEventListener('blur', (event) => {
                    this.atualizarQuantidade(item.id, event.target.value);
                });
                inputQuantidade.addEventListener('focus', () => ui.clearInputError(inputQuantidade)); 
                tr.insertCell().textContent = formatCurrency(item.custoUnitarioMaterial);
                tr.insertCell().textContent = formatCurrency(item.custoUnitarioMO);
                tr.insertCell().textContent = formatCurrency(item.custoTotal);
                const tdControles = tr.insertCell();
                const btnRemover = document.createElement('button');
                btnRemover.textContent = 'Excluir';
                btnRemover.classList.add('btn-remover');
                btnRemover.setAttribute('aria-label', `Excluir item ${item.nome}`);
                btnRemover.addEventListener('click', () => this.removerItem(item.id));
                tdControles.appendChild(btnRemover);
            });
        }
        this.atualizarTotalTabela();
    },
    
    getItens() {
        return [...this.itens];
    },

    setItens(novosItens) {
        this.itens = novosItens.map(item => ({...item}));
        this.recalcularTodosOsCustos();
    },

    getTotalCustoDireto() {
        return this.itens.reduce((acc, item) => acc + item.custoTotal, 0);
    },
    
    resetCalculadora() {
        this.itens = [];
        this.renderizarItens();
    }
};