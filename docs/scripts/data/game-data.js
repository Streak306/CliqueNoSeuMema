// 🎁 Tabela de códigos resgatáveis — mantém os presentes organizados em um único lugar.
export const CODE_REWARDS = {
  entreak: 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000
};

// 🎨 Caminhos centrais das imagens do Mema; usados tanto no preload quanto nas trocas de rosto.
export const IMG_BACK  = 'assets/images/variacoes-mema/mema_back.png';
export const IMG_FRONT = 'assets/images/variacoes-mema/mema_front.png';
export const IMG_RESET = 'assets/images/variacoes-mema/mema_reset.png';

// 🧮 Escalas utilizadas para formatar números gigantes de forma amigável.
// Cada objeto segue a tabela enviada: ordem (potência), valor base, nome e sufixo sugerido.
export const NUMBER_SCALES = [
  { order:0, value:1,               power:0,  name:'',          suffix:''   },
  { order:1, value:1e3,             power:3,  name:'mil',       suffix:'K'  },
  { order:2, value:1e6,             power:6,  name:'milhão',    suffix:'M'  },
  { order:3, value:1e9,             power:9,  name:'bilhão',    suffix:'B'  },
  { order:4, value:1e12,            power:12, name:'trilhão',   suffix:'T'  },
  { order:5, value:1e15,            power:15, name:'quadrilhão',suffix:'Qa' },
  { order:6, value:1e18,            power:18, name:'quintilhão',suffix:'Qi' },
  { order:7, value:1e21,            power:21, name:'sextilhão', suffix:'Sx' },
  { order:8, value:1e24,            power:24, name:'septilhão', suffix:'Sp' },
  { order:9, value:1e27,            power:27, name:'octilhão',  suffix:'Oc' },
  { order:10,value:1e30,            power:30, name:'nonilhão',  suffix:'No' },
  { order:11,value:1e33,            power:33, name:'decilhão',  suffix:'De' }
];

export const NUMBER_FORMAT_IDS = ['power','exact','name','suffix'];
export const DEFAULT_NUMBER_FORMAT = 'suffix';

export const FRONT_TIME_MS = 400;

// 🔒 Impedir que qualquer imagem seja arrastada
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img").forEach(img => {
    img.draggable = false;
    img.addEventListener("dragstart", e => e.preventDefault());
  });

  // Garante que nenhuma imagem, em nenhum caso, possa ser arrastada
  window.addEventListener("dragstart", e => {
    if (e.target.tagName === "IMG") e.preventDefault();
  });
});


// 🔢 Elementos que sofrem efeito "glitch" durante a cena de colapso.
export const GLITCH_DIGIT_TARGETS = [
  'pts','pc','mps','statBanco','statTempo','statConstr','statMps','statClique','statCliques'
];

// 🛒 Catálogo base de prédios. Cada item controla preço inicial (base), escala de preço (r),
// produção por segundo (p) e limite máximo disponível.
export const SHOP = [
  {id:'dedo',        name:'Dedo',               base:15,           r:1.15, p:0.10,      limit:9999, icon:'docs/assets/images/fundo/Dedo.png'},
  {id:'roupa',       name:'Roupa',              base:100,          r:1.15, p:1.00,      limit:9999, icon:'docs/assets/images/fundo/roupa.png'},
  {id:'agua',        name:'Água',               base:1100,         r:1.15, p:8.00,      limit:9999, icon:'docs/assets/images/fundo/agua.png'},
  {id:'jardim',      name:'Jardim',             base:12000,        r:1.15, p:47.00,     limit:9999, icon:'docs/assets/images/fundo/jardim.png'},
  {id:'criadouro',   name:'Criadouro',          base:130000,       r:1.15, p:260.00,    limit:9999, icon:'docs/assets/images/fundo/criadouro.png'},
  {id:'mineracao',   name:'Mineração',          base:1400000,      r:1.15, p:1400.00,   limit:9999, icon:'docs/assets/images/fundo/mineracao.png'},
  {id:'vila',        name:'Vila',               base:20000000,     r:1.15, p:7800.00,   limit:9999, icon:'docs/assets/images/fundo/vila.png'},
  {id:'energia',     name:'Gerador de Energia', base:330000000,    r:1.15, p:44000.00,  limit:9999, icon:'docs/assets/images/fundo/energia.png'},
  {id:'musica',      name:'Estúdio de Música',  base:5100000000,   r:1.15, p:260000.00, limit:9999, icon:'docs/assets/images/fundo/musica.png'},
  {id:'namorada',    name:'Namorada',           base:75000000000,  r:1.15, p:1600000.0, limit:9999, icon:'docs/assets/images/fundo/namorada.png'}
];

