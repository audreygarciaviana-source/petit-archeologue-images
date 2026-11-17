window.__S=ms=>new Promise(r=>setTimeout(r,ms));
window.__ed=()=>document.querySelector('.tiptap.ProseMirror').editor;
window.__figs=()=>{const r=[];__ed().state.doc.forEach((n,off,i)=>{if(n.type.name==='FIGURE'){let alt='',id='';n.descendants(c=>{if(c.type.name==='IMAGE'){alt=c.attrs.altText||'';id=(c.attrs.image&&c.attrs.image.src&&c.attrs.image.src.id)||'';}});r.push({i,off,size:n.nodeSize,alt,id});}});return r;};
// move figure matching alt (plus its caption paragraph if next block is an italic photo credit) to right after the first block
window.__moveTop=(match)=>{const ed=__ed();const st=ed.state;const f=__figs().find(x=>x.alt.includes(match));if(!f)return 'nofig';
 let end=f.off+f.size;const next=st.doc.childAfter(end).node;let nodes=[st.doc.nodeAt(f.off)];
 if(next&&next.type.name==='PARAGRAPH'&&/Photo :/.test(next.textContent)){nodes.push(next);end+=next.nodeSize;}
 const json=nodes.map(n=>n.toJSON());let tr=st.tr.delete(f.off,end);const pos=tr.doc.child(0).nodeSize;
 const frag=json.map(j=>st.schema.nodeFromJSON(j));tr=tr.insert(pos,frag);ed.view.dispatch(tr);return 'moved '+nodes.length;};
// upload an image by URL at the end, then return its figure info
window.__upUrl=async(url,name,mime)=>{const pm=document.querySelector('.tiptap.ProseMirror');const before=new Set(__figs().map(x=>x.id));const b=await fetch(url).then(r=>r.blob());
 pm.editor.commands.focus('end');await __S(200);const dt=new DataTransfer();dt.items.add(new File([b],name,{type:mime}));pm.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
 for(let i=0;i<90;i++){await __S(1000);const nw=__figs().filter(x=>!before.has(x.id)&&/~mv2/.test(x.id));if(nw.length)return nw[0];}throw new Error('timeout');};
window.__setAlt=(id,alt)=>{const ed=__ed();let p=null,nn=null;ed.state.doc.descendants((n,pos)=>{if(n.type.name==='IMAGE'&&n.attrs.image&&n.attrs.image.src&&n.attrs.image.src.id===id){p=pos;nn=n;}});ed.view.dispatch(ed.state.tr.setNodeMarkup(p,null,{...nn.attrs,altText:alt}));};
window.__insAfterFirst=(html)=>{const ed=__ed();const pos=ed.state.doc.child(0).nodeSize;ed.commands.insertContentAt(pos,html);};
window.__publish=()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(Mettre à jour|Publier)$/.test(x.innerText.trim()));b&&b.click();return b?b.innerText:'nobtn';};
'cover ok'
