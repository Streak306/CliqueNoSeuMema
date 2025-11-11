import {
  CODE_REWARDS,
  IMG_BACK,
  IMG_FRONT,
  IMG_RESET,
  FRONT_TIME_MS,
  GLITCH_DIGIT_TARGETS,
  SHOP,
  SHOP_LOOKUP,
  UPGRADE_DATA,
  UPGRADE_MAP,
  ACHIEVEMENT_DATA
} from './data.js';

/* ===== Estado do jogo ===== */
let pts = 0, clickPow = 1, mps = 0;
let playTimeSeconds = 0;
let totalClicks = 0;
let handmadeMemes = 0;
let upgradesState = null;
let achievementsState = null;
let migratedLegacyUpgrades = false;
let selectedCollectionUpgradeId = null;
let redeemedCodes = new Set();
let doomState = makeInitialDoomState();

const wrapEl = document.querySelector('.wrap');
const stageEl = document.querySelector('.stage');
const redeemCodeButtonEl = document.getElementById('redeemCode');
const worldEndOverlayEl = document.getElementById('worldEndOverlay');
const worldEndButtonEl = document.getElementById('worldResetButton');
let worldEndTimerHandle = null;
let worldEndFocusTrapActive = false;

let faceTimer = null;

/* Helpers */
const el=(id)=>document.getElementById(id);
/* formatação curta legível (K/M/B/T) */
function fmtShort(n){
  const abs = Math.abs(n);
  if(abs >= 1e12) return (n/1e12).toFixed(3)+'T';
  if(abs >= 1e9)  return (n/1e9 ).toFixed(3)+'B';
  if(abs >= 1e6)  return (n/1e6 ).toFixed(2)+'M';
  if(abs >= 1e3)  return (n/1e3 ).toFixed(2)+'K';
  return Math.floor(n).toString();
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

function clearWorldEndTimer(){
  if(worldEndTimerHandle){
    clearTimeout(worldEndTimerHandle);
    worldEndTimerHandle = null;
  }
}

function handleWorldEndFocus(ev){
  if(!worldEndOverlayEl?.classList.contains('open')) return;
  if(worldEndOverlayEl.contains(ev.target)) return;
  ev.stopPropagation();
  worldEndButtonEl?.focus();
}

function handleWorldEndKeydown(ev){
  if(ev.key !== 'Tab') return;
  ev.preventDefault();
  worldEndButtonEl?.focus();
}

function activateWorldEndFocusTrap(){
  if(worldEndFocusTrapActive || !worldEndOverlayEl) return;
  worldEndFocusTrapActive = true;
  document.addEventListener('focus', handleWorldEndFocus, true);
  worldEndOverlayEl.addEventListener('keydown', handleWorldEndKeydown);
  worldEndButtonEl?.addEventListener('keydown', handleWorldEndKeydown);
}

function deactivateWorldEndFocusTrap(){
  if(!worldEndFocusTrapActive) return;
  worldEndFocusTrapActive = false;
  document.removeEventListener('focus', handleWorldEndFocus, true);
  worldEndOverlayEl?.removeEventListener('keydown', handleWorldEndKeydown);
  worldEndButtonEl?.removeEventListener('keydown', handleWorldEndKeydown);
}

function showWorldEndOverlay(){
  if(!worldEndOverlayEl) return;
  stopGlitchPrelude();
  clearWorldEndTimer();
  worldEndOverlayEl.classList.add('open');
  worldEndOverlayEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('world-end');
  doomState = {...doomState, doomed:true, overlayShown:true, triggeredAt: doomState.triggeredAt ?? Date.now()};
  activateWorldEndFocusTrap();
  setTimeout(()=> worldEndButtonEl?.focus(), 0);
  save();
}

function hideWorldEndOverlay(){
  clearWorldEndTimer();
  stopGlitchPrelude();
  if(worldEndOverlayEl){
    worldEndOverlayEl.classList.remove('open');
    worldEndOverlayEl.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('world-end');
  deactivateWorldEndFocusTrap();
}

function startWorldEndCountdown(){
  const duration = startGlitchPrelude(randInt(7000, 11000));
  clearWorldEndTimer();
  worldEndTimerHandle = setTimeout(()=> showWorldEndOverlay(), duration);
}

function triggerWorldEndSequence(){
  if(doomState.doomed && doomState.overlayShown){
    showWorldEndOverlay();
    return;
  }
  doomState = {...doomState, doomed:true, overlayShown:false, triggeredAt: Date.now()};
  save();
  startWorldEndCountdown();
}

function resumeWorldEndState(){
  if(!doomState.doomed){
    hideWorldEndOverlay();
    return;
  }
  showWorldEndOverlay();
}

function handleWorldReset(){
  doomState = makeInitialDoomState();
  hideWorldEndOverlay();
  deleteSave(true);
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
  } else if(pts >= cost){
    statusText = 'Pode comprar';
  } else {
    const missing = Math.max(0, cost - pts);
    statusText = `Faltam ${fmtShort(missing)} pontos`;
  }
  tooltipCostEl.textContent = `Custo: ${fmtShort(cost)} – ${statusText}`;
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
  bancoEl.textContent = fmtShort(pts);
  const tempoEl = el('statTempo');
  if(tempoEl) tempoEl.textContent = fmtTime(playTimeSeconds);
  const constrEl = el('statConstr');
  if(constrEl) constrEl.textContent = getTotalBuildingsOwned();
  const mpsEl = el('statMps');
  if(mpsEl) mpsEl.textContent = mps.toFixed(2);
  const cliqueEl = el('statClique');
  if(cliqueEl) cliqueEl.textContent = Math.max(1, Math.floor(clickPow));
  const cliquesEl = el('statCliques');
  if(cliquesEl) cliquesEl.textContent = totalClicks;
  const handmadeEl = el('statHandmade');
  if(handmadeEl) handmadeEl.textContent = Math.max(0, Math.floor(handmadeMemes)).toLocaleString('pt-BR');
  const countEl = el('collectionCount');
  if(countEl && typeof UPGRADE_DATA !== 'undefined') countEl.textContent = `Você tem ${getPurchasedUpgradeCount()}/${UPGRADE_DATA.length} melhorias`;
  const achCountEl = el('achievementsCount');
  if(achCountEl && typeof ACHIEVEMENT_DATA !== 'undefined') achCountEl.textContent = `Você desbloqueou ${getUnlockedAchievementCount()}/${ACHIEVEMENT_DATA.length} conquistas`;
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
  if(costEl) costEl.textContent = owned ? fmtShort(up.cost ?? 0) : '???';
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
    countEl.textContent = `Você desbloqueou ${getUnlockedAchievementCount()}/${ACHIEVEMENT_DATA.length} conquistas`;
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
    pts,
    clickPow,
    mps,
    playTimeSeconds,
    totalClicks,
    handmadeMemes,
    shopState,
    upgradesState,
    achievementsState,
    doomState,
    codes: Array.from(redeemedCodes)
  }));
  if(showToast) flashSave();
}
function load(){ try{
  migratedLegacyUpgrades = false;
  const d = JSON.parse(localStorage.getItem('mcw')||'{}');
  pts=d.pts??0; clickPow=d.clickPow??1; mps=d.mps??0;
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
  if(d.doomState && typeof d.doomState === 'object'){
    const base = makeInitialDoomState();
    doomState = {
      ...base,
      ...d.doomState,
      doomed: !!d.doomState.doomed,
      overlayShown: !!d.doomState.overlayShown
    };
  } else {
    doomState = makeInitialDoomState();
  }
} catch(e){} }