export const SHOP_LOOKUP = SHOP.reduce((acc, item)=>{
  acc[item.id] = item;
  return acc;
}, {});
//UPGRADES
// 🧱 Lista mestre das melhorias. Dividir em blocos por prédio ajuda a manter a manutenção simples.
const TAGS = ['Normal','Pedra','Carvão','Cobre','Ferro','Bronze','Prata','Ouro','Titânio','Urânio','Rubi','Esmeralda','Safira','Ametista','Diamante'];
const upgradeIcon = (type, idx)=> `assets/images/Upgrade/up-${type}-t${idx}.png`;

const CLICK_UPGRADES = [
  {name:'Clique', unlock:1_000, cost:50_000},
  {name:'Clique de Pedra', unlock:100_000, cost:5_000_000},
  {name:'Clique de Carvão', unlock:10_000_000, cost:500_000_000},
  {name:'Clique de Cobre', unlock:1_000_000_000, cost:50_000_000_000},
  {name:'Clique de Ferro', unlock:100_000_000_000, cost:5_000_000_000_000},
  {name:'Clique de Bronze', unlock:10_000_000_000_000, cost:500_000_000_000_000},
  {name:'Clique de Prata', unlock:1_000_000_000_000_000, cost:50_000_000_000_000_000},
  {name:'Clique de Ouro', unlock:100_000_000_000_000_000, cost:5_000_000_000_000_000_000},
  {name:'Clique de Titânio', unlock:10_000_000_000_000_000_000, cost:500_000_000_000_000_000_000},
  {name:'Clique de Urânio', unlock:1_000_000_000_000_000_000_000, cost:50_000_000_000_000_000_000_000},
  {name:'Clique de Rubi', unlock:100_000_000_000_000_000_000_000, cost:5_000_000_000_000_000_000_000_000},
  {name:'Clique de Esmeralda', unlock:10_000_000_000_000_000_000_000_000, cost:500_000_000_000_000_000_000_000_000},
  {name:'Clique de Safira', unlock:1_000_000_000_000_000_000_000_000_000, cost:50_000_000_000_000_000_000_000_000_000},
  {name:'Clique de Ametista', unlock:100_000_000_000_000_000_000_000_000_000, cost:5_000_000_000_000_000_000_000_000_000_000},
  {name:'Clique de Diamante', unlock:10_000_000_000_000_000_000_000_000_000_000, cost:500_000_000_000_000_000_000_000_000_000_000}
].map((item, idx)=> ({
  id:`up-cursor-t${idx+1}`,
  name:item.name,
  tag:TAGS[idx],
  effect:'Cliques adicionam +1% do MpS ao MpC.',
  cost:item.cost,
  img:upgradeIcon('cursor', idx+1),
  requirement:{type:'clicks', count:item.unlock},
  requirementText:`${item.unlock.toLocaleString('pt-BR')} cliques feitos`,
  kind:'click'
}));

