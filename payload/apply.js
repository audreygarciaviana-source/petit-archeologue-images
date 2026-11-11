// Inserts the Vogue-style image blocks into the open Wix blog post editor, then publishes.
// Usage (in the editor page): window.__ap = applyVogue(POST_ID, {publish: true})
window.applyVogue = async (POST, opt = {}) => {
  const S = ms => new Promise(r => setTimeout(r, ms));
  const RAW = 'https://raw.githubusercontent.com/audreygarciaviana-source/petit-archeologue-images/';
  for (let i = 0; i < 40 && !document.querySelector('.tiptap.ProseMirror'); i++) await S(1000);
  await S(2500);
  const pm = document.querySelector('.tiptap.ProseMirror'); const ed = pm.editor;
  const man = await fetch(RAW + opt.commit + '/payload/manifest.json').then(r => r.json());
  const ops = man[POST]; if (!ops) return { err: 'no ops' };
  const M = JSON.parse(localStorage.getItem('__vmedia') || '{}');
  const MARK = 'Le Petit Archéologue · ';
  let already = false;
  ed.state.doc.descendants(n => { if (n.type.name === 'IMAGE' && (n.attrs.altText || '').startsWith(MARK)) already = true; });
  if (already) return { skip: 'already' };
  const rid = () => Math.random().toString(36).slice(2, 10);
  const missingMedia = [];
  const fig = (name, alt) => {
    const m = M[name]; if (!m) { missingMedia.push(name); return null; }
    return ed.schema.nodeFromJSON({ type: 'FIGURE', attrs: { id: rid() }, content: [
      { type: 'IMAGE', attrs: { id: rid(), image: { src: { id: m.id }, width: m.w, height: m.h }, containerData: { alignment: 'CENTER', width: { size: 'CONTENT' }, textWrap: true }, altText: MARK + alt } },
      { type: 'CAPTION', attrs: { id: rid(), textStyle: { textAlignment: 'CENTER', lineHeight: 1.5 }, styleDefaults: { paddingTop: '16px', paddingBottom: '16px' }, showEmpty: false } }] });
  };
  const top = []; ed.state.doc.forEach((n, off) => top.push({ n, off, end: off + n.nodeSize, t: n.textContent.trim() }));
  const acts = []; const missing = []; let h2 = 0; let essDone = false;
  const renames = { 'archéologie': 'archéologique', 'égyptologie': 'égyptologique', 'histoire': 'historique', 'science': 'scientifique' };
  for (let i = 0; i < top.length; i++) {
    const { n, off, end, t } = top[i];
    if (n.type.name === 'HEADING' && t === 'En bref' && !essDone) {
      let to = end; if (top[i + 1] && /LIST/.test(top[i + 1].n.type.name)) to = top[i + 1].end;
      const f = fig(ops.ess.file, ops.ess.alt); if (f) acts.push({ pos: off, to, node: f, pr: 2 }); essDone = true;
    }
    if (n.type.name === 'HEADING' && n.attrs.level === 2) {
      const name = ops.chseq[h2]; h2++;
      if (name) { const f = fig(name, 'Chapitre ' + h2 + ' : ' + t); if (f) acts.push({ pos: off, node: f, pr: 0 }); }
    }
    if (n.type.name === 'HEADING' && n.attrs.level === 3) {
      const m = t.match(/^La position de l['’](archéologie|égyptologie|histoire|science) officielle$/);
      if (m) acts.push({ pos: off + 1, to: end - 1, text: "L'interprétation " + renames[m[1]] + ' actuelle', pr: 3 });
    }
  }
  if (!essDone) { // no "En bref": put it after the opening paragraph
    const first = top.find(x => x.n.type.name === 'PARAGRAPH' && x.t);
    const f = fig(ops.ess.file, ops.ess.alt); if (first && f) acts.push({ pos: first.end, node: f, pr: 1 });
  }
  for (const o of [...ops.deb, ...ops.marg]) {
    const p = top.find(x => x.n.type.name === 'PARAGRAPH' && x.t.startsWith(o.after.trim()));
    if (!p) { missing.push(o.file); continue; }
    const f = fig(o.file, o.alt); if (f) acts.push({ pos: p.end, node: f, pr: 1 });
  }
  if (h2 !== ops.chseq.length) missing.push('h2 count ' + h2 + '/' + ops.chseq.length);
  acts.sort((a, b) => b.pos - a.pos || a.pr - b.pr);
  let tr = ed.state.tr;
  for (const a of acts) {
    if (a.text) tr = tr.insertText(a.text, a.pos, a.to);
    else if (a.to) tr = tr.replaceWith(a.pos, a.to, a.node);
    else tr = tr.insert(a.pos, a.node);
  }
  ed.view.dispatch(tr);
  await S(3000);
  let n = 0; ed.state.doc.descendants(x => { if (x.type.name === 'IMAGE' && (x.attrs.altText || '').startsWith(MARK)) n++; });
  let pub = 'nopub';
  if (opt.publish && missingMedia.length === 0) {
    await S(2500);
    const b = [...document.querySelectorAll('button')].find(x => /^(Mettre à jour|Publier)$/.test(x.innerText.trim()));
    if (b) { b.click(); await S(9000); pub = 'clicked:' + b.innerText.trim(); } else pub = 'nobutton';
  }
  return { inserted: n, acts: acts.length, missing, missingMedia, pub };
};
'ok';