/* HUD (topo) */
function renderHUD(){
  el('pts').textContent = fmtShort(pts);
  el('pc').textContent = Math.floor(clickPow);
  el('mps').textContent = mps.toFixed(2);
  // não re-renderiza a loja aqui
  renderStatsPanel();
}

function hasNamorada(){
  return (shopState?.namorada?.owned ?? 0) > 0;
}

function updateClickImage(){
  const img = el('click');
  if(!img) return;
  if(faceTimer){
    clearTimeout(faceTimer);
    faceTimer = null;
  }
  img.src = hasNamorada() ? IMG_RESET : IMG_BACK;
}

/* feedback imagem */
function showFront(){
  const img = el('click');
  if(!img) return;
  if(hasNamorada()){
    updateClickImage();
    return;
  }
  img.src = IMG_FRONT;
  if(faceTimer) clearTimeout(faceTimer);
  faceTimer = setTimeout(()=>{
    img.src = IMG_BACK;
    faceTimer = null;
  }, FRONT_TIME_MS);
}

/* reset */
function resetState(){
  hideWorldEndOverlay();
  doomState = makeInitialDoomState();
  pts=0; clickPow=1; mps=0;
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
    pts += mps*dt;
    playTimeSeconds += dt;
    renderHUD();                 // atualiza só o topo
    updateAffordability();       // pinta se dá pra comprar, sem recriar DOM
    updateUpgradeAffordability();
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
  pts += reward;
  redeemedCodes.add(normalized);
  renderHUD();
  updateAffordability();
  evaluateAchievements();
  save(true);
  alert(`Código resgatado! Você ganhou ${fmtShort(reward)} Meminhas.`);
}