const DEDO_UPGRADES = [
  {name:'Dedão', req:1, cost:100, effect:'k'},
  {name:'Dedo de Pedra', req:5, cost:500, effect:'k'},
  {name:'Dedo de Carvão', req:10, cost:5_000, effect:'k'},
  {name:'Dedo de Cobre', req:25, cost:50_000, effect:'activate', mult:1},
  {name:'Dedo de Ferro', req:50, cost:750_000, effect:'bonus', mult:5},
  {name:'Dedo de Bronze', req:100, cost:12_500_000, effect:'bonus', mult:10},
  {name:'Dedo de Prata', req:150, cost:250_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Ouro', req:200, cost:5_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Titânio', req:250, cost:100_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Urânio', req:300, cost:2_500_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Rubi', req:350, cost:65_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Esmeralda', req:400, cost:1_750_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Safira', req:450, cost:50_000_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Ametista', req:500, cost:1_500_000_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Diamante', req:550, cost:45_000_000_000_000_000_000, effect:'bonus', mult:20}
].map((item, idx)=> ({
  id:`up-dedo-t${idx+1}`,
  name:item.name,
  tag:TAGS[idx],
  effect: item.effect === 'k' ? 'Dedos são duas vezes mais eficientes.' : 'Amplia o bônus de dedos.',
  cost:item.cost,
  img:upgradeIcon('dedo', idx+1),
  requirement:{type:'building', building:'dedo', count:item.req},
  kind:'dedo',
  dedoEffect:item.effect,
  fingerMultiplier:item.mult ?? null
}));

const makeDoubleUpgradeSeries = (type, building, entries)=> entries.map((item, idx)=>({
  id:`up-${building}-t${idx+1}`,
  name:item.name,
  tag:TAGS[idx],
  effect:`${SHOP_LOOKUP[building]?.name ?? building} são duas vezes mais eficientes.`,
  cost:item.cost,
  img:upgradeIcon(type, idx+1),
  requirement:{type:'building', building, count:item.req},
  kind:'building',
  target:building,
  multiplier:2
}));

const STANDARD_UPGRADE_MULTS = [
  10, 50, 500, 5_000, 50_000,
  500_000, 5_000_000, 50_000_000, 500_000_000, 5_000_000_000,
  50_000_000_000, 500_000_000_000, 5_000_000_000_000, 50_000_000_000_000, 500_000_000_000_000
];

const applyStandardCosts = (building, entries) => {
  const base = SHOP_LOOKUP[building]?.base ?? 0;
  return entries.map((item, idx)=> ({ ...item, cost: base * STANDARD_UPGRADE_MULTS[idx] }));
};

const ROUPA_UPS = makeDoubleUpgradeSeries('roupa','roupa', applyStandardCosts('roupa', [
  {name:'Cabide', req:1},
  {name:'Capacete', req:5},
  {name:'Broche', req:25},
  {name:'Colar', req:50},
  {name:'Pulseira', req:100},
  {name:'Medalha de Primeiro Lugar', req:150},
  {name:'Piercing de Lua', req:200},
  {name:'Coroa', req:250},
  {name:'Peitoral', req:300},
  {name:'Máscara de Radiação', req:350},
  {name:'Brinco de Rubi', req:400},
  {name:'Colar de Esmeralda', req:450},
  {name:'Brinco de Safira', req:500},
  {name:'Revestimento Mágico de Coração', req:550},
  {name:'Anel de Casamento', req:600}
]));

const AGUA_UPS = makeDoubleUpgradeSeries('agua','agua', applyStandardCosts('agua', [
  {name:'Garrafa de Água', req:1},
  {name:'Água de Rios e Pedras', req:5},
  {name:'Caldeirão de Purificar Água', req:25},
  {name:'Encanamento de Cobre', req:50},
  {name:"Caixa d'Água", req:100},
  {name:'Pote de Bronze', req:150},
  {name:'Lágrima Lunar', req:200},
  {name:'Água Real', req:250},
  {name:'Energia Movida a Água', req:300},
  {name:'Água Radioativa', req:350},
  {name:'Água de Sangue Humano', req:400},
  {name:'Água Tirada da Vida das Plantas', req:450},
  {name:'Bolhas de Água', req:500},
  {name:'Slime de Água Mágico', req:550},
  {name:'Transformador de Luz em Água', req:600}
]));

