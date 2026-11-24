/* Lucid State City: extra areas (Space, Planet Lucida, Lucid Bay, Crimson Summit, Ashen Hollow, Zone Zero)
   Built from the stream city (city.html) for the walkable website. Loaded on the first trip. */
(function () {
'use strict';
const cam = window.LSCZ_CAM, renderer = window.LSCZ_RENDERER;
const scene = new THREE.Scene();                       // stand-in for the stream city's own scene (its transit props are not used here)
const screens = { GAMEPLAY: [], LIVECAM: [], CHAT: [], COMMANDS: [], VAULT: [] };
const shots = [], FOCUS = []; let fly = null, hold = null;
const bloom = { strength: 1 }, composer = { passes: [{ scene: null, camera: null }] };
const SHOW = { mode: 'live' }, store = { get: (k, d) => d, set() {} }, params = new URLSearchParams('');
const clock = new THREE.Clock();
const extraScreens = [];
function fgHitNear() {} function startMove() {} function setTour() {} function releaseGuide() {} function postState() {} function addCustomShots() {}
function toast(t) { if (window.LSCZ_TOAST) window.LSCZ_TOAST(t); }
function $(id) { return document.getElementById(id) || document.createElement('div'); }
function lookQuat(from, to) { const m = new THREE.Matrix4().lookAt(from, to, new THREE.Vector3(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(m); }
window.VDEF = { types: { emblem: { n: 'Emblem', s: { skull: 'Skull', wolf: 'Wolf', eagle: 'Eagle', reaper: 'Reaper', rifles: 'Crossed rifles', crown: 'Crown', phoenix: 'Phoenix', ace: 'Ace of spades' } },
  card: { n: 'Calling card', s: { inferno: 'Inferno', storm: 'Thunderstorm', neon: 'Neon grid', jungle: 'Jungle camo', nightops: 'Night ops', goldrush: 'Gold rush' } },
  tags: { n: 'Dog tags', s: { steel: 'Steel', gold: 'Gold', blackout: 'Blackout', neon: 'Neon' } },
  medal: { n: 'Medal', s: { valor: 'Star of valor', laurel: 'Laurel', sunburst: 'Sunburst', wings: 'Silver wings' } },
  camo: { n: 'Weapon camo', s: { gold: 'Gold', diamond: 'Diamond', plasma: 'Plasma', dragon: 'Dragonscale', arctic: 'Arctic', digital: 'Digital' } },
  rank: { n: 'Prestige badge', s: { p1: 'Prestige 1', p2: 'Prestige 2', p3: 'Prestige 3', p5: 'Prestige 5', p10: 'Prestige 10', master: 'Prestige Master' } } },
  rar: { common: ['Common', '#9aa3ad'], rare: ['Rare', '#3aa0ff'], epic: ['Epic', '#b450ff'], legendary: ['Legendary', '#ffb02e'], mythic: ['Mythic', '#ff2a4a'] } };
window.vtFillSelects = (keepStyle) => { const $ = id => document.getElementById(id), D = window.VDEF; if (!$('vtType')) return; if (!$('vtType').options.length) { $('vtType').innerHTML = Object.entries(D.types).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('');
    $('vtRarity').innerHTML = Object.entries(D.rar).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join(''); $('vtRarity').value = 'legendary'; }
  const T = D.types[$('vtType').value]; $('vtStyle').innerHTML = Object.entries(T.s).map(([k, v]) => `<option value="${k}">${v}</option>`).join(''); };
window.STATS_PRESETS = { fighting: { n: 'Fighting', x: [['ko', 'KOs'], ['perfect', 'Perfects']] }, shooter: { n: 'Shooter', x: [['kill', 'Kills'], ['death', 'Deaths']] }, br: { n: 'Battle royale', x: [['kill', 'Kills'], ['top10', 'Top 10s']] },
  sports: { n: 'Sports / racing', x: [['goal', 'Goals'], ['mvp', 'MVPs']] }, custom: { n: 'Custom', x: [['c1', 'Stat 1'], ['c2', 'Stat 2']] } };
window.ssRenderPanel = (S, act) => { const $ = id => document.getElementById(id), P = window.STATS_PRESETS; if (!$('ssBtns') || !S) return;
  if (!$('ssPreset').options.length) $('ssPreset').innerHTML = Object.entries(P).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('');
  const keep = (id, v) => { if (document.activeElement !== $(id) && !$(id)._dirty) $(id).value = v; };
  keep('ssGame', S.game || ''); keep('ssPreset', S.preset || 'fighting'); keep('ssC1', (S.custom || [])[0] || ''); keep('ssC2', (S.custom || [])[1] || '');
  $('ssCustom').style.display = $('ssPreset').value === 'custom' ? 'flex' : 'none';
  $('ssShow').value = S.show || 'rotate'; $('ssHud').checked = !!S.hud; $('ssHudPos').value = S.hudPos || 'tr'; $('ssMods').checked = !!S.mods;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rows = [['w', 'Wins', '#7dff6a'], ['l', 'Losses', '#ff5a6a']].concat(S.labels.map(([k, l], i) => [k, l, i ? '#ffd23a' : '#38e8ff']));
  const h = (S.game ? `<p class="note" style="margin:6px 0">Tracking <b>${esc(S.game)}</b> · streak ${S.streak || 0} · best ${S.best || 0}</p>` : '<p class="note" style="margin:6px 0">Set the game you are playing first.</p>') +
    rows.map(([k, l, c]) => `<div class="row" style="margin-top:6px;flex-wrap:nowrap;align-items:center"><span style="flex:1.3;font-weight:600;color:${c}">${l}</span><span style="flex:0.6;font:700 20px Poppins,sans-serif;text-align:center">${(S.c || {})[k] || 0}</span><button data-k="${k}" data-d="1" class="big" style="flex:1.2;--pc:${c}">+1</button><button data-k="${k}" data-d="-1" style="flex:0.6">−1</button></div>`).join('');
  if ($('ssBtns')._h !== h) { $('ssBtns')._h = h; $('ssBtns').innerHTML = h; }
  if (!$('ssBtns')._wired) { $('ssBtns')._wired = true;
    $('ssBtns').onclick = e => { const b = e.target.closest('button'); if (b) act('add', { k: b.dataset.k, d: +b.dataset.d }); };
    ['ssGame', 'ssC1', 'ssC2'].forEach(id => $(id).oninput = () => $(id)._dirty = true);
    $('ssPreset').onchange = () => { $('ssCustom').style.display = $('ssPreset').value === 'custom' ? 'flex' : 'none'; $('ssPreset')._dirty = true; };
    $('ssSet').onclick = () => { const name = $('ssGame').value.trim(); if (!name) { $('ssGame').focus(); return; } ['ssGame', 'ssC1', 'ssC2', 'ssPreset'].forEach(id => $(id)._dirty = false);
      act('game', { name, preset: $('ssPreset').value, custom: [$('ssC1').value.trim() || 'Stat 1', $('ssC2').value.trim() || 'Stat 2'] }); };
    $('ssUndo').onclick = () => act('undo', {}); $('ssReset').onclick = () => { const b = $('ssReset'); if (b._arm && Date.now() - b._arm < 4000) { b._arm = 0; b.textContent = 'Reset session'; act('reset', {}); return; } b._arm = Date.now(); b.textContent = 'Tap again to reset'; setTimeout(() => { if (b._arm) { b._arm = 0; b.textContent = 'Reset session'; } }, 4000); };
    $('ssShowNow').onclick = () => act('shownow', {});
    const cfg = () => act('cfg', { show: $('ssShow').value, hud: $('ssHud').checked, hudPos: $('ssHudPos').value, mods: $('ssMods').checked });
    ['ssShow', 'ssHud', 'ssHudPos', 'ssMods'].forEach(id => $(id).onchange = cfg); } };
window.LSC_CONTROL = new URLSearchParams(location.search).get('control') === '1';
window.LSC_AVATAR = new URLSearchParams(location.search).get('avatar') === '1';
const VD = window.VDEF;
let vaultItems = store.get('vault', []); if (!Array.isArray(vaultItems)) vaultItems = [];
const VT = { mesh: null, c: null, x: null, tex: null, n: 0 };
const hall = { mesh: null, c: null, x: null, tex: null, t: 0 };
function crr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
const spawned = [];
const bodyGeo = new THREE.CylinderGeometry(0.25, 0.21, 0.75, 8), headGeo = new THREE.SphereGeometry(0.16, 10, 8), legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.85, 6);
function nameSprite(text, color) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
  x.font = 'bold 64px Poppins, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = color; x.shadowBlur = 18; x.fillStyle = '#fff'; x.fillText(text, 256, 64, 490);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false }));
  sp.scale.set(2.6, 0.65, 1); sp.position.y = 2.45; return sp;
}
// ---- NPC people: jointed low-poly humans with hair, faces, outfits and props, plus walk / idle / dance / cheer / sit poses
const NPC = (() => {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.04 });
  mat.onBeforeCompile = s => {
    s.vertexShader = 'attribute float glow;\nvarying float vGlow;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vGlow = glow;');
    s.fragmentShader = 'varying float vGlow;\n' + s.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * vGlow;');
  };
  const C = new THREE.Color(), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3();
  const cylC = {}, cyl = (t, b, n) => cylC[t + '|' + b + '|' + (n || 9)] || (cylC[t + '|' + b + '|' + (n || 9)] = new THREE.CylinderGeometry(t, b, 1, n || 9));
  const G = { box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(1, 12, 9), cap: new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), arc: new THREE.TorusGeometry(1, 0.16, 5, 12, Math.PI) };
  function part(L, geo, col, p, sc, rot, glow) {
    const g = geo.clone(); E.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0); Q.setFromEuler(E);
    M.compose(V.set(p[0], p[1], p[2]), Q, S.set(sc[0], sc[1], sc[2])); g.applyMatrix4(M);
    const n = g.attributes.position.count, c = new Float32Array(n * 3), gl = new Float32Array(n); C.setHex(col);
    for (let i = 0; i < n; i++) { c[i * 3] = C.r; c[i * 3 + 1] = C.g; c[i * 3 + 2] = C.b; gl[i] = glow || 0; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setAttribute('glow', new THREE.BufferAttribute(gl, 1)); if (g.attributes.uv) g.deleteAttribute('uv'); L.push(g);
  }
  const merge = L => { const g = THREE.BufferGeometryUtils.mergeBufferGeometries(L); L.forEach(x => x.dispose()); g.computeBoundingSphere(); return g; };
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; };
  const shade = (c, k) => { C.setHex(c).multiplyScalar(k); return C.getHex(); };
  const SK = [0xf0c8a8, 0xe0b090, 0xc58c64, 0xa67a60, 0x8c5c40, 0x6a4028, 0x553420, 0x3a2414];
  const HAIR = [0x0e0c10, 0x0e0c10, 0x2a1a10, 0x4a2a14, 0x8a5a2a, 0xd8b060, 0xb83a2a, 0xd8d8e4, 0xff2d8f, 0x38e8ff];
  const NEON = [0xff2d8f, 0x38e8ff, 0xb478ff, 0xffd23a, 0x7dff6a, 0xff8a3a];
  const DARK = [0x16141e, 0x1e2238, 0x2a1838, 0x3a1420, 0x1e2a22, 0x2a2a30, 0x101014];
  const PANTS = [0x14141a, 0x1e2a44, 0x2a2a30, 0x3a3826, 0x101828, 0x2a1a2a];
  const BRIGHT = [0xff6aa8, 0x5ad8ff, 0xffd86a, 0x8aff8a, 0xff9a5a, 0xc8a0ff, 0xf6f4ee, 0x3a7aff];
  const FAT = [0x4a5236, 0x5a5440, 0x3a3e34, 0x6a5e44, 0x2e3228, 0x55503a];
  const swap = [];
  // opts: { style: 'city' | 'bay' | 'casual', col, skin, seed, viewer }
  function make(o) {
    o = o || {}; const R = rng(o.seed != null ? o.seed : Math.random() * 4294967295 >>> 0), pick = a => a[R() * a.length | 0], ch = p => R() < p;
    const style = o.style || 'city', skin = o.skin != null ? o.skin : pick(SK), hairC = pick(HAIR), hasCol = o.col != null;
    const acc = hasCol ? new THREE.Color(o.col).getHex() : pick(NEON);
    let top, topC, topGlow = 0, sleeve = 'long', pantsC = pick(PANTS), shorts = false, shoeC = ch(0.6) ? 0xf0f0f0 : 0x16161a, soleC = acc, soleGlow = 0.9, shirtC = ch(0.5) ? 0xf2f0ee : 0x101014;
    if (style === 'bay') { top = ch(0.45) ? 'tank' : 'tee'; topC = hasCol ? acc : pick(BRIGHT); topGlow = hasCol ? 0.35 : 0; sleeve = top === 'tank' ? 'none' : 'short'; shorts = true;
      pantsC = pick([0x1e3a6a, 0xf2f0ea, 0x2a2a30, 0x3a6a8a, 0xc85a3a, 0x16161a]); shoeC = pick([0x2a1a10, 0xf2f2f2, 0x18181c, 0xff6aa8]); soleC = 0x2a2420; soleGlow = 0; }
    else if (style === 'mil') { top = 'mil'; topC = pick(FAT); pantsC = shade(topC, 0.9); shoeC = pick([0x2a2018, 0x141414, 0x4a3a28]); soleC = 0x141210; soleGlow = 0; }
    else if (o.viewer) { top = 'hoodie'; topC = acc; topGlow = 0.6; }
    else if (hasCol) { top = ch(0.5) ? 'hoodie' : 'jacket'; topC = acc; topGlow = 0.22; }
    else { const r = R(); top = r < 0.45 ? 'jacket' : r < 0.75 ? 'hoodie' : 'tee';
      if (top === 'jacket') topC = pick(DARK); else if (top === 'hoodie') { topC = ch(0.5) ? pick(DARK) : acc; topGlow = topC === acc ? 0.3 : 0; } else { topC = ch(0.5) ? 0xeeeef2 : pick(DARK); sleeve = 'short'; } }
    const B = [], A0 = [], A1 = [], L0 = [], L1 = [];
    // torso
    part(B, G.box, pantsC, [0, 0.97, 0], [0.34, 0.18, 0.21]);
    part(B, cyl(0.205, 0.165), topC, [0, 1.25, 0], [1, 0.5, 0.62], 0, topGlow);
    [-1, 1].forEach(s => part(B, G.sph, sleeve === 'none' ? skin : topC, [s * 0.19, 1.44, 0], [0.09, 0.075, 0.085], 0, sleeve === 'none' ? 0 : topGlow));
    if (top === 'jacket') { part(B, G.box, shirtC, [0, 1.27, 0.118], [0.11, 0.42, 0.02]); [-1, 1].forEach(s => part(B, G.box, acc, [s * 0.072, 1.26, 0.124], [0.022, 0.46, 0.02], 0, 1.3));
      part(B, cyl(0.17, 0.17), shade(topC, 0.7), [0, 1.03, 0], [1, 0.05, 0.64]); }
    if (top === 'hoodie') { part(B, G.sph, shade(topC, 0.85), [0, 1.49, -0.105], [0.16, 0.11, 0.1], 0, topGlow * 0.8); part(B, G.box, shade(topC, 0.8), [0, 1.1, 0.112], [0.22, 0.1, 0.02], 0, topGlow * 0.6);
      [-1, 1].forEach(s => part(B, G.box, 0xf2f0ee, [s * 0.04, 1.38, 0.124], [0.012, 0.1, 0.01])); }
    if (top === 'tee' || top === 'tank') { if (!hasCol || style === 'bay') part(B, G.box, style === 'bay' ? shade(topC, 0.75) : acc, [0, 1.31, 0.124], [0.13, 0.1, 0.02], 0, style === 'bay' ? 0 : 0.9); }
    if (top === 'tank') part(B, cyl(0.12, 0.12), skin, [0, 1.47, 0.01], [1, 0.06, 0.6]);
    if (top === 'mil') { const vc = ch(0.5) ? 0x1c1c1a : shade(topC, 0.62); [-1, 1].forEach(s => part(B, G.box, vc, [0, 1.27, s * 0.118], [0.36, 0.36, 0.07]));
      [-0.11, 0, 0.11].forEach(px => part(B, G.box, shade(vc, 1.25), [px, 1.15, 0.16], [0.085, 0.11, 0.05])); [-1, 1].forEach(s => part(B, G.box, vc, [s * 0.13, 1.46, 0], [0.06, 0.03, 0.26]));
      part(B, G.box, 0x0c0c0c, [0, 1.07, 0], [0.37, 0.05, 0.25]);
      if (o.viewer) part(B, G.box, acc, [-0.09, 1.36, 0.156], [0.1, 0.06, 0.012], 0, 1.2); }
    // head
    part(B, cyl(0.055, 0.06), skin, [0, 1.53, 0], [1, 0.1, 1]);
    part(B, G.sph, skin, [0, 1.68, 0], [0.115, 0.135, 0.125]);
    [-1, 1].forEach(s => { part(B, G.sph, skin, [s * 0.113, 1.68, -0.005], [0.022, 0.035, 0.02]);
      part(B, G.box, 0x0c0a10, [s * 0.042, 1.697, 0.111], [0.034, 0.024, 0.014]); part(B, G.box, 0xf4f4f8, [s * 0.042 + s * 0.01, 1.7, 0.117], [0.01, 0.01, 0.004]);
      part(B, G.box, shade(hairC, 0.8), [s * 0.043, 1.728, 0.108], [0.046, 0.012, 0.014], [0, 0, s * -0.12]); });
    part(B, G.box, shade(skin, 0.88), [0, 1.672, 0.124], [0.022, 0.042, 0.026]);
    part(B, G.box, 0x6a2a2a, [0, 1.632, 0.114], [0.05, 0.012, 0.01]);
    // hair / hats
    const hs = style === 'mil' ? pick(['helmet', 'helmet', 'helmet', 'helmet', 'boonie', 'buzz']) : style === 'bay' ? pick(['short', 'buzz', 'long', 'pony', 'bun', 'afro', 'sunhat', 'cap']) : pick(['short', 'short', 'buzz', 'afro', 'long', 'pony', 'mohawk', 'bun', 'cap', 'beanie']);
    const capH = (c, gl) => part(B, G.cap, c, [0, 1.69, -0.008], [0.124, 0.13, 0.135], [-0.22, 0, 0], gl);
    if (hs === 'short') { capH(hairC); part(B, G.box, hairC, [0, 1.66, -0.096], [0.2, 0.12, 0.06]); }
    else if (hs === 'buzz') part(B, G.cap, hairC, [0, 1.7, -0.006], [0.119, 0.11, 0.13], [-0.2, 0, 0]);
    else if (hs === 'afro') part(B, G.sph, hairC, [0, 1.76, -0.025], [0.17, 0.15, 0.165]);
    else if (hs === 'long') { capH(hairC); part(B, G.box, hairC, [0, 1.57, -0.085], [0.24, 0.3, 0.07]); [-1, 1].forEach(s => part(B, G.box, hairC, [s * 0.11, 1.62, -0.01], [0.04, 0.2, 0.12])); }
    else if (hs === 'pony') { capH(hairC); part(B, cyl(0.035, 0.02), hairC, [0, 1.62, -0.16], [1, 0.24, 1], [0.45, 0, 0]); }
    else if (hs === 'mohawk') { part(B, G.cap, 0x1a1418, [0, 1.7, -0.006], [0.119, 0.1, 0.13], [-0.2, 0, 0]); part(B, G.box, acc, [0, 1.81, -0.02], [0.035, 0.09, 0.25], 0, 0.8); }
    else if (hs === 'bun') { capH(hairC); part(B, G.sph, hairC, [0, 1.82, -0.07], [0.06, 0.055, 0.06]); }
    else if (hs === 'cap') { const c = ch(0.5) ? acc : pick(DARK); part(B, G.cap, c, [0, 1.705, -0.005], [0.13, 0.12, 0.138], [-0.12, 0, 0], c === acc ? 0.3 : 0); part(B, G.box, c, [0, 1.742, 0.13], [0.21, 0.018, 0.13], [0.1, 0, 0], c === acc ? 0.3 : 0); }
    else if (hs === 'beanie') { const c = ch(0.5) ? acc : pick(DARK); part(B, G.cap, c, [0, 1.71, -0.005], [0.132, 0.15, 0.14], [-0.15, 0, 0], c === acc ? 0.35 : 0); part(B, cyl(0.136, 0.136, 12), shade(c, 0.75), [0, 1.73, 0], [1, 0.045, 1.04], [-0.15, 0, 0]); }
    else if (hs === 'helmet') { const hc = shade(topC, 0.78); part(B, G.cap, hc, [0, 1.7, -0.01], [0.152, 0.15, 0.162], [-0.1, 0, 0]); part(B, cyl(0.155, 0.16, 12), hc, [0, 1.705, -0.01], [1, 0.03, 1.05]);
      part(B, G.box, 0x141414, [0, 1.79, 0.13], [0.06, 0.05, 0.04]); if (o.viewer) part(B, cyl(0.156, 0.156, 12), acc, [0, 1.75, -0.01], [1, 0.025, 1.05], [-0.1, 0, 0], 1.1); }
    else if (hs === 'boonie') { const hc = shade(topC, 0.95); part(B, G.cap, hc, [0, 1.71, -0.005], [0.13, 0.12, 0.138]); part(B, cyl(0.21, 0.2, 14), hc, [0, 1.735, 0], [1, 0.02, 1]); }
    else if (hs === 'sunhat') { const c = pick([0xe8d8a8, 0xf2f0ee, 0x2a2a30]); part(B, G.cap, c, [0, 1.72, -0.005], [0.13, 0.12, 0.138]); part(B, cyl(0.26, 0.26, 14), c, [0, 1.75, 0], [1, 0.015, 1]); }
    if (style === 'bay' ? ch(0.6) : ch(0.14)) part(B, G.box, 0x06060a, [0, 1.703, 0.118], [0.2, 0.045, 0.025], 0, 0);
    else if (style === 'city' && ch(0.1)) part(B, G.box, acc, [0, 1.703, 0.118], [0.21, 0.038, 0.025], 0, 1.2);
    if (style !== 'bay' && style !== 'mil' && hs !== 'afro' && hs !== 'beanie' && hs !== 'cap' && ch(0.2)) { part(B, G.arc, 0x16161a, [0, 1.69, 0], [0.142, 0.142, 0.142]); [-1, 1].forEach(s => part(B, cyl(0.045, 0.045), acc, [s * 0.132, 1.68, 0], [1, 0.04, 1], [0, 0, Math.PI / 2], 0.8)); }
    if (style !== 'bay' && style !== 'mil' && ch(0.25)) { part(B, G.box, 0x18161c, [0.03, 1.22, 0.12], [0.03, 0.5, 0.012], [0, 0, 0.75]); part(B, G.box, pick(DARK), [0.18, 0.99, 0.1], [0.17, 0.13, 0.06]); part(B, G.box, acc, [0.18, 1.02, 0.132], [0.12, 0.012, 0.004], 0, 1); }
    // arms (pivot at the shoulder)
    const prop = style === 'mil' ? 'rifle' : style === 'bay' ? (ch(0.3) ? 'cup' : null) : (ch(0.3) ? 'phone' : ch(0.15) ? 'cup' : null);
    [A0, A1].forEach((L, k) => {
      part(L, cyl(0.058, 0.052), sleeve === 'none' ? skin : topC, [0, -0.145, 0], [1, 0.29, 1], 0, sleeve === 'none' ? 0 : topGlow);
      part(L, cyl(0.05, 0.042), sleeve === 'long' ? topC : skin, [0, -0.42, 0], [1, 0.27, 1], 0, sleeve === 'long' ? topGlow : 0);
      if (top === 'jacket') part(L, cyl(0.054, 0.054), acc, [0, -0.54, 0], [1, 0.025, 1], 0, 1.2);
      part(L, G.sph, style === 'mil' ? 0x1a1816 : skin, [0, -0.6, 0.005], [0.042, 0.055, 0.048]);
      if (k === 1 && style === 'mil') { if (o.viewer) part(L, cyl(0.06, 0.06), acc, [0, -0.12, 0], [1, 0.05, 1], 0, 1.1); const gun = 0x16171a, fur = 0x2a2a26;
        part(L, G.box, fur, [0, -0.36, 0.08], [0.05, 0.22, 0.085]); part(L, G.box, gun, [0, -0.66, 0.08], [0.055, 0.38, 0.1]); part(L, G.box, gun, [0, -0.6, -0.01], [0.04, 0.07, 0.15], [-0.25, 0, 0]);
        part(L, G.box, fur, [0, -0.92, 0.08], [0.05, 0.18, 0.075]); part(L, cyl(0.014, 0.014, 6), gun, [0, -1.12, 0.085], [1, 0.24, 1]); part(L, G.box, 0x0c0c0e, [0, -0.66, 0.155], [0.03, 0.09, 0.05]);
        part(L, G.box, 0xff3020, [0, -0.705, 0.155], [0.012, 0.005, 0.012], 0, 2); }
      if (k === 1 && prop === 'phone') { part(L, G.box, 0x101014, [0, -0.63, 0.045], [0.05, 0.095, 0.012]); part(L, G.box, 0x8fe0ff, [0, -0.63, 0.052], [0.043, 0.082, 0.004], 0, 1.6); }
      if (k === 1 && prop === 'cup') { part(L, cyl(0.036, 0.03), 0xf2f0ee, [0, -0.62, 0.045], [1, 0.11, 1]); part(L, cyl(0.038, 0.038), style === 'bay' ? 0xff8a3a : acc, [0, -0.56, 0.045], [1, 0.015, 1], 0, style === 'bay' ? 0 : 0.8); }
    });
    // legs (pivot at the hip)
    [L0, L1].forEach(L => {
      part(L, cyl(0.085, 0.07), pantsC, [0, shorts ? -0.15 : -0.23, 0], [1, shorts ? 0.3 : 0.46, 1]);
      if (shorts) part(L, cyl(0.07, 0.062), skin, [0, -0.38, 0], [1, 0.2, 1]);
      part(L, cyl(0.068, 0.055), shorts ? skin : pantsC, [0, -0.66, 0], [1, 0.4, 1]);
      part(L, G.box, shoeC, [0, -0.885, 0.045], [0.12, 0.085, 0.27]);
      part(L, G.box, soleC, [0, -0.918, 0.045], [0.126, 0.024, 0.28], 0, soleGlow);
    });
    const g = new THREE.Group(), body = new THREE.Mesh(merge(B), mat); g.add(body);
    const limb = (L, x, y) => { const p = new THREE.Group(); p.position.set(x, y, 0); p.add(new THREE.Mesh(merge(L), mat)); g.add(p); return p; };
    const aL = limb(A0, -0.235, 1.44), aR = limb(A1, 0.235, 1.44), lL = limb(L0, -0.1, 0.93), lR = limb(L1, 0.1, 0.93);
    aL.rotation.z = -0.08; aR.rotation.z = 0.08;
    g.userData.rig = { aL, aR, lL, lR, prop }; g.userData.arms = [aL, aR]; g.userData.ph = R() * 7; g.userData.col = '#' + new THREE.Color(acc).getHexString();
    return g;
  }
  // mode: 'walk' (pass step = distance-based phase), 'idle', 'dance', 'cheer', 'dj', 'sit'
  function pose(g, mode, t, ph, step) {
    const r = g.userData.rig; if (!r) return; ph = ph || 0;
    let lL = 0, lR = 0, aL = 0, aR = 0, zL = -0.08, zR = 0.08;
    if (mode === 'walk') { const s = Math.sin(step != null ? step : t * 5 + ph); lL = s * 0.5; lR = -s * 0.5; aL = -s * 0.42; aR = s * 0.42; zL = -0.1; zR = 0.1; }
    else if (mode === 'dance') { const s = Math.sin(t * 7 + ph), c = Math.sin(t * 3.5 + ph), up = Math.sin(t * 0.9 + ph) > 0;
      if (up) { zL = -2.5 - s * 0.3; zR = 2.5 + s * 0.3; } else { aL = -1.3 + c * 0.9; aR = -1.3 - c * 0.9; zL = -0.3; zR = 0.3; } lL = Math.max(0, s) * -0.35; lR = Math.max(0, -s) * -0.35; }
    else if (mode === 'cheer') { const s = Math.sin(t * 9 + ph); zL = -2.6 - s * 0.25; zR = 2.6 + s * 0.25; }
    else if (mode === 'dj') { aL = -1.05 + Math.sin(t * 8 + ph) * 0.12; aR = -1.15 + Math.sin(t * 4 + ph) * 0.2; zL = -0.15; zR = 0.15; }
    else if (mode === 'sit') { lL = lR = -1.45; aL = aR = -0.55; zL = -0.15; zR = 0.15; }
    else { const s = Math.sin(t * 1.1 + ph); aL = s * 0.05; aR = -s * 0.05; zL = -0.1 - Math.max(0, Math.sin(t * 0.3 + ph)) * 0.06; zR = 0.1; }
    if (r.prop === 'rifle') { if (mode === 'aim') { const sw = Math.sin(t * 0.7 + ph) * 0.04; aR = -1.5 + sw; zR = 0.06; aL = -1.42 + sw; zL = 0.62; }
      else if (mode !== 'dance' && mode !== 'cheer') { aR = -0.62; zR = 0.06; aL = -0.95; zL = 0.55; } }
    else if (r.prop && mode !== 'dance' && mode !== 'cheer') { aR = r.prop === 'phone' ? -1.2 : -0.9 + Math.max(0, Math.sin(t * 0.5 + ph)) * -0.6; zR = 0.22; }
    r.lL.rotation.x = lL; r.lR.rotation.x = lR; r.aL.rotation.set(aL, 0, zL); r.aR.rotation.set(aR, 0, zR);
  }
  return { make, pose, hash, swap, mat };
})();
function spawnCitizen(user, color) {
  if (spawned.find(s => s.user === user)) { toast(user + ' is already in the city'); return; }
  if (spawned.length >= 40) { const old = spawned.shift(); scene.remove(old.o); }
  const col = new THREE.Color(color || '#ff2d8f');
  const g = NPC.make({ style: 'city', col: col.getHex(), viewer: true, seed: NPC.hash(user) });
  g.add(nameSprite(user, '#' + col.getHexString()));
  const side = Math.random() < 0.5 ? -1 : 1, dir = Math.random() < 0.5 ? 1 : -1;
  g.position.set(side * (10 + Math.random() * 1.6), 0.25, dir > 0 ? -70 : 70);
  g.rotation.y = dir > 0 ? 0 : Math.PI;
  scene.add(g);
  const w = { o: g, y0: 0.25, walk: true, dir, speed: 1.4, ph: Math.random() * 10, dance: 0, user, born: performance.now(), state: 'street' };
  spawned.push(w);
  featured = w; featuredT = 0;
  toast(user + ' just arrived in Lucid State City');
}
function updateWalkers(dt, t) {
  const all = citizens.concat(spawned);
  const party = t < danceUntil;
  all.forEach(w => {
    const o = w.o, x0 = o.position.x, z0 = o.position.z; walkerStep(w, dt, t, party);
    if (o.userData.rig) { const mv = Math.hypot(o.position.x - x0, o.position.z - z0) / Math.max(dt, 1e-3); w.step = (w.step || 0) + mv * dt * 2.7;
      const dancing = w.dance > t || w.role === 'dancer' || (party && (w.state === 'inside' || w.role));
      NPC.pose(o, dancing ? 'dance' : w.role === 'crowd' ? 'cheer' : w.role === 'dj' ? 'dj' : mv > 0.2 ? 'walk' : 'idle', t, w.ph, w.step); }
  });
  function walkerStep(w, dt, t, party) {
    const o = w.o; if (w.guided) return;
    if (w.state === 'street' && performance.now() - w.born > 90000) sendToClub(w);   // viewers head into Zero Cool after 90s
    if (w.state === 'entering') {
      if (stepTo(w, w.path[0], 2.0, dt)) { w.path.shift(); if (!w.path.length) { w.state = 'inside'; w.zone = w.dest; w.idleT = 4 + Math.random() * 8; } }
      o.position.y = w.y0 + Math.abs(Math.sin(t * 8 + w.ph)) * 0.07;
      return;
    }
    if (w.state === 'inside') {
      if (party || w.dance > t) { o.position.y = w.y0 + Math.abs(Math.sin(t * 7 + w.ph)) * 0.45; o.rotation.y += dt * 2.5; return; }
      w.idleT -= dt;
      if (w.idleT < 0) { if (!w.goal) { const sp = SPOTS[w.zone || 'zc']; w.goal = sp[Math.random() * sp.length | 0].clone(); } if (stepTo(w, w.goal, 1.2, dt)) { w.goal = null; w.idleT = 5 + Math.random() * 10; } }
      o.position.y = w.y0 + Math.abs(Math.sin(t * 4 + w.ph)) * 0.12;
      return;
    }
    if (w.role) {
      if (w.role === 'dancer' || party) { o.position.y = w.y0 + Math.abs(Math.sin(t * (party ? 7 : 4.2) + w.ph)) * (party ? 0.45 : 0.18); o.rotation.y += dt * (party ? 2.5 : 0.6) * Math.sin(w.ph + t * 0.3); }
      else if (w.role === 'dj') { o.position.y = w.y0 + Math.abs(Math.sin(t * 4.2)) * 0.08; }
      else if (w.role === 'crowd') { o.position.y = w.y0 + Math.max(0, Math.sin(t * 3.1 + w.ph)) ** 3 * 0.35; }     // hype jumps at the fight stage
      else if (w.role === 'player') { o.rotation.z = Math.sin(t * 9 + w.ph) * 0.03; }
      else { o.position.y = w.y0 + Math.sin(t * 1.3 + w.ph) * 0.015; }
      return;
    }
    if (w.dance > t) {
      o.position.y = w.y0 + Math.abs(Math.sin(t * 7 + w.ph)) * 0.45;
      o.rotation.y += dt * 2.5;
      return;
    }
    if (w.walk) {
      o.position.z -= w.dir * w.speed * dt * -1;
      if (o.position.z > 88) o.position.z = -88; else if (o.position.z < -88) o.position.z = 88;
      // pause at cross streets so people don't stroll through traffic
      o.position.y = w.y0 + Math.abs(Math.sin(t * 5.5 * w.speed + w.ph)) * 0.07;
      o.rotation.y = (w.dir > 0 ? 0 : Math.PI) + Math.sin(t * 2.75 * w.speed + w.ph) * 0.06;
    } else {
      o.position.y = w.y0 + Math.sin(t * 1.3 + w.ph) * 0.015;
      o.rotation.y += Math.sin(t * 0.4 + w.ph) * dt * 0.15;
    }
  }
  // spawned viewers leave after 5 minutes
  for (let i = spawned.length - 1; i >= 0; i--) if (performance.now() - spawned[i].born > 600000) { scene.remove(spawned[i].o); spawned.splice(i, 1); }
}

// ---------------------------------------------------------------- SPACE + PLANET: two extra parts of the map (own scenes, same live screens), with warp transitions
const ZONES = { cur: 'city' };
const renderPass = composer.passes[0];
const zRand = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
function zNoise(seed) {
  const R = zRand(seed), p = new Uint8Array(512), perm = []; for (let i = 0; i < 256; i++) perm.push(i);
  for (let i = 255; i > 0; i--) { const j = (R() * (i + 1)) | 0; [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const h = (a, b) => p[(a & 255) + p[b & 255]] / 255, a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
}
const zFbm = (n, x, y, o) => { let s = 0, a = 0.5, f = 1, w = 0; for (let i = 0; i < o; i++) { s += n(x * f, y * f) * a; w += a; a *= 0.5; f *= 2.03; } return s / w; };
const zSeam = (n, u, v, sc, o) => (1 - u) * zFbm(n, u * sc, v * sc, o) + u * zFbm(n, (u - 1) * sc, v * sc, o);      // wraps around a sphere with no seam
function zCanvasTex(w, h, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return [c, t]; }
function zPixels(c, fn) {                                   // per-pixel painter for planet maps
  const x = c.getContext('2d'), w = c.width, h = c.height, im = x.createImageData(w, h), d = im.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const col = fn(i / w, j / h), k = (j * w + i) * 4; d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = col[3] === undefined ? 255 : col[3]; }
  x.putImageData(im, 0, 0);
}
function zNebula(x, w, h, opt) {                            // deep space: glowing nebula band + thousands of stars
  opt = opt || {}; const R = zRand(opt.seed || 7), sc = w / 2048, top = opt.top || 0, bot = opt.bot || h, mid = opt.mid || h * 0.5, spread = opt.spread || h * 0.13;
  x.fillStyle = opt.bg || '#030109'; x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = 'lighter';
  const cols = opt.cols || ['150,40,230', '235,40,160', '40,140,240', '50,220,220', '120,60,255'];
  for (let i = 0; i < 340; i++) { const u = R(), cx = u * w, cy = mid + Math.sin(u * Math.PI * 4 + 1.3) * spread + (R() - 0.5) * spread * 1.7, r = (24 + R() * 190) * sc;
    if (cy < top || cy > bot) continue; const col = 'rgba(' + cols[i % cols.length] + ',';
    for (const dx of [-w, 0, w]) { const g = x.createRadialGradient(cx + dx, cy, 0, cx + dx, cy, r); g.addColorStop(0, col + (0.03 + R() * 0.08).toFixed(3) + ')'); g.addColorStop(1, col + '0)'); x.fillStyle = g; x.fillRect(cx + dx - r, cy - r, r * 2, r * 2); } }
  x.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 120; i++) { const u = R(), cx = u * w, cy = mid + Math.sin(u * Math.PI * 4 + 1.3) * spread + (R() - 0.5) * spread, r = (10 + R() * 60) * sc;
    if (cy < top || cy > bot) continue; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(2,1,8,0.35)'); g.addColorStop(1, 'rgba(2,1,8,0)'); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
  x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14000 * (w / 4096); i++) { const sx = R() * w, sy = top + R() * (bot - top), inBand = Math.abs(sy - mid) < spread * 1.5, b = Math.pow(R(), inBand ? 2.2 : 3.2), s = (b > 0.9 ? 2.2 : b > 0.6 ? 1.5 : 1) * sc + 0.4;
    x.fillStyle = `rgba(${200 + R() * 55 | 0},${195 + R() * 60 | 0},255,${(0.2 + b * 0.8).toFixed(2)})`; x.fillRect(sx, sy, s, s); }
  for (let i = 0; i < 70; i++) { const sx = R() * w, sy = top + R() * (bot - top), r = (4 + R() * 9) * sc, c = ['255,255,255', '180,220,255', '255,200,240'][i % 3];
    const g = x.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, 'rgba(' + c + ',0.95)'); g.addColorStop(0.25, 'rgba(' + c + ',0.25)'); g.addColorStop(1, 'rgba(' + c + ',0)'); x.fillStyle = g; x.fillRect(sx - r, sy - r, r * 2, r * 2);
    x.fillStyle = 'rgba(' + c + ',0.35)'; x.fillRect(sx - r * 1.8, sy - 0.5, r * 3.6, 1); x.fillRect(sx - 0.5, sy - r * 1.8, 1, r * 3.6); }
  x.globalCompositeOperation = 'source-over';
}
function zSky(tex, r) { const m = new THREE.Mesh(new THREE.SphereGeometry(r || 1500, 64, 32), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })); m.renderOrder = -10; return m; }
function zStars(n, r, size, seed, color) {
  const R = zRand(seed), g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = R() * 2 - 1, a = R() * Math.PI * 2, s = Math.sqrt(1 - u * u); p.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: color || 0xdfe6ff, size, sizeAttenuation: false, fog: false, transparent: true, depthWrite: false }));
}
function zGlowSprite(col, scale, inner) {
  const [c, t] = zCanvasTex(256, 256); const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, '#ffffff'); g.addColorStop(inner || 0.12, col); g.addColorStop(0.45, col.replace('rgb(', 'rgba(').replace(')', ',0.25)')); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })); s.scale.setScalar(scale); return s;
}
function zAtmo(r, col, power, k) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), new THREE.ShaderMaterial({ uniforms: { c: { value: new THREE.Color(col) }, p: { value: power }, k: { value: k } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 c; uniform float p; uniform float k; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), p) * k; gl_FragColor = vec4(c * f, f); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
}
// ---- planet look-ups (painted a moment after the city loads so the city shows up first)
const PLT = {};
function zPlanetTextures() {
  [PLT.giantC, PLT.giant] = zCanvasTex(1024, 512); [PLT.lucC, PLT.luc] = zCanvasTex(1024, 512); [PLT.lucEC, PLT.lucE] = zCanvasTex(1024, 512);
  [PLT.iceC, PLT.ice] = zCanvasTex(512, 256); [PLT.redC, PLT.red] = zCanvasTex(512, 256); [PLT.ringC, PLT.ring] = zCanvasTex(1024, 16);
  const jobs = [
    () => { const n = zNoise(11), pal = [[255, 196, 150], [236, 128, 112], [196, 84, 150], [120, 62, 150], [250, 222, 186], [214, 106, 92]];
      zPixels(PLT.giantC, (u, v) => { const tb = zSeam(n, u, v, 7, 3), k = (v * 13 + tb * 2.4 + Math.sin(v * 41) * 0.15), i = Math.floor(k) % pal.length, f = k - Math.floor(k), a = pal[(i + pal.length) % pal.length], b = pal[(i + 1) % pal.length];
        const s = 0.82 + zSeam(n, u, v * 3, 22, 2) * 0.35; return [(a[0] + (b[0] - a[0]) * f) * s, (a[1] + (b[1] - a[1]) * f) * s, (a[2] + (b[2] - a[2]) * f) * s]; });
      const x = PLT.giantC.getContext('2d'), g = x.createRadialGradient(700, 330, 0, 700, 330, 46); g.addColorStop(0, 'rgba(255,120,140,0.85)'); g.addColorStop(1, 'rgba(255,120,140,0)'); x.fillStyle = g; x.save(); x.scale(1.8, 1); x.beginPath(); x.arc(700 / 1.8, 330, 46, 0, 7); x.fill(); x.restore();
      PLT.giant.needsUpdate = true; },
    () => { const n = zNoise(23), n2 = zNoise(29), e = PLT.lucEC.getContext('2d').createImageData(1024, 512), ed = e.data;
      zPixels(PLT.lucC, (u, v) => { const h = zSeam(n, u, v, 5, 5), land = h > 0.5, pole = v < 0.07 || v > 0.93, k = ((v * 512 | 0) * 1024 + (u * 1024 | 0)) * 4;
        if (land && !pole) { const c = zSeam(n2, u, v, 26, 3); if (c > 0.58) { const pink = c > 0.66; const s = Math.min(1, (c - 0.58) * 9); ed[k] = (pink ? 255 : 60) * s; ed[k + 1] = (pink ? 60 : 230) * s; ed[k + 2] = 255 * s; } }
        ed[k + 3] = 255;
        if (pole) return [215, 200, 245]; if (!land) { const d = 0.6 + h; return [18 * d, 10 * d, 58 * d]; }
        const t = (h - 0.5) * 4; return [70 + t * 60, 30 + t * 30, 110 + t * 50]; });
      PLT.lucEC.getContext('2d').putImageData(e, 0, 0); PLT.luc.needsUpdate = true; PLT.lucE.needsUpdate = true; },
    () => { const n = zNoise(31); zPixels(PLT.iceC, (u, v) => { const s = 0.7 + zSeam(n, u, v, 8, 4) * 0.4; return [185 * s, 208 * s, 238 * s]; });
      const x = PLT.iceC.getContext('2d'), R = zRand(5); for (let i = 0; i < 70; i++) { const cx = R() * 512, cy = 20 + R() * 216, r = 2 + Math.pow(R(), 2) * 16;
        x.fillStyle = 'rgba(70,90,130,0.35)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.strokeStyle = 'rgba(240,248,255,0.5)'; x.lineWidth = 1; x.beginPath(); x.arc(cx - 0.5, cy - 0.5, r, 3.6, 5.6); x.stroke(); }
      PLT.ice.needsUpdate = true;
      const n2 = zNoise(37); zPixels(PLT.redC, (u, v) => { const s = 0.6 + zSeam(n2, u, v, 6, 4) * 0.6, b = 0.9 + Math.sin(v * 30 + zSeam(n2, u, v, 3, 2) * 4) * 0.1; return [190 * s * b, 82 * s * b, 52 * s * b]; }); PLT.red.needsUpdate = true;
      const r = PLT.ringC.getContext('2d'), R2 = zRand(9); for (let i = 0; i < 1024; i++) { const a = (0.25 + R2() * 0.6) * (i < 30 || i > 1000 ? 0.3 : 1) * (i > 420 && i < 470 ? 0.12 : 1), c = R2() < 0.5 ? '255,214,190' : '230,150,200';
        r.fillStyle = `rgba(${c},${a.toFixed(2)})`; r.fillRect(i, 0, 1, 16); } PLT.ring.needsUpdate = true; } ];
  let i = 0; const run = () => { if (i < jobs.length) { try { jobs[i++](); } catch (e) { console.warn('planet paint', e); } setTimeout(run, 60); } }; setTimeout(run, 1200);
}
function zRing(inner, outer) {
  const g = new THREE.RingGeometry(inner, outer, 160, 1), pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) { const r = Math.hypot(pos.getX(i), pos.getY(i)); uv.setXY(i, (r - inner) / (outer - inner), 0.5); }
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: PLT.ring, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, opacity: 0.95 }));
}
function zGiant(r) {           // ringed gas giant, seen from space and from the planet's sky
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(r, 96, 48), new THREE.MeshStandardMaterial({ map: PLT.giant, color: 0xc8bcc8, roughness: 1, metalness: 0, fog: false })); g.add(body);
  const at = zAtmo(r * 1.015, 0xff9ac0, 3.2, 0.9); at.material.fog = false; g.add(at);
  const ring = zRing(r * 1.3, r * 2.25); ring.rotation.x = -Math.PI / 2; g.add(ring);
  g.rotation.set(0.42, 0, -0.32); g.userData.body = body; return g;
}
function zBall(r, map, opt) {
  opt = opt || {}; const m = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), new THREE.MeshStandardMaterial({ map, roughness: 1, metalness: 0, fog: false, emissive: opt.emissiveMap ? 0xffffff : 0x000000, emissiveMap: opt.emissiveMap || null, emissiveIntensity: opt.ei || 1 }));
  const g = new THREE.Group(); g.add(m); if (opt.atmo) { const a = zAtmo(r * 1.02, opt.atmo, 2.6, opt.ak || 1.4); a.material.fog = false; g.add(a); } g.userData.body = m; return g;
}
// ---- screens: same live textures as the city screens (gameplay, cam, chat, commands)
let zBackMat = null;
function zScreenBack() {                    // the back of every space/planet screen: neon Lucid State City logo
  if (zBackMat) return zBackMat;
  const [c, t] = zCanvasTex(1024, 576), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 1024, 576);
  g.addColorStop(0, '#0a0618'); g.addColorStop(1, '#16062a'); x.fillStyle = g; x.fillRect(0, 0, 1024, 576);
  x.strokeStyle = 'rgba(56,232,255,0.25)'; x.lineWidth = 2; for (let i = 0; i < 1024; i += 48) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 576); x.stroke(); } for (let j = 0; j < 576; j += 48) { x.beginPath(); x.moveTo(0, j); x.lineTo(1024, j); x.stroke(); }
  x.textAlign = 'center'; x.font = '150px Anton, Impact, sans-serif'; x.shadowColor = '#ff2d8f'; x.shadowBlur = 30; x.fillStyle = '#fff'; x.fillText('LUCID', 512, 250); x.fillText('STATE CITY', 512, 400);
  x.font = 'bold 40px Poppins, sans-serif'; x.shadowColor = '#38e8ff'; x.fillStyle = '#38e8ff'; x.fillText('twitch.tv/lucidstatecity', 512, 490);
  x.strokeStyle = '#ff2d8f'; x.lineWidth = 8; x.shadowBlur = 20; x.strokeRect(20, 20, 984, 536); t.needsUpdate = true;
  const dark = new THREE.MeshBasicMaterial({ color: 0x07050e });
  zBackMat = [dark, dark, dark, dark, dark, new THREE.MeshBasicMaterial({ map: t })]; return zBackMat;
}
function zScreen(type, name, w, h, zone, frameCol) {
  const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));      // same UV flip as the Blender screens
  const m = new THREE.Mesh(geo, screens[type][0] ? screens[type][0].material : new THREE.MeshBasicMaterial({ color: 0x111111 }));
  m.name = name; m.userData.zone = zone; m.position.z = 0.36; screens[type].push(m);
  const g = new THREE.Group(); g.add(m);
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.9, h + 0.9, 0.6), zScreenBack()); g.add(back);
  const fm = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(frameCol), emissiveIntensity: 1.5 }); g.userData.frameMat = fm;
  [[0, h / 2 + 0.42, w + 0.9, 0.12], [0, -h / 2 - 0.42, w + 0.9, 0.12], [-w / 2 - 0.42, 0, 0.12, h + 0.9], [w / 2 + 0.42, 0, 0.12, h + 0.9]].forEach(([x, y, bw, bh]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.66), fm); b.position.set(x, y, 0); g.add(b); });
  return g;
}
function zSign(top, sub, col, w) {
  const [c, t] = zCanvasTex(1024, 256), x = c.getContext('2d'); x.textAlign = 'center';
  x.font = '120px Anton, Impact, sans-serif'; x.shadowColor = col; x.shadowBlur = 28; x.fillStyle = '#fff'; x.fillText(top, 512, 130);
  x.font = 'bold 50px Poppins, sans-serif'; x.shadowBlur = 16; x.fillStyle = col; x.fillText(sub, 512, 214);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false }));
}
// ---- floating / hopping people (viewers who typed !spawn get their name over their helmet)
const zSuit = new THREE.MeshStandardMaterial({ color: 0xe6e8f2, roughness: 0.55, metalness: 0.15 }), zDark = new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.7 });
const zHelmetGeo = new THREE.SphereGeometry(0.27, 16, 12), zPackGeo = new THREE.BoxGeometry(0.42, 0.55, 0.22), zArmGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.62, 6);
function zAstro(color, name) {
  const col = new THREE.Color(color || ['#ff2d8f', '#38e8ff', '#b478ff', '#ffd23a', '#7dff6a'][Math.random() * 5 | 0]), g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const accent = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.1, roughness: 0.5 });
  const b = new THREE.Mesh(bodyGeo, zSuit); b.position.y = 1.2; inner.add(b);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.08, 10), accent); band.position.y = 1.32; inner.add(band);
  const hm = new THREE.Mesh(zHelmetGeo, zSuit); hm.position.y = 1.78; inner.add(hm);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x080612, emissive: col, emissiveIntensity: 0.55, roughness: 0.1, metalness: 0.9 }));
  visor.position.set(0, 1.79, 0.1); inner.add(visor);
  const pack = new THREE.Mesh(zPackGeo, zDark); pack.position.set(0, 1.25, -0.3); inner.add(pack);
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.12, 8), accent); jet.position.set(0, 0.92, -0.3); inner.add(jet);
  [-0.34, 0.34].forEach((x, i) => { const a = new THREE.Mesh(zArmGeo, zSuit); a.position.set(x, 1.24, 0); a.rotation.z = (i ? -1 : 1) * 0.5; inner.add(a); });
  [-0.12, 0.12].forEach(x => { const l = new THREE.Mesh(legGeo, zSuit); l.position.set(x, 0.43, 0); inner.add(l); });
  inner.position.y = -1.1;
  if (name) { const s = nameSprite(name, '#' + col.getHexString()); s.position.y = 1.4; g.add(s); }
  g.userData.inner = inner; return g;
}
// ---- warp tunnel (between places)
const WARP = { scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(95, 16 / 9, 0.1, 1200), n: 1900 };
{ WARP.scene.background = new THREE.Color(0x020108);
  const g = new THREE.BufferGeometry(); WARP.pos = new Float32Array(WARP.n * 6); WARP.col = new Float32Array(WARP.n * 6); WARP.seed = [];
  const R = zRand(3); for (let i = 0; i < WARP.n; i++) WARP.seed.push({ a: R() * Math.PI * 2, r: 2.5 + Math.pow(R(), 0.6) * 46, z: -R() * 640, c: R() });
  g.setAttribute('position', new THREE.BufferAttribute(WARP.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(WARP.col, 3));
  WARP.lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); WARP.scene.add(WARP.lines);
  WARP.core = zGlowSprite('rgb(160,120,255)', 260, 0.08); WARP.core.position.z = -420; WARP.scene.add(WARP.core);
  WARP.clouds = []; for (let i = 0; i < 46; i++) { const s = zGlowSprite('rgb(255,120,60)', 30 + R() * 40, 0.02); s.material.opacity = 0.0; s.userData = { a: R() * 7, r: 12 + R() * 40, z: -R() * 640 }; WARP.scene.add(s); WARP.clouds.push(s); } }
function warpColors(to) { return { space: [[0.65, 0.8, 1], [1, 1, 1], [0.7, 0.45, 1]], planet: [[1, 0.5, 0.2], [1, 0.2, 0.55], [1, 0.82, 0.3]], city: [[0.22, 0.9, 1], [1, 0.18, 0.56], [0.7, 0.47, 1]], bay: [[1, 0.6, 0.3], [1, 0.3, 0.6], [0.4, 0.9, 1]], summit: [[1, 0.3, 0.2], [1, 0.7, 0.3], [0.9, 0.4, 1]], hollow: [[0.7, 0.7, 0.7], [1, 0.15, 0.1], [0.5, 0.8, 0.5]], zero: [[1, 0.6, 0.25], [0.9, 0.8, 0.6], [1, 0.3, 0.15]], abyss: [[0.1, 0.9, 0.8], [0.3, 0.6, 1], [0.7, 1, 0.95]] }[to]; }
function warpTick(dt, speed, to) {
  const C = warpColors(to), len = Math.min(90, 3 + speed * 0.06);
  for (let i = 0; i < WARP.n; i++) { const s = WARP.seed[i]; s.z += speed * dt; if (s.z > 2) s.z -= 640;
    const x = Math.cos(s.a) * s.r, y = Math.sin(s.a) * s.r, c = C[(s.c * 3) | 0];
    WARP.pos.set([x, y, s.z, x, y, s.z - len], i * 6); WARP.col.set([c[0], c[1], c[2], c[0] * 0.08, c[1] * 0.08, c[2] * 0.08], i * 6); }
  WARP.lines.geometry.attributes.position.needsUpdate = true; WARP.lines.geometry.attributes.color.needsUpdate = true;
  WARP.cam.rotation.z += dt * 0.7;
  WARP.core.material.color.setRGB(C[0][0], C[0][1], C[0][2]); WARP.core.scale.setScalar(200 + Math.sin(performance.now() / 120) * 30);
  WARP.clouds.forEach(s => { const u = s.userData; u.z += speed * 0.8 * dt; if (u.z > 2) u.z -= 640; s.position.set(Math.cos(u.a) * u.r, Math.sin(u.a) * u.r, u.z); s.material.opacity = to === 'planet' ? 0.55 : 0; });
}
// ---- flash + whoosh
const zFlash = document.createElement('div'); zFlash.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:7;opacity:0;background:radial-gradient(circle at 50% 50%,#fff 0%,rgba(255,255,255,.85) 35%,rgba(200,170,255,.6) 100%)'; document.body.appendChild(zFlash);
function flash(peak, sec) { zFlash.style.transition = 'none'; zFlash.style.opacity = peak; void zFlash.offsetWidth; zFlash.style.transition = `opacity ${sec || 0.9}s ease-out`; zFlash.style.opacity = 0; }
let zAC = null;
function whoosh(len) {
  try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); if (zAC.state === 'suspended') zAC.resume(); const a = zAC, t0 = a.currentTime + 0.02;
    const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * len, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(140, t0); f.frequency.exponentialRampToValueAtTime(3200, t0 + len * 0.55); f.frequency.exponentialRampToValueAtTime(260, t0 + len);
    const g = a.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.28, t0 + len * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    n.buffer = b; n.connect(f); f.connect(g); g.connect(a.destination); n.start(t0);
    const o = a.createOscillator(), lp = a.createBiquadFilter(), og = a.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(38, t0); o.frequency.exponentialRampToValueAtTime(110, t0 + len * 0.6);
    lp.type = 'lowpass'; lp.frequency.value = 220; og.gain.setValueAtTime(0.0001, t0); og.gain.exponentialRampToValueAtTime(0.1, t0 + len * 0.4); og.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    o.connect(lp); lp.connect(og); og.connect(a.destination); o.start(t0); o.stop(t0 + len); } catch (e) {}
}
// ---------------------------------------------------------------- SPACE: orbital station with floating screens, people drifting, planets all around
const SP = { scene: new THREE.Scene(), float: [], viewers: {}, scr: [] };
function buildSpace() {
  const S = SP.scene; S.fog = new THREE.FogExp2(0x05030c, 0.0009);
  const [nc, nt] = zCanvasTex(4096, 2048); zNebula(nc.getContext('2d'), 4096, 2048, { seed: 7 }); nt.needsUpdate = true; S.add(zSky(nt));
  SP.st1 = zStars(2600, 1300, 1.6, 41); SP.st2 = zStars(700, 1300, 2.6, 43, 0xffe6f6); S.add(SP.st1, SP.st2);
  S.add(new THREE.HemisphereLight(0x6a5ad8, 0x10081a, 0.5));
  const sunDir = new THREE.Vector3(0.62, 0.3, 0.72).normalize(), sun = new THREE.DirectionalLight(0xfff0e0, 1.15); sun.position.copy(sunDir).multiplyScalar(100); S.add(sun);
  const sunS = zGlowSprite('rgb(255,214,170)', 420, 0.06); sunS.position.copy(sunDir).multiplyScalar(1250); S.add(sunS);
  const flare = zGlowSprite('rgb(255,120,200)', 900, 0.01); flare.material.opacity = 0.35; flare.position.copy(sunS.position); S.add(flare);
  [[0xff2d8f, -16, 10, 10], [0x38e8ff, 16, 10, 10], [0xb478ff, 0, 18, -6]].forEach(([c, x, y, z]) => { const L = new THREE.PointLight(c, 1.6, 60, 2); L.position.set(x, y, z); S.add(L); });
  // planets
  SP.giant = zGiant(230); SP.giant.position.set(-520, 70, -880); S.add(SP.giant);
  SP.luc = zBall(120, PLT.luc, { emissiveMap: PLT.lucE, ei: 1.1, atmo: 0xff4fd8, ak: 1.1 }); SP.luc.position.set(430, -95, -600); SP.luc.rotation.z = 0.25; S.add(SP.luc);
  SP.ice = zBall(42, PLT.ice, { atmo: 0x9fd8ff, ak: 0.9 }); SP.ice.position.set(160, 190, -1050); S.add(SP.ice);
  SP.red = zBall(28, PLT.red, { atmo: 0xff7a4a, ak: 0.8 }); SP.red.position.set(820, 40, 260); S.add(SP.red);
  const moonlet = zBall(16, PLT.ice); moonlet.position.set(-300, -160, 520); S.add(moonlet);
  // asteroid belt
  { const R = zRand(17), geo = new THREE.IcosahedronGeometry(1, 0), p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.7 + R() * 0.6), p.getY(i) * (0.7 + R() * 0.6), p.getZ(i) * (0.7 + R() * 0.6)); geo.computeVertexNormals();
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0x5a5068, roughness: 0.95, flatShading: true }), 520), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < 520; i++) { const a = R() * Math.PI * 2, r = 120 + R() * 70, s = 0.3 + Math.pow(R(), 3) * 3.2; e.set(R() * 6, R() * 6, R() * 6); q.setFromEuler(e);
      m.compose(new THREE.Vector3(Math.cos(a) * r, (R() - 0.5) * 9 - 8, Math.sin(a) * r), q, new THREE.Vector3(s, s, s)); im.setMatrixAt(i, m); }
    SP.belt = new THREE.Group(); SP.belt.add(im); SP.belt.rotation.x = 0.12; S.add(SP.belt); }
  // the station: platform, rings, screens
  { const [gc, gt] = zCanvasTex(512, 512); const x = gc.getContext('2d'); x.fillStyle = '#07060f'; x.fillRect(0, 0, 512, 512); x.strokeStyle = 'rgba(56,232,255,0.55)'; x.lineWidth = 2;
    for (let i = 0; i <= 512; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
    x.strokeStyle = 'rgba(255,45,143,0.8)'; x.lineWidth = 6; x.beginPath(); x.arc(256, 256, 200, 0, 7); x.stroke(); x.beginPath(); x.arc(256, 256, 120, 0, 7); x.stroke(); gt.needsUpdate = true;
    const top = new THREE.MeshStandardMaterial({ color: 0x0c0a16, emissive: 0xffffff, emissiveMap: gt, emissiveIntensity: 0.55, map: gt, roughness: 0.4, metalness: 0.7 });
    const side = new THREE.MeshStandardMaterial({ color: 0x14121e, roughness: 0.4, metalness: 0.85 });
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(24, 20, 1.6, 64), [side, top, side]); plat.position.y = -9; S.add(plat);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(24, 0.22, 8, 128), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xff2d8f, emissiveIntensity: 3 })); edge.rotation.x = Math.PI / 2; edge.position.y = -8.2; S.add(edge);
  }
  SP.rings = [];
  [[34, 0x38e8ff, 0.35, 0.12], [38, 0xff2d8f, -0.25, -0.08], [42, 0xb478ff, 0.15, 0.05]].forEach(([r, c, tx, sp]) => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.09, 6, 200), new THREE.MeshStandardMaterial({ color: 0, emissive: c, emissiveIntensity: 1.3 }));
    t.rotation.set(Math.PI / 2 + tx, 0, 0); t.userData.sp = sp; S.add(t); SP.rings.push(t); });
  const add = (g, x, y, z, ry) => { g.position.set(x, y, z); g.rotation.y = ry; g.userData.base = g.position.clone(); g.userData.ph = Math.random() * 6; S.add(g); SP.scr.push(g); };
  add(zScreen('GAMEPLAY', 'SCREEN_GAMEPLAY_SPACE', 19.2, 10.8, 'space', 0xff2d8f), 0, 5.4, 0, 0);
  add(zScreen('LIVECAM', 'SCREEN_LIVECAM_SPACE', 9.6, 5.4, 'space', 0x38e8ff), -16.5, 6.5, 4.5, 0.55);
  add(zScreen('CHAT', 'SCREEN_CHAT_SPACE', 9.6, 5.4, 'space', 0xb478ff), 16.5, 6.5, 4.5, -0.55);
  add(zScreen('COMMANDS', 'SCREEN_COMMANDS_SPACE', 8.8, 4.95, 'space', 0x38e8ff), 0, -3.6, 1.5, 0);
  const sign = zSign('LUCID STATE CITY', 'ORBITAL STATION', '#ff2d8f', 18); sign.position.set(0, 14.3, 0.4); S.add(sign); SP.sign = sign;
  // drifting people
  const R = zRand(55); for (let i = 0; i < 26; i++) { const o = zAstro(); S.add(o); SP.float.push({ o, r: 9 + R() * 16, a: R() * 7, y: -6 + R() * 22, sp: (R() < 0.5 ? -1 : 1) * (0.03 + R() * 0.06), tum: new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.8), ph: R() * 7 }); }
  // shooting stars
  SP.shoot = []; for (let i = 0; i < 3; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false })); S.add(l); SP.shoot.push({ l, t: 3 + i * 4, p: new THREE.Vector3(), v: new THREE.Vector3() }); }
}
function syncViewers(Z, scn, mk) {                         // viewers who typed !spawn show up here too
  const live = new Set(spawned.map(w => w.user));
  Object.keys(Z.viewers).forEach(u => { if (!live.has(u)) { scn.remove(Z.viewers[u].o); delete Z.viewers[u]; } });
  spawned.forEach(w => { if (Z.viewers[w.user]) return; let col = w.o.userData.col || '#ff2d8f'; w.o.traverse(o => { if (o.isMesh && o.material && o.material.emissive && o.material.emissiveIntensity > 0.5 && !w.o.userData.col && col === '#ff2d8f') col = '#' + o.material.emissive.getHexString(); });
    const o = zAstro(col, w.user); scn.add(o); Z.viewers[w.user] = mk(o); });
}
function spaceTick(dt, t) {
  SP.rings.forEach(r => r.rotation.z += dt * r.userData.sp);
  SP.belt.rotation.y += dt * 0.012; SP.giant.userData.body.rotation.y += dt * 0.006; SP.luc.userData.body.rotation.y += dt * 0.01; SP.ice.rotation.y += dt * 0.02;
  SP.st2.material.opacity = 0.65 + Math.sin(t * 2.3) * 0.35; SP.st1.material.opacity = 0.85 + Math.sin(t * 1.7 + 1) * 0.15;
  SP.scr.forEach(g => { g.position.y = g.userData.base.y + Math.sin(t * 0.45 + g.userData.ph) * 0.18; });
  SP.sign.position.y = 14.3 + Math.sin(t * 0.7) * 0.25;
  if ((SP.syncT = (SP.syncT || 0) - dt) <= 0) { SP.syncT = 3; syncViewers(SP, SP.scene, o => ({ o, r: 10 + Math.random() * 13, a: Math.random() * 7, y: -4 + Math.random() * 14, sp: 0.05, tum: new THREE.Vector3(0.1, 0.3, 0.05), ph: Math.random() * 7, viewer: true })); }
  SP.float.concat(Object.values(SP.viewers)).forEach(f => { f.a += dt * f.sp; const o = f.o;
    o.position.set(Math.cos(f.a) * f.r, f.y + Math.sin(t * 0.4 + f.ph) * 1.2, Math.sin(f.a) * f.r + 3);
    const i = o.userData.inner; i.rotation.x += dt * f.tum.x; i.rotation.y += dt * f.tum.y; i.rotation.z += dt * f.tum.z; if (f.viewer) o.lookAt(cam.position.x, o.position.y, cam.position.z); });
  SP.shoot.forEach(s => { s.t -= dt; const m = s.l.material;
    if (s.t <= 0) { s.t = 5 + Math.random() * 8; const a = Math.random() * Math.PI * 2; s.p.set(Math.cos(a) * 700, 150 + Math.random() * 350, Math.sin(a) * 700); s.v.set(-Math.cos(a) * 600 + (Math.random() - 0.5) * 300, -180, -Math.sin(a) * 600); s.life = 1.1; }
    if (s.life > 0) { s.life -= dt; s.p.addScaledVector(s.v, dt); const p = s.l.geometry.attributes.position; p.setXYZ(0, s.p.x, s.p.y, s.p.z); p.setXYZ(1, s.p.x - s.v.x * 0.12, s.p.y - s.v.y * 0.12, s.p.z - s.v.z * 0.12); p.needsUpdate = true; m.opacity = Math.max(0, Math.min(1, s.life * 2)); } else m.opacity = 0; });
}
// ---------------------------------------------------------------- PLANET "LUCIDA": neon crystal world with a giant ringed planet, moons and auroras in the sky
const PL = { scene: new THREE.Scene(), hop: [], viewers: {}, scr: [] };
const plN = zNoise(71), plN2 = zNoise(73);
function plH(x, z) {                        // ground height (flat landing plaza in the middle, mountains far away)
  const d = Math.hypot(x, z), k = Math.min(1, Math.max(0, (d - 34) / 46)), base = (zFbm(plN, x * 0.012, z * 0.012, 5) - 0.5) * 16 * k;
  const far = Math.max(0, d - 230) / 470; return base + Math.pow(Math.max(0, zFbm(plN2, x * 0.006, z * 0.006, 4) - 0.32), 1.2) * 240 * far * far + far * 20;
}
function buildPlanet() {
  const S = PL.scene; S.fog = new THREE.FogExp2(0x2a1046, 0.0031);
  const [sc, st] = zCanvasTex(4096, 2048), x = sc.getContext('2d');
  zNebula(x, 4096, 2048, { seed: 19, top: 0, bot: 1024, mid: 560, spread: 160, cols: ['170,50,230', '255,60,170', '60,150,255', '80,230,220'] });
  const hz = x.createLinearGradient(0, 700, 0, 1100); hz.addColorStop(0, 'rgba(42,16,70,0)'); hz.addColorStop(0.55, 'rgba(110,30,120,0.75)'); hz.addColorStop(0.75, 'rgba(255,90,150,0.55)'); hz.addColorStop(1, 'rgba(42,16,70,1)');
  x.fillStyle = hz; x.fillRect(0, 700, 4096, 400); x.fillStyle = '#2a1046'; x.fillRect(0, 1100, 4096, 948); st.needsUpdate = true; S.add(zSky(st, 1600));
  PL.st = zStars(1800, 1400, 1.7, 61); PL.st.geometry.attributes.position.array.forEach((v, i, a) => { if (i % 3 === 1) a[i] = Math.abs(v) + 40; }); S.add(PL.st);
  S.add(new THREE.HemisphereLight(0x8a6ae0, 0x241030, 0.55));
  const sunDir = new THREE.Vector3(0.82, 0.12, -0.56).normalize(), sun = new THREE.DirectionalLight(0xffb0c8, 1.5); sun.position.copy(sunDir).multiplyScalar(100); S.add(sun);
  const sunS = zGlowSprite('rgb(255,170,200)', 380, 0.05); sunS.position.copy(sunDir).multiplyScalar(1300); S.add(sunS);
  // the sky: giant ringed planet, moons
  PL.giant = zGiant(300); PL.giant.position.set(-430, 430, -860); PL.giant.rotation.set(0.95, 0.45, -0.3); S.add(PL.giant);
  PL.ice = zBall(46, PLT.ice, { atmo: 0x9fd8ff, ak: 1.1 }); PL.ice.position.set(320, 230, -700); S.add(PL.ice);
  PL.red = zBall(24, PLT.red, { atmo: 0xff7a4a, ak: 1 }); PL.red.position.set(620, 160, 420); S.add(PL.red);
  // auroras
  PL.aur = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float t; varying vec2 vU; void main(){ float w = 0.5 + 0.5*sin(vU.x*38.0 + t*1.6 + sin(vU.x*9.0 - t*0.7)*2.0); float a = smoothstep(0.0,0.18,vU.y) * pow(1.0-vU.y,1.6) * (0.35 + 0.65*w) * smoothstep(0.0,0.08,vU.x) * smoothstep(1.0,0.92,vU.x); vec3 c = mix(vec3(0.15,1.0,0.75), vec3(1.0,0.25,0.8), clamp(vU.y*1.3 + 0.25*sin(vU.x*6.0+t*0.3),0.0,1.0)); gl_FragColor = vec4(c*a*0.9, a); }' });
  [[520, 150, -0.5, 1.4], [600, 190, 1.9, 1.1], [560, 130, 3.6, 1.2]].forEach(([R, y, a0, span]) => { const g = new THREE.PlaneGeometry(1, 1, 90, 1), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5, a = a0 + u * span, r = R + Math.sin(u * 9) * 30; p.setXYZ(i, Math.sin(a) * r, y + v * 150, -Math.cos(a) * r); }
    S.add(new THREE.Mesh(g, PL.aur)); });
  // ground
  { const g = new THREE.PlaneGeometry(1500, 1500, 230, 230); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, plH(p.getX(i), p.getZ(i))); g.computeVertexNormals();
    const [vc, vt] = zCanvasTex(512, 512), vx = vc.getContext('2d'), R = zRand(83); vx.fillStyle = '#000'; vx.fillRect(0, 0, 512, 512); vx.lineCap = 'round';
    for (let i = 0; i < 26; i++) { let px = R() * 512, py = R() * 512; vx.strokeStyle = R() < 0.6 ? 'rgba(60,230,255,0.9)' : 'rgba(255,60,180,0.9)'; vx.lineWidth = 1 + R() * 2; vx.beginPath(); vx.moveTo(px, py);
      for (let k = 0; k < 6; k++) { px += (R() - 0.5) * 120; py += (R() - 0.5) * 120; vx.lineTo(px, py); } vx.stroke(); }
    vt.wrapS = vt.wrapT = THREE.RepeatWrapping; vt.repeat.set(34, 34); vt.needsUpdate = true;
    const [dc, dt2] = zCanvasTex(512, 512), dx = dc.getContext('2d'), n = zNoise(5); const im = dx.createImageData(256, 256);
    const im2 = dx.createImageData(512, 512); for (let j = 0; j < 512; j++) for (let i = 0; i < 512; i++) { const s = 0.55 + zFbm(n, i / 40, j / 40, 4) * 0.7, k = (j * 512 + i) * 4; im2.data[k] = 44 * s; im2.data[k + 1] = 24 * s; im2.data[k + 2] = 72 * s; im2.data[k + 3] = 255; }
    dx.putImageData(im2, 0, 0); dt2.wrapS = dt2.wrapT = THREE.RepeatWrapping; dt2.repeat.set(40, 40); dt2.needsUpdate = true;
    PL.groundMat = new THREE.MeshStandardMaterial({ map: dt2, color: 0xffffff, roughness: 0.82, metalness: 0.12, emissive: 0xffffff, emissiveMap: vt, emissiveIntensity: 0.7, flatShading: true });
    S.add(new THREE.Mesh(g, PL.groundMat)); }
  // crystals
  { const R = zRand(91), geo = new THREE.OctahedronGeometry(1, 0); PL.cry = [];
    [[0xff2d8f, 0.0], [0x38e8ff, 0.35], [0xb478ff, 0.7]].forEach(([c, off]) => { const n = 90, mat = new THREE.MeshStandardMaterial({ color: 0x1a0d26, emissive: c, emissiveIntensity: 0.6, roughness: 0.35, metalness: 0.2, transparent: true, opacity: 0.9 });
      const im = new THREE.InstancedMesh(geo, mat, n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
      for (let i = 0; i < n; i++) { const a = R() * Math.PI * 2, d = i < 8 ? 260 + R() * 160 : 40 + Math.pow(R(), 0.7) * 300, px = Math.cos(a) * d, pz = Math.sin(a) * d, big = i < 8 ? 9 + R() * 10 : 0.5 + Math.pow(R(), 2.5) * 5;
        e.set((R() - 0.5) * 0.6, R() * 6, (R() - 0.5) * 0.6); q.setFromEuler(e); m.compose(new THREE.Vector3(px, plH(px, pz) + big * 1.4, pz), q, new THREE.Vector3(big * 0.38, big * 2.6, big * 0.38)); im.setMatrixAt(i, m); }
      im.userData.off = off; S.add(im); PL.cry.push(im); }); }
  // glowing pools
  { const R = zRand(97); for (let i = 0; i < 9; i++) { const a = R() * Math.PI * 2, d = 45 + R() * 110, px = Math.cos(a) * d, pz = Math.sin(a) * d, r = 3 + R() * 6;
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshStandardMaterial({ color: 0x041820, emissive: 0x2ee6ff, emissiveIntensity: 0.5, roughness: 0.05, metalness: 0.6 })); m.rotation.x = -Math.PI / 2; m.position.set(px, plH(px, pz) + 0.25, pz); S.add(m); } }
  // landing plaza
  { const [pc, pt] = zCanvasTex(1024, 1024), x2 = pc.getContext('2d'); x2.fillStyle = '#0d0a17'; x2.fillRect(0, 0, 1024, 1024); x2.lineWidth = 10;
    [[470, '#ff2d8f'], [380, '#38e8ff'], [250, '#ff2d8f']].forEach(([r, c]) => { x2.strokeStyle = c; x2.beginPath(); x2.arc(512, 512, r, 0, 7); x2.stroke(); });
    x2.fillStyle = '#38e8ff'; x2.font = '150px Anton, Impact, sans-serif'; x2.textAlign = 'center'; x2.fillText('LUCIDA', 512, 560); pt.needsUpdate = true;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(15, 15.6, 0.6, 64), [new THREE.MeshStandardMaterial({ color: 0x15121f, metalness: 0.8, roughness: 0.4 }), new THREE.MeshStandardMaterial({ map: pt, emissive: 0xffffff, emissiveMap: pt, emissiveIntensity: 0.4, roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: 0x15121f })]);
    pad.position.y = 0.3; pad.rotation.y = Math.PI / 2; S.add(pad); }
  [[0xff2d8f, -22, 16, -20], [0x38e8ff, 22, 16, -20], [0xb478ff, 0, 22, -24]].forEach(([c, x3, y, z]) => { const L = new THREE.PointLight(c, 1.1, 55, 2); L.position.set(x3, y, z); S.add(L); });
  const mono = (w, h, x3, z, ry) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.6), new THREE.MeshStandardMaterial({ color: 0x0b0912, roughness: 0.75, metalness: 0.35 })); g.position.set(x3, h / 2, z); g.rotation.y = ry; S.add(g); };
  const add = (g, x3, y, z, ry) => { g.position.set(x3, y, z); g.rotation.y = ry; S.add(g); PL.scr.push(g); };
  mono(3, 7, -9, -13.6, 0); mono(3, 7, 9, -13.6, 0);
  add(zScreen('GAMEPLAY', 'SCREEN_GAMEPLAY_PLANET', 17.6, 9.9, 'planet', 0xff2d8f), 0, 11.5, -13, 0);
  mono(2.2, 5, -19, -6, 0.75); add(zScreen('LIVECAM', 'SCREEN_LIVECAM_PLANET', 8.8, 4.95, 'planet', 0x38e8ff), -19, 7.6, -6, 0.75);
  mono(2.2, 5, 19, -6, -0.75); add(zScreen('CHAT', 'SCREEN_CHAT_PLANET', 8.8, 4.95, 'planet', 0xb478ff), 19, 7.6, -6, -0.75);
  mono(1.6, 2.4, 24, 9, -1.4); add(zScreen('COMMANDS', 'SCREEN_COMMANDS_PLANET', 7.2, 4.05, 'planet', 0x38e8ff), 24, 4.6, 9, -1.4);
  const sign = zSign('LUCIDA', 'LUCID STATE CITY COLONY', '#38e8ff', 16); sign.position.set(0, 19.6, -13); S.add(sign); PL.sign = sign;
  // parked ship
  { const ship = new THREE.Group(), hull = new THREE.MeshStandardMaterial({ color: 0xdfe2ee, metalness: 0.6, roughness: 0.3 }), glow = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xff2d8f, emissiveIntensity: 3 });
    const body = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 12), hull); body.rotation.x = Math.PI / 2; ship.add(body);
    const cock = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshStandardMaterial({ color: 0x101830, emissive: 0x38e8ff, emissiveIntensity: 0.6, metalness: 0.9, roughness: 0.05 })); cock.scale.set(0.8, 0.6, 1.6); cock.position.set(0, 0.8, 0.6); ship.add(cock);
    [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 2.6), hull); w.position.set(s * 2.8, -0.2, -2); w.rotation.z = s * -0.18; ship.add(w);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 2.4), glow); tip.position.set(s * 5.2, -0.65, -2); ship.add(tip); });
    const eng = zGlowSprite('rgb(255,70,170)', 4, 0.1); eng.position.set(0, 0, -4.8); ship.add(eng); PL.eng = eng;
    ship.position.set(-8.5, 2.2, 6); ship.rotation.y = 2.3; S.add(ship); PL.ship = ship; }
  // floating dust
  { const n = 900, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), R = zRand(13); for (let i = 0; i < n; i++) p.set([(R() - 0.5) * 120, R() * 30, (R() - 0.5) * 120], i * 3);
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); PL.dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffb0f0, size: 0.18, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })); S.add(PL.dust); }
  // low-gravity hoppers
  const R = zRand(101); for (let i = 0; i < 14; i++) { const o = zAstro(); S.add(o); PL.hop.push({ o, r: 18 + R() * 22, a: R() * 7, sp: (R() < 0.5 ? -1 : 1) * (0.04 + R() * 0.05), ph: R() * 7, hz: 0.6 + R() * 0.5 }); }
}
function planetTick(dt, t) {
  PL.aur.uniforms.t.value = t; PL.giant.userData.body.rotation.y += dt * 0.004; PL.giant.rotation.y += dt * 0.0015;
  PL.cry.forEach(c => c.material.emissiveIntensity = 0.5 + Math.sin(t * 1.4 + c.userData.off * 6) * 0.2);
  PL.groundMat.emissiveIntensity = 0.6 + Math.sin(t * 0.8) * 0.15;
  PL.eng.scale.setScalar(4 + Math.sin(t * 9) * 0.6); PL.ship.position.y = 2.2 + Math.sin(t * 0.9) * 0.25;
  PL.sign.position.y = 19.6 + Math.sin(t * 0.7) * 0.2;
  const dp = PL.dust.geometry.attributes.position; for (let i = 0; i < dp.count; i++) { let y = dp.getY(i) + dt * 0.6; if (y > 30) y = 0; dp.setY(i, y); } dp.needsUpdate = true;
  if ((PL.syncT = (PL.syncT || 0) - dt) <= 0) { PL.syncT = 3; syncViewers(PL, PL.scene, o => ({ o, r: 16 + Math.random() * 12, a: Math.random() * 7, sp: 0.06, ph: Math.random() * 7, hz: 0.8, viewer: true })); }
  PL.hop.concat(Object.values(PL.viewers)).forEach(h => { h.a += dt * h.sp; const x = Math.cos(h.a) * h.r, z = Math.sin(h.a) * h.r + 4, j = Math.abs(Math.sin(t * h.hz + h.ph));
    h.o.position.set(x, plH(x, z) + 1.15 + j * 1.8, z); h.o.rotation.y = h.a * -1 + (h.sp > 0 ? Math.PI : 0); h.o.userData.inner.rotation.x = (1 - j) * 0.25; });
}
// ---------------------------------------------------------------- camera views + orbit + travel between places
const ZONE_SHOTS = [
  ['space', 'Space station', [0, 5.6, 27], [0, 5, 0], 50], ['space', 'Space wide', [30, 13, 46], [-4, 3, -6], 55], ['space', 'Planets view', [48, 7, 34], [430, -95, -600], 50],
  ['planet', 'Planet landing', [0, 4.6, 19], [0, 8.5, -13], 52], ['planet', 'Planet sky view', [16, 2.6, 26], [-14, 22, -40], 62], ['planet', 'Crystal fields', [44, 7, 34], [0, 9, -8], 55],
  ['bay', 'Bay stage', [0, 6.5, -44], [0, 8.5, 0], 55], ['bay', 'Beach view', [-40, 4.5, -98], [4, 7, -2], 55], ['bay', 'Ocean Drive', [-62, 3.6, -140], [10, 10, -162], 58], ['bay', 'Pier & wheel', [38, 5, -78], [70, 16, -34], 58],
  ['summit', 'Summit arena', [0, 6.5, 27], [0, 3, -6], 55], ['summit', 'Temple', [10, 7.5, 2], [0, 7, -24], 58], ['summit', 'Lava arena', [-53, -8.5, 17], [-64, -11.8, 8], 55],
  ['summit', 'Ice peak', [35, 22.5, -50], [44, 20, -60], 55], ['summit', 'Waterfall', [8, -3, 44], [-8, -6, 62], 55], ['summit', 'Helipad', [22, 5, 30], [38, 2, 16], 55],
  ['hollow', 'Hollow square', [0, 6, 34], [0, 6, -12], 58], ['hollow', 'Mansion gate', [10, 21, -50], [0, 25, -92], 58], ['hollow', 'Graveyard', [18, 4.5, 15], [45, 1.2, 8], 58],
  ['hollow', 'Church', [30, 5, 3], [42, 17, -20], 60], ['hollow', 'Castle woods', [-40, 8, -16], [-110, 42, -60], 55], ['hollow', 'Bus stop', [-4, 3, 52], [9.6, 2, 44], 55],
  ['zero', 'Firebase', [0, 6.5, 20], [0, 6, -12], 62], ['zero', 'Operator vault', [-8.5, 4.6, 9], [-21, 4.6, 9], 52], ['zero', 'Overlook', [-28, 15, 28], [6, 2, -16], 60], ['zero', 'Airfield', [20, 4, 7], [36, 2.5, -6], 55],
  ['zero', 'Ruins', [-38, 3, 14], [-72, 8, -8], 58], ['zero', 'Tank line', [0, 4.5, -56], [0, 2.2, -40], 55], ['zero', 'Supply drop', [38, 4, 60], [24, 7, 38], 55], ['zero', 'Truck depot', [-4, 3, 74], [8, 2, 50], 55], ['zero', 'The circle', [0, 120, 215], [0, 0, -40], 62],
  ['abyss', 'Abyss window', [0, 2.2, 4], [0, 1.5, -40], 60], ['abyss', 'Dark room', [0, 2.4, 18], [0, 3.9, 33], 62], ['abyss', 'Trench', [-30, 6, -18], [10, -25, -70], 60], ['abyss', 'Kraken', [14, -28, -40], [34, -48, -70], 58],
  ['abyss', 'Bunker outside', [-34, 10, -30], [0, 3, 10], 58], ['abyss', 'Seafloor', [30, 4, 44], [0, 4, 20], 58]];
const ZONE_FOCUS = [['Space main screen', 'SCREEN_GAMEPLAY_SPACE'], ['Space cam', 'SCREEN_LIVECAM_SPACE'], ['Space chat', 'SCREEN_CHAT_SPACE'], ['Space commands', 'SCREEN_COMMANDS_SPACE'],
  ['Planet main screen', 'SCREEN_GAMEPLAY_PLANET'], ['Planet cam', 'SCREEN_LIVECAM_PLANET'], ['Planet chat', 'SCREEN_CHAT_PLANET'], ['Planet commands', 'SCREEN_COMMANDS_PLANET'],
  ['Bay main screen', 'SCREEN_GAMEPLAY_BAY'], ['Bay cam', 'SCREEN_LIVECAM_BAY'], ['Bay chat', 'SCREEN_CHAT_BAY'], ['Bay commands', 'SCREEN_COMMANDS_BAY'],
  ['Summit main screen', 'SCREEN_GAMEPLAY_SUMMIT'], ['Summit cam', 'SCREEN_LIVECAM_SUMMIT'], ['Summit chat', 'SCREEN_CHAT_SUMMIT'], ['Summit commands', 'SCREEN_COMMANDS_SUMMIT'],
  ['Hollow main screen', 'SCREEN_GAMEPLAY_HOLLOW'], ['Hollow cam', 'SCREEN_LIVECAM_HOLLOW'], ['Hollow chat', 'SCREEN_CHAT_HOLLOW'], ['Hollow commands', 'SCREEN_COMMANDS_HOLLOW'],
  ['Zero main screen', 'SCREEN_GAMEPLAY_ZERO'], ['Zero cam', 'SCREEN_LIVECAM_ZERO'], ['Zero chat', 'SCREEN_CHAT_ZERO'], ['Zero commands', 'SCREEN_COMMANDS_ZERO'], ['Operator Vault', 'SCREEN_VAULT_ZERO'],
  ['Abyss main screen', 'SCREEN_GAMEPLAY_ABYSS'], ['Abyss cam', 'SCREEN_LIVECAM_ABYSS'], ['Abyss chat', 'SCREEN_CHAT_ABYSS'], ['Abyss commands', 'SCREEN_COMMANDS_ABYSS']];
function buildZones() {
  zPlanetTextures(); buildSpace(); buildPlanet(); buildBay(); buildHarbor(); buildSummit(); buildHollow(); buildZero(); buildAbyss();
  ZONE_SHOTS.forEach(([zone, label, p, l, fov]) => { const pos = new THREE.Vector3(...p); shots.push({ name: 'ZONE', zone, label, pos, quat: lookQuat(pos, new THREE.Vector3(...l)), fov }); });
  ZONE_FOCUS.forEach(f => FOCUS.push(f));
}
function zoneOrbit() {
  const C = ZONES.cur === 'space' ? { c: new THREE.Vector3(0, 4, 2), r: 29, h: 7.5, look: 4.5 } : ZONES.cur === 'bay' ? { c: new THREE.Vector3(0, 3, 2), r: 46, h: 9, look: 7 } : ZONES.cur === 'summit' ? { c: new THREE.Vector3(0, 2, -4), r: 40, h: 12, look: 5 } : ZONES.cur === 'hollow' ? { c: new THREE.Vector3(0, 2, -2), r: 26, h: 7.5, look: 5 } : ZONES.cur === 'zero' ? { c: new THREE.Vector3(0, 2, -2), r: 44, h: 12, look: 5 } : ZONES.cur === 'abyss' ? { c: new THREE.Vector3(0, 0, -20), r: 40, h: 8, look: 0 } : { c: new THREE.Vector3(0, 0, -2), r: 36, h: 8.5, look: 11 };
  return { c: C.c, r: C.r, h: C.h, look: C.look, a: Math.atan2(cam.position.x - C.c.x, cam.position.z - C.c.z) };
}
function setZone(z) {
  ZONES.cur = z; renderPass.scene = z === 'space' ? SP.scene : z === 'planet' ? PL.scene : z === 'bay' ? BAY.scene : z === 'summit' ? SM.scene : z === 'hollow' ? HW.scene : z === 'zero' ? ZZ.scene : z === 'abyss' ? AB.scene : scene; renderPass.camera = cam;
  document.body.dataset.zone = z;
}
const TR = { on: false };
function travel(to, shot) {
  if (TR.on) { TR.shot = shot; TR.to = to; return; }
  const from = ZONES.cur; setTour(false); releaseGuide();
  Object.assign(TR, { on: true, from, to, shot, t: 0, v: 0, warp: false, st: null, k: 0, flown: false, wiped: false,
    mode: from === 'city' && to === 'bay' ? 'boatOut' : from === 'bay' && to === 'city' ? 'boatIn' : from === 'city' && to === 'summit' ? 'heliOut' : from === 'summit' && to === 'city' ? 'heliIn' : from === 'city' && to === 'hollow' ? 'busOut' : from === 'hollow' && to === 'city' ? 'busIn' : from === 'city' && to === 'zero' ? 'truckOut' : from === 'zero' && to === 'city' ? 'truckIn' : from === 'space' && to === 'planet' ? 'dive' : from === 'space' ? 'forward' : 'up',
    p0: cam.position.clone(), q0: cam.quaternion.clone(), f0: cam.fov });
  if (!/^(boat|heli|bus|truck)/.test(TR.mode)) whoosh(TR.mode === 'dive' ? 4.6 : 3.8);
  toast({ space: 'Launching to space...', planet: from === 'space' ? 'Diving to planet Lucida...' : 'Flying to planet Lucida...', bay: from === 'city' ? 'Heading to the boats... next stop Lucid Bay' : 'Flying to Lucid Bay...', summit: from === 'city' ? 'Your helicopter is here... next stop Crimson Summit' : 'Flying to Crimson Summit...', hollow: from === 'city' ? 'The last bus to Ashen Hollow is arriving...' : 'Drifting into Ashen Hollow...', zero: from === 'city' ? 'Convoy inbound... next stop Zone Zero' : 'Dropping into Zone Zero...', abyss: 'Diving to The Abyss... LSC Deep Station, depth 1,140 m',
    city: from === 'bay' ? 'Boating back to Lucid State City...' : from === 'summit' ? 'Flying the helicopter back to the city...' : from === 'hollow' ? 'Catching the bus out of Ashen Hollow...' : from === 'zero' ? 'Convoy rolling back to the city...' : from === 'abyss' ? 'Surfacing... back to Lucid State City' : 'Heading back to Lucid State City...' }[to]);
  setTimeout(postState, 50);
}
function trTick(dt, t) {
  if (!TR.on) return false;
  if (TR.mode === 'boatOut' || TR.mode === 'boatIn') return boatTick(dt, t);
  if (TR.mode === 'heliOut' || TR.mode === 'heliIn') return heliTripTick(dt, t);
  if (TR.mode === 'busOut' || TR.mode === 'busIn') return busTripTick(dt, t);
  if (TR.mode === 'truckOut' || TR.mode === 'truckIn') return truckTripTick(dt, t);
  TR.t += dt; const A = TR.mode === 'dive' ? 2.5 : 1.5, W = 1.7;
  if (TR.t < A) {                                         // leave: blast up, fly forward, or dive at the planet
    const k = TR.t / A, fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    if (TR.mode === 'up') { TR.v += dt * (30 + k * 320); cam.position.y += TR.v * dt; const flat = fwd.clone().setY(0).normalize();
      cam.quaternion.slerp(lookQuat(cam.position, cam.position.clone().add(new THREE.Vector3(0, 10, 0)).addScaledVector(flat, 4)), Math.min(1, dt * 1.6)); }
    else if (TR.mode === 'forward') { TR.v += dt * (25 + k * 340); cam.position.addScaledVector(fwd, TR.v * dt); }
    else { const c = SP.luc.position, tgt = c.clone().add(TR.p0.clone().sub(c).normalize().multiplyScalar(126)), e = k * k * k;
      cam.position.copy(TR.p0).lerp(tgt, e); cam.quaternion.slerp(lookQuat(cam.position, c), Math.min(1, dt * 2.5)); }
    cam.fov = TR.f0 + (88 - TR.f0) * k * k; cam.updateProjectionMatrix(); bloom.strength = 0.9 + k * 1.4;
    if (ZONES.cur === 'space') spaceTick(dt, t); else if (ZONES.cur === 'planet') planetTick(dt, t); else if (ZONES.cur === 'bay') bayTick(dt, t); else if (ZONES.cur === 'summit') summitTick(dt, t); else if (ZONES.cur === 'hollow') hollowTick(dt, t); else if (ZONES.cur === 'zero') zeroTick(dt, t); else if (ZONES.cur === 'abyss') abyssTick(dt, t);
    return true;
  }
  if (TR.t < A + W) {                                     // warp tunnel
    if (!TR.warp) { TR.warp = true; flash(0.55, 0.5); WARP.cam.aspect = cam.aspect; WARP.cam.updateProjectionMatrix(); renderPass.scene = WARP.scene; renderPass.camera = WARP.cam; }
    const k = (TR.t - A) / W; warpTick(dt, 220 + Math.sin(k * Math.PI) * 1100, TR.to); bloom.strength = 1.6 + Math.sin(k * Math.PI) * 0.8; return true;
  }
  // arrive
  flash(0.95, 1.1); setZone(TR.to); TR.on = false; const s = TR.shot; bloom.strength = 1.2;
  if (s.walk || s.follow || s.orbit) { if (TR.to !== 'city') { cam.position.set(0, 10, 40); } startMove(s); }
  else { const back = new THREE.Vector3(0, 0, 1).applyQuaternion(s.quat), start = TR.to === 'planet' ? new THREE.Vector3(0, 150, 230) : TR.to === 'bay' ? new THREE.Vector3(20, 70, 170) : TR.to === 'summit' ? new THREE.Vector3(-60, 60, 120) : TR.to === 'hollow' ? new THREE.Vector3(20, 30, 90) : TR.to === 'zero' ? new THREE.Vector3(40, 60, 140) : TR.to === 'abyss' ? new THREE.Vector3(10, 70, -40) : TR.to === 'space' ? s.pos.clone().addScaledVector(back, 110).add(new THREE.Vector3(0, 30, 0)) : s.pos.clone().addScaledVector(back, 50).add(new THREE.Vector3(0, 90, 0));
    cam.position.copy(start); cam.quaternion.copy(lookQuat(start, s.pos.clone().lerp(new THREE.Vector3(0, 0, 0), TR.to === 'city' ? 0 : 0.5))); cam.fov = 75; cam.updateProjectionMatrix();
    fly = { fromP: start, fromQ: cam.quaternion.clone(), fromF: 75, to: s, t: 0, dur: TR.to === 'city' ? 3.0 : 3.4 }; hold = null; }
  setTimeout(postState, 50); return false;
}
function zoneTick(dt, t) {
  if (SHOW.mode !== 'live' && !(SHOW.mode === 'intro' && SHOW.style !== 'neon') && (ZONES.cur !== 'city' || TR.on)) { if (TR.on) { TR.on = false; renderPass.camera = cam; } setZone('city'); }      // intro / BRB / outro always play in the city
  harborTick(dt, t); cityHeliTick(dt, t);
  if (!TR.on) { if (ZONES.cur === 'space') spaceTick(dt, t); else if (ZONES.cur === 'planet') planetTick(dt, t); else if (ZONES.cur === 'bay') bayTick(dt, t); else if (ZONES.cur === 'summit') summitTick(dt, t); else if (ZONES.cur === 'hollow') hollowTick(dt, t); else if (ZONES.cur === 'zero') zeroTick(dt, t); else if (ZONES.cur === 'abyss') abyssTick(dt, t); }
}
// ---------------------------------------------------------------- LUCID BAY: sunset neon beach district (floating stage, boats, Ocean Drive), reached by speedboat from the city harbor
const waveH = (x, z, t, a) => (Math.sin(x * 0.08 + t * 1.1) * 0.35 + Math.sin(z * 0.11 - t * 1.3) * 0.3 + Math.sin((x + z) * 0.21 + t * 2.1) * 0.12) * (a === undefined ? 1 : a);
function makeWater(w, d, seg, o) {
  const g = new THREE.PlaneGeometry(w, d, seg, seg); g.rotateX(-Math.PI / 2);
  const m = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, amp: { value: o.amp }, sunDir: { value: o.sunDir.clone().normalize() }, skyTop: { value: new THREE.Color(o.skyTop) }, skyHor: { value: new THREE.Color(o.skyHor) },
      deep: { value: new THREE.Color(o.deep) }, sunCol: { value: new THREE.Color(o.sunCol) }, fogCol: { value: new THREE.Color(o.fogCol) }, fogD: { value: o.fogD }, glow: { value: new THREE.Color(o.glow || 0x000000) } },
    vertexShader: `uniform float t; uniform float amp; varying vec3 vW; varying float vDepth;
      float wv(vec2 p){ return (sin(p.x*0.08+t*1.1)*0.35 + sin(p.y*0.11-t*1.3)*0.3 + sin((p.x+p.y)*0.21+t*2.1)*0.12) * amp; }
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); w.y += wv(w.xz); vW = w.xyz; vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float t; uniform float amp; uniform vec3 sunDir; uniform vec3 skyTop; uniform vec3 skyHor; uniform vec3 deep; uniform vec3 sunCol; uniform vec3 fogCol; uniform float fogD; uniform vec3 glow;
      varying vec3 vW; varying float vDepth;
      float wv(vec2 p){ return (sin(p.x*0.08+t*1.1)*0.35 + sin(p.y*0.11-t*1.3)*0.3 + sin((p.x+p.y)*0.21+t*2.1)*0.12) * amp
        + (sin(p.x*1.3+t*3.1)*sin(p.y*1.7-t*2.3)*0.05 + sin(p.x*3.7-p.y*2.9+t*5.0)*0.02) * (0.4+amp) * smoothstep(140.0, 15.0, vDepth); }
      void main(){ vec2 p = vW.xz; float e = 0.15; float hx = wv(p+vec2(e,0.0)) - wv(p-vec2(e,0.0)); float hz = wv(p+vec2(0.0,e)) - wv(p-vec2(0.0,e));
        vec3 N = normalize(vec3(-hx/(2.0*e)*0.6, 1.0, -hz/(2.0*e)*0.6)); vec3 V = normalize(cameraPosition - vW);
        float fr = 0.05 + 0.6 * pow(1.0 - max(dot(N,V),0.0), 5.0); vec3 R = reflect(-V, N);
        vec3 sky = mix(skyHor, skyTop, clamp(R.y*2.2, 0.0, 1.0));
        float s = max(dot(R, sunDir), 0.0); vec3 col = mix(deep, sky, fr) + sunCol * (pow(s, 300.0)*4.0 + pow(s, 30.0)*0.3) + glow; col = col / (1.0 + col * 0.35);
        float f = 1.0 - exp(-fogD*fogD*vDepth*vDepth); gl_FragColor = vec4(mix(col, fogCol, clamp(f,0.0,1.0)), 1.0); }` });
  const mesh = new THREE.Mesh(g, m); mesh.userData.mat = m; return mesh;
}
// ---- shared builders
const bayLeafGeo = (() => { const g = new THREE.PlaneGeometry(0.9, 4.4, 1, 8), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 2.2, k = y / 4.4; p.setXYZ(i, p.getX(i) * (1 - k * 0.85) * (0.6 + Math.sin(k * Math.PI) * 0.8), 0 - k * k * 1.9, y); } g.computeVertexNormals(); return g; })();
const bayTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2622, roughness: 0.9 }), bayLeafMat = new THREE.MeshStandardMaterial({ color: 0x0f2a1c, roughness: 0.8, side: THREE.DoubleSide });
function bayPalm(h, lean, seed) {
  const R = zRand(seed), g = new THREE.Group(); let p = new THREE.Vector3(), dir = new THREE.Vector3(lean, 1, lean * 0.4).normalize(); const segs = 7;
  for (let i = 0; i < segs; i++) { const len = h / segs, r = 0.32 - i * 0.025, m = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.02, r, len * 1.05, 7), bayTrunkMat);
    m.position.copy(p).addScaledVector(dir, len / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); g.add(m); p.addScaledVector(dir, len); dir.x += lean * 0.06; dir.normalize(); }
  const crown = new THREE.Group(); crown.position.copy(p); g.add(crown);
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(bayLeafGeo, bayLeafMat); l.rotation.set(-0.5 + R() * 0.4, i / 9 * Math.PI * 2 + R() * 0.3, 0, 'YXZ'); crown.add(l); }
  g.userData.crown = crown; g.userData.ph = R() * 7; return g;
}
const bayPersonMats = {};
function bayPerson(color, name) {
  const g = NPC.make({ style: 'bay', col: color != null ? new THREE.Color(color).getHex() : undefined });
  if (name) { const s = nameSprite(name, g.userData.col); s.position.y = 2.35; g.add(s); }
  return g;
}
function baySpeedboat(col, len) {
  len = len || 6; const g = new THREE.Group(), c = new THREE.Color(col);
  const hg = new THREE.BoxGeometry(2.1, 0.9, len, 2, 2, 8), p = hg.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i), y = p.getY(i), k = Math.max(0, (z - len * 0.18) / (len * 0.32)); p.setX(i, p.getX(i) * Math.max(0.06, 1 - k * k * 0.95) * (y < 0 ? 0.72 : 1)); if (y < 0) p.setY(i, y + k * 0.45); }
  hg.computeVertexNormals();
  const hull = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ color: 0xf2f0f6, roughness: 0.3, metalness: 0.2 })); hull.position.y = 0.35; g.add(hull);
  const stripe = new THREE.MeshStandardMaterial({ color: 0, emissive: c, emissiveIntensity: 2.2 });
  [-1, 1].forEach(s => { const st = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, len * 0.7), stripe); st.position.set(s * 1.02, 0.45, -len * 0.08); g.add(st); });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, len * 0.5), new THREE.MeshStandardMaterial({ color: 0x2a1a14, roughness: 0.8 })); deck.position.set(0, 0.82, -len * 0.12); g.add(deck);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 0.06), new THREE.MeshStandardMaterial({ color: 0x223040, transparent: true, opacity: 0.55, metalness: 0.8, roughness: 0.05 }));
  ws.position.set(0, 1.12, len * 0.12); ws.rotation.x = -0.5; g.add(ws);
  const eng = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.5), zDark); eng.position.set(0, 0.8, -len / 2 - 0.1); g.add(eng);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(2.6, len * 1.05), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  under.rotation.x = -Math.PI / 2; under.position.y = 0.06; g.add(under);
  g.userData.len = len; return g;
}
const bayFoamTex = (() => { const [c, t] = zCanvasTex(64, 256), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr;
  x.beginPath(); x.moveTo(26, 0); x.lineTo(38, 0); x.lineTo(64, 256); x.lineTo(0, 256); x.closePath(); x.fill(); t.needsUpdate = true; return t; })();
function bayWake(len) { const m = new THREE.Mesh(new THREE.PlaneGeometry(5, len), new THREE.MeshBasicMaterial({ map: bayFoamTex, transparent: true, opacity: 0.75, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.geometry.translate(0, -len / 2, 0); return m; }
function bayRider(boat, col, name, stand) { const p = bayPerson(col, name); p.position.set(0, stand ? 0.85 : 0.35, -0.6); if (!stand) p.scale.setScalar(0.9); boat.add(p); boat.userData.rider = p; NPC.pose(p, stand ? 'idle' : 'sit', 0, 0); return p; }
function bayText(lines, w, h, col, font) {
  const [c, t] = zCanvasTex(w, h), x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach((L, i) => { x.font = (L.f || font || '120px Anton, Impact, sans-serif'); x.shadowColor = L.c || col; x.shadowBlur = 26; x.fillStyle = L.fill || '#fff'; x.fillText(L.t, w / 2, L.y * h); x.shadowBlur = 10; x.fillText(L.t, w / 2, L.y * h); });
  t.needsUpdate = true; return t;
}
function bayNeonSign(lines, w, h, col, size) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size * h / w), new THREE.MeshBasicMaterial({ map: bayText(lines, w, h, col), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
  return m;
}
// ---------------------------------------------------------------- CITY HARBOR (past the city gate): pier, water, moored speedboat
const HB = {};
function buildHarbor() {
  const S = scene, cx = -7.5, z0 = 177, z1 = 440;
  HB.water = makeWater(420, z1 - z0, 140, { amp: 0.35, sunDir: new THREE.Vector3(-0.4, 0.5, -0.7), skyTop: 0x06040f, skyHor: 0x24103c, deep: 0x01040a, sunCol: 0xffd0f0, fogCol: 0x0c0718, fogD: 0.0045 });
  HB.water.position.set(cx, 0.1, (z0 + z1) / 2); S.add(HB.water);
  const stone = new THREE.MeshStandardMaterial({ color: 0x2a2838, roughness: 0.8 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(150, 1.4, 1.6), stone); wall.position.set(cx, 0.2, z0 - 0.4); S.add(wall);
  const prom = new THREE.Mesh(new THREE.BoxGeometry(110, 0.6, 7), new THREE.MeshStandardMaterial({ color: 0x1d1a28, roughness: 0.85 })); prom.position.set(cx - 5, 0.6, z0 - 4.5); S.add(prom);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(150, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0, emissive: 0x38e8ff, emissiveIntensity: 1.1 })); rail.position.set(cx, 1.9, z0 - 0.9); S.add(rail);
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3226, roughness: 0.9 });
  const pier = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 36), wood); pier.position.set(cx, 1.05, z0 + 16); S.add(pier);
  for (let z = z0 + 1; z < z0 + 34; z += 4) [-1.9, 1.9].forEach(s => { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.4, 8), wood); post.position.set(cx + s, 0.4, z); S.add(post); });
  for (let z = z0 + 4; z < z0 + 34; z += 8) [-2, 2].forEach(s => { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), zDark); pole.position.set(cx + s, 2.3, z); S.add(pole);
    const bulb = zGlowSprite(s < 0 ? 'rgb(255,60,170)' : 'rgb(60,230,255)', 2.2, 0.15); bulb.position.set(cx + s, 3.45, z); S.add(bulb); });
  const arch = new THREE.Group(), am = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xff2d8f, emissiveIntensity: 1.3 });
  [-2.6, 2.6].forEach(s => { const pst = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.6, 0.3), am); pst.position.set(s, 2.8, 0); arch.add(pst); });
  const top = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.3, 0.3), am); top.position.y = 5.6; arch.add(top);
  const sign = bayNeonSign([{ t: 'LUCID BAY', y: 0.4, c: '#ff2d8f' }, { t: 'SPEEDBOATS  →', y: 0.8, c: '#38e8ff', f: 'bold 70px Poppins, sans-serif', fill: '#bff6ff' }], 1024, 384, '#ff2d8f', 7);
  sign.position.set(0, 7.3, 0); sign.rotation.y = Math.PI; arch.add(sign); arch.position.set(cx, 1.2, z0 + 0.5); S.add(arch);
  HB.boat = baySpeedboat('#ff2d8f', 6.5); bayRider(HB.boat, '#38e8ff'); HB.moor = new THREE.Vector3(cx + 4.4, 0, z0 + 22); HB.boat.position.copy(HB.moor); S.add(HB.boat);
  HB.wake = bayWake(16); HB.wake.material.opacity = 0; HB.boat.add(HB.wake); HB.wake.position.set(0, 0.08, -3);
  const L = new THREE.PointLight(0xff4fb0, 1.4, 40, 2); L.position.set(cx, 6, z0 + 10); S.add(L);
  const pos = new THREE.Vector3(cx - 7, 5.2, z0 + 6);
  shots.push({ name: 'HARBOR', label: 'Harbor dock', pos, quat: lookQuat(pos, new THREE.Vector3(cx + 4.4, 1.2, z0 + 24)), fov: 55 });
}
function harborTick(dt, t) { if (!HB.water) return; HB.water.userData.mat.uniforms.t.value = t;
  if (!TR.on || TR.mode !== 'boatOut' && TR.mode !== 'boatIn') { HB.boat.position.copy(HB.moor); HB.boat.position.y = waveH(HB.moor.x, HB.moor.z, t, 0.35) * 0.8; HB.boat.rotation.set(Math.sin(t * 1.3) * 0.03, 0, Math.sin(t * 0.9) * 0.04); HB.wake.material.opacity = 0; } }
// ---------------------------------------------------------------- the bay itself
const BAY = { scene: new THREE.Scene(), boats: [], viewers: {}, palms: [], scr: [], flam: [] };
const BAY_SUN = new THREE.Vector3(-0.42, 0.075, 0.9).normalize();
function buildBay() {
  const S = BAY.scene; S.fog = new THREE.FogExp2(0x7a2a66, 0.0021);
  // sunset sky
  { const [c, t] = zCanvasTex(2048, 1024), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#0c0628'); g.addColorStop(0.45, '#2c0f55'); g.addColorStop(0.7, '#8a1f78'); g.addColorStop(0.86, '#e8457a'); g.addColorStop(0.95, '#ff8a4a'); g.addColorStop(1, '#ffc27a');
    x.fillStyle = g; x.fillRect(0, 0, 2048, 512); x.fillStyle = '#5a1a5a'; x.fillRect(0, 512, 2048, 512);
    const R = zRand(5); for (let i = 0; i < 700; i++) { const y = Math.pow(R(), 1.8) * 300; x.fillStyle = `rgba(255,240,255,${(0.2 + R() * 0.7) * (1 - y / 300)})`; x.fillRect(R() * 2048, y, 1.6, 1.6); }
    for (let i = 0; i < 30; i++) { const cx = R() * 2048, cy = 400 + R() * 95, w = 90 + R() * 260, h = 3 + R() * 7;
      for (const dx of [-2048, 0, 2048]) { const gg = x.createLinearGradient(0, cy - h, 0, cy + h); gg.addColorStop(0, 'rgba(255,170,120,0.0)'); gg.addColorStop(0.4, `rgba(255,${120 + R() * 60 | 0},${110 + R() * 60 | 0},${0.12 + R() * 0.18})`); gg.addColorStop(1, 'rgba(120,30,90,0.15)');
        x.fillStyle = gg; x.beginPath(); x.ellipse(cx + dx, cy, w, h, 0, 0, 7); x.fill(); } }
    t.needsUpdate = true; S.add(zSky(t, 1600)); }
  // synthwave sun on the horizon
  { const [c, t] = zCanvasTex(512, 512), x = c.getContext('2d'), g = x.createLinearGradient(0, 40, 0, 470); g.addColorStop(0, '#fff2a0'); g.addColorStop(0.45, '#ffb04a'); g.addColorStop(1, '#ff2d8f');
    x.fillStyle = g; x.beginPath(); x.arc(256, 256, 210, 0, 7); x.fill(); x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 9; i++) { const y = 290 + i * 22, h = 3 + i * 1.6; x.fillRect(0, y, 512, h); } t.needsUpdate = true;
    const sun = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshBasicMaterial({ map: t, transparent: true, fog: false, depthWrite: false }));
    sun.position.copy(BAY_SUN).multiplyScalar(1300); sun.position.y = 75; sun.lookAt(0, 75, 0); S.add(sun);
    const glow = zGlowSprite('rgb(255,120,90)', 520, 0.02); glow.material.opacity = 0.3; glow.position.copy(sun.position); S.add(glow); }
  S.add(new THREE.HemisphereLight(0xffa8d8, 0x2a1040, 0.5));
  const sunL = new THREE.DirectionalLight(0xffa070, 0.28); sunL.position.copy(BAY_SUN).multiplyScalar(100); S.add(sunL);
  // ocean
  BAY.water = makeWater(2600, 2600, 220, { amp: 1, sunDir: new THREE.Vector3(BAY_SUN.x, 0.06, BAY_SUN.z), skyTop: 0x2a0e48, skyHor: 0xa83a6a, deep: 0x041024, sunCol: 0xffa860, fogCol: 0x7a2a66, fogD: 0.0021 });
  S.add(BAY.water);
  // beach + Ocean Drive (shore runs along z = -90; the open sea and the sunset are toward +z)
  const sand = new THREE.Mesh(new THREE.BoxGeometry(900, 2, 46), new THREE.MeshStandardMaterial({ color: 0x7a4a5a, roughness: 1 })); sand.position.set(0, -0.2, -112); sand.rotation.x = 0.03; S.add(sand);
  const walk = new THREE.Mesh(new THREE.BoxGeometry(900, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x5a4a62, roughness: 0.7 })); walk.position.set(0, 1.0, -137); S.add(walk);
  const road = new THREE.Mesh(new THREE.BoxGeometry(900, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x1c1626, roughness: 0.9 })); road.position.set(0, 0.95, -147); S.add(road);
  { const R = zRand(41); for (let i = 0; i < 46; i++) { const x = -260 + i * 11.5 + (R() - 0.5) * 4, z = i % 2 ? -132 : -100 - R() * 10, p = bayPalm(9 + R() * 6, (R() - 0.5) * 0.5, i + 3); p.position.set(x, 0.8, z); p.rotation.y = R() * 6; S.add(p); BAY.palms.push(p); } }
  // pastel art-deco hotels with neon
  const NAMES = ['PALMETTO', 'NEON SANDS', 'CORAL', 'FLAMINGO', 'SUNSET', 'LUCID', 'TIDES', 'AZURE', 'PARADISE', 'STARLITE'];
  const PASTEL = [0x9a6a80, 0x6a9a8c, 0x7e72a0, 0xa08068, 0x6a8ca0, 0x9a9470, 0x96689a];
  const NEON = ['#ff2d8f', '#38e8ff', '#b478ff', '#ffd23a', '#7dff6a'];
  { const [wc, wt] = zCanvasTex(256, 256), x = wc.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256); const R = zRand(77);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) { const on = R() < 0.6; x.fillStyle = on ? ['#ffd9a0', '#ffe9c8', '#9fe8ff', '#ffb0e0'][R() * 4 | 0] : '#120a18'; x.fillRect(10 + i * 41, 10 + j * 31, 26, 18); }
    wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.needsUpdate = true; BAY.winTex = wt; }
  const R = zRand(91);
  for (let i = 0; i < 10; i++) {
    const w = 18 + R() * 8, h = 12 + R() * 14, d = 14, x = -150 + i * 32, z = -164, col = PASTEL[i % PASTEL.length], neon = NEON[i % NEON.length], wt = BAY.winTex.clone(); wt.needsUpdate = true; wt.repeat.set(w / 10, h / 7);
    const mats = [new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }), new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }), new THREE.MeshStandardMaterial({ color: col }), new THREE.MeshStandardMaterial({ color: col }),
      new THREE.MeshStandardMaterial({ color: col, emissive: 0xffffff, emissiveMap: wt, emissiveIntensity: 0.55, roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: col })];
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); b.position.set(x, h / 2 + 1, z); S.add(b);
    const nm = new THREE.MeshStandardMaterial({ color: 0, emissive: new THREE.Color(neon), emissiveIntensity: 2.2 });
    for (let f = 1; f <= 3; f++) { const strip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.14, 0.14), nm); strip.position.set(x, 1 + h * f / 3.4, z + d / 2 + 0.1); S.add(strip); }
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, h + 5, 20), new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })); tower.position.set(x + w / 2 - 1.5, (h + 5) / 2 + 1, z + d / 2 - 1.5); S.add(tower);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.09, 6, 32), nm); ring.rotation.x = Math.PI / 2; ring.position.set(x + w / 2 - 1.5, h + 5.6, z + d / 2 - 1.5); S.add(ring);
    const blade = bayNeonSign(NAMES[i].split('').map((ch, k, a) => ({ t: ch, y: (k + 0.6) / (a.length + 0.2), c: neon, f: '86px Anton, Impact, sans-serif' })), 128, 1024, neon, 2.2);
    blade.scale.set(1, 1, 1); blade.position.set(x - w / 2 + 1.5, 1 + h * 0.55, z + d / 2 + 0.9); S.add(blade);
    const top = bayNeonSign([{ t: NAMES[i], y: 0.55, c: neon }], 1024, 200, neon, Math.min(w * 0.9, 16)); top.position.set(x - 1, h + 2.6, z + d / 2 + 0.2); S.add(top);
  }
  // skyline behind
  for (let i = 0; i < 34; i++) { const w = 14 + R() * 20, h = 40 + Math.pow(R(), 1.5) * 120, x = -330 + i * 20 + (R() - 0.5) * 8, z = -230 - R() * 120, wt = BAY.winTex.clone(); wt.needsUpdate = true; wt.repeat.set(w / 8, h / 6);
    const m = new THREE.MeshStandardMaterial({ color: 0x1a1030, emissive: 0xffffff, emissiveMap: wt, emissiveIntensity: 0.75, roughness: 0.5 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), m); b.position.set(x, h / 2, z); S.add(b);
    if (R() < 0.3) { const tip = zGlowSprite(R() < 0.5 ? 'rgb(255,45,143)' : 'rgb(56,232,255)', 6, 0.2); tip.position.set(x, h + 2, z); S.add(tip); } }
  // floating stage (barge) with the screens
  { const barge = new THREE.Group(); const deckM = new THREE.MeshStandardMaterial({ color: 0x16121e, roughness: 0.5, metalness: 0.6 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(34, 1.6, 18), deckM); deck.position.y = 0.5; barge.add(deck);
    const edge = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xff2d8f, emissiveIntensity: 2.4 }), edge2 = new THREE.MeshStandardMaterial({ color: 0, emissive: 0x38e8ff, emissiveIntensity: 2.2 });
    [[0, 1.35, 9.05, 34.2, 0.12, 0.12, edge], [0, 1.35, -9.05, 34.2, 0.12, 0.12, edge], [17.05, 1.35, 0, 0.12, 0.12, 18.2, edge2], [-17.05, 1.35, 0, 0.12, 0.12, 18.2, edge2]].forEach(([x, y, z, a, b2, c2, m]) => { const e = new THREE.Mesh(new THREE.BoxGeometry(a, b2, c2), m); e.position.set(x, y, z); barge.add(e); });
    const truss = new THREE.MeshStandardMaterial({ color: 0x2a2836, metalness: 0.8, roughness: 0.4 });
    [-11, 11].forEach(x => { const t = new THREE.Mesh(new THREE.BoxGeometry(0.7, 14, 0.7), truss); t.position.set(x, 8, 2); barge.add(t); });
    BAY.scene.add(barge); BAY.barge = barge;
    const add = (g, x, y, z, ry, parent) => { g.position.set(x, y, z); g.rotation.y = ry; (parent || S).add(g); BAY.scr.push(g); };
    add(zScreen('GAMEPLAY', 'SCREEN_GAMEPLAY_BAY', 19.2, 10.8, 'bay', 0xff2d8f), 0, 8.8, 2, Math.PI, barge);
    add(zScreen('COMMANDS', 'SCREEN_COMMANDS_BAY', 7.2, 4.05, 'bay', 0x38e8ff), 12.5, 3.6, -5, Math.PI + 0.35, barge);
    const djb = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 2), new THREE.MeshStandardMaterial({ color: 0x0c0a14, emissive: 0xb478ff, emissiveIntensity: 0.4 })); djb.position.set(0, 2, -3); barge.add(djb);
    const sign = bayNeonSign([{ t: 'LUCID BAY', y: 0.36, c: '#ff2d8f' }, { t: 'SUNSET SESSIONS', y: 0.8, c: '#ffd23a', f: 'bold 64px Poppins, sans-serif', fill: '#fff3c4' }], 1024, 320, '#ff2d8f', 16);
    sign.position.set(0, 17, 2); sign.rotation.y = Math.PI; barge.add(sign); BAY.sign = sign;
    BAY.dancers = []; for (let i = 0; i < 7; i++) { const p = bayPerson(); p.position.set(-8 + i * 2.6, 1.3, -5.5 + (i % 2) * 1.4); p.rotation.y = Math.PI; barge.add(p); BAY.dancers.push(p); }
    [[0xff2d8f, -10, 10, -6], [0x38e8ff, 10, 10, -6], [0xffb04a, 0, 6, -12]].forEach(([c, x, y, z]) => { const L = new THREE.PointLight(c, 1.4, 45, 2); L.position.set(x, y, z); barge.add(L); });
    // pontoons for the cam and chat screens
    [['LIVECAM', 'SCREEN_LIVECAM_BAY', -27, 0.45, 0x38e8ff], ['CHAT', 'SCREEN_CHAT_BAY', 27, -0.45, 0xb478ff]].forEach(([ty, nm, x, ry, fc]) => {
      const pon = new THREE.Group(); [-2.2, 2.2].forEach(s => { const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 7, 14), new THREE.MeshStandardMaterial({ color: 0xf0eef6, roughness: 0.4 })); fl.rotation.x = Math.PI / 2; fl.position.set(s, 0.3, 0); pon.add(fl); });
      const plat = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 7), deckM); plat.position.y = 1.1; pon.add(plat);
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), truss); pole.position.y = 3.1; pon.add(pole);
      const sc = zScreen(ty, nm, 8.8, 4.95, 'bay', fc); sc.position.set(0, 6.9, 0); sc.rotation.y = Math.PI; pon.add(sc); BAY.scr.push(sc);
      pon.position.set(x, 0, -6); pon.rotation.y = ry; S.add(pon); (BAY.pons = BAY.pons || []).push(pon); }); }
  // pier with a neon ferris wheel
  { const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a2c, roughness: 0.9 }), px = 70;
    const pier = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 70), wood); pier.position.set(px, 1.6, -60); S.add(pier);
    for (let z = -92; z < -26; z += 6) [-3.6, 3.6].forEach(s => { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4, 8), wood); post.position.set(px + s, 0, z); S.add(post); });
    const W = new THREE.Group(); W.position.set(px, 18, -34); S.add(W); BAY.wheel = W;
    const rimM = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xff2d8f, emissiveIntensity: 2.4 }); BAY.rimM = rimM;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(14, 0.25, 8, 96), rimM); W.add(rim); const rim2 = new THREE.Mesh(new THREE.TorusGeometry(10, 0.12, 6, 64), rimM); W.add(rim2);
    const spokeM = new THREE.MeshStandardMaterial({ color: 0xdedbe8, metalness: 0.6, roughness: 0.4 });
    BAY.gond = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, sp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 14, 0.12), spokeM); sp.rotation.z = a; sp.position.set(Math.sin(-a) * 7, Math.cos(a) * 7, 0); W.add(sp);
      const go = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.6), new THREE.MeshStandardMaterial({ color: PASTEL[i % PASTEL.length], emissive: new THREE.Color(NEON[i % NEON.length]), emissiveIntensity: 0.5 })); S.add(go); BAY.gond.push({ go, a }); }
    [-1, 1].forEach(s => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.6, 20, 0.6), spokeM); leg.position.set(px + s * 5, 9, -34); leg.rotation.z = s * 0.25; S.add(leg); });
    const arch = bayNeonSign([{ t: 'LUCID BAY PIER', y: 0.5, c: '#38e8ff' }], 1024, 180, '#38e8ff', 12); arch.position.set(px, 7, -94); S.add(arch); }
  // boats circling the stage, jet skis, a party yacht, flamingo floats
  { const R2 = zRand(123), cols = ['#ff2d8f', '#38e8ff', '#ffd23a', '#7dff6a', '#b478ff', '#ff8a3a'];
    for (let i = 0; i < 11; i++) { const jet = i >= 7, b = baySpeedboat(cols[i % cols.length], jet ? 2.6 : 5.5 + R2() * 2); bayRider(b, null, null, jet); const w = bayWake(jet ? 9 : 18); w.position.set(0, 0.08, -b.userData.len * 0.45); b.add(w);
      S.add(b); BAY.boats.push({ o: b, r: 34 + R2() * 46, a: R2() * 7, sp: (R2() < 0.5 ? -1 : 1) * (jet ? 0.16 : 0.08 + R2() * 0.05), cz: 10 + R2() * 20, wob: R2() * 7 }); }
    const yacht = new THREE.Group(), white = new THREE.MeshStandardMaterial({ color: 0xf4f2f8, roughness: 0.3, metalness: 0.2 });
    const hg = new THREE.BoxGeometry(7, 2.4, 26, 2, 2, 8), p = hg.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), k = Math.max(0, (z - 6) / 7); p.setX(i, p.getX(i) * Math.max(0.05, 1 - k * k * 0.95)); } hg.computeVertexNormals();
    const hull = new THREE.Mesh(hg, white); hull.position.y = 1; yacht.add(hull);
    [[0, 2.9, -2, 6, 1.6, 14], [0, 4.4, -4, 5, 1.4, 9], [0, 5.7, -5, 3.6, 1.1, 5]].forEach(([x, y, z, a, b2, c2]) => { const d = new THREE.Mesh(new THREE.BoxGeometry(a, b2, c2), white); d.position.set(x, y, z); yacht.add(d);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(a + 0.05, b2 * 0.45, c2 * 0.9), new THREE.MeshStandardMaterial({ color: 0x101820, emissive: 0x2a8aff, emissiveIntensity: 0.45, metalness: 0.9, roughness: 0.1 })); glass.position.set(x, y + 0.1, z); yacht.add(glass); });
    const ug = new THREE.Mesh(new THREE.PlaneGeometry(9, 28), new THREE.MeshBasicMaterial({ color: 0x38e8ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })); ug.rotation.x = -Math.PI / 2; ug.position.y = 0.1; yacht.add(ug);
    BAY.yLights = []; [0xff2d8f, 0x38e8ff, 0xffd23a].forEach((c, i) => { const L = new THREE.PointLight(c, 1.6, 26, 2); L.position.set(0, 7, -6 + i * 4); yacht.add(L); BAY.yLights.push(L); });
    BAY.yDancers = []; for (let i = 0; i < 6; i++) { const pp = bayPerson(); pp.position.set(-2 + (i % 3) * 2, 3.7, 2 + (i > 2 ? 2 : 0)); yacht.add(pp); BAY.yDancers.push(pp); }
    yacht.position.set(-62, 0, 34); yacht.rotation.y = 0.6; S.add(yacht); BAY.yacht = yacht;
    const pink = new THREE.MeshStandardMaterial({ color: 0xff7ab8, roughness: 0.5, emissive: 0xff2d8f, emissiveIntensity: 0.15 });
    for (let i = 0; i < 6; i++) { const f = new THREE.Group(), ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.42, 10, 24), pink); ring.rotation.x = Math.PI / 2; f.add(ring);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.8, 8), pink); neck.position.set(0, 1, -1); f.add(neck);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), pink); head.position.set(0, 1.9, -0.8); f.add(head);
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 6), zDark); beak.rotation.x = Math.PI / 2; beak.position.set(0, 1.85, -0.45); f.add(beak);
      const a = R2() * 7, r = 14 + R2() * 16; f.position.set(Math.cos(a) * r, 0, -36 + Math.sin(a) * 8 - R2() * 20); f.rotation.y = R2() * 6; S.add(f); BAY.flam.push(f); } }
  // helicopter with a searchlight
  { const h = new THREE.Group(), bm = new THREE.MeshStandardMaterial({ color: 0x1a1a28, metalness: 0.7, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), bm); body.scale.set(1, 0.9, 1.6); h.add(body);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 6), bm); tail.position.z = -4.4; h.add(tail);
    BAY.rotor = new THREE.Mesh(new THREE.BoxGeometry(11, 0.06, 0.4), bm); BAY.rotor.position.y = 1.6; h.add(BAY.rotor);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(9, 46, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.y = -23; h.add(beam); const red = zGlowSprite('rgb(255,40,60)', 2, 0.2); red.position.set(0, -0.2, -7.4); h.add(red); BAY.blink = red;
    S.add(h); BAY.heli = h; }
}
function bayTick(dt, t) {
  BAY.water.userData.mat.uniforms.t.value = t;
  const bob = (o, x, z, k) => { o.position.y = waveH(x, z, t) * (k || 1); };
  BAY.barge.position.y = waveH(0, 0, t) * 0.25; BAY.barge.rotation.z = Math.sin(t * 0.7) * 0.008;
  (BAY.pons || []).forEach(p => { bob(p, p.position.x, p.position.z, 0.6); p.rotation.x = Math.sin(t * 0.9 + p.position.x) * 0.02; });
  BAY.dancers.concat(BAY.yDancers).forEach((d, i) => NPC.pose(d, 'dance', t, i * 1.3)); BAY.dancers.forEach((d, i) => { d.position.y = 1.3 + Math.abs(Math.sin(t * 4.2 + i)) * 0.35; d.rotation.y = Math.PI + Math.sin(t * 2 + i) * 0.5; });
  BAY.yDancers.forEach((d, i) => { d.position.y = 3.7 + Math.abs(Math.sin(t * 4.5 + i * 1.3)) * 0.3; d.rotation.y = t * (i % 2 ? 1 : -1); });
  BAY.yLights.forEach((L, i) => L.intensity = 1 + Math.max(0, Math.sin(t * 6 + i * 2)) * 2);
  BAY.yacht.position.y = waveH(-62, 34, t) * 0.35; BAY.yacht.rotation.z = Math.sin(t * 0.6) * 0.012;
  BAY.flam.forEach((f, i) => { bob(f, f.position.x, f.position.z, 0.9); f.rotation.y += dt * 0.15 * (i % 2 ? 1 : -1); });
  BAY.palms.forEach(p => { p.userData.crown.rotation.z = Math.sin(t * 0.9 + p.userData.ph) * 0.05; p.userData.crown.rotation.x = Math.sin(t * 0.7 + p.userData.ph) * 0.04; });
  BAY.wheel.rotation.z += dt * 0.12; BAY.rimM.emissive.setHSL((t * 0.05) % 1, 1, 0.55);
  BAY.gond.forEach(g => { const a = g.a + BAY.wheel.rotation.z; g.go.position.set(BAY.wheel.position.x + Math.sin(-a) * 14, BAY.wheel.position.y + Math.cos(a) * 14 - 1, BAY.wheel.position.z); });
  BAY.sign.position.y = 17 + Math.sin(t * 0.8) * 0.15;
  const ha = t * 0.12; BAY.heli.position.set(Math.cos(ha) * 90, 48 + Math.sin(t * 0.5) * 3, -40 + Math.sin(ha) * 70); BAY.heli.rotation.y = -ha; BAY.rotor.rotation.y += dt * 30; BAY.blink.visible = (t % 1) < 0.15;
  if ((BAY.syncT = (BAY.syncT || 0) - dt) <= 0) { BAY.syncT = 3;
    const live = new Set(spawned.map(w => w.user));
    Object.keys(BAY.viewers).forEach(u => { if (!live.has(u)) { BAY.scene.remove(BAY.viewers[u].o); BAY.boats = BAY.boats.filter(b => b !== BAY.viewers[u]); delete BAY.viewers[u]; } });
    spawned.forEach(w => { if (BAY.viewers[w.user]) return; let col = w.o.userData.col || '#ff2d8f'; w.o.traverse(o => { if (o.isMesh && o.material && o.material.emissive && o.material.emissiveIntensity > 0.5 && !w.o.userData.col && col === '#ff2d8f') col = '#' + o.material.emissive.getHexString(); });
      const b = baySpeedboat(col, 2.6); bayRider(b, col, w.user, true); const wk = bayWake(9); wk.position.set(0, 0.08, -1.2); b.add(wk); BAY.scene.add(b);
      const e = { o: b, r: 30 + Math.random() * 30, a: Math.random() * 7, sp: 0.13 * (Math.random() < 0.5 ? -1 : 1), cz: 12, wob: Math.random() * 7, viewer: true }; BAY.viewers[w.user] = e; BAY.boats.push(e); }); }
  BAY.boats.forEach(b => { if (b.hero) return; b.a += dt * b.sp; const x = Math.cos(b.a) * b.r, z = b.cz + Math.sin(b.a) * b.r * 0.75, o = b.o;
    o.position.set(x, waveH(x, z, t) * 0.9 + 0.05, z); const dx = -Math.sin(b.a) * b.sp, dz = Math.cos(b.a) * b.r * 0.75 * b.sp / b.r; o.rotation.set(Math.sin(t * 2 + b.wob) * 0.05 - 0.05, Math.atan2(dx, dz), Math.sin(t * 1.6 + b.wob) * 0.06); });
}
// ---------------------------------------------------------------- boat trip transition (city harbor <-> bay)
const zWipe = document.createElement('div'); zWipe.style.cssText = 'position:fixed;top:-20%;left:0;width:170%;height:140%;pointer-events:none;z-index:7;transform:translateX(-120%) skewX(-18deg);background:linear-gradient(90deg,rgba(40,200,255,0) 0%,rgba(60,220,255,.92) 18%,#e9fbff 38%,#ffffff 50%,#e9fbff 62%,rgba(255,120,200,.9) 82%,rgba(255,120,200,0) 100%)'; document.body.appendChild(zWipe);
function waveWipe() { zWipe.style.transition = 'none'; zWipe.style.transform = 'translateX(-120%) skewX(-18deg)'; void zWipe.offsetWidth; zWipe.style.transition = 'transform 1.05s cubic-bezier(.6,.05,.4,.95)'; zWipe.style.transform = 'translateX(110%) skewX(-18deg)'; }
function boatSound(len) {
  try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); if (zAC.state === 'suspended') zAC.resume(); const a = zAC, t0 = a.currentTime + 0.02;
    const o = a.createOscillator(), o2 = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain(); o.type = 'sawtooth'; o2.type = 'square';
    o.frequency.setValueAtTime(48, t0); o.frequency.exponentialRampToValueAtTime(120, t0 + len * 0.5); o.frequency.exponentialRampToValueAtTime(70, t0 + len);
    o2.frequency.setValueAtTime(49.5, t0); o2.frequency.exponentialRampToValueAtTime(122, t0 + len * 0.5); o2.frequency.exponentialRampToValueAtTime(71, t0 + len);
    lp.type = 'lowpass'; lp.frequency.value = 420; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.6); g.gain.setValueAtTime(0.12, t0 + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t0); o2.start(t0); o.stop(t0 + len); o2.stop(t0 + len);
    const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * len, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const f = a.createBiquadFilter(), ng = a.createGain(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6; ng.gain.setValueAtTime(0.0001, t0); ng.gain.exponentialRampToValueAtTime(0.1, t0 + 1); ng.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    n.buffer = b; n.connect(f); f.connect(ng); ng.connect(a.destination); n.start(t0); } catch (e) {}
}
function chase(boat, back, up, ahead, k) {      // camera rides behind a boat
  const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), boat.rotation.y);
  const want = boat.position.clone().addScaledVector(fwd, -back).add(new THREE.Vector3(0, up, 0));
  cam.position.lerp(want, Math.min(1, k)); cam.quaternion.slerp(lookQuat(cam.position, boat.position.clone().addScaledVector(fwd, ahead).add(new THREE.Vector3(0, 1.2, 0))), Math.min(1, k));
}
function boatTick(dt, t) {
  const T = TR; T.st = T.st || 'dock'; T.k = (T.k || 0) + dt;
  if (T.mode === 'boatOut') {
    if (T.st === 'dock') { const H = shots.find(s => s.name === 'HARBOR');
      if (!T.flown) { T.flown = true; T.k = 0; const d = cam.position.distanceTo(H.pos);
        if (d > 30) { flash(0.85, 0.8); cam.position.copy(H.pos); cam.quaternion.copy(H.quat); cam.fov = H.fov; cam.updateProjectionMatrix(); fly = null; hold = { s: H, t: 0 }; T.waitDock = 1.3; }      // towers ring the city: cut to the harbor
        else { if (d > 2) { fly = { fromP: cam.position.clone(), fromQ: cam.quaternion.clone(), fromF: cam.fov, to: H, t: 0, dur: 1.4 }; hold = null; } T.waitDock = 0.3; } }
      if (!fly && T.k > T.waitDock) { T.st = 'ride'; T.k = 0; T.v = 0; boatSound(7.5); } return false; }
    if (T.st === 'ride') { const b = HB.boat; T.v = Math.min(26, T.v + dt * 11); b.position.z += T.v * dt; b.position.y = waveH(b.position.x, b.position.z, t, 0.35) * 0.8 + Math.min(0.35, T.v * 0.02); b.rotation.set(-Math.min(0.12, T.v * 0.006), 0, Math.sin(t * 3) * 0.03);
      HB.wake.material.opacity = Math.min(0.8, T.v / 18); chase(b, 8, 3, 14, dt * 2.5); cam.fov += (66 - cam.fov) * Math.min(1, dt * 2); cam.updateProjectionMatrix();
      if (T.k > 1.9 && !T.wiped) { T.wiped = true; waveWipe(); }
      if (T.k > 2.4) { setZone('bay'); T.st = 'cruise'; T.k = 0; const h = BAY.hero || (BAY.hero = (() => { const hb = baySpeedboat('#ff2d8f', 6.5); bayRider(hb, '#38e8ff'); const w = bayWake(20); w.position.set(0, 0.08, -3); hb.add(w); BAY.scene.add(hb); return hb; })());
        h.visible = true; h.position.set(34, 0, 250); h.rotation.set(0, Math.atan2(-24, -230), 0); cam.position.copy(h.position).add(new THREE.Vector3(5, 3, 8)); }
      return true; }
  } else {
    if (T.st === 'dock') { T.st = 'ride'; T.k = 0; T.v = 0; boatSound(7); const h = BAY.hero || (BAY.hero = (() => { const hb = baySpeedboat('#ff2d8f', 6.5); bayRider(hb, '#38e8ff'); const w = bayWake(20); w.position.set(0, 0.08, -3); hb.add(w); BAY.scene.add(hb); return hb; })());
      h.visible = true; h.position.set(14, 0, -24); h.rotation.set(0, 0.25, 0); }
    if (T.st === 'ride') { const h = BAY.hero; T.v = Math.min(28, T.v + dt * 12); h.position.addScaledVector(new THREE.Vector3(Math.sin(h.rotation.y), 0, Math.cos(h.rotation.y)), T.v * dt); h.position.y = waveH(h.position.x, h.position.z, t) * 0.8 + 0.3;
      h.rotation.x = -Math.min(0.12, T.v * 0.006); chase(h, 8, 3, 14, dt * 2.2); bayTick(dt, t); cam.fov += (66 - cam.fov) * Math.min(1, dt * 2); cam.updateProjectionMatrix();
      if (T.k > 1.9 && !T.wiped) { T.wiped = true; waveWipe(); }
      if (T.k > 2.4) { h.visible = false; setZone('city'); T.st = 'cruise'; T.k = 0; HB.boat.position.set(HB.moor.x, 0, HB.moor.z + 46); HB.boat.rotation.set(0, Math.PI, 0); cam.position.copy(HB.boat.position).add(new THREE.Vector3(2, 3, 9)); }
      return true; }
  }
  if (T.st === 'cruise') {
    if (T.mode === 'boatOut') { const h = BAY.hero, k = Math.min(1, T.k / 3.6), v = 30 - k * 12; h.position.add(new THREE.Vector3(Math.sin(h.rotation.y), 0, Math.cos(h.rotation.y)).multiplyScalar(v * dt)); h.position.y = waveH(h.position.x, h.position.z, t) * 0.8 + 0.3; h.rotation.x = -0.08;
      chase(h, 9, 3.4, 16, dt * 3); bayTick(dt, t); }
    else { const b = HB.boat, k = Math.min(1, T.k / 3.2), v = 20 * (1 - k) + 1.5; b.position.z = Math.max(HB.moor.z, b.position.z - v * dt); b.position.y = waveH(b.position.x, b.position.z, t, 0.35) * 0.8 + 0.2; b.rotation.x = -0.06 * (1 - k);
      HB.wake.material.opacity = 0.7 * (1 - k); chase(b, 9, 3.2, 16, dt * 3); }
    cam.fov += (60 - cam.fov) * Math.min(1, dt * 2); cam.updateProjectionMatrix();
    if (T.k > (T.mode === 'boatOut' ? 3.6 : 3.2)) { const s = T.shot; TR.on = false; T.st = null; T.k = 0; T.flown = false; T.wiped = false; if (BAY.hero && T.mode === 'boatOut') setTimeout(() => { if (ZONES.cur === 'bay' && BAY.hero) BAY.hero.visible = false; }, 2600);
      if (s.walk || s.follow || s.orbit) startMove(s); else { fly = { fromP: cam.position.clone(), fromQ: cam.quaternion.clone(), fromF: cam.fov, to: s, t: 0, dur: 2.6 }; hold = null; }
      setTimeout(postState, 50); return false; }
    return true;
  }
  return true;
}
// ---------------------------------------------------------------- CRIMSON SUMMIT: martial-arts tournament mountain (temple ring, lava pit, ice peak, waterfall cliff), reached by helicopter
const SM = { scene: new THREE.Scene(), pairs: [], crowd: [], viewers: {}, fx: [], monks: [], drums: [], banners: [], braz: [] };
const smM = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75 }, o || {}));
const SM_STONE = smM(0x6a6470, { roughness: 0.9 }), SM_DSTONE = smM(0x3e3a46, { roughness: 0.95 }), SM_RED = smM(0xa8202a, { roughness: 0.55 }), SM_WOOD = smM(0x3a2218),
  SM_GOLD = smM(0xd8a838, { metalness: 0.7, roughness: 0.35, emissive: 0x3a2400 }), SM_ROOF = smM(0x23242e, { roughness: 0.6, metalness: 0.3 });
function smTex(w, h, draw, rep) { const [c, t] = zCanvasTex(w, h); draw(c.getContext('2d'), w, h); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.needsUpdate = true; return t; }
// ---- helicopter (used for the trip in the city and on the summit)
function heliModel(col) {
  const g = new THREE.Group(), paint = smM(col, { metalness: 0.55, roughness: 0.35 }), dark = smM(0x15141c, { metalness: 0.6, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.7, 20, 14), paint); body.scale.set(1, 0.85, 1.75); g.add(body);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1.35, 16, 12), smM(0x0c1420, { metalness: 0.9, roughness: 0.05, emissive: 0x0a2a40 })); glass.scale.set(0.95, 0.75, 1); glass.position.set(0, 0.25, 1.55); g.add(glass);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.12, 4.2), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xff2d8f, emissiveIntensity: 2 })); stripe.position.y = -0.35; g.add(stripe);
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.5, 7, 10), paint); boom.rotation.x = Math.PI / 2; boom.position.set(0, 0.35, -5.6); g.add(boom);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.8, 1.1), paint); fin.position.set(0, 1.1, -8.9); fin.rotation.x = -0.3; g.add(fin);
  const tail = new THREE.Group(); tail.position.set(0.25, 1.2, -9); g.add(tail); [0, Math.PI / 2].forEach(a => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.6, 0.18), dark); b.rotation.x = a; tail.add(b); });
  [-1.05, 1.05].forEach(x => { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.6, 8), dark); sk.rotation.x = Math.PI / 2; sk.position.set(x, -1.75, 0.2); g.add(sk);
    [-1, 1.2].forEach(z => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), dark); st.position.set(x * 0.9, -1.35, z); st.rotation.z = x > 0 ? 0.35 : -0.35; g.add(st); }); });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8), dark); mast.position.y = 1.65; g.add(mast);
  const rotor = new THREE.Group(); rotor.position.y = 1.95; g.add(rotor); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 6.4), dark); b.position.z = 3.2; const p = new THREE.Group(); p.rotation.y = i * Math.PI / 2; p.add(b); rotor.add(p); }
  const blur = new THREE.Mesh(new THREE.CircleGeometry(6.6, 40), new THREE.MeshBasicMaterial({ color: 0x9aa0b8, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide })); blur.rotation.x = -Math.PI / 2; blur.position.y = 1.96; g.add(blur);
  const nl = (c, x, y, z) => { const s = zGlowSprite(c, 1.4, 0.2); s.position.set(x, y, z); g.add(s); return s; };
  const strobe = nl('rgb(255,255,255)', 0, -0.9, -1); nl('rgb(255,40,60)', -1.7, 0, 0.3); nl('rgb(60,255,120)', 1.7, 0, 0.3);
  const spot = new THREE.Mesh(new THREE.ConeGeometry(4, 22, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2d8, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  spot.position.set(0, -11.5, 3); spot.rotation.x = 0.25; g.add(spot);
  g.userData = { rotor, tail, blur, strobe, spin: 0 }; return g;
}
function heliTick(h, dt, t, spin) {
  const u = h.userData; u.spin += (spin - u.spin) * Math.min(1, dt * 1.5); u.rotor.rotation.y += dt * u.spin * 34; u.tail.rotation.x += dt * u.spin * 60;
  u.blur.material.opacity = Math.min(0.22, u.spin * 0.22); u.strobe.visible = (t % 1.2) < 0.12;
}
// ---- fighters: articulated rigs that spar
function fighterRig(gi, beltC, skinC, hairC, pants) {
  const g = new THREE.Group(), giM = smM(gi), skinM = smM(skinC, { roughness: 0.6 }), beltM = smM(beltC, { emissive: beltC, emissiveIntensity: 0.25 }), hairM = smM(hairC), pM = smM(pants || gi);
  const hips = new THREE.Group(); hips.position.y = 0.95; g.add(hips);
  const chest = new THREE.Group(); hips.add(chest);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.28), giM); torso.position.y = 0.36; chest.add(torso);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.09, 0.31), beltM); belt.position.y = 0.07; chest.add(belt);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 8), skinM); neck.position.y = 0.72; chest.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), skinM); head.position.y = 0.86; chest.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.158, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM); hair.position.y = 0.88; hair.rotation.x = -0.25; chest.add(hair);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.02, 6, 20), beltM); band.rotation.x = Math.PI / 2; band.position.y = 0.9; chest.add(band);
  const face = new THREE.Group(); face.position.y = 0.86; chest.add(face); { const eyeM = smM(0x0c0a10), brM = hairM, nM = smM(new THREE.Color(skinC).multiplyScalar(0.88).getHex(), { roughness: 0.6 });
    [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.024, 0.014), eyeM); e.position.set(s * 0.05, 0.012, 0.136); face.add(e);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.014, 0.016), brM); b.position.set(s * 0.05, 0.045, 0.132); b.rotation.z = s * 0.25; face.add(b);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), skinM); ear.position.set(s * 0.148, 0, -0.005); face.add(ear); });
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.045, 0.03), nM); n.position.set(0, -0.012, 0.146); face.add(n);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.013, 0.012), smM(0x5a2424)); m.position.set(0, -0.06, 0.132); face.add(m); }
  const limb = (len, r, mat, endMat, endR) => { const p = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, len, 8), mat); m.position.y = -len / 2; p.add(m);
    const j = new THREE.Group(); j.position.y = -len; p.add(j); if (endMat) { const e = new THREE.Mesh(new THREE.SphereGeometry(endR, 10, 8), endMat); j.add(e); } return [p, j]; };
  const arm = s => { const [up, el] = limb(0.3, 0.07, giM); up.position.set(s * 0.31, 0.6, 0); chest.add(up); const [fo, wr] = limb(0.28, 0.055, skinM, skinM, 0.07); el.add(fo); return { s: up, e: fo, fist: wr }; };
  const leg = s => { const [th, kn] = limb(0.46, 0.1, pM); th.position.set(s * 0.13, 0, 0); hips.add(th); const [sh, an] = limb(0.44, 0.075, pM); kn.add(sh);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.26), skinM); foot.position.set(0, -0.02, 0.07); an.add(foot); return { h: th, k: sh, foot: an }; };
  const F = { g, hips, chest, head, face, aL: arm(-1), aR: arm(1), lL: leg(-1), lR: leg(1), act: null, next: 0, hit: 0, ph: Math.random() * 7 };
  return F;
}
const SKINS = [0xe0b090, 0xc58c64, 0x8c5c40, 0x553420, 0xf0c8a8];
const GI = [[0xf2f0ea, 0x1a1a1a], [0xb81e2a, 0xd8a838], [0x1e3a8a, 0xf2f0ea], [0x16161c, 0xb81e2a], [0xe8a020, 0x16161c], [0x2a7a4a, 0x16161c], [0x6a2a9a, 0xd8a838], [0xf2f0ea, 0xb81e2a]];
function smSpark(scn, pos, col) { const s = zGlowSprite(col || 'rgb(255,220,140)', 0.2, 0.15); s.position.copy(pos); scn.add(s); SM.fx.push({ s, t: 0 }); }
function poseFighter(F, t, dt, foe) {
  const yaw = Math.atan2(foe.g.position.x - F.g.position.x, foe.g.position.z - F.g.position.z); F.g.rotation.y = yaw;
  const bounce = Math.abs(Math.sin(t * 5.2 + F.ph)); F.hips.position.y = 0.92 + bounce * 0.05;
  // guard
  let sL = -1.05, eL = -1.55, sR = -0.85, eR = -1.75, hL = -0.28, kL = 0.45, hR = 0.22, kR = 0.4, lean = 0.12, twist = 0, sideL = 0, sideR = 0;
  const a = F.act; if (a) { const u = (t - a.t0) / a.dur, k = u < 0.35 ? u / 0.35 : Math.max(0, 1 - (u - 0.35) / 0.65), kk = Math.sin(Math.min(1, u) * Math.PI);
    if (a.type === 'jab') { sL = -1.05 - 0.55 * k; eL = -1.55 + 1.5 * k; twist = -0.25 * k; }
    else if (a.type === 'cross') { sR = -0.85 - 0.75 * k; eR = -1.75 + 1.7 * k; twist = 0.45 * k; lean = 0.12 + 0.12 * k; }
    else if (a.type === 'upper') { sR = -0.85 - 1.9 * kk; eR = -1.75 + 0.6 * kk; F.hips.position.y -= 0.12 * (1 - kk); lean = 0.05; }
    else if (a.type === 'kick') { const c = u < 0.3 ? u / 0.3 : 1, ex = u < 0.3 ? 0 : u < 0.55 ? (u - 0.3) / 0.25 : Math.max(0, 1 - (u - 0.55) / 0.45); hR = 0.22 - 1.65 * (u < 0.55 ? c : ex); kR = 0.4 + 1.4 * c * (1 - ex) - (u >= 0.55 ? 1.4 * (1 - ex) : 0); kR = Math.max(0, u < 0.3 ? 0.4 + 1.6 * c : u < 0.55 ? 2 * (1 - (u - 0.3) / 0.25) : 0.4 * (1 - ex)); lean = -0.15 * kk; }
    else if (a.type === 'spin') { F.g.rotation.y = yaw + Math.PI * 2 * Math.min(1, u * 1.2); hR = -1.2 * kk; kR = 0.2; lean = -0.2 * kk; }
    else if (a.type === 'block') { sL = -1.6; eL = -1.4; sR = -1.6; eR = -1.4; lean = -0.05; }
    else if (a.type === 'hop') F.hips.position.y += kk * 0.45;
    if (!a.landed && u > 0.33 && a.type !== 'block' && a.type !== 'hop') { a.landed = true; if (Math.random() < 0.7) { foe.hit = t; const p = new THREE.Vector3(); (a.type === 'kick' || a.type === 'spin' ? F.lR.foot : a.type === 'jab' ? F.aL.fist : F.aR.fist).getWorldPosition(p); smSpark(F.g.parent, p); fgHitNear(p); } }
    if (u >= 1) F.act = null; }
  const h = t - F.hit; if (h < 0.35) { lean = -0.35 * Math.sin(h / 0.35 * Math.PI); F.g.position.addScaledVector(new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), -dt * 1.2); }
  F.aL.s.rotation.set(sL, 0, -0.25 + sideL); F.aL.e.rotation.x = eL; F.aR.s.rotation.set(sR, 0, 0.25 + sideR); F.aR.e.rotation.x = eR;
  F.lL.h.rotation.x = hL; F.lL.k.rotation.x = kL; F.lR.h.rotation.x = hR; F.lR.k.rotation.x = kR; F.chest.rotation.set(lean, twist, 0); F.hips.rotation.y = -0.35;
}
function smPair(scn, cx, cy, cz, i0, i1, along) {
  const mk = i => { const [gi, b] = GI[i % GI.length]; const F = fighterRig(gi, b, SKINS[(i * 3) % SKINS.length], [0x111111, 0x3a2414, 0x8a8a8a, 0xb84020][i % 4]); scn.add(F.g); return F; };
  const A = mk(i0), B = mk(i1), d = along || 0; A.g.position.set(cx - 1.4 * Math.cos(d), cy, cz - 1.4 * Math.sin(d)); B.g.position.set(cx + 1.4 * Math.cos(d), cy, cz + 1.4 * Math.sin(d));
  const P = { A, B, c: new THREE.Vector3(cx, cy, cz), d }; SM.pairs.push(P); return P;
}
function pairTick(P, t, dt) {
  [P.A, P.B].forEach((F, i) => { const foe = i ? P.A : P.B;
    if (!F.act && t > F.next) { const r = Math.random(); F.act = { type: r < 0.25 ? 'jab' : r < 0.45 ? 'cross' : r < 0.62 ? 'kick' : r < 0.7 ? 'upper' : r < 0.76 ? 'spin' : r < 0.9 ? 'block' : 'hop', t0: t, dur: 0.45 + Math.random() * 0.25 };
      if (F.act.type === 'spin') F.act.dur = 0.8; F.next = t + F.act.dur + 0.25 + Math.random() * 0.9; }
    poseFighter(F, t, dt, foe);
    const gap = F.g.position.distanceTo(foe.g.position); if (gap < 2.3) F.g.position.addScaledVector(F.g.position.clone().sub(foe.g.position).setY(0).normalize(), dt * 0.8);   // keep fighting range
    if (gap > 3.2) F.g.position.addScaledVector(foe.g.position.clone().sub(F.g.position).setY(0).normalize(), dt * 0.9);
    const off = F.g.position.clone().sub(P.c).setY(0); if (off.length() > 3.4) F.g.position.addScaledVector(off.normalize(), -dt * 1.5); F.g.position.y = P.c.y; });
}
// ---- crowd + other npcs
function smPerson(col, name, skin) {
  const g = NPC.make({ style: 'casual', col, skin });
  if (name) { const s = nameSprite(name, g.userData.col); s.position.y = 2.35; g.add(s); }
  return g;
}
// ---------------------------------------------------------------- build
function buildSummit() {
  const S = SM.scene; S.fog = new THREE.FogExp2(0x3a1838, 0.0019);
  // dusk sky + giant moon
  { const t = smTex(2048, 1024, (x) => { const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#060a22'); g.addColorStop(0.5, '#1e1240'); g.addColorStop(0.78, '#5a1a40'); g.addColorStop(0.92, '#c03a30'); g.addColorStop(1, '#ff8a4a');
      x.fillStyle = g; x.fillRect(0, 0, 2048, 512); x.fillStyle = '#2a1028'; x.fillRect(0, 512, 2048, 512); const R = zRand(3);
      for (let i = 0; i < 900; i++) { const y = Math.pow(R(), 1.6) * 380; x.fillStyle = `rgba(255,245,255,${(0.25 + R() * 0.75) * (1 - y / 400)})`; x.fillRect(R() * 2048, y, 1.5, 1.5); }
      for (let i = 0; i < 26; i++) { const cx = R() * 2048, cy = 420 + R() * 80, w = 100 + R() * 260; for (const dx of [-2048, 0, 2048]) { x.fillStyle = `rgba(255,${110 + R() * 60 | 0},90,${0.08 + R() * 0.12})`; x.beginPath(); x.ellipse(cx + dx, cy, w, 3 + R() * 6, 0, 0, 7); x.fill(); } } });
    S.add(zSky(t, 1600));
    const mt = smTex(512, 512, (x) => { const g = x.createRadialGradient(256, 256, 0, 256, 256, 250); g.addColorStop(0, '#fff6e6'); g.addColorStop(0.9, '#f0d8c0'); g.addColorStop(1, 'rgba(240,216,192,0)');
      x.fillStyle = g; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill(); const R = zRand(8); for (let i = 0; i < 26; i++) { const cx = 120 + R() * 280, cy = 120 + R() * 280, r = 8 + R() * 40; x.fillStyle = `rgba(150,120,120,${0.12 + R() * 0.15})`; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); } });
    const moonDir = new THREE.Vector3(-0.35, 0.3, -0.89).normalize(), moon = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshBasicMaterial({ map: mt, transparent: true, fog: false, depthWrite: false }));
    moon.position.copy(moonDir).multiplyScalar(1300); moon.lookAt(0, 0, 0); S.add(moon); const mg = zGlowSprite('rgb(255,200,180)', 760, 0.04); mg.material.opacity = 0.35; mg.position.copy(moon.position); S.add(mg);
    S.add(new THREE.HemisphereLight(0xb08ad8, 0x2a1020, 0.6)); const ml = new THREE.DirectionalLight(0xd8c8ff, 0.45); ml.position.copy(moonDir).multiplyScalar(100); S.add(ml); }
  // sea of clouds + distant peaks
  { const ct = smTex(512, 512, (x) => { x.fillStyle = '#6a3a6a'; x.fillRect(0, 0, 512, 512); const R = zRand(12); for (let i = 0; i < 260; i++) { const cx = R() * 512, cy = R() * 512, r = 20 + R() * 70;
      for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) { const g = x.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, r); g.addColorStop(0, `rgba(255,${190 + R() * 50 | 0},${200 + R() * 40 | 0},0.22)`); g.addColorStop(1, 'rgba(255,200,220,0)'); x.fillStyle = g; x.fillRect(cx + dx - r, cy + dy - r, r * 2, r * 2); } } }, [10, 10]);
    SM.cloudTex = ct; const cl = new THREE.Mesh(new THREE.PlaneGeometry(3200, 3200), new THREE.MeshStandardMaterial({ map: ct, emissive: 0xffffff, emissiveMap: ct, emissiveIntensity: 0.35, roughness: 1 })); cl.rotation.x = -Math.PI / 2; cl.position.y = -34; S.add(cl);
    const R = zRand(21), rock = smM(0x2a2230, { roughness: 1, flatShading: true }), snow = smM(0xe8e4f0, { roughness: 0.9, flatShading: true });
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + R() * 0.3, d = 260 + R() * 420, h = 80 + R() * 170, r = 40 + R() * 70, g = new THREE.ConeGeometry(r, h, 7, 4), p = g.attributes.position;
      for (let k = 0; k < p.count; k++) if (p.getY(k) < h / 2 - 1) { p.setX(k, p.getX(k) * (0.75 + R() * 0.5)); p.setZ(k, p.getZ(k) * (0.75 + R() * 0.5)); } g.computeVertexNormals();
      const m = new THREE.Mesh(g, rock); m.position.set(Math.cos(a) * d, -34 + h / 2 - 20, Math.sin(a) * d); S.add(m);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.32, h * 0.3, 7), snow); cap.position.set(m.position.x, m.position.y + h * 0.36, m.position.z); S.add(cap); } }
  // the mountain: main plateau, lava terrace, ice peak, waterfall ledge
  const rockM = smM(0x3a3240, { roughness: 1, flatShading: true });
  const crag = (r, h, x, y, z, seed) => { const g = new THREE.CylinderGeometry(r, r * 1.5, h, 18, 6), p = g.attributes.position, R = zRand(seed);
    for (let k = 0; k < p.count; k++) { if (p.getY(k) > h / 2 - 0.1) continue; const s = 0.85 + R() * 0.3; p.setX(k, p.getX(k) * s); p.setZ(k, p.getZ(k) * s); } g.computeVertexNormals();
    const m = new THREE.Mesh(g, rockM); m.position.set(x, y - h / 2, z); S.add(m); return m; };
  crag(50, 90, 0, 0, 0, 1);
  const tiles = smTex(512, 512, (x) => { x.fillStyle = '#5a5462'; x.fillRect(0, 0, 512, 512); const R = zRand(4); for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const v = 80 + R() * 30 | 0; x.fillStyle = `rgb(${v},${v - 6},${v + 8})`; x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } }, [14, 14]);
  const top = new THREE.Mesh(new THREE.CircleGeometry(49.5, 64), smM(0xffffff, { map: tiles, roughness: 0.85 })); top.rotation.x = -Math.PI / 2; top.position.y = 0.02; S.add(top);
  crag(17, 70, -64, -14, 8, 2); crag(13, 60, -8, -10, 60, 3);
  { const g = new THREE.ConeGeometry(30, 78, 9, 5), p = g.attributes.position, R = zRand(6); for (let k = 0; k < p.count; k++) { if (p.getY(k) > 30) { p.setX(k, p.getX(k) * 0.2 + Math.sign(p.getX(k)) * 0); } p.setX(k, p.getX(k) * (0.85 + R() * 0.3)); p.setZ(k, p.getZ(k) * (0.85 + R() * 0.3)); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, rockM); m.position.set(44, -21, -60); S.add(m);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(11, 13, 2.5, 18), smM(0x9a98aa, { roughness: 0.95 })); cap.position.set(44, 17.2, -60); S.add(cap);
    const snowG = new THREE.ConeGeometry(16, 26, 9, 3); const sn = new THREE.Mesh(snowG, smM(0x8a889c, { roughness: 1, flatShading: true })); sn.position.set(44, 4, -60); S.add(sn); }
  // ---- main fight ring + temple
  { const ring = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 18), SM_STONE); ring.position.y = 0.4; S.add(ring);
    const rt = smTex(512, 512, (x) => { x.fillStyle = '#4a4452'; x.fillRect(0, 0, 512, 512); x.strokeStyle = '#d8a838'; x.lineWidth = 10; x.strokeRect(16, 16, 480, 480); x.lineWidth = 6; x.beginPath(); x.arc(256, 256, 150, 0, 7); x.stroke();
      x.fillStyle = 'rgba(184,30,42,0.85)'; x.beginPath(); x.arc(256, 256, 120, 0, 7); x.fill(); x.fillStyle = '#d8a838'; x.font = '46px Anton, Impact, sans-serif'; x.textAlign = 'center'; x.fillText('CRIMSON', 256, 250); x.fillText('SUMMIT', 256, 298); });
    const rtop = new THREE.Mesh(new THREE.PlaneGeometry(17.6, 17.6), smM(0xffffff, { map: rt, roughness: 0.7, emissive: 0xffffff, emissiveMap: rt, emissiveIntensity: 0.12 })); rtop.rotation.x = -Math.PI / 2; rtop.position.y = 0.81; S.add(rtop);
    [[-9, -9], [9, -9], [-9, 9], [9, 9]].forEach(([x, z]) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 1.4, 10), SM_GOLD); b.position.set(x, 1.5, z); S.add(b);
      const f = zGlowSprite('rgb(255,140,40)', 3.4, 0.08); f.position.set(x, 2.8, z); S.add(f); const L = new THREE.PointLight(0xff8a3a, 1.2, 22, 2); L.position.set(x, 3.2, z); S.add(L); SM.braz.push({ f, L, ph: Math.random() * 7 }); });
    [[-15, 9], [15, 9], [-12.5, -10.5], [12.5, -10.5]].forEach(([x, z], i) => { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 9, 6), SM_WOOD); pole.position.set(x, 4.5, z); S.add(pole);
      const bt = smTex(128, 512, (c) => { c.fillStyle = i % 2 ? '#a8202a' : '#16161c'; c.fillRect(0, 0, 128, 512); c.fillStyle = '#d8a838'; c.fillRect(0, 0, 128, 14); c.fillRect(0, 498, 128, 14); c.beginPath(); c.arc(64, 140, 40, 0, 7); c.fill();
        c.fillStyle = i % 2 ? '#a8202a' : '#16161c'; c.beginPath(); c.arc(64, 140, 26, 0, 7); c.fill(); c.fillStyle = '#d8a838'; c.font = '44px Anton, Impact, sans-serif'; c.textAlign = 'center'; 'FIGHT'.split('').forEach((ch, k) => c.fillText(ch, 64, 240 + k * 52)); });
      const bn = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 5.6, 1, 8), smM(0xffffff, { map: bt, side: THREE.DoubleSide, roughness: 0.9 })); bn.position.set(x + (x < 0 ? -0.75 : 0.75), 6, z); S.add(bn); SM.banners.push(bn); }); }
  { const T = new THREE.Group(); T.position.set(0, 0, -30); S.add(T);
    const base = new THREE.Mesh(new THREE.BoxGeometry(32, 2, 16), SM_DSTONE); base.position.y = 1; T.add(base);
    for (let i = 0; i < 6; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(10, 0.34, 1), SM_STONE); st.position.set(0, 0.17 + i * 0.34, 8.5 + (5 - i) * 0.9 - 4); T.add(st); }
    const hall = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 11), smM(0x2a1a16)); hall.position.y = 6; T.add(hall);
    for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 8, 12), SM_RED); p.position.set(-10.5 + i * 3, 6, 6.2); T.add(p); }
    const roof = (w, d, y, h) => { const g = new THREE.ConeGeometry(1, 1, 4, 1); g.rotateY(Math.PI / 4); const m = new THREE.Mesh(g, SM_ROOF); m.scale.set(w * 0.75, h, d * 0.75); m.position.y = y; T.add(m);
      const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.3, d + 1), SM_ROOF); eave.position.y = y - h / 2; T.add(eave); const trim = new THREE.Mesh(new THREE.BoxGeometry(w + 1.1, 0.12, d + 1.1), SM_GOLD); trim.position.y = y - h / 2 - 0.2; T.add(trim); };
    roof(28, 15, 12, 3.4); const up = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 7), smM(0x2a1a16)); up.position.y = 15.4; T.add(up); roof(18, 10, 19, 3);
    [-7, 7].forEach(x => { const o = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.4, 6), SM_GOLD); o.position.set(x, 20.4, 0); T.add(o); });
    const sc = zScreen('GAMEPLAY', 'SCREEN_GAMEPLAY_SUMMIT', 13.6, 7.65, 'summit', 0xd8a838); sc.position.set(0, 6.25, 7.5); T.add(sc);
    const plaque = bayNeonSign([{ t: 'CRIMSON SUMMIT', y: 0.42, c: '#ff3a3a', fill: '#ffe0a0' }, { t: 'TOURNAMENT OF FISTS', y: 0.82, c: '#d8a838', f: 'bold 56px Poppins, sans-serif', fill: '#ffd98a' }], 1024, 260, '#ff3a3a', 12);
    plaque.position.set(0, 16, 3.6); T.add(plaque); SM.plaque = plaque;
    // drummers on the steps
    [-10.2, 10.2].forEach((x, i) => { const dr = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.9, 20), smM(0x8a3a1a)); dr.rotation.x = Math.PI / 2; dr.position.set(x, 2.9, 4.6); T.add(dr);
      const skin = new THREE.Mesh(new THREE.CircleGeometry(0.7, 20), smM(0xe8dcc0)); skin.position.set(x, 2.9, 5.06); T.add(skin);
      const p = smPerson(0xf2f0ea, null, SKINS[i + 1]); p.position.set(x, 2.04, 6.2); p.rotation.y = Math.PI; T.add(p); SM.drums.push(p); }); }
  // gate, trees, lanterns
  { const G = new THREE.Group(); G.position.set(0, 0, 24); S.add(G);
    [-6, 6].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 11, 14), SM_RED); p.position.set(x, 5.5, 0); G.add(p); const f = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 14), SM_DSTONE); f.position.set(x, 0.3, 0); G.add(f); });
    const k1 = new THREE.Mesh(new THREE.BoxGeometry(17, 0.9, 1.1), SM_ROOF); k1.position.y = 11.2; G.add(k1); const k1b = new THREE.Mesh(new THREE.BoxGeometry(15, 0.6, 0.9), SM_RED); k1b.position.y = 10.5; G.add(k1b);
    const k2 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 0.7), SM_RED); k2.position.y = 8.6; G.add(k2); const tab = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 0.3), SM_DSTONE); tab.position.set(0, 9.6, 0.2); G.add(tab); }
  { const R = zRand(33), pink = [smM(0xff9ac8, { emissive: 0x5a1030, emissiveIntensity: 0.4, roughness: 0.8, flatShading: true }), smM(0xffb8d8, { emissive: 0x5a1030, emissiveIntensity: 0.35, roughness: 0.8, flatShading: true })], bark = smM(0x2a1a1a);
    [[-20, 14], [20, 14], [-27, -2], [27, -2], [-24, -18], [24, -18], [-14, 28], [14, 28], [-36, 16], [24, 34], [-38, -24], [36, -26]].forEach(([x, z], i) => {
      const t = new THREE.Group(); t.position.set(x, 0, z); S.add(t); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 4.5, 8), bark); tr.position.y = 2.25; tr.rotation.z = (R() - 0.5) * 0.3; t.add(tr);
      for (let k = 0; k < 3; k++) { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 3, 6), bark); br.position.set((k - 1) * 0.8, 4.5, (R() - 0.5)); br.rotation.z = (k - 1) * 0.7; t.add(br); }
      for (let k = 0; k < 8; k++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3 + R() * 0.9, 1), pink[k % 2]); c.position.set((R() - 0.5) * 4.6, 5.6 + R() * 1.8, (R() - 0.5) * 4.6); t.add(c); } }); }
  { const lan = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), SM_STONE); b.position.y = 0.15; g.add(b);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 8), SM_STONE); p.position.y = 1; g.add(p); const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), new THREE.MeshStandardMaterial({ color: 0x2a1a10, emissive: 0xffa040, emissiveIntensity: 1.6 })); box.position.y = 2; g.add(box);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.5, 4), SM_STONE); cap.rotation.y = Math.PI / 4; cap.position.y = 2.55; g.add(cap); };
    for (let i = 0; i < 6; i++) { lan(-4.5, 30 + i * 3.5 - 10); lan(4.5, 30 + i * 3.5 - 10); } [[-15, -12], [15, -12], [-15, 8], [15, 8]].forEach(([x, z]) => lan(x, z));
    const bulb = new THREE.MeshStandardMaterial({ color: 0x400808, emissive: 0xff3a2a, emissiveIntensity: 1.8 }); [[-12, 13, 12, 13]].forEach(([x1, z1, x2, z2]) => {
      for (let i = 0; i <= 10; i++) { const u = i / 10, l = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), bulb); l.scale.y = 1.3; l.position.set(x1 + (x2 - x1) * u, 10.8 - Math.sin(u * Math.PI) * 1.1, z1 + (z2 - z1) * u); S.add(l); } }); }
  // screens on stone towers + scroll board
  { const tower = (x, z, ry, type, nm, col) => { const t = new THREE.Mesh(new THREE.BoxGeometry(2.2, 6, 2.2), SM_DSTONE); t.position.set(x, 3, z); t.rotation.y = ry; S.add(t);
      const s = zScreen(type, nm, 8.8, 4.95, 'summit', col); s.position.set(x, 8.6, z); s.rotation.y = ry; S.add(s); };
    tower(-21, -7, 0.75, 'LIVECAM', 'SCREEN_LIVECAM_SUMMIT', 0xd8a838); tower(21, -7, -0.75, 'CHAT', 'SCREEN_CHAT_SUMMIT', 0xd8a838);
    const sb = zScreen('COMMANDS', 'SCREEN_COMMANDS_SUMMIT', 6.4, 3.6, 'summit', 0xa8202a); sb.position.set(-14, 3.4, 14); sb.rotation.y = 0.82; S.add(sb);
    [-1, 1].forEach(s => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.2, 6), SM_WOOD); p.position.set(-14 + s * 3.4 * Math.cos(0.82), 2.6, 14 - s * 3.4 * Math.sin(0.82)); S.add(p); }); }
  // helipad on the cliff edge
  { const pt = smTex(512, 512, (x) => { x.fillStyle = '#26242e'; x.fillRect(0, 0, 512, 512); x.strokeStyle = '#f0f0f0'; x.lineWidth = 16; x.beginPath(); x.arc(256, 256, 220, 0, 7); x.stroke();
      x.fillStyle = '#f0f0f0'; x.font = 'bold 300px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('H', 256, 270); });
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.5, 40), [SM_DSTONE, smM(0xffffff, { map: pt, roughness: 0.7 }), SM_DSTONE]); pad.position.set(38, 0.25, 16); S.add(pad);
    SM.padLights = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, s = zGlowSprite(i % 2 ? 'rgb(255,60,60)' : 'rgb(255,255,255)', 1.1, 0.2); s.position.set(38 + Math.cos(a) * 6.6, 0.7, 16 + Math.sin(a) * 6.6); S.add(s); SM.padLights.push(s); }
    SM.padY = 0.5 + 1.95; SM.padPos = new THREE.Vector3(38, SM.padY, 16);
    SM.heli = heliModel(0x1a1a24); SM.heli.position.copy(SM.padPos); SM.heli.rotation.y = -2.3; S.add(SM.heli); }
  // side arenas
  { const lavaT = smTex(512, 512, (x) => { x.fillStyle = '#5a0a00'; x.fillRect(0, 0, 512, 512); const R = zRand(14); for (let i = 0; i < 160; i++) { const cx = R() * 512, cy = R() * 512, r = 10 + R() * 60;
      for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) { const g = x.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, r); g.addColorStop(0, `rgba(255,${180 + R() * 70 | 0},40,0.85)`); g.addColorStop(1, 'rgba(255,60,0,0)'); x.fillStyle = g; x.fillRect(cx + dx - r, cy + dy - r, r * 2, r * 2); } } }, [3, 3]);
    SM.lava = lavaT; const lv = new THREE.Mesh(new THREE.CircleGeometry(16.5, 48), new THREE.MeshStandardMaterial({ color: 0x2a0500, emissive: 0xffffff, emissiveMap: lavaT, emissiveIntensity: 1.3 })); lv.rotation.x = -Math.PI / 2; lv.position.set(-64, -13.92, 8); S.add(lv);
    const ar = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.5, 1.4, 8), SM_DSTONE); ar.position.set(-64, -13.3, 8); S.add(ar);
    const L = new THREE.PointLight(0xff5a1a, 2.2, 45, 2); L.position.set(-64, -8, 8); S.add(L); SM.lavaL = L;
    smPair(S, -64, -12.6, 8, 3, 4, 0.4);
    const ice = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7, 0.8, 10), smM(0x5a7a9a, { roughness: 0.2, metalness: 0.2, emissive: 0x0a2a4a, emissiveIntensity: 0.3 })); ice.position.set(44, 18.8, -60); S.add(ice);
    const R = zRand(44); for (let i = 0; i < 14; i++) { const a = R() * 7, d = 7.5 + R() * 3, c = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), smM(0x6a9ac8, { transparent: true, opacity: 0.85, roughness: 0.1, emissive: 0x1a5aa8, emissiveIntensity: 0.35 }));
      const s = 0.6 + R() * 1.6; c.scale.set(s * 0.5, s * 2.2, s * 0.5); c.position.set(44 + Math.cos(a) * d, 18.4 + s, -60 + Math.sin(a) * d); c.rotation.z = (R() - 0.5) * 0.5; S.add(c); }
    const IL = new THREE.PointLight(0x7ac8ff, 0.8, 30, 2); IL.position.set(44, 24, -60); S.add(IL);
    smPair(S, 44, 19.2, -60, 5, 6, 1.2);
    const ledge = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.4, 1, 10), SM_STONE); ledge.position.set(-8, -9.5, 58); S.add(ledge);
    const wt = smTex(128, 512, (x) => { x.fillStyle = '#7ab8d8'; x.fillRect(0, 0, 128, 512); const R2 = zRand(7); for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${0.2 + R2() * 0.6})`; x.fillRect(R2() * 128, R2() * 512, 1 + R2() * 3, 30 + R2() * 120); } }, [3, 2]);
    SM.fall = wt; const wf = new THREE.Mesh(new THREE.PlaneGeometry(10, 70), new THREE.MeshStandardMaterial({ map: wt, emissive: 0x6aa8d0, emissiveMap: wt, emissiveIntensity: 0.6, transparent: true, opacity: 0.9, roughness: 0.2, side: THREE.DoubleSide }));
    wf.position.set(-8, -16, 70); S.add(wf); const cliff = new THREE.Mesh(new THREE.BoxGeometry(24, 80, 6), rockM); cliff.position.set(-8, -14, 74); S.add(cliff);
    SM.mist = []; for (let i = 0; i < 8; i++) { const s = zGlowSprite('rgb(220,240,255)', 10 + Math.random() * 8, 0.02); s.material.opacity = 0.18; s.position.set(-8 + (Math.random() - 0.5) * 12, -12 + Math.random() * 4, 66 + Math.random() * 3); S.add(s); SM.mist.push(s); }
    smPair(S, -8, -9, 58, 7, 0, -0.3); }
  // main ring fighters, referee, crowd, monks
  SM.main = smPair(S, 0, 0.8, 0, 1, 2, 0);
  SM.ref = fighterRig(0xf0f0f0, 0x111111, SKINS[1], 0x222222, 0x16161c); SM.ref.g.position.set(0, 0.8, -5); S.add(SM.ref.g);
  { const R = zRand(71), cols = [0xff2d8f, 0x38e8ff, 0xffd23a, 0x7dff6a, 0xb478ff, 0xff8a3a, 0xf2f0ea, 0xa8202a];
    for (let i = 0; i < 34; i++) { let a = i / 34 * Math.PI * 2; if (Math.abs(Math.sin(a)) > 0.9 && Math.cos(a) > -0.2 && Math.sin(a) < 0) continue; const r = 11.6 + (i % 2) * 1.6, p = smPerson(cols[i % cols.length]);
      p.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); p.lookAt(0, 0, 0); S.add(p); SM.crowd.push(p); }
    for (let i = 0; i < 4; i++) { const m = new THREE.Group(), robe = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 12), smM(0xd8701a)), h = new THREE.Mesh(headGeo, smM(SKINS[i % 5])); robe.position.y = 0.8; h.position.y = 1.75; m.add(robe, h);
      m.position.set([-14.5, -12.5, 12.5, 14.5][i], 2, -23.5); S.add(m); SM.monks.push(m); } }
  // particles: petals, embers, snow
  const pts = (n, col, size, box, add) => { const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), R = zRand(n); for (let i = 0; i < n; i++) p.set([box[0] + R() * box[3], box[1] + R() * box[4], box[2] + R() * box[5]], i * 3);
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size, transparent: true, opacity: 0.9, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending })); m.userData.box = box; S.add(m); return m; };
  SM.petals = pts(700, 0xffb0d0, 0.16, [-40, 0, -40, 80, 16, 80]); SM.embers = pts(260, 0xff7a2a, 0.22, [-78, -14, -6, 28, 18, 28], true); SM.snow = pts(360, 0xffffff, 0.14, [30, 18, -74, 28, 20, 28]);
}
function summitTick(dt, t) {
  SM.cloudTex.offset.x += dt * 0.004; SM.cloudTex.offset.y += dt * 0.0015; SM.lava.offset.x += dt * 0.02; SM.lava.offset.y -= dt * 0.012; SM.fall.offset.y += dt * 1.1;
  SM.lavaL.intensity = 2 + Math.sin(t * 3) * 0.5;
  SM.braz.forEach(b => { const f = 0.8 + Math.sin(t * 13 + b.ph) * 0.12 + Math.sin(t * 29 + b.ph) * 0.08; b.f.scale.setScalar(3.4 * f); b.L.intensity = 1.1 * f; });
  SM.banners.forEach((b, i) => { b.rotation.y = Math.sin(t * 1.3 + i) * 0.25; });
  SM.padLights.forEach((s, i) => s.material.opacity = (Math.floor(t * 4) % 12 === i) ? 1 : 0.35);
  SM.pairs.forEach(P => pairTick(P, t, dt));
  { const R = SM.ref, M = SM.main; R.g.position.x = Math.sin(t * 0.4) * 3; R.g.lookAt(M.A.g.position.x / 2 + M.B.g.position.x / 2, R.g.position.y, 0); R.hips.position.y = 0.92;
    R.aL.s.rotation.set(-0.3, 0, -0.2); R.aR.s.rotation.set(-0.3 - Math.max(0, Math.sin(t * 0.9)) * 1.2, 0, 0.2); R.aL.e.rotation.x = -0.4; R.aR.e.rotation.x = -0.2; }
  SM.fx = SM.fx.filter(f => { f.t += dt; f.s.scale.setScalar(0.2 + f.t * 9); f.s.material.opacity = Math.max(0, 1 - f.t / 0.28); if (f.t > 0.3) { f.s.parent && f.s.parent.remove(f.s); return false; } return true; });
  const hype = SM.fx.length > 0;
  SM.crowd.concat(Object.values(SM.viewers).map(v => v.o)).forEach((p, i) => { const ph = p.userData.ph, j = Math.abs(Math.sin(t * (hype ? 7 : 3.2) + ph)); p.position.y = j * (hype ? 0.28 : 0.1) + (p.userData.baseY || 0);
    const up = hype || Math.sin(t * 0.7 + ph) > 0.4; p.userData.arms.forEach((a, k) => { a.rotation.z = (k ? 1 : -1) * (up ? 2.6 + Math.sin(t * 9 + ph) * 0.3 : 0.15); }); });
  SM.drums.forEach((d, i) => { const h = Math.max(0, Math.sin(t * 7 + i * Math.PI)); d.userData.arms.forEach((a, k) => a.rotation.x = -1.2 - h * 0.9 * (k === (Math.floor(t * 2.2) % 2) ? 1 : 0.3)); });
  SM.monks.forEach((m, i) => { m.rotation.x = Math.max(0, Math.sin(t * 0.6 + i * 1.7)) * 0.35; });
  SM.plaque.material.opacity = 0.85 + Math.sin(t * 2) * 0.15;
  const drift = (P, vy, sway) => { const a = P.geometry.attributes.position, b = P.userData.box; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + vy * dt, x = a.getX(i) + Math.sin(t * 0.8 + i) * sway * dt;
    if (y < b[1]) y = b[1] + b[4]; if (y > b[1] + b[4]) y = b[1]; a.setXY(i, x, y); } a.needsUpdate = true; };
  drift(SM.petals, -0.9, 1.2); drift(SM.embers, 2.4, 0.6); drift(SM.snow, -1.6, 0.8);
  SM.mist.forEach((m, i) => m.material.opacity = 0.14 + Math.sin(t * 1.2 + i) * 0.06);
  if (!TR.on || (TR.mode !== 'heliOut' && TR.mode !== 'heliIn')) heliTick(SM.heli, dt, t, 0.15);
  if ((SM.syncT = (SM.syncT || 0) - dt) <= 0) { SM.syncT = 3; const live = new Set(spawned.map(w => w.user));
    Object.keys(SM.viewers).forEach(u => { if (!live.has(u)) { SM.scene.remove(SM.viewers[u].o); delete SM.viewers[u]; } });
    spawned.forEach((w, i) => { if (SM.viewers[w.user]) return; let col = w.o.userData.col || '#ff2d8f'; w.o.traverse(o => { if (o.isMesh && o.material && o.material.emissive && o.material.emissiveIntensity > 0.5 && !w.o.userData.col && col === '#ff2d8f') col = '#' + o.material.emissive.getHexString(); });
      const p = smPerson(new THREE.Color(col).getHex(), w.user), a = 0.4 + (Object.keys(SM.viewers).length * 0.37) % (Math.PI * 1.6), r = 15;
      p.position.set(Math.cos(a + 0.3) * r, 0, Math.sin(a + 0.3) * r); p.lookAt(0, 0, 0); SM.scene.add(p); SM.viewers[w.user] = { o: p }; }); }
}
// ---------------------------------------------------------------- helicopter trip
const zCloud = document.createElement('div'); zCloud.style.cssText = 'position:fixed;inset:-10%;pointer-events:none;z-index:7;opacity:0;transform:scale(1.25);background:radial-gradient(circle at 20% 30%,#fff 0,rgba(255,255,255,.95) 18%,rgba(255,255,255,0) 40%),radial-gradient(circle at 70% 25%,#fff 0,rgba(255,240,250,.95) 20%,rgba(255,255,255,0) 42%),radial-gradient(circle at 45% 70%,#fff 0,rgba(255,235,245,.95) 24%,rgba(255,255,255,0) 50%),radial-gradient(circle at 85% 75%,#fff 0,rgba(255,255,255,.9) 18%,rgba(255,255,255,0) 40%),linear-gradient(#f4eef8,#f4eef8)'; document.body.appendChild(zCloud);
function cloudWipe(inS, hold, outS) { zCloud.style.transition = `opacity ${inS}s ease-in, transform ${inS + hold + outS}s ease-out`; zCloud.style.opacity = 1; zCloud.style.transform = 'scale(1.0)';
  setTimeout(() => { zCloud.style.transition = `opacity ${outS}s ease-out, transform ${outS}s ease-out`; zCloud.style.opacity = 0; zCloud.style.transform = 'scale(1.35)'; }, (inS + hold) * 1000); }
function heliSound(len) {
  try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); if (zAC.state === 'suspended') zAC.resume(); const a = zAC, t0 = a.currentTime + 0.02;
    const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * len, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; const g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
    lfo.frequency.setValueAtTime(9, t0); lfo.frequency.linearRampToValueAtTime(19, t0 + 1.6); lg.gain.value = 0.11; lfo.connect(lg); lg.connect(g.gain);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.13, t0 + 1); g.gain.setValueAtTime(0.13, t0 + len - 1.2); g.gain.linearRampToValueAtTime(0.0001, t0 + len);
    n.buffer = b; n.connect(lp); lp.connect(g); g.connect(a.destination); n.start(t0); lfo.start(t0); lfo.stop(t0 + len); } catch (e) {}
}
function heliChase(h, back, up, side, k) {
  const fwd = new THREE.Vector3(Math.sin(h.rotation.y), 0, Math.cos(h.rotation.y)), right = new THREE.Vector3(fwd.z, 0, -fwd.x);
  const want = h.position.clone().addScaledVector(fwd, -back).addScaledVector(right, side).add(new THREE.Vector3(0, up, 0));
  cam.position.lerp(want, Math.min(1, k)); cam.quaternion.slerp(lookQuat(cam.position, h.position.clone().addScaledVector(fwd, 10).add(new THREE.Vector3(0, -1, 0))), Math.min(1, k));
}
function heliTripTick(dt, t) {
  const T = TR; T.k = (T.k || 0) + dt;
  if (!SM.cityHeli) { SM.cityHeli = heliModel(0x1a1a24); SM.cityHeli.visible = false; scene.add(SM.cityHeli); }
  const CHL = SM.cityHeli;
  if (T.mode === 'heliOut') {
    if (!T.st) { T.st = 'pickup'; T.k = 0; heliSound(T.from === 'city' ? 10 : 8); const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
      CHL.visible = true; CHL.position.copy(cam.position).addScaledVector(fwd, 16).add(new THREE.Vector3(0, 9, 0)); CHL.position.y = Math.max(CHL.position.y, 14); CHL.rotation.set(0, Math.atan2(fwd.x, fwd.z), 0); CHL.userData.spin = 1; T.p0 = CHL.position.clone(); }
    if (T.st === 'pickup') { CHL.position.y = T.p0.y - Math.min(1, T.k / 2) * 3 + Math.sin(t * 2) * 0.2; heliTick(CHL, dt, t, 1); heliChase(CHL, 13, 4.5, 3, dt * 1.6); cam.fov += (62 - cam.fov) * Math.min(1, dt * 2); cam.updateProjectionMatrix();
      if (T.k > 2.4) { T.st = 'climb'; T.k = 0; T.v = 0; } return true; }
    if (T.st === 'climb') { T.v = Math.min(45, T.v + dt * 22); const fwd = new THREE.Vector3(Math.sin(CHL.rotation.y), 0, Math.cos(CHL.rotation.y)); CHL.position.addScaledVector(fwd, T.v * dt); CHL.position.y += dt * (8 + T.v * 0.4); CHL.rotation.x = 0.18;
      heliTick(CHL, dt, t, 1); heliChase(CHL, 14, 4, 2, dt * 2.2);
      if (T.k > 1.6 && !T.wiped) { T.wiped = true; cloudWipe(0.55, 0.5, 1.2); }
      if (T.k > 2.3) { CHL.visible = false; setZone('summit'); T.st = 'approach'; T.k = 0; const H = SM.heli; H.position.set(-150, 70, 230); H.rotation.set(0.15, Math.atan2(38 + 150, 16 - 230), 0); H.userData.spin = 1; cam.position.copy(H.position).add(new THREE.Vector3(-10, 6, 14)); }
      return true; }
    if (T.st === 'approach') { const H = SM.heli, dur = 6.2, u = Math.min(1, T.k / dur), above = SM.padPos.clone().add(new THREE.Vector3(0, 16, 0));
      const start = new THREE.Vector3(-150, 70, 230); if (u < 0.7) { const e = u / 0.7, ee = 1 - Math.pow(1 - e, 2); H.position.lerpVectors(start, above, ee); H.position.y += Math.sin(e * Math.PI) * 18; H.rotation.x = 0.16 * (1 - e); }
      else { const e = (u - 0.7) / 0.3, ee = e * e * (3 - 2 * e); H.position.copy(above).lerp(SM.padPos, ee); H.rotation.x = 0; H.rotation.y += (-2.3 - H.rotation.y) * Math.min(1, dt * 1.5); }
      heliTick(H, dt, t, u < 0.92 ? 1 : 0.4); summitTick(dt, t); heliChase(H, u < 0.7 ? 16 : 20, u < 0.7 ? 5 : 9, u < 0.7 ? -6 : -12, dt * (u < 0.7 ? 2 : 1.2)); cam.fov += (58 - cam.fov) * Math.min(1, dt); cam.updateProjectionMatrix();
      if (T.k > dur + 0.3) return trFinish(); return true; }
  } else {
    if (!T.st) { T.st = 'takeoff'; T.k = 0; heliSound(8); }
    if (T.st === 'takeoff') { const H = SM.heli; H.userData.spin = Math.max(H.userData.spin, 0.6); heliTick(H, dt, t, 1); summitTick(dt, t);
      if (T.k < 1.2) { heliChase(H, 18, 7, -10, dt * 2); } else { T.v = Math.min(40, (T.v || 0) + dt * 20); H.position.y += dt * (6 + T.v * 0.5); const fwd = new THREE.Vector3(Math.sin(H.rotation.y), 0, Math.cos(H.rotation.y)); H.position.addScaledVector(fwd, T.v * dt); H.rotation.x = 0.16; heliChase(H, 15, 4, 2, dt * 2); }
      if (T.k > 2.6 && !T.wiped) { T.wiped = true; cloudWipe(0.55, 0.5, 1.2); }
      if (T.k > 3.3) { setZone('city'); T.st = 'arrive'; T.k = 0; H.position.copy(SM.padPos); H.rotation.set(0, -2.3, 0); CHL.visible = true; CHL.position.set(60, 120, 170); CHL.rotation.set(0.12, Math.atan2(-60, -170), 0); cam.position.copy(CHL.position).add(new THREE.Vector3(8, 8, 20)); }
      return true; }
    if (T.st === 'arrive') { const fwd = new THREE.Vector3(Math.sin(CHL.rotation.y), 0, Math.cos(CHL.rotation.y)); CHL.position.addScaledVector(fwd, 32 * dt); CHL.position.y -= dt * 10; heliTick(CHL, dt, t, 1); heliChase(CHL, 16, 5, 4, dt * 2);
      if (T.k > 2.6) { setTimeout(() => { if (SM.cityHeli) SM.cityHeli.visible = false; }, 3200); return trFinish(); } return true; }
  }
  return true;
}
function trFinish() { const s = TR.shot; TR.on = false; TR.st = null; TR.k = 0; TR.wiped = false;
  if (s.walk || s.follow || s.orbit) startMove(s); else { fly = { fromP: cam.position.clone(), fromQ: cam.quaternion.clone(), fromF: cam.fov, to: s, t: 0, dur: 2.8 }; hold = null; }
  setTimeout(postState, 50); return false; }
function cityHeliTick(dt, t) { if (SM.cityHeli && SM.cityHeli.visible && !TR.on) { const H = SM.cityHeli, fwd = new THREE.Vector3(Math.sin(H.rotation.y), 0, Math.cos(H.rotation.y)); H.position.addScaledVector(fwd, 30 * dt); H.position.y += dt * 4; heliTick(H, dt, t, 1); } }
// ---------------------------------------------------------------- ASHEN HOLLOW: foggy haunted town (theater square, mansion on the hill, church + graveyard, castle in the woods), reached by a ghost bus
const HW = { scene: new THREE.Scene(), zombies: [], lamps: [], crows: [], bats: [], viewers: {}, signs: [], mist: [], nextBolt: 6, bolt: 0 };
const hwM = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.9 }, o || {}));
function hwWall(base, lit, seed, boarded) {          // grimy wall texture with boarded / dimly lit windows
  return smTex(256, 256, (x) => { x.fillStyle = base; x.fillRect(0, 0, 256, 256); const R = zRand(seed);
    for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(0,0,0,${R() * 0.18})`; x.fillRect(R() * 256, R() * 256, 2 + R() * 14, 2 + R() * 22); }
    for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) { const wx = 22 + i * 78, wy = 30 + j * 112, on = R() < lit;
      x.fillStyle = on ? (R() < 0.5 ? '#ffb060' : '#c8e0a0') : '#07070a'; x.fillRect(wx, wy, 56, 72);
      if (boarded && !on && R() < 0.7) { x.fillStyle = '#4a3828'; for (let k = 0; k < 3; k++) { x.save(); x.translate(wx + 28, wy + 14 + k * 22); x.rotate((R() - 0.5) * 0.5); x.fillRect(-34, -5, 68, 10); x.restore(); } }
      x.strokeStyle = '#1a1614'; x.lineWidth = 5; x.strokeRect(wx, wy, 56, 72); } });
}
// ---- characters
function hwZombie(i) {
  const cl = [[0x4a4a3a, 0x2a2420], [0x5a3a3a, 0x1a1a1a], [0x3a4a5a, 0x3a3020], [0x6a6a60, 0x2a2a2a], [0x4a3a2a, 0x202a20]][i % 5];
  const F = fighterRig(cl[0], cl[1], [0x8a9a80, 0x7a8a78, 0x9aa08a][i % 3], [0x1a1a1a, 0x3a3a30, 0x5a5a50][i % 3], cl[1]);
  F.g.traverse(o => { if (o.isMesh && o.material && o.material.emissive) { o.material.emissiveIntensity = 0; } });
  F.face.children.forEach((c, k) => { if (k < 6 && k % 3 !== 2) c.visible = false; });
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.02), new THREE.MeshBasicMaterial({ color: 0xff3020 })); eyes.position.set(0, 0.88, 0.14); F.chest.add(eyes);
  F.spd = 0.35 + Math.random() * 0.3; F.lim = Math.random() < 0.5 ? 1 : -1; F.ph = Math.random() * 7; F.tgt = new THREE.Vector3(); F.wait = 0; F.lunge = 0; return F;
}
function zombieTick(F, t, dt) {
  if (F.wait > 0) F.wait -= dt;
  const to = F.tgt.clone().sub(F.g.position).setY(0), d = to.length();
  if (d < 1 || !F.tgtSet) { F.tgtSet = true; const a = Math.random() * Math.PI * 2, r = 4 + Math.random() * 17; F.tgt.set(Math.cos(a) * r, 0, Math.sin(a) * r + 2); if (Math.random() < 0.3) F.wait = 1.5 + Math.random() * 3; }
  const walk = F.wait <= 0, ph = t * F.spd * 6 + F.ph;
  if (walk) { const yaw = Math.atan2(to.x, to.z); F.g.rotation.y += Math.atan2(Math.sin(yaw - F.g.rotation.y), Math.cos(yaw - F.g.rotation.y)) * Math.min(1, dt * 1.5);
    const step = Math.max(0, Math.sin(ph)) * 0.8 + 0.2; F.g.position.addScaledVector(new THREE.Vector3(Math.sin(F.g.rotation.y), 0, Math.cos(F.g.rotation.y)), F.spd * dt * step); }
  if (Math.random() < dt * 0.04 && !F.lunge) F.lunge = t;
  const lg = F.lunge ? (t - F.lunge) / 0.9 : 1; if (lg >= 1) F.lunge = 0; const L = lg < 1 ? Math.sin(lg * Math.PI) : 0;
  const sw = walk ? Math.sin(ph) : 0;
  F.lL.h.rotation.x = sw * 0.45; F.lR.h.rotation.x = -sw * 0.45 * (F.lim > 0 ? 0.5 : 1); F.lL.k.rotation.x = Math.max(0, -sw) * 0.6 + 0.15; F.lR.k.rotation.x = Math.max(0, sw) * 0.6 + 0.15;
  F.aL.s.rotation.set(-1.35 - L * 0.3 + Math.sin(t * 1.7 + F.ph) * 0.12, 0, -0.1); F.aR.s.rotation.set(-1.25 - L * 0.35 + Math.sin(t * 1.3 + F.ph) * 0.15, 0, 0.1); F.aL.e.rotation.x = -0.15; F.aR.e.rotation.x = -0.25;
  F.chest.rotation.set(0.32 + L * 0.25, Math.sin(ph * 0.5) * 0.12, Math.sin(ph) * 0.12 * F.lim); F.head.rotation.z = 0.35 * F.lim; F.hips.position.y = 0.9 + Math.abs(sw) * 0.04; F.hips.rotation.y = 0;
}
function hwGhost() {
  const F = fighterRig(0xf0f0f8, 0xf0f0f8, 0xe8ecf4, 0x0a0a0a, 0xf0f0f8);
  F.g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.55; o.material.depthWrite = false; if (o.material.emissive) { o.material.emissive.setHex(0x9ab0d0); o.material.emissiveIntensity = 0.6; } } });
  F.face.visible = false;
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.55, 0.18), new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.8 })); hair.position.set(0, 0.68, 0.05); F.chest.add(hair);
  const dress = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xf0f0f8, emissive: 0x9ab0d0, emissiveIntensity: 0.5, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })); dress.position.y = -0.25; F.hips.add(dress);
  F.aL.s.rotation.set(0.05, 0, -0.08); F.aR.s.rotation.set(0.05, 0, 0.08); F.head.rotation.x = 0.35; return F;
}
function hwBird(scale) {
  const g = new THREE.Group(), m = hwM(0x0a0a0c, { roughness: 0.6 }), b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), m); b.scale.set(0.8, 0.8, 1.6); g.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), m); h.position.set(0, 0.12, 0.3); g.add(h); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 5), hwM(0x2a2a20)); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.1, 0.45); g.add(bk);
  const wing = s => { const p = new THREE.Group(), w = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.3), new THREE.MeshStandardMaterial({ color: 0x0a0a0c, side: THREE.DoubleSide })); w.position.x = s * 0.28; w.rotation.x = -Math.PI / 2; p.add(w); g.add(p); return p; };
  g.userData = { wl: wing(-1), wr: wing(1) }; g.scale.setScalar(scale || 1); return g;
}
function hwTree(h, seed) {
  const R = zRand(seed), g = new THREE.Group(), m = hwM(0x1c1814), add = (len, r, p, dir, lvl) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r, len, 5), m); c.position.copy(p).addScaledVector(dir, len / 2); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); g.add(c);
    const end = p.clone().addScaledVector(dir, len); if (lvl < 3) for (let k = 0; k < (lvl ? 2 : 3); k++) { const nd = dir.clone().add(new THREE.Vector3((R() - 0.5) * 1.6, R() * 0.4, (R() - 0.5) * 1.6)).normalize(); add(len * 0.62, r * 0.55, end, nd, lvl + 1); } };
  add(h * 0.5, 0.35, new THREE.Vector3(), new THREE.Vector3((R() - 0.5) * 0.15, 1, (R() - 0.5) * 0.15).normalize(), 0); return g;
}
// ---- the ghost bus (city + hollow)
function hwBus() {
  const g = new THREE.Group(), rust = hwM(0x3a4232, { roughness: 0.85, metalness: 0.3 }), dark = hwM(0x111114);
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.7, 11), rust); body.position.y = 1.9; g.add(body);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 11, 12, 1, false, 0, Math.PI), rust); roof.rotation.z = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.scale.set(1, 1, 0.35); roof.position.y = 3.25; g.add(roof);
  const wt = smTex(512, 64, (x) => { x.fillStyle = '#0a0c08'; x.fillRect(0, 0, 512, 64); const R = zRand(5); for (let i = 0; i < 8; i++) { const lit = R() < 0.7; x.fillStyle = lit ? '#5a7a3a' : '#050505'; x.fillRect(6 + i * 63, 6, 54, 52);
      if (lit && R() < 0.6) { x.fillStyle = 'rgba(0,0,0,0.85)'; x.beginPath(); x.ellipse(33 + i * 63, 34, 9, 14, 0, 0, 7); x.fill(); x.beginPath(); x.arc(33 + i * 63, 18, 7, 0, 7); x.fill(); }
      if (R() < 0.3) { x.strokeStyle = '#cfd8c0'; x.lineWidth = 1; for (let k = 0; k < 5; k++) { x.beginPath(); x.moveTo(33 + i * 63, 30); x.lineTo(6 + i * 63 + R() * 54, 6 + R() * 52); x.stroke(); } } } });
  const wm = new THREE.MeshStandardMaterial({ color: 0x0a0c08, emissive: 0xffffff, emissiveMap: wt, emissiveIntensity: 0.9 }); g.userData.winMat = wm;
  [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 1.15), wm); w.position.set(s * 1.31, 2.55, -0.4); w.rotation.y = s * Math.PI / 2; g.add(w); });
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.3), new THREE.MeshStandardMaterial({ color: 0x0a120a, emissive: 0x3a5a2a, emissiveIntensity: 0.6 })); ws.position.set(0, 2.55, 5.51); g.add(ws);
  const sign = bayNeonSign([{ t: 'ASHEN HOLLOW', y: 0.55, c: '#ff2a1a', fill: '#ff8a6a', f: '120px Anton, Impact, sans-serif' }], 1024, 160, '#ff2a1a', 2.2); sign.position.set(0, 3.45, 5.56); g.add(sign); g.userData.sign = sign;
  const bump = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.35, 0.3), dark); bump.position.set(0, 0.75, 5.6); g.add(bump);
  g.userData.heads = [-0.85, 0.85].map(x => { const s = zGlowSprite('rgb(255,230,150)', 1.4, 0.15); s.position.set(x, 1.3, 5.62); g.add(s); return s; });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(2.6, 16, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe8b0, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.rotation.x = -Math.PI / 2 - 0.08; beam.position.set(0, 1.1, 13.6); g.add(beam); g.userData.beam = beam;
  const tail = [-0.95, 0.95].map(x => { const s = zGlowSprite('rgb(255,30,20)', 0.8, 0.2); s.position.set(x, 1.1, -5.55); g.add(s); return s; });
  g.userData.wheels = []; [[-1.2, 3.6], [1.2, 3.6], [-1.2, -3.4], [1.2, -3.4]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.42, 14), dark); w.rotation.z = Math.PI / 2; w.position.set(x, 0.62, z); g.add(w); g.userData.wheels.push(w); });
  const L = new THREE.PointLight(0x9aff6a, 0.8, 9, 2); L.position.set(0, 2.4, 0); g.add(L); g.userData.inner = L;
  return g;
}
function busTick(B, dt, t, speed) { const u = B.userData, fl = Math.random() < 0.06 ? 0.15 : 1; u.winMat.emissiveIntensity = 0.8 * fl + Math.sin(t * 13) * 0.05; u.inner.intensity = 0.8 * fl;
  u.heads.forEach(h => h.material.opacity = Math.random() < 0.04 ? 0.2 : 1); u.sign.material.opacity = Math.random() < 0.05 ? 0.15 : 1; u.wheels.forEach(w => w.rotation.x += dt * speed * 1.6); }
// ---------------------------------------------------------------- build the town
function buildHollow() {
  const S = HW.scene; S.fog = new THREE.FogExp2(0x151317, 0.0155); S.background = new THREE.Color(0x151317);
  { const t = smTex(1024, 512, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#0e0c10'); g.addColorStop(0.7, '#2a1c1e'); g.addColorStop(1, '#4a2a26'); x.fillStyle = g; x.fillRect(0, 0, 1024, 256); x.fillStyle = '#151317'; x.fillRect(0, 256, 1024, 256);
      const R = zRand(2); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(60,40,44,${0.15 + R() * 0.2})`; x.beginPath(); x.ellipse(R() * 1024, 60 + R() * 180, 80 + R() * 200, 10 + R() * 30, 0, 0, 7); x.fill(); } }); HW.sky = zSky(t, 1400); S.add(HW.sky); }
  HW.hemi = new THREE.HemisphereLight(0x8a8aa0, 0x1a1414, 0.55); S.add(HW.hemi); HW.moon = new THREE.DirectionalLight(0xa0a8c8, 0.25); HW.moon.position.set(-40, 80, 30); S.add(HW.moon);
  // ground, roads, plaza
  const asph = smTex(512, 512, (x) => { x.fillStyle = '#2a2a2c'; x.fillRect(0, 0, 512, 512); const R = zRand(9); for (let i = 0; i < 1600; i++) { const v = 30 + R() * 30 | 0; x.fillStyle = `rgba(${v},${v},${v + 4},0.5)`; x.fillRect(R() * 512, R() * 512, 2, 2); }
    x.strokeStyle = 'rgba(10,10,10,0.8)'; x.lineWidth = 2; for (let i = 0; i < 14; i++) { let px = R() * 512, py = R() * 512; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (R() - 0.5) * 80; py += (R() - 0.5) * 80; x.lineTo(px, py); } x.stroke(); } }, [60, 60]);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), hwM(0xffffff, { map: asph })); gr.rotation.x = -Math.PI / 2; S.add(gr);
  const grass = smTex(256, 256, (x) => { x.fillStyle = '#26281c'; x.fillRect(0, 0, 256, 256); const R = zRand(4); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${50 + R() * 30 | 0},${48 + R() * 20 | 0},${30 + R() * 10 | 0},0.6)`; x.fillRect(R() * 256, R() * 256, 1, 3 + R() * 5); } }, [30, 30]);
  [[0, -120, 260, 150], [-150, 0, 140, 300], [150, 20, 160, 300]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), hwM(0xffffff, { map: grass })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); S.add(m); });
  const cob = smTex(512, 512, (x) => { x.fillStyle = '#3a3634'; x.fillRect(0, 0, 512, 512); const R = zRand(6); for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const v = 50 + R() * 25 | 0; x.fillStyle = `rgb(${v},${v - 4},${v - 6})`; x.fillRect(i * 32 + 1 + (j % 2) * 16, j * 32 + 1, 30, 30); } }, [8, 8]);
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(23, 48), hwM(0xffffff, { map: cob })); plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.05; S.add(plaza);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 300), hwM(0x1e1e20)); road.rotation.x = -Math.PI / 2; road.position.set(9, 0.06, 170); S.add(road);
  for (let z = 30; z < 320; z += 8) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3), new THREE.MeshBasicMaterial({ color: 0x6a6450 })); ln.rotation.x = -Math.PI / 2; ln.position.set(9, 0.08, z); S.add(ln); }
  // fountain
  { const b = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.9, 32, 1, true), hwM(0x5a5652, { side: THREE.DoubleSide })); b.position.set(0, 0.45, 2); S.add(b);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.25, 8, 40), hwM(0x5a5652)); rim.rotation.x = Math.PI / 2; rim.position.set(0, 0.92, 2); S.add(rim);
    const w = new THREE.Mesh(new THREE.CircleGeometry(4.1, 32), hwM(0x2a0606, { roughness: 0.1, metalness: 0.4, emissive: 0x1a0000 })); w.rotation.x = -Math.PI / 2; w.position.set(0, 0.6, 2); S.add(w);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 3, 10), hwM(0x5a5652)); p.position.set(0, 1.5, 2); S.add(p); const ang = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), hwM(0x4a4642)); ang.position.set(0, 3.4, 2); S.add(ang); }
  // theater with the gameplay screen
  { const T = new THREE.Group(); T.position.set(0, 0, -32); S.add(T); const wt = hwWall('#4a3a36', 0.1, 11, true); wt.repeat.set(3, 1.5);
    const b = new THREE.Mesh(new THREE.BoxGeometry(28, 16, 14), [hwM(0x3a2e2c), hwM(0x3a2e2c), hwM(0x221a1a), hwM(0x221a1a), hwM(0xffffff, { map: wt }), hwM(0x3a2e2c)]); b.position.y = 8; T.add(b);
    const mq = new THREE.Mesh(new THREE.BoxGeometry(18, 1.6, 3), hwM(0x1a1414)); mq.position.set(0, 3.4, 8.4); T.add(mq);
    const bulbs = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, emissive: 0xffb050, emissiveIntensity: 1.4 }); HW.marq = bulbs; for (let i = 0; i < 30; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), bulbs); s.position.set(-8.6 + i * 0.6, 4.25, 9.95); T.add(s); }
    const mt = bayNeonSign([{ t: 'PALACE THEATER', y: 0.5, c: '#ff3a2a', fill: '#ffd0a0' }], 1024, 160, '#ff3a2a', 13); mt.position.set(0, 3.4, 9.95); T.add(mt); HW.signs.push(mt);
    const sc = zScreen('GAMEPLAY', 'SCREEN_GAMEPLAY_HOLLOW', 15.2, 8.55, 'hollow', 0x8a1a12); sc.position.set(0, 10.4, 7.05); T.add(sc);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.6), new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0x3a0a06, emissiveIntensity: 0.5 })); door.position.set(0, 1.3, 7.02); T.add(door); }
  // mansion up on the hill
  { const H = new THREE.Group(); H.position.set(0, 0, -92); S.add(H);
    const hill = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hwM(0x22241a, { flatShading: true })); hill.scale.set(1.3, 0.28, 0.8); H.add(hill);
    const wt = hwWall('#5a5048', 0.25, 21, false); wt.repeat.set(6, 2); const M = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [hwM(0x4a423c), hwM(0x4a423c), hwM(0x2a2422), hwM(0x2a2422), hwM(0xffffff, { map: wt }), hwM(0x4a423c)]); m.position.set(x, y, z); H.add(m); return m; };
    M(54, 16, 14, 0, 24.8, 0); M(14, 30, 14, 0, 31.8, 1.5); M(10, 22, 12, -26, 27.8, 0); M(10, 22, 12, 26, 27.8, 0);
    const rf = (w, d, x, y, z, h) => { const g = new THREE.ConeGeometry(1, 1, 4); g.rotateY(Math.PI / 4); const m = new THREE.Mesh(g, hwM(0x18161a)); m.scale.set(w * 0.72, h, d * 0.72); m.position.set(x, y, z); H.add(m); };
    rf(56, 15, 0, 35.5, 0, 5); rf(15, 15, 0, 50, 1.5, 8); rf(11, 13, -26, 42, 0, 6); rf(11, 13, 26, 42, 0, 6);
    HW.mwin = []; for (let i = 0; i < 9; i++) { const s = zGlowSprite('rgb(255,170,90)', 3, 0.1); s.material.opacity = 0.55; s.position.set(-22 + (i % 5) * 11 + (i > 4 ? 5 : 0), 21 + (i > 4 ? 6 : 0), 7.4); H.add(s); HW.mwin.push(s); }
    const fence = hwM(0x101012, { metalness: 0.6, roughness: 0.5 }); for (let x = -36; x <= 36; x += 1.2) { if (Math.abs(x) < 3.5) continue; const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 4), fence); bar.position.set(x, 18.4, 18); H.add(bar);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 4), fence); tip.position.set(x, 20.1, 18); H.add(tip); }
    [-1, 1].forEach(s => { const gp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5, 1.2), hwM(0x3a3632)); gp.position.set(s * 3.8, 19.3, 18); H.add(gp);
      const gate = new THREE.Group(); gate.position.set(s * 3.2, 16.8, 18); H.add(gate); for (let k = 0; k < 6; k++) { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 4), fence); bar.position.set(-s * (0.3 + k * 0.5), 1.8, 0); gate.add(bar); }
      gate.rotation.y = s * 0.5; if (s > 0) HW.gate = gate; });
    const path = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), hwM(0x3a3632)); path.rotation.x = -Math.PI / 2 + 0.29; path.position.set(0, 9, 42); H.add(path); }
  // houses / shops ring with broken neon
  { const names = ['DINER', 'MOTEL', 'PHARMACY', 'GROCERY', 'BAR', 'HARDWARE', 'LAUNDRY', 'PAWN'], cols = ['#ff3a2a', '#3affb0', '#ff2a80', '#ffb040', '#ff3a2a', '#8ab0ff', '#3affb0', '#ffb040'];
    const spots = [[-36, -14, 0.9], [-40, 8, 1.4], [-34, 28, 2.1], [24, -46, -0.35], [-18, 40, 2.7], [26, 38, -2.6], [62, -54, -0.7], [-20, -40, 0.3]];
    spots.forEach(([x, z, ry], i) => { const w = 12 + (i % 3) * 3, h = 8 + (i % 4) * 3, wt = hwWall(['#5a4a40', '#4a4a44', '#5a4038', '#40403a'][i % 4], 0.12, 30 + i, true); wt.repeat.set(w / 8, h / 8);
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g);
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 10), [hwM(0x3a3430), hwM(0x3a3430), hwM(0x1a1818), hwM(0x1a1818), hwM(0xffffff, { map: wt }), hwM(0x3a3430)]); b.position.y = h / 2; g.add(b);
      const aw = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.2, 2.2), hwM(0x4a1a18)); aw.position.set(0, 3.2, 6); aw.rotation.x = 0.25; g.add(aw);
      const sg = bayNeonSign([{ t: names[i], y: 0.55, c: cols[i], fill: '#ffe8d8' }], 1024, 200, cols[i], Math.min(w * 0.7, 9)); sg.position.set(0, h - 1.2, 5.1); g.add(sg); HW.signs.push(sg); }); }
  // billboard (cam) + diner window frame (chat) + bus stop board (commands)
  { const post = hwM(0x2a2622, { metalness: 0.4 }); const bb = (x, z, ry, type, nm, h) => { [-3, 3].forEach(s => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, 0.4), post); p.position.set(x + s * Math.cos(ry), h / 2, z - s * Math.sin(ry)); S.add(p); });
      const sc = zScreen(type, nm, 9.6, 5.4, 'hollow', 0x6a1a12); sc.position.set(x, h + 2.6, z); sc.rotation.y = ry; S.add(sc); };
    bb(-19, -15, 0.85, 'LIVECAM', 'SCREEN_LIVECAM_HOLLOW', 4.2); bb(19, -15, -0.85, 'CHAT', 'SCREEN_CHAT_HOLLOW', 4.2);
    const st = new THREE.Group(); st.position.set(13.5, 0, 23); st.rotation.y = -0.75; S.add(st);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 2.4), hwM(0x2a2a2a, { metalness: 0.5 })); roof.position.set(0, 4.2, -1); st.add(roof);
    [-2.8, 2.8].forEach(x => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.2, 0.12), post); p.position.set(x, 2.1, -2); st.add(p); });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 0.7), hwM(0x3a2818)); bench.position.set(0, 0.6, -1.6); st.add(bench);
    const cm = zScreen('COMMANDS', 'SCREEN_COMMANDS_HOLLOW', 4.8, 2.7, 'hollow', 0x6a1a12); cm.position.set(0, 1.9, -2.25); st.add(cm);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.06), hwM(0x1a3a6a)); sign.position.set(-4.2, 3.2, -0.5); st.add(sign); const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 6), post); sp.position.set(-4.2, 1.8, -0.5); st.add(sp);
    const stext = bayNeonSign([{ t: 'BUS STOP', y: 0.5, c: '#ffffff', f: 'bold 80px Arial' }], 512, 160, '#ffffff', 1.1); stext.position.set(-4.2, 3.2, -0.46); stext.material.blending = THREE.NormalBlending; st.add(stext); }
  // streetlights that flicker
  { const pole = hwM(0x1a1a1c, { metalness: 0.5 }); [[-14, 18], [14, 12], [-22, -2], [22, 1], [-15.5, -25], [13.5, -25], [13, 40], [5, 70], [13, 100]].forEach(([x, z], i) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 7, 6), pole); p.position.set(x, 3.5, z); S.add(p); const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.1), pole); arm.position.set(x + 0.6, 7, z); S.add(arm);
      const s = zGlowSprite('rgb(255,200,140)', 3, 0.12); s.position.set(x + 1.2, 6.8, z); S.add(s); const L = new THREE.PointLight(0xffb070, 0.9, 16, 2); L.position.set(x + 1.2, 6.5, z); S.add(L);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 6.6, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); cone.position.set(x + 1.2, 3.5, z); S.add(cone);
      HW.lamps.push({ s, L, cone, ph: i * 1.7, bad: i % 3 === 0 }); }); }
  // wrecked cars + barricade + police tape
  { const rust = [0x5a3a2a, 0x3a3a40, 0x4a2a22, 0x2a3a3a]; [[-12, 12, 0.4], [16, 4, 2.2], [-4, -16, 1.4], [4, 50, 0.1]].forEach(([x, z, r], i) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = r; c.rotation.z = i === 1 ? 0.06 : 0; S.add(c);
      const b = new THREE.Mesh(new THREE.BoxGeometry(2, 0.9, 4.4), hwM(rust[i], { metalness: 0.4, roughness: 0.7 })); b.position.y = 0.75; c.add(b); const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 2.2), hwM(rust[i], { metalness: 0.4 })); cab.position.set(0, 1.5, -0.2); c.add(cab);
      const gl = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.5, 2), hwM(0x0a0c10, { roughness: 0.1, metalness: 0.8 })); gl.position.set(0, 1.55, -0.2); c.add(gl);
      if (i === 1) { HW.hazard = [-0.8, 0.8].map(xx => { const s = zGlowSprite('rgb(255,150,30)', 0.9, 0.2); s.position.set(xx, 0.8, 2.22); c.add(s); return s; }); } }); }
  // church + graveyard (east)
  { const C = new THREE.Group(); C.position.set(52, 0, -24); C.rotation.y = -1.2; S.add(C); const st = hwM(0x4a4640);
    const nave = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 22), st); nave.position.y = 6; C.add(nave); const rg = new THREE.CylinderGeometry(8.5, 8.5, 22, 3); const roof = new THREE.Mesh(rg, hwM(0x1a1818)); roof.rotation.x = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.scale.set(1, 1, 0.55); roof.position.y = 14.2; C.add(roof);
    const tw = new THREE.Mesh(new THREE.BoxGeometry(6, 24, 6), st); tw.position.set(0, 12, 13); C.add(tw); const sp = new THREE.Mesh(new THREE.ConeGeometry(4.2, 12, 4), hwM(0x1a1818)); sp.rotation.y = Math.PI / 4; sp.position.set(0, 30, 13); C.add(sp);
    const cr = hwM(0x2a2622); const cv = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.6, 0.3), cr); cv.position.set(0, 37.3, 13); C.add(cv); const chz = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.3), cr); chz.position.set(0, 37.8, 13); C.add(chz);
    const rose = zGlowSprite('rgb(255,40,40)', 4.5, 0.2); rose.position.set(0, 16, 16.2); C.add(rose); HW.rose = rose;
    const R = zRand(55), stone = hwM(0x5a5852); for (let i = 0; i < 46; i++) { const x = 26 + R() * 30, z = -4 + R() * 34; if (Math.hypot(x - 52, z + 24) < 16) continue; const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.set((R() - 0.5) * 0.25, R() * 0.6 - 1.2, (R() - 0.5) * 0.2); S.add(g);
      if (R() < 0.7) { const s = new THREE.Mesh(new THREE.BoxGeometry(1, 1.3, 0.25), stone); s.position.y = 0.65; g.add(s); const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.25, 12, 1, false, 0, Math.PI), stone); tp.rotation.x = Math.PI / 2; tp.rotation.z = Math.PI / 2; tp.position.y = 1.3; g.add(tp); }
      else { const v = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 0.18), stone); v.position.y = 0.9; g.add(v); const h = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.18), stone); h.position.y = 1.35; g.add(h); } }
    const fence = hwM(0x101012, { metalness: 0.6 }); for (let z = -6; z <= 32; z += 1.3) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 4), fence); b.position.set(24.5, 1, z); b.rotation.z = Math.sin(z) * 0.1; S.add(b); }
    const scare = new THREE.Group(); scare.position.set(40, 0, 18); S.add(scare); const sp2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.2, 0.15), hwM(0x3a2a1a)); sp2.position.y = 1.6; scare.add(sp2);
    const ar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.12), hwM(0x3a2a1a)); ar.position.y = 2.5; scare.add(ar); const coat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.3), hwM(0x3a2a20)); coat.position.y = 2.1; scare.add(coat);
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), hwM(0x8a7a5a)); sack.position.y = 3.05; scare.add(sack); const hat = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.6, 10), hwM(0x1a1612)); hat.position.y = 3.45; scare.add(hat);
    const ey = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.02), new THREE.MeshBasicMaterial({ color: 0xff8a20 })); ey.position.set(0, 3.08, 0.31); scare.add(ey); scare.rotation.y = -1.6; }
  // castle in the woods (west) + dead forest
  { const K = new THREE.Group(); K.position.set(-110, 0, -60); S.add(K); const st = hwM(0x3a3a3e, { flatShading: true });
    const cliff = new THREE.Mesh(new THREE.ConeGeometry(36, 30, 8), hwM(0x22201e, { flatShading: true })); cliff.position.y = 10; K.add(cliff);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(40, 14, 16), st); wall.position.y = 31; K.add(wall);
    [[-20, -8], [20, -8], [-20, 8], [20, 8], [0, 0]].forEach(([x, z], i) => { const h = i === 4 ? 40 : 26, t = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.5, h, 10), st); t.position.set(x, 24 + h / 2, z); K.add(t);
      const c = new THREE.Mesh(new THREE.ConeGeometry(5, 9, 10), hwM(0x1a1618)); c.position.set(x, 24 + h + 4.5, z); K.add(c); });
    const lw = zGlowSprite('rgb(255,190,110)', 4, 0.1); lw.position.set(0, 56, 4.5); K.add(lw); HW.castleWin = lw;
    const R = zRand(77); for (let i = 0; i < 40; i++) { let x, z; const side = i % 3; if (side === 0) { x = -60 - R() * 90; z = -110 + R() * 200; } else if (side === 1) { x = -50 + R() * 120; z = -160 - R() * 40; } else { x = 60 + R() * 80; z = 40 + R() * 100; }
      const tr = hwTree(8 + R() * 10, i + 1); tr.position.set(x, 0, z); tr.rotation.y = R() * 6; S.add(tr); }
    [[-26, 14], [27, 20], [-30, -26], [24, -30], [-6, 32]].forEach(([x, z], i) => { const tr = hwTree(9, 200 + i); tr.position.set(x, 0, z); S.add(tr); }); }
  // npcs: zombies, ghost, caretaker, crows, bats
  for (let i = 0; i < 11; i++) { const Z = hwZombie(i), a = Math.random() * 7, r = 5 + Math.random() * 15; Z.g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r + 2); S.add(Z.g); HW.zombies.push(Z); }
  HW.ghost = hwGhost(); S.add(HW.ghost.g); HW.ghost.g.position.set(0, 18.6, -73); HW.ghostSpots = [[0, 17.4, -72.5, 0], [34, 0, 8, -1.6], [-24, 0, -10, 0.9], [44, 0, 24, -2.2]]; HW.ghostT = 0; HW.ghostI = 0;
  { const ct = new THREE.Group(), robe = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.7, 10), hwM(0x1a1816)), hd = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), hwM(0x8a7a6a)); robe.position.y = 0.85; hd.position.y = 1.85; ct.add(robe, hd);
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 8), hwM(0x1a1816)); hood.position.y = 2.05; ct.add(hood); const lan = zGlowSprite('rgb(255,190,90)', 1.4, 0.2); lan.position.set(0.5, 1.1, 0.2); ct.add(lan);
    const L = new THREE.PointLight(0xffb060, 1.1, 10, 2); L.position.set(0.5, 1.2, 0.2); ct.add(L); S.add(ct); HW.keeper = { o: ct, lan, L }; }
  for (let i = 0; i < 9; i++) { const b = hwBird(); const perch = i < 5; b.position.set(perch ? 24.5 : 0, perch ? 2.05 : 20, perch ? -2 + i * 5.5 : 0); b.rotation.y = perch ? -1.6 + (Math.random() - 0.5) : 0; S.add(b); HW.crows.push({ o: b, perch, home: b.position.clone(), fly: perch ? 0 : 1, a: Math.random() * 7, r: 20 + Math.random() * 25 }); }
  for (let i = 0; i < 14; i++) { const b = hwBird(0.7); b.traverse(o => { if (o.isMesh) o.material = hwM(0x050505); }); S.add(b); HW.bats.push({ o: b, a: Math.random() * 7, r: 8 + Math.random() * 14, h: 48 + Math.random() * 14, sp: 0.6 + Math.random() * 0.6, c: Math.random() < 0.5 ? new THREE.Vector3(0, 0, -90) : new THREE.Vector3(-110, 30, -60) }); }
  // fog banks, ash, bus
  for (let i = 0; i < 26; i++) { const s = zGlowSprite('rgb(170,165,170)', 18 + Math.random() * 20, 0.01); s.material.opacity = 0.12; s.material.blending = THREE.NormalBlending; s.position.set((Math.random() - 0.5) * 120, 1.5 + Math.random() * 3, (Math.random() - 0.5) * 120); S.add(s); HW.mist.push({ s, v: (Math.random() - 0.5) * 1.2 }); }
  { const n = 900, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), R = zRand(19); for (let i = 0; i < n; i++) p.set([(R() - 0.5) * 80, R() * 30, (R() - 0.5) * 80], i * 3);
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); HW.ash = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xb8b0b0, size: 0.13, transparent: true, opacity: 0.8, depthWrite: false })); S.add(HW.ash); }
  HW.bus = hwBus(); HW.busStop = new THREE.Vector3(9.6, 0, 46); HW.bus.position.copy(HW.busStop); S.add(HW.bus);
  HW.flashL = new THREE.DirectionalLight(0xdfe4ff, 0); HW.flashL.position.set(20, 100, -60); S.add(HW.flashL);
}
// ---- thunder
function thunder() { try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); if (zAC.state === 'suspended') zAC.resume(); const a = zAC, t0 = a.currentTime + 0.25, len = 4;
  const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * len, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.003 ? 3 : 1);
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  n.buffer = b; n.connect(lp); lp.connect(g); g.connect(a.destination); n.start(t0); } catch (e) {} }
function hollowTick(dt, t) {
  // lightning
  HW.nextBolt -= dt; if (HW.nextBolt <= 0) { HW.nextBolt = 14 + Math.random() * 22; HW.bolt = t; if (ZONES.cur === 'hollow') thunder(); }
  const bt = t - HW.bolt, fl = bt < 0.5 ? (bt < 0.08 || (bt > 0.18 && bt < 0.26) ? 1 : 0.15) : 0;
  HW.flashL.intensity = fl * 2.2; HW.hemi.intensity = 0.55 + fl * 0.8; HW.sky.material.color.setScalar(1 + fl * 1.5);
  // lights flicker
  HW.lamps.forEach(l => { const on = l.bad ? (Math.sin(t * 7 + l.ph) > -0.2 && Math.random() > 0.08) : Math.random() > 0.01; l.L.intensity = on ? 0.9 : 0.05; l.s.material.opacity = on ? 1 : 0.15; l.cone.material.opacity = on ? 0.05 : 0; });
  HW.signs.forEach((s, i) => { if (Math.random() < 0.03) s.material.opacity = Math.random() < 0.5 ? 0.1 : 1; });
  HW.marq.emissiveIntensity = 1 + Math.sin(t * 9) * 0.4; if (HW.hazard) HW.hazard.forEach(h => h.visible = (t % 1.4) < 0.7);
  HW.mwin.forEach((w, i) => w.material.opacity = 0.4 + Math.sin(t * 0.6 + i * 2.1) * 0.2 + (Math.random() < 0.004 ? -0.4 : 0));
  HW.rose.material.opacity = 0.75 + Math.sin(t * 1.3) * 0.25; HW.castleWin.material.opacity = 0.6 + Math.sin(t * 0.9) * 0.4;
  if (HW.gate) HW.gate.rotation.y = 0.5 + Math.sin(t * 0.5) * 0.18;
  // zombies
  HW.zombies.forEach(Z => zombieTick(Z, t, dt));
  // ghost appears, lingers, vanishes, reappears somewhere else
  { HW.ghostT += dt; const G = HW.ghost, k = HW.ghostT, vis = k < 1.5 ? k / 1.5 : k < 7 ? 1 : k < 8 ? 1 - (k - 7) : 0, flick = Math.random() < 0.08 ? 0.3 : 1;
    G.g.traverse(o => { if (o.isMesh && o.material.transparent) o.material.opacity = (o.material.color.getHex() === 0x050505 ? 0.8 : 0.5) * vis * flick; });
    G.g.position.y = HW.ghostSpots[HW.ghostI][1] + 0.15 + Math.sin(t * 1.2) * 0.08; if (k > 12) { HW.ghostT = 0; HW.ghostI = (HW.ghostI + 1) % HW.ghostSpots.length; const s = HW.ghostSpots[HW.ghostI]; G.g.position.set(s[0], s[1], s[2]); G.g.rotation.y = s[3]; } }
  // caretaker walks the graveyard
  { const a = t * 0.07, K = HW.keeper; K.o.position.set(40 + Math.cos(a) * 11, Math.abs(Math.sin(t * 2.4)) * 0.04, 12 + Math.sin(a) * 13); K.o.rotation.y = -a; K.L.intensity = 1 + Math.sin(t * 7) * 0.15; }
  // crows + bats
  HW.crows.forEach((c, i) => { const u = c.o.userData; if (c.perch && c.fly <= 0 && (Math.random() < dt * 0.02 || fl > 0.5)) c.fly = 6 + Math.random() * 4;
    if (c.fly > 0) { c.fly -= dt; c.a += dt * 0.8; const up = c.perch ? Math.min(1, (c.fly > 2 ? 1 : c.fly / 2)) : 1; c.o.position.set(c.perch ? c.home.x + Math.cos(c.a) * 12 * up : Math.cos(c.a) * c.r, c.perch ? c.home.y + up * 14 : 22 + Math.sin(c.a * 2) * 3, c.perch ? c.home.z + Math.sin(c.a) * 12 * up : Math.sin(c.a) * c.r - 10);
      c.o.rotation.y = -c.a; const f = Math.sin(t * 16 + i) * 0.9; u.wl.rotation.z = f; u.wr.rotation.z = -f; if (c.perch && c.fly <= 0) c.o.position.copy(c.home); }
    else { u.wl.rotation.z = 0.15; u.wr.rotation.z = -0.15; c.o.rotation.x = Math.sin(t * 2 + i) * 0.1; } });
  HW.bats.forEach((b, i) => { b.a += dt * b.sp; b.o.position.set(b.c.x + Math.cos(b.a) * b.r, b.h + Math.sin(b.a * 3) * 2 + (b.c.y || 0) - (b.c.y ? 0 : 0), b.c.z + Math.sin(b.a) * b.r); b.o.rotation.y = -b.a; const f = Math.sin(t * 24 + i) * 1.1; b.o.userData.wl.rotation.z = f; b.o.userData.wr.rotation.z = -f; });
  // mist + ash
  HW.mist.forEach(m => { m.s.position.x += m.v * dt; if (m.s.position.x > 60) m.s.position.x = -60; if (m.s.position.x < -60) m.s.position.x = 60; });
  { const a = HW.ash.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * 0.7; if (y < 0) y = 30; a.setXY(i, a.getX(i) + Math.sin(t + i) * dt * 0.3, y); } a.needsUpdate = true; }
  if (!TR.on || (TR.mode !== 'busOut' && TR.mode !== 'busIn')) { HW.bus.position.copy(HW.busStop); HW.bus.rotation.set(0, Math.PI, 0); busTick(HW.bus, dt, t, 0); }
  // survivors (viewers) with flashlights
  if ((HW.syncT = (HW.syncT || 0) - dt) <= 0) { HW.syncT = 3; const live = new Set(spawned.map(w => w.user));
    Object.keys(HW.viewers).forEach(u => { if (!live.has(u)) { HW.scene.remove(HW.viewers[u].o); delete HW.viewers[u]; } });
    spawned.forEach(w => { if (HW.viewers[w.user]) return; let col = w.o.userData.col || '#ff2d8f'; w.o.traverse(o => { if (o.isMesh && o.material && o.material.emissive && o.material.emissiveIntensity > 0.5 && !w.o.userData.col && col === '#ff2d8f') col = '#' + o.material.emissive.getHexString(); });
      const p = smPerson(new THREE.Color(col).getHex(), w.user); const fl2 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 7, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff4d0, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      fl2.rotation.x = -Math.PI / 2 - 0.25; fl2.position.set(0.3, 1.1, 3.6); p.add(fl2); const a = Math.random() * 7; p.position.set(Math.cos(a) * 12, 0, Math.sin(a) * 12 + 2); HW.scene.add(p); HW.viewers[w.user] = { o: p, a, r: 9 + Math.random() * 8, sp: 0.06 + Math.random() * 0.05 }; }); }
  Object.values(HW.viewers).forEach((v, i) => { v.a += dt * v.sp; v.o.position.set(Math.cos(v.a) * v.r, 0, Math.sin(v.a) * v.r + 2); v.o.rotation.y = -v.a + Math.PI + Math.sin(t * 1.5 + i) * 0.5; NPC.pose(v.o, 'walk', t, 0, v.a * v.r * 2.7);
    v.o.userData.arms[1].rotation.x = -1.3; v.o.userData.arms[0].rotation.z = -0.2; });
}
// ---------------------------------------------------------------- the ghost bus trip
const zStatic = document.createElement('canvas'); zStatic.width = 320; zStatic.height = 180; zStatic.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:7;opacity:0;image-rendering:pixelated;mix-blend-mode:normal'; document.body.appendChild(zStatic);
let zStaticT = 0;
function staticWipe(sec) { zStaticT = sec; const x = zStatic.getContext('2d'), start = performance.now();
  const draw = () => { const el = (performance.now() - start) / 1000; if (el > sec) { zStatic.style.opacity = 0; return; } const im = x.createImageData(320, 180), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = v * (0.9 + Math.random() * 0.2); d[i + 1] = v * 0.85; d[i + 2] = v * 0.85; d[i + 3] = 255; }
    x.putImageData(im, 0, 0); x.fillStyle = 'rgba(160,0,0,0.25)'; x.fillRect(0, (el * 300) % 180, 320, 18);
    const k = el / sec; zStatic.style.opacity = k < 0.25 ? k / 0.25 : k > 0.7 ? (1 - k) / 0.3 : 1; requestAnimationFrame(draw); }; draw();
  try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); const a = zAC, t0 = a.currentTime, n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * sec, a.sampleRate), dd = b.getChannelData(0); for (let i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;
    const g = a.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.08, t0 + sec * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + sec); const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500; n.buffer = b; n.connect(hp); hp.connect(g); g.connect(a.destination); n.start(t0); } catch (e) {}
}
function busSound(len) { try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); if (zAC.state === 'suspended') zAC.resume(); const a = zAC, t0 = a.currentTime + 0.02;
  const o = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(32, t0); o.frequency.linearRampToValueAtTime(58, t0 + len * 0.6); o.frequency.linearRampToValueAtTime(40, t0 + len);
  lp.type = 'lowpass'; lp.frequency.value = 300; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.11, t0 + 0.8); g.gain.setValueAtTime(0.11, t0 + len - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  o.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + len);
  const s = a.createOscillator(), sg = a.createGain(); s.type = 'sine'; s.frequency.setValueAtTime(900, t0 + 0.2); s.frequency.exponentialRampToValueAtTime(700, t0 + 1.4); sg.gain.setValueAtTime(0.0001, t0); sg.gain.exponentialRampToValueAtTime(0.03, t0 + 0.3); sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
  s.connect(sg); sg.connect(a.destination); s.start(t0); s.stop(t0 + 1.5); } catch (e) {} }
function busChase(B, back, up, side, k) { const fwd = new THREE.Vector3(Math.sin(B.rotation.y), 0, Math.cos(B.rotation.y)), right = new THREE.Vector3(fwd.z, 0, -fwd.x);
  const want = B.position.clone().addScaledVector(fwd, -back).addScaledVector(right, side).add(new THREE.Vector3(0, up, 0));
  cam.position.lerp(want, Math.min(1, k)); cam.quaternion.slerp(lookQuat(cam.position, B.position.clone().addScaledVector(fwd, 9).add(new THREE.Vector3(0, 1.6, 0))), Math.min(1, k)); }
function busTripTick(dt, t) {
  const T = TR; T.k = (T.k || 0) + dt;
  if (!HW.cityBus) { HW.cityBus = hwBus(); HW.cityBus.visible = false; scene.add(HW.cityBus); }
  const CB = HW.cityBus;
  if (T.mode === 'busOut') {
    if (!T.st) { T.st = 'arrive'; T.k = 0; staticWipe(0.8); busSound(11); setTimeout(() => { CB.visible = true; CB.position.set(3, 0, 40); CB.rotation.set(0, 0, 0); const P = new THREE.Vector3(10, 2.8, 104); cam.position.copy(P); cam.quaternion.copy(lookQuat(P, new THREE.Vector3(2, 1.5, 72))); cam.fov = 55; cam.updateProjectionMatrix(); fly = null; hold = null; }, 220); }
    if (T.st === 'arrive') { if (T.k < 0.25) return true; const u = Math.min(1, (T.k - 0.25) / 3.6), e = 1 - Math.pow(1 - u, 2); CB.position.set(3, 0, 40 + e * 52); busTick(CB, dt, t, (1 - u) * 10);
      cam.quaternion.slerp(lookQuat(cam.position, CB.position.clone().add(new THREE.Vector3(0, 1.5, 0))), Math.min(1, dt * 3)); if (u >= 1 && T.k > 4.6) { T.st = 'leave'; T.k = 0; T.v = 0; } return true; }
    if (T.st === 'leave') { T.v = Math.min(16, T.v + dt * 6); CB.position.z += T.v * dt; busTick(CB, dt, t, T.v); busChase(CB, 10, 3.6, 1.5, dt * (T.k < 0.6 ? 1.4 : 2.4));
      if (T.k > 2.6 && !T.wiped) { T.wiped = true; staticWipe(1.2); }
      if (T.k > 3.0) { CB.visible = false; setZone('hollow'); T.st = 'cruise'; T.k = 0; HW.bus.position.set(HW.busStop.x, 0, 170); HW.bus.rotation.set(0, Math.PI, 0); cam.position.copy(HW.bus.position).add(new THREE.Vector3(1, 3.6, 11)); } return true; }
    if (T.st === 'cruise') { const B = HW.bus, u = Math.min(1, T.k / 6), e = 1 - Math.pow(1 - u, 2.2); B.position.z = 170 - e * (170 - HW.busStop.z); busTick(B, dt, t, (1 - u) * 14); hollowTick(dt, t);
      busChase(B, u < 0.75 ? 11 : 13, u < 0.75 ? 3.4 : 5, u < 0.75 ? 1 : 5, dt * 2); cam.fov += (58 - cam.fov) * Math.min(1, dt); cam.updateProjectionMatrix(); if (T.k > 6.6) return trFinish(); return true; }
  } else {
    if (!T.st) { T.st = 'board'; T.k = 0; busSound(9); }
    if (T.st === 'board') { const B = HW.bus; if (!T.turned) { T.turned = true; B.rotation.set(0, 0, 0); } hollowTick(dt, t); if (T.k < 1.2) busChase(B, 12, 4, 4, dt * 2); else { T.v = Math.min(16, (T.v || 0) + dt * 6); B.position.z += T.v * dt; busTick(B, dt, t, T.v); busChase(B, 11, 3.6, 1, dt * 2.4); }
      if (T.k > 3.4 && !T.wiped) { T.wiped = true; staticWipe(1.2); }
      if (T.k > 3.8) { setZone('city'); T.st = 'cityArrive'; T.k = 0; CB.visible = true; CB.position.set(-1.5, 0, 128); CB.rotation.set(0, Math.PI, 0); cam.position.copy(CB.position).add(new THREE.Vector3(1, 3.6, 11)); HW.bus.position.copy(HW.busStop); } return true; }
    if (T.st === 'cityArrive') { const u = Math.min(1, T.k / 4), e = 1 - Math.pow(1 - u, 2); CB.position.z = 128 - e * 36; busTick(CB, dt, t, (1 - u) * 12); busChase(CB, 11, 3.6, 2, dt * 2);
      if (T.k > 4.3) { setTimeout(() => { if (HW.cityBus && !TR.on) HW.cityBus.visible = false; }, 4000); return trFinish(); } return true; }
  }
  return true;
}
// ---------------------------------------------------------------- ZONE ZERO: modern-warfare battle zone at dusk (Firebase Zero, ruins, airfield, tanks, choppers, airdrops, closing gas circle), reached by military truck convoy
const ZZ = { scene: new THREE.Scene(), soldiers: [], patrol: [], smokes: [], fires: [], booms: [], drops: [], chutes: [], helis: [], viewers: {}, lights: [], nextBoom: 3, nextPlane: 8, beacons: [] };
const zzM = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.88 }, o || {}));
const zzSmokeTex = (() => { const [c, t] = zCanvasTex(128, 128), x = c.getContext('2d'), R = zRand(31);
  for (let i = 0; i < 22; i++) { const px = 30 + R() * 68, py = 30 + R() * 68, r = 14 + R() * 26, g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
  t.needsUpdate = true; return t; })();
function zzSmoke(col, op) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zzSmokeTex, color: col, transparent: true, opacity: op, depthWrite: false })); return s; }
// ---- vehicles
function zzTruck(seed) {
  const R = zRand(seed || 3), g = new THREE.Group(), paint = zzM([0x4a5034, 0x5a5640, 0x3e4430][seed % 3 || 0], { roughness: 0.75, metalness: 0.25 }), dark = zzM(0x121212), canvasM = zzM(0x6a6248, { roughness: 1 });
  const ch = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.35, 7.6), dark); ch.position.y = 1.05; g.add(ch);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.7, 2.1), paint); cab.position.set(0, 2.05, 2.55); g.add(cab);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.0, 1.3), paint); hood.position.set(0, 1.7, 4.15); g.add(hood);
  const grille = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.08), dark); grille.position.set(0, 1.7, 4.82); g.add(grille);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.06), zzM(0x0c1014, { roughness: 0.1, metalness: 0.8 })); ws.position.set(0, 2.45, 3.6); ws.rotation.x = -0.12; g.add(ws);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 4.6), paint); bed.position.set(0, 1.5, -1.45); g.add(bed);
  const cover = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 4.6, 14), canvasM); cover.rotation.x = Math.PI / 2; cover.position.set(0, 2.7, -1.45); g.add(cover);
  const coverSide = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.9, 4.6), canvasM); coverSide.position.set(0, 2.25, -1.45); g.add(coverSide);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.6), new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide })); back.position.set(0, 2.45, -3.76); g.add(back);
  g.userData.wheels = []; [[3.2], [-0.9], [-2.6]].forEach(([z]) => [-1.2, 1.2].forEach(x => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 14), dark); w.rotation.z = Math.PI / 2; w.position.set(x, 0.62, z); g.add(w); g.userData.wheels.push(w); }));
  g.userData.heads = [-0.85, 0.85].map(x => { const s = zGlowSprite('rgb(255,236,200)', 1.3, 0.15); s.position.set(x, 1.65, 4.88); g.add(s); return s; });
  [-1.05, 1.05].forEach(x => { const s = zGlowSprite('rgb(255,30,20)', 0.6, 0.2); s.position.set(x, 1.1, -3.8); g.add(s); });
  const bc = zGlowSprite('rgb(255,170,30)', 1.4, 0.2); bc.position.set(0.8, 3.0, 2.6); g.add(bc); g.userData.beacon = bc;
  const beam = new THREE.Mesh(new THREE.ConeGeometry(2.4, 15, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffeccc, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.rotation.x = -Math.PI / 2 - 0.06; beam.position.set(0, 1.5, 12.3); g.add(beam);
  const star = new THREE.Mesh(new THREE.CircleGeometry(0.4, 5), zzM(0xd8d4c0)); star.position.set(1.26, 2.2, 2.6); star.rotation.y = Math.PI / 2; g.add(star);
  const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 10), dark); sp.rotation.x = Math.PI / 2; sp.position.set(0, 2.3, -3.85); g.add(sp);
  return g;
}
function zzTruckTick(T, dt, t, speed) { const u = T.userData; u.wheels.forEach(w => w.rotation.x += dt * speed * 1.6); u.beacon.material.opacity = Math.sin(t * 9 + (u.truckId || 0)) > 0 ? 1 : 0.15; }
function zzTank(col) {
  const g = new THREE.Group(), paint = zzM(col || 0x4e5236, { roughness: 0.8, metalness: 0.3 }), dark = zzM(0x161614);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 7.2), paint); hull.position.y = 1.15; g.add(hull);
  const glacis = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 1.3), paint); glacis.position.set(0, 1.25, 3.9); glacis.rotation.x = 0.55; g.add(glacis);
  [-1, 1].forEach(s => { const tr = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 7.6), dark); tr.position.set(s * 1.75, 0.55, 0); g.add(tr); const sk = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 6.6), paint); sk.position.set(s * 2.2, 1.05, 0.1); g.add(sk);
    for (let i = 0; i < 6; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.5, 10), zzM(0x2a2a26)); w.rotation.z = Math.PI / 2; w.position.set(s * 1.75, 0.45, -2.8 + i * 1.12); g.add(w); } });
  const tur = new THREE.Group(); tur.position.set(0, 1.7, -0.3); g.add(tur);
  const tb = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.75, 0.9, 8), paint); tb.position.y = 0.45; tb.scale.z = 1.35; tur.add(tb);
  const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 5.4, 10), dark); gun.rotation.x = Math.PI / 2; gun.position.set(0, 0.55, 4.6); tur.add(gun);
  const mz = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 10), dark); mz.rotation.x = Math.PI / 2; mz.position.set(0, 0.55, 7.3); tur.add(mz);
  const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 10), dark); hatch.position.set(0.5, 1.0, -0.3); tur.add(hatch);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.6, 4), dark); ant.position.set(-0.9, 2.2, -1); tur.add(ant);
  g.userData.tur = tur; return g;
}
function zzPlane() {
  const g = new THREE.Group(), m = zzM(0x3a3e40, { roughness: 0.6, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.2, 30, 14), m); body.rotation.x = Math.PI / 2; g.add(body);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(2.6, 14, 10), m); nose.scale.z = 1.4; nose.position.z = 15; g.add(nose);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(44, 0.5, 5), m); wing.position.set(0, 1.6, 2); g.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 3.5), m); tail.position.set(0, 2.4, -14); g.add(tail);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 4.5), m); fin.position.set(0, 5, -13.5); g.add(fin);
  [-13, -6, 6, 13].forEach(x => { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 4, 10), m); e.rotation.x = Math.PI / 2; e.position.set(x, 0.6, 3.5); g.add(e); });
  [[-22, 'rgb(255,40,40)'], [22, 'rgb(60,255,90)']].forEach(([x, c]) => { const s = zGlowSprite(c, 3, 0.2); s.position.set(x, 1.6, 2); g.add(s); });
  const st = zGlowSprite('rgb(255,255,255)', 4, 0.2); st.position.set(0, -2.6, 0); g.add(st); g.userData.strobe = st;
  g.scale.setScalar(0.9); g.visible = false; return g;
}
function zzChute(col, crate) {
  const g = new THREE.Group(), canopy = new THREE.Mesh(new THREE.SphereGeometry(crate ? 3.2 : 1.6, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), zzM(col, { side: THREE.DoubleSide, roughness: 1 }));
  canopy.position.y = crate ? 6.4 : 3.6; g.add(canopy);
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([...Array(8)].flatMap((_, i) => { const a = i / 8 * Math.PI * 2, r = crate ? 2.7 : 1.35, y = canopy.position.y + (crate ? 0.7 : 0.4); return [new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), new THREE.Vector3(0, crate ? 1.6 : 1.5, 0)]; })), new THREE.LineBasicMaterial({ color: 0x222222 }));
  g.add(lines); g.userData.canopy = canopy;
  if (crate) { const c = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.8), zzM(0x4a4e30, { roughness: 0.8 })); c.position.y = 0.7; g.add(c);
    [-1, 1].forEach(s => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.16, 0.2), zzM(0x111111)); b.position.set(0, 0.7, s * 0.55); g.add(b); });
    const lt = zGlowSprite('rgb(255,60,40)', 1.2, 0.2); lt.position.set(0, 1.5, 0); g.add(lt); g.userData.light = lt; }
  else { const p = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.25), zzM(0x3a3e30)); b.position.y = 1.1; p.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), zzM(0x2a2e22)); h.position.y = 1.65; p.add(h);
    [-0.1, 0.1].forEach(x => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.7, 0.13), zzM(0x2a2e22)); l.position.set(x, 0.4, 0); p.add(l); }); g.add(p); }
  return g;
}
// ---- textures
function zzConcrete(seed, holes) { return smTex(256, 256, (x) => { x.fillStyle = '#6a665e'; x.fillRect(0, 0, 256, 256); const R = zRand(seed);
  for (let i = 0; i < 500; i++) { const v = 70 + R() * 50 | 0; x.fillStyle = `rgba(${v},${v - 3},${v - 8},0.45)`; x.fillRect(R() * 256, R() * 256, 2 + R() * 10, 2 + R() * 10); }
  for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(20,16,14,${0.2 + R() * 0.4})`; x.beginPath(); x.ellipse(R() * 256, R() * 256, 3 + R() * 18, 3 + R() * 14, R() * 3, 0, 7); x.fill(); }
  if (holes) for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { if (R() < 0.15) continue; const wx = 18 + i * 82, wy = 24 + j * 80; x.fillStyle = R() < 0.12 ? '#ff9a3a' : '#0c0a0a'; x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + 46 + R() * 10, wy + R() * 6); x.lineTo(wx + 50, wy + 44 + R() * 10); x.lineTo(wx - R() * 6, wy + 50); x.closePath(); x.fill(); }
  x.strokeStyle = 'rgba(20,18,16,0.7)'; x.lineWidth = 2; for (let i = 0; i < 8; i++) { let px = R() * 256, py = R() * 256; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (R() - 0.5) * 50; py += R() * 40; x.lineTo(px, py); } x.stroke(); } }); }
function zzContainerTex(col, seed) { return smTex(256, 128, (x) => { x.fillStyle = col; x.fillRect(0, 0, 256, 128); for (let i = 0; i < 256; i += 8) { x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(i, 0, 3, 128); x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(i + 4, 0, 2, 128); }
  const R = zRand(seed); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(90,50,20,${0.1 + R() * 0.3})`; x.fillRect(R() * 256, R() * 128, 4 + R() * 30, 2 + R() * 20); }
  x.fillStyle = 'rgba(240,235,220,0.7)'; x.font = 'bold 18px monospace'; x.fillText('ZRO ' + (100000 + R() * 899999 | 0), 14, 26); }); }
// ---- build
function buildZero() {
  const S = ZZ.scene; S.fog = new THREE.FogExp2(0x5a4236, 0.0036); S.background = new THREE.Color(0x5a4236);
  { const t = smTex(2048, 1024, (x) => { const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#22232c'); g.addColorStop(0.45, '#5a4440'); g.addColorStop(0.75, '#b0603a'); g.addColorStop(0.92, '#e09050'); g.addColorStop(1, '#5a4236');
      x.fillStyle = g; x.fillRect(0, 0, 2048, 512); x.fillStyle = '#5a4236'; x.fillRect(0, 512, 2048, 512); const R = zRand(12);
      const sg = x.createRadialGradient(1300, 440, 0, 1300, 440, 220); sg.addColorStop(0, 'rgba(255,220,160,0.95)'); sg.addColorStop(0.15, 'rgba(255,170,90,0.6)'); sg.addColorStop(1, 'rgba(255,120,60,0)'); x.fillStyle = sg; x.fillRect(1000, 200, 600, 400);
      for (let i = 0; i < 70; i++) { const cx = R() * 2048, cy = 120 + R() * 360, w = 120 + R() * 320; for (const dx of [-2048, 0, 2048]) { x.fillStyle = `rgba(${40 + R() * 40 | 0},${30 + R() * 30 | 0},${30 + R() * 20 | 0},${0.12 + R() * 0.22})`; x.beginPath(); x.ellipse(cx + dx, cy, w, 8 + R() * 26, 0, 0, 7); x.fill(); } }
      for (let i = 0; i < 9; i++) { const cx = R() * 2048; for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(30,26,26,${0.25 - k * 0.015})`; x.beginPath(); x.ellipse(cx + k * 6 + (R() - 0.5) * 10, 500 - k * 26, 18 + k * 6, 20 + k * 3, 0, 0, 7); x.fill(); } } });
    ZZ.sky = zSky(t, 1500); S.add(ZZ.sky); }
  ZZ.hemi = new THREE.HemisphereLight(0xffc49a, 0x2a2420, 0.5); S.add(ZZ.hemi);
  const sun = new THREE.DirectionalLight(0xffa868, 0.75); sun.position.set(60, 40, -120); S.add(sun);
  ZZ.boomL = new THREE.PointLight(0xff8a3a, 0, 160, 2); S.add(ZZ.boomL);
  // ground + roads + base pad
  const dirt = smTex(512, 512, (x) => { x.fillStyle = '#4e4032'; x.fillRect(0, 0, 512, 512); const R = zRand(5); for (let i = 0; i < 2600; i++) { const v = R(); x.fillStyle = `rgba(${62 + v * 50 | 0},${50 + v * 40 | 0},${36 + v * 28 | 0},0.5)`; x.fillRect(R() * 512, R() * 512, 2 + R() * 4, 2 + R() * 4); }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(40,34,26,${0.1 + R() * 0.2})`; x.beginPath(); x.ellipse(R() * 512, R() * 512, 10 + R() * 50, 6 + R() * 30, R() * 3, 0, 7); x.fill(); } }, [70, 70]);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), zzM(0xffffff, { map: dirt })); gr.rotation.x = -Math.PI / 2; S.add(gr);
  const asph = smTex(256, 512, (x) => { x.fillStyle = '#34322e'; x.fillRect(0, 0, 256, 512); const R = zRand(8); for (let i = 0; i < 1200; i++) { const v = 40 + R() * 30 | 0; x.fillStyle = `rgba(${v},${v},${v - 2},0.6)`; x.fillRect(R() * 256, R() * 512, 2, 2); }
    x.fillStyle = 'rgba(210,190,120,0.7)'; for (let y = 0; y < 512; y += 64) x.fillRect(124, y, 8, 36); x.strokeStyle = 'rgba(14,12,10,0.8)'; x.lineWidth = 2; for (let i = 0; i < 10; i++) { let px = R() * 256, py = R() * 512; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (R() - 0.5) * 60; py += (R() - 0.5) * 60; x.lineTo(px, py); } x.stroke(); } }, [1, 30]);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 380), zzM(0xffffff, { map: asph })); road.rotation.x = -Math.PI / 2; road.position.set(8, 0.04, 150); S.add(road);
  const road2 = new THREE.Mesh(new THREE.PlaneGeometry(9, 400), zzM(0xffffff, { map: asph.clone() })); road2.material.map.repeat.set(1, 30); road2.material.map.needsUpdate = true; road2.rotation.set(-Math.PI / 2, 0, Math.PI / 2); road2.position.set(-60, 0.035, -40); S.add(road2);
  const padT = smTex(512, 512, (x) => { x.fillStyle = '#56524a'; x.fillRect(0, 0, 512, 512); const R = zRand(9); for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const v = 76 + R() * 18 | 0; x.fillStyle = `rgb(${v},${v - 3},${v - 10})`; x.fillRect(i * 64 + 1, j * 64 + 1, 62, 62); }
    for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(30,26,22,${0.1 + R() * 0.25})`; x.beginPath(); x.ellipse(R() * 512, R() * 512, 6 + R() * 26, 4 + R() * 16, R() * 3, 0, 7); x.fill(); } }, [6, 6]);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(46, 44), zzM(0xffffff, { map: padT })); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.05, -1); S.add(pad);
  // HESCO perimeter (instanced) with a gate on the road
  { const ht = smTex(128, 128, (x) => { x.fillStyle = '#9a8a62'; x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(40,40,36,0.85)'; x.lineWidth = 3; for (let i = 0; i <= 128; i += 21) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); }
      const R = zRand(2); for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(60,50,30,${R() * 0.3})`; x.fillRect(R() * 128, R() * 128, 6, 4); } });
    const pts = []; for (let x = -24; x <= 24; x += 1.5) { pts.push([x, -24]); if (x < 3 || x > 13.5) pts.push([x, 22]); } for (let z = -22.5; z <= 21; z += 1.5) { pts.push([-24, z]); pts.push([24, z]); }
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), zzM(0xffffff, { map: ht }), pts.length), M = new THREE.Matrix4();
    pts.forEach(([x, z], i) => { M.makeTranslation(x, 0.75, z); im.setMatrixAt(i, M); }); S.add(im);
    [3, 13.5].forEach(x => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.5, 0.6), zzM(0x2a2a26)); p.position.set(x - (x < 8 ? 0.8 : -0.8), 2.25, 22); S.add(p); });
    const arm = new THREE.Mesh(new THREE.BoxGeometry(9, 0.18, 0.18), zzM(0xd8d0b8)); arm.position.set(8.25, 1.4, 22); arm.rotation.z = 1.25; arm.position.x = 4.2; arm.position.y = 4.6; S.add(arm);
    const gs = zSign('FIREBASE ZERO', 'RESTRICTED · AUTHORIZED PERSONNEL ONLY', '#ff8a3a', 9); gs.position.set(8.25, 5.6, 22.3); S.add(gs);
    const gb = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.4, 0.5), zzM(0x2a2a26)); gb.position.set(8.25, 4.5, 22); S.add(gb); }
  // sandbag walls (instanced)
  { const bags = [], arc = (cx, cz, r, a0, a1, rows) => { for (let row = 0; row < rows; row++) { const n = Math.round(Math.abs(a1 - a0) * r / 0.62); for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i + (row % 2) * 0.5) / n; bags.push([cx + Math.cos(a) * r, 0.17 + row * 0.3, cz + Math.sin(a) * r, -a]); } } };
    arc(-6, 16, 2.6, Math.PI * 0.15, Math.PI * 0.85, 3); arc(17, 12, 2.4, Math.PI * 0.1, Math.PI * 0.9, 3); arc(-17, -16, 2.6, -Math.PI * 0.2, Math.PI * 0.6, 3); arc(30, 38, 2.6, Math.PI, Math.PI * 1.8, 3);
    arc(-40, -10, 3, -Math.PI * 0.6, Math.PI * 0.3, 3); arc(-46, 22, 2.8, -Math.PI * 0.4, Math.PI * 0.6, 3); arc(36, -16, 2.6, Math.PI * 0.7, Math.PI * 1.5, 3);
    const g = new THREE.SphereGeometry(0.36, 8, 6); g.scale(1, 0.45, 0.62); const im = new THREE.InstancedMesh(g, zzM(0x8a7a58, { roughness: 1 }), bags.length), M = new THREE.Matrix4(), Q = new THREE.Quaternion();
    bags.forEach(([x, y, z, a], i) => { Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a + Math.PI / 2); M.compose(new THREE.Vector3(x, y, z), Q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, M); }); S.add(im); }
  // container stacks + the main LED wall
  const conts = ['#6a2a1e', '#3e4a30', '#2a3a4e', '#8a6a3a', '#4a4a46', '#7a3a2a'].map((c, i) => zzM(0xffffff, { map: zzContainerTex(c, i + 1), roughness: 0.7, metalness: 0.3 }));
  const cont = (x, y, z, ry, k) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.44, 2.6, 6.1), conts[k % conts.length]); m.position.set(x, y + 1.3, z); m.rotation.y = ry; S.add(m); return m; };
  [-11.6, 11.6].forEach((x, s) => { for (let k = 0; k < 3; k++) cont(x, k * 2.6, -15, 0, k + s * 3); });
  { const truss = new THREE.Mesh(new THREE.BoxGeometry(26, 0.6, 0.6), zzM(0x2a2a28, { metalness: 0.6 })); truss.position.set(0, 12.2, -15); S.add(truss);
    const sc = zScreen('GAMEPLAY', 'SCREEN_GAMEPLAY_ZERO', 16, 9, 'zero', 0xff7a2a); sc.position.set(0, 6.9, -14.6); S.add(sc);
    const sign = zSign('ZONE ZERO', 'FIREBASE ZERO · LIVE OPS', '#ff8a3a', 10); sign.position.set(0, 13.9, -14.7); S.add(sign); ZZ.sign = sign;
    [-8, 8].forEach(x => { const fl = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 0.5), zzM(0x1a1a1a)); fl.position.set(x, 12.7, -14.4); fl.rotation.x = 0.5; S.add(fl); const g = zGlowSprite('rgb(255,240,210)', 2.4, 0.2); g.position.set(x, 12.6, -14); S.add(g); }); }
  const side = (type, nm, x, z, ry, k) => { const st = new THREE.Group(); st.position.set(x, 0, z); st.rotation.y = ry; S.add(st);
    for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(6.1, 2.6, 2.44), conts[(k + i) % conts.length]); m.position.set(0, 1.3 + i * 2.6, -1.9); st.add(m); }
    const sc = zScreen(type, nm, 8.4, 4.72, 'zero', 0xff7a2a); sc.position.set(0, 5.35, -0.45); st.add(sc); return st; };
  side('LIVECAM', 'SCREEN_LIVECAM_ZERO', -16.5, -5, 0.75, 1); side('CHAT', 'SCREEN_CHAT_ZERO', 16.5, -5, -0.75, 3);
  { const st = new THREE.Group(); st.position.set(-8.2, 0, 6.2); st.rotation.y = 0.35; S.add(st); const crates = zzM(0x5a5030, { roughness: 0.9 });
    [[-1.6, 0], [0, 0], [1.6, 0]].forEach(([x]) => { const c = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1), crates); c.position.set(x, 0.45, -0.4); st.add(c); });
    const cm = zScreen('COMMANDS', 'SCREEN_COMMANDS_ZERO', 4.8, 2.7, 'zero', 0xff7a2a); cm.position.set(0, 2.45, -0.55); st.add(cm); }
  // command tent with camo net, radio mast, flag, floodlights, watchtowers
  { const net = smTex(256, 256, (x) => { x.clearRect(0, 0, 256, 256); const R = zRand(14); for (let i = 0; i < 260; i++) { x.fillStyle = ['rgba(70,78,46,0.9)', 'rgba(96,88,56,0.9)', 'rgba(44,50,32,0.9)'][i % 3]; x.beginPath(); x.ellipse(R() * 256, R() * 256, 4 + R() * 14, 3 + R() * 8, R() * 3, 0, 7); x.fill(); } }, [3, 3]);
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(10, 8, 10, 8), new THREE.MeshStandardMaterial({ map: net, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 1 })); nm.rotation.x = -Math.PI / 2;
    const p = nm.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, -Math.abs(Math.sin(p.getX(i) * 0.6) * Math.sin(p.getY(i) * 0.7)) * 0.6); nm.geometry.computeVertexNormals(); nm.position.set(15, 3.3, 10); S.add(nm);
    [[11, 7], [19, 7], [11, 13], [19, 13]].forEach(([x, z]) => { const po = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.3, 5), zzM(0x2a2a24)); po.position.set(x, 1.65, z); S.add(po); });
    const tbl = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 1.4), zzM(0x3a3a34)); tbl.position.set(15, 0.9, 10); S.add(tbl); const map = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.2), new THREE.MeshBasicMaterial({ color: 0x5a8a6a })); map.rotation.x = -Math.PI / 2; map.position.set(15, 0.96, 10); S.add(map);
    [[13.6, 9.6], [16.4, 9.6]].forEach(([x, z]) => { const lp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.35), zzM(0x161616)); lp.position.set(x, 1.12, z); lp.rotation.x = -0.3; S.add(lp); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.26), new THREE.MeshBasicMaterial({ color: 0x6affa0 })); sc.position.set(x, 1.2, z + 0.19); sc.rotation.x = -0.3; S.add(sc); });
    const L = new THREE.PointLight(0xffd8a0, 1.2, 12, 2); L.position.set(15, 3, 10); S.add(L); }
  { const m = new THREE.Group(); m.position.set(-14, 0, -21); S.add(m); const tm = zzM(0x8a8a86, { metalness: 0.6 }); for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 24, 4), tm); const a = i / 3 * Math.PI * 2; l.position.set(Math.cos(a) * 0.5, 12, Math.sin(a) * 0.5); m.add(l); }
    for (let y = 1; y < 24; y += 1.5) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 3, 3), tm); r.rotation.x = Math.PI / 2; r.position.y = y; m.add(r); }
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 6, 0, Math.PI * 2, 0, 0.9), zzM(0xd8d8d0, { side: THREE.DoubleSide })); dish.position.set(0.8, 18, 0); dish.rotation.z = -1.2; m.add(dish);
    const b = zGlowSprite('rgb(255,30,30)', 2.2, 0.2); b.position.y = 24.3; m.add(b); ZZ.mastLight = b; }
  { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 11, 8), zzM(0xb8b8b0, { metalness: 0.7 })); pole.position.set(-13, 5.5, 14); S.add(pole);
    const ft = smTex(256, 160, (x) => { x.fillStyle = '#2a2e22'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#ff7a2a'; x.fillRect(0, 0, 256, 18); x.fillRect(0, 142, 256, 18); x.strokeStyle = '#e8e0d0'; x.lineWidth = 12; x.beginPath(); x.moveTo(84, 44); x.lineTo(172, 44); x.lineTo(84, 116); x.lineTo(172, 116); x.stroke(); x.beginPath(); x.arc(128, 80, 58, 0, 7); x.lineWidth = 6; x.stroke(); });
    const fg = new THREE.PlaneGeometry(3.6, 2.2, 16, 4); fg.translate(1.8, 0, 0); const fl = new THREE.Mesh(fg, zzM(0xffffff, { map: ft, side: THREE.DoubleSide, roughness: 1 })); fl.position.set(-12.95, 9.8, 14); S.add(fl); ZZ.flag = fl; ZZ.flagBase = fg.attributes.position.array.slice(); }
  ZZ.floods = []; [[-21, -21], [21, -21], [-21, 19], [21, 19]].forEach(([x, z], i) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 12, 6), zzM(0x2a2a28)); p.position.set(x, 6, z); S.add(p);
    const h = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.5), zzM(0x1a1a1a)); h.position.set(x, 12, z); h.lookAt(0, 0, 0); S.add(h); const g = zGlowSprite('rgb(255,244,220)', 3, 0.2); g.position.set(x * 0.95, 11.8, z * 0.95); S.add(g); });
  [[-21, 0, -1], [21, 0, -1]].forEach(([x, y, z]) => { const s = new THREE.SpotLight(0xfff0d8, 1.4, 60, 0.7, 0.6); s.position.set(x, 12, z); s.target.position.set(0, 0, -6); S.add(s, s.target); });
  ZZ.towers = []; [[-22, 20], [22, 20]].forEach(([x, z], i) => { const T = new THREE.Group(); T.position.set(x, 0, z); S.add(T); const wd = zzM(0x5a4a34);
    [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].forEach(([a, b]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.22, 8, 0.22), wd); l.position.set(a, 4, b); T.add(l); });
    const fl = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 3.4), wd); fl.position.y = 8; T.add(fl); [[0, 1.6], [0, -1.6], [1.6, 0], [-1.6, 0]].forEach(([a, b]) => { const w = new THREE.Mesh(new THREE.BoxGeometry(b ? 3.4 : 0.2, 1, b ? 0.2 : 3.4), zzM(0x8a7a58)); w.position.set(a, 8.6, b); T.add(w); });
    const rf = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 4), zzM(0x3a3a30)); rf.rotation.y = Math.PI / 4; rf.position.y = 11; T.add(rf); [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].forEach(([a, b]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), wd); l.position.set(a, 9.6, b); T.add(l); });
    const sp = new THREE.Group(); sp.position.set(0, 9.4, 0); T.add(sp); const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.6, 10), zzM(0x1a1a1a)); lamp.rotation.x = Math.PI / 2; sp.add(lamp);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(5, 40, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff6dc, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); cone.rotation.x = -Math.PI / 2; cone.position.z = 20; sp.add(cone);
    const g = zGlowSprite('rgb(255,250,230)', 1.6, 0.2); g.position.z = 0.4; sp.add(g); ZZ.towers.push({ sp, ph: i * 2 }); });
  // helipad + parked chopper, tanks, truck depot
  { const hp = smTex(256, 256, (x) => { x.fillStyle = '#4a4a46'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#e8e0c8'; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 110, 0, 7); x.stroke(); x.fillStyle = '#e8e0c8'; x.fillRect(84, 64, 22, 128); x.fillRect(150, 64, 22, 128); x.fillRect(84, 117, 88, 22); });
    const p = new THREE.Mesh(new THREE.CircleGeometry(9, 40), zzM(0xffffff, { map: hp })); p.rotation.x = -Math.PI / 2; p.position.set(36, 0.07, -6); S.add(p);
    ZZ.parked = heliModel(0x3a4030); ZZ.parked.traverse(o => { if (o.isMesh && o.material.emissive && o.material.emissiveIntensity > 1.5) { o.material = o.material.clone(); o.material.emissive.setHex(0xff5a1a); o.material.emissiveIntensity = 0.5; } }); ZZ.parked.position.set(36, 2.15, -6); ZZ.parked.rotation.y = -2.2; S.add(ZZ.parked);
    ZZ.parked.children.forEach(c => { if (c.geometry && c.geometry.type === 'ConeGeometry') c.visible = false; });
    for (let i = 0; i < 6; i++) { const s = zGlowSprite(i % 2 ? 'rgb(60,255,90)' : 'rgb(255,190,40)', 0.9, 0.2); const a = i / 6 * Math.PI * 2; s.position.set(36 + Math.cos(a) * 9.4, 0.3, -6 + Math.sin(a) * 9.4); S.add(s); ZZ.beacons.push(s); } }
  ZZ.tanks = [zzTank(0x4e5236), zzTank(0x5a5440)]; ZZ.tanks[0].position.set(-12, 0, -41); ZZ.tanks[0].rotation.y = 0.15; ZZ.tanks[1].position.set(12, 0, -42); ZZ.tanks[1].rotation.y = -0.2; ZZ.tanks.forEach(t => S.add(t));
  ZZ.patrolTank = zzTank(0x45482e); S.add(ZZ.patrolTank);
  ZZ.trucks = [0, 1, 2].map(i => { const t = zzTruck(i + 1); t.userData.truckId = i; t.position.set(8, 0, 42 + i * 10); t.rotation.y = Math.PI; S.add(t); return t; });
  // ruins (west) + skyline + fires + smoke
  { const R = zRand(91); const mk = (x, z, w, d, h, seed) => { const tx = zzConcrete(seed, true); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(Math.max(1, w / 8), Math.max(1, h / 8));
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), zzM(0xffffff, { map: tx })); b.position.set(x, h / 2, z); S.add(b);
      for (let k = 0; k < 4; k++) { const ch = new THREE.Mesh(new THREE.BoxGeometry(w * (0.2 + R() * 0.3), 1 + R() * 3, d * (0.2 + R() * 0.3)), zzM(0x6a665e)); ch.position.set(x + (R() - 0.5) * w * 0.6, h + 0.4, z + (R() - 0.5) * d * 0.6); ch.rotation.set((R() - 0.5) * 0.5, R(), (R() - 0.5) * 0.5); S.add(ch); }
      for (let k = 0; k < 6; k++) { const rb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + R() * 1.4, 0), zzM(0x5e5a52, { flatShading: true })); rb.position.set(x + (R() - 0.5) * (w + 6), 0.2, z + (R() - 0.5) * (d + 6)); rb.rotation.set(R() * 3, R() * 3, R() * 3); S.add(rb); }
      const rbar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 4), zzM(0x5a3a2a)); rbar.position.set(x + w * 0.3, h + 1.2, z); rbar.rotation.z = 0.4; S.add(rbar); };
    [[-66, -20, 14, 12, 18], [-80, 8, 12, 16, 26], [-62, 26, 16, 10, 12], [-96, -30, 18, 14, 34], [-104, 24, 14, 14, 22], [-74, -52, 12, 12, 16], [-58, 58, 12, 12, 10], [-120, -4, 16, 20, 40]].forEach((b, i) => mk(b[0], b[1], b[2], b[3], b[4], i + 3));
    for (let i = 0; i < 46; i++) { const a = i / 46 * Math.PI * 2 + R() * 0.1, d = 320 + R() * 160, h = 30 + R() * 90, w = 20 + R() * 40; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.8), zzM(0x2e2a28)); b.position.set(Math.cos(a) * d, h / 2 - 2, Math.sin(a) * d); b.rotation.y = R() * 3; S.add(b);
      if (R() < 0.35) { const tp = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, h * 0.3, w * 0.3), zzM(0x2e2a28)); tp.position.set(b.position.x, h - 2 + h * 0.12, b.position.z); tp.rotation.z = 0.3; S.add(tp); }
      if (R() < 0.3) { const f = zGlowSprite('rgb(255,120,40)', 14 + R() * 10, 0.2); f.position.set(b.position.x, h * (0.3 + R() * 0.5), b.position.z); S.add(f); ZZ.fires.push({ s: f, b: f.scale.x, ph: R() * 7 }); } }
    // craters + burned wrecks
    for (let i = 0; i < 16; i++) { const a = R() * 7, d = 34 + R() * 90, c = new THREE.Mesh(new THREE.RingGeometry(0.1, 3 + R() * 3, 18), new THREE.MeshBasicMaterial({ color: 0x1a1410, transparent: true, opacity: 0.75, depthWrite: false })); c.rotation.x = -Math.PI / 2; c.position.set(Math.cos(a) * d, 0.06, Math.sin(a) * d); S.add(c); }
    [[-34, 28, 0.6], [26, -40, 2.2], [-52, -6, 1.1], [40, 26, 2.8], [-20, 44, 0.2]].forEach(([x, z, r], i) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.set(0, r, i === 2 ? 0.4 : 0); S.add(c); const bm = zzM(0x2a2622, { roughness: 1, metalness: 0.3 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.9, 4.6), bm); b.position.y = 0.6; c.add(b); const cb = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.7, 2.2), bm); cb.position.set(0, 1.35, -0.2); c.add(cb);
      if (i < 3) { const f = zGlowSprite('rgb(255,130,40)', 4, 0.2); f.position.set(0, 1.6, 0); c.add(f); ZZ.fires.push({ s: f, b: 4, ph: i }); } });
    // fire lights + smoke columns
    [[-66, 0, -20], [-80, 0, 8], [-52, 0, -6], [26, 0, -40], [-34, 0, 28]].forEach(([x, , z], i) => { const sm = { c: new THREE.Vector3(x, 0, z), parts: [], col: i === 3 ? 0x2a2624 : 0x3a3430 };
      for (let k = 0; k < 14; k++) { const s = zzSmoke(sm.col, 0.0); S.add(s); sm.parts.push({ s, age: k / 14 * 9 }); } ZZ.smokes.push(sm);
      if (i < 3) { const f = zGlowSprite('rgb(255,140,50)', 7, 0.2); f.position.set(x, i === 1 ? 26 : 3, z + (i === 1 ? 0 : 6)); S.add(f); ZZ.fires.push({ s: f, b: 7, ph: i * 1.7 }); } });
    ZZ.fireL = [new THREE.PointLight(0xff7a2a, 2, 40, 2), new THREE.PointLight(0xff7a2a, 1.6, 30, 2)]; ZZ.fireL[0].position.set(-60, 4, -14); ZZ.fireL[1].position.set(-34, 2, 28); ZZ.fireL.forEach(l => S.add(l)); }
  // the closing circle (gas wall)
  { const gt = smTex(256, 256, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,60,30,0)'); g.addColorStop(0.55, 'rgba(255,80,40,0.55)'); g.addColorStop(1, 'rgba(255,120,60,0.95)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 256; i += 16) { x.fillStyle = 'rgba(255,200,160,0.12)'; x.fillRect(0, i, 256, 4); } }, [24, 1]);
    ZZ.gasTex = gt; ZZ.gas = new THREE.Mesh(new THREE.CylinderGeometry(240, 240, 140, 96, 1, true), new THREE.MeshBasicMaterial({ map: gt, color: 0xff4a20, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); ZZ.gas.position.y = 60; S.add(ZZ.gas); }
  // sky traffic: choppers, cargo plane, tracers, embers
  for (let i = 0; i < 2; i++) { const h = heliModel(0x3a4030); h.traverse(o => { if (o.isMesh && o.material.emissive && o.material.emissiveIntensity > 1.5) { o.material = o.material.clone(); o.material.emissive.setHex(0xff5a1a); o.material.emissiveIntensity = 0.5; } }); S.add(h); ZZ.helis.push({ o: h, a: i * Math.PI, r: 70 + i * 25, y: 34 + i * 10, sp: 0.09 + i * 0.03 }); }
  ZZ.plane = zzPlane(); S.add(ZZ.plane);
  { const n = 36, g = new THREE.BufferGeometry(); ZZ.trc = { n, pos: new Float32Array(n * 6), p: [] }; for (let i = 0; i < n; i++) ZZ.trc.p.push({ life: 0 });
    g.setAttribute('position', new THREE.BufferAttribute(ZZ.trc.pos, 3)); ZZ.trc.lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xffd070, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); ZZ.trc.lines.frustumCulled = false; S.add(ZZ.trc.lines); }
  { const n = 700, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), R = zRand(19); for (let i = 0; i < n; i++) p.set([(R() - 0.5) * 120, R() * 40, (R() - 0.5) * 120], i * 3);
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); ZZ.ash = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffa060, size: 0.14, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(ZZ.ash); }
  // supply drops
  ZZ.dropSpots = [[24, 38], [-36, -38], [40, -30], [-40, 34]]; for (let i = 0; i < 2; i++) ZZ.drops.push(zzNewDrop(i * 2, i * 9));
  // soldiers: sentries at sandbags + by the trucks, crews, patrol squads outside the wire
  { const add = (x, z, ry, mode, ph) => { const p = NPC.make({ style: 'mil', seed: 500 + ZZ.soldiers.length * 13 }); p.position.set(x, 0, z); p.rotation.y = ry; S.add(p); ZZ.soldiers.push({ o: p, mode, ph: ph || Math.random() * 7 }); return p; };
    add(-6, 17.4, 0, 'aim'); add(-7.6, 16.8, 0.4, 'aim'); add(17, 13.3, 0, 'aim'); add(-40.6, -9, -1.4, 'aim'); add(-45.6, 23.2, -1.2, 'aim'); add(30, 36.6, Math.PI, 'aim'); add(35.2, -15, 1.8, 'aim');
    add(12.6, 9, 2.4, 'idle'); add(17.2, 8.6, -2.6, 'idle'); add(15, 11.6, Math.PI, 'idle'); add(33, -1, -2, 'idle'); add(39, -2.6, 2.6, 'idle'); add(4.6, 40, 0.5, 'idle'); add(11.4, 50, -1.2, 'idle');
    add(-7, -36, 0.2, 'idle'); add(7.5, -36.5, -0.4, 'idle'); add(-1, -35, 0, 'idle'); add(-22, 21.5, Math.PI, 'aim');
    for (let sq = 0; sq < 3; sq++) for (let k = 0; k < 4; k++) { const p = NPC.make({ style: 'mil', seed: 900 + sq * 31 + k * 7 }); S.add(p); ZZ.patrol.push({ o: p, u: sq / 3 + k * 0.006, step: 0 }); } }
  // operator vault
  buildVault();
}
function zzNewDrop(spot, delay, user) {
  const S = ZZ.scene, c = zzChute(spot % 2 ? 0xd8d4c8 : 0xc83a2a, true), [x, z] = ZZ.dropSpots[spot % ZZ.dropSpots.length]; c.position.set(x, 75, z); S.add(c);
  if (user) { const ns = nameSprite(user, '#ffb02e'); ns.position.y = 3.2; c.add(ns); }
  const smoke = { c: new THREE.Vector3(x + 2.5, 0, z + 1), parts: [], col: 0xd02a1a, red: true }; for (let k = 0; k < 12; k++) { const s = zzSmoke(0xd02a1a, 0); S.add(s); smoke.parts.push({ s, age: k / 12 * 7 }); }
  const flare = zGlowSprite('rgb(255,40,20)', 1.6, 0.2); flare.position.set(x + 2.5, 0.3, z + 1); S.add(flare);
  return { c, smoke, flare, spot, t: -(delay || 0), user };
}
function zzRemoveDrop(D) { [D.c, D.flare].concat(D.smoke.parts.map(p => p.s)).forEach(o => ZZ.scene.remove(o)); }
function airdrop(user) { const free = ZZ.dropSpots.findIndex((_, i) => !ZZ.drops.some(D => D.spot === i)); const spot = free >= 0 ? free : 0; if (free < 0) { const old = ZZ.drops.shift(); zzRemoveDrop(old); }
  ZZ.drops.push(zzNewDrop(spot, 0, user)); }
// ---- explosions + sound
function zzBoomSound(dist) { if (ZONES.cur !== 'zero') return; try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); if (zAC.state === 'suspended') zAC.resume(); const a = zAC, t0 = a.currentTime + Math.min(1.2, dist / 340), len = 2.6;
  const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * len, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (a.sampleRate * 0.5));
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180 + 9000 / dist; const g = a.createGain(), v = Math.min(0.22, 14 / dist); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  n.buffer = b; n.connect(lp); lp.connect(g); g.connect(a.destination); n.start(t0); } catch (e) {} }
function zzBoom() { const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 150, p = new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d);
  const f = zGlowSprite('rgb(255,150,60)', 1, 0.25); f.position.copy(p).setY(4); ZZ.scene.add(f); const parts = []; for (let k = 0; k < 6; k++) { const s = zzSmoke(0x2a2420, 0.55); s.position.copy(p).add(new THREE.Vector3((Math.random() - 0.5) * 8, 3 + Math.random() * 4, (Math.random() - 0.5) * 8)); s.scale.setScalar(8); ZZ.scene.add(s); parts.push(s); }
  ZZ.booms.push({ f, parts, t: 0, p }); ZZ.boomL.position.copy(p).setY(12); ZZ.boomL.intensity = 9; zzBoomSound(cam.position.distanceTo(p)); }
function zzTracer(i) { const P = ZZ.trc.p[i], R = Math.random; const a = R() * Math.PI * 2, d = 120 + R() * 140; P.o = new THREE.Vector3(Math.cos(a) * d, 2, Math.sin(a) * d); P.v = new THREE.Vector3((R() - 0.5) * 60, 90 + R() * 60, (R() - 0.5) * 60); P.life = 1.2 + R() * 0.8; P.age = 0; }
// ---- tick
function zeroTick(dt, t) {
  // flag + towers + lights
  { const p = ZZ.flag.geometry.attributes.position, b = ZZ.flagBase; for (let i = 0; i < p.count; i++) { const x = b[i * 3]; p.setZ(i, Math.sin(x * 1.8 - t * 5) * 0.22 * (x / 3.6)); p.setY(i, b[i * 3 + 1] - x * 0.05); } p.needsUpdate = true; ZZ.flag.geometry.computeVertexNormals(); }
  ZZ.towers.forEach(T => { T.sp.rotation.y = Math.sin(t * 0.35 + T.ph) * 1.1 + (T.ph ? -2.3 : 2.3); T.sp.rotation.x = 0.35 + Math.sin(t * 0.5 + T.ph) * 0.1; });
  ZZ.mastLight.visible = (t % 1.6) < 0.3; ZZ.beacons.forEach((b, i) => b.material.opacity = (Math.floor(t * 3) % 6) === i ? 1 : 0.25);
  ZZ.sign.material.opacity = 0.9 + Math.sin(t * 3) * 0.1; ZZ.gasTex.offset.x += dt * 0.004; ZZ.gasTex.offset.y = Math.sin(t * 0.5) * 0.04; ZZ.gas.material.opacity = 0.5 + Math.sin(t * 1.3) * 0.1; const gr = 240 - (Math.sin(t * 0.03) * 0.5 + 0.5) * 30; ZZ.gas.scale.set(gr / 240, 1, gr / 240);
  ZZ.fires.forEach(f => { const k = 0.85 + Math.sin(t * 11 + f.ph) * 0.1 + Math.sin(t * 23 + f.ph) * 0.06; f.s.scale.setScalar(f.b * k); });
  ZZ.fireL.forEach((l, i) => l.intensity = 1.6 + Math.sin(t * 13 + i) * 0.35 + Math.random() * 0.2);
  heliTick(ZZ.parked, dt, t, 0.12);
  ZZ.tanks.forEach((T, i) => T.userData.tur.rotation.y = Math.sin(t * 0.18 + i * 2) * 0.9);
  { const a = t * 0.035, r = 72, T = ZZ.patrolTank; T.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); T.rotation.y = -a; T.userData.tur.rotation.y = Math.sin(t * 0.2) * 0.6 + 1.2; }
  ZZ.trucks.forEach(T => { if (!TR.on || !/^truck/.test(TR.mode)) zzTruckTick(T, dt, t, 0); });
  // smoke columns
  const wind = new THREE.Vector3(1.6, 0, -0.6);
  const smokeTick = (sm, life, rise) => sm.parts.forEach(P => { P.age += dt; if (P.age > life) P.age -= life; const k = P.age / life; P.s.position.set(sm.c.x + wind.x * P.age * (sm.red ? 0.6 : 1.4) + Math.sin(P.age + sm.c.x) * 0.6, sm.c.y + 1 + P.age * rise, sm.c.z + wind.z * P.age * 1.4);
    P.s.scale.setScalar((sm.red ? 1.5 : 5) + k * (sm.red ? 9 : 26)); P.s.material.opacity = (k < 0.12 ? k / 0.12 : 1 - k) * (sm.red ? 0.75 : 0.55); });
  ZZ.smokes.forEach(sm => smokeTick(sm, 9, 4.2));
  // supply drops
  ZZ.drops.forEach(D => { D.t += dt; const c = D.c; if (D.t < 0) { c.visible = false; D.flare.visible = false; D.smoke.parts.forEach(P => P.s.visible = false); return; } c.visible = true; D.flare.visible = true; D.smoke.parts.forEach(P => P.s.visible = true);
    smokeTick(D.smoke, 7, 2.6); D.flare.material.opacity = 0.7 + Math.random() * 0.3;
    if (c.position.y > 0.01) { c.position.y = Math.max(0, 75 - D.t * 4.2); c.rotation.y += dt * 0.25; c.position.x += Math.sin(t * 0.7 + D.spot) * dt * 0.3; c.userData.canopy.rotation.z = Math.sin(t * 1.1) * 0.08; }
    else { D.land = (D.land || 0) + dt; c.userData.canopy.scale.y = Math.max(0.05, 1 - D.land * 1.2); c.userData.canopy.position.y = Math.max(1.6, 6.4 - D.land * 3); c.userData.light.visible = (t % 0.8) < 0.4; }
    if (D.land > (D.user ? 40 : 22) && !D.user) { zzRemoveDrop(D); Object.assign(D, zzNewDrop((D.spot + 2) % ZZ.dropSpots.length, 4)); D.land = 0; }
    if (D.land > 40 && D.user) { zzRemoveDrop(D); D.dead = true; } });
  ZZ.drops = ZZ.drops.filter(D => !D.dead); while (ZZ.drops.length < 2) ZZ.drops.push(zzNewDrop((ZZ.drops.length ? ZZ.drops[0].spot + 1 : 0) % ZZ.dropSpots.length, 6));
  // explosions in the distance
  ZZ.nextBoom -= dt; if (ZZ.nextBoom <= 0) { ZZ.nextBoom = 3 + Math.random() * 6; zzBoom(); }
  ZZ.boomL.intensity *= Math.max(0, 1 - dt * 5);
  ZZ.booms = ZZ.booms.filter(B => { B.t += dt; const k = B.t; B.f.scale.setScalar(6 + Math.min(1, k * 5) * 40); B.f.material.opacity = Math.max(0, 1 - k * 1.6);
    B.parts.forEach((s, i) => { s.position.y += dt * (2.2 + i * 0.4); s.scale.setScalar(8 + k * 5); s.material.opacity = Math.max(0, 0.6 - k * 0.07); });
    if (k > 8) { ZZ.scene.remove(B.f); B.parts.forEach(s => ZZ.scene.remove(s)); return false; } return true; });
  // tracers
  { const T = ZZ.trc; for (let i = 0; i < T.n; i++) { const P = T.p[i]; if (P.life <= 0) { if (Math.random() < dt * 1.4) zzTracer(i); else { T.pos.fill(0, i * 6, i * 6 + 6); continue; } }
      P.age += dt; P.life -= dt; const a = P.o.clone().addScaledVector(P.v, P.age), b = P.o.clone().addScaledVector(P.v, Math.max(0, P.age - 0.07)); T.pos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6); }
    T.lines.geometry.attributes.position.needsUpdate = true; }
  // choppers + cargo plane with paratroopers
  ZZ.helis.forEach((H, i) => { H.a += dt * H.sp; H.o.position.set(Math.cos(H.a) * H.r, H.y + Math.sin(t * 0.6 + i) * 2, Math.sin(H.a) * H.r - 10); H.o.rotation.set(0.08, -H.a + Math.PI, -0.18); heliTick(H.o, dt, t, 1); });
  { ZZ.nextPlane -= dt; const P = ZZ.plane; if (ZZ.nextPlane <= 0 && !P.visible) { P.visible = true; P.userData.x = -520; P.userData.drop = 0; }
    if (P.visible) { P.userData.x += dt * 52; P.position.set(P.userData.x, 105, -70); P.rotation.y = Math.PI / 2; P.userData.strobe.visible = (t % 1) < 0.1;
      if (P.userData.x > -120 && P.userData.x < 120 && (P.userData.drop -= dt) <= 0) { P.userData.drop = 1.3; const c = zzChute(0x4a5030); c.position.set(P.userData.x, 100, -70); ZZ.scene.add(c); ZZ.chutes.push({ c, v: 3.4 + Math.random() }); }
      if (P.userData.x > 520) { P.visible = false; ZZ.nextPlane = 40 + Math.random() * 20; } } }
  ZZ.chutes = ZZ.chutes.filter(C => { C.c.position.y -= C.v * dt; C.c.position.x += dt * 2; C.c.rotation.y += dt * 0.3; if (C.c.position.y < 0) { ZZ.scene.remove(C.c); return false; } return true; });
  // embers
  { const a = ZZ.ash.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * (0.6 + (i % 5) * 0.2); if (y > 40) y = 0; a.setXY(i, a.getX(i) + Math.sin(t + i) * dt * 0.4, y); } a.needsUpdate = true; ZZ.ash.position.set(cam.position.x * 0.6, 0, cam.position.z * 0.6); }
  // soldiers
  ZZ.soldiers.forEach(S => NPC.pose(S.o, S.mode, t, S.ph));
  ZZ.patrol.forEach(P => { const per = 2 * (56 + 64); P.u = (P.u + dt * 1.3 / per) % 1; let d = P.u * per; const pt = new THREE.Vector3(); let yaw;
    if (d < 56) { pt.set(-28 + d, 0, -32); yaw = Math.PI / 2; } else if ((d -= 56) < 64) { pt.set(28, 0, -32 + d); yaw = 0; } else if ((d -= 64) < 56) { pt.set(28 - d, 0, 32); yaw = -Math.PI / 2; } else { d -= 56; pt.set(-28, 0, 32 - d); yaw = Math.PI; }
    P.o.position.copy(pt); P.o.rotation.y = yaw; P.step += dt * 1.3 * 2.7; NPC.pose(P.o, 'walk', t, 0, P.step); });
  // viewers (!spawn) run laps as operators
  if ((ZZ.syncT = (ZZ.syncT || 0) - dt) <= 0) { ZZ.syncT = 3; const live = new Set(spawned.map(w => w.user));
    Object.keys(ZZ.viewers).forEach(u => { if (!live.has(u)) { ZZ.scene.remove(ZZ.viewers[u].o); delete ZZ.viewers[u]; } });
    spawned.forEach(w => { if (ZZ.viewers[w.user]) return; const col = w.o.userData.col || '#ff2d8f', p = NPC.make({ style: 'mil', col: new THREE.Color(col).getHex(), viewer: true, seed: NPC.hash(w.user) });
      const ns = nameSprite(w.user, col); ns.position.y = 2.4; p.add(ns); ZZ.scene.add(p); ZZ.viewers[w.user] = { o: p, a: Math.random() * 7, r: 30 + Math.random() * 4, sp: 0.07 + Math.random() * 0.03, step: 0 }; }); }
  Object.values(ZZ.viewers).forEach(v => { v.a += dt * v.sp; v.o.position.set(Math.cos(v.a) * v.r, 0, Math.sin(v.a) * v.r); v.o.rotation.y = -v.a + Math.PI; v.step += dt * v.sp * v.r * 2.7; NPC.pose(v.o, 'walk', t, 0, v.step); });
  vaultTick(t);
}
// ---------------------------------------------------------------- the military convoy trip (city <-> Zone Zero)
const zDust = document.createElement('div'); zDust.style.cssText = 'position:fixed;inset:-10%;pointer-events:none;z-index:7;opacity:0;transform:scale(1.2);background:radial-gradient(circle at 25% 35%,#c8a070 0,rgba(184,140,90,.95) 22%,rgba(160,120,80,0) 46%),radial-gradient(circle at 70% 30%,#b89060 0,rgba(170,130,84,.95) 24%,rgba(150,110,70,0) 48%),radial-gradient(circle at 50% 72%,#a88050 0,rgba(150,112,72,.95) 26%,rgba(140,100,60,0) 52%),#9a7650';
document.body.appendChild(zDust);
function dustWipe(inS, hold, outS) { zDust.style.transition = `opacity ${inS}s ease-in, transform ${inS + hold + outS}s ease-out`; zDust.style.opacity = 1; zDust.style.transform = 'scale(1.0)';
  setTimeout(() => { zDust.style.transition = `opacity ${outS}s ease-out, transform ${outS}s ease-out`; zDust.style.opacity = 0; zDust.style.transform = 'scale(1.3)'; }, (inS + hold) * 1000); }
function truckSound(len) { try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); if (zAC.state === 'suspended') zAC.resume(); const a = zAC, t0 = a.currentTime + 0.02;
  const o = a.createOscillator(), o2 = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain(); o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(38, t0); o.frequency.linearRampToValueAtTime(64, t0 + len * 0.55); o.frequency.linearRampToValueAtTime(46, t0 + len);
  o2.frequency.setValueAtTime(19, t0); o2.frequency.linearRampToValueAtTime(32, t0 + len * 0.55); lp.type = 'lowpass'; lp.frequency.value = 340; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.7); g.gain.setValueAtTime(0.12, t0 + len - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  const g2 = a.createGain(); g2.gain.value = 0.4; o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t0); o2.start(t0); o.stop(t0 + len); o2.stop(t0 + len);
  const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * 0.9, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500; const hg = a.createGain(), th = t0 + 3.9; hg.gain.setValueAtTime(0.0001, t0); hg.gain.setValueAtTime(0.0001, th); hg.gain.exponentialRampToValueAtTime(0.06, th + 0.05); hg.gain.exponentialRampToValueAtTime(0.0001, th + 0.85);
  n.buffer = b; n.connect(hp); hp.connect(hg); hg.connect(a.destination); n.start(t0); } catch (e) {} }
function convoyChase(L, back, up, side, k) { const fwd = new THREE.Vector3(Math.sin(L.rotation.y), 0, Math.cos(L.rotation.y)), right = new THREE.Vector3(fwd.z, 0, -fwd.x);
  const want = L.position.clone().addScaledVector(fwd, -back).addScaledVector(right, side).add(new THREE.Vector3(0, up, 0));
  cam.position.lerp(want, Math.min(1, k)); cam.quaternion.slerp(lookQuat(cam.position, L.position.clone().addScaledVector(fwd, 10).add(new THREE.Vector3(0, 1.8, 0))), Math.min(1, k)); }
function truckTripTick(dt, t) {
  const T = TR; T.k = (T.k || 0) + dt;
  if (!ZZ.city) { ZZ.city = [0, 1, 2].map(i => { const k = zzTruck(i + 1); k.id = i; k.visible = false; scene.add(k); return k; }); }
  const C = ZZ.city, Z = ZZ.trucks, place = (arr, x, z0, dir, gap) => arr.forEach((k, i) => { k.position.set(x, 0, z0 - dir * i * gap); k.rotation.set(0, dir > 0 ? 0 : Math.PI, 0); });
  if (T.mode === 'truckOut') {
    if (!T.st) { T.st = 'arrive'; T.k = 0; dustWipe(0.35, 0.2, 0.6); truckSound(12); setTimeout(() => { C.forEach(k => k.visible = true); place(C, -3, -10, -1, 11); const P = new THREE.Vector3(-10.5, 2.4, -97); cam.position.copy(P); cam.quaternion.copy(lookQuat(P, new THREE.Vector3(-3, 1.8, -62))); cam.fov = 55; cam.updateProjectionMatrix(); fly = null; hold = null; }, 380); }
    if (T.st === 'arrive') { if (T.k < 0.4) return true; const u = Math.min(1, (T.k - 0.4) / 4.2), e = 1 - Math.pow(1 - u, 2.2); place(C, -3, -10 - e * 58, -1, 11); C.forEach(k => zzTruckTick(k, dt, t, (1 - u) * 10));
      cam.quaternion.slerp(lookQuat(cam.position, C[0].position.clone().add(new THREE.Vector3(0, 1.8, 0))), Math.min(1, dt * 3)); if (u >= 1 && T.k > 5.4) { T.st = 'leave'; T.k = 0; T.v = 0; } return true; }
    if (T.st === 'leave') { T.v = Math.min(15, T.v + dt * 5.5); C.forEach(k => { k.position.z -= T.v * dt; zzTruckTick(k, dt, t, T.v); }); convoyChase(C[2], 9, 4.2, 2.2, dt * (T.k < 0.6 ? 1.4 : 2.4));
      if (T.k > 2.2 && !T.wiped) { T.wiped = true; dustWipe(0.5, 0.45, 0.9); }
      if (T.k > 2.85) { C.forEach(k => k.visible = false); setZone('zero'); T.st = 'cruise'; T.k = 0; place(Z, 8, 230, -1, 11); cam.position.copy(Z[2].position).add(new THREE.Vector3(2, 4, 10)); cam.quaternion.copy(lookQuat(cam.position, Z[0].position.clone().setY(1.8))); } return true; }
    if (T.st === 'cruise') { const u = Math.min(1, T.k / 7), e = 1 - Math.pow(1 - u, 2.2); place(Z, 8, 230 - e * (230 - 42), -1, 10 + (1 - u) * 1); Z.forEach(k => zzTruckTick(k, dt, t, (1 - u) * 14)); zeroTick(dt, t);
      convoyChase(Z[2], u < 0.7 ? 10 : 12, u < 0.7 ? 4 : 6, u < 0.7 ? 2 : 6, dt * 2); cam.fov += (58 - cam.fov) * Math.min(1, dt); cam.updateProjectionMatrix(); if (T.k > 7.6) return trFinish(); return true; }
  } else {
    if (!T.st) { T.st = 'board'; T.k = 0; truckSound(10); Z.forEach(k => k.rotation.set(0, 0, 0)); }
    if (T.st === 'board') { zeroTick(dt, t); if (T.k < 1.2) convoyChase(Z[0], 11, 4.5, 5, dt * 2); else { T.v = Math.min(15, (T.v || 0) + dt * 5.5); Z.forEach(k => { k.position.z += T.v * dt; zzTruckTick(k, dt, t, T.v); }); convoyChase(Z[0], 10, 4, 2, dt * 2.4); }
      if (T.k > 3.3 && !T.wiped) { T.wiped = true; dustWipe(0.5, 0.45, 0.9); }
      if (T.k > 3.95) { setZone('city'); T.st = 'cityArrive'; T.k = 0; C.forEach(k => k.visible = true); place(C, -3, -80, 1, 11); cam.position.copy(C[2].position).add(new THREE.Vector3(2, 4, -10)); cam.quaternion.copy(lookQuat(cam.position, C[0].position.clone().setY(1.8))); place(Z, 8, 42, -1, 10); } return true; }
    if (T.st === 'cityArrive') { const u = Math.min(1, T.k / 4.2), e = 1 - Math.pow(1 - u, 2); place(C, -3, -80 + e * 40, 1, 11); C.forEach(k => zzTruckTick(k, dt, t, (1 - u) * 12)); convoyChase(C[2], 10, 4, 2.2, dt * 2);
      if (T.k > 4.5) { setTimeout(() => { if (ZZ.city && !TR.on) ZZ.city.forEach(k => k.visible = false); }, 5000); return trFinish(); } return true; }
  }
  return true;
}

// ---------------------------------------------------------------- THE ABYSS: LSC Deep Station, an underwater bunker on the edge of a trench (calm, eerie water, sea life and giant monsters; the screens live in the Dark Room)
const AB = { scene: new THREE.Scene(), schools: [], jellies: [], mantas: [], snow: null, shafts: [], bubbles: [], viewers: {}, lights: [], caust: [], eyes: [] };
const abM = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85 }, o || {}));
const abGlow = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }, o || {}));
function abTerrainH(x, z) {                       // seafloor height: soft dunes, flat pad for the bunker, the trench drops away to the north
  const n = AB.noise || (AB.noise = zNoise(31));
  let h = (zFbm(n, x * 0.018, z * 0.018, 4) - 0.5) * 6 + (zFbm(n, x * 0.07 + 9, z * 0.07, 2) - 0.5) * 1.2;
  const pad = Math.max(0, 1 - Math.max(0, Math.hypot(x, z - 14) - 26) / 18); h = h * (1 - pad) - 0.6 * pad;
  const tr = z < -14 ? Math.min(1, (-14 - z) / 30) : 0; h -= tr * tr * (58 + Math.sin(x * 0.03) * 10);
  return h;
}
function abCaustTex() {
  const [c, t] = zCanvasTex(512, 512), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 512, 512);
  x.globalCompositeOperation = 'lighter'; const R = zRand(77);
  for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(120,255,230,${0.05 + R() * 0.1})`; x.lineWidth = 1 + R() * 3; x.beginPath(); let px = R() * 512, py = R() * 512; x.moveTo(px, py);
    for (let k = 0; k < 6; k++) { px += (R() - 0.5) * 120; py += (R() - 0.5) * 120; x.quadraticCurveTo(px + (R() - 0.5) * 60, py + (R() - 0.5) * 60, px, py); } x.stroke(); }
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; return t;
}
function abFish(col, size) {
  const g = new THREE.Group(), m = abM(col, { roughness: 0.4, metalness: 0.5, emissive: new THREE.Color(col).multiplyScalar(0.25) });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), m); body.scale.set(0.35, 0.55, 1.1); g.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 4), m); tail.rotation.x = -Math.PI / 2; tail.position.z = -0.75; tail.scale.set(0.15, 1, 1); g.add(tail); g.userData.tail = tail;
  g.scale.setScalar(size); return g;
}
function abJelly(col) {
  const g = new THREE.Group(), bell = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), abGlow(col, { opacity: 0.45, side: THREE.DoubleSide }));
  g.add(bell); const core = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), abGlow(col, { opacity: 0.9 })); core.position.y = 0.25; g.add(core);
  const tents = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, pts = []; for (let k = 0; k < 10; k++) pts.push(new THREE.Vector3(Math.cos(a) * 0.7, -k * 0.55, Math.sin(a) * 0.7));
    const geo = new THREE.BufferGeometry().setFromPoints(pts), ln = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(ln); tents.push({ ln, a }); }
  g.userData = { bell, tents }; return g;
}
function abManta() {
  const g = new THREE.Group(), m = abM(0x16222c, { roughness: 0.6 }), belly = abM(0xb8c8cc, { roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), m); body.scale.set(1, 0.3, 1.6); g.add(body);
  const wingGeo = new THREE.BufferGeometry(); wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 1.6, 4.8, 0, -0.4, 0, 0, -1.6], 3)); wingGeo.computeVertexNormals();
  const wl = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({ color: 0x16222c, roughness: 0.6, side: THREE.DoubleSide })), wr = wl.clone(); wr.scale.x = -1; g.add(wl, wr);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 4, 5), m); tail.rotation.x = Math.PI / 2; tail.position.z = -3.4; g.add(tail);
  const under = new THREE.Mesh(new THREE.CircleGeometry(1.1, 12), belly); under.rotation.x = Math.PI / 2; under.position.y = -0.38; under.scale.y = 1.5; g.add(under);
  g.userData = { wl, wr }; return g;
}
function abSerpent() {                              // the leviathan: a long glowing-spined sea serpent
  const g = new THREE.Group(), N = 46, segs = [], skin = abM(0x0c1a1c, { roughness: 0.5, metalness: 0.3 }), glow = abGlow(0x29ffd8, { opacity: 0.9 });
  for (let i = 0; i < N; i++) { const r = 2.6 * Math.sin(Math.min(1, (i + 3) / (N * 0.25)) * Math.PI / 2) * (1 - i / N * 0.85) + 0.25;
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), skin); s.scale.z = 1.6; g.add(s);
    if (i % 2 === 0 && i > 2 && i < N - 4) { const sp = new THREE.Mesh(new THREE.ConeGeometry(r * 0.25, r * 1.1, 5), glow); sp.position.y = r * 1.05; s.add(sp); }
    segs.push({ m: s, r }); }
  const head = segs[0].m, jaw = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.2, 8), skin); jaw.rotation.x = Math.PI / 2; jaw.position.z = 2.8; head.add(jaw);
  [-1, 1].forEach(sx => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), abGlow(0xffd23a, { opacity: 1 })); e.position.set(sx * 1.35, 0.7, 1.4); head.add(e); AB.eyes.push(e); });
  g.userData = { segs, trail: [] }; return g;
}
function abSquid() {                                // giant squid lurking in the trench
  const g = new THREE.Group(), skin = abM(0x4a1622, { roughness: 0.55, emissive: 0x1a0408 });
  const mantle = new THREE.Mesh(new THREE.ConeGeometry(4.2, 18, 14), skin); mantle.position.y = 10; g.add(mantle);
  const headM = new THREE.Mesh(new THREE.SphereGeometry(4.4, 16, 12), skin); headM.scale.y = 0.8; g.add(headM);
  [-1, 1].forEach(sx => { const e = new THREE.Mesh(new THREE.SphereGeometry(1.3, 14, 10), abGlow(0xff5a2a, { opacity: 1 })); e.position.set(sx * 3.6, 0.6, 1.6); g.add(e); AB.eyes.push(e); });
  const arms = []; for (let a = 0; a < 10; a++) { const ang = a / 10 * Math.PI * 2, chain = []; let parent = g;
    for (let k = 0; k < 12; k++) { const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.9 * (1 - k / 13) + 0.1, 1.0 * (1 - k / 13) + 0.12, 2.6, 7), skin);
      seg.geometry.translate(0, -1.3, 0); if (k === 0) { seg.position.set(Math.cos(ang) * 2.6, -2.5, Math.sin(ang) * 2.6); seg.rotation.set(Math.sin(ang) * 0.5, 0, -Math.cos(ang) * 0.5); } else seg.position.y = -2.5;
      parent.add(seg); chain.push(seg); parent = seg; }
    arms.push({ chain, ph: a * 0.7 }); }
  g.userData = { arms }; return g;
}
function abWhale() {
  const g = new THREE.Group(), m = abM(0x0a1418, { roughness: 0.8 });
  const b = new THREE.Mesh(new THREE.SphereGeometry(6, 18, 12), m); b.scale.set(1, 0.8, 3.6); g.add(b);
  const t = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 4), m); t.position.z = -22; g.add(t); g.userData.tail = t;
  [-1, 1].forEach(s => { const f = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 3), m); f.position.set(s * 7, -2, 6); f.rotation.z = s * 0.4; g.add(f); });
  return g;
}
function buildAbyss() {
  const S = AB.scene, WATER = 0x021820; S.fog = new THREE.FogExp2(WATER, 0.017); S.background = new THREE.Color(WATER);
  S.add(new THREE.HemisphereLight(0x3ac8c0, 0x02080a, 0.42)); const sun = new THREE.DirectionalLight(0x6ae6e0, 0.35); sun.position.set(20, 100, 10); S.add(sun);
  // seafloor
  { const g = new THREE.PlaneGeometry(700, 700, 200, 200); g.rotateX(-Math.PI / 2); const p = g.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = abTerrainH(x, z); p.setY(i, h); const d = Math.max(0, Math.min(1, -h / 50)); col.push(0.32 - d * 0.25, 0.30 - d * 0.22, 0.24 - d * 0.16); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const sand = smTex(512, 512, x => { x.fillStyle = '#7a7466'; x.fillRect(0, 0, 512, 512); const R = zRand(5); for (let i = 0; i < 4000; i++) { const v = 90 + R() * 70 | 0; x.fillStyle = `rgba(${v},${v - 6},${v - 18},0.5)`; x.fillRect(R() * 512, R() * 512, 2, 2); } }, [70, 70]);
    const floor = new THREE.Mesh(g, abM(0xffffff, { map: sand, vertexColors: true, roughness: 1 })); floor.name = 'AB_floor'; S.add(floor); AB.floor = floor;
    const ct = abCaustTex(); ct.repeat.set(40, 40); const cm = new THREE.Mesh(g.clone(), new THREE.MeshBasicMaterial({ map: ct, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    cm.position.y = 0.05; S.add(cm); AB.caust.push(ct); }
  // rocks, kelp, glowing coral
  const R = zRand(12), rockM = abM(0x2a3034, { roughness: 1 }), kelpM = new THREE.MeshStandardMaterial({ color: 0x1d5a3a, roughness: 0.8, side: THREE.DoubleSide, emissive: 0x062418 });
  AB.kelp = [];
  for (let i = 0; i < 140; i++) { const a = R() * Math.PI * 2, d = 34 + R() * 150, x = Math.cos(a) * d, z = Math.sin(a) * d + 14; if (z < -20 && Math.abs(x) < 120) continue;
    const y = abTerrainH(x, z);
    if (i % 3 === 0) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1 + R() * 4, 0), rockM); r.position.set(x, y + 0.5, z); r.rotation.set(R() * 3, R() * 3, 0); r.scale.y = 0.6; S.add(r); }
    else { const h = 6 + R() * 12, k = new THREE.Mesh(new THREE.PlaneGeometry(0.8, h, 1, 8), kelpM); k.geometry.translate(0, h / 2, 0); k.position.set(x, y, z); k.rotation.y = R() * 3; S.add(k); AB.kelp.push({ k, ph: R() * 7, pos: k.geometry.attributes.position.array.slice() }); } }
  const coralCols = [0xff3ea5, 0x29e7ff, 0xb28cff, 0xffb347, 0x7dffb0];
  for (let i = 0; i < 70; i++) { const a = R() * Math.PI * 2, d = 26 + R() * 60, x = Math.cos(a) * d, z = Math.sin(a) * d + 14; if (z < -12) continue; const y = abTerrainH(x, z), c = coralCols[i % 5];
    const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
    for (let k = 0; k < 4; k++) { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 1.2 + R() * 1.4, 5), abM(c, { emissive: c, emissiveIntensity: 0.9 })); br.position.set((R() - 0.5) * 0.8, 0.6, (R() - 0.5) * 0.8); br.rotation.set((R() - 0.5) * 0.9, 0, (R() - 0.5) * 0.9); g.add(br); } }
  // light shafts from far above
  for (let i = 0; i < 9; i++) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(2 + R() * 3, 9 + R() * 6, 120, 16, 1, true), abGlow(0x6af2e0, { opacity: 0.035, side: THREE.DoubleSide, fog: false }));
    sh.position.set(-80 + R() * 160, 60, -60 + R() * 140); sh.rotation.z = (R() - 0.5) * 0.4; S.add(sh); AB.shafts.push({ m: sh, ph: R() * 7 }); }
  // marine snow
  { const N = 1600, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = (R() - 0.5) * 160; pos[i * 3 + 1] = R() * 60 - 10; pos[i * 3 + 2] = (R() - 0.5) * 160; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    AB.snow = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcff6f0, size: 0.12, transparent: true, opacity: 0.6, depthWrite: false })); AB.snow.frustumCulled = false; S.add(AB.snow); }
  { const N = 900, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = (R() - 0.5) * 90; pos[i * 3 + 1] = -8 + R() * 30; pos[i * 3 + 2] = -8 - R() * 60; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    AB.snow2 = new THREE.Points(g, AB.snow.material); AB.snow2.frustumCulled = false; S.add(AB.snow2); }      // the snow you see through the window
  // ---- the bunker: observation gallery (z -6..6), corridor (z 6..16), Dark Room (z 16..34)
  const steel = abM(0x2c3236, { roughness: 0.45, metalness: 0.7 }), hull = abM(0x1c2226, { roughness: 0.55, metalness: 0.6 }), dark = abM(0x050608, { roughness: 0.9 }), grate = abM(0x3a4044, { roughness: 0.5, metalness: 0.8 });
  const box = (w, h, d, x, y, z, m, nm) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); if (nm) b.name = nm; S.add(b); return b; };
  const strip = (w, h, d, x, y, z, c) => box(w, h, d, x, y, z, new THREE.MeshBasicMaterial({ color: c }));
  // gallery
  box(32, 0.4, 13, 0, -0.2, 0, grate, 'AB_gallery_floor'); box(32, 0.4, 13, 0, 6.2, 0, hull);
  box(0.6, 6.4, 13, -16, 3, 0, hull); box(0.6, 6.4, 13, 16, 3, 0, hull);
  box(13.8, 6.4, 0.6, -9.1, 3, 6.3, hull); box(13.8, 6.4, 0.6, 9.1, 3, 6.3, hull); box(4.4, 2.6, 0.6, 0, 5.1, 6.3, hull);
  { const glass = new THREE.Mesh(new THREE.BoxGeometry(31, 5.6, 0.3), new THREE.MeshStandardMaterial({ color: 0x2a6a70, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.9, depthWrite: false }));
    glass.position.set(0, 3, -6.3); glass.name = 'AB_window'; glass.userData.solid = true; S.add(glass);
    for (let x = -15; x <= 15; x += 3.75) box(0.35, 6, 0.6, x, 3, -6.3, steel);
    box(32, 0.6, 0.8, 0, 0.2, -6.3, steel); box(32, 0.6, 0.8, 0, 6, -6.3, steel); strip(31, 0.08, 0.1, 0, 0.55, -5.9, 0x1fd6c4); }
  for (let x = -12; x <= 12; x += 6) { box(3.6, 0.5, 1.2, x, 0.45, 1.5, abM(0x1a1f24)); }
  strip(31, 0.06, 0.06, 0, 6.0, 5.9, 0x1fd6c4); strip(0.06, 0.06, 12, -15.6, 5.95, 0, 0x1fd6c4); strip(0.06, 0.06, 12, 15.6, 5.95, 0, 0x1fd6c4);
  { const s = zSign('LSC DEEP STATION', 'THE ABYSS  ·  DEPTH 1,140 M', '#1fd6c4', 9); s.position.set(0, 5.1, 5.95); s.rotation.y = Math.PI; S.add(s); }
  // corridor with red emergency light and pipes
  box(4.6, 0.4, 10.4, 0, -0.2, 11, grate); box(4.6, 0.4, 10.4, 0, 3.8, 11, hull); box(0.4, 4, 10.4, -2.3, 1.8, 11, hull); box(0.4, 4, 10.4, 2.3, 1.8, 11, hull);
  for (let z = 7; z <= 15; z += 2) { strip(0.06, 0.4, 0.06, -2.05, 3.3, z, 0xff2a2a); strip(0.06, 0.4, 0.06, 2.05, 3.3, z, 0xff2a2a); }
  [-1.8, 1.8].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 10.4, 8), steel); p.rotation.x = Math.PI / 2; p.position.set(x, 3.2, 11); S.add(p); });
  { const L = new THREE.PointLight(0xff2a2a, 0.9, 12); L.position.set(0, 3, 11); S.add(L); AB.lights.push({ L, base: 0.9, flick: true }); }
  // the Dark Room: black walls, dim rim light, all the screens
  box(22.4, 0.4, 18.4, 0, -0.2, 25, dark, 'AB_dark_floor'); box(22.4, 0.4, 18.4, 0, 7.2, 25, dark);
  box(0.6, 7.4, 18.4, -11.2, 3.5, 25, dark); box(0.6, 7.4, 18.4, 11.2, 3.5, 25, dark); box(22.4, 7.4, 0.6, 0, 3.5, 34.2, dark);
  box(8.9, 7.4, 0.6, -6.75, 3.5, 15.8, dark); box(8.9, 7.4, 0.6, 6.75, 3.5, 15.8, dark); box(4.6, 3.6, 0.6, 0, 5.4, 15.8, dark);
  strip(22, 0.05, 0.05, 0, 0.05, 33.8, 0x1fd6c4); strip(0.05, 0.05, 18, -10.85, 0.05, 25, 0xff2a2a); strip(0.05, 0.05, 18, 10.85, 0.05, 25, 0xff2a2a);
  { const g = zScreen('GAMEPLAY', 'SCREEN_GAMEPLAY_ABYSS', 12.8, 7.2, 'abyss', 0x1fd6c4); g.position.set(0, 3.9, 33.4); g.rotation.y = Math.PI; S.add(g);
    const c1 = zScreen('LIVECAM', 'SCREEN_LIVECAM_ABYSS', 5.6, 3.15, 'abyss', 0xff2a2a); c1.position.set(-10.3, 3.6, 28); c1.rotation.y = Math.PI / 2; S.add(c1);
    const c2 = zScreen('CHAT', 'SCREEN_CHAT_ABYSS', 5.6, 3.15, 'abyss', 0xff2a2a); c2.position.set(10.3, 3.6, 28); c2.rotation.y = -Math.PI / 2; S.add(c2);
    const c3 = zScreen('COMMANDS', 'SCREEN_COMMANDS_ABYSS', 4.8, 2.7, 'abyss', 0x1fd6c4); c3.position.set(-10.3, 3.2, 21); c3.rotation.y = Math.PI / 2; S.add(c3);
    const s = zSign('THE DARK ROOM', 'LUCID STATE CITY  ·  LIVE FROM THE DEEP', '#ff2a2a', 8); s.position.set(0, 6.4, 33.85); s.rotation.y = Math.PI; S.add(s);
    for (let r = 0; r < 3; r++) for (let x = -6; x <= 6; x += 3) box(2.2, 0.5, 0.9, x, 0.45, 22 + r * 2.4, abM(0x101216));
    const L = new THREE.SpotLight(0x1fd6c4, 0.9, 30, 0.7, 0.8); L.position.set(0, 7, 20); L.target.position.set(0, 3, 33); S.add(L, L.target);
    const L2 = new THREE.PointLight(0xff2a2a, 0.5, 16); L2.position.set(0, 1, 25); S.add(L2); AB.lights.push({ L: L2, base: 0.5, pulse: true }); }
  // hull exterior: domes, portholes, floodlights, airlock, antenna
  { const dome = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hull); dome.position.set(0, 6.4, 25); dome.scale.set(1.25, 0.5, 1.05); S.add(dome);
    const dome2 = dome.clone(); dome2.position.set(0, 6.4, 0); dome2.scale.set(1.8, 0.35, 0.75); S.add(dome2);
    for (let z = 18; z <= 32; z += 4.5) [-11.55, 11.55].forEach(x => { const p = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16), abGlow(0x1fd6c4, { opacity: 0.7 })); p.position.set(x, 4.5, z); p.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2; S.add(p); });
    [[-17, 6.8, -7], [17, 6.8, -7], [-12, 8, 34], [12, 8, 34]].forEach(([x, y, z]) => { const L = new THREE.SpotLight(0xbff8ff, 1.2, 60, 0.45, 0.6); L.position.set(x, y, z); L.target.position.set(x * 1.6, -10, z < 0 ? -40 : 50); S.add(L, L.target);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(7, 40, 20, 1, true), abGlow(0xbff8ff, { opacity: 0.04, side: THREE.DoubleSide })); cone.geometry.translate(0, -20, 0); cone.position.set(x, y, z); cone.lookAt(x * 1.6, -10, z < 0 ? -40 : 50); cone.rotateX(-Math.PI / 2); S.add(cone);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), abGlow(0xffffff, { opacity: 1 })); lamp.position.set(x, y, z); S.add(lamp); });
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 14, 6), steel); ant.position.set(6, 15, 25); S.add(ant);
    const bea = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), abGlow(0xff2a2a, { opacity: 1 })); bea.position.set(6, 22.2, 25); S.add(bea); AB.beacon = bea;
    const lock = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 6, 18, 1, true), hull); lock.rotation.z = Math.PI / 2; lock.position.set(-19, 2.4, 0); S.add(lock); }
  // vents with bubbles
  for (let i = 0; i < 5; i++) { const x = -64 + i * 32, z = 50 + (i % 2) * 16, y = abTerrainH(x, z); const v = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3, 8), rockM); v.position.set(x, y + 1.2, z); S.add(v);
    const N = 60, pos = new Float32Array(N * 3); for (let k = 0; k < N; k++) { pos[k * 3] = x + (R() - 0.5); pos[k * 3 + 1] = y + 2 + R() * 40; pos[k * 3 + 2] = z + (R() - 0.5); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const b = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe0fffa, size: 0.35, transparent: true, opacity: 0.55, depthWrite: false }));
    b.frustumCulled = false; S.add(b); AB.bubbles.push({ b, x, y, z }); }
  // ---- sea life
  const fishCols = [0x29e7ff, 0xffb347, 0xb28cff, 0x7dffb0, 0xff7aa8];
  for (let s = 0; s < 6; s++) { const grp = new THREE.Group(); S.add(grp); const fish = [];
    for (let i = 0; i < 34; i++) { const f = abFish(fishCols[s % 5], 0.6 + R() * 0.5); f.userData.off = new THREE.Vector3((R() - 0.5) * 7, (R() - 0.5) * 3.5, (R() - 0.5) * 7); f.userData.ph = R() * 7; grp.add(f); fish.push(f); }
    AB.schools.push({ grp, fish, cx: (R() - 0.5) * 60, cz: -18 - R() * 40, r: 16 + R() * 18, y: 2 + R() * 10, sp: (0.12 + R() * 0.1) * (s % 2 ? 1 : -1), a: R() * 7 }); }
  const jc = [0x29e7ff, 0xff3ea5, 0xb28cff, 0x7dffb0];
  for (let i = 0; i < 18; i++) { const j = abJelly(jc[i % 4]); const s = 0.7 + R() * 1.4; j.scale.setScalar(s); j.position.set((R() - 0.5) * 90, -6 + R() * 22, -14 - R() * 50); S.add(j); AB.jellies.push({ j, base: j.position.clone(), ph: R() * 7, sp: 0.4 + R() * 0.4 }); }
  for (let i = 0; i < 3; i++) { const m = abManta(); m.scale.setScalar(1.2 + R() * 0.6); S.add(m); AB.mantas.push({ m, r: 30 + i * 14, y: 10 + i * 5, a: i * 2.1, sp: 0.07 + i * 0.015 }); }
  { const an = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 14, 10), abM(0x1a1210, { roughness: 0.6 })); body.scale.set(1, 0.85, 1.3); an.add(body);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.6), abM(0xdcd2c0)); jaw.position.set(0, -0.3, 1.4); an.add(jaw);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2, 5), abM(0x1a1210)); rod.position.set(0, 1.6, 1); rod.rotation.x = 0.7; an.add(rod);
    const lure = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), abGlow(0x9affea, { opacity: 1 })); lure.position.set(0, 2.4, 1.9); an.add(lure); const L = new THREE.PointLight(0x9affea, 1.2, 10); lure.add(L);
    S.add(an); AB.angler = an; }
  // ---- the monsters
  AB.serpent = abSerpent(); S.add(AB.serpent);
  AB.squid = abSquid(); AB.squid.position.set(34, -52, -70); AB.squid.rotation.x = -0.25; S.add(AB.squid);
  AB.whale = abWhale(); S.add(AB.whale);
}
function abSerpentPath(u, t) {                    // a slow lazy loop through the trench that brushes past the window
  const a = u * Math.PI * 2;
  return new THREE.Vector3(Math.sin(a) * 58 + Math.sin(a * 3) * 6, -10 + Math.sin(a * 2 + 1) * 14 + Math.sin(t * 0.2) * 2, -48 + Math.cos(a) * 26 + Math.cos(a * 2) * 6);
}
function abyssTick(dt, t) {
  const S = AB.scene; if (!AB.floor) return;
  AB.caust.forEach(c => { c.offset.x = Math.sin(t * 0.13) * 0.4 + t * 0.008; c.offset.y = Math.cos(t * 0.11) * 0.4; });
  AB.shafts.forEach(s => { s.m.material.opacity = 0.016 + 0.014 * (0.5 + 0.5 * Math.sin(t * 0.4 + s.ph)); s.m.rotation.z = Math.sin(t * 0.1 + s.ph) * 0.15; });
  { const a = AB.snow.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * 0.25; if (y < -10) y = 50; a.setXYZ(i, a.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.08, y, a.getZ(i)); } a.needsUpdate = true;
    AB.snow.position.set(cam.position.x, 0, cam.position.z);
    const cp = cam.position; AB.snow.visible = !(cp.y > -0.5 && cp.y < 7.6 && Math.abs(cp.x) < 16.4 && cp.z > -6.2 && cp.z < 34.6);
    const b = AB.snow2.geometry.attributes.position; for (let i = 0; i < b.count; i++) { let y = b.getY(i) - dt * 0.25; if (y < -8) y = 22; b.setY(i, y); } b.needsUpdate = true; }
  AB.bubbles.forEach(B => { const a = B.b.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * (2 + (i % 5) * 0.4); if (y > B.y + 44) y = B.y + 2; a.setXYZ(i, B.x + Math.sin(t * 2 + i) * 0.35, y, B.z + Math.cos(t * 1.7 + i) * 0.35); } a.needsUpdate = true; });
  AB.kelp.forEach(K => { const p = K.k.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const y = K.pos[i * 3 + 1]; p.setX(i, K.pos[i * 3] + Math.sin(t * 0.7 + K.ph + y * 0.3) * y * 0.06); } p.needsUpdate = true; });
  AB.schools.forEach(s => { s.a += dt * s.sp; const cx = s.cx + Math.cos(s.a) * s.r, cz = s.cz + Math.sin(s.a) * s.r, y = s.y + Math.sin(t * 0.3 + s.a) * 3;
    s.grp.position.set(cx, y, cz); s.grp.rotation.y = -s.a + (s.sp > 0 ? Math.PI : 0);
    s.fish.forEach((f, i) => { const o = f.userData.off; f.position.set(o.x + Math.sin(t * 0.9 + f.userData.ph) * 0.8, o.y + Math.sin(t * 1.3 + i) * 0.4, o.z + Math.cos(t * 0.8 + f.userData.ph) * 0.8); f.userData.tail.rotation.y = Math.sin(t * 9 + i) * 0.5; }); });
  AB.jellies.forEach(J => { const p = 0.5 + 0.5 * Math.sin(t * J.sp * 3 + J.ph); J.j.userData.bell.scale.set(1 + p * 0.18, 1 - p * 0.25, 1 + p * 0.18);
    J.j.position.set(J.base.x + Math.sin(t * 0.07 + J.ph) * 4, J.base.y + Math.sin(t * J.sp * 0.5 + J.ph) * 4 + p * 0.4, J.base.z + Math.cos(t * 0.06 + J.ph) * 4);
    J.j.userData.tents.forEach((T, k) => { const a = T.ln.geometry.attributes.position; for (let i = 1; i < a.count; i++) a.setX(i, Math.cos(T.a) * 0.7 + Math.sin(t * 1.2 + i * 0.6 + k) * i * 0.05); a.needsUpdate = true; }); });
  AB.mantas.forEach(M => { M.a += dt * M.sp; const x = Math.cos(M.a) * M.r, z = -30 + Math.sin(M.a) * M.r * 0.7, y = M.y + Math.sin(t * 0.5 + M.a) * 3;
    M.m.position.set(x, y, z); M.m.rotation.y = Math.atan2(-Math.sin(M.a) * M.r, Math.cos(M.a) * M.r * 0.7) + Math.PI / 2; const f = Math.sin(t * 1.6 + M.a) * 0.45;
    M.m.userData.wl.rotation.z = f; M.m.userData.wr.rotation.z = -f; });
  if (AB.angler) { AB.angler.position.set(-7 + Math.sin(t * 0.25) * 5, 2.6 + Math.sin(t * 0.6) * 0.6, -10.5 + Math.cos(t * 0.2) * 1.5); AB.angler.rotation.y = Math.cos(t * 0.25) > 0 ? Math.PI / 2 : -Math.PI / 2; }
  // leviathan: head follows the path, the body trails behind it
  { const sp = AB.serpent.userData, u = (t * 0.006) % 1, head = abSerpentPath(u, t); sp.trail.unshift(head); if (sp.trail.length > 400) sp.trail.length = 400;
    sp.segs.forEach((s, i) => { const k = Math.min(sp.trail.length - 1, i * 5), p = sp.trail[k], q = sp.trail[Math.min(sp.trail.length - 1, k + 3)];
      s.m.position.copy(p); if (p.distanceToSquared(q) > 1e-4) s.m.lookAt(q); s.m.rotateY(Math.PI); s.m.position.y += Math.sin(t * 2 - i * 0.35) * 0.25; }); }
  // giant squid: arms curl and reach
  AB.squid.userData.arms.forEach(A => A.chain.forEach((s, k) => { s.rotation.x = (k ? 0.22 : s.rotation.x) + (k ? Math.sin(t * 0.8 + A.ph + k * 0.5) * 0.18 : 0); s.rotation.z = k ? Math.cos(t * 0.6 + A.ph + k * 0.4) * 0.16 : s.rotation.z; }));
  AB.squid.position.y = -52 + Math.sin(t * 0.15) * 5; AB.squid.rotation.y = Math.sin(t * 0.05) * 0.6;
  AB.eyes.forEach((e, i) => { e.material.opacity = Math.sin(t * 0.37 + i) > 0.97 ? 0.1 : 1; });   // they blink
  // a whale drifts past in the fog every couple of minutes
  { const k = ((t * 0.006) % 1), x = -220 + k * 440; AB.whale.position.set(x, 30 + Math.sin(t * 0.1) * 4, -78); AB.whale.rotation.y = Math.PI / 2; AB.whale.userData.tail.rotation.x = Math.sin(t * 0.6) * 0.25; }
  if (AB.beacon) AB.beacon.material.opacity = Math.sin(t * 3) > 0.4 ? 1 : 0.1;
  AB.lights.forEach(l => { if (l.flick) l.L.intensity = l.base * (Math.random() < 0.02 ? 0.2 : 1); if (l.pulse) l.L.intensity = l.base * (0.6 + 0.4 * Math.sin(t * 1.3)); });
  // viewers who typed !spawn show up as divers in glowing suits
  if ((AB.syncT = (AB.syncT || 0) - dt) <= 0) { AB.syncT = 3; const live = new Set(spawned.map(w => w.user));
    Object.keys(AB.viewers).forEach(u => { if (!live.has(u)) { S.remove(AB.viewers[u].o); delete AB.viewers[u]; } });
    spawned.forEach(w => { if (AB.viewers[w.user]) return; const col = w.o.userData.col || '#1fd6c4';
      const p = smPerson(new THREE.Color(col).getHex(), w.user); const helm = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), abGlow(0x9affea, { opacity: 0.35 })); helm.position.y = 1.7; p.add(helm);
      const a = Math.random() * 7; S.add(p); AB.viewers[w.user] = { o: p, a, r: 6 + Math.random() * 6, sp: 0.05 + Math.random() * 0.05 }; }); }
  Object.values(AB.viewers).forEach((v, i) => { v.a += dt * v.sp; v.o.position.set(Math.cos(v.a) * v.r, 0, 2 + Math.sin(v.a) * 2.5); v.o.rotation.y = -v.a + Math.PI; NPC.pose(v.o, 'walk', t, 0, v.a * v.r * 2.7); });
}
// ---------------------------------------------------------------- OPERATOR VAULT (Zone Zero): epic emblems, calling cards, dog tags, medals, weapon camos and prestige badges given to players, shown in the world + as an on-stream unlock
const vtRarCol = (r, t) => r === 'mythic' ? `hsl(${(352 + Math.sin((t || 0) * 2.2) * 22 + 360) % 360},100%,${58 + Math.sin((t || 0) * 5) * 6}%)` : (VD.rar[r] || VD.rar.epic)[1];
function vtPath(x, pts) { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); }
function vtRifle(x) { x.beginPath(); x.moveTo(-92, -6); x.lineTo(-60, -14); x.lineTo(-56, -6); x.lineTo(-30, -8); x.lineTo(-28, -16); x.lineTo(20, -16); x.lineTo(24, -10); x.lineTo(70, -10); x.lineTo(70, -6); x.lineTo(96, -6); x.lineTo(96, -2); x.lineTo(70, -2);
  x.lineTo(70, 2); x.lineTo(24, 2); x.lineTo(14, 4); x.lineTo(8, 30); x.lineTo(-4, 28); x.lineTo(0, 4); x.lineTo(-16, 4); x.lineTo(-22, 20); x.lineTo(-32, 18); x.lineTo(-30, 4); x.lineTo(-58, 6); x.lineTo(-94, 14); x.closePath(); }
function vtMetal(x, style, y0, y1) { const g = x.createLinearGradient(0, y0, 0, y1), M = { gold: ['#fff3b0', '#e0a820', '#8a5a08'], steel: ['#ffffff', '#a8b0bc', '#4a525e'], blackout: ['#4a4a52', '#1a1a1e', '#050506'], neon: ['#3a1040', '#1a0820', '#0a0410'], bronze: ['#ffd2a8', '#c07a3a', '#5a3010'] }[style] || ['#ffffff', '#a8b0bc', '#4a525e'];
  g.addColorStop(0, M[0]); g.addColorStop(0.5, M[1]); g.addColorStop(1, M[2]); return g; }
// draw one item centered at 0,0 inside a 200x200 box
function vtDraw(x, it, t, seed) {
  const rc = vtRarCol(it.rarity, t), L = '#f2ece0', D = '#14110e', st = it.style;
  x.save(); x.lineJoin = 'round'; x.lineCap = 'round';
  if (it.type === 'emblem') {
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + seed);
    x.save(); x.shadowColor = rc; x.shadowBlur = 24 + pulse * 18; vtPath(x, [[0, -94], [80, -56], [80, 30], [0, 94], [-80, 30], [-80, -56]]); const bg = x.createLinearGradient(0, -94, 0, 94); bg.addColorStop(0, '#2a2620'); bg.addColorStop(1, '#0c0a08'); x.fillStyle = bg; x.fill(); x.restore();
    x.lineWidth = 6; x.strokeStyle = rc; vtPath(x, [[0, -94], [80, -56], [80, 30], [0, 94], [-80, 30], [-80, -56]]); x.stroke(); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,0.25)'; vtPath(x, [[0, -82], [68, -50], [68, 26], [0, 80], [-68, 26], [-68, -50]]); x.stroke();
    x.fillStyle = L; x.strokeStyle = D; x.lineWidth = 3; const eye = () => { x.save(); x.shadowColor = rc; x.shadowBlur = 16; x.fillStyle = rc; };
    if (st === 'skull') { x.beginPath(); x.arc(0, -14, 44, Math.PI * 0.85, Math.PI * 0.15); x.lineTo(30, 22); x.lineTo(-30, 22); x.closePath(); x.fill(); x.fillRect(-26, 18, 52, 26); x.beginPath(); x.ellipse(0, 44, 26, 8, 0, 0, Math.PI); x.fill();
      x.fillStyle = D; [-18, 18].forEach(ex => { x.beginPath(); x.ellipse(ex, -10, 13, 15, ex > 0 ? -0.2 : 0.2, 0, 7); x.fill(); }); vtPath(x, [[0, 4], [-7, 18], [7, 18]]); x.fill(); for (let i = -18; i <= 18; i += 9) x.fillRect(i - 1, 26, 2.5, 18);
      eye(); [-18, 18].forEach(ex => { x.beginPath(); x.arc(ex, -9, 4 + pulse * 2, 0, 7); x.fill(); }); x.restore(); }
    else if (st === 'wolf') { vtPath(x, [[-46, -60], [-28, -22], [-52, 6], [-26, 30], [0, 64], [26, 30], [52, 6], [28, -22], [46, -60], [14, -32], [0, -36], [-14, -32]]); x.fill(); x.stroke();
      x.fillStyle = '#9a948a'; vtPath(x, [[-14, 6], [0, 56], [14, 6], [0, 18]]); x.fill(); x.fillStyle = D; x.beginPath(); x.ellipse(0, 50, 9, 6, 0, 0, 7); x.fill();
      eye(); [-1, 1].forEach(s => { vtPath(x, [[s * 10, -6], [s * 30, -14], [s * 26, -2]]); x.fill(); }); x.restore(); }
    else if (st === 'eagle') { const wing = s => { vtPath(x, [[0, -6], [s * 30, -26], [s * 78, -48], [s * 70, -30], [s * 84, -22], [s * 66, -8], [s * 78, 0], [s * 56, 10], [s * 64, 18], [s * 34, 18], [0, 30]]); x.fill(); x.stroke(); }; wing(-1); wing(1);
      x.beginPath(); x.ellipse(0, 10, 16, 34, 0, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.arc(0, -30, 16, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#ffb02e'; vtPath(x, [[10, -32], [26, -26], [10, -22]]); x.fill(); eye(); x.beginPath(); x.arc(5, -34, 4, 0, 7); x.fill(); x.restore(); }
    else if (st === 'reaper') { x.lineWidth = 7; x.strokeStyle = L; x.beginPath(); x.moveTo(50, -62); x.lineTo(30, 66); x.stroke(); x.beginPath(); x.moveTo(52, -62); x.quadraticCurveTo(0, -84, -40, -44); x.quadraticCurveTo(-4, -66, 46, -50); x.closePath(); x.fill();
      x.fillStyle = '#3a3630'; x.beginPath(); x.moveTo(0, -64); x.bezierCurveTo(-46, -60, -44, 20, -48, 64); x.lineTo(40, 64); x.bezierCurveTo(40, 20, 44, -60, 0, -64); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.4)'; x.lineWidth = 2; x.stroke();
      x.fillStyle = '#050505'; x.beginPath(); x.ellipse(0, -22, 20, 26, 0, 0, 7); x.fill(); eye(); [-8, 8].forEach(ex => { x.beginPath(); x.arc(ex, -24, 3.5 + pulse * 1.5, 0, 7); x.fill(); }); x.restore(); }
    else if (st === 'rifles') { [-0.7, 0.7].forEach(a => { x.save(); x.rotate(a); x.scale(0.72, 0.72); vtRifle(x); x.fill(); x.stroke(); x.restore(); });
      eye(); x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 22; x.lineTo(Math.cos(a) * r, -40 + Math.sin(a) * r); } x.closePath(); x.fill(); x.restore();
      x.font = '900 18px Anton, Impact, sans-serif'; x.textAlign = 'center'; x.fillStyle = L; x.fillText('ZONE ZERO', 0, 62); }
    else if (st === 'crown') { x.fillStyle = vtMetal(x, 'gold', -50, 40); vtPath(x, [[-56, 32], [-60, -38], [-30, -6], [0, -58], [30, -6], [60, -38], [56, 32]]); x.fill(); x.stroke(); x.fillRect(-58, 32, 116, 16); x.strokeRect(-58, 32, 116, 16);
      ['#ff2a4a', rc, '#3ff5ff'].forEach((c, i) => { x.save(); x.shadowColor = c; x.shadowBlur = 12; x.fillStyle = c; x.beginPath(); x.arc(-30 + i * 30, 14, 9, 0, 7); x.fill(); x.restore(); }); }
    else if (st === 'phoenix') { const fl = x.createLinearGradient(0, 60, 0, -70); fl.addColorStop(0, '#ff3a10'); fl.addColorStop(0.5, '#ffa020'); fl.addColorStop(1, '#fff3b0'); x.fillStyle = fl;
      [-1, 1].forEach(s => { x.beginPath(); x.moveTo(0, 10); x.bezierCurveTo(s * 40, 0, s * 70, -40, s * 80, -70 + Math.sin(t * 3 + s) * 6); x.bezierCurveTo(s * 62, -40, s * 50, -30, s * 30, -26); x.bezierCurveTo(s * 50, -10, s * 56, 10, s * 60, 26); x.bezierCurveTo(s * 40, 20, s * 20, 20, 0, 30); x.fill(); });
      x.beginPath(); x.moveTo(0, -48); x.bezierCurveTo(16, -30, 14, 30, 0, 70); x.bezierCurveTo(-14, 30, -16, -30, 0, -48); x.fill(); eye(); x.beginPath(); x.arc(3, -38, 3.5, 0, 7); x.fill(); x.restore(); }
    else { x.beginPath(); x.moveTo(0, -60); x.bezierCurveTo(30, -30, 62, -10, 50, 18); x.bezierCurveTo(42, 38, 14, 36, 6, 22); x.lineTo(16, 56); x.lineTo(-16, 56); x.lineTo(-6, 22); x.bezierCurveTo(-14, 36, -42, 38, -50, 18); x.bezierCurveTo(-62, -10, -30, -30, 0, -60); x.fill();
      x.font = '900 30px Anton, Impact, sans-serif'; x.textAlign = 'center'; eye(); x.fillText('A', -48, -50); x.fillText('A', 48, 72); x.restore(); }
  } else if (it.type === 'card') {
    x.save(); crr(x, -98, -40, 196, 80, 8); x.clip();
    const R = zRand(seed * 97 + 1);
    if (st === 'inferno') { const g = x.createLinearGradient(0, 40, 0, -40); g.addColorStop(0, '#ff5a10'); g.addColorStop(0.5, '#a01a08'); g.addColorStop(1, '#1a0404'); x.fillStyle = g; x.fillRect(-98, -40, 196, 80);
      for (let i = 0; i < 26; i++) { const fx = -98 + (i * 8.3 + Math.sin(t * 3 + i) * 3), fh = 20 + Math.abs(Math.sin(t * 4 + i * 1.7)) * 40; x.fillStyle = `rgba(255,${120 + (i % 3) * 50},30,0.55)`; x.beginPath(); x.moveTo(fx - 7, 40); x.quadraticCurveTo(fx, 40 - fh * 1.3, fx + 7, 40); x.fill(); } }
    else if (st === 'storm') { x.fillStyle = '#0c1020'; x.fillRect(-98, -40, 196, 80); for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(80,90,120,0.35)'; x.beginPath(); x.ellipse(-80 + i * 34 + Math.sin(t * 0.5 + i) * 6, -30, 30, 12, 0, 0, 7); x.fill(); }
      if ((t * 1.3 + seed) % 2.2 < 0.25) { x.strokeStyle = '#d8e8ff'; x.shadowColor = '#9ac8ff'; x.shadowBlur = 16; x.lineWidth = 3; x.beginPath(); let bx = -20 + R() * 40, by = -40; x.moveTo(bx, by); while (by < 40) { bx += (R() - 0.5) * 30; by += 10 + R() * 8; x.lineTo(bx, by); } x.stroke(); x.fillStyle = 'rgba(200,220,255,0.15)'; x.fillRect(-98, -40, 196, 80); } }
    else if (st === 'neon') { const g = x.createLinearGradient(0, -40, 0, 40); g.addColorStop(0, '#12002a'); g.addColorStop(0.5, '#5a0a6a'); g.addColorStop(0.52, '#ff3ad0'); g.addColorStop(1, '#0a0016'); x.fillStyle = g; x.fillRect(-98, -40, 196, 80);
      x.fillStyle = '#ffb02e'; x.beginPath(); x.arc(0, 2, 22, Math.PI, 0); x.fill(); x.strokeStyle = 'rgba(56,232,255,0.8)'; x.lineWidth = 1.5; for (let i = -10; i <= 10; i++) { x.beginPath(); x.moveTo(i * 4, 2); x.lineTo(i * 26, 40); x.stroke(); } for (let k = 0; k < 6; k++) { const y = 2 + Math.pow(((k + t * 0.8) % 6) / 6, 2) * 38; x.beginPath(); x.moveTo(-98, y); x.lineTo(98, y); x.stroke(); } }
    else if (st === 'jungle') { x.fillStyle = '#3a4a26'; x.fillRect(-98, -40, 196, 80); for (let i = 0; i < 40; i++) { x.fillStyle = ['#2a3418', '#5a6a32', '#1c2410', '#6a5a36'][i % 4]; x.beginPath(); x.ellipse(-98 + R() * 196, -40 + R() * 80, 8 + R() * 18, 5 + R() * 10, R() * 3, 0, 7); x.fill(); } }
    else if (st === 'nightops') { x.fillStyle = '#051a08'; x.fillRect(-98, -40, 196, 80); x.fillStyle = 'rgba(80,255,120,0.18)'; for (let y = -40; y < 40; y += 3) x.fillRect(-98, y, 196, 1);
      x.fillStyle = '#0a3a12'; [-60, -20, 30, 70].forEach((px, i) => { x.beginPath(); x.arc(px, 10 - i % 2 * 4, 7, 0, 7); x.fill(); x.fillRect(px - 8, 16 - i % 2 * 4, 16, 24); }); x.strokeStyle = 'rgba(120,255,140,0.6)'; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 26 + Math.sin(t * 3) * 2, 0, 7); x.moveTo(-36, 0); x.lineTo(36, 0); x.moveTo(0, -36); x.lineTo(0, 36); x.stroke(); }
    else { const g = x.createLinearGradient(-98, -40, 98, 40); g.addColorStop(0, '#5a3a08'); g.addColorStop(0.5, '#ffd040'); g.addColorStop(1, '#6a4408'); x.fillStyle = g; x.fillRect(-98, -40, 196, 80);
      for (let i = 0; i < 14; i++) { const ph = (t * 0.7 + i * 0.37) % 1, a = Math.sin(ph * Math.PI); x.fillStyle = `rgba(255,255,255,${a})`; const sx = -90 + R() * 180, sy = -34 + R() * 68, r = 1 + a * 4; x.beginPath(); x.moveTo(sx, sy - r * 2); x.lineTo(sx + r * 0.5, sy); x.lineTo(sx, sy + r * 2); x.lineTo(sx - r * 0.5, sy); x.fill(); } }
    const sw = -98 + ((t * 70 + seed * 40) % 400) - 100, rf = x.createLinearGradient(sw, -40, sw + 60, 40); rf.addColorStop(0, 'rgba(255,255,255,0)'); rf.addColorStop(0.5, 'rgba(255,255,255,0.22)'); rf.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rf; x.fillRect(-98, -40, 196, 80);
    x.restore(); x.lineWidth = 4; x.strokeStyle = rc; crr(x, -98, -40, 196, 80, 8); x.stroke();
    x.textAlign = 'center'; x.font = '400 26px Anton, Impact, sans-serif'; x.shadowColor = '#000'; x.shadowBlur = 8; x.fillStyle = '#fff'; x.fillText(String(it.title || it.name || '').toUpperCase().slice(0, 18), 0, 30); x.shadowBlur = 0;
  } else if (it.type === 'tags') {
    x.strokeStyle = '#b8bcc4'; x.lineWidth = 2.5; x.setLineDash([3, 3]); x.beginPath(); x.moveTo(-28, -60); x.quadraticCurveTo(0, -110, 30, -58); x.stroke(); x.setLineDash([]);
    [[-14, -6, -0.18, 1], [16, 6, 0.14, 0]].forEach(([dx, dy, rot, front]) => { x.save(); x.translate(dx, dy + Math.sin(t * 1.6 + front) * 3); x.rotate(rot + Math.sin(t * 1.2 + front * 2) * 0.04);
      x.fillStyle = vtMetal(x, st, -60, 60); crr(x, -36, -58, 72, 116, 16); x.fill(); x.lineWidth = 3; x.strokeStyle = st === 'neon' ? rc : '#3a3e46'; if (st === 'neon') { x.shadowColor = rc; x.shadowBlur = 16; } x.stroke(); x.shadowBlur = 0;
      x.fillStyle = '#1a1a1e'; x.beginPath(); x.arc(0, -46, 5, 0, 7); x.fill();
      if (front) { x.fillStyle = st === 'blackout' || st === 'neon' ? rc : '#2a2a30'; x.textAlign = 'center'; x.font = '700 13px "Courier New", monospace'; const nm = String(it.name || '').toUpperCase(); x.fillText(nm.slice(0, 9), 0, -18); x.fillText(nm.slice(9, 18), 0, -4); x.fillText('ZONE 00', 0, 14); x.fillText((VD.rar[it.rarity] || VD.rar.epic)[0].toUpperCase(), 0, 32); }
      x.restore(); });
  } else if (it.type === 'medal') {
    x.save(); vtPath(x, [[-30, -96], [30, -96], [22, -26], [-22, -26]]); x.clip(); const bands = [rc, '#f2ece0', '#14110e', '#f2ece0', rc]; bands.forEach((c, i) => { x.fillStyle = c; x.fillRect(-30 + i * 12, -96, 12, 70); }); x.restore();
    x.translate(0, 26); const spin = Math.cos(t * 1.4 + seed); x.scale(0.6 + 0.4 * Math.abs(spin), 1); const gm = x.createLinearGradient(-50, 0, 50, 0); gm.addColorStop(0, '#6a4a08'); gm.addColorStop((spin + 1) / 2 * 0.8 + 0.1, '#fff3b0'); gm.addColorStop(1, '#8a5a08'); x.fillStyle = gm; x.strokeStyle = '#4a3004'; x.lineWidth = 3;
    if (st === 'valor') { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 24 : 56; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); x.fillStyle = rc; x.beginPath(); x.arc(0, 0, 14, 0, 7); x.fill(); }
    else if (st === 'laurel') { x.beginPath(); x.arc(0, 0, 40, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#5a7a2a'; for (let i = 0; i < 14; i++) { const a = Math.PI * 0.6 + (i % 7) / 7 * Math.PI * 0.8 * (i < 7 ? 1 : -1) + (i < 7 ? 0 : Math.PI * 0.8); x.save(); x.rotate(i < 7 ? Math.PI * 0.55 + i * 0.32 : Math.PI * 0.45 - (i - 7) * 0.32); x.beginPath(); x.ellipse(50, 0, 10, 4, 0.6, 0, 7); x.fill(); x.restore(); }
      x.fillStyle = rc; x.font = '400 34px Anton, Impact, sans-serif'; x.textAlign = 'center'; x.fillText('1', 0, 12); }
    else if (st === 'sunburst') { x.beginPath(); for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, r = i % 2 ? 34 : 58; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); x.fillStyle = rc; x.beginPath(); x.arc(0, 0, 22, 0, 7); x.fill(); x.fillStyle = '#fff3b0'; x.beginPath(); x.arc(0, 0, 10, 0, 7); x.fill(); }
    else { x.beginPath(); x.arc(0, 0, 34, 0, 7); x.fill(); x.stroke(); [-1, 1].forEach(s => { x.beginPath(); x.moveTo(s * 30, -6); x.quadraticCurveTo(s * 70, -40, s * 92, -30); x.quadraticCurveTo(s * 74, -18, s * 84, -8); x.quadraticCurveTo(s * 64, -2, s * 72, 8); x.quadraticCurveTo(s * 50, 10, s * 30, 10); x.fill(); x.stroke(); });
      x.fillStyle = rc; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 8 : 20; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); }
  } else if (it.type === 'camo') {
    x.save(); x.scale(0.98, 1.3); vtRifle(x); x.save(); x.clip(); const R = zRand(seed * 13 + 5);
    if (st === 'gold') { const g = x.createLinearGradient(-90, -20, 90, 30); g.addColorStop(0, '#6a4408'); g.addColorStop(0.3, '#ffd040'); g.addColorStop(0.6, '#fff3b0'); g.addColorStop(1, '#8a5a08'); x.fillStyle = g; x.fillRect(-100, -30, 200, 64); }
    else if (st === 'diamond') { for (let i = 0; i < 60; i++) { x.fillStyle = ['#e8fbff', '#9ae8ff', '#ffffff', '#6ac8ff', '#c8f0ff'][i % 5]; const px = -100 + (i % 15) * 14, py = -30 + Math.floor(i / 15) * 16; vtPath(x, [[px, py], [px + 14, py + (i % 2 ? 16 : 0)], [px, py + 16]]); x.fill(); vtPath(x, [[px + 14, py], [px + 14, py + 16], [px, py + (i % 2 ? 0 : 16)]]); x.fillStyle = '#bfefff'; x.fill(); } }
    else if (st === 'plasma') { for (let k = 0; k < 6; k++) { const g = x.createLinearGradient(-100, 0, 100, 0); g.addColorStop(0, '#2a0a6a'); g.addColorStop((Math.sin(t * 1.5 + k) * 0.5 + 0.5) * 0.8 + 0.1, k % 2 ? '#38e8ff' : '#ff3ad0'); g.addColorStop(1, '#2a0a6a'); x.fillStyle = g; x.fillRect(-100, -30 + k * 11, 200, 11); }
      x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 1.5; x.beginPath(); for (let i = -100; i < 100; i += 4) x.lineTo(i, Math.sin(i * 0.08 + t * 4) * 10); x.stroke(); }
    else if (st === 'dragon') { x.fillStyle = '#5a0808'; x.fillRect(-100, -30, 200, 64); for (let j = 0; j < 7; j++) for (let i = 0; i < 22; i++) { x.strokeStyle = j % 2 ? '#ff5a2a' : '#c81a10'; x.lineWidth = 2; x.beginPath(); x.arc(-100 + i * 10 + (j % 2) * 5, -30 + j * 9, 6, 0, Math.PI); x.stroke(); } }
    else if (st === 'arctic') { x.fillStyle = '#e8ecf0'; x.fillRect(-100, -30, 200, 64); for (let i = 0; i < 40; i++) { x.fillStyle = ['#a8b0bc', '#ffffff', '#7a8490'][i % 3]; x.beginPath(); x.ellipse(-100 + R() * 200, -30 + R() * 64, 6 + R() * 12, 3 + R() * 7, R() * 3, 0, 7); x.fill(); } }
    else { for (let j = 0; j < 16; j++) for (let i = 0; i < 50; i++) { x.fillStyle = ['#3a4a2a', '#5a6a3a', '#22281a', '#7a7a5a'][(R() * 4) | 0]; x.fillRect(-100 + i * 4, -30 + j * 4, 4, 4); } }
    const sw = -140 + ((t * 90 + seed * 50) % 300), rf = x.createLinearGradient(sw, -30, sw + 50, 30); rf.addColorStop(0, 'rgba(255,255,255,0)'); rf.addColorStop(0.5, 'rgba(255,255,255,0.45)'); rf.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rf; x.fillRect(-100, -30, 200, 64); x.restore();
    x.lineWidth = 2.5; x.strokeStyle = rc; x.shadowColor = rc; x.shadowBlur = 12; vtRifle(x); x.stroke(); x.restore();
  } else {
    const lv = { p1: 1, p2: 2, p3: 3, p5: 5, p10: 10, master: 0 }[st] ?? 1;
    x.save(); x.shadowColor = rc; x.shadowBlur = 22; x.fillStyle = vtMetal(x, lv >= 10 || !lv ? 'gold' : lv >= 3 ? 'steel' : 'bronze', -80, 80); x.beginPath(); x.moveTo(0, -84); x.lineTo(66, -56); x.lineTo(60, 20); x.quadraticCurveTo(40, 66, 0, 86); x.quadraticCurveTo(-40, 66, -60, 20); x.lineTo(-66, -56); x.closePath(); x.fill(); x.restore();
    x.lineWidth = 4; x.strokeStyle = rc; x.stroke(); x.fillStyle = '#1a1610'; x.beginPath(); x.moveTo(0, -68); x.lineTo(52, -46); x.lineTo(48, 16); x.quadraticCurveTo(32, 54, 0, 70); x.quadraticCurveTo(-32, 54, -48, 16); x.lineTo(-52, -46); x.closePath(); x.fill();
    if (lv) { x.strokeStyle = rc; x.lineWidth = 9; for (let i = 0; i < Math.min(3, lv); i++) { x.beginPath(); x.moveTo(-34, 2 + i * 18); x.lineTo(0, -18 + i * 18); x.lineTo(34, 2 + i * 18); x.stroke(); }
      x.fillStyle = '#ffd040'; const n = lv >= 10 ? 3 : lv >= 5 ? 2 : 1; for (let k = 0; k < n; k++) { x.save(); x.translate((k - (n - 1) / 2) * 22, -44); x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 10; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.restore(); }
      x.fillStyle = '#fff'; x.font = '400 26px Anton, Impact, sans-serif'; x.textAlign = 'center'; x.fillText('P' + lv, 0, 62); }
    else { x.fillStyle = rc; x.save(); x.shadowColor = rc; x.shadowBlur = 14; [-1, 1].forEach(s => { x.beginPath(); x.moveTo(s * 10, -10); x.quadraticCurveTo(s * 50, -40, s * 60, -20); x.quadraticCurveTo(s * 44, -10, s * 52, 4); x.quadraticCurveTo(s * 30, 4, s * 12, 10); x.fill(); }); x.restore();
      x.fillStyle = L; x.beginPath(); x.arc(0, -10, 16, 0, 7); x.fill(); x.fillRect(-10, 2, 20, 12); x.fillStyle = D; [-6, 6].forEach(ex => { x.beginPath(); x.arc(ex, -11, 4.5, 0, 7); x.fill(); }); x.fillStyle = '#ffd040'; x.font = '400 20px Anton, Impact, sans-serif'; x.textAlign = 'center'; x.fillText('MASTER', 0, 50); }
  }
  x.restore();
}
// ---- the 3D vault wall
function buildVault() {
  const S = ZZ.scene, W = 10.4, H = 5.85, c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
  const g = new THREE.Group(); g.position.set(-21, 4.4, 9); g.rotation.y = Math.PI / 2; S.add(g);
  const steel = zzM(0x2a2c2e, { metalness: 0.7, roughness: 0.4 }); const box = new THREE.Mesh(new THREE.BoxGeometry(W + 1.4, H + 1.4, 1), steel); box.position.z = -0.55; g.add(box);
  const fr = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffb02e, emissiveIntensity: 1.4 }); [[0, H / 2 + 0.35, W + 0.9, 0.12], [0, -H / 2 - 0.35, W + 0.9, 0.12], [-W / 2 - 0.4, 0, 0.12, H + 0.8], [W / 2 + 0.4, 0, 0.12, H + 0.8]].forEach(([x, y, w, h]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), fr); b.position.set(x, y, 0); g.add(b); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.name = 'SCREEN_VAULT_ZERO'; m.userData.zone = 'zero'; m.position.z = 0.02; g.add(m);
  const sign = zSign('OPERATOR VAULT', 'EPIC ITEMS EARNED ON STREAM', '#ffb02e', 8.4); sign.position.set(0, H / 2 + 1.75, 0.1); g.add(sign);
  [-1, 1].forEach(s => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.4, 0.5), steel); leg.position.set(s * (W / 2 + 0.2), -H / 2 - 2.2 + 0.3, -0.6); g.add(leg);
    const rack = new THREE.Group(); rack.position.set(s * (W / 2 + 1.6), -2.4, 0.4); g.add(rack); const rb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 0.3), steel); rb.position.y = -0.4; rack.add(rb);
    for (let k = 0; k < 3; k++) { const gun = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.9, 0.12), zzM(0x141416)); gun.position.set(-0.45 + k * 0.45, -0.3, 0.2); gun.rotation.z = 0.05; rack.add(gun); } });
  const L = new THREE.SpotLight(0xffe0b0, 1.6, 22, 0.6, 0.6); L.position.set(-14, 11, 9); L.target.position.set(-21, 4.4, 9); S.add(L, L.target);
  extraScreens.push(m); VT.mesh = m; VT.c = c; VT.x = c.getContext('2d'); VT.tex = tex; drawVault(0);
}
function drawVault(t) {
  const x = VT.x, w = 1600, h = 900; if (!x) return; x.setTransform(VT.c.width / 1600, 0, 0, VT.c.height / 900, 0, 0);
  const bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1a1812'); bg.addColorStop(1, '#080806'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,176,46,0.06)'; x.lineWidth = 1; for (let i = 0; i < w; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j < h; j += 40) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
  x.textAlign = 'center'; x.font = '400 56px Anton, Impact, sans-serif'; x.fillStyle = '#ffb02e'; x.shadowColor = '#ff7a1a'; x.shadowBlur = 18; x.fillText('ZONE ZERO  ·  OPERATOR VAULT', w / 2, 68); x.shadowBlur = 0;
  if (!vaultItems.length) { x.font = '700 34px Poppins, sans-serif'; x.fillStyle = '#e8dcc8'; x.fillText('The vault is empty. Give the first item from the Vault tab.', w / 2, h / 2); VT.tex.needsUpdate = true; return; }
  const per = 8, pages = Math.ceil(vaultItems.length / per), page = Math.floor(t / 10) % pages, list = vaultItems.slice(page * per, page * per + per), cols = 4, top = 96, cw = (w - 60) / cols, chh = (h - top - 30) / 2;
  list.forEach((it, i) => { const X = 30 + (i % cols) * cw + 10, Y = top + Math.floor(i / cols) * chh, bw = cw - 20, bh = chh - 16, rc = vtRarCol(it.rarity, t), seed = page * per + i;
    const cg = x.createLinearGradient(0, Y, 0, Y + bh); cg.addColorStop(0, '#24201a'); cg.addColorStop(1, '#0e0c0a'); x.fillStyle = cg; crr(x, X, Y, bw, bh, 12); x.fill();
    const glow = x.createRadialGradient(X + bw / 2, Y + bh * 0.42, 8, X + bw / 2, Y + bh * 0.42, bw * 0.6); glow.addColorStop(0, rc.startsWith('#') ? rc + '55' : 'rgba(255,40,70,0.35)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = glow; x.fillRect(X, Y, bw, bh);
    x.fillStyle = rc; crr(x, X, Y, bw, 30, 12); x.fill(); x.fillRect(X, Y + 16, bw, 14); x.fillStyle = '#0c0a08'; x.font = '400 22px Anton, Impact, sans-serif'; x.fillText(((VD.rar[it.rarity] || VD.rar.epic)[0] + '  ·  ' + ((VD.types[it.type] || {}).n || it.type)).toUpperCase(), X + bw / 2, Y + 23);
    x.save(); x.translate(X + bw / 2, Y + 30 + (bh - 120) * 0.46 + Math.sin(t * 1.6 + i) * 3); const sc = Math.min((bw - 30) / 200, (bh - 130) / 200); x.scale(sc, sc); vtDraw(x, it, t, seed); x.restore();
    x.fillStyle = '#fff'; let fs = 32; x.font = '700 ' + fs + 'px Poppins, sans-serif'; while (x.measureText(it.name).width > bw - 20 && fs > 14) { fs--; x.font = '700 ' + fs + 'px Poppins, sans-serif'; } x.fillText(it.name, X + bw / 2, Y + bh - 52);
    x.fillStyle = rc; x.font = '400 24px Anton, Impact, sans-serif'; x.fillText(String(it.title || ((VD.types[it.type] || {}).s || {})[it.style] || '').toUpperCase(), X + bw / 2, Y + bh - 20, bw - 20);
    x.lineWidth = 3; x.strokeStyle = rc; crr(x, X, Y, bw, bh, 12); x.stroke();
    if (it.added && Date.now() - it.added < 120000) { x.fillStyle = Math.floor(t * 3) % 2 ? '#ff2a4a' : '#ffe066'; crr(x, X + bw - 74, Y + 38, 64, 26, 6); x.fill(); x.fillStyle = '#000'; x.font = '400 20px Anton, Impact, sans-serif'; x.fillText('NEW', X + bw - 42, Y + 58); } });
  if (pages > 1) { x.fillStyle = '#e8dcc8'; x.font = '500 22px Poppins, sans-serif'; x.fillText((page + 1) + ' / ' + pages, w - 50, h - 8); }
  VT.tex.needsUpdate = true;
}
function vaultTick(t) { if (!VT.mesh || ZONES.cur !== 'zero') return; if (cam.position.distanceTo(VT.mesh.getWorldPosition(new THREE.Vector3())) > 70) return; VT.n++; if (VT.n % 3 === 0) drawVault(t); }
// ---- on-stream unlock pop-up
const vtPop = document.createElement('div'); vtPop.id = 'vtPop'; vtPop.style.cssText = 'position:fixed;left:50%;top:50%;width:min(78vw,1100px);aspect-ratio:16/9;transform:translate(-50%,-50%) scale(.6);opacity:0;pointer-events:none;z-index:9;transition:opacity .35s, transform .45s cubic-bezier(.2,1.6,.4,1)';
const vtPopC = document.createElement('canvas'); vtPopC.width = 1280; vtPopC.height = 720; vtPopC.style.cssText = 'width:100%;height:100%;display:block'; vtPop.appendChild(vtPopC); document.body.appendChild(vtPop);
const VQ = { q: [], cur: null };
function vtStinger(rar) { try { zAC = zAC || new (window.AudioContext || window.webkitAudioContext)(); if (zAC.state === 'suspended') zAC.resume(); const a = zAC, t0 = a.currentTime + 0.03, hi = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 }[rar] || 2;
  const notes = [392, 523, 659, 784, 1047, 1319].slice(0, 3 + Math.min(3, hi)); notes.forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = i % 2 ? 'triangle' : 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + i * 0.09); g.gain.exponentialRampToValueAtTime(0.06, t0 + i * 0.09 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.09 + 0.5); o.connect(g); g.connect(a.destination); o.start(t0 + i * 0.09); o.stop(t0 + i * 0.09 + 0.6); });
  const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * 1.6, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (a.sampleRate * 0.25));
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; const g = a.createGain(); g.gain.value = 0.35; n.buffer = b; n.connect(lp); lp.connect(g); g.connect(a.destination); n.start(t0); } catch (e) {} }
function vaultPopShow(it, head, sub) { VQ.q.push({ it, head, sub }); if (!VQ.cur) vaultPopNext(); }
function vaultPopNext() { const n = VQ.q.shift(); if (!n) { VQ.cur = null; return; } VQ.cur = Object.assign(n, { t0: performance.now(), dur: 7.5 }); vtStinger(n.it.rarity);
  vtPop.style.opacity = 1; vtPop.style.transform = 'translate(-50%,-50%) scale(1)'; const draw = () => { const C = VQ.cur; if (!C) return; const el = (performance.now() - C.t0) / 1000; vaultPopDraw(C, el);
    if (el > C.dur - 0.5 && vtPop.style.opacity !== '0') { vtPop.style.opacity = 0; vtPop.style.transform = 'translate(-50%,-50%) scale(1.15)'; }
    if (el > C.dur) { VQ.cur = null; vtPop.style.transform = 'translate(-50%,-50%) scale(.6)'; setTimeout(vaultPopNext, 300); return; } requestAnimationFrame(draw); }; draw(); }
function vaultPopDraw(C, el) { const x = vtPopC.getContext('2d'), w = 1280, h = 720, it = C.it, rc = vtRarCol(it.rarity, el), T = VD.types[it.type] || {};
  x.clearRect(0, 0, w, h); x.save(); x.translate(w / 2, h / 2 - 30);
  const rg = x.createRadialGradient(0, 0, 20, 0, 0, 520); rg.addColorStop(0, 'rgba(10,8,6,0.96)'); rg.addColorStop(0.7, 'rgba(10,8,6,0.85)'); rg.addColorStop(1, 'rgba(10,8,6,0)'); x.fillStyle = rg; x.fillRect(-w / 2, -h / 2, w, h);
  x.save(); x.rotate(el * 0.35); x.globalAlpha = 0.28; x.fillStyle = rc; for (let i = 0; i < 16; i++) { x.rotate(Math.PI / 8); x.beginPath(); x.moveTo(0, 0); x.lineTo(-30, -560); x.lineTo(30, -560); x.fill(); } x.restore();
  const k = Math.min(1, el / 0.5), s = 1.55 * (0.4 + 0.6 * (1 - Math.pow(1 - k, 3))) + Math.sin(el * 2) * 0.02; x.save(); x.scale(s, s); vtDraw(x, it, el, 3); x.restore();
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + el * 0.3, r = 190 + ((el * 120 + i * 37) % 160), al = Math.max(0, 1 - ((el * 120 + i * 37) % 160) / 160); x.fillStyle = rc; x.globalAlpha = al; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, 3 + (i % 3), 0, 7); x.fill(); } x.globalAlpha = 1;
  x.restore(); x.textAlign = 'center';
  const flick = el < 0.6 && Math.random() < 0.4 ? 0.4 : 1; x.globalAlpha = flick;
  x.font = '400 66px Anton, Impact, sans-serif'; x.shadowColor = rc; x.shadowBlur = 26; x.fillStyle = '#fff'; x.fillText(C.head || ((VD.rar[it.rarity] || VD.rar.epic)[0] + ' ' + (T.n || 'item') + ' unlocked').toUpperCase(), w / 2, 78); x.globalAlpha = 1;
  x.shadowBlur = 0; x.fillStyle = rc; x.fillRect(w / 2 - 260 * Math.min(1, el / 0.8), 98, 520 * Math.min(1, el / 0.8), 5);
  x.font = '700 50px Poppins, sans-serif'; x.fillStyle = '#fff'; x.shadowColor = '#000'; x.shadowBlur = 12; x.fillText(it.name, w / 2, h - 108);
  x.font = '400 40px Anton, Impact, sans-serif'; x.fillStyle = rc; x.fillText(String(C.sub || it.title || (T.s || {})[it.style] || '').toUpperCase(), w / 2, h - 58); x.shadowBlur = 0;
  x.font = '600 22px Poppins, sans-serif'; x.fillStyle = '#d8ccb8'; x.fillText('ZONE ZERO · OPERATOR VAULT', w / 2, h - 22); }
// ---- data + panel
function renderVaultList() { const el = $('vtList'); if (!el) return; el.innerHTML = vaultItems.length ? '' : '<p class="note">No items given yet.</p>';
  vaultItems.forEach((c, i) => { const row = document.createElement('div'); row.className = 'chrow'; const T = VD.types[c.type] || {}; row.innerHTML = `<span><b>${String(c.name).replace(/</g, '&lt;')}</b> · <span style="color:${(VD.rar[c.rarity] || VD.rar.epic)[1]}">${(VD.rar[c.rarity] || VD.rar.epic)[0]}</span> ${T.n || c.type}<br><i>${String((T.s || {})[c.style] || c.style).replace(/</g, '&lt;')}${c.title ? ' · ' + String(c.title).replace(/</g, '&lt;') : ''}</i></span>`;
    const del = document.createElement('button'); del.textContent = '✕'; del.title = 'Remove'; del.dataset.i = i; row.appendChild(del); el.appendChild(row); }); }
function addVault(item, pop, spot) { vaultItems.unshift(item); store.set('vault', vaultItems); renderVaultList(); drawVault(clock.getElapsedTime()); if (pop) vaultPopShow(item); if (spot && VT.mesh) focusMesh(VT.mesh, item.name + ' unlocked a new item'); postState(); }
function delVault(i) { vaultItems.splice(i, 1); store.set('vault', vaultItems); renderVaultList(); drawVault(clock.getElapsedTime()); postState(); }
function vaultShowUser(user) { const mine = vaultItems.filter(v => v.name.toLowerCase() === String(user).toLowerCase()); if (!mine.length) { toast(user + ' has no Vault items yet'); return; }
  const order = ['mythic', 'legendary', 'epic', 'rare', 'common'], best = mine.slice().sort((a, b) => order.indexOf(a.rarity) - order.indexOf(b.rarity))[0];
  vaultPopShow(best, (user + "'s vault").toUpperCase(), mine.length + ' item' + (mine.length === 1 ? '' : 's') + ' · best: ' + ((VD.types[best.type] || {}).s || {})[best.style]); }

window.LSCZ = {
  ready: true, screens, ZONE_SHOTS, extraScreens,
  build: { space: () => { if (!window.__zpt) { zPlanetTextures(); window.__zpt = 1; } buildSpace(); }, planet: () => { if (!window.__zpt) { zPlanetTextures(); window.__zpt = 1; } buildPlanet(); }, bay: () => buildBay(), summit: () => buildSummit(), hollow: () => buildHollow(), zero: () => buildZero(), abyss: () => buildAbyss() },
  scene: z => ({ space: () => SP.scene, planet: () => PL.scene, bay: () => BAY.scene, summit: () => SM.scene, hollow: () => HW.scene, zero: () => ZZ.scene, abyss: () => AB.scene })[z](),
  tick: (z, dt, t) => ({ space: spaceTick, planet: planetTick, bay: bayTick, summit: summitTick, hollow: hollowTick, zero: zeroTick, abyss: abyssTick })[z](dt, t),
  NPC
};
})();
