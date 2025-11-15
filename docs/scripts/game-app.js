import {
  CODE_REWARDS,
  IMG_BACK,
  IMG_FRONT,
  IMG_RESET,
  NUMBER_SCALES,
  NUMBER_FORMAT_IDS,
  DEFAULT_NUMBER_FORMAT,
  FRONT_TIME_MS,
  GLITCH_DIGIT_TARGETS,
  SHOP,
  SHOP_LOOKUP,
  UPGRADE_DATA,
  UPGRADE_MAP,
  ACHIEVEMENT_DATA
} from './data/game-data.js';

/* ===== Estado do jogo ===== */
let bancoDeMemas = 0;
let memasPorCliqueBase = 1;
let memasPorCliqueEfetivo = 1;
let memasPorSegundoBase = 0;
let memasPorSegundoEfetivo = 0;
let playTimeSeconds = 0;
let totalClicks = 0;
let handmadeMemes = 0;
let multiplicadorGlobalMPS = 1;
let multiplicadorGlobalCliques = 1;
let multiplicadorDescontoGlobal = 1;
let multiplicadorCustoNamorada = 1;
let modoCliqueCaotico = false;
const listaBuffsAtivos = [];
let tempoAteProximoMemaBuff = 0;
let tempoAteProximoMemaDeBuff = 0;
let memaBuffAtual = null;
let memaDeBuffAtual = null;
let upgradesState = null;
let achievementsState = null;
let migratedLegacyUpgrades = false;
let selectedCollectionUpgradeId = null;
let redeemedCodes = new Set();
let collapseState = makeInitialCollapseState();
let numberFormatMode = DEFAULT_NUMBER_FORMAT;

const wrapEl = document.querySelector('.wrap');
const stageEl = document.querySelector('.stage');
const clickImageEl = document.getElementById('click');
const redeemCodeButtonEl = document.getElementById('redeemCode');
const deleteSaveButtonEl = document.getElementById('deleteSave');
const numberFormatButtons = Array.from(document.querySelectorAll('.number-format-option'));
const collapseOverlayEl = document.getElementById('collapseOverlay');
const collapseBlueListEl = document.getElementById('collapseBlueMessages');
const collapseLogLinesEl = document.getElementById('collapseLogLines');

const collapseScene = {
  active:false,
  timers:new Set(),
  logIndex:0
};

let faceTimer = null;
let collapseImageMode = false;

const INTERVALO_MEMA_BUFF = {min:60, max:300};
const INTERVALO_MEMA_DEBUFF = {min:90, max:300};
const DURACAO_ICONE_EVENTO = 13;
const MEMA_BUFF_ICON = 'assets/images/variacoes-mema/MemaBuff.png';
const MEMA_DEBUFF_ICON = 'assets/images/variacoes-mema/MemaDeBuff.png';
const MEMA_EVENT_ICON_SIZE = 96;

/* Helpers */
const el=(id)=>document.getElementById(id);

