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
  {id:'dedo',        name:'Dedo',               base:15,           r:1.15, p:0.10,      limit:100, icon:'docs/assets/images/fundo/Dedo.png'},
  {id:'roupa',       name:'Roupa',              base:100,          r:1.15, p:1.00,      limit:20,  icon:'docs/assets/images/fundo/roupa.png'},
  {id:'agua',        name:'Água',               base:1100,         r:1.15, p:8.00,      limit:20,  icon:'docs/assets/images/fundo/agua.png'},
  {id:'jardim',      name:'Jardim',             base:12000,        r:1.15, p:47.00,     limit:20,  icon:'docs/assets/images/fundo/jardim.png'},
  {id:'criadouro',   name:'Criadouro',          base:130000,       r:1.15, p:260.00,    limit:20,  icon:'docs/assets/images/fundo/criadouro.png'},
  {id:'mineracao',   name:'Mineração',          base:1400000,      r:1.15, p:1400.00,   limit:20,  icon:'docs/assets/images/fundo/mineracao.png'},
  {id:'vila',        name:'Vila',               base:20000000,     r:1.15, p:7800.00,   limit:20,  icon:'docs/assets/images/fundo/vila.png'},
  {id:'energia',     name:'Gerador de Energia', base:330000000,    r:1.15, p:44000.00,  limit:20,  icon:'docs/assets/images/fundo/energia.png'},
  {id:'musica',      name:'Estúdio de musica',  base:5100000000,   r:1.15, p:260000.00, limit:20,  icon:'docs/assets/images/fundo/musica.png'},
  {id:'namorada',    name:'Namorada',           base:75000000000,  r:1.15, p:1600000.0, limit:1,   icon:'docs/assets/images/fundo/namorada.png'}
];