const JARDIM_UPS = makeDoubleUpgradeSeries('Jardim','jardim', applyStandardCosts('jardim', [
  {name:'Fertilizante', req:1},
  {name:'Arado de Pedra', req:5},
  {name:'Churrasqueira', req:25},
  {name:'Aspersor de Cobre', req:50},
  {name:'Foice', req:100},
  {name:'Sino', req:150},
  {name:'Lâmpada de Energia Lunar', req:200},
  {name:'Espantalho Real do Rei Bigode', req:250},
  {name:'Drone Irrigador e Coletador', req:300},
  {name:'Fertilizante Duvidoso', req:350},
  {name:'Totem de Outono', req:400},
  {name:'Totem da Primavera', req:450},
  {name:'Totem do Inverno', req:500},
  {name:'Totem do Verão', req:550},
  {name:'Totem de Todas as Estações', req:600}
]));

const CRIADOURO_UPS = makeDoubleUpgradeSeries('criadouro','criadouro', applyStandardCosts('criadouro', [
  {name:'Palha', req:1},
  {name:'Tigela', req:5},
  {name:'Aquecedor', req:25},
  {name:'Mangueira', req:50},
  {name:'Portão', req:100},
  {name:'Chocadeira', req:150},
  {name:'Kit Médico Lunar', req:200},
  {name:'Ração Automatizada', req:250},
  {name:'Cuidador de Animais', req:300},
  {name:'Animais Evoluídos', req:350},
  {name:'Cama Quente', req:400},
  {name:'Árvores Abençoadas', req:450},
  {name:'Água Infinita para Animais', req:500},
  {name:'Comida Mágica que Cura e Fortalece', req:550},
  {name:'Clonador', req:600}
]));

const MINERACAO_UPS = makeDoubleUpgradeSeries('mineracao','mineracao', applyStandardCosts('mineracao', [
  {name:'Picareta de Madeira', req:1},
  {name:'Picareta Antiga', req:5},
  {name:'Carrinho de Carvão', req:25},
  {name:'Luzes de Fio de Cobre', req:50},
  {name:'Marreta e Pá', req:100},
  {name:'Capacete com Lanterna', req:150},
  {name:'Bússola', req:200},
  {name:'Mapa Real', req:250},
  {name:'Broca', req:300},
  {name:'Laser de Perfuração', req:350},
  {name:'Luva que Aguenta Qualquer Temperatura', req:400},
  {name:'Lanterna de Minérios Raros', req:450},
  {name:'Relíquia dos Oceanos Profundos', req:500},
  {name:'Portal do Mundo dos Minérios', req:550},
  {name:'Minerador Automático', req:600}
]));

const GERADOR_UPS = makeDoubleUpgradeSeries('energia','energia', applyStandardCosts('energia', [
  {name:'Pistão', req:1},
  {name:'Engrenagem', req:5},
  {name:'Energia a Carvão', req:25},
  {name:'Fio de Cobre', req:50},
  {name:'Motor Estacionário Antigo', req:100},
  {name:'Energia a Vapor', req:150},
  {name:'Painel Lunar', req:200},
  {name:'Gerador de Energia pela Fé', req:250},
  {name:'Hélice', req:300},
  {name:'Energia Nuclear', req:350},
  {name:'Energia de Calor', req:400},
  {name:'Energia Vital', req:450},
  {name:'Gerador Hídrico', req:500},
  {name:'Energia Arcana', req:550},
  {name:'Buraco Branco', req:600}
]));

const MUSICA_UPS = makeDoubleUpgradeSeries('musica','musica', applyStandardCosts('musica', [
  {name:'Microfone Velho', req:1},
  {name:'Bateria de Pedra', req:5},
  {name:'Caixa de Música', req:25},
  {name:'Megafone', req:50},
  {name:'Mesa de Instrumentos', req:100},
  {name:'Bateria', req:150},
  {name:'Microfone Profissional', req:200},
  {name:'Edição de Áudio', req:250},
  {name:'Visualização de Áudio Futurista', req:300},
  {name:'Som Energético', req:350},
  {name:'Piano Térmico', req:400},
  {name:'Planta Cantora', req:450},
  {name:'Caixa Slowed + Reverb', req:500},
  {name:'Sons Mágicos', req:550},
  {name:'Música Sentida pelos 5 Sentidos', req:600}
]));

