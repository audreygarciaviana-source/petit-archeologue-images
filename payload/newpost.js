window.__np=async(which)=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const log=[];window.__npst='start';
const RAW='https://raw.githubusercontent.com/audreygarciaviana-source/petit-archeologue-images/main/';
const P=(await fetch(RAW+'payload/newposts.json?v='+Date.now()).then(r=>r.json())).find(x=>x.id===which);
const V=(el,v)=>{const pr=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;const s=Object.getOwnPropertyDescriptor(pr,'value').set;el.focus();s.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.blur();};
let h=P.html;const B={};
for(const k of P.keys){const src=P.imgs[k];window.__npst='fetch '+k;
 if(src.startsWith('File:')){const j=await fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&titles='+encodeURIComponent(src)+'&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=1280&iiextmetadatafilter=Artist|LicenseShortName').then(r=>r.json());
  const pg=Object.values(j.query.pages)[0];const ii=pg.imageinfo[0];const art=((ii.extmetadata.Artist||{}).value||'NASA').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim().slice(0,60);const lic=((ii.extmetadata.LicenseShortName||{}).value||'domaine public');
  B[k]=await fetch(ii.thumburl).then(r=>r.blob());h=h.replace('§§CRED'+k+'§§','(Photo : '+art+', '+lic+', via Wikimedia Commons)');log.push(k+' '+art+' | '+lic);}
 else{B[k]=await fetch(RAW+'img/'+src+'?v=1').then(r=>{if(!r.ok)throw new Error(src);return r.blob();});}}
window.__npst='paste';
V(document.querySelector('[data-hook="post-form__title-input"]'),P.title);await S(500);
const pm=document.querySelector('.tiptap.ProseMirror');pm.focus();document.execCommand('selectAll');await S(300);
const dt=new DataTransfer();dt.setData('text/html',h);dt.setData('text/plain','x');pm.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));await S(3000);
const imgs=()=>{const r=[];pm.editor.state.doc.descendants((n,pos)=>{if(n.type.name==='IMAGE')r.push({pos,id:n.attrs.image&&n.attrs.image.src&&n.attrs.image.src.id,loading:n.attrs.loading});});return r;};
for(const k of P.keys){window.__npst='img '+k;const para=[...pm.querySelectorAll('p')].find(x=>x.innerText.trim()==='§§'+k+'§§');if(!para){log.push(k+' noph');continue;}
 const before=new Set(imgs().map(x=>x.id));const sel=getSelection();const r=document.createRange();r.selectNodeContents(para);sel.removeAllRanges();sel.addRange(r);pm.focus();await S(200);document.execCommand('delete');await S(300);
 const isPng=B[k].type==='image/png';const d2=new DataTransfer();d2.items.add(new File([B[k]],P.slug+'-'+k.toLowerCase()+(isPng?'.png':'.jpg'),{type:isPng?'image/png':'image/jpeg'}));pm.dispatchEvent(new ClipboardEvent('paste',{clipboardData:d2,bubbles:true,cancelable:true}));
 let got=null;for(let i=0;i<120;i++){await S(1000);const nw=imgs().filter(x=>!before.has(x.id)&&x.id&&!x.loading&&/~mv2/.test(x.id));if(nw.length){got=nw[0];break;}}
 if(!got){log.push(k+' TIMEOUT');continue;}
 const ed=pm.editor;const n=ed.state.doc.nodeAt(got.pos);ed.view.dispatch(ed.state.tr.setNodeMarkup(got.pos,null,{...n.attrs,altText:P.alts[k]}));await S(300);}
const t=pm.innerText.trim();window.__npres={n:imgs().length,left:(t.match(/§§/g)||[]).length,start:t.slice(0,40),end:t.slice(-40),log};window.__npst='done';};
'defined'
