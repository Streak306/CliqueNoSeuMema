// 🎁 Tabela de códigos resgatáveis — mantém os presentes organizados em um único lugar.
export const CODE_REWARDS = {
  entreak: 1_000_000_000_000_000
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
  {id:'musica',      name:'Estúdio de musica',  base:5100000000,   r:1.15, p:260000.00, limit:9999, icon:'docs/assets/images/fundo/musica.png'},
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
  {name:'Click', unlock:1_000, cost:50_000},
  {name:'Click de pedra', unlock:100_000, cost:5_000_000},
  {name:'Click de Carvão', unlock:10_000_000, cost:500_000_000},
  {name:'Click de Cobre', unlock:1_000_000_000, cost:50_000_000_000},
  {name:'Click de Ferro', unlock:100_000_000_000, cost:5_000_000_000_000},
  {name:'Click de Bronze', unlock:10_000_000_000_000, cost:500_000_000_000_000},
  {name:'Click de Prata', unlock:1_000_000_000_000_000, cost:50_000_000_000_000_000},
  {name:'Click de Ouro', unlock:100_000_000_000_000_000, cost:5_000_000_000_000_000_000},
  {name:'Click de Titânio', unlock:10_000_000_000_000_000_000, cost:500_000_000_000_000_000_000},
  {name:'Click de Urânio', unlock:1_000_000_000_000_000_000_000, cost:50_000_000_000_000_000_000_000},
  {name:'Click de Rubi', unlock:100_000_000_000_000_000_000_000, cost:5_000_000_000_000_000_000_000_000},
  {name:'Click de Esmeralda', unlock:10_000_000_000_000_000_000_000_000, cost:500_000_000_000_000_000_000_000_000},
  {name:'Click de Safira', unlock:1_000_000_000_000_000_000_000_000_000, cost:50_000_000_000_000_000_000_000_000_000},
  {name:'Click de Ametista', unlock:100_000_000_000_000_000_000_000_000_000, cost:5_000_000_000_000_000_000_000_000_000_000},
  {name:'Click de Diamante', unlock:10_000_000_000_000_000_000_000_000_000_000, cost:500_000_000_000_000_000_000_000_000_000_000}
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
  {name:'Dedo de pedra', req:1, cost:500, effect:'k'},
  {name:'Dedo de Carvão', req:10, cost:10_000, effect:'k'},
  {name:'Dedo de Cobre', req:25, cost:100_000, effect:'activate', mult:1},
  {name:'Dedo de Ferro', req:50, cost:10_000_000, effect:'bonus', mult:5},
  {name:'Dedo de Bronze', req:100, cost:100_000_000, effect:'bonus', mult:10},
  {name:'Dedo de Prata', req:150, cost:1_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Ouro', req:200, cost:10_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Titânio', req:250, cost:10_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Urânio', req:300, cost:10_000_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Rubi', req:350, cost:10_000_000_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Esmeralda', req:400, cost:10_000_000_000_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Safira', req:450, cost:10_000_000_000_000_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Ametista', req:500, cost:10_000_000_000_000_000_000_000_000_000, effect:'bonus', mult:20},
  {name:'Dedo de Diamante', req:550, cost:10_000_000_000_000_000_000_000_000_000_000, effect:'bonus', mult:20}
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

const ROUPA_UPS = makeDoubleUpgradeSeries('roupa','roupa', [
  {name:'Cabide', req:1, cost:1_000},
  {name:'Capacete', req:5, cost:5_000},
  {name:'Broche', req:25, cost:50_000},
  {name:'Colar', req:50, cost:5_000_000},
  {name:'Pulseira', req:100, cost:500_000_000},
  {name:'Medalha de primeiro lugar', req:150, cost:50_000_000_000},
  {name:'Piercing de lua', req:200, cost:50_000_000_000_000},
  {name:'Coroa', req:250, cost:50_000_000_000_000_000},
  {name:'Peitoral', req:300, cost:50_000_000_000_000_000_000},
  {name:'Mascara de radiação', req:350, cost:50_000_000_000_000_000_000_000},
  {name:'Brinco de Rubi', req:400, cost:500_000_000_000_000_000_000_000_000},
  {name:'Colar de Esmeralda', req:450, cost:5_000_000_000_000_000_000_000_000_000},
  {name:'Brinco de Safira', req:500, cost:50_000_000_000_000_000_000_000_000_000_000},
  {name:'Revestimento magico de coração', req:550, cost:500_000_000_000_000_000_000_000_000_000_000_000},
  {name:'Anel de casamento', req:600, cost:5_000_000_000_000_000_000_000_000_000_000_000_000_000}
]);

const AGUA_UPS = makeDoubleUpgradeSeries('agua','agua', [
  {name:'Garrafa da agua', req:1, cost:11_000},
  {name:'Agua de rios e pedras', req:5, cost:55_000},
  {name:'Caldeirão de purificar agua', req:25, cost:550_000},
  {name:'Encanamento de Cobre', req:50, cost:55_000_000},
  {name:"caixa d'agua", req:100, cost:5_500_000_000},
  {name:'pote de Bronzze', req:150, cost:550_000_000_000},
  {name:'Lagrima lunar', req:200, cost:550_000_000_000_000},
  {name:'Agua real', req:250, cost:550_000_000_000_000_000},
  {name:'Energia movida a agua', req:300, cost:550_000_000_000_000_000_000},
  {name:'Agua radioativa', req:350, cost:550_000_000_000_000_000_000_000},
  {name:'Agua de sangue humano', req:400, cost:5_500_000_000_000_000_000_000_000_000},
  {name:'Agua tirada da vida das plantas', req:450, cost:55_000_000_000_000_000_000_000_000_000_000},
  {name:'Bolhas de Agua', req:500, cost:550_000_000_000_000_000_000_000_000_000_000_000},
  {name:'Slime de agua magico', req:550, cost:5_500_000_000_000_000_000_000_000_000_000_000_000},
  {name:'Tranformador de Luz em Agua', req:600, cost:55_000_000_000_000_000_000_000_000_000_000_000_000_000}
]);

const JARDIM_UPS = makeDoubleUpgradeSeries('Jardim','jardim', [
  {name:'Fertilizante', req:1, cost:120_000},
  {name:'Arador de Pedra', req:5, cost:600_000},
  {name:'Churrasco', req:25, cost:6_000_000},
  {name:'Aspersor de cobre', req:50, cost:600_000_000},
  {name:'Foice', req:100, cost:60_000_000_000},
  {name:'Sino', req:150, cost:6_000_000_000_000},
  {name:'Lâmpada de energia lunar', req:200, cost:6_000_000_000_000_000},
  {name:'Espantalho real do rei bigode', req:250, cost:6_000_000_000_000_000_000},
  {name:'Drone irrigador e coletador', req:300, cost:6_000_000_000_000_000_000_000},
  {name:'Fertilizante duvidoso', req:350, cost:6_000_000_000_000_000_000_000_000},
  {name:'Totem de Outono', req:400, cost:60_000_000_000_000_000_000_000_000_000},
  {name:'Totem da Primavera', req:450, cost:600_000_000_000_000_000_000_000_000_000_000},
  {name:'Totem do Inverno', req:500, cost:6_000_000_000_000_000_000_000_000_000_000_000},
  {name:'Totem do Verão', req:550, cost:60_000_000_000_000_000_000_000_000_000_000_000_000},
  {name:'Totem de todas as estações', req:600, cost:600_000_000_000_000_000_000_000_000_000_000_000_000_000}
]);

const CRIADOURO_UPS = makeDoubleUpgradeSeries('criadouro','criadouro', [
  {name:'Palha', req:1, cost:1_300_000},
  {name:'Tijela', req:5, cost:6_500_000},
  {name:'Aquecedor', req:25, cost:65_000_000},
  {name:'mangueira', req:50, cost:6_500_000_000},
  {name:'Portão', req:100, cost:650_000_000_000},
  {name:'Chocadeira', req:150, cost:65_000_000_000_000},
  {name:'kit medico lunar', req:200, cost:65_000_000_000_000_000},
  {name:'ração automatizada', req:250, cost:6_500_000_000_000_000_000},
  {name:'Cuidador de animais', req:300, cost:65_000_000_000_000_000_000_000},
  {name:'Animais evoluidos', req:350, cost:65_000_000_000_000_000_000_000_000},
  {name:'Cama quente', req:400, cost:65_000_000_000_000_000_000_000_000_000},
  {name:'Arvores abençoadas', req:450, cost:650_000_000_000_000_000_000_000_000_000_000},
  {name:'Água infinita para animais', req:500, cost:65_000_000_000_000_000_000_000_000_000_000_000},
  {name:'Comida magica que cura e fortalece', req:550, cost:650_000_000_000_000_000_000_000_000_000_000_000_000},
  {name:'Clonador', req:600, cost:65_000_000_000_000_000_000_000_000_000_000_000_000_000_000}
]);

const MINERACAO_UPS = makeDoubleUpgradeSeries('mineracao','mineracao', [
  {name:'Picareta de madeira', req:1, cost:14_000_000},
  {name:'Picareta antiga', req:5, cost:70_000_000},
  {name:'Carrinho de carvão', req:25, cost:700_000_000},
  {name:'Luzes de fio de cobre', req:50, cost:70_000_000_000},
  {name:'Marreta e pá', req:100, cost:7_000_000_000_000},
  {name:'Capacete com lanterna', req:150, cost:700_000_000_000_000},
  {name:'Bússola', req:200, cost:70_000_000_000_000_000},
  {name:'Mapa real', req:250, cost:7_000_000_000_000_000_000},
  {name:'Broca', req:300, cost:700_000_000_000_000_000_000},
  {name:'Laser de perfuração', req:350, cost:70_000_000_000_000_000_000_000},
  {name:'Luva que aguenta qualquer temperatura', req:400, cost:7_000_000_000_000_000_000_000_000},
  {name:'Lanterna de minérios raros', req:450, cost:700_000_000_000_000_000_000_000_000},
  {name:'Relíquia dos oceanos profundos', req:500, cost:70_000_000_000_000_000_000_000_000_000},
  {name:'Portal do mundo dos minérios', req:550, cost:7_000_000_000_000_000_000_000_000_000_000},
  {name:'Minerador automático', req:600, cost:700_000_000_000_000_000_000_000_000_000}
]);

const GERADOR_UPS = makeDoubleUpgradeSeries('energia','energia', [
  {name:'Pistão', req:1, cost:3_300_000_000},
  {name:'Engrenagem', req:5, cost:16_500_000_000},
  {name:'Energia a carvão', req:25, cost:165_000_000_000},
  {name:'Fio de Cobre', req:50, cost:1_650_000_000_000},
  {name:'Motor estacionário antigo', req:100, cost:165_000_000_000_000},
  {name:'Energia a vapor', req:150, cost:165_000_000_000_000_000},
  {name:'Painel Lunar', req:200, cost:16_500_000_000_000_000_000},
  {name:'Gerador de energia a partir da fé', req:250, cost:1_650_000_000_000_000_000_000},
  {name:'Hélice', req:300, cost:165_000_000_000_000_000_000_000},
  {name:'Energia nuclear', req:350, cost:16_500_000_000_000_000_000_000_00},
  {name:'Energia do calor', req:400, cost:1_650_000_000_000_000_000_000_000_000},
  {name:'Energia vital', req:450, cost:165_000_000_000_000_000_000_000_000_000},
  {name:'Gerador hídrico', req:500, cost:16_500_000_000_000_000_000_000_000_000_00},
  {name:'Energia arcana', req:550, cost:1_650_000_000_000_000_000_000_000_000_000_000},
  {name:'Buraco Branco', req:600, cost:165_000_000_000_000_000_000_000_000_000_000_00}
]);

const MUSICA_UPS = makeDoubleUpgradeSeries('musica','musica', [
  {name:'Microfone velho', req:1, cost:51_000_000_000},
  {name:'Bateria de pedra', req:5, cost:255_000_000_000},
  {name:'Caixa de música suja', req:25, cost:2_550_000_000_000},
  {name:'Megafone', req:50, cost:255_000_000_000_000},
  {name:'Mesa de instrumentos', req:100, cost:25_500_000_000_000_000},
  {name:'Bateria', req:150, cost:2_550_000_000_000_000_000},
  {name:'Microfone profissional', req:200, cost:255_000_000_000_000_000_000},
  {name:'Edição de áudio', req:250, cost:25_500_000_000_000_000_000_00},
  {name:'Visualização de áudio futurista', req:300, cost:2_550_000_000_000_000_000_000_000},
  {name:'Som energético', req:350, cost:255_000_000_000_000_000_000_000_000},
  {name:'Piano térmico', req:400, cost:25_500_000_000_000_000_000_000_000_00},
  {name:'Planta cantora', req:450, cost:2_550_000_000_000_000_000_000_000_000_0},
  {name:'Caixa de Slowed + Reverb', req:500, cost:255_000_000_000_000_000_000_000_000_000_000},
  {name:'Sons mágicos', req:550, cost:25_500_000_000_000_000_000_000_000_000_000_00},
  {name:'A música pode ser sentida pelos 5 sentidos', req:600, cost:2_550_000_000_000_000_000_000_000_000_000_000_000}
]);

const NAMORADA_UPS = makeDoubleUpgradeSeries('namorada','namorada', [
  {name:'Coração Vazio', req:1, cost:750_000_000_000},
  {name:'Coração de Pedra', req:5, cost:3_750_000_000_000},
  {name:'Coração de Carvão', req:25, cost:37_500_000_000_000},
  {name:'Coração de Cobre', req:50, cost:3_750_000_000_000_000},
  {name:'Coração de Ferro', req:100, cost:375_000_000_000_000_000},
  {name:'Coração de Bronze', req:150, cost:37_500_000_000_000_000_00},
  {name:'Coração de Prata', req:200, cost:3_750_000_000_000_000_000_000},
  {name:'Coração de Ouro', req:250, cost:375_000_000_000_000_000_000_000},
  {name:'Coração de Titânio', req:300, cost:37_500_000_000_000_000_000_000_00},
  {name:'Coração de Urânio', req:350, cost:3_750_000_000_000_000_000_000_000_000},
  {name:'Coração de Rubi', req:400, cost:375_000_000_000_000_000_000_000_000_00},
  {name:'Coração de Esmeralda', req:450, cost:37_500_000_000_000_000_000_000_000_000_00},
  {name:'Coração de Safira', req:500, cost:3_750_000_000_000_000_000_000_000_000_000_0},
  {name:'Coração de Ametista', req:550, cost:375_000_000_000_000_000_000_000_000_000_000_0},
  {name:'Coração de Diamante', req:600, cost:37_500_000_000_000_000_000_000_000_000_000_00}
]);

const VILA_UPS = makeDoubleUpgradeSeries('vila','vila', [
  {name:'Barraca', req:1, cost:200_000_000},
  {name:'Casa de pedra', req:5, cost:1_000_000_000},
  {name:'Chaminé', req:25, cost:10_000_000_000},
  {name:'Sino do prefeito', req:50, cost:100_000_000_000},
  {name:'Portão de Ferro', req:100, cost:10_000_000_000_000},
  {name:'Presente músical', req:150, cost:1_000_000_000_000_000},
  {name:'Lanterna para noite', req:200, cost:100_000_000_000_000_000},
  {name:'Prefeitura do bigode', req:250, cost:10_000_000_000_000_000_000},
  {name:'Rede de sinais', req:300, cost:1_000_000_000_000_000_000_000},
  {name:'Energia nuclear', req:350, cost:100_000_000_000_000_000_000_00},
  {name:'Benção da vida', req:400, cost:10_000_000_000_000_000_000_000_000},
  {name:'Plantações enormes', req:450, cost:1_000_000_000_000_000_000_000_000_000},
  {name:'Exploração marítima', req:500, cost:100_000_000_000_000_000_000_000_000_000},
  {name:'Religião e magia', req:550, cost:10_000_000_000_000_000_000_000_000_000_00},
  {name:'Utopia', req:600, cost:1_000_000_000_000_000_000_000_000_000_000_000}
]);

const TROPHY_UPS = [
  {name:'Troféu antigo', req:13, cost:9_000_000, factor:0.10},
  {name:'Troféu de Pedra', req:25, cost:9_000_000_000, factor:0.125},
  {name:'Troféu de Carvão', req:50, cost:90_000_000_000_000, factor:0.15},
  {name:'Troféu de Cobre', req:75, cost:90_000_000_000_000_000, factor:0.175},
  {name:'Troféu de Ferro', req:100, cost:900_000_000_000_000_000_000, factor:0.20},
  {name:'Troféu de Bronze', req:125, cost:900_000_000_000_000_000_000_000, factor:0.20},
  {name:'Troféu de Prata', req:150, cost:900_000_000_000_000_000_000_000_000, factor:0.20},
  {name:'Troféu de Ouro', req:175, cost:900_000_000_000_000_000_000_000_000_000, factor:0.20},
  {name:'Troféu de Titânio', req:200, cost:900_000_000_000_000_000_000_000_000_000_000, factor:0.20},
  {name:'Troféu de Urânio', req:225, cost:900_000_000_000_000_000_000_000_000_000_000_000, factor:0.175},
  {name:'Troféu de Rubi', req:250, cost:900_000_000_000_000_000_000_000_000_000_000_000_000, factor:0.15},
  {name:'Troféu de Esmeralda', req:275, cost:900_000_000_000_000_000_000_000_000_000_000_000_000_000, factor:0.125},
  {name:'Troféu de Safira', req:300, cost:900_000_000_000_000_000_000_000_000_000_000_000_000_000_000, factor:0.115},
  {name:'Troféu de Ametista', req:325, cost:900_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000, factor:0.11},
  {name:'Troféu de Diamante', req:350, cost:900_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000, factor:0.105}
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