// Progressão de custo uniformizada para suavizar os saltos entre os upgrades mais caros.
const NAMORADA_UPS = makeDoubleUpgradeSeries('namorada','namorada', applyStandardCosts('namorada', [
  {name:'Coração Vazio', req:1},
  {name:'Coração de Pedra', req:5},
  {name:'Coração de Carvão', req:25},
  {name:'Coração de Cobre', req:50},
  {name:'Coração de Ferro', req:100},
  {name:'Coração de Bronze', req:150},
  {name:'Coração de Prata', req:200},
  {name:'Coração de Ouro', req:250},
  {name:'Coração de Titânio', req:300},
  {name:'Coração de Urânio', req:350},
  {name:'Coração de Rubi', req:400},
  {name:'Coração de Esmeralda', req:450},
  {name:'Coração de Safira', req:500},
  {name:'Coração de Ametista', req:550},
  {name:'Coração de Diamante', req:600}
]));

const VILA_UPS = makeDoubleUpgradeSeries('vila','vila', applyStandardCosts('vila', [
  {name:'Barraca', req:1},
  {name:'Casa de Pedra', req:5},
  {name:'Chaminé', req:25},
  {name:'Sino do Prefeito', req:50},
  {name:'Portão de Ferro', req:100},
  {name:'Presente Musical', req:150},
  {name:'Lanterna Noturna', req:200},
  {name:'Prefeitura do Bigode', req:250},
  {name:'Rede de Sinais', req:300},
  {name:'Energia Nuclear', req:350},
  {name:'Benção da Vida', req:400},
  {name:'Plantações Enormes', req:450},
  {name:'Exploração Marítima', req:500},
  {name:'Religião e Magia', req:550},
  {name:'Utopia', req:600}
]));

const TROPHY_UPS = [
  {name:'Troféu Antigo', req:13, cost:9_000_000, factor:0.10},
  {name:'Troféu de Pedra', req:25, cost:9_000_000_000, factor:0.13},
  {name:'Troféu de Carvão', req:50, cost:9_000_000_000_000, factor:0.16},
  {name:'Troféu de Cobre', req:75, cost:9_000_000_000_000_000, factor:0.18},
  {name:'Troféu de Ferro', req:100, cost:9_000_000_000_000_000_000, factor:0.20},
  {name:'Troféu de Bronze', req:125, cost:900_000_000_000_000_000_000, factor:0.19},
  {name:'Troféu de Prata', req:150, cost:90_000_000_000_000_000_000_000, factor:0.18},
  {name:'Troféu de Ouro', req:175, cost:9_000_000_000_000_000_000_000_000, factor:0.17},
  {name:'Troféu de Titânio', req:200, cost:900_000_000_000_000_000_000_000_000, factor:0.16},
  {name:'Troféu de Urânio', req:225, cost:90_000_000_000_000_000_000_000_000_000, factor:0.15},
  {name:'Troféu de Rubi', req:250, cost:9_000_000_000_000_000_000_000_000_000_000, factor:0.14},
  {name:'Troféu de Esmeralda', req:275, cost:900_000_000_000_000_000_000_000_000_000_000, factor:0.13},
  {name:'Troféu de Safira', req:300, cost:90_000_000_000_000_000_000_000_000_000_000_000, factor:0.12},
  {name:'Troféu de Ametista', req:325, cost:9_000_000_000_000_000_000_000_000_000_000_000_000, factor:0.11},
  {name:'Troféu de Diamante', req:350, cost:900_000_000_000_000_000_000_000_000_000_000_000_000, factor:0.10}
].map((item, idx)=> ({
  id:`up-trofeu-t${idx+1}`,
  name:item.name,
  tag:TAGS[idx],
  effect:'Multiplica MpS e MpC de acordo com conquistas.',
  cost:item.cost,
  img:upgradeIcon('trofeu', idx+1),
  requirement:{type:'achievements', count:item.req},
  kind:'trophy',
  trophyFactor:item.factor
}));