export const SHOP_LOOKUP = SHOP.reduce((acc, item)=>{
  acc[item.id] = item;
  return acc;
}, {});
//UPGRADES
// 🧱 Lista mestre das melhorias. Dividir em blocos por prédio ajuda a manter a manutenção simples.
export const UPGRADE_DATA = [
   {
    id:'up-dedo-t1',
    name:'Mão aprimorada',
    effect:'O click e os dedos são duas vezes tão eficientes.',
    cost:100,
    img:'assets/images/melhorias-futuras/up-dedo-t1.png',
    requirement:{type:'building', building:'dedo', count:1},
    requirementText:'Possuir 1 dedo',
    bonus:[
      {type:'click', mult:2},
      {type:'building', target:'dedo', amount:1.0}
    ]
  },
  {
    id:'up-dedo-t2',
    name:'Mão de Graphite',
    effect:'O click e os dedos são duas vezes tão eficientes.',
    cost:500,
    img:'assets/images/melhorias-futuras/up-dedo-t2.png',
    requirement:{type:'building', building:'dedo', count:1},
    requirementText:'Possuir 1 dedo',
    requires:['up-dedo-t1'],
    bonus:[
      {type:'click', mult:2},
      {type:'building', target:'dedo', amount:1.0}
    ]
  },
  {
    id:'up-dedo-t3',
    name:'Mão de Slate',
    effect:'O click e os dedos são duas vezes tão eficientes.',
    cost:1000,
    img:'assets/images/melhorias-futuras/up-dedo-t3.png',
    requirement:{type:'building', building:'dedo', count:10},
    requirementText:'Possuir 10 dedos',
    requires:['up-dedo-t2'],
    bonus:[
      {type:'click', mult:2},
      {type:'building', target:'dedo', amount:1.0}
    ]
  },
    {
    id:'up-dedo-t4',
    name:'Mão de Ferro',
    effect:'O click e os dedos são duas vezes tão eficientes.',
    cost:10000,
    img:'assets/images/melhorias-futuras/up-dedo-t4.png',
    requirement:{type:'building', building:'dedo', count:25},
    requirementText:'Possuir 10 dedos',
    requires:['up-dedo-t3'],
    bonus:[
      {type:'click', mult:2},
      {type:'building', target:'dedo', amount:1.0}
    ]
  },
      {
    id:'up-dedo-t5',
    name:'Mão de Streak',
    effect:'O click e os dedos são duas vezes tão eficientes.',
    cost:100000,
    img:'assets/images/melhorias-futuras/up-dedo-t5.png',
    requirement:{type:'building', building:'dedo', count:30},
    requirementText:'Possuir 30 dedos',
    requires:['up-dedo-t4'],
    bonus:[
      {type:'click', mult:2},
      {type:'building', target:'dedo', amount:1.0}
    ]
  },
      {
    id:'up-dedo-t6',
    name:'Memarkez',
    effect:'O click e os dedos são duas vezes tão eficientes.',
    cost:1000000,
    img:'assets/images/melhorias-futuras/up-dedo-t6.png',
    requirement:{type:'building', building:'dedo', count:35},
    requirementText:'Possuir 50 dedos',
    requires:['up-dedo-t5'],
    bonus:[
      {type:'click', mult:2},
      {type:'building', target:'dedo', amount:1.0}
    ]
  },
  {
    id:'up-roupa-t1',
    name:'Tênis Impressionante',
    effect:'As roupas são duas vezes tão eficientes.',
    cost:1000,
    img:'assets/images/melhorias-futuras/up-roupa-t1.png',
    requirement:{type:'building', building:'roupa', count:1},
    requirementText:'Possuir 1 Roupa',
    bonus:{type:'building', target:'roupa', amount:1.0}
  },
  {
    id:'up-agua-t1',
    name:'Água Salgada',
    effect:'As águas são duas vezes tão eficientes.',
    cost:11000,
    img:'assets/images/melhorias-futuras/up-agua-t1.png',
    requirement:{type:'building', building:'agua', count:1},
    requirementText:'Possuir 1 Água',
    bonus:{type:'building', target:'agua', amount:1.0}
  },
  {
    id:'up-plantacao-t1',
    name:'Fertilizante',
    effect:'Os fertilizantes são duas vezes tão eficientes.',
    cost:120000,
    img:'assets/images/melhorias-futuras/up-plantacao-t1.png',
  },
  {
    id:'up-alojamento-t1',
    name:'Cerca',
    effect:'Os criadouros são duas vezes tão eficientes.',
    cost:1300000,
    img:'assets/images/melhorias-futuras/up-alojamento-t1.png',
  },
  {
    id:'up-casa-t1',
    name:'Porta',
    effect:'As minerações são duas vezes tão eficientes.',
    cost:14000000,
    img:'assets/images/melhorias-futuras/up-casa-t1.png',
  },
  {
    id:'up-xbox-t1',
    name:'Controle360',
    effect:'As vilas são duas vezes tão eficientes.',
    cost:200000000,
    img:'assets/images/melhorias-futuras/up-xbox-t1.png',
  },
  {
    id:'up-computador-t1',
    name:'Ryzen',
    effect:'Os geradores de Energia são duas vezes tão eficientes.',
    cost:3300000000,
    img:'assets/images/melhorias-futuras/up-computador-t1.png',
  },
  {
    id:'up-microfone-t1',
    name:'Rap de Anime',
    effect:'Os estúdios de musica são duas vezes tão eficientes.',
    cost:51000000000,
    img:'assets/images/melhorias-futuras/up-microfone-t1.png',
  },
  {
    id:'up-cursor-t1',
    name:'Click',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:50_000,
    img:'assets/images/melhorias-futuras/up-cursor-t1.png',
    requirement:{type:'handmade', amount:1_000},
    requirementText:'1.000 Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t2',
    name:'Click de Pedra',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:5_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t2.png',
    requirement:{type:'handmade', amount:100_000},
    requirementText:'100.000 Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t3',
    name:'Click de Carvão',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:500_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t3.png',
    requirement:{type:'handmade', amount:10_000_000},
    requirementText:'10 milhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t4',
    name:'Click de Cobre',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:50_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t4.png',
    requirement:{type:'handmade', amount:1_000_000_000},
    requirementText:'1 bilhão de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t5',
    name:'Click de Ferro',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:5_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t5.png',
    requirement:{type:'handmade', amount:100_000_000_000},
    requirementText:'100 bilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t6',
    name:'Click de Estanho',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:500_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t6.png',
    requirement:{type:'handmade', amount:10_000_000_000_000},
    requirementText:'10 trilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t7',
    name:'Click de Bronze',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:50_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t7.png',
    requirement:{type:'handmade', amount:1_000_000_000_000_000},
    requirementText:'1 quatrilhão de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t8',
    name:'Click de Prata',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:5_000_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t8.png',
    requirement:{type:'handmade', amount:100_000_000_000_000_000},
    requirementText:'100 quatrilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t9',
    name:'Click de Ouro',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:500_000_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t9.png',
    requirement:{type:'handmade', amount:10_000_000_000_000_000_000},
    requirementText:'10 quintilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t10',
    name:'Click de Platina',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:50_000_000_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t10.png',
    requirement:{type:'handmade', amount:1_000_000_000_000_000_000_000},
    requirementText:'1 sextilhão de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t11',
    name:'Click de Titânio',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:5_000_000_000_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t11.png',
    requirement:{type:'handmade', amount:100_000_000_000_000_000_000_000},
    requirementText:'100 sextilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t12',
    name:'Click de Urânio',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:500_000_000_000_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t12.png',
    requirement:{type:'handmade', amount:10_000_000_000_000_000_000_000_000},
    requirementText:'10 septilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t13',
    name:'Click de Rubi',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:50_000_000_000_000_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t13.png',
    requirement:{type:'handmade', amount:1_000_000_000_000_000_000_000_000_000},
    requirementText:'1 octilhão de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t14',
    name:'Click de Esmeralda',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:5_000_000_000_000_000_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t14.png',
    requirement:{type:'handmade', amount:100_000_000_000_000_000_000_000_000_000},
    requirementText:'100 octilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t15',
    name:'Click de Diamante',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:500_000_000_000_000_000_000_000_000_000_000,
    img:'assets/images/melhorias-futuras/up-cursor-t15.png',
    requirement:{type:'handmade', amount:10_000_000_000_000_000_000_000_000_000_000},
    requirementText:'10 nonilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  }
];

export const UPGRADE_MAP = UPGRADE_DATA.reduce((acc, up)=>{
  acc[up.id] = up;
  return acc;
}, {});
// Conquistas
// 🏅 Conquistas — serve como checklist para novos objetivos.
export const ACHIEVEMENT_DATA = [
  { id:'ach-polidactilia', name:'Polidactilia', description:'Tenha 50 Dedos', requirement:{ type:'building', building:'dedo', count:50 } },
  { id:'ach-calcinha', name:'Calcinha', description:'Tenha 20 Dedos', requirement:{ type:'building', building:'dedo', count:20 } },
  { id:'ach-h20', name:'H20', description:'Tenha 20 Águas', requirement:{ type:'building', building:'agua', count:20 } },
  { id:'ach-me-perdoe', name:'Me perdoe pelos meus atos.', description:'Tenha 1 Namorada', requirement:{ type:'building', building:'namorada', count:1 } },
  { id:'ach-pegador', name:'Pegador', description:'Adquira 5 upgrades', requirement:{ type:'upgrade-count', count:5 } },
  { id:'ach-eu-sou', name:'eu sou melhor que todos vocês', description:'Adquira 10 upgrades', requirement:{ type:'upgrade-count', count:10 } },
  { id:'ach-exame', name:'exame de próstata', description:'Clique 100 vezes no Mema', requirement:{ type:'clicks', count:100 } }
];
