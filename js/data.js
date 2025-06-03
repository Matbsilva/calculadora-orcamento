// js/data.js

// Estado Global da Aplicação
export let config = {
    laborCosts: { pedreiro: 38.00, servente: 20.00, impermeabilizador: 38.00, carpinteiro: 38.00, armador: 38.00 },
    materialPrices: {}, // Será populado a partir de materiaisBase
    bdi: {
        bdiFinalAdotado: 25.00, 
    },
    project: {
        areaObra: 100, 
    },
    bdiSimulation: { 
        adminPercent: 0.10, 
        riskPercent: 0.05,
        financialCostPercent: 0.02,
        taxesPercent: 0.15,
        profitPercent: 0.20,
        percentFaturamentoMO: 0.40
    }
};


export const materiaisBase = {
    areiaSaco20kg: { nomeDisplay: "Areia (em sacos de 20 kg)", unidade: "saco", pesoKg: 20, precoUnitarioDefault: 5.00 },
    cimento50kg: { nomeDisplay: "Cimento (50 kg)", unidade: "saco", pesoKg: 50, precoUnitarioDefault: 31.00 },
    blocoCeramico9cm: { nomeDisplay: "Bloco cerâmico 39x19x9 cm", unidade: "unidade", pesoKg: 3, precoUnitarioDefault: 3.50 },
    bianco3_6L: { nomeDisplay: "Bianco (balde 3,6L)", unidade: "balde", pesoKg: 3.78, precoUnitarioDefault: 100.00 },
    bianco18L: { nomeDisplay: "Bianco (18L)", unidade: "balde", pesoKg: 18.90, precoUnitarioDefault: 300.00 },
    blocoConcreto39x19x19: { nomeDisplay: "Bloco de Concreto 39x19x39 cm", unidade: "un", pesoKg: 15, precoUnitarioDefault: 3.50 },
    eps10cm: { nomeDisplay: "EPS (Placa 1x1m, 10cm)", unidade: "m²", pesoKg: 1.50, precoUnitarioDefault: 23.50 },
    telaQ61: { nomeDisplay: "Tela Soldada Q61 (3,4mm/15cm)", unidade: "painel", pesoKg: 6.06, precoUnitarioDefault: 100.00 },
    blocoCeramico14cm: { nomeDisplay: "Bloco Cerâmico 14x19x29cm", unidade: "un", pesoKg: 2.5, precoUnitarioDefault: 1.50 },
    viaplus7000_18kg: { nomeDisplay: "Viaplus 7000 (balde 18kg)", unidade: "balde", pesoKg: 18, precoUnitarioDefault: 250.00 },
    telaPoliester: { nomeDisplay: "Tela de Poliéster", unidade: "m²", pesoKg: 0.15, precoUnitarioDefault: 3.50 },
    pedra1Saco20kg: { nomeDisplay: "Pedra 1 (20 kg/saco)", unidade: "saco", pesoKg: 20, precoUnitarioDefault: 6.00 },
    blocoCCA: { nomeDisplay: "Bloco de Concreto Celular", unidade: "unidade", pesoKg: 10.80, precoUnitarioDefault: 19.00 },
    blocoCCA603010: { nomeDisplay: "Bloco de Concreto Celular (60x30x10cm)", unidade: "unidade", pesoKg: 10.80, precoUnitarioDefault: 13.00 },
    telaAcoPesada4_2mm10x10: { nomeDisplay: "Tela Aço Pesada 4,2mm Malha 10x10cm (Painel 2x3m)", unidade: "painel", pesoKg: (2*3) * 2.22, precoUnitarioDefault: 120.00 },
    arameRecozidoKg: { nomeDisplay: "Arame Recozido (para amarrações)", unidade: "kg", pesoKg: 1, precoUnitarioDefault: 15.00 },
    tabuasMadeiraM2: { nomeDisplay: "Tábuas de Madeira (para forma)", unidade: "m²", pesoKg: 12.50, precoUnitarioDefault: 50.00 },
    pregoKg: { nomeDisplay: "Prego (para forma)", unidade: "kg", pesoKg: 1, precoUnitarioDefault: 15.00 },
    telaAcoLeve4_2mm15x15: { nomeDisplay: "Tela Aço Leve 4,2mm Malha 15x15cm (Painel 2x3m)", unidade: "painel", pesoKg: (2*3) * 1.58, precoUnitarioDefault: 90.00 },
    eps15cm: { nomeDisplay: "EPS (Placa 1x1m, 15cm)", unidade: "m²", pesoKg: 2.25, precoUnitarioDefault: 35.25 },
};