export const UPGRADE_DATA = [
  ...CLICK_UPGRADES,
  ...DEDO_UPGRADES,
  ...ROUPA_UPS,
  ...AGUA_UPS,
  ...JARDIM_UPS,
  ...CRIADOURO_UPS,
  ...MINERACAO_UPS,
  ...GERADOR_UPS,
  ...MUSICA_UPS,
  ...NAMORADA_UPS,
  ...VILA_UPS,
  ...TROPHY_UPS
];

export const UPGRADE_MAP = UPGRADE_DATA.reduce((acc, up)=>{
  acc[up.id] = up;
  return acc;
}, {});
// Conquistas
// 🏅 Conquistas — serve como checklist para novos objetivos.
const CLICK_ACHIEVEMENTS = [
  {name:'Clicado', amount:1_000},
  {name:'Mouse de aço', amount:100_000},
  {name:'Auto click é errado heimm', amount:10_000_000},
  {name:'Que dedinho bom o seu hihihi', amount:1_000_000_000},
  {name:'Tendinite', amount:100_000_000_000},
  {name:'Clicando the fato', amount:10_000_000_000_000},
  {name:'click click click', amount:1_000_000_000_000_000},
  {name:'Sou o priprio auto click', amount:100_000_000_000_000_000},
  {name:'Cataclicksmo', amount:10_000_000_000_000_000_000},
  {name:'Vou clicleouquecer...', amount:1_000_000_000_000_000_000_000},
  {name:'Ninguém Clica como eu', amount:100_000_000_000_000_000_000_000},
  {name:'Perdi o emprego', amount:10_000_000_000_000_000_000_000_000},
  {name:'Minha profissão virou essa.', amount:1_000_000_000_000_000_000_000_000_000_000},
  {name:'Clique perfeito', amount:100_000_000_000_000_000_000_000_000_000_000},
  {name:'Tem algo que não seja clicar nesse mundo', amount:10_000_000_000_000_000_000_000_000_000_000_000}
].map((item, idx)=>({
  id:`ach-click-${idx+1}`,
  name:item.name,
  description:`Faça ${item.amount.toLocaleString('pt-BR')} Meminhas clicando`,
  requirement:{ type:'handmade', amount:item.amount }
}));

const BUILDING_ACHIEVEMENT_COUNTS = [1,5,25,50,100,150,200,250,300,350,400,450,500,550,600];
const buildingAchievementSet = (buildingId, prefix) => BUILDING_ACHIEVEMENT_COUNTS.map((count, idx)=>{
  const nomePredio = SHOP_LOOKUP[buildingId]?.name ?? buildingId;
  return {
    id:`ach-${buildingId}-${idx+1}`,
    name:`${prefix} ${count}`,
    description:`Tenha ${count} ${nomePredio}${count > 1 ? 's' : ''}`,
    requirement:{ type:'building', building:buildingId, count }
  };
});

export const ACHIEVEMENT_DATA = [
  ...CLICK_ACHIEVEMENTS,
  ...buildingAchievementSet('dedo','Dedos'),
  ...buildingAchievementSet('roupa','Roupas'),
  ...buildingAchievementSet('agua','Águas'),
  ...buildingAchievementSet('jardim','Jardins'),
  ...buildingAchievementSet('criadouro','Criadouros'),
  ...buildingAchievementSet('mineracao','Minerações'),
  ...buildingAchievementSet('energia','Geradores'),
  ...buildingAchievementSet('musica','Estúdios'),
  ...buildingAchievementSet('namorada','Namoradas'),
  ...buildingAchievementSet('vila','Vilas')
];