/* preload imagens */
(new Image()).src = IMG_BACK;
(new Image()).src = IMG_FRONT;

/* ===== Loja =====
   Agora usamos as fórmulas exponenciais:
   precoProximo(base, escala, q) = ceil(base * escala^q)
*/

function makeInitialDoomState(){
  return { doomed:false, overlayShown:false, triggeredAt:null };
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
/* Render da loja — atualiza visibilidade e cores com base em pts e desbloqueio */
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
    const priceSingle = precoProximo(it.base, it.r, st.owned);

    // determinar se pode comprar agora (custo alcançável e não no limite)
    const canAffordSingle = (!atLimit) && (pts >= priceSingle);

    const perUnit = it.p * getBuildingMultiplier(it.id);

    // Se o item estiver desbloqueado mas você ainda não possui NENHUM (owned === 0),
    // mostramos "?????" no lugar do nome para criar surpresa antes da primeira compra.
    const itemName = it.name ?? it.id;
    const displayName = (!locked && st.owned === 0) ? '?????' : itemName;

    tr.innerHTML = `
      <td class="name">
        <div>${displayName}</div>
        <div class="cost ${canAffordSingle ? 'can' : 'cant'}">Custo: ${fmtShort(priceSingle)}</div>
        <div class="status">${atLimit ? 'MAX' : ''}</div>
      </td>
      <td>+${perUnit.toFixed(2)}</td>
      <td class="owned-limit"><span class="owned">${st.owned}</span><span class="sep">/</span><span class="limit-num">${it.limit}</span></td>
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
    lines.push(`Compre ${count} ${name}`);
  }
  if(up.requirement?.type === 'handmade' && !up.requirementText){
    const amount = Math.max(0, Math.floor(up.requirement.amount ?? 0));
    const formatted = amount.toLocaleString('pt-BR');
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
  const cost = up.cost ?? 0;
  const purchased = isUpgradePurchased(up.id);
  const affordable = pts >= cost;
  el.classList.toggle('purchased', purchased);
  el.classList.toggle('available', !purchased && affordable);
  el.classList.toggle('locked', !purchased && !affordable);
  el.disabled = purchased;

  const descriptionParts = [`Custo: ${fmtShort(cost)}`];
  const benefits = getUpgradeBenefitLines(up);
  if(benefits.length) descriptionParts.push(benefits.join(' • '));

  let statusText = '';
  if(purchased){
    statusText = 'Comprado';
  } else if(affordable){
    statusText = 'Pronto para comprar';
  } else {
    const missing = Math.max(0, cost - pts);
    if(missing > 0) statusText = `Faltam ${fmtShort(missing)} pontos`;
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
  const cost = up.cost ?? 0;
  if(pts < cost){
    const el = getUpgradeElement(id);
    if(el){
      el.classList.add('buzz');
      setTimeout(()=> el.classList.remove('buzz'), 320);
    }
    return;
  }

  pts -= cost;
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
  mps = total;
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
  clickPow = baseClick * clickMult + (mps * clickPctOfMps);
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

    const priceSingle = precoProximo(it.base, it.r, st.owned);
    const underLimit = st.owned < it.limit;
    const canPay = pts >= priceSingle;
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

  const priceSingle = precoProximo(it.base, it.r, st.owned);
  // encontrar a linha atual no DOM (pode ter sido re-renderizada)
  const row = document.querySelector(`tr[data-buy="${id}"]`);

  if(pts < priceSingle){
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
  pts -= priceSingle;
  st.owned += 1;

  if(id === 'namorada' && st.owned === 1){
    // announcePurchase('Namorada', row); // removido o toast
    triggerWorldEndSequence();
    updateClickImage();
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
recalculateProduction();
renderShop();
renderUpgrades();
evaluateAchievements(true);
renderAchievementsPanel();
renderHUD();
updateClickImage();
resumeWorldEndState();
if(migratedLegacyUpgrades) save();
loop();
startAutoSave();

/* clique na imagem = ganhar pontos */
function getClickGain(){
  return Math.max(1, Math.floor(clickPow));
}
el('click').onclick=()=>{
  const gain = getClickGain();
  const previousHandmade = handmadeMemes;
  pts += gain;
  totalClicks += 1;
  handmadeMemes += gain;
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
};

/* ações */
if(redeemCodeButtonEl){
  redeemCodeButtonEl.addEventListener('click', promptAndRedeemCode);
}
el('deleteSave').onclick=()=>deleteSave();
if(worldEndButtonEl){
  worldEndButtonEl.addEventListener('click', handleWorldReset);
}
