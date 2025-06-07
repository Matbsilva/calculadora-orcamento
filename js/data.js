// js/data.js
// Módulo para gerenciar dados base da aplicação, incluindo custos,
// materiais, BDI, área e a lista de composições de serviço (budgetDataStructure).

import { parseFloatStrict } from './utils.js';

// --- VARIÁVEIS DE ESTADO EXPORTADAS ---
export let laborCosts = { pedreiro: 38.00, servente: 20.00, impermeabilizador: 38.00, carpinteiro: 38.00, armador: 38.00 };
export let materialPrices = {}; // Será inicializado por initializeMaterialPrices
export let bdiFinalAdotado = 105.00; // BDI percentual (105.00 para 105%), resultando em Custo * 2.05
export let areaObra = 100; // m²
export let currentAggregatedMaterials = {}; // Para uso futuro ou se já estiver em uso
export let simDefaultValues = { simAdminMO: 0.0, simRiscoMO: 0.0, simCustoFinMO: 0.0, simTributosMO: 27.0, simLucroMO: 30.0, simAdminMat: 0.0, simRiscoMat: 0.0, simCustoFinMat: 0.0, simTributosMat: 13.0, simLucroMat: 30.0, simPercFatMO: 50.0 };
export let simulationBdiValues = { ...simDefaultValues };

export const materiaisBase = {
    areiaSaco20kg: { nomeDisplay: "Areia (em sacos de 20 kg)", unidade: "saco", pesoKg: 20, precoUnitarioDefault: 5.00 },
    cimento50kg: { nomeDisplay: "Cimento (50 kg)", unidade: "saco", pesoKg: 50, precoUnitarioDefault: 31.00 },
    blocoCeramico9cm: { nomeDisplay: "Bloco cerâmico 39x19x9 cm", unidade: "unidade", pesoKg: 3, precoUnitarioDefault: 3.50 },
    bianco3_6L: { nomeDisplay: "Bianco (balde 3,6L)", unidade: "balde", pesoKg: 3.78, precoUnitarioDefault: 100.00 },
    bianco18L: { nomeDisplay: "Bianco (18L)", unidade: "balde", pesoKg: 18.90, precoUnitarioDefault: 300.00 },
    blocoConcreto39x19x19: { nomeDisplay: "Bloco de Concreto 39x19x19 cm", unidade: "un", pesoKg: 15, precoUnitarioDefault: 3.50 },
    eps10cm: { nomeDisplay: "EPS (Placa 1x1m, 10cm)", unidade: "m²", pesoKg: 1.50, precoUnitarioDefault: 23.50 },
    telaQ61: { nomeDisplay: "Tela Soldada Q61 (3,4mm/15cm)", unidade: "painel", pesoKg: 6.06, precoUnitarioDefault: 100.00 },
    blocoCeramico14cm: { nomeDisplay: "Bloco Cerâmico 14x19x29cm", unidade: "un", pesoKg: 2.5, precoUnitarioDefault: 1.50 },
    viaplus7000_18kg: { nomeDisplay: "Viaplus 7000 (balde 18kg)", unidade: "balde", pesoKg: 18, precoUnitarioDefault: 250.00 },
    telaPoliester: { nomeDisplay: "Tela de Poliéster", unidade: "m²", pesoKg: 0.15, precoUnitarioDefault: 3.50 },
    pedra1Saco20kg: { nomeDisplay: "Pedra 1 (20 kg/saco)", unidade: "saco", pesoKg: 20, precoUnitarioDefault: 6.00 },
    blocoCCA: { nomeDisplay: "Bloco de Concreto Celular", unidade: "unidade", pesoKg: 10.80, precoUnitarioDefault: 19.00 },
    blocoCCA603010: { nomeDisplay: "Bloco de Concreto Celular (60x30x10cm)", unidade: "unidade", pesoKg: 10.80, precoUnitarioDefault: 13.00 },
    telaAcoPesada4_2mm10x10: { nomeDisplay: "Tela Aço Pesada 4,2mm Malha 10x10cm (Painel 2x3m)", unidade: "painel", pesoKg: (2 * 3) * 2.22, precoUnitarioDefault: 120.00 },
    arameRecozidoKg: { nomeDisplay: "Arame Recozido (para amarrações)", unidade: "kg", pesoKg: 1, precoUnitarioDefault: 15.00 },
    tabuasMadeiraM2: { nomeDisplay: "Tábuas de Madeira (para forma)", unidade: "m²", pesoKg: 12.50, precoUnitarioDefault: 50.00 },
    pregoKg: { nomeDisplay: "Prego (para forma)", unidade: "kg", pesoKg: 1, precoUnitarioDefault: 15.00 },
    telaAcoLeve4_2mm15x15: { nomeDisplay: "Tela Aço Leve 4,2mm Malha 15x15cm (Painel 2x3m)", unidade: "painel", pesoKg: (2 * 3) * 1.58, precoUnitarioDefault: 90.00 },
    eps15cm: { nomeDisplay: "EPS (Placa 1x1m, 15cm)", unidade: "m²", pesoKg: 2.25, precoUnitarioDefault: 35.25 },
};