Object.keys(materiaisBase).forEach(idMat => {
    config.materialPrices[idMat] = materiaisBase[idMat].precoUnitarioDefault;
});

export let budgetDataStructure = [
    { id: "COMP-SC001", categoria: "Pequenas Estruturas / Contenções", description: "Sóculo em bloco cerâmico (altura 19 cm) - por ml", refComposition: "COMP-SC001", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.43, unitHHelper: 0.29, unitWeight: 72.40, professionals: { pedreiro: 0.43 }, helpers: { servente: 0.29 }, detailedMaterials: [ { idMaterial: "areiaSaco20kg", consumptionPerUnit: (16/7), lossPercent: 5 }, { idMaterial: "cimento50kg", consumptionPerUnit: (1.90/7), lossPercent: 5 }, { idMaterial: "blocoCeramico9cm", consumptionPerUnit: (20/7), lossPercent: 3 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/7), lossPercent: 0 } ], observationsText: "Verifique a base. Nível e Prumo. Amarração. Cura da Argamassa.", equipmentList: ["Carrinho de mão", "Pá", "Enxada", "Baldes", "Colher de pedreiro", "Desempenadeira", "Martelo de borracha", "Trena", "Nível de bolha/mangueira/a laser", "Prumo"] },
    { id: "COMP-CHAP001", categoria: "Revestimentos / Argamassa", description: "Chapisco em Superfícies de Alvenaria (3mm)", refComposition: "COMP-CHAP001", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.12, unitHHelper: 0.08, unitWeight: 6.34, professionals: { pedreiro: 0.12 }, helpers: { servente: 0.08 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: (2.52/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (22.59/100), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Limpeza da Superfície. Umedecimento. Cura. Cobrimento rugoso.", equipmentList: ["Vassoura de piaçava ou broxa", "Baldes", "Masseira/carrinho de mão"] },
    { id: "COMP-CONTRAPISO-CONV-5CM", categoria: "Pisos / Nivelamento", description: "Contrapiso Convencional - 5cm", refComposition: "COMP-CONTRAPISO-CONV-5CM", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.20, unitHHelper: 0.30, unitWeight: 102.15, professionals: { pedreiro: 0.20 }, helpers: { servente: 0.30 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: (42/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (376.50/100), lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (2/100), lossPercent: 0 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (2/100), lossPercent: 0 } ], observationsText: "Nivelamento com taliscas/mestras. Seguir traço. Juntas de Dilatação. Cura úmida.", equipmentList: ["Betoneira", "Carrinho de mão", "Pá", "Enxada", "Baldes", "Colher de pedreiro", "Desempenadeira", "Régua de alumínio", "Nível"] },
    { id: "COMP-DEM-REV", categoria: "Demolições / Remoções", description: "Demolição de Revestimento", refComposition: "COMP-DEM-REV", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.00, unitHHelper: 1.00, unitWeight: 0.00, professionals: {}, helpers: { servente: 1.00 }, detailedMaterials: [], observationsText: "Utilizar EPIs. Isolar área. Demolir de cima para baixo. Cuidado com instalações. Entulho conforme Composição Remoção.", equipmentList: ["Marreta", "Talhadeira", "Ponteiro", "Óculos de segurança", "Luvas", "Máscaras contra poeira"] },
    { id: "COMP-LOG-ENT-INT", categoria: "Demolições / Remoções", description: "Logística Interna de Entulho (Carregamento + Transporte + Descarga)", refComposition: "COMP-LOG-ENT-INT", unit: "m³", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.00, unitHHelper: 3.00, unitWeight: 1300.00, professionals: {}, helpers: { servente: 3.00 }, detailedMaterials: [], observationsText: "Cobre apenas logística interna. Produtividade pode variar. Usar EPIs. Otimizar caminhos.", equipmentList: ["Carrinho de mão", "Pás", "Enxadas", "Luvas", "Botas de segurança", "Máscara (se necessário)"] },
    { id: "COMP-ENCH-LEVE-001", categoria: "Pisos / Nivelamento", description: "Enchimento Leve Piso (EPS 10cm+Contrap. 5cm+Base 1cm) c/ Tela Q61", refComposition: "COMP-ENCH-LEVE-001", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.35, unitHHelper: 0.50, unitWeight: 128.60, professionals: { pedreiro: 0.35 }, helpers: { servente: 0.50 }, detailedMaterials: [ { idMaterial: "eps10cm", consumptionPerUnit: 1.00, lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: 0.504, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 4.518, lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (2/100), lossPercent: 0 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (4/100), lossPercent: 0 }, { idMaterial: "telaQ61", consumptionPerUnit: (16.67/100), lossPercent: 2 } ], observationsText: "Preparo da Base. Assentamento EPS. Colocação Tela. Lançamento Contrapiso. Cura.", equipmentList: ["Betoneira", "Carrinho de mão", "Serra para EPS", "Régua de alumínio", "Nível", "Espaçadores para tela", "Turquês"] },
    { id: "COMP-MUR-ALV-D", categoria: "Alvenarias / Vedações Verticais", description: "Mureta Dupla Alvenaria H=1,20m (2x Bl. Concreto 19cm...)", refComposition: "COMP-MUR-ALV-D", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.85, unitHHelper: 1.25, unitWeight: 573.54, professionals: { pedreiro: 0.85 }, helpers: { servente: 1.25 }, detailedMaterials: [ { idMaterial: "blocoConcreto39x19x19", consumptionPerUnit: 25.00, lossPercent: 5 }, { idMaterial: "cimento50kg", consumptionPerUnit: 0.7419, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 6.66, lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (4/100), lossPercent: 0 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Mureta dupla. Acabamento faces externas e topos. Prumo e alinhamento.", equipmentList: ["Betoneira", "Andaimes", "Colher de pedreiro", "Desempenadeira", "Prumo", "Nível", "Régua", "Linha"] },
    { id: "COMP-MUR-BC20-REG", categoria: "Alvenarias / Vedações Verticais", description: "Mureta Bl. Concreto H=20cm c/ Regularização (1 fiada...)", refComposition: "COMP-MUR-BC20-REG", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.31, unitHHelper: 0.34, unitWeight: 75.04, professionals: { pedreiro: 0.31 }, helpers: { servente: 0.34 }, detailedMaterials: [ { idMaterial: "blocoConcreto39x19x19", consumptionPerUnit: 2.50, lossPercent: 5 }, { idMaterial: "cimento50kg", consumptionPerUnit: (14.49/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (129.89/100), lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Mureta 1 fiada. Acabamento 2 lados e topo. Impermeabilizar base (se aplicável).", equipmentList: ["Colher de pedreiro", "Desempenadeira", "Prumo", "Nível", "Régua", "Betoneira", "Baldes"] },
    { id: "COMP-REG-PAR30", categoria: "Revestimentos / Argamassa", description: "Regularização de Parede - 3cm (Chapisco + Reboco)", refComposition: "COMP-REG-PAR30", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.35, unitHHelper: 0.45, unitWeight: 71.24, professionals: { pedreiro: 0.35 }, helpers: { servente: 0.45 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: 0.2940, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 2.6355, lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (1/100), lossPercent: 0 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (4/100), lossPercent: 0 } ], observationsText: "Limpeza. Chapisco. Pontos e Mestras. Aplicação Reboco. Acabamento. Cura.", equipmentList: ["Betoneira", "Colher de pedreiro", "Desempenadeira", "Régua de alumínio", "Prumo", "Nível", "Taliscas", "Andaimes"] },
    { id: "COMP-SOCULO-U-CONTENCAO", categoria: "Pequenas Estruturas / Contenções", description: "Sóculo de Contenção ... U (Muretas H=15cm + CP 2cm)", refComposition: "COMP-SOCULO-U-CONTENCAO", unit: "un", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 3.50, unitHHelper: 5.50, unitWeight: 408.78, professionals: { pedreiro: 3.50 }, helpers: { servente: 5.50 }, detailedMaterials: [ { idMaterial: "blocoCeramico14cm", consumptionPerUnit: 16.65, lossPercent: 5 }, { idMaterial: "cimento50kg", consumptionPerUnit: 1.33, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 11.96, lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: 1.00, lossPercent: 0 } ], observationsText: "Sóculo em U. Muretas bl. cerâmico 15cm. Contrapiso 2cm. Regularização. Nível e esquadro.", equipmentList: ["Betoneira", "Colher de pedreiro", "Desempenadeira", "Nível", "Prumo", "Régua", "Trena"] },
    { id: "COMP-IMP-PISO", categoria: "Impermeabilização / Acabamentos de Base", description: "Impermeabilização Piso com Viaplus 7000 e Tela Poliéster", refComposition: "COMP-IMP-PISO", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.25, unitHHelper: 0.00, unitWeight: 4.48, professionals: { impermeabilizador: 0.25 }, helpers: {}, detailedMaterials: [ { idMaterial: "viaplus7000_18kg", consumptionPerUnit: (22.22/100), lossPercent: 5 }, { idMaterial: "telaPoliester", consumptionPerUnit: 1.00, lossPercent: 5 } ], observationsText: "Preparo Superfície. Cantos e Ralos. Demãos cruzadas. Incorporar Tela. Teste Estanqueidade.", equipmentList: ["Broxa", "Rolo de pintura", "Trincha", "Estilete", "Trena", "Baldes", "Misturador"] },
    { id: "COMP-MEIA-CANA-VIRADA-30CM", categoria: "Impermeabilização / Acabamentos de Base", description: "Meia Cana com Virada de 30cm (Rodapé Regularizado)", refComposition: "COMP-MEIA-CANA-VIRADA-30CM", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.22, unitHHelper: 0.31, unitWeight: 23.89, professionals: { pedreiro: 0.22 }, helpers: { servente: 0.31 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: (9.66/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (86.60/100), lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Meia cana curva e regularização parede 30cm alt. Chapisco. Executar e rebocar. Cura.", equipmentList: ["Colher de pedreiro", "Desempenadeira de canto", "Régua", "Nível", "Betoneira", "Baldes"] },
    { id: "COMP-CONC25", categoria: "Concretagem / Estruturas", description: "Concreto FCK 25 MPa (Preparo Local - Traço Corrigido)", refComposition: "COMP-CONC25", unit: "m³", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 2.00, unitHHelper: 4.00, unitWeight: 2270.00, professionals: { pedreiro: 2.00 }, helpers: { servente: 4.00 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: 6.00, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 45.50, lossPercent: 5 }, { idMaterial: "pedra1Saco20kg", consumptionPerUnit: 45.50, lossPercent: 5 } ], observationsText: "Traço 300kg cimento, 910kg areia, 910kg pedra/m³. Teste slump. Adensamento. Cura. EPIs.", equipmentList: ["Betoneira", "Carrinho de mão", "Pá", "Enxada", "Baldes", "Vibrador", "Formas", "Desmoldante", "Escoras"] },
    { id: "COMP-CONC20", categoria: "Concretagem / Estruturas", description: "Concreto FCK 20 MPa (Preparo Local)", refComposition: "COMP-CONC20", unit: "m³", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 2.00, unitHHelper: 4.00, unitWeight: 2240.00, professionals: { pedreiro: 2.00 }, helpers: { servente: 4.00 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: 5.40, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 46.00, lossPercent: 5 }, { idMaterial: "pedra1Saco20kg", consumptionPerUnit: 45.00, lossPercent: 5 } ], observationsText: "Traço 270kg cimento, 920kg areia, 900kg pedra/m³. Teste slump. Adensamento. Cura. EPIs.", equipmentList: ["Betoneira", "Carrinho de mão", "Pá", "Enxada", "Baldes", "Vibrador", "Formas", "Desmoldante", "Escoras"] },
    { id: "COMP-CONC30", categoria: "Concretagem / Estruturas", description: "Concreto FCK 30 MPa (Preparo Local)", refComposition: "COMP-CONC30", unit: "m³", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 2.00, unitHHelper: 4.00, unitWeight: 2290.00, professionals: { pedreiro: 2.00 }, helpers: { servente: 4.00 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: 6.40, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 45.50, lossPercent: 5 }, { idMaterial: "pedra1Saco20kg", consumptionPerUnit: 46.00, lossPercent: 5 } ], observationsText: "Traço 320kg cimento, 910kg areia, 920kg pedra/m³. Teste slump. Adensamento. Cura. EPIs.", equipmentList: ["Betoneira", "Carrinho de mão", "Pá", "Enxada", "Baldes", "Vibrador", "Formas", "Desmoldante", "Escoras"] },
    { id: "COMP-REQ001", categoria: "Revestimentos / Argamassa", description: "Requadro de Vãos (Portas/Janelas)", refComposition: "COMP-REQ001", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.15, unitHHelper: 0.10, unitWeight: 7.69, professionals: { pedreiro: 0.15 }, helpers: { servente: 0.10 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: (0.504/20), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (4.518/20), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/20), lossPercent: 0 } ], observationsText: "Chapiscar vãos. Controlar espessura para nível/esquadro. Cura úmida.", equipmentList: ["Colher de pedreiro", "Desempenadeira", "Régua", "Prumo", "Nível", "Trena", "Baldes", "Masseira"] },
    { id: "COMP-ENCH001", categoria: "Pisos / Nivelamento", description: "Enchimento/Contrapiso Bl. CCA e Regularização (~15.5cm)", refComposition: "COMP-ENCH001", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.30, unitHHelper: 0.20, unitWeight: 133.11, professionals: { pedreiro: 0.30 }, helpers: { servente: 0.20 }, detailedMaterials: [ { idMaterial: "blocoCCA", consumptionPerUnit: (275/50), lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: (14.70/50), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (131.78/50), lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (1/50), lossPercent: 0 } ], observationsText: "Assentamento Bloco CCA. Nivelamento. Tratamento Juntas. Cura.", equipmentList: ["Argamassadeira", "Serra para bloco celular", "Colher", "Desempenadeira", "Régua", "Nível", "Trena", "Carrinho", "Betoneira"] },
    { id: "COMP-ALV001", categoria: "Alvenarias / Vedações Verticais", description: "Alvenaria Vedação Bl. Concreto (incl. assent. e reboco)", refComposition: "COMP-ALV001", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.39, unitHHelper: 0.26, unitWeight: 355.24, professionals: { pedreiro: 0.39 }, helpers: { servente: 0.26 }, detailedMaterials: [ { idMaterial: "blocoConcreto39x19x19", consumptionPerUnit: (206.40/12.9), lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: (5.64/12.9), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (50.51/12.9), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (2/12.9), lossPercent: 0 } ], observationsText: "Preparar base. Chapisco recomendado. Usar réguas para reboco. Cura úmida. Vergas/contravergas.", equipmentList: ["Betoneira", "Carrinho", "Pá", "Enxada", "Baldes", "Colher", "Martelo borracha", "Linha", "Prumo", "Nível", "Trena", "Serra bloco", "Masseira", "Desempenadeira", "Régua"] },
    { id: "COMP-ENCH-CONT-BCC", categoria: "Pisos / Nivelamento", description: "Enchimento/Contrapiso Bl. CCA (60x30x10cm) e CP 5cm", refComposition: "COMP-ENCH-CONT-BCC", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 1.08, unitHHelper: 0.72, unitWeight: 288.20, professionals: { pedreiro: 1.08 }, helpers: { servente: 0.72 }, detailedMaterials: [ { idMaterial: "blocoCCA603010", consumptionPerUnit: (833.50/50), lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: (21.00/50), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (188.25/50), lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (1/50), lossPercent: 0 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/50), lossPercent: 0 } ], observationsText: "Bloco CCA assentado sobre face 10cm. Contrapiso 5cm. Usar argamassa colante/fina para CCA.", equipmentList: ["Argamassadeira", "Serra bloco", "Colher", "Desempenadeira", "Régua", "Nível", "Trena", "Carrinho", "Betoneira"] },
    { id: "COMP-MUR_BLC001", categoria: "Alvenarias / Vedações Verticais", description: "Mureta Bl. Concreto - 1 Fiada (10/20cm) - Assent. s/ CAL", refComposition: "COMP-MUR_BLC001", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.12, unitHHelper: 0.08, unitWeight: 47.24, professionals: { pedreiro: 0.12 }, helpers: { servente: 0.08 }, detailedMaterials: [ { idMaterial: "blocoConcreto39x19x19", consumptionPerUnit: (256/100), lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: (2.94/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (26.36/100), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Altura 10/20cm (1 fiada). Argamassa s/ cal, c/ Bianco. Nivelamento e prumo. S/ regularização.", equipmentList: ["Colher", "Nível", "Prumo", "Linha", "Baldes", "Masseira"] },
    { id: "COMP-MUR_CCA002", categoria: "Alvenarias / Vedações Verticais", description: "Mureta Bl. CCA (60x30x10cm) - 30cm alt (1 Fiada deitado)", refComposition: "COMP-MUR_CCA002", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.18, unitHHelper: 0.12, unitWeight: 19.51, professionals: { pedreiro: 0.18 }, helpers: { servente: 0.12 }, detailedMaterials: [ { idMaterial: "blocoCCA603010", consumptionPerUnit: (166.67/100), lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: (0.36/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (1.80/100), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Altura 30cm (1 fiada CCA deitado). Argamassa fina c/ Bianco. Nivelamento e prumo. S/ regularização.", equipmentList: ["Serra bloco", "Colher", "Nível", "Prumo", "Linha", "Baldes", "Masseira"] },
    { id: "COMP-BASE-CONC-001", categoria: "Estruturas / Lajes", description: "Base Concreto Estrut. Laje - 4,5x4,5x0,20m (40T)", refComposition: "COMP-BASE-CONC-001", unit: "un", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 103.68, unitHHelper: 97.20, unitWeight: 9384.72, professionals: { pedreiro: 48.60, carpinteiro: 6.48, armador: 48.60 }, helpers: { servente: 97.20 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: 28.35, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 182.25, lossPercent: 5 }, { idMaterial: "pedra1Saco20kg", consumptionPerUnit: 186.30, lossPercent: 5 }, { idMaterial: "telaAcoPesada4_2mm10x10", consumptionPerUnit: 12.00, lossPercent: 0 }, { idMaterial: "arameRecozidoKg", consumptionPerUnit: 0.25, lossPercent: 5 }, { idMaterial: "tabuasMadeiraM2", consumptionPerUnit: 3.60, lossPercent: 5 }, { idMaterial: "pregoKg", consumptionPerUnit: 0.10, lossPercent: 5 } ], observationsText: "Armadura Dupla Tela. Espaçadores. Sobreposição. Concretagem Contínua. Cura 7 dias.", equipmentList: ["Betoneira", "Carrinho", "Vibrador", "Formas", "Serra", "Martelo", "Trena", "Nível", "Içamento (se nec.)"] },
    { id: "COMP-BASE-CONC-002", categoria: "Estruturas / Lajes", description: "Base Concreto Estrut. Laje - 4,5x4,5x0,10m (10T)", refComposition: "COMP-BASE-CONC-002", unit: "un", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 38.04, unitHHelper: 46.58, unitWeight: 4693.36, professionals: { pedreiro: 23.29, carpinteiro: 3.11, armador: 11.64 }, helpers: { servente: 46.58 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: 14.18, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 91.13, lossPercent: 5 }, { idMaterial: "pedra1Saco20kg", consumptionPerUnit: 93.15, lossPercent: 5 }, { idMaterial: "telaAcoLeve4_2mm15x15", consumptionPerUnit: 6.00, lossPercent: 0 }, { idMaterial: "arameRecozidoKg", consumptionPerUnit: 0.15, lossPercent: 5 }, { idMaterial: "tabuasMadeiraM2", consumptionPerUnit: 1.80, lossPercent: 5 }, { idMaterial: "pregoKg", consumptionPerUnit: 0.05, lossPercent: 5 } ], observationsText: "Armadura Simples. Espaçadores. Sobreposição. Concretagem Contínua. Cura 7 dias.", equipmentList: ["Betoneira", "Carrinho", "Vibrador", "Formas", "Serra", "Martelo", "Trena", "Nível", "Içamento (se nec.)"] },
    { id: "COMP-MEIA-CANA-001", categoria: "Impermeabilização / Acabamentos de Base", description: "Meia Cana de Argamassa (Cimento e Areia)", refComposition: "COMP-MEIA-CANA-001", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.08, unitHHelper: 0.08, unitWeight: 3.04, professionals: { pedreiro: 0.08 }, helpers: { servente: 0.08 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: (1.06/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (9.46/100), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Preparo Argamassa. Aplicação e moldagem raio ~4cm. Acabamento liso. Cura 72h.", equipmentList: ["Colher", "Desempenadeira de canto", "Baldes", "Masseira"] },
    { id: "COMP-ENCH-EPS-TESTE", categoria: "Pisos / Nivelamento", description: "Enchimento Piso EPS (15cm), Base (1cm), Contrap. (5cm)", refComposition: "COMP-ENCH-EPS-TESTE", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.30, unitHHelper: 0.45, unitWeight: 124.35, professionals: { pedreiro: 0.30 }, helpers: { servente: 0.45 }, detailedMaterials: [ { idMaterial: "eps15cm", consumptionPerUnit: 1.00, lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: 0.504, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 4.518, lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (2/100), lossPercent: 0 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (4/100), lossPercent: 0 } ], observationsText: "Preparo Base. EPS sobre base fresca. Contrapiso sobre EPS curado. Cura. Nivelamento.", equipmentList: ["Betoneira", "Carrinho", "Serra EPS", "Régua", "Nível", "Desempenadeira"] },
    { id: "COMP-MUR_CCA003-REG", categoria: "Alvenarias / Vedações Verticais", description: "Mureta Bl. CCA (60x30x10cm) - 10cm alt COM Regularização", refComposition: "COMP-MUR_CCA003-REG", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.19, unitHHelper: 0.14, unitWeight: 25.60, professionals: { pedreiro: 0.19 }, helpers: { servente: 0.14 }, detailedMaterials: [ { idMaterial: "blocoCCA603010", consumptionPerUnit: (83.30/100), lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: (0.18/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (0.90/100), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/100), lossPercent: 0 }, { idMaterial: "cimento50kg", consumptionPerUnit: (6.30/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (56.48/100), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (2/100), lossPercent: 0 } ], observationsText: "Mureta 10cm CCA, c/ chapisco e reboco. Nivelamento e prumo.", equipmentList: ["Serra bloco", "Colher", "Desempenadeira", "Nível", "Prumo", "Linha", "Baldes", "Masseira", "Betoneira"] },
    { id: "COMP-MUR_CCA004-REG", categoria: "Alvenarias / Vedações Verticais", description: "Mureta Bl. CCA (60x30x10cm) - 30cm alt COM Regularização", refComposition: "COMP-MUR_CCA004-REG", unit: "ml", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.35, unitHHelper: 0.23, unitWeight: 55.40, professionals: { pedreiro: 0.35 }, helpers: { servente: 0.23 }, detailedMaterials: [ { idMaterial: "blocoCCA603010", consumptionPerUnit: (166.67/100), lossPercent: 3 }, { idMaterial: "cimento50kg", consumptionPerUnit: (0.36/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (1.80/100), lossPercent: 5 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/100), lossPercent: 0 }, { idMaterial: "cimento50kg", consumptionPerUnit: (14.70/100), lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: (131.78/100), lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Mureta 30cm CCA deitado, c/ chapisco e reboco. Nivelamento e prumo.", equipmentList: ["Serra bloco", "Colher", "Desempenadeira", "Nível", "Prumo", "Linha", "Baldes", "Masseira", "Betoneira"] },
    { id: "COMP-SC002", categoria: "Pequenas Estruturas / Contenções", description: "Sóculo em bloco cerâmico (altura 19 cm) - por m² de face", refComposition: "COMP-SC002", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.50, unitHHelper: 0.33, unitWeight: 84.46, professionals: { pedreiro: 0.50 }, helpers: { servente: 0.33 }, detailedMaterials: [ { idMaterial: "areiaSaco20kg", consumptionPerUnit: (16/6), lossPercent: 5 }, { idMaterial: "cimento50kg", consumptionPerUnit: (1.90/6), lossPercent: 5 }, { idMaterial: "blocoCeramico9cm", consumptionPerUnit: (20/6), lossPercent: 3 }, { idMaterial: "bianco3_6L", consumptionPerUnit: ( (1.90/6) * 1 / 3.6 ), lossPercent: 0 } ], observationsText: "Verifique a base. Nível e Prumo. Amarração. Cura. Medição por m² de face.", equipmentList: ["Carrinho", "Pá", "Enxada", "Baldes", "Colher", "Desempenadeira", "Martelo borracha", "Trena", "Nível", "Prumo"] },
    { id: "COMP-REG-PAR20", categoria: "Revestimentos / Argamassa", description: "Regularização de Parede - 2cm (Chapisco + Reboco)", refComposition: "COMP-REG-P_blankAR20", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.35, unitHHelper: 0.45, unitWeight: 51.33, professionals: { pedreiro: 0.35 }, helpers: { servente: 0.45 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: 0.2100, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 1.8825, lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (1/100), lossPercent: 0 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (1/100), lossPercent: 0 } ], observationsText: "Espessura 2,5cm (0,5cm chapisco + 2,0cm reboco). Limpeza. Chapisco. Pontos/Mestras. Reboco. Acabamento. Cura.", equipmentList: ["Betoneira", "Colher", "Desempenadeira", "Régua", "Prumo", "Nível", "Taliscas", "Andaimes", "Carrinho", "Pá", "Enxada", "Baldes"] },
    { id: "COMP-CONTRAPISO-CONV-3CM", categoria: "Pisos / Nivelamento", description: "Contrapiso Convencional – 3cm", refComposition: "COMP-CONTRAPISO-CONV-3CM", unit: "m²", initialQuantity: 0, unitPrice: 0, subtotal: 0, unitHHProfessional: 0.12, unitHHelper: 0.18, unitWeight: 61.40, professionals: { pedreiro: 0.12 }, helpers: { servente: 0.18 }, detailedMaterials: [ { idMaterial: "cimento50kg", consumptionPerUnit: 0.2520, lossPercent: 5 }, { idMaterial: "areiaSaco20kg", consumptionPerUnit: 2.2590, lossPercent: 5 }, { idMaterial: "bianco18L", consumptionPerUnit: (1/100), lossPercent: 0 }, { idMaterial: "bianco3_6L", consumptionPerUnit: (3/100), lossPercent: 0 } ], observationsText: "Espessura 3cm. Nivelamento c/ taliscas/mestras. Traço 1:3,0. Juntas Dilatação. Cura 7 dias.", equipmentList: ["Betoneira", "Carrinho", "Pá", "Enxada", "Baldes", "Colher", "Desempenadeira", "Régua", "Nível"] }
];


// Função unificada para definir valores na configuração
export function setConfigValue(path, value) {
    const keys = path.split('.');
    let current = config;
    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            current[key] = value; // O valor já deve vir como número se for numérico
        } else {
            if (!current[key] || typeof current[key] !== 'object') { 
                current[key] = {};
            }
            current = current[key];
        }
    });
}


export function updateItemQuantityInStructure(itemId, quantity) {
    const item = budgetDataStructure.find(i => i.id === itemId);
    if (item) {
        item.initialQuantity = parseFloat(quantity) || 0;
    }
}


export function getConfig() {
    return JSON.parse(JSON.stringify(config)); 
}
export function getBudgetData() { return budgetDataStructure; }
export function getMateriaisBase() { return materiaisBase; }


export function calculateItemUnitPrice(item, currentConfig) {
    let totalMaterialCost = 0;
    if (item.detailedMaterials) {
        item.detailedMaterials.forEach(matDetail => {
            const materialBase = materiaisBase[matDetail.idMaterial];
            if (!materialBase) {
                console.warn(`Material base não encontrado para ID: ${matDetail.idMaterial} no item ${item.id}`);
                return;
            }
            const materialPrice = currentConfig.materialPrices[matDetail.idMaterial] != null ? currentConfig.materialPrices[matDetail.idMaterial] : materialBase.precoUnitarioDefault;
            const consumptionWithLoss = matDetail.consumptionPerUnit * (1 + (matDetail.lossPercent / 100));
            totalMaterialCost += consumptionWithLoss * materialPrice;
        });
    }

    let totalLaborCost = 0;
    if (item.professionals) {
        Object.keys(item.professionals).forEach(profKey => {
            const hours = item.professionals[profKey];
            const laborPrice = currentConfig.laborCosts[profKey] || 0;
            totalLaborCost += hours * laborPrice;
        });
    }
    if (item.helpers) {
        Object.keys(item.helpers).forEach(helperKey => {
            const hours = item.helpers[helperKey];
            const laborPrice = currentConfig.laborCosts[helperKey] || 0;
            totalLaborCost += hours * laborPrice;
        });
    }
    
    item.unitPrice = totalMaterialCost + totalLaborCost;
    return item.unitPrice;
}

export function calculateItemSubtotal(item) {
    item.subtotal = (item.initialQuantity || 0) * (item.unitPrice || 0);
    return item.subtotal;
}

export function calculateAllSubtotalsAndTotal() {
    let totalGeralSemBDI = 0;
    const currentConfig = getConfig(); 

    budgetDataStructure.forEach(item => {
        calculateItemUnitPrice(item, currentConfig);
        calculateItemSubtotal(item);
        totalGeralSemBDI += item.subtotal;
    });

    const bdiPercent = (currentConfig.bdi.bdiFinalAdotado / 100) || 0; 
    const totalGeralComBDI = totalGeralSemBDI * (1 + bdiPercent);
    
    const totalDisplay = document.getElementById('total-geral-orcamento');
    if (totalDisplay) {
        totalDisplay.textContent = totalGeralComBDI.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return totalGeralComBDI;
}

export function getFilteredItems(searchTerm) {
    if (!searchTerm || searchTerm.trim() === "") {
        return budgetDataStructure;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return budgetDataStructure.filter(item =>
        (item.description && item.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.id && item.id.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.categoria && item.categoria.toLowerCase().includes(lowerCaseSearchTerm))
    );
}

export function saveBudgetToLocalStorage() {
    const budgetToSave = {
        config: config, 
        budgetItemsQuantities: budgetDataStructure.map(item => ({ id: item.id, initialQuantity: item.initialQuantity }))
    };
    localStorage.setItem('budgetManagerData', JSON.stringify(budgetToSave));
    console.log('Orçamento salvo no LocalStorage.');
}

export function loadBudgetFromLocalStorage() {
    const savedData = localStorage.getItem('budgetManagerData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            const defaultConfig = JSON.parse(JSON.stringify(config));
            
            function mergeDeep(target, source) {
                for (const key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
                            mergeDeep(target[key], source[key]);
                        } else {
                            target[key] = source[key];
                        }
                    }
                }
            }
            
            if (parsedData.config) {
                mergeDeep(defaultConfig, parsedData.config);
            }
            config = defaultConfig;


            if (parsedData.budgetItemsQuantities) {
                parsedData.budgetItemsQuantities.forEach(savedItem => {
                    const budgetItem = budgetDataStructure.find(i => i.id === savedItem.id);
                    if (budgetItem) {
                        budgetItem.initialQuantity = savedItem.initialQuantity || 0;
                    }
                });
            }
            console.log('Orçamento carregado do LocalStorage.');
            calculateAllSubtotalsAndTotal(); 
            return true;
        } catch (error) {
            console.error("Erro ao parsear dados do LocalStorage:", error);
            localStorage.removeItem('budgetManagerData'); 
            return false;
        }
    }
    return false;
}