function gerarNumeroAleatorio(min, max){
  const a = Number(min);
  const b = Number(max);
  if(!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  return Math.random() * (high - low) + low;
}

function escolherPorPeso(lista){
  if(!Array.isArray(lista) || !lista.length) return null;
  const total = lista.reduce((acc, item)=> acc + Math.max(0, Number(item?.weight ?? 0)), 0);
  if(total <= 0) return lista[lista.length - 1];
  let sorteio = Math.random() * total;
  for(const item of lista){
    sorteio -= Math.max(0, Number(item?.weight ?? 0));
    if(sorteio <= 0) return item;
  }
  return lista[lista.length - 1];
}

function atualizarValoresEfetivos(){
  memasPorSegundoEfetivo = memasPorSegundoBase * multiplicadorGlobalMPS;
  const baseCliques = Math.max(0, memasPorCliqueBase);
  memasPorCliqueEfetivo = Math.max(1, baseCliques * multiplicadorGlobalCliques);
}

function recalcularMultiplicadoresGlobais(){
  multiplicadorGlobalMPS = 1;
  multiplicadorGlobalCliques = 1;
  multiplicadorDescontoGlobal = 1;
  multiplicadorCustoNamorada = 1;
  modoCliqueCaotico = false;
  listaBuffsAtivos.forEach(buff=>{
    const mods = buff?.modificadores ?? {};
    if(typeof mods.mps === 'number') multiplicadorGlobalMPS *= mods.mps;
    if(typeof mods.cliques === 'number') multiplicadorGlobalCliques *= mods.cliques;
    if(typeof mods.desconto === 'number') multiplicadorDescontoGlobal *= mods.desconto;
    if(typeof mods.custoNamorada === 'number') multiplicadorCustoNamorada *= mods.custoNamorada;
    if(mods.cliqueCaotico) modoCliqueCaotico = true;
  });
  atualizarValoresEfetivos();
}

function atualizarBuffs(delta){
  if(!listaBuffsAtivos.length) return;
  let changed = false;
  for(let i = listaBuffsAtivos.length - 1; i >= 0; i--){
    const buff = listaBuffsAtivos[i];
    buff.duracaoRestante -= delta;
    if(buff.duracaoRestante <= 0){
      listaBuffsAtivos.splice(i, 1);
      changed = true;
    }
  }
  if(changed){
    recalcularMultiplicadoresGlobais();
    renderShop();
    renderUpgrades();
    updateAffordability();
    renderHUD();
    save();
  }
}

const MEMA_BUFF_EFFECTS = [
  {
    id:'producao-insana',
    weight:40,
    duration:77,
    modificadores:{ mps:7 }
  },
  {
    id:'cliques-freneticos',
    weight:30,
    getDuration:()=> gerarNumeroAleatorio(10, 20),
    modificadores:{ cliques:100 }
  },
  {
    id:'bolada-instantanea',
    weight:20,
    instantaneo:true,
    aplicar:()=>{
      const mpsEfetivo = memasPorSegundoBase * multiplicadorGlobalMPS;
      const ganhoBase = mpsEfetivo * 60 * 10;
      const limitePorBanco = bancoDeMemas * 0.15;
      const recompensa = Math.min(ganhoBase, limitePorBanco);
      if(recompensa > 0){
        bancoDeMemas += recompensa;
      }
    }
  },
  {
    id:'desconto-relampago',
    weight:10,
    duration:60,
    modificadores:{ desconto:0.9 }
  }
];

const MEMA_DEBUFF_EFFECTS = [
  {
    id:'queda-de-producao',
    weight:40,
    duration:60,
    modificadores:{ mps:0.5 }
  },
  {
    id:'perda-de-memas',
    weight:30,
    instantaneo:true,
    aplicar:()=>{
      if(bancoDeMemas <= 0) return;
      const perda = bancoDeMemas * 0.10;
      bancoDeMemas = Math.max(0, bancoDeMemas - perda);
    }
  },
  {
    id:'relacao-tensa',
    weight:20,
    duration:60,
    modificadores:{ custoNamorada:1.2 }
  },
  {
    id:'caos-nos-cliques',
    weight:10,
    duration:30,
    modificadores:{ cliqueCaotico:true }
  }
];

function obterDuracaoBuff(def){
  if(typeof def.getDuration === 'function'){
    return Math.max(0, Number(def.getDuration()));
  }
  return Math.max(0, Number(def.duration ?? 0));
}

function registrarBuffTemporario(def, origem){
  const duracao = obterDuracaoBuff(def);
  if(!(duracao > 0)) return;
  const modificadores = {};
  if(typeof def.modificadores?.mps === 'number') modificadores.mps = def.modificadores.mps;
  if(typeof def.modificadores?.cliques === 'number') modificadores.cliques = def.modificadores.cliques;
  if(typeof def.modificadores?.desconto === 'number') modificadores.desconto = def.modificadores.desconto;
  if(typeof def.modificadores?.custoNamorada === 'number') modificadores.custoNamorada = def.modificadores.custoNamorada;
  if(def.modificadores?.cliqueCaotico) modificadores.cliqueCaotico = true;
  listaBuffsAtivos.push({
    id:`${origem}-${def.id}-${Date.now()}-${Math.random()}`,
    origem,
    efeitoId:def.id,
    duracaoRestante:duracao,
    modificadores
  });
  recalcularMultiplicadoresGlobais();
}

function aplicarBuff(def, origem){
  if(!def) return;
  if(def.instantaneo && typeof def.aplicar === 'function'){
    const antes = bancoDeMemas;
    def.aplicar();
    if(bancoDeMemas !== antes) renderHUD();
  } else {
    registrarBuffTemporario(def, origem);
  }
  renderShop();
  renderUpgrades();
  updateAffordability();
  renderHUD();
  save();
}

function agendarProximoMemaBuff(){
  tempoAteProximoMemaBuff = gerarNumeroAleatorio(INTERVALO_MEMA_BUFF.min, INTERVALO_MEMA_BUFF.max);
}

function agendarProximoMemaDeBuff(){
  tempoAteProximoMemaDeBuff = gerarNumeroAleatorio(INTERVALO_MEMA_DEBUFF.min, INTERVALO_MEMA_DEBUFF.max);
}

function removerMemaBuff(){
  if(memaBuffAtual?.el?.isConnected) memaBuffAtual.el.remove();
  memaBuffAtual = null;
}

function removerMemaDeBuff(){
  if(memaDeBuffAtual?.el?.isConnected) memaDeBuffAtual.el.remove();
  memaDeBuffAtual = null;
}

function obterPosicaoIcone(){
  const container = stageEl;
  if(!container){
    return {left: gerarNumeroAleatorio(0, window.innerWidth - MEMA_EVENT_ICON_SIZE), top: gerarNumeroAleatorio(0, window.innerHeight - MEMA_EVENT_ICON_SIZE)};
  }
  const largura = Math.max(MEMA_EVENT_ICON_SIZE, container.clientWidth);
  const altura = Math.max(MEMA_EVENT_ICON_SIZE, container.clientHeight);
  const margem = 16;
  const maxX = Math.max(margem, largura - MEMA_EVENT_ICON_SIZE - margem);
  const maxY = Math.max(margem, altura - MEMA_EVENT_ICON_SIZE - margem);
  const left = Math.min(maxX, Math.max(margem, gerarNumeroAleatorio(margem, maxX)));
  const top = Math.min(maxY, Math.max(margem, gerarNumeroAleatorio(margem, maxY)));
  return {left, top};
}

function criarIconeEvento({tipo}){
  if(!stageEl) return null;
  const src = tipo === 'buff' ? MEMA_BUFF_ICON : MEMA_DEBUFF_ICON;
  const alt = tipo === 'buff' ? 'Mema Buff' : 'Mema DeBuff';
  const el = document.createElement('img');
  el.src = src;
  el.alt = alt;
  el.className = `mema-event-icon ${tipo === 'buff' ? 'mema-event-icon--buff' : 'mema-event-icon--debuff'}`;
  const {left, top} = obterPosicaoIcone();
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  stageEl.appendChild(el);
  return el;
}

function criarMemaBuff(){
  if(memaBuffAtual || !stageEl) return;
  const el = criarIconeEvento({tipo:'buff'});
  if(!el) return;
  const data = { el, tempoRestante:DURACAO_ICONE_EVENTO };
  memaBuffAtual = data;
  el.addEventListener('click', ()=>{
    aoClicarNoMemaBuff();
  }, {once:true});
}

function criarMemaDeBuff(){
  if(memaDeBuffAtual || !stageEl) return;
  if(getQtdNamoradas() <= 0) return;
  const el = criarIconeEvento({tipo:'debuff'});
  if(!el) return;
  const data = { el, tempoRestante:DURACAO_ICONE_EVENTO };
  memaDeBuffAtual = data;
  el.addEventListener('click', ()=>{
    aoClicarNoMemaDeBuff();
  }, {once:true});
}

function aoClicarNoMemaBuff(){
  if(!memaBuffAtual) return;
  removerMemaBuff();
  agendarProximoMemaBuff();
  const efeito = escolherPorPeso(MEMA_BUFF_EFFECTS);
  aplicarBuff(efeito, 'MemaBuff');
}

function aoClicarNoMemaDeBuff(){
  if(!memaDeBuffAtual) return;
  removerMemaDeBuff();
  if(getQtdNamoradas() >= 1){
    const efeito = escolherPorPeso(MEMA_DEBUFF_EFFECTS);
    aplicarBuff(efeito, 'MemaDeBuff');
  }
  agendarProximoMemaDeBuff();
}

function atualizarEventosTemporarios(delta){
  if(!memaBuffAtual){
    tempoAteProximoMemaBuff -= delta;
    if(tempoAteProximoMemaBuff <= 0){
      criarMemaBuff();
    }
  } else {
    memaBuffAtual.tempoRestante -= delta;
    if(memaBuffAtual.tempoRestante <= 0){
      removerMemaBuff();
      agendarProximoMemaBuff();
    }
  }

  const qtdNamoradas = getQtdNamoradas();
  if(qtdNamoradas >= 1){
    if(!memaDeBuffAtual){
      tempoAteProximoMemaDeBuff -= delta;
      if(tempoAteProximoMemaDeBuff <= 0){
        criarMemaDeBuff();
      }
    } else {
      memaDeBuffAtual.tempoRestante -= delta;
      if(memaDeBuffAtual.tempoRestante <= 0){
        removerMemaDeBuff();
        agendarProximoMemaDeBuff();
      }
    }
  } else {
    if(memaDeBuffAtual){
      removerMemaDeBuff();
      agendarProximoMemaDeBuff();
    }
  }
}

function inicializarEventosTemporarios(){
  if(!(tempoAteProximoMemaBuff > 0)) agendarProximoMemaBuff();
  if(!(tempoAteProximoMemaDeBuff > 0)) agendarProximoMemaDeBuff();
}

// 🧮 Formatação numérica — concentra toda a lógica dos quatro modos de exibição.
function getScaleForValue(value){
  const abs = Math.abs(value);
  for(let i = NUMBER_SCALES.length - 1; i >= 0; i--){
    if(abs >= NUMBER_SCALES[i].value) return NUMBER_SCALES[i];
  }
  return NUMBER_SCALES[0];
}

function formatLocaleValue(value, {maximumFractionDigits = 0, minimumFractionDigits = 0} = {}){
  const max = Math.max(maximumFractionDigits, minimumFractionDigits);
  const min = Math.min(minimumFractionDigits, max);
  return Number(value).toLocaleString('pt-BR', {
    maximumFractionDigits: max,
    minimumFractionDigits: min
  });
}

function determineFractionDigits(scaledValue, options = {}){
  if(typeof options.decimals === 'number'){
    const forced = Math.max(options.decimals, options.minimumFractionDigits ?? 0);
    return { max: forced, min: options.minimumFractionDigits ?? 0 };
  }
  const abs = Math.abs(scaledValue);
  let fallback = 2;
  if(abs >= 100) fallback = 0;
  else if(abs >= 10) fallback = 1;
  const min = options.minimumFractionDigits ?? 0;
  return { max: Math.max(fallback, min), min };
}

function pluralizeUnit(baseName, scaledValue){
  if(!baseName) return '';
  const abs = Math.abs(scaledValue);
  if(Math.abs(abs - 1) < 1e-9) return baseName;
  if(baseName.endsWith('ão')) return baseName.replace(/ão$/, 'ões');
  if(baseName.endsWith('mil')) return baseName;
  return `${baseName}s`;
}

function formatNumber(value, options = {}){
  if(!Number.isFinite(value)) return '0';
  const scale = getScaleForValue(value);

  switch(numberFormatMode){
    case 'exact':{
      const digits = determineFractionDigits(value, options);
      return formatLocaleValue(value, digits);
    }
    case 'power':{
      if(scale.order === 0){
        const digits = determineFractionDigits(value, options);
        return formatLocaleValue(value, digits);
      }
      const scaled = value / scale.value;
      const digits = determineFractionDigits(scaled, options);
      const formatted = formatLocaleValue(scaled, digits);
      return `${formatted} × 10^${scale.power}`;
    }
    case 'name':{
      if(scale.order === 0){
        const digits = determineFractionDigits(value, options);
        return formatLocaleValue(value, digits);
      }
      const scaled = value / scale.value;
      const digits = determineFractionDigits(scaled, options);
      const formatted = formatLocaleValue(scaled, digits);
      const unit = pluralizeUnit(scale.name, scaled);
      return unit ? `${formatted} ${unit}` : formatted;
    }
    case 'suffix':
    default:{
      const abs = Math.abs(value);
      if(abs < 1_000){
        const digits = determineFractionDigits(value, options);
        return formatLocaleValue(value, digits);
      }
      const scaled = value / scale.value;
      const digits = determineFractionDigits(scaled, options);
      const formatted = formatLocaleValue(scaled, digits);
      return `${formatted}${scale.suffix}`;
    }
  }
}

function isValidNumberFormat(mode){
  return typeof mode === 'string' && NUMBER_FORMAT_IDS.includes(mode);
}

function updateNumberFormatButtonState(){
  if(!numberFormatButtons?.length) return;
  numberFormatButtons.forEach(btn=>{
    const mode = btn.dataset.numberFormat;
    const isActive = mode === numberFormatMode;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function rerenderAllNumericSections(){
  renderHUD();
  renderShop();
  updateAffordability();
  updateUpgradeAffordability();
  renderOwnedUpgradesCollection();
  renderAchievementsPanel();
  if(activeUpgradeTooltip?.up){
    refreshUpgradeTooltip(activeUpgradeTooltip.up);
  }
}

function applyNumberFormatMode(mode, {skipSave=false, force=false} = {}){
  if(!isValidNumberFormat(mode)) return;
  const changed = numberFormatMode !== mode;
  numberFormatMode = mode;
  updateNumberFormatButtonState();
  if(changed || force){
    rerenderAllNumericSections();
  }
  if(changed && !skipSave){
    save();
  }
}

function fmtTime(seconds){
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const base = `${minutes}:${secs.toString().padStart(2,'0')}`;
  return hours > 0 ? `${hours}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}` : base;
}

function randRange(min, max){
  return Math.random() * (max - min) + min;
}

function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(arr){
  if(!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleInPlace(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const COLLAPSE_BLUE_LINES = [
  'FALHA CRÍTICA NO CONTÍNUO AFETIVO.',
  'EVENTO IMPOSSÍVEL DETECTADO: COMPRA_DE_NAMORADA.',
  'CONFLITO ESTRUTURAL: RELAÇÃO NAMORADA ↔ MEMA É PARADOXO DESTRUTIVO.',
  'OPÇÃO 1: ENCERRAR MUNDO [REJEITADA].',
  'OPÇÃO 2: TENTAR ESTABILIZAR O UNIVERSO COM A ANOMALIA ATIVA.'
];

const COLLAPSE_LOG_LINES = [
  'analisando anomalia: MEMA + NAMORADA = PARADOXO AFETIVO INSTÁVEL',
  'apagar linha do tempo atual: [OPÇÃO DESCARTADA]',
  'ativando protocolo de contenção: manter mundo vivo com dano controlado',
  'inserindo remendos na realidade…',
  'isolando inconsistências emocionais em zonas de risco…',
  'estabilidade parcial alcançada: universo operando em modo “remendado”.'
];

const COLLAPSE_FINAL_LINES = [
  'MUNDO RESTABELECIDO EM ESTADO METAESTÁVEL.',
  'PROSSEGUIR: POR CONTA E RISCO DO USUÁRIO.'
];

const glitchPrelude = {
  active:false,
  durationMs:0,
  timers:new Set(),
  tracked:new Set()
};

function queueGlitchTimeout(fn, delay){
  const handle = setTimeout(()=>{
    glitchPrelude.timers.delete(handle);
    fn();
  }, delay);
  glitchPrelude.timers.add(handle);
  return handle;
}

function clearGlitchTimers(){
  glitchPrelude.timers.forEach(handle=> clearTimeout(handle));
  glitchPrelude.timers.clear();
}

function glitchScrambleDigits(text){
  const chars = Array.from(text);
  for(let i=0;i<chars.length-1;i++){
    if(/\d/.test(chars[i]) && /\d/.test(chars[i+1]) && Math.random() < 0.6){
      const tmp = chars[i];
      chars[i] = chars[i+1];
      chars[i+1] = tmp;
      i++;
    }
  }
  return chars.join('');
}

function applyGlitchJitter(){
  if(!glitchPrelude.active) return;
  const stats = Array.from(document.querySelectorAll('.stats .pill'));
  const affordRows = Array.from(document.querySelectorAll('.shop tr.afford'));
  const targets = stats.concat(affordRows);
  const clickImg = el('click');
  if(clickImg) targets.push(clickImg);
  if(!targets.length) return;
  shuffleInPlace(targets);
  const take = Math.max(1, Math.ceil(targets.length * 0.5));
  for(let i=0;i<take;i++){
    const node = targets[i];
    if(!(node instanceof HTMLElement)) continue;
    if(node.dataset.glitchBusy === '1') continue;
    node.dataset.glitchBusy = '1';
    if(!('glitchOriginalTransform' in node.dataset)){
      node.dataset.glitchOriginalTransform = node.style.transform || '';
    }
    const magnitude = Number(randRange(0.5, 1).toFixed(2));
    const dx = (Math.random() < 0.5 ? -1 : 1) * magnitude;
    const dy = (Math.random() < 0.5 ? -1 : 1) * magnitude;
    node.style.transform = `translate(${dx}px, ${dy}px)`;
    node.classList.add('glitch-jitter');
    glitchPrelude.tracked.add(node);
    queueGlitchTimeout(()=>{
      if(node.dataset.glitchOriginalTransform !== undefined){
        node.style.transform = node.dataset.glitchOriginalTransform;
      } else {
        node.style.removeProperty('transform');
      }
      node.classList.remove('glitch-jitter');
      delete node.dataset.glitchBusy;
    }, randInt(90, 150));
  }
}

function scheduleGlitchJitter(){
  if(!glitchPrelude.active) return;
  queueGlitchTimeout(()=>{
    applyGlitchJitter();
    scheduleGlitchJitter();
  }, randInt(240, 520));
}

function pulseGlitchScanlines(){
  if(!glitchPrelude.active) return;
  if(wrapEl){
    wrapEl.classList.add('glitch-scanlines');
    queueGlitchTimeout(()=> wrapEl?.classList.remove('glitch-scanlines'), randInt(120, 280));
  }
  queueGlitchTimeout(pulseGlitchScanlines, randInt(800, 1300));
}

function distortStatDigits(){
  if(!glitchPrelude.active) return;
  const elements = GLITCH_DIGIT_TARGETS.map(id=> el(id)).filter(Boolean);
  if(!elements.length) return;
  const target = sample(elements);
  if(!(target instanceof HTMLElement)) return;
  if(target.dataset.glitchDigitActive === '1') return;
  const original = target.textContent ?? '';
  if(!original) return;
  target.dataset.glitchDigitActive = '1';
  target.dataset.glitchDigitOriginal = original;
  target.textContent = glitchScrambleDigits(original);
  glitchPrelude.tracked.add(target);
  queueGlitchTimeout(()=>{
    const base = target.dataset.glitchDigitOriginal ?? original;
    target.textContent = base;
    delete target.dataset.glitchDigitActive;
    delete target.dataset.glitchDigitOriginal;
  }, 90);
}

function scheduleDigitDistortion(){
  if(!glitchPrelude.active) return;
  queueGlitchTimeout(()=>{
    distortStatDigits();
    scheduleDigitDistortion();
  }, randInt(360, 760));
}

function applyShiftToElement(el, opacity='0.78', duration=200){
  if(!(el instanceof HTMLElement)) return;
  if(el.dataset.glitchShift === '1') return;
  if(!('glitchOriginalTransform' in el.dataset)){
    el.dataset.glitchOriginalTransform = el.style.transform || '';
  }
  if(!('glitchOriginalOpacity' in el.dataset)){
    el.dataset.glitchOriginalOpacity = el.style.opacity || '';
  }
  el.dataset.glitchShift = '1';
  const dx = Math.random() < 0.5 ? 1 : -1;
  const dy = Math.random() < 0.5 ? 1 : -1;
  el.style.transform = `translate(${dx}px, ${dy}px)`;
  el.style.opacity = opacity;
  el.classList.add('glitch-shift');
  glitchPrelude.tracked.add(el);
  queueGlitchTimeout(()=>{
    if(el.dataset.glitchOriginalTransform !== undefined){
      el.style.transform = el.dataset.glitchOriginalTransform;
    } else {
      el.style.removeProperty('transform');
    }
    if(el.dataset.glitchOriginalOpacity !== undefined){
      el.style.opacity = el.dataset.glitchOriginalOpacity;
    } else {
      el.style.removeProperty('opacity');
    }
    el.classList.remove('glitch-shift');
    delete el.dataset.glitchShift;
  }, duration);
}

function applyGlitchShift(){
  if(!glitchPrelude.active) return;
  const rows = Array.from(document.querySelectorAll('.shop tr.afford'));
  const tooltip = document.querySelector('.tooltip-card.visible');
  const row = rows.length ? sample(rows) : null;
  if(row instanceof HTMLElement){
    applyShiftToElement(row, '0.82');
    const cost = row.querySelector('.cost');
    if(cost instanceof HTMLElement){
      applyShiftToElement(cost, '0.68');
    }
  }
  if(tooltip instanceof HTMLElement){
    applyShiftToElement(tooltip, '0.74');
  }
}

function scheduleGlitchShift(){
  if(!glitchPrelude.active) return;
  queueGlitchTimeout(()=>{
    applyGlitchShift();
    scheduleGlitchShift();
  }, randInt(2000, 3000));
}

function startGlitchPrelude(durationMs = randInt(7000, 11000)){
  stopGlitchPrelude();
  glitchPrelude.active = true;
  glitchPrelude.durationMs = durationMs;
  document.body.classList.add('glitch-prelude');
  applyGlitchJitter();
  scheduleGlitchJitter();
  pulseGlitchScanlines();
  scheduleDigitDistortion();
  scheduleGlitchShift();
  return durationMs;
}

function stopGlitchPrelude(){
  if(!glitchPrelude.active && glitchPrelude.timers.size === 0){
    glitchPrelude.durationMs = 0;
  }
  clearGlitchTimers();
  glitchPrelude.active = false;
  glitchPrelude.durationMs = 0;
  if(wrapEl){
    wrapEl.classList.remove('glitch-scanlines');
  }
  document.body.classList.remove('glitch-prelude');
  glitchPrelude.tracked.forEach(node=>{
    if(!(node instanceof HTMLElement)) return;
    node.classList.remove('glitch-jitter','glitch-shift');
    if(node.dataset.glitchOriginalTransform !== undefined){
      node.style.transform = node.dataset.glitchOriginalTransform;
    } else {
      node.style.removeProperty('transform');
    }
    delete node.dataset.glitchOriginalTransform;
    if(node.dataset.glitchOriginalOpacity !== undefined){
      node.style.opacity = node.dataset.glitchOriginalOpacity;
    } else {
      node.style.removeProperty('opacity');
    }
    delete node.dataset.glitchOriginalOpacity;
    if(node.dataset.glitchDigitOriginal){
      node.textContent = node.dataset.glitchDigitOriginal;
      delete node.dataset.glitchDigitOriginal;
    }
    delete node.dataset.glitchDigitActive;
    delete node.dataset.glitchShift;
    delete node.dataset.glitchBusy;
  });
  glitchPrelude.tracked.clear();
}

window.addEventListener('pagehide', stopGlitchPrelude);
window.addEventListener('beforeunload', stopGlitchPrelude);
window.addEventListener('pagehide', stopCollapseScene);
window.addEventListener('beforeunload', stopCollapseScene);

function queueCollapseTimeout(fn, delay){
  const handle = setTimeout(()=>{
    collapseScene.timers.delete(handle);
    if(!collapseScene.active) return;
    fn();
  }, delay);
  collapseScene.timers.add(handle);
  return handle;
}

function clearCollapseTimers(){
  collapseScene.timers.forEach(handle=> clearTimeout(handle));
  collapseScene.timers.clear();
}

function setCollapsePhase(phase){
  if(!collapseOverlayEl) return;
  ['crack','glitch','blue','logs'].forEach(name=>{
    collapseOverlayEl.classList.remove(`phase-${name}`);
    document.body.classList.remove(`collapse-phase-${name}`);
  });
  if(phase){
    collapseOverlayEl.classList.add(`phase-${phase}`);
    document.body.classList.add(`collapse-phase-${phase}`);
    if(phase !== 'glitch'){
      document.body.classList.remove('collapse-glitch-invert');
    }
  } else {
    document.body.classList.remove('collapse-glitch-invert');
  }
}

function startCollapseSequence(){
  if(!collapseOverlayEl || collapseScene.active) return;
  collapseScene.active = true;
  collapseScene.logIndex = 0;
  clearCollapseTimers();
  activateCollapseImageMode();
  collapseOverlayEl.classList.remove('closing');
  collapseOverlayEl.classList.add('open');
  collapseOverlayEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('collapse-scene-active');
  if(collapseBlueListEl) collapseBlueListEl.innerHTML = '';
  if(collapseLogLinesEl) collapseLogLinesEl.innerHTML = '';
  setCollapsePhase('crack');
  const crackDuration = randInt(720, 940);
  queueCollapseTimeout(()=> beginCollapseGlitchPhase(), crackDuration);
}

function startGlitchColorFlicker(durationMs){
  if(!collapseScene.active || durationMs <= 0) return;
  document.body.classList.remove('collapse-glitch-invert');
  let elapsed = 0;
  const total = durationMs;
  const pulse = ()=>{
    if(!collapseScene.active) return;
    if(elapsed >= total){
      document.body.classList.remove('collapse-glitch-invert');
      return;
    }
    document.body.classList.add('collapse-glitch-invert');
    const onTime = randInt(70, 140);
    queueCollapseTimeout(()=> document.body.classList.remove('collapse-glitch-invert'), onTime);
    const pause = randInt(110, 210);
    elapsed += onTime + pause;
    queueCollapseTimeout(pulse, Math.max(70, pause));
  };
  pulse();
}

function beginCollapseGlitchPhase(){
  if(!collapseScene.active) return;
  setCollapsePhase('glitch');
  const glitchDuration = randInt(2600, 3400);
  startGlitchPrelude(glitchDuration);
  startGlitchColorFlicker(glitchDuration);
  queueCollapseTimeout(()=> beginCollapseBluePhase(), glitchDuration);
}

function beginCollapseBluePhase(){
  if(!collapseScene.active) return;
  stopGlitchPrelude();
  document.body.classList.remove('collapse-glitch-invert');
  setCollapsePhase('blue');
  if(collapseBlueListEl){
    collapseBlueListEl.innerHTML = '';
    COLLAPSE_BLUE_LINES.forEach((line, index)=>{
      const item = document.createElement('li');
      item.className = 'collapse-blue-line';
      item.textContent = line;
      collapseBlueListEl.appendChild(item);
      queueCollapseTimeout(()=> item.classList.add('show'), index * 220 + 80);
    });
  }
  const holdDuration = 2600 + COLLAPSE_BLUE_LINES.length * 180;
  queueCollapseTimeout(()=> beginCollapseLogPhase(), holdDuration);
}

function beginCollapseLogPhase(){
  if(!collapseScene.active) return;
  setCollapsePhase('logs');
  if(collapseLogLinesEl){
    collapseLogLinesEl.innerHTML = '';
  }
  collapseScene.logIndex = 0;
  revealNextCollapseLogLine();
}

function revealNextCollapseLogLine(){
  if(!collapseScene.active) return;
  const totalLines = COLLAPSE_LOG_LINES.length + COLLAPSE_FINAL_LINES.length;
  if(collapseScene.logIndex >= totalLines){
    queueCollapseTimeout(()=> finalizeCollapseScene(), 1600);
    return;
  }
  const isFinal = collapseScene.logIndex >= COLLAPSE_LOG_LINES.length;
  const source = isFinal ? COLLAPSE_FINAL_LINES : COLLAPSE_LOG_LINES;
  const idx = isFinal ? collapseScene.logIndex - COLLAPSE_LOG_LINES.length : collapseScene.logIndex;
  const text = source[idx];
  if(text && collapseLogLinesEl){
    const lineEl = document.createElement('div');
    lineEl.className = 'collapse-log-line';
    if(isFinal) lineEl.classList.add('terminal-final');
    lineEl.textContent = text;
    collapseLogLinesEl.appendChild(lineEl);
    requestAnimationFrame(()=> lineEl.classList.add('show'));
    const parent = collapseLogLinesEl.parentElement;
    if(parent instanceof HTMLElement){
      parent.scrollTop = parent.scrollHeight;
    }
  }
  collapseScene.logIndex += 1;
  const delay = isFinal ? 1500 : 880;
  queueCollapseTimeout(()=> revealNextCollapseLogLine(), delay);
}

function finalizeCollapseScene(){
  if(!collapseScene.active) return;
  clearCollapseTimers();
  setCollapsePhase(null);
  if(collapseOverlayEl){
    collapseOverlayEl.classList.add('closing');
  }
  queueCollapseTimeout(()=>{
    if(collapseOverlayEl){
      collapseOverlayEl.classList.remove('closing');
    }
    stopCollapseScene();
  }, 760);
}

function stopCollapseScene(){
  clearCollapseTimers();
  collapseScene.active = false;
  collapseScene.logIndex = 0;
  stopGlitchPrelude();
  if(collapseOverlayEl){
    collapseOverlayEl.classList.remove('open','phase-crack','phase-glitch','phase-blue','phase-logs','closing');
    collapseOverlayEl.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('collapse-glitch-invert');
  document.body.classList.remove('collapse-scene-active','collapse-phase-crack','collapse-phase-glitch','collapse-phase-blue','collapse-phase-logs');
  if(collapseBlueListEl) collapseBlueListEl.innerHTML = '';
  if(collapseLogLinesEl) collapseLogLinesEl.innerHTML = '';
  if(collapseImageMode){
    deactivateCollapseImageMode();
  }
}

function triggerCollapseSequence(){
  if(collapseState.sceneSeen){
    return;
  }
  collapseState = {
    ...collapseState,
    sceneSeen:true,
    triggeredAt: Date.now()
  };
  save();
  startCollapseSequence();
}

function getTotalBuildingsOwned(){
  if(typeof SHOP === 'undefined') return 0;
  return SHOP.reduce((sum, it)=> sum + (shopState?.[it.id]?.owned ?? 0), 0);
}

function getPurchasedUpgradeCount(){
  if(typeof UPGRADE_DATA === 'undefined') return 0;
  return UPGRADE_DATA.reduce((acc, up)=> acc + (isUpgradePurchased(up.id) ? 1 : 0), 0);
}

const tooltipCardEl = document.getElementById('upgradeTooltip');
const tooltipNameEl = tooltipCardEl?.querySelector('.tooltip-name') ?? null;
const tooltipEffectEl = tooltipCardEl?.querySelector('.tooltip-effect') ?? null;
const tooltipCostEl = tooltipCardEl?.querySelector('.tooltip-cost') ?? null;
let activeUpgradeTooltip = null;

function refreshUpgradeTooltip(up){
  if(!tooltipCardEl || !tooltipNameEl || !tooltipEffectEl || !tooltipCostEl) return;
  tooltipNameEl.textContent = up.name;

  const benefits = getUpgradeBenefitLines(up);
  tooltipEffectEl.textContent = benefits.length ? benefits.join(' • ') : 'Sem efeito adicional';

  const cost = up.cost ?? 0;
  const purchased = isUpgradePurchased(up.id);
  let statusText = '';
  if(purchased){
    statusText = 'Já comprado';
  } else if(bancoDeMemas >= cost){
    statusText = 'Pode comprar';
  } else {
    const missing = Math.max(0, cost - bancoDeMemas);
    statusText = `Faltam ${formatNumber(missing)} pontos`;
  }
  tooltipCostEl.textContent = `Custo: ${formatNumber(cost)} – ${statusText}`;
}

function positionUpgradeTooltip(target, evt){
  if(!tooltipCardEl || !activeUpgradeTooltip) return;
  if(!target?.isConnected){
    hideUpgradeTooltip();
    return;
  }

  const rect = target.getBoundingClientRect();
  const width = tooltipCardEl.offsetWidth;
  const height = tooltipCardEl.offsetHeight;
  const padding = 16;

  let left = (evt?.clientX ?? rect.left + rect.width / 2) - width / 2;
  let top = (evt?.clientY ?? rect.top) - height - padding;

  if(top < 12){
    top = rect.bottom + padding;
  }

  if(left < 12) left = 12;
  const maxLeft = window.innerWidth - width - 12;
  if(left > maxLeft) left = maxLeft;

  const maxTop = window.innerHeight - height - 12;
  if(top > maxTop) top = maxTop;
  if(top < 12) top = 12;

  tooltipCardEl.style.left = `${Math.round(left)}px`;
  tooltipCardEl.style.top = `${Math.round(top)}px`;
}

function showUpgradeTooltip(target, up, evt){
  if(!tooltipCardEl) return;
  activeUpgradeTooltip = { target, up };
  refreshUpgradeTooltip(up);
  tooltipCardEl.setAttribute('aria-hidden', 'false');
  tooltipCardEl.style.visibility = 'hidden';
  tooltipCardEl.classList.add('visible');
  positionUpgradeTooltip(target, evt);
  tooltipCardEl.style.visibility = '';
}

function hideUpgradeTooltip(){
  if(!tooltipCardEl) return;
  activeUpgradeTooltip = null;
  tooltipCardEl.classList.remove('visible');
  tooltipCardEl.setAttribute('aria-hidden', 'true');
}

function repositionActiveUpgradeTooltip(){
  if(!activeUpgradeTooltip) return;
  const target = activeUpgradeTooltip.target;
  if(!target || !target.isConnected){
    hideUpgradeTooltip();
    return;
  }
  if(activeUpgradeTooltip.up){
    refreshUpgradeTooltip(activeUpgradeTooltip.up);
  }
  positionUpgradeTooltip(target);
}

window.addEventListener('scroll', repositionActiveUpgradeTooltip, {passive:true});
window.addEventListener('resize', repositionActiveUpgradeTooltip);

function renderStatsPanel(){
  const bancoEl = el('statBanco');
  if(!bancoEl) return;
  bancoEl.textContent = formatNumber(bancoDeMemas);
  const tempoEl = el('statTempo');
  if(tempoEl) tempoEl.textContent = fmtTime(playTimeSeconds);
  const constrEl = el('statConstr');
  if(constrEl) constrEl.textContent = formatNumber(getTotalBuildingsOwned());
  const mpsEl = el('statMps');
  if(mpsEl) mpsEl.textContent = formatNumber(memasPorSegundoEfetivo, {decimals:2, minimumFractionDigits:2});
  const cliqueEl = el('statClique');
  if(cliqueEl) cliqueEl.textContent = formatNumber(Math.max(1, Math.floor(memasPorCliqueEfetivo)));
  const cliquesEl = el('statCliques');
  if(cliquesEl) cliquesEl.textContent = formatNumber(totalClicks);
  const handmadeEl = el('statHandmade');
  if(handmadeEl) handmadeEl.textContent = formatNumber(Math.max(0, Math.floor(handmadeMemes)));
  const countEl = el('collectionCount');
  if(countEl && typeof UPGRADE_DATA !== 'undefined') countEl.textContent = `Você tem ${formatNumber(getPurchasedUpgradeCount())}/${formatNumber(UPGRADE_DATA.length)} melhorias`;
  const achCountEl = el('achievementsCount');
  if(achCountEl && typeof ACHIEVEMENT_DATA !== 'undefined') achCountEl.textContent = `Você desbloqueou ${formatNumber(getUnlockedAchievementCount())}/${formatNumber(ACHIEVEMENT_DATA.length)} conquistas`;
}

function resetCollectionDetail(){
  const nameEl = el('collectionDetailName');
  if(!nameEl) return;
  nameEl.textContent = 'Selecione uma melhoria';
  const effectEl = el('collectionDetailEffect');
  if(effectEl) effectEl.textContent = 'Passe o mouse ou toque em uma melhoria para ver detalhes.';
  const costEl = el('collectionDetailCost');
  if(costEl) costEl.textContent = '—';
  const reqEl = el('collectionDetailRequirements');
  if(reqEl){
    reqEl.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = '—';
    reqEl.appendChild(li);
  }
  const ownershipEl = el('collectionDetailOwnership');
  if(ownershipEl) ownershipEl.textContent = '';
}

function updateCollectionSelectionHighlight(){
  const slots = document.querySelectorAll('.collection-slot');
  slots.forEach(slot=>{
    const isSelected = slot.dataset.upgrade === selectedCollectionUpgradeId;
    slot.classList.toggle('selected', isSelected);
    slot.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
}

function selectCollectionUpgrade(up){
  if(!up){
    selectedCollectionUpgradeId = null;
    updateCollectionSelectionHighlight();
    resetCollectionDetail();
    return;
  }
  selectedCollectionUpgradeId = up.id;
  updateCollectionSelectionHighlight();
  showUpgradeDetails(up);
}

function showUpgradeDetails(up){
  if(!up){
    resetCollectionDetail();
    return;
  }
  const owned = isUpgradePurchased(up.id);
  const nameEl = el('collectionDetailName');
  if(nameEl) nameEl.textContent = owned ? up.name : '?????';
  const effectEl = el('collectionDetailEffect');
  if(effectEl){
    if(owned){
      const benefits = getUpgradeBenefitLines(up);
      effectEl.textContent = benefits.length ? benefits.join(' • ') : 'Melhoria misteriosa';
    } else {
      effectEl.textContent = '???';
    }
  }
  const costEl = el('collectionDetailCost');
  if(costEl) costEl.textContent = owned ? formatNumber(up.cost ?? 0) : '???';
  const reqEl = el('collectionDetailRequirements');
  if(reqEl){
    reqEl.innerHTML = '';
    if(owned){
      const reqLines = getUpgradeRequirementLines(up);
      if(reqLines.length){
        reqLines.forEach(line=>{
          const li = document.createElement('li');
          li.textContent = line;
          reqEl.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'Sem requisitos adicionais';
        reqEl.appendChild(li);
      }
    } else {
      const li = document.createElement('li');
      li.textContent = '???';
      reqEl.appendChild(li);
    }
  }
  const ownershipEl = el('collectionDetailOwnership');
  if(ownershipEl) ownershipEl.textContent = owned ? 'Comprado' : '?????';
}

function renderOwnedUpgradesCollection(){
  const grid = el('ownedUpgradesGrid');
  if(!grid || typeof UPGRADE_DATA === 'undefined'){
    resetCollectionDetail();
    return;
  }
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  UPGRADE_DATA.forEach(up=>{
    const owned = isUpgradePurchased(up.id);
    const slot = document.createElement('div');
    slot.className = 'collection-slot';
    if(owned) slot.classList.add('owned');
    slot.dataset.upgrade = up.id;
    slot.tabIndex = 0;
    slot.setAttribute('role','button');
    slot.setAttribute('aria-label', owned ? up.name : '?????');
    slot.setAttribute('aria-pressed', 'false');

    if(owned){
      const img = document.createElement('img');
      img.src = up.img;
      img.alt = up.name;
      slot.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'slot-placeholder';
      placeholder.textContent = '?????';
      slot.appendChild(placeholder);
    }

    const handleSelect = ()=> selectCollectionUpgrade(up);
    slot.addEventListener('click', handleSelect);
    slot.addEventListener('keydown', (ev)=>{
      if(ev.key === 'Enter' || ev.key === ' '){
        ev.preventDefault();
        handleSelect();
      }
    });

    fragment.appendChild(slot);
  });
  grid.appendChild(fragment);
  updateCollectionSelectionHighlight();
  if(selectedCollectionUpgradeId){
    const selected = UPGRADE_MAP[selectedCollectionUpgradeId];
    if(selected){
      showUpgradeDetails(selected);
    } else {
      selectCollectionUpgrade(null);
    }
  } else {
    resetCollectionDetail();
  }
  renderStatsPanel();
}

function isAchievementUnlocked(id){
  const st = achievementsState?.[id];
  return !!(st && st.unlocked);
}

function setAchievementUnlocked(id, value=true){
  if(!achievementsState[id]) achievementsState[id] = {unlocked:false, unlockedAt:null};
  achievementsState[id].unlocked = value;
  achievementsState[id].unlockedAt = value ? Date.now() : null;
}

function getUnlockedAchievementCount(){
  if(typeof ACHIEVEMENT_DATA === 'undefined') return 0;
  return ACHIEVEMENT_DATA.reduce((sum, ach)=> sum + (isAchievementUnlocked(ach.id) ? 1 : 0), 0);
}

function isAchievementRequirementMet(ach){
  if(!ach?.requirement) return false;
  const req = ach.requirement;
  switch(req.type){
    case 'building':
      return (shopState?.[req.building]?.owned ?? 0) >= (req.count ?? 0);
    case 'upgrade-count':
      return getPurchasedUpgradeCount() >= (req.count ?? 0);
    case 'clicks':
      return totalClicks >= (req.count ?? 0);
    default:
      return false;
  }
}

function renderAchievementsPanel(){
  const grid = el('achievementsGrid');
  if(!grid || typeof ACHIEVEMENT_DATA === 'undefined') return;
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  ACHIEVEMENT_DATA.forEach(ach=>{
    const unlocked = isAchievementUnlocked(ach.id);
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.classList.add(unlocked ? 'unlocked' : 'locked');

    const title = document.createElement('h4');
    title.className = 'achievement-name';
    title.textContent = unlocked ? ach.name : '?????';
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'achievement-desc';
    desc.textContent = unlocked ? ach.description : '???';
    card.appendChild(desc);

    fragment.appendChild(card);
  });
  grid.appendChild(fragment);

  const countEl = el('achievementsCount');
  if(countEl && typeof ACHIEVEMENT_DATA !== 'undefined'){
    countEl.textContent = `Você desbloqueou ${formatNumber(getUnlockedAchievementCount())}/${formatNumber(ACHIEVEMENT_DATA.length)} conquistas`;
  }
}

const achievementToastQueue = [];
let achievementToastShowing = false;
let achievementToastTimer = null;
let achievementToastHideTimer = null;

function dequeueAchievementToast(){
  if(achievementToastShowing) return;
  if(!achievementToastQueue.length) return;
  const toast = el('achievementToast');
  if(!toast) return;
  const message = achievementToastQueue.shift();
  toast.textContent = `Conquista desbloqueada: ${message}`;
  toast.classList.add('show');
  achievementToastShowing = true;
  if(achievementToastTimer) clearTimeout(achievementToastTimer);
  achievementToastTimer = setTimeout(()=>{
    toast.classList.remove('show');
    if(achievementToastHideTimer) clearTimeout(achievementToastHideTimer);
    achievementToastHideTimer = setTimeout(()=>{
      achievementToastShowing = false;
      dequeueAchievementToast();
    }, 420);
  }, 2600);
}

function showAchievementToast(name){
  achievementToastQueue.push(name);
  dequeueAchievementToast();
}

function evaluateAchievements(silent=false){
  if(typeof ACHIEVEMENT_DATA === 'undefined') return;
  let unlockedAny = false;
  ACHIEVEMENT_DATA.forEach(ach=>{
    if(isAchievementUnlocked(ach.id)) return;
    if(isAchievementRequirementMet(ach)){
      setAchievementUnlocked(ach.id, true);
      unlockedAny = true;
      if(!silent) showAchievementToast(ach.name);
    }
  });
  if(unlockedAny){
    renderAchievementsPanel();
    save();
  }
}

function setupSettingsModal(){
  const modal = el('settingsModal');
  const openBtn = el('openSettings');
  const closeBtn = el('closeSettings');
  if(!modal || !openBtn || !closeBtn) return;

  const tabs = Array.from(modal.querySelectorAll('.modal-tab'));
  const panels = Array.from(modal.querySelectorAll('.modal-panel'));

  function setActiveTab(tabId){
    tabs.forEach(btn=>{
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(panel=>{
      const active = panel.dataset.panel === tabId;
      panel.classList.toggle('active', active);
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if(tabId === 'upgrades'){
      renderOwnedUpgradesCollection();
    } else if(tabId === 'achievements'){
      renderAchievementsPanel();
    } else {
      renderStatsPanel();
    }
  }

  function open(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setActiveTab('config');
    renderStatsPanel();
  }

  function close(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (ev)=>{
    if(ev.target === modal) close();
  });
  document.addEventListener('keydown', (ev)=>{
    if(ev.key === 'Escape' && modal.classList.contains('open')) close();
  });
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=> setActiveTab(btn.dataset.tab));
  });
}

/* SAVE/LOAD */
let shopState = null; // definido após catálogo
function save(showToast=false){
  localStorage.setItem('mcw', JSON.stringify({
    pts: bancoDeMemas,
    bancoDeMemas,
    clickPow: memasPorCliqueEfetivo,
    clickPowBase: memasPorCliqueBase,
    mps: memasPorSegundoEfetivo,
    mpsBase: memasPorSegundoBase,
    multiplicadorGlobalMPS,
    multiplicadorGlobalCliques,
    multiplicadorDescontoGlobal,
    multiplicadorCustoNamorada,
    modoCliqueCaotico,
    playTimeSeconds,
    totalClicks,
    handmadeMemes,
    shopState,
    upgradesState,
    achievementsState,
    collapseState,
    numberFormatMode,
    codes: Array.from(redeemedCodes)
  }));
  if(showToast) flashSave();
}
function load(){ try{
  migratedLegacyUpgrades = false;
  const d = JSON.parse(localStorage.getItem('mcw')||'{}');
  bancoDeMemas = d.bancoDeMemas ?? d.pts ?? 0;
  memasPorCliqueBase = d.clickPowBase ?? 1;
  memasPorCliqueEfetivo = d.clickPow ?? memasPorCliqueBase;
  memasPorSegundoBase = d.mpsBase ?? 0;
  memasPorSegundoEfetivo = d.mps ?? memasPorSegundoBase;
  multiplicadorGlobalMPS = Number.isFinite(d.multiplicadorGlobalMPS) ? d.multiplicadorGlobalMPS : 1;
  multiplicadorGlobalCliques = Number.isFinite(d.multiplicadorGlobalCliques) ? d.multiplicadorGlobalCliques : 1;
  multiplicadorDescontoGlobal = Number.isFinite(d.multiplicadorDescontoGlobal) ? d.multiplicadorDescontoGlobal : 1;
  multiplicadorCustoNamorada = Number.isFinite(d.multiplicadorCustoNamorada) ? d.multiplicadorCustoNamorada : 1;
  modoCliqueCaotico = !!d.modoCliqueCaotico;
  playTimeSeconds = d.playTimeSeconds ?? d.playTime ?? 0;
  totalClicks = d.totalClicks ?? 0;
  handmadeMemes = d.handmadeMemes ?? 0;
  if(d.shopState) shopState = {...makeInitialShopState(), ...d.shopState};
  if(d.upgradesState){
    const base = makeInitialUpgradeState();
    upgradesState = {...base};
    Object.keys(d.upgradesState).forEach(id=>{
      if(!base[id]) return;
      const prev = d.upgradesState[id] || {};
      const purchased = !!(prev.purchased ?? prev.unlocked);
      upgradesState[id] = {...base[id], purchased, unlocked:purchased};
      if(prev.unlocked !== undefined && prev.purchased === undefined){
        migratedLegacyUpgrades = true;
      }
    });
  }
  if(d.achievementsState){
    const base = makeInitialAchievementState();
    achievementsState = {...base};
    Object.keys(d.achievementsState).forEach(id=>{
      if(!base[id]) return;
      const prev = d.achievementsState[id] || {};
      achievementsState[id] = {
        ...base[id],
        unlocked: !!prev.unlocked,
        unlockedAt: prev.unlockedAt ?? null
      };
    });
  }
  const codes = Array.isArray(d.codes) ? d.codes : [];
  redeemedCodes = new Set(codes.map(code=> String(code).toLowerCase()));
  if(isValidNumberFormat(d.numberFormatMode)){
    applyNumberFormatMode(d.numberFormatMode, {skipSave:true, force:true});
  } else {
    applyNumberFormatMode(DEFAULT_NUMBER_FORMAT, {skipSave:true, force:true});
  }
  if(d.collapseState && typeof d.collapseState === 'object'){
    const base = makeInitialCollapseState();
    collapseState = {
      ...base,
      ...d.collapseState,
      sceneSeen: !!d.collapseState.sceneSeen,
      triggeredAt: d.collapseState.triggeredAt ?? null
    };
  } else {
    collapseState = makeInitialCollapseState();
    if(d.doomState && typeof d.doomState === 'object' && d.doomState.doomed){
      collapseState.sceneSeen = true;
      collapseState.triggeredAt = d.doomState.triggeredAt ?? null;
    }
  }
} catch(e){} }

/* HUD (topo) */
function renderHUD(){
  el('pts').textContent = formatNumber(bancoDeMemas);
  el('pc').textContent = formatNumber(Math.floor(memasPorCliqueEfetivo));
  el('mps').textContent = formatNumber(memasPorSegundoEfetivo, {decimals:2, minimumFractionDigits:2});
  // não re-renderiza a loja aqui
  renderStatsPanel();
}

function getQtdNamoradas(){
  return shopState?.namorada?.owned ?? 0;
}

function hasNamorada(){
  return getQtdNamoradas() > 0;
}

// 🖼️ Define qual rosto o Mema mostra ao ser clicado (front ou reset após a namorada).
function getClickReactionImage(){
  return hasNamorada() ? IMG_RESET : IMG_FRONT;
}

function activateCollapseImageMode(){
  collapseImageMode = true;
  const img = el('click');
  if(img){
    if(faceTimer){
      clearTimeout(faceTimer);
      faceTimer = null;
    }
    img.src = IMG_BACK;
  }
}

function deactivateCollapseImageMode(){
  collapseImageMode = false;
  updateClickImage();
}

function updateClickImage(){
  const img = el('click');
  if(!img) return;
  if(faceTimer){
    clearTimeout(faceTimer);
    faceTimer = null;
  }
  if(collapseImageMode){
    img.src = IMG_BACK;
    return;
  }
  img.src = IMG_BACK;
}

/* feedback imagem */
function showFront(){
  const img = el('click');
  if(!img) return;
  if(collapseImageMode){
    img.src = IMG_RESET;
    if(faceTimer) clearTimeout(faceTimer);
    faceTimer = setTimeout(()=>{
      faceTimer = null;
    }, FRONT_TIME_MS);
    return;
  }
  const reaction = getClickReactionImage();
  img.src = reaction;
  if(faceTimer) clearTimeout(faceTimer);
  if(reaction === IMG_RESET){
    faceTimer = setTimeout(()=>{
      updateClickImage();
      faceTimer = null;
    }, FRONT_TIME_MS);
  } else {
    faceTimer = setTimeout(()=>{
      img.src = IMG_BACK;
      faceTimer = null;
    }, FRONT_TIME_MS);
  }
}

/* reset */
function resetState(){
  stopCollapseScene();
  collapseState = makeInitialCollapseState();
  bancoDeMemas = 0;
  memasPorCliqueBase = 1;
  memasPorCliqueEfetivo = 1;
  memasPorSegundoBase = 0;
  memasPorSegundoEfetivo = 0;
  multiplicadorGlobalMPS = 1;
  multiplicadorGlobalCliques = 1;
  multiplicadorDescontoGlobal = 1;
  multiplicadorCustoNamorada = 1;
  modoCliqueCaotico = false;
  listaBuffsAtivos.length = 0;
  tempoAteProximoMemaBuff = 0;
  tempoAteProximoMemaDeBuff = 0;
  if(memaBuffAtual?.el?.isConnected) memaBuffAtual.el.remove();
  memaBuffAtual = null;
  if(memaDeBuffAtual?.el?.isConnected) memaDeBuffAtual.el.remove();
  memaDeBuffAtual = null;
  playTimeSeconds = 0;
  totalClicks = 0;
  handmadeMemes = 0;
  shopState = makeInitialShopState();
  upgradesState = makeInitialUpgradeState();
  achievementsState = makeInitialAchievementState();
  selectedCollectionUpgradeId = null;
  redeemedCodes = new Set();
  achievementToastQueue.length = 0;
  if(achievementToastTimer) clearTimeout(achievementToastTimer);
  if(achievementToastHideTimer) clearTimeout(achievementToastHideTimer);
  achievementToastTimer = null;
  achievementToastHideTimer = null;
  achievementToastShowing = false;
  const toast = el('achievementToast');
  if(toast) toast.classList.remove('show');
  applyNumberFormatMode(DEFAULT_NUMBER_FORMAT, {skipSave:true, force:true});
  inicializarEventosTemporarios();
  updateClickImage();
}
function deleteSave(force=false){
  if(!force){
    const ok = confirm('Apagar seu save? Esta ação não pode ser desfeita.');
    if(!ok) return false;
  }
  localStorage.removeItem('mcw');
  resetState();
  renderShop();
  renderUpgrades();
  recalculateProduction();
  evaluateAchievements(true);
  renderAchievementsPanel();
  renderHUD();
  updateClickImage();
  return true;
}

/* loop de meminhas automáticos (MPS) */
function loop(){
  let last=performance.now();
  function tick(){
    const now=performance.now(), dt=(now-last)/1000; last=now;
    atualizarBuffs(dt);
    atualizarEventosTemporarios(dt);
    bancoDeMemas += memasPorSegundoEfetivo*dt;
    playTimeSeconds += dt;
    renderHUD();                 // atualiza só o topo
    updateAffordability();       // pinta se dá pra comprar, sem recriar DOM
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* auto-save + toast */
let saveTimer = null;
function startAutoSave(){
  if(saveTimer) clearInterval(saveTimer);
  saveTimer = setInterval(()=> save(true), 5000);
}
let toastTimer=null;
function flashSave(){
  const t = el('saveToast');
  t.textContent = 'salvo';
  t.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 1400);
}

let purchaseToastTimer = null;
function announcePurchase(name, rowEl){
  const toast = el('purchaseToast');
  if(toast){
    const label = typeof name === 'string' && name.trim() ? name.trim().toUpperCase() : 'NAMORADA';
    toast.textContent = `VOCÊ COMPROU: ${label}`;
    const isFinal = label === 'NAMORADA';
    toast.classList.toggle('toast-final', isFinal);
    toast.classList.add('show');
    if(purchaseToastTimer) clearTimeout(purchaseToastTimer);
    const duration = isFinal ? 2400 : 1200;
    purchaseToastTimer = setTimeout(()=>{
      toast.classList.remove('show');
      if(isFinal) toast.classList.remove('toast-final');
    }, duration);
  }
  if(rowEl instanceof HTMLElement){
    rowEl.classList.add('glitch-shift');
    setTimeout(()=> rowEl.classList.remove('glitch-shift'), 280);
  }
}

function promptAndRedeemCode(){
  if(!redeemCodeButtonEl) return;
  const raw = prompt('Insira o código:');
  if(raw === null) return;
  const normalized = raw.trim().toLowerCase();
  if(!normalized){
    alert('Nenhum código informado.');
    return;
  }
  if(!Object.prototype.hasOwnProperty.call(CODE_REWARDS, normalized)){
    alert('Código inválido.');
    return;
  }
  if(redeemedCodes.has(normalized)){
    alert('Código já utilizado.');
    return;
  }

  const reward = CODE_REWARDS[normalized];
  bancoDeMemas += reward;
  redeemedCodes.add(normalized);
  renderHUD();
  updateAffordability();
  evaluateAchievements();
  save(true);
  alert(`Código resgatado! Você ganhou ${formatNumber(reward)} Meminhas.`);
}

/* preload imagens */
(new Image()).src = IMG_BACK;
(new Image()).src = IMG_FRONT;
(new Image()).src = IMG_RESET;

/* ===== Loja =====
   Agora usamos as fórmulas exponenciais:
   precoProximo(base, escala, q) = ceil(base * escala^q)
*/

function makeInitialCollapseState(){
  return { sceneSeen:false, triggeredAt:null };
}

const upgradeElements = new Map();

function makeInitialShopState(){
  const s={};
  SHOP.forEach(it=> s[it.id] = {owned:0});
  return s;
}
if(!shopState) shopState = makeInitialShopState();

function makeInitialUpgradeState(){
  const s={};
  UPGRADE_DATA.forEach(up=> s[up.id] = {purchased:false, unlocked:false});
  return s;
}
if(!upgradesState) upgradesState = makeInitialUpgradeState();

function makeInitialAchievementState(){
  const s={};
  ACHIEVEMENT_DATA.forEach(ach=> s[ach.id] = {unlocked:false, unlockedAt:null});
  return s;
}
if(!achievementsState) achievementsState = makeInitialAchievementState();

/* Fórmulas utilitárias */
function precoProximo(base, escala, qPossuidas){
  return Math.ceil(base * Math.pow(escala, qPossuidas));
}

function aplicarDescontoAoCusto(baseCost, {aplicarCustoNamorada = false} = {}){
  if(!Number.isFinite(baseCost)) return 0;
  let final = baseCost * multiplicadorDescontoGlobal;
  if(aplicarCustoNamorada){
    final *= multiplicadorCustoNamorada;
  }
  return Math.max(1, Math.ceil(final));
}

function getBuildingCost(it, owned){
  const baseCost = precoProximo(it.base, it.r, owned);
  const aplicarNamorada = it.id === 'namorada';
  return aplicarDescontoAoCusto(baseCost, {aplicarCustoNamorada: aplicarNamorada});
}

function getUpgradeCost(up){
  const base = up.cost ?? 0;
  return aplicarDescontoAoCusto(base);
}
/* Render da loja — atualiza visibilidade e cores com base em bancoDeMemas e desbloqueio */
function renderShop(){
  const body = document.getElementById('shopBody');
  if(!body) return;
  body.innerHTML='';

  SHOP.forEach((it, idx)=>{
    const st = shopState[it.id];
    const atLimit = st.owned >= it.limit;

    // desbloqueio: item só aparece quando o anterior tiver ao menos 1 comprado
    const locked = idx > 0 && (shopState[SHOP[idx-1].id].owned < 1);

    if(locked){
      // mantém a progressão da loja escondendo completamente itens futuros
      return;
    }

    const tr = document.createElement('tr');
    tr.dataset.buy = it.id;

    tr.className = atLimit ? 'max' : 'clickable';

    // determinar preço da próxima unidade
    const priceSingle = getBuildingCost(it, st.owned);

    // determinar se pode comprar agora (custo alcançável e não no limite)
    const canAffordSingle = (!atLimit) && (bancoDeMemas >= priceSingle);

    const perUnit = it.p * getBuildingMultiplier(it.id);

    // Se o item estiver desbloqueado mas você ainda não possui NENHUM (owned === 0),
    // mostramos "?????" no lugar do nome para criar surpresa antes da primeira compra.
    const itemName = it.name ?? it.id;
    const displayName = (!locked && st.owned === 0) ? '?????' : itemName;

    const formattedCost = formatNumber(priceSingle);
    const formattedPerUnit = formatNumber(perUnit, {decimals:2, minimumFractionDigits:2});
    const formattedOwned = formatNumber(st.owned);
    const formattedLimit = formatNumber(it.limit);

    tr.innerHTML = `
      <td class="name">
        <div>${displayName}</div>
        <div class="cost ${canAffordSingle ? 'can' : 'cant'}">Custo: ${formattedCost}</div>
        <div class="status">${atLimit ? 'MAX' : ''}</div>
      </td>
      <td>+${formattedPerUnit}</td>
      <td class="owned-limit"><span class="owned">${formattedOwned}</span><span class="sep">/</span><span class="limit-num">${formattedLimit}</span></td>
    `;

    // aplica a classe visual de "pode comprar" se o preço couber
    tr.classList.toggle('afford', canAffordSingle);

    if(!locked && !atLimit){
      // clique na linha inteira --> tenta comprar 1 unidade
      tr.addEventListener('click', ()=> {
        tryBuy(it.id);
      });
      // acessibilidade básica (Enter/Space)
      tr.setAttribute('tabindex', '0');
      tr.setAttribute('role','button');
      tr.addEventListener('keydown', (e)=>{
        if(e.key==='Enter' || e.key===' '){
          e.preventDefault();
          tryBuy(it.id);
        }
      });
    }

    body.appendChild(tr);
  });
}

function isUpgradePurchased(id){
  const st = upgradesState?.[id];
  if(!st) return false;
  if(typeof st.purchased === 'boolean') return st.purchased;
  return !!st.unlocked;
}

function setUpgradePurchased(id, value=true){
  if(!upgradesState[id]) upgradesState[id] = {purchased:false, unlocked:false};
  upgradesState[id].purchased = value;
  upgradesState[id].unlocked = value;
}

function canShowUpgrade(up){
  if(up.requires && up.requires.some(reqId=> !isUpgradePurchased(reqId))) return false;
  const req = up.requirement;
  if(req?.type === 'building'){
    const owned = shopState[req.building]?.owned ?? 0;
    if(owned < req.count) return false;
  } else if(req?.type === 'handmade'){
    const required = req.amount ?? 0;
    if(handmadeMemes < required) return false;
  }
  return true;
}

function getUpgradeRequirementLines(up){
  const lines = [];
  if(up.requirementText) lines.push(up.requirementText);
  if(up.requirement?.type === 'building' && !up.requirementText){
    const name = SHOP_LOOKUP[up.requirement.building]?.name ?? up.requirement.building;
    const count = up.requirement.count ?? 0;
    lines.push(`Compre ${formatNumber(count)} ${name}`);
  }
  if(up.requirement?.type === 'handmade' && !up.requirementText){
    const amount = Math.max(0, Math.floor(up.requirement.amount ?? 0));
    const formatted = formatNumber(amount);
    lines.push(`${formatted} Meminhas feitos com click`);
  }
  if(up.requires && up.requires.length){
    up.requires.forEach(reqId=>{
      const name = UPGRADE_MAP[reqId]?.name ?? reqId;
      lines.push(name);
    });
  }
  return lines;
}

function getUpgradeBenefitLines(up){
  const lines = [];
  if(up.effect) lines.push(up.effect);
  return lines;
}

function updateUpgradeElement(el, up){
  const cost = getUpgradeCost(up);
  const purchased = isUpgradePurchased(up.id);
  const affordable = bancoDeMemas >= cost;
  el.classList.toggle('purchased', purchased);
  el.classList.toggle('available', !purchased && affordable);
  el.classList.toggle('locked', !purchased && !affordable);
  el.disabled = purchased;

  const descriptionParts = [`Custo: ${formatNumber(cost)}`];
  const benefits = getUpgradeBenefitLines(up);
  if(benefits.length) descriptionParts.push(benefits.join(' • '));

  let statusText = '';
  if(purchased){
    statusText = 'Comprado';
  } else if(affordable){
    statusText = 'Pronto para comprar';
  } else {
    const missing = Math.max(0, cost - bancoDeMemas);
    if(missing > 0) statusText = `Faltam ${formatNumber(missing)} pontos`;
  }
  if(statusText) descriptionParts.push(statusText);
  el.setAttribute('aria-description', descriptionParts.join(' • '));

  if(activeUpgradeTooltip && activeUpgradeTooltip.target === el){
    activeUpgradeTooltip.up = up;
    refreshUpgradeTooltip(up);
    positionUpgradeTooltip(el);
  }
}

function updateUpgradeAffordability(){
  upgradeElements.forEach((el, id)=>{
    const up = UPGRADE_MAP[id];
    if(up) updateUpgradeElement(el, up);
  });
}

function getUpgradeElement(id){
  if(upgradeElements.has(id)) return upgradeElements.get(id);
  const el = document.querySelector(`[data-upgrade="${id}"]`);
  if(el) upgradeElements.set(id, el);
  return el;
}

function shouldRefreshHandmadeUpgrades(previousValue, currentValue){
  if(!(Number.isFinite(previousValue) && Number.isFinite(currentValue))) return false;
  if(currentValue < previousValue) return false;
  return UPGRADE_DATA.some(up=>{
    if(up.requirement?.type !== 'handmade') return false;
    if(isUpgradePurchased(up.id)) return false;
    const threshold = up.requirement.amount ?? Number.POSITIVE_INFINITY;
    if(!Number.isFinite(threshold)) return false;
    if(currentValue < threshold) return false;
    if(previousValue >= threshold && getUpgradeElement(up.id)) return false;
    return true;
  });
}

function tryBuyUpgrade(id){
  const up = UPGRADE_MAP[id];
  if(!up) return;
  if(isUpgradePurchased(id)) return;
  if(!canShowUpgrade(up)) return;
  const cost = getUpgradeCost(up);
  if(bancoDeMemas < cost){
    const el = getUpgradeElement(id);
    if(el){
      el.classList.add('buzz');
      setTimeout(()=> el.classList.remove('buzz'), 320);
    }
    return;
  }

  bancoDeMemas -= cost;
  setUpgradePurchased(id, true);
  recalculateProduction();
  renderShop();
  renderUpgrades();
  evaluateAchievements();
  renderHUD();
  save(true);
}

function getUpgradeBonuses(up){
  if(!up?.bonus) return [];
  return Array.isArray(up.bonus) ? up.bonus : [up.bonus];
}

function getBuildingMultiplier(buildingId){
  let multiplier = 1;
  UPGRADE_DATA.forEach(up=>{
    if(!isUpgradePurchased(up.id)) return;
    getUpgradeBonuses(up).forEach(bonus=>{
      if(bonus?.type === 'building' && bonus.target === buildingId){
        const amount = bonus.amount ?? 0;
        multiplier *= 1 + amount;
      }
    });
  });
  return multiplier;
}

function recalculateProduction(){
  let total = 0;
  SHOP.forEach(it=>{
    const owned = shopState[it.id]?.owned ?? 0;
    if(!owned) return;
    const multiplier = getBuildingMultiplier(it.id);
    total += owned * it.p * multiplier;
  });
  memasPorSegundoBase = total;
  let clickMult = 1;
  let clickPctOfMps = 0;
  UPGRADE_DATA.forEach(up=>{
    if(!isUpgradePurchased(up.id)) return;
    getUpgradeBonuses(up).forEach(bonus=>{
      if(bonus?.type === 'click'){
        const mult = bonus.mult ?? 1;
        clickMult *= mult;
        const pct = bonus.pctOfMps ?? 0;
        clickPctOfMps += pct;
      }
    });
  });
  const baseClick = 1;
  memasPorCliqueBase = baseClick * clickMult + (memasPorSegundoBase * clickPctOfMps);
  atualizarValoresEfetivos();
}

function renderUpgrades(){
  const grid = document.getElementById('upgradesGrid');
  if(!grid) return;
  hideUpgradeTooltip();
  grid.innerHTML = '';
  upgradeElements.clear();

  const fragment = document.createDocumentFragment();

  UPGRADE_DATA.forEach(up=>{
    const purchased = isUpgradePurchased(up.id);
    if(purchased) return;
    const visible = canShowUpgrade(up);
    if(!visible) return;

    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'upgrade-tile';
    item.classList.add('tooltip-host');
    item.dataset.upgrade = up.id;
    item.setAttribute('aria-label', up.name);

    const img = document.createElement('img');
    img.className = 'upgrade-img';
    img.src = up.img;
    img.alt = up.name;
    item.appendChild(img);
    const check = document.createElement('span');
    check.className = 'upgrade-check';
    check.textContent = '✔';
    item.appendChild(check);

    updateUpgradeElement(item, up);

    const handlePointerEnter = (ev)=> showUpgradeTooltip(item, up, ev);
    const handlePointerMove = (ev)=> positionUpgradeTooltip(item, ev);
    const handlePointerLeave = ()=> hideUpgradeTooltip();
    item.addEventListener('pointerenter', handlePointerEnter);
    item.addEventListener('pointermove', handlePointerMove);
    item.addEventListener('pointerleave', handlePointerLeave);
    item.addEventListener('focus', ()=> showUpgradeTooltip(item, up));
    item.addEventListener('blur', hideUpgradeTooltip);

    if(!purchased){
      item.addEventListener('click', ()=>{
        hideUpgradeTooltip();
        tryBuyUpgrade(up.id);
      });
    }

    fragment.appendChild(item);
    upgradeElements.set(up.id, item);
  });

  grid.appendChild(fragment);
  updateUpgradeAffordability();
  renderOwnedUpgradesCollection();
}

/* Atualiza apenas as classes de acessibilidade (can/cant) sem re-renderizar linhas */
function updateAffordability(){
  SHOP.forEach(it=>{
    const st   = shopState[it.id];
    const row  = document.querySelector(`tr[data-buy="${it.id}"]`);
    if(!row) return;

    const priceSingle = getBuildingCost(it, st.owned);
    const underLimit = st.owned < it.limit;
    const canPay = bancoDeMemas >= priceSingle;
    const can = underLimit && canPay;

    const costEl = row.querySelector('.cost');
    if(costEl){
      costEl.classList.toggle('can', can);
      costEl.classList.toggle('cant', !can);
    }
    row.classList.toggle('afford', can);
  });

  updateUpgradeAffordability();
}

/* Tenta comprar item ao clicar na linha */
function tryBuy(id){
  const it = SHOP.find(x=>x.id===id); if(!it) return;
  const st = shopState[id];
  const remainingLimit = it.limit - st.owned;
  if(remainingLimit <= 0) return;

  const priceSingle = getBuildingCost(it, st.owned);
  // encontrar a linha atual no DOM (pode ter sido re-renderizada)
  const row = document.querySelector(`tr[data-buy="${id}"]`);

  if(bancoDeMemas < priceSingle){
    if(row){
      // feedback: buzz
      row.classList.add('buzz');
      const s = row.querySelector('.status');
      if(s) s.textContent = '';
      setTimeout(()=> row.classList.remove('buzz'), 320);
    }
    return;
  }

  // compra: subtrai custo e atualiza owned
  bancoDeMemas -= priceSingle;
  st.owned += 1;

  if(id === 'namorada' && st.owned === 1){
    // announcePurchase('Namorada', row); // removido o toast
    triggerCollapseSequence();
    updateClickImage();
    window.scrollTo({top:0, behavior:'smooth'});
  }


  recalculateProduction();

  // If reached limit, visually mark
  if(st.owned >= it.limit){
    if(row){
      row.classList.remove('clickable'); row.classList.add('max');
      const s = row.querySelector('.status'); if(s) s.textContent = 'MAX';
    }
  }

  // Ao comprar, possivelmente desbloqueia o próximo item — re-render da loja
  renderShop();
  renderUpgrades();
  evaluateAchievements();
  renderHUD();
  save(true);

  // aplica flash na nova linha renderizada
  const newRow = document.querySelector(`tr[data-buy="${id}"]`);
  if(newRow) {
    newRow.classList.add('flashG');
    setTimeout(()=> newRow.classList.remove('flashG'), 450);
  }
}

/* init */
setupSettingsModal();
load();
recalcularMultiplicadoresGlobais();
recalculateProduction();
inicializarEventosTemporarios();
renderShop();
renderUpgrades();
evaluateAchievements(true);
renderAchievementsPanel();
renderHUD();
updateClickImage();
if(migratedLegacyUpgrades) save();
loop();
startAutoSave();

/* clique na imagem = ganhar pontos */
function getClickOutcome(){
  const base = Math.max(1, Math.floor(memasPorCliqueEfetivo));
  if(!modoCliqueCaotico){
    return {delta: base, handmade: base};
  }
  if(Math.random() < 0.5){
    const ganho = Math.max(1, Math.floor(base * 5));
    return {delta: ganho, handmade: ganho};
  }
  const perda = Math.max(1, Math.floor(base * 2));
  return {delta: -perda, handmade: 0};
}
if(clickImageEl){
  clickImageEl.addEventListener('click', (e)=>{
    const outcome = getClickOutcome();
    const previousHandmade = handmadeMemes;
    if(outcome.delta >= 0){
      bancoDeMemas += outcome.delta;
      handmadeMemes += outcome.handmade;
    } else {
      const perda = Math.min(bancoDeMemas, Math.abs(outcome.delta));
      bancoDeMemas -= perda;
    }
    totalClicks += 1;
    const unlockedHandmadeUpgrade = shouldRefreshHandmadeUpgrades(previousHandmade, handmadeMemes);
    evaluateAchievements();
    renderHUD();
    if(unlockedHandmadeUpgrade){
      renderUpgrades();
    } else {
      updateUpgradeAffordability();
    }
    updateAffordability();
    save();
    showFront();

    if(typeof criarParticula === 'function'){
      criarParticula(e.clientX, e.clientY);
    }
  });
}


/* ações */
if(redeemCodeButtonEl){
  redeemCodeButtonEl.addEventListener('click', promptAndRedeemCode);
}
if(deleteSaveButtonEl){
  deleteSaveButtonEl.addEventListener('click', ()=> deleteSave());
}
// 🎛️ Botões de formato numérico — cada clique chama applyNumberFormatMode.
if(numberFormatButtons.length){
  numberFormatButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const mode = btn.dataset.numberFormat;
      applyNumberFormatMode(mode);
    });
  });
  updateNumberFormatButtonState();
}
// === MINI-GAME: ACERTE O MEMA DOURADO ===
const BONUS_VALUE = 500; // quantidade de Meminhas que o jogador ganha
const BONUS_INTERVAL = 15000; // intervalo em ms (15 segundos)
const BONUS_DURATION = 2000; // quanto tempo o Mema dourado fica visível

function spawnMemaDourado() {
  // cria o elemento
  const memaBonus = document.createElement('img');
  memaBonus.src = IMG_RESET; // usa a textura de reset para o brilho dourado
  memaBonus.alt = 'Mema Dourado!';
  memaBonus.classList.add('mema-bonus');

  // posição aleatória
  const x = Math.random() * (window.innerWidth - 100);
  const y = Math.random() * (window.innerHeight - 100);
  memaBonus.style.left = `${x}px`;
  memaBonus.style.top = `${y}px`;

  document.body.appendChild(memaBonus);

  // clique → ganha bônus
  memaBonus.addEventListener('click', () => {
    adicionarPontos(BONUS_VALUE);
    mostrarBonusTexto(`+${formatNumber(BONUS_VALUE)} Meminhas!`, x, y);
    memaBonus.remove();
  });

  // desaparece depois de um tempo
  setTimeout(() => {
    memaBonus.remove();
  }, BONUS_DURATION);
}

// mostra texto animado do bônus
function mostrarBonusTexto(texto, x, y) {
  const el = document.createElement('div');
  el.classList.add('bonus-text');
  el.textContent = texto;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);

  setTimeout(() => el.remove(), 1000);
}

// função que adiciona Meminhas ao contador principal
function adicionarPontos(valor) {
  const incremento = Number(valor);
  if(!Number.isFinite(incremento) || incremento <= 0) return;
  bancoDeMemas += incremento;
  renderHUD();
  updateAffordability();
  save();
}

// spawn automático a cada intervalo
setInterval(spawnMemaDourado, BONUS_INTERVAL);
