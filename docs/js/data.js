export const CODE_REWARDS = {
  entreak: 1_000_000_000_000_000
};

export const IMG_BACK  = 'imagens/variacoes-mema/mema_back.png';
export const IMG_FRONT = 'imagens/variacoes-mema/mema_front.png';
export const IMG_RESET = 'imagens/variacoes-mema/mema_reset.png';
export const FRONT_TIME_MS = 400;

export const GLITCH_DIGIT_TARGETS = [
  'pts','pc','mps','statBanco','statTempo','statConstr','statMps','statClique','statCliques'
];

export const SHOP = [
  {id:'dedo',        name:'Dedo',        base:15,           r:1.15, p:0.10,      limit:50},
  {id:'roupa',       name:'Roupa',       base:100,          r:1.15, p:1.00,      limit:20},
  {id:'agua',        name:'Água',        base:1100,         r:1.15, p:8.00,      limit:20},
  {id:'plantacao',   name:'Plantação',   base:12000,        r:1.15, p:47.0,      limit:12},
  {id:'alojamento',  name:'Alojamento',  base:130000,       r:1.15, p:260.0,     limit:8},
  {id:'casa',        name:'Casa',        base:1400000,      r:1.15, p:1400.0,    limit:5},
  {id:'xbox',        name:'Xbox',        base:20000000,     r:1.15, p:7800.0,    limit:3},
  {id:'computador',  name:'Computador',  base:330000000,    r:1.15, p:44000.0,   limit:3},
  {id:'microfone',   name:'Microfone',   base:5100000000,   r:1.15, p:260000.0,  limit:2},
  {id:'namorada',    name:'Namorada',    base:75000000000,  r:1.15, p:1600000.0, limit:1}
];

export const SHOP_LOOKUP = SHOP.reduce((acc, item)=>{
  acc[item.id] = item;
  return acc;
}, {});
//UPGRADES
export const UPGRADE_DATA = [
  {
    id:'up-dedo-t1',
    name:'Mão aprimorada',
    effect:'O click e os dedos são duas vezes tão eficientes.',
    cost:100,
    img:'imagens/melhorias-futuras/up-dedo-t1.png',
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
    img:'imagens/melhorias-futuras/up-dedo-t2.png',
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
    cost:10000,
    img:'imagens/melhorias-futuras/up-dedo-t3.png',
    requirement:{type:'building', building:'dedo', count:10},
    requirementText:'Possuir 10 dedos',
    requires:['up-dedo-t2'],
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
    img:'imagens/melhorias-futuras/up-roupa-t1.png',
    requirement:{type:'building', building:'roupa', count:1},
    requirementText:'Possuir 1 Roupa',
    bonus:{type:'building', target:'roupa', amount:1.0}
  },
  {
    id:'up-agua-t1',
    name:'Água Salgada',
    effect:'As águas são duas vezes tão eficientes.',
    cost:11000,
    img:'imagens/melhorias-futuras/up-agua-t1.png',
    requirement:{type:'building', building:'agua', count:1},
    requirementText:'Possuir 1 Água',
    bonus:{type:'building', target:'agua', amount:1.0}
  },
  {
    id:'up-plantacao-t1',
    name:'Fertilizante',
    effect:'Os fertilizantes são duas vezes tão eficientes.',
    cost:120000,
    img:'imagens/melhorias-futuras/up-plantacao-t1.png',
    requirement:{type:'building', building:'plantacao', count:1},
    requirementText:'Possuir 1 plantacao',
    bonus:{type:'building', target:'plantacao', amount:1.0}
  },
  {
    id:'up-alojamento-t1',
    name:'Cerca',
    effect:'Os alojamentos são duas vezes tão eficientes.',
    cost:1300000,
    img:'imagens/melhorias-futuras/up-alojamento-t1.png',
    requirement:{type:'building', building:'alojamento', count:1},
    requirementText:'Possuir 1 alojamento',
    bonus:{type:'building', target:'alojamento', amount:1.0}
  },
  {
    id:'up-casa-t1',
    name:'Porta',
    effect:'As casas são duas vezes tão eficientes.',
    cost:14000000,
    img:'imagens/melhorias-futuras/up-casa-t1.png',
    requirement:{type:'building', building:'casa', count:1},
    requirementText:'Possuir 1 Banco',
    bonus:{type:'building', target:'casa', amount:1.0}
  },
  {
    id:'up-xbox-t1',
    name:'Controle360',
    effect:'Os xbox são duas vezes tão eficientes.',
    cost:200000000,
    img:'imagens/melhorias-futuras/up-xbox-t1.png',
    requirement:{type:'building', building:'xbox', count:1},
    requirementText:'Possuir 1 Xbox',
    bonus:{type:'building', target:'xbox', amount:1.0}
  },
  {
    id:'up-computador-t1',
    name:'Ryzen',
    effect:'Os computadores são duas vezes tão eficientes.',
    cost:3300000000,
    img:'imagens/melhorias-futuras/up-computador-t1.png',
    requirement:{type:'building', building:'computador', count:1},
    requirementText:'Possuir 1 Computador',
    bonus:{type:'building', target:'computador', amount:1.0}
  },
  {
    id:'up-microfone-t1',
    name:'Rap de Anime',
    effect:'Os microfones são duas vezes tão eficientes.',
    cost:51000000000,
    img:'imagens/melhorias-futuras/up-microfone-t1.png',
    requirement:{type:'building', building:'microfone', count:1},
    requirementText:'Possuir 1 Microfone',
    bonus:{type:'building', target:'microfone', amount:1.0}
  },
  {
    id:'up-cursor-t1',
    name:'Click',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:50000,
    img:'imagens/melhorias-futuras/up-cursor-t1.png',
    requirement:{type:'handmade', amount:1000},
    requirementText:'1000 Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t2',
    name:'Click de Graphite',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:5000000,
    img:'imagens/melhorias-futuras/up-cursor-t2.png',
    requirement:{type:'handmade', amount:100000},
    requirementText:'100000 Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t3',
    name:'Click de Ardósia',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:500000000,
    img:'imagens/melhorias-futuras/up-cursor-t3.png',
    requirement:{type:'handmade', amount:10000000},
    requirementText:'10 milhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t4',
    name:'Click de Ferro',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:50000000000,
    img:'imagens/melhorias-futuras/up-cursor-t4.png',
    requirement:{type:'handmade', amount:1000000000},
    requirementText:'1 Bilhão de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t5',
    name:'Click de Metal',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:5000000000000,
    img:'imagens/melhorias-futuras/up-cursor-t5.png',
    requirement:{type:'handmade', amount:100000000000},
    requirementText:'100 Bilhões de Meminhas feitos com click',
    bonus:{type:'click', pctOfMps:0.01}
  },
  {
    id:'up-cursor-t6',
    name:'Click de Bronze',
    effect:'Clicando em ganhos +1% do seu MpS.',
    cost:500000000000000,
    img:'imagens/melhorias-futuras/up-cursor-t6.png',
    requirement:{type:'handmade', amount:10000000000000},
    requirementText:'10 Trilhões de Meminhas feitos com Click',
    bonus:{type:'click', pctOfMps:0.01}
  }
];