// Lista de composições de serviço (seu array original com campos de custo adicionados)
export let budgetDataStructure = [
    { "categoria": "Pequenas Estruturas / Contenções", "description": "Sóculo em bloco cerâmico (altura 19 cm) - por ml", "refComposition": "COMP-SC001", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.43, "unitHHelper": 0.29, "unitWeight": 72.4, "professionals": { "pedreiro": 0.43 }, "helpers": { "servente": 0.29 }, "detailedMaterials": [{ "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 2.2857142857142856, "lossPercent": 5 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.2714285714285714, "lossPercent": 5 }, { "idMaterial": "blocoCeramico9cm", "consumptionPerUnit": 2.857142857142857, "lossPercent": 3 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.14285714285714285, "lossPercent": 0 }], "observationsText": "Verifique a base. Nível e Prumo. Amarração. Cura da Argamassa.", "equipmentList": ["Carrinho de mão", "Pá", "Enxada", "Baldes", "Colher de pedreiro", "Desempenadeira", "Martelo de borracha", "Trena", "Nível de bolha/mangueira/a laser", "Prumo"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Revestimentos / Argamassa", "description": "Chapisco em Superfícies de Alvenaria (3mm)", "refComposition": "COMP-CHAP001", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.12, "unitHHelper": 0.08, "unitWeight": 6.34, "professionals": { "pedreiro": 0.12 }, "helpers": { "servente": 0.08 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 0.0252, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.2259, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Limpeza da Superfície. Umedecimento. Cura. Cobrimento rugoso.", "equipmentList": ["Vassoura de piaçava ou broxa", "Baldes", "Masseira/carrinho de mão"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Pisos / Nivelamento", "description": "Contrapiso Convencional - 5cm", "refComposition": "COMP-CONTRAPISO-CONV-5CM", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.20, "unitHHelper": 0.30, "unitWeight": 102.15, "professionals": { "pedreiro": 0.20 }, "helpers": { "servente": 0.30 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 0.42, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 3.765, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.02, "lossPercent": 0 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.02, "lossPercent": 0 }], "observationsText": "Nivelamento com taliscas/mestras. Seguir traço. Juntas de Dilatação. Cura úmida.", "equipmentList": ["Betoneira", "Carrinho de mão", "Pá", "Enxada", "Baldes", "Colher de pedreiro", "Desempenadeira", "Régua de alumínio", "Nível"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Demolições / Remoções", "description": "Demolição de Revestimento", "refComposition": "COMP-DEM-REV", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.0, "unitHHelper": 1.0, "unitWeight": 0.0, "professionals": {}, "helpers": { "servente": 1.0 }, "detailedMaterials": [], "observationsText": "Utilizar EPIs. Isolar área. Demolir de cima para baixo. Cuidado com instalações. Entulho conforme Composição Remoção.", "equipmentList": ["Marreta", "Talhadeira", "Ponteiro", "Óculos de segurança", "Luvas", "Máscaras contra poeira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Demolições / Remoções", "description": "Logística Interna de Entulho (Carregamento + Transporte + Descarga)", "refComposition": "COMP-LOG-ENT-INT", "unit": "m³", "initialQuantity": 0, "unitHHProfessional": 0.0, "unitHHelper": 3.0, "unitWeight": 1300.0, "professionals": {}, "helpers": { "servente": 3.0 }, "detailedMaterials": [], "observationsText": "Cobre apenas logística interna. Produtividade pode variar. Usar EPIs. Otimizar caminhos.", "equipmentList": ["Carrinho de mão", "Pás", "Enxadas", "Luvas", "Botas de segurança", "Máscara (se necessário)"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Pisos / Nivelamento", "description": "Enchimento Leve Piso (EPS 10cm+Contrap. 5cm+Base 1cm) c/ Tela Q61", "refComposition": "COMP-ENCH-LEVE-001", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.35, "unitHHelper": 0.5, "unitWeight": 128.6, "professionals": { "pedreiro": 0.35 }, "helpers": { "servente": 0.5 }, "detailedMaterials": [{ "idMaterial": "eps10cm", "consumptionPerUnit": 1.0, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.504, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 4.518, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.02, "lossPercent": 0 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.04, "lossPercent": 0 }, { "idMaterial": "telaQ61", "consumptionPerUnit": 0.1667, "lossPercent": 2 }], "observationsText": "Preparo da Base. Assentamento EPS. Colocação Tela. Lançamento Contrapiso. Cura.", "equipmentList": ["Betoneira", "Carrinho de mão", "Serra para EPS", "Régua de alumínio", "Nível", "Espaçadores para tela", "Turquês"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Alvenarias / Vedações Verticais", "description": "Mureta Dupla Alvenaria H=1,20m (2x Bl. Concreto 19cm...)", "refComposition": "COMP-MUR-ALV-D", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.85, "unitHHelper": 1.25, "unitWeight": 573.54, "professionals": { "pedreiro": 0.85 }, "helpers": { "servente": 1.25 }, "detailedMaterials": [{ "idMaterial": "blocoConcreto39x19x19", "consumptionPerUnit": 25.0, "lossPercent": 5 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.7419, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 6.66, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.04, "lossPercent": 0 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Mureta dupla. Acabamento faces externas e topos. Prumo e alinhamento.", "equipmentList": ["Betoneira", "Andaimes", "Colher de pedreiro", "Desempenadeira", "Prumo", "Nível", "Régua", "Linha"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Alvenarias / Vedações Verticais", "description": "Mureta Bl. Concreto H=20cm c/ Regularização (1 fiada...)", "refComposition": "COMP-MUR-BC20-REG", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.31, "unitHHelper": 0.34, "unitWeight": 75.04, "professionals": { "pedreiro": 0.31 }, "helpers": { "servente": 0.34 }, "detailedMaterials": [{ "idMaterial": "blocoConcreto39x19x19", "consumptionPerUnit": 2.5, "lossPercent": 5 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.1449, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 1.2989, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Mureta 1 fiada. Acabamento 2 lados e topo. Impermeabilizar base (se aplicável).", "equipmentList": ["Colher de pedreiro", "Desempenadeira", "Prumo", "Nível", "Régua", "Betoneira", "Baldes"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Revestimentos / Argamassa", "description": "Regularização de Parede - 3cm (Chapisco + Reboco)", "refComposition": "COMP-REG-PAR30", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.35, "unitHHelper": 0.45, "unitWeight": 71.24, "professionals": { "pedreiro": 0.35 }, "helpers": { "servente": 0.45 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 0.294, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 2.6355, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.01, "lossPercent": 0 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.04, "lossPercent": 0 }], "observationsText": "Limpeza. Chapisco. Pontos e Mestras. Aplicação Reboco. Acabamento. Cura.", "equipmentList": ["Betoneira", "Colher de pedreiro", "Desempenadeira", "Régua de alumínio", "Prumo", "Nível", "Taliscas", "Andaimes"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Pequenas Estruturas / Contenções", "description": "Sóculo de Contenção ... U (Muretas H=15cm + CP 2cm)", "refComposition": "COMP-SOCULO-U-CONTENCAO", "unit": "un", "initialQuantity": 0, "unitHHProfessional": 3.5, "unitHHelper": 5.5, "unitWeight": 408.78, "professionals": { "pedreiro": 3.5 }, "helpers": { "servente": 5.5 }, "detailedMaterials": [{ "idMaterial": "blocoCeramico14cm", "consumptionPerUnit": 16.65, "lossPercent": 5 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 1.33, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 11.96, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 1.0, "lossPercent": 0 }], "observationsText": "Sóculo em U. Muretas bl. cerâmico 15cm. Contrapiso 2cm. Regularização. Nível e esquadro.", "equipmentList": ["Betoneira", "Colher de pedreiro", "Desempenadeira", "Nível", "Prumo", "Régua", "Trena"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Impermeabilização / Acabamentos de Base", "description": "Impermeabilização Piso com Viaplus 7000 e Tela Poliéster", "refComposition": "COMP-IMP-PISO", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.25, "unitHHelper": 0.0, "unitWeight": 4.48, "professionals": { "impermeabilizador": 0.25 }, "helpers": {}, "detailedMaterials": [{ "idMaterial": "viaplus7000_18kg", "consumptionPerUnit": 0.2222, "lossPercent": 5 }, { "idMaterial": "telaPoliester", "consumptionPerUnit": 1.0, "lossPercent": 5 }], "observationsText": "Preparo Superfície. Cantos e Ralos. Demãos cruzadas. Incorporar Tela. Teste Estanqueidade.", "equipmentList": ["Broxa", "Rolo de pintura", "Trincha", "Estilete", "Trena", "Baldes", "Misturador"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Impermeabilização / Acabamentos de Base", "description": "Meia Cana com Virada de 30cm (Rodapé Regularizado)", "refComposition": "COMP-MEIA-CANA-VIRADA-30CM", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.22, "unitHHelper": 0.31, "unitWeight": 23.89, "professionals": { "pedreiro": 0.22 }, "helpers": { "servente": 0.31 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 0.0966, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.866, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Meia cana curva e regularização parede 30cm alt. Chapisco. Executar e rebocar. Cura.", "equipmentList": ["Colher de pedreiro", "Desempenadeira de canto", "Régua", "Nível", "Betoneira", "Baldes"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Concretagem / Estruturas", "description": "Concreto FCK 25 MPa (Preparo Local - Traço Corrigido)", "refComposition": "COMP-CONC25", "unit": "m³", "initialQuantity": 0, "unitHHProfessional": 2.0, "unitHHelper": 4.0, "unitWeight": 2270.0, "professionals": { "pedreiro": 2.0 }, "helpers": { "servente": 4.0 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 6.0, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 45.5, "lossPercent": 5 }, { "idMaterial": "pedra1Saco20kg", "consumptionPerUnit": 45.5, "lossPercent": 5 }], "observationsText": "Traço 300kg cimento, 910kg areia, 910kg pedra/m³. Teste slump. Adensamento. Cura. EPIs.", "equipmentList": ["Betoneira", "Carrinho de mão", "Pá", "Enxada", "Baldes", "Vibrador", "Formas", "Desmoldante", "Escoras"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Concretagem / Estruturas", "description": "Concreto FCK 20 MPa (Preparo Local)", "refComposition": "COMP-CONC20", "unit": "m³", "initialQuantity": 0, "unitHHProfessional": 2.0, "unitHHelper": 4.0, "unitWeight": 2240.0, "professionals": { "pedreiro": 2.0 }, "helpers": { "servente": 4.0 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 5.4, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 46.0, "lossPercent": 5 }, { "idMaterial": "pedra1Saco20kg", "consumptionPerUnit": 45.0, "lossPercent": 5 }], "observationsText": "Traço 270kg cimento, 920kg areia, 900kg pedra/m³. Teste slump. Adensamento. Cura. EPIs.", "equipmentList": ["Betoneira", "Carrinho de mão", "Pá", "Enxada", "Baldes", "Vibrador", "Formas", "Desmoldante", "Escoras"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Concretagem / Estruturas", "description": "Concreto FCK 30 MPa (Preparo Local)", "refComposition": "COMP-CONC30", "unit": "m³", "initialQuantity": 0, "unitHHProfessional": 2.0, "unitHHelper": 4.0, "unitWeight": 2290.0, "professionals": { "pedreiro": 2.0 }, "helpers": { "servente": 4.0 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 6.4, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 45.5, "lossPercent": 5 }, { "idMaterial": "pedra1Saco20kg", "consumptionPerUnit": 46.0, "lossPercent": 5 }], "observationsText": "Traço 320kg cimento, 910kg areia, 920kg pedra/m³. Teste slump. Adensamento. Cura. EPIs.", "equipmentList": ["Betoneira", "Carrinho de mão", "Pá", "Enxada", "Baldes", "Vibrador", "Formas", "Desmoldante", "Escoras"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Revestimentos / Argamassa", "description": "Requadro de Vãos (Portas/Janelas)", "refComposition": "COMP-REQ001", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.15, "unitHHelper": 0.1, "unitWeight": 7.69, "professionals": { "pedreiro": 0.15 }, "helpers": { "servente": 0.1 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 0.0252, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.2259, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.05, "lossPercent": 0 }], "observationsText": "Chapiscar vãos. Controlar espessura para nível/esquadro. Cura úmida.", "equipmentList": ["Colher de pedreiro", "Desempenadeira", "Régua", "Prumo", "Nível", "Trena", "Baldes", "Masseira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Pisos / Nivelamento", "description": "Enchimento/Contrapiso Bl. CCA e Regularização (~15.5cm)", "refComposition": "COMP-ENCH001", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.3, "unitHHelper": 0.2, "unitWeight": 133.11, "professionals": { "pedreiro": 0.3 }, "helpers": { "servente": 0.2 }, "detailedMaterials": [{ "idMaterial": "blocoCCA", "consumptionPerUnit": 5.5, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.294, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 2.6356, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.02, "lossPercent": 0 }], "observationsText": "Assentamento Bloco CCA. Nivelamento. Tratamento Juntas. Cura.", "equipmentList": ["Argamassadeira", "Serra para bloco celular", "Colher", "Desempenadeira", "Régua", "Nível", "Trena", "Carrinho", "Betoneira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Alvenarias / Vedações Verticais", "description": "Alvenaria Vedação Bl. Concreto (incl. assent. e reboco)", "refComposition": "COMP-ALV001", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.39, "unitHHelper": 0.26, "unitWeight": 355.24, "professionals": { "pedreiro": 0.39 }, "helpers": { "servente": 0.26 }, "detailedMaterials": [{ "idMaterial": "blocoConcreto39x19x19", "consumptionPerUnit": 16.0, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.4372093023255814, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 3.9155038759689923, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.15503875968992248, "lossPercent": 0 }], "observationsText": "Preparar base. Chapisco recomendado. Usar réguas para reboco. Cura úmida. Vergas/contravergas.", "equipmentList": ["Betoneira", "Carrinho", "Pá", "Enxada", "Baldes", "Colher", "Martelo borracha", "Linha", "Prumo", "Nível", "Trena", "Serra bloco", "Masseira", "Desempenadeira", "Régua"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Pisos / Nivelamento", "description": "Enchimento/Contrapiso Bl. CCA (60x30x10cm) e CP 5cm", "refComposition": "COMP-ENCH-CONT-BCC", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 1.08, "unitHHelper": 0.72, "unitWeight": 288.2, "professionals": { "pedreiro": 1.08 }, "helpers": { "servente": 0.72 }, "detailedMaterials": [{ "idMaterial": "blocoCCA603010", "consumptionPerUnit": 16.67, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.42, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 3.765, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.02, "lossPercent": 0 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.02, "lossPercent": 0 }], "observationsText": "Bloco CCA assentado sobre face 10cm. Contrapiso 5cm. Usar argamassa colante/fina para CCA.", "equipmentList": ["Argamassadeira", "Serra bloco", "Colher", "Desempenadeira", "Régua", "Nível", "Trena", "Carrinho", "Betoneira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Alvenarias / Vedações Verticais", "description": "Mureta Bl. Concreto - 1 Fiada (10/20cm) - Assent. s/ CAL", "refComposition": "COMP-MUR_BLC001", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.12, "unitHHelper": 0.08, "unitWeight": 47.24, "professionals": { "pedreiro": 0.12 }, "helpers": { "servente": 0.08 }, "detailedMaterials": [{ "idMaterial": "blocoConcreto39x19x19", "consumptionPerUnit": 2.56, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.0294, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.2636, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Altura 10/20cm (1 fiada). Argamassa s/ cal, c/ Bianco. Nivelamento e prumo. S/ regularização.", "equipmentList": ["Colher", "Nível", "Prumo", "Linha", "Baldes", "Masseira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Alvenarias / Vedações Verticais", "description": "Mureta Bl. CCA (60x30x10cm) - 30cm alt (1 Fiada deitado)", "refComposition": "COMP-MUR_CCA002", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.18, "unitHHelper": 0.12, "unitWeight": 19.51, "professionals": { "pedreiro": 0.18 }, "helpers": { "servente": 0.12 }, "detailedMaterials": [{ "idMaterial": "blocoCCA603010", "consumptionPerUnit": 1.6667, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.0036, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.018, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Altura 30cm (1 fiada CCA deitado). Argamassa fina c/ Bianco. Nivelamento e prumo. S/ regularização.", "equipmentList": ["Serra bloco", "Colher", "Nível", "Prumo", "Linha", "Baldes", "Masseira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Estruturas / Lajes", "description": "Base Concreto Estrut. Laje - 4,5x4,5x0,20m (40T)", "refComposition": "COMP-BASE-CONC-001", "unit": "un", "initialQuantity": 0, "unitHHProfessional": 103.68, "unitHHelper": 97.2, "unitWeight": 9384.72, "professionals": { "pedreiro": 48.6, "carpinteiro": 6.48, "armador": 48.6 }, "helpers": { "servente": 97.2 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 28.35, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 182.25, "lossPercent": 5 }, { "idMaterial": "pedra1Saco20kg", "consumptionPerUnit": 186.3, "lossPercent": 5 }, { "idMaterial": "telaAcoPesada4_2mm10x10", "consumptionPerUnit": 12.0, "lossPercent": 0 }, { "idMaterial": "arameRecozidoKg", "consumptionPerUnit": 0.25, "lossPercent": 5 }, { "idMaterial": "tabuasMadeiraM2", "consumptionPerUnit": 3.6, "lossPercent": 5 }, { "idMaterial": "pregoKg", "consumptionPerUnit": 0.1, "lossPercent": 5 }], "observationsText": "Armadura Dupla Tela. Espaçadores. Sobreposição. Concretagem Contínua. Cura 7 dias.", "equipmentList": ["Betoneira", "Carrinho", "Vibrador", "Formas", "Serra", "Martelo", "Trena", "Nível", "Içamento (se nec.)"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Estruturas / Lajes", "description": "Base Concreto Estrut. Laje - 4,5x4_5x0,10m (10T)", "refComposition": "COMP-BASE-CONC-002", "unit": "un", "initialQuantity": 0, "unitHHProfessional": 38.04, "unitHHelper": 46.58, "unitWeight": 4693.36, "professionals": { "pedreiro": 23.29, "carpinteiro": 3.11, "armador": 11.64 }, "helpers": { "servente": 46.58 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 14.18, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 91.13, "lossPercent": 5 }, { "idMaterial": "pedra1Saco20kg", "consumptionPerUnit": 93.15, "lossPercent": 5 }, { "idMaterial": "telaAcoLeve4_2mm15x15", "consumptionPerUnit": 6.0, "lossPercent": 0 }, { "idMaterial": "arameRecozidoKg", "consumptionPerUnit": 0.15, "lossPercent": 5 }, { "idMaterial": "tabuasMadeiraM2", "consumptionPerUnit": 1.8, "lossPercent": 5 }, { "idMaterial": "pregoKg", "consumptionPerUnit": 0.05, "lossPercent": 5 }], "observationsText": "Armadura Simples. Espaçadores. Sobreposição. Concretagem Contínua. Cura 7 dias.", "equipmentList": ["Betoneira", "Carrinho", "Vibrador", "Formas", "Serra", "Martelo", "Trena", "Nível", "Içamento (se nec.)"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Impermeabilização / Acabamentos de Base", "description": "Meia Cana de Argamassa (Cimento e Areia)", "refComposition": "COMP-MEIA-CANA-001", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.08, "unitHHelper": 0.08, "unitWeight": 3.04, "professionals": { "pedreiro": 0.08 }, "helpers": { "servente": 0.08 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 0.0106, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.0946, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Preparo Argamassa. Aplicação e moldagem raio ~4cm. Acabamento liso. Cura 72h.", "equipmentList": ["Colher", "Desempenadeira de canto", "Baldes", "Masseira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Pisos / Nivelamento", "description": "Enchimento Piso EPS (15cm), Base (1cm), Contrap. (5cm)", "refComposition": "COMP-ENCH-EPS-TESTE", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.3, "unitHHelper": 0.45, "unitWeight": 124.35, "professionals": { "pedreiro": 0.3 }, "helpers": { "servente": 0.45 }, "detailedMaterials": [{ "idMaterial": "eps15cm", "consumptionPerUnit": 1.0, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.504, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 4.518, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.02, "lossPercent": 0 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.04, "lossPercent": 0 }], "observationsText": "Preparo Base. EPS sobre base fresca. Contrapiso sobre EPS curado. Cura. Nivelamento.", "equipmentList": ["Betoneira", "Carrinho", "Serra EPS", "Régua", "Nível", "Desempenadeira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Alvenarias / Vedações Verticais", "description": "Mureta Bl. CCA (60x30x10cm) - 10cm alt COM Regularização", "refComposition": "COMP-MUR_CCA003-REG", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.19, "unitHHelper": 0.14, "unitWeight": 25.6, "professionals": { "pedreiro": 0.19 }, "helpers": { "servente": 0.14 }, "detailedMaterials": [{ "idMaterial": "blocoCCA603010", "consumptionPerUnit": 0.833, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.0018, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.009, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.01, "lossPercent": 0 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.063, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.5648, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.02, "lossPercent": 0 }], "observationsText": "Mureta 10cm CCA, c/ chapisco e reboco. Nivelamento e prumo.", "equipmentList": ["Serra bloco", "Colher", "Desempenadeira", "Nível", "Prumo", "Linha", "Baldes", "Masseira", "Betoneira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Alvenarias / Vedações Verticais", "description": "Mureta Bl. CCA (60x30x10cm) - 30cm alt COM Regularização", "refComposition": "COMP-MUR_CCA004-REG", "unit": "ml", "initialQuantity": 0, "unitHHProfessional": 0.35, "unitHHelper": 0.23, "unitWeight": 55.4, "professionals": { "pedreiro": 0.35 }, "helpers": { "servente": 0.23 }, "detailedMaterials": [{ "idMaterial": "blocoCCA603010", "consumptionPerUnit": 1.6667, "lossPercent": 3 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.0036, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 0.018, "lossPercent": 5 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.01, "lossPercent": 0 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.147, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 1.3178, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Mureta 30cm CCA deitado, c/ chapisco e reboco. Nivelamento e prumo.", "equipmentList": ["Serra bloco", "Colher", "Desempenadeira", "Nível", "Prumo", "Linha", "Baldes", "Masseira", "Betoneira"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Pequenas Estruturas / Contenções", "description": "Sóculo em bloco cerâmico (altura 19 cm) - por m² de face", "refComposition": "COMP-SC002", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.5, "unitHHelper": 0.33, "unitWeight": 84.46, "professionals": { "pedreiro": 0.5 }, "helpers": { "servente": 0.33 }, "detailedMaterials": [{ "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 2.6666666666666665, "lossPercent": 5 }, { "idMaterial": "cimento50kg", "consumptionPerUnit": 0.31666666666666665, "lossPercent": 5 }, { "idMaterial": "blocoCeramico9cm", "consumptionPerUnit": 3.3333333333333335, "lossPercent": 3 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.088, "lossPercent": 0 }], "observationsText": "Verifique a base. Nível e Prumo. Amarração. Cura. Medição por m² de face.", "equipmentList": ["Carrinho", "Pá", "Enxada", "Baldes", "Colher", "Desempenadeira", "Martelo borracha", "Trena", "Nível", "Prumo"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Revestimentos / Argamassa", "description": "Regularização de Parede - 2cm (Chapisco + Reboco)", "refComposition": "COMP-REG-PAR20", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.35, "unitHHelper": 0.45, "unitWeight": 51.33, "professionals": { "pedreiro": 0.35 }, "helpers": { "servente": 0.45 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 0.21, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 1.8825, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.01, "lossPercent": 0 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.01, "lossPercent": 0 }], "observationsText": "Espessura 2,5cm (0,5cm chapisco + 2,0cm reboco). Limpeza. Chapisco. Pontos/Mestras. Reboco. Acabamento. Cura.", "equipmentList": ["Betoneira", "Colher", "Desempenadeira", "Régua", "Prumo", "Nível", "Taliscas", "Andaimes", "Carrinho", "Pá", "Enxada", "Baldes"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 },
    { "categoria": "Pisos / Nivelamento", "description": "Contrapiso Convencional – 3cm", "refComposition": "COMP-CONTRAPISO-CONV-3CM", "unit": "m²", "initialQuantity": 0, "unitHHProfessional": 0.12, "unitHHelper": 0.18, "unitWeight": 61.4, "professionals": { "pedreiro": 0.12 }, "helpers": { "servente": 0.18 }, "detailedMaterials": [{ "idMaterial": "cimento50kg", "consumptionPerUnit": 0.252, "lossPercent": 5 }, { "idMaterial": "areiaSaco20kg", "consumptionPerUnit": 2.259, "lossPercent": 5 }, { "idMaterial": "bianco18L", "consumptionPerUnit": 0.01, "lossPercent": 0 }, { "idMaterial": "bianco3_6L", "consumptionPerUnit": 0.03, "lossPercent": 0 }], "observationsText": "Espessura 3cm. Nivelamento c/ taliscas/mestras. Traço 1:3,0. Juntas Dilatação. Cura 7 dias.", "equipmentList": ["Betoneira", "Carrinho", "Pá", "Enxada", "Baldes", "Colher", "Desempenadeira", "Régua", "Nível"], custoUnitarioMaterial: 0, custoUnitarioMO: 0, custoUnitarioTotal: 0 }
];

// --- FUNÇÕES DE GERENCIAMENTO E ATUALIZAÇÃO ---

function initializeMaterialPrices() {
    Object.keys(materiaisBase).forEach(idMat => {
        materialPrices[idMat] = parseFloatStrict(materiaisBase[idMat].precoUnitarioDefault);
    });
    console.log("Preços dos materiais inicializados/resetados para os padrões.");
}

export function loadInitialData() {
    console.log("data.loadInitialData() chamada.");
    laborCosts = { pedreiro: 38.00, servente: 20.00, impermeabilizador: 38.00, carpinteiro: 38.00, armador: 38.00 };
    initializeMaterialPrices();
    bdiFinalAdotado = 105.00; // BDI percentual (105.00 para 105%)
    areaObra = 100;
    simulationBdiValues = { ...simDefaultValues };
    budgetDataStructure.forEach(comp => {
        comp.initialQuantity = 0;
        // Garante que os campos de custo existem e são zerados antes do recálculo
        comp.custoUnitarioMaterial = 0;
        comp.custoUnitarioMO = 0;
        comp.custoUnitarioTotal = 0;
    });
    recalculateAllComposicoesCustos();
    console.log("Dados iniciais carregados e custos das composições recalculados.");
}

export function recalculateAllComposicoesCustos() {
    console.log("data.recalculateAllComposicoesCustos() chamada.");
    if (!budgetDataStructure || budgetDataStructure.length === 0) {
        console.warn("Nenhuma composição de serviço (budgetDataStructure) para recalcular.");
        return;
    }

    budgetDataStructure.forEach(comp => {
        let custoMatTotalComp = 0;
        if (comp.detailedMaterials && Array.isArray(comp.detailedMaterials)) {
            comp.detailedMaterials.forEach(detMat => {
                const precoUnit = materialPrices[detMat.idMaterial] !== undefined ? parseFloatStrict(materialPrices[detMat.idMaterial]) : 0;
                const consumo = parseFloatStrict(detMat.consumptionPerUnit);
                const perda = 1 + (parseFloatStrict(detMat.lossPercent) / 100 || 0);
                custoMatTotalComp += consumo * precoUnit * perda;
            });
        }
        comp.custoUnitarioMaterial = custoMatTotalComp;

        let custoMOTotalComp = 0;
        // Calcula o custo de M.O. com base nos totais de HH e nos custos/hora
        // unitHHProfessional e unitHHelper já são os totais por unidade da composição
        // e professionals/helpers detalham por tipo, então podemos usar unitHHProfessional/Helper se forem mais diretos
        // ou iterar sobre professionals/helpers para mais granularidade.
        // Vou usar a iteração sobre professionals/helpers, pois é mais explícito.
        if (comp.professionals) {
            Object.keys(comp.professionals).forEach(profTipo => {
                const horas = parseFloatStrict(comp.professionals[profTipo]);
                const custoHora = laborCosts[profTipo] !== undefined ? parseFloatStrict(laborCosts[profTipo]) : 0;
                custoMOTotalComp += horas * custoHora;
            });
        }
        if (comp.helpers) {
            Object.keys(comp.helpers).forEach(helpTipo => {
                const horas = parseFloatStrict(comp.helpers[helpTipo]);
                const custoHora = laborCosts[helpTipo] !== undefined ? parseFloatStrict(laborCosts[helpTipo]) : 0;
                custoMOTotalComp += horas * custoHora;
            });
        }
        comp.custoUnitarioMO = custoMOTotalComp;
        comp.custoUnitarioTotal = comp.custoUnitarioMaterial + comp.custoUnitarioMO;
    });
    console.log("Custos das composições recalculados.");
}

export function updateGlobalDataFromConfigs(configData) {
    console.log("data.updateGlobalDataFromConfigs() chamada com:", configData);
    if (!configData) {
        console.warn("updateGlobalDataFromConfigs: configData não fornecido.");
        return;
    }

    if (configData.laborCosts) {
        Object.keys(configData.laborCosts).forEach(profTipo => {
            updateLaborCost(profTipo, configData.laborCosts[profTipo]);
        });
    }

    if (configData.materialPrices) {
        Object.keys(configData.materialPrices).forEach(matId => {
            // A função updateMaterialPrice já existe e atualiza o objeto materialPrices
            updateMaterialPrice(matId, configData.materialPrices[matId]);
        });
    }
    
    if (configData.bdiFinal !== undefined) setBdiFinalAdotado(configData.bdiFinal);
    if (configData.areaObra !== undefined) setAreaObra(configData.areaObra);

    recalculateAllComposicoesCustos();
    console.log("Dados base atualizados pelas configurações e custos recalculados.");
}

export function resetBudgetDataStructure() {
    console.log("data.resetBudgetDataStructure() chamada.");
    loadInitialData();
    currentAggregatedMaterials = {};
    console.log("Estrutura de dados e custos resetados para os padrões.");
}

// --- FUNÇÕES SETTER E GETTER (Mantidas e adaptadas do seu original) ---
export function updateLaborCost(type, value) {
    if (laborCosts.hasOwnProperty(type)) {
        laborCosts[type] = parseFloatStrict(value);
    } else {
        console.warn(`Tipo de mão de obra não existente: ${type}`);
    }
}

export function updateMaterialPrice(id, value) {
    if (materiaisBase.hasOwnProperty(id)) { // Verifica se o ID existe na base de materiais
        materialPrices[id] = parseFloatStrict(value);
    } else {
        console.warn(`Material com ID '${id}' não existente na base de materiais (materiaisBase).`);
    }
}

export function setBdiFinalAdotado(value) {
    bdiFinalAdotado = parseFloatStrict(value);
}

export function setAreaObra(value) {
    let val = parseInt(value, 10);
    areaObra = (val > 0) ? val : 1;
}

export function updateBudgetItemQuantity(indexOrRef, quantity) {
    let itemIndex = -1;
    if (typeof indexOrRef === 'number' && indexOrRef >= 0 && indexOrRef < budgetDataStructure.length) {
        itemIndex = indexOrRef;
    } else if (typeof indexOrRef === 'string') {
        itemIndex = budgetDataStructure.findIndex(item => item.refComposition === indexOrRef);
    }

    if (itemIndex !== -1 && budgetDataStructure[itemIndex]) {
        budgetDataStructure[itemIndex].initialQuantity = parseFloatStrict(quantity);
    } else {
        console.warn("Índice/Ref inválido ou não encontrado para atualizar quantidade:", indexOrRef);
    }
}

export function getLaborCosts() { return { ...laborCosts }; }
export function getMaterialPrices() { return { ...materialPrices }; }
export function getBdiFinalAdotado() { return bdiFinalAdotado; }
export function getAreaObra() { return areaObra; }
export function getBudgetDataStructure() { return [...budgetDataStructure]; } // Retorna uma cópia superficial do array
export function getMateriaisBase() { return { ...materiaisBase }; } // Retorna uma cópia superficial
export function getCurrentAggregatedMaterials() { return { ...currentAggregatedMaterials }; }
export function setCurrentAggregatedMaterials(aggMaterials) { currentAggregatedMaterials = { ...aggMaterials }; } // Define uma cópia
export function getSimulationBdiValues() { return { ...simulationBdiValues }; }
export function setSimulationBdiValues(newValues) { simulationBdiValues = { ...simDefaultValues, ...newValues }; }

export function resetMaterialPricesToDefault() {
    initializeMaterialPrices();
    // Após resetar os preços, é importante recalcular os custos das composições
    recalculateAllComposicoesCustos();
}

// Chama a inicialização dos preços dos materiais e o cálculo inicial dos custos das composições
// ao carregar o módulo pela primeira vez. Isso garante que os dados estejam prontos.
// A chamada explícita de loadInitialData em main.js também fará isso,
// mas ter aqui garante que os custos sejam calculados mesmo se o módulo for importado
// antes de main.js executar completamente (embora improvável com DOMContentLoaded).
// Melhor deixar a chamada explícita para loadInitialData em main.js para controlar a ordem.
// initializeMaterialPrices(); // Já chamado no seu código original, mantido aqui.
// recalculateAllComposicoesCustos(); // Adicionado para calcular os custos na carga inicial do módulo.
// Vou comentar estas duas e confiar que loadInitialData em main.js fará o trabalho.
// A initializeMaterialPrices() global que você tinha já faz o trabalho na carga.
// A chamada a recalculateAllComposicoesCustos() será feita por loadInitialData.