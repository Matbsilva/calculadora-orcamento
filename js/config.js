// js/config.js
// Módulo para gerenciar a aba de Configurações.

import { getMaterialList, updateGlobalDataFromConfigs } from './data.js';
import ui from './ui.js'; // Para interagir com a UI (ex: mostrar mensagens, atualizar partes da UI)
import { formatCurrency, parseCurrency } from './utils.js';

const configManager = {
    // Referências aos elementos do DOM da aba de Configurações
    // (serão cacheados em ui.js e podem ser acessados via ui.configForm, etc., ou aqui diretamente se preferir)
    form: null,
    custoMOProfissionalInput: null,
    custoMOAjudanteInput: null,
    bdiFinalInput: null,
    areaObraInput: null,
    materiaisContainer: null, // Container onde os inputs de materiais serão adicionados

    // Estado interno das configurações (pode ser redundante se data.js for a fonte da verdade)
    // É mais comum que este módulo leia do DOM, valide, e então atualize data.js
    // e, ao carregar, popule o DOM a partir de data.js ou de um estado salvo.
    currentConfig: {
        custoMOProfissional: 60.00, // Padrão
        custoMOAjudante: 35.00,    // Padrão
        bdiFinal: 25.00,           // Padrão %
        areaObra: 100,             // Padrão m²
        materiais: []              // { id: 'mat_id', nome: 'Nome', unidade: 'UN', precoUnitario: 0.00 }
    },

    uiInstance: null, // Referência à instância de ui.js

    init(uiRef) {
        console.log("configManager.init() chamado");
        this.uiInstance = uiRef; // Salva a referência da instância de ui.js
        
        // Cache de elementos DOM específicos de Configurações
        // Idealmente, ui.js já cacheou isso, mas pode ser referenciado aqui para clareza
        this.form = document.getElementById('form-configuracoes'); // Confirme o ID
        if (!this.form) {
            console.error("Formulário de Configurações não encontrado. Verifique o ID 'form-configuracoes'.");
            return; // Não continuar se o formulário principal não existir
        }
        this.custoMOProfissionalInput = this.form.querySelector('#custo-mo-profissional'); // Confirme IDs
        this.custoMOAjudanteInput = this.form.querySelector('#custo-mo-ajudante');
        this.bdiFinalInput = this.form.querySelector('#bdi-previsto'); // O prompt mencionou bdi-final mas o ID pode ser bdi-previsto
        this.areaObraInput = this.form.querySelector('#area-obra');
        this.materiaisContainer = this.form.querySelector('#materiais-config-container'); // Confirme ID

        // Carregar valores padrão ou salvos no formulário
        this.loadAndPopulate();

        // Adicionar quaisquer event listeners específicos deste módulo, se não cobertos por handlers.js
        // (geralmente handlers.js é o local central para listeners)
        console.log("configManager.init() concluído");
    },

    loadAndPopulate() {
        console.log("configManager.loadAndPopulate()");
        // Tenta carregar de um estado salvo (via main.js ou persistencia.js) ou usa padrões.
        // Por agora, vamos assumir que this.currentConfig já foi definido com dados carregados
        // por main.js, ou ele mantém os padrões.
        // Se main.js chamou setConfigData(loadedState.configData), currentConfig estará atualizado.
        this.populateForm();
    },

    // Popula o formulário com os dados de this.currentConfig
    populateForm() {
        console.log("configManager.populateForm() com dados:", this.currentConfig);
        if (!this.form) return;

        if (this.custoMOProfissionalInput) this.custoMOProfissionalInput.value = formatCurrency(this.currentConfig.custoMOProfissional, 2, true, false); // Não mostra R$
        if (this.custoMOAjudanteInput) this.custoMOAjudanteInput.value = formatCurrency(this.currentConfig.custoMOAjudante, 2, true, false);
        if (this.bdiFinalInput) this.bdiFinalInput.value = formatCurrency(this.currentConfig.bdiFinal, 2, true, false);
        if (this.areaObraInput) this.areaObraInput.value = this.currentConfig.areaObra;

        // Popular dinamicamente os campos de preço dos materiais
        this.renderMaterialInputs();
        console.log("Formulário de configurações populado.");
    },

    renderMaterialInputs() {
        if (!this.materiaisContainer) {
            console.warn("Container de materiais para configuração não encontrado.");
            return;
        }
        this.materiaisContainer.innerHTML = ''; // Limpa inputs antigos
        const materiaisBase = getMaterialList(); // Pega a lista de materiais de data.js

        // Mescla com os preços de currentConfig.materiais se existirem
        const materiaisParaRenderizar = materiaisBase.map(matBase => {
            const matConfigurado = this.currentConfig.materiais.find(mc => mc.id === matBase.id);
            return {
                ...matBase, // Pega nome, unidade, ref de data.js
                precoUnitario: matConfigurado ? matConfigurado.precoUnitario : matBase.precoUnitario // Usa preço configurado ou o padrão de data.js
            };
        });


        if (materiaisParaRenderizar.length === 0) {
            this.materiaisContainer.innerHTML = '<p>Nenhum material cadastrado em data.js para configurar.</p>';
            return;
        }
        
        materiaisParaRenderizar.forEach(material => {
            const div = document.createElement('div');
            div.classList.add('form-group', 'material-config-item'); // Classes para estilização
            div.innerHTML = `
                <label for="mat-price-${material.id}">${material.nome} (${material.unidade}) - Ref: ${material.ref || 'N/A'}</label>
                <input type="text" 
                       id="mat-price-${material.id}" 
                       class="form-control input-material-price" 
                       data-material-id="${material.id}" 
                       data-material-nome="${material.nome}"
                       data-material-unidade="${material.unidade}"
                       data-material-ref="${material.ref || 'N/A'}"
                       value="${formatCurrency(material.precoUnitario, 2, true, false)}"
                       placeholder="Preço Unitário">
                <div class="validation-feedback"></div> <!-- Para feedback de validação -->
            `;
            this.materiaisContainer.appendChild(div);
        });
    },

    // Coleta os dados do formulário, valida, e os retorna
    collectAndValidateForm() {
        console.log("configManager.collectAndValidateForm()");
        if (!this.form) return null;
        let isValid = true;
        const errors = [];

        const newConfig = {
            custoMOProfissional: parseCurrency(this.custoMOProfissionalInput?.value),
            custoMOAjudante: parseCurrency(this.custoMOAjudanteInput?.value),
            bdiFinal: parseCurrency(this.bdiFinalInput?.value),
            areaObra: parseFloat(this.areaObraInput?.value),
            materiais: []
        };

        // Validações
        if (isNaN(newConfig.custoMOProfissional) || newConfig.custoMOProfissional < 0) {
            isValid = false;
            this.uiInstance.displayValidationFeedback(this.custoMOProfissionalInput, "Custo M.O. Profissional inválido.", false);
            errors.push("Custo M.O. Profissional inválido.");
        } else {
             this.uiInstance.displayValidationFeedback(this.custoMOProfissionalInput, "", true);
        }

        if (isNaN(newConfig.custoMOAjudante) || newConfig.custoMOAjudante < 0) {
            isValid = false;
            this.uiInstance.displayValidationFeedback(this.custoMOAjudanteInput, "Custo M.O. Ajudante inválido.", false);
            errors.push("Custo M.O. Ajudante inválido.");
        } else {
            this.uiInstance.displayValidationFeedback(this.custoMOAjudanteInput, "", true);
        }

        if (isNaN(newConfig.bdiFinal) || newConfig.bdiFinal < 0 || newConfig.bdiFinal > 1000) { // BDI pode ser > 100%? Ajustar limite
            isValid = false;
            this.uiInstance.displayValidationFeedback(this.bdiFinalInput, "BDI Final inválido (deve ser numérico, >= 0).", false);
            errors.push("BDI Final inválido.");
        } else {
            this.uiInstance.displayValidationFeedback(this.bdiFinalInput, "", true);
        }

        if (isNaN(newConfig.areaObra) || newConfig.areaObra <= 0) {
            isValid = false;
            this.uiInstance.displayValidationFeedback(this.areaObraInput, "Área da Obra inválida (deve ser > 0).", false);
            errors.push("Área da Obra inválida.");
        } else {
             this.uiInstance.displayValidationFeedback(this.areaObraInput, "", true);
        }

        // Coletar e validar preços dos materiais
        const materialInputs = this.materiaisContainer.querySelectorAll('.input-material-price');
        materialInputs.forEach(input => {
            const preco = parseCurrency(input.value);
            if (isNaN(preco) || preco < 0) {
                isValid = false;
                this.uiInstance.displayValidationFeedback(input, "Preço do material inválido.", false);
                errors.push(`Preço inválido para material: ${input.dataset.materialNome}`);
            } else {
                this.uiInstance.displayValidationFeedback(input, "", true);
                 newConfig.materiais.push({
                    id: input.dataset.materialId,
                    nome: input.dataset.materialNome, // Guardar nome e unidade para referência, se necessário
                    unidade: input.dataset.materialUnidade,
                    ref: input.dataset.materialRef,
                    precoUnitario: preco
                });
            }
        });

        if (!isValid) {
            console.warn("Validação falhou:", errors.join("; "));
            this.uiInstance.showGlobalMessage(`Erro de validação: ${errors.join("; ")}`, 'error');
            return null;
        }
        console.log("Dados do formulário coletados e validados:", newConfig);
        return newConfig;
    },

    // Chamado pelo handler do botão "Aplicar Configurações"
    handleAplicarConfiguracoes() {
        console.log("configManager.handleAplicarConfiguracoes()");
        const collectedConfig = this.collectAndValidateForm();
        if (collectedConfig) {
            this.currentConfig = collectedConfig; // Atualiza o estado interno do configManager
            updateGlobalDataFromConfigs(this.currentConfig); // Atualiza data.js e recalcula custos
            
            // Opcional: Persistir localmente as configurações (se não houver um "Salvar Orçamento" global)
            // localStorage.setItem('appConfig', JSON.stringify(this.currentConfig));
            
            console.log("Configurações aplicadas e data.js atualizado.");
            // ui.refreshAll() ou partes específicas podem ser chamadas pelo handler após isso
            return true; // Sucesso
        }
        return false; // Falha na validação
    },

    // Para carregar dados de um estado salvo (ex: de um arquivo JSON)
    setConfigData(loadedConfigData) {
        console.log("configManager.setConfigData() com:", loadedConfigData);
        if (loadedConfigData) {
            // Mesclar com padrões para garantir que todos os campos existam, se a estrutura salva for parcial
            this.currentConfig = {
                ...this.currentConfig, // Pega os padrões
                ...loadedConfigData,   // Sobrescreve com o que foi carregado
                materiais: loadedConfigData.materiais ? [...loadedConfigData.materiais] : [...this.currentConfig.materiais] // Garante deep copy de array
            };
            this.populateForm(); // Atualiza o formulário com os novos dados
            // Não chama updateGlobalDataFromConfigs aqui, pois isso deve ser feito centralmente
            // em main.js ou pelo handler de "Carregar Orçamento" após todos os dados serem setados.
        }
    },

    // Retorna a configuração atual
    getConfigData() {
        // É importante que retorne os dados que estão ATUALMENTE no formulário se ainda não foram "aplicados",
        // ou os últimos dados "aplicados". O prompt sugere que "Aplicar" atualiza data.js.
        // Então, this.currentConfig deve refletir o último estado aplicado ou carregado.
        // Se for necessário pegar os valores "sujos" do form, seria preciso coletar novamente.
        return { ...this.currentConfig, materiais: [...this.currentConfig.materiais] }; // Retorna uma cópia
    },

    // Reseta as configurações para os valores padrão
    resetToDefaults() {
        console.log("configManager.resetToDefaults()");
        this.currentConfig = { // Redefine para os valores padrão hardcoded
            custoMOProfissional: 60.00,
            custoMOAjudante: 35.00,
            bdiFinal: 25.00,
            areaObra: 100,
            materiais: [] // Lista de materiais será repopulada com base nos padrões de data.js
        };
        // Garante que currentConfig.materiais reflita os padrões de data.js
        const materiaisBase = getMaterialList();
        this.currentConfig.materiais = materiaisBase.map(m => ({
            id: m.id,
            nome: m.nome,
            unidade: m.unidade,
            ref: m.ref,
            precoUnitario: m.precoUnitario // Preço padrão de data.js
        }));

        this.populateForm(); // Atualiza o formulário com os padrões
        // A chamada para updateGlobalDataFromConfigs com os defaults deve ser feita pelo handler de reset global.
        console.log("Configurações resetadas para os padrões.");
    }
};

export default configManager;