export const UPGRADE_MAP = UPGRADE_DATA.reduce((acc, up)=>{
  acc[up.id] = up;
  return acc;
}, {});
// Conquistas
export const ACHIEVEMENT_DATA = [
  { id:'ach-polidactilia', name:'Polidactilia', description:'Tenha 50 Dedos', requirement:{ type:'building', building:'dedo', count:50 } },
  { id:'ach-calcinha', name:'Calcinha', description:'Tenha 20 Dedos', requirement:{ type:'building', building:'dedo', count:20 } },
  { id:'ach-h20', name:'H20', description:'Tenha 20 Águas', requirement:{ type:'building', building:'agua', count:20 } },
  { id:'ach-stardew', name:'Stardew Valley', description:'Tenha 12 Plantações', requirement:{ type:'building', building:'plantacao', count:12 } },
  { id:'ach-estabulo', name:'Estábulo', description:'Tenha 8 Plantações', requirement:{ type:'building', building:'plantacao', count:8 } },
  { id:'ach-aluguel', name:'Aluguel', description:'Tenha 5 Casas', requirement:{ type:'building', building:'casa', count:5 } },
  { id:'ach-xbox', name:'Xbox One', description:'Tenha 3 Xbox', requirement:{ type:'building', building:'xbox', count:3 } },
  { id:'ach-garoto-programas', name:'Garoto dos programas', description:'Tenha 3 Computadores', requirement:{ type:'building', building:'computador', count:3 } },
  { id:'ach-cantor', name:'Cantor', description:'Tenha 2 Microfones', requirement:{ type:'building', building:'microfone', count:2 } },
  { id:'ach-me-perdoe', name:'Me perdoe pelos meus atos.', description:'Tenha 1 Namorada', requirement:{ type:'building', building:'namorada', count:1 } },
  { id:'ach-pegador', name:'Pegador', description:'Adquira 5 upgrades', requirement:{ type:'upgrade-count', count:5 } },
  { id:'ach-eu-sou', name:'eu sou melhor que todos vocês', description:'Adquira 10 upgrades', requirement:{ type:'upgrade-count', count:10 } },
  { id:'ach-exame', name:'exame de próstata', description:'Clique 100 vezes no Mema', requirement:{ type:'clicks', count:100 } }
];
