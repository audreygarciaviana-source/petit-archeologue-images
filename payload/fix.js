window.fixVogue = async (items, renames = []) => {
  const S = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 40 && !document.querySelector('.tiptap.ProseMirror'); i++) await S(1000);
  await S(1500);
  const ed = document.querySelector('.tiptap.ProseMirror').editor;
  const M = JSON.parse(localStorage.getItem('__vmedia') || '{}');
  const MARK = 'Le Petit Archéologue · ';
  const rid = () => Math.random().toString(36).slice(2, 10);
  const top = []; ed.state.doc.forEach((n, off) => top.push({ n, off, end: off + n.nodeSize, t: n.textContent.replace(/ /g, ' ').trim() }));
  const acts = [], log = [];
  for (const it of items) {
    if (top.some(x => x.n.type.name === 'FIGURE' && x.n.textContent === '' && JSON.stringify(x.n.toJSON()).includes(M[it.file].id))) { log.push('exists ' + it.file); continue; }
    const p = top.find(x => x.n.type.name === 'PARAGRAPH' && x.t.startsWith(it.after));
    if (!p) { log.push('noanchor ' + it.file); continue; }
    const m = M[it.file];
    acts.push({ pos: p.end, node: ed.schema.nodeFromJSON({ type: 'FIGURE', attrs: { id: rid() }, content: [
      { type: 'IMAGE', attrs: { id: rid(), image: { src: { id: m.id }, width: m.w, height: m.h }, containerData: { alignment: 'CENTER', width: { size: 'CONTENT' }, textWrap: true }, altText: MARK + it.alt } },
      { type: 'CAPTION', attrs: { id: rid(), textStyle: { textAlignment: 'CENTER', lineHeight: 1.5 }, styleDefaults: { paddingTop: '16px', paddingBottom: '16px' }, showEmpty: false } }] }) });
    log.push('ok ' + it.file);
  }
  for (const [from, to] of renames) {
    const h = top.find(x => x.n.type.name === 'HEADING' && x.t === from);
    if (h) { acts.push({ pos: h.off + 1, to: h.end - 1, text: to }); log.push('renamed'); } else log.push('norename');
  }
  acts.sort((a, b) => b.pos - a.pos);
  let tr = ed.state.tr;
  for (const a of acts) tr = a.text ? tr.insertText(a.text, a.pos, a.to) : tr.insert(a.pos, a.node);
  ed.view.dispatch(tr); await S(1500);
  let pub = 'none';
  if (acts.length) { await S(1500); const b = [...document.querySelectorAll('button')].find(x => /^(Mettre à jour|Publier)$/.test(x.innerText.trim())); if (b) { pub = b.innerText.trim(); b.click(); } }
  return { log, pub };
};
'ok';
