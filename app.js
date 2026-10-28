(()=>{"use strict";
const $=id=>document.getElementById(id);
const defs={
 gradient:{label:"Gradient",ico:"◩",nums:{speed:.55,scale:1},colors:["#d22a34","#249e4e","#e84844","#12763a"]},
 rainbow:{label:"Rainbow",ico:"🌈",nums:{speed:1,scale:1,saturation:.9},colors:[]},
 wave:{label:"Wave",ico:"〰",nums:{speed:.7,amplitude:1,frequency:1},colors:[]},
 bounce:{label:"Bounce",ico:"↕",nums:{speed:1,height:1.5,spacing:1},colors:[]},
 shake:{label:"Shake",ico:"≋",nums:{speed:1,amount:1},colors:[]},
 wobble:{label:"Wobble",ico:"⌇",nums:{speed:1,amount:.7},colors:[]},
 glow:{label:"Glow",ico:"✦",nums:{strength:1},colors:["#ffd45a"]},
 shine:{label:"Shine",ico:"／",nums:{speed:1,width:.4,strength:1},colors:[]},
 shadow:{label:"Shadow",ico:"◐",nums:{},colors:["#200a0e"]},
 particles:{label:"Custom Particles",ico:"✣",nums:{count:10,size:1,speed:1,lifetime:1.8,spread_x:26,spread_y:14,velocity_x:0,velocity_y:-3,gravity:0,orbit:0,twinkle:.8,seed:13},colors:["#ffffff","#ffd45a"],opts:{shape:"custom",spawn:"around",blend:"normal"},mask:[
  "000010000","000111000","101111101","011111110","111111111","011111110","101111101","000111000","000010000"
 ]}
};
const order=["gradient","rainbow","wave","bounce","shake","wobble","glow","shine","shadow","particles"];
const clone=o=>JSON.parse(JSON.stringify(o));
function layer(type){let d=defs[type];return{uid:Math.random().toString(36).slice(2),type,enabled:true,nums:clone(d.nums||{}),colors:clone(d.colors||[]),opts:clone(d.opts||{}),mask:clone(d.mask||[])}}
const defFb=()=>({enabled:true,bold:true,italic:false,underline:false,strike:false,animate:false,frames:16,custom:false,colors:["#E63434","#FF4B1D"]});
let state={fallback:defFb(),name:"Custom Particles",id:"custom_particles",marker:"#540000",target:"1.21.6-1.21.11",previewText:"CUSTOM PARTICLES",layers:[layer("gradient"),layer("wave"),layer("particles"),layer("shadow")]};
let selected=2,paused=false;
function rgb(h){h=h.replace("#","");let n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function css(c,a=1){return`rgba(${c[0]},${c[1]},${c[2]},${a})`}
function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}
function fract(v){return v-Math.floor(v)}
function hash(n){return fract(Math.sin(n*127.1+311.7)*43758.5453)}
function palette(colors,p){if(!colors.length)return[255,255,255];if(colors.length===1)return rgb(colors[0]);p=fract(p);let q=p*colors.length,i=Math.floor(q)%colors.length,j=(i+1)%colors.length;return mix(rgb(colors[i]),rgb(colors[j]),q-Math.floor(q))}
function normalizeMarker(h){if(!/^#[0-9a-f]{6}$/i.test(h))return"#540000";let a=rgb(h).map(v=>Math.max(0,Math.min(252,Math.round(v/4)*4)));return"#"+a.map(v=>v.toString(16).padStart(2,"0")).join("")}
function markerOk(h){return /^#[0-9a-f]{6}$/i.test(h)&&rgb(h).every(v=>v%4===0)}
function randomMarker(){let a=[84,Math.floor(Math.random()*32)*4,Math.floor(Math.random()*32)*4];return"#"+a.map(v=>v.toString(16).padStart(2,"0")).join("")}
function legacy(h){return"&x"+h.slice(1).toUpperCase().split("").map(c=>"&"+c).join("")}
function renderPalette(){
 $("palette").innerHTML=order.map(t=>`<button data-add="${t}">${defs[t].ico} ${defs[t].label}</button>`).join("");
 document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{state.layers.push(layer(b.dataset.add));selected=state.layers.length-1;sync()})
}
function renderLayers(){
 $("layers").innerHTML=state.layers.map((l,i)=>`<div class="layer ${selected===i?"active":""}" data-layer="${i}">
   <div class="ico">${defs[l.type].ico}</div><div><div class="lt">${defs[l.type].label}</div><div class="ls">${l.enabled?"enabled":"disabled"}</div></div>
   <div class="buttons"><button data-a="toggle" data-i="${i}">${l.enabled?"◉":"○"}</button><button data-a="up" data-i="${i}">↑</button><button data-a="down" data-i="${i}">↓</button><button data-a="del" data-i="${i}">×</button></div>
 </div>`).join("");
 document.querySelectorAll("[data-layer]").forEach(n=>n.onclick=e=>{if(e.target.closest("[data-a]"))return;selected=+n.dataset.layer;sync(false)});
 document.querySelectorAll("[data-a]").forEach(b=>b.onclick=e=>{e.stopPropagation();let i=+b.dataset.i,a=b.dataset.a;if(a==="toggle")state.layers[i].enabled=!state.layers[i].enabled;if(a==="del"){state.layers.splice(i,1);selected=Math.min(selected,state.layers.length-1)}if(a==="up"&&i>0){[state.layers[i-1],state.layers[i]]=[state.layers[i],state.layers[i-1]];selected=i-1}if(a==="down"&&i<state.layers.length-1){[state.layers[i+1],state.layers[i]]=[state.layers[i],state.layers[i+1]];selected=i+1}sync()})
}
function pretty(x){return x.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}
function renderProps(){
 let box=$("props"),l=state.layers[selected];$("particleDesigner").classList.add("hidden");
 if(!l){$("selectedName").textContent="—";box.innerHTML='<div class="muted">Selecciona una capa.</div>';return}
 $("selectedName").textContent=defs[l.type].label;
 let h='<div class="propgrid">';
 if(l.type==="particles"){
   h+=`<label>Shape<select data-opt="shape">${["custom","dot","square","diamond","star","cross","heart","ring"].map(v=>`<option ${l.opts.shape===v?"selected":""}>${v}</option>`).join("")}</select></label>`;
   h+=`<label>Spawn<select data-opt="spawn">${["around","above","below","inside","orbit","rain","rise","trail"].map(v=>`<option ${l.opts.spawn===v?"selected":""}>${v}</option>`).join("")}</select></label>`;
   h+=`<label>Blend<select data-opt="blend">${["normal","add","screen"].map(v=>`<option ${l.opts.blend===v?"selected":""}>${v}</option>`).join("")}</select></label>`;
   h+=`<label>Preset<button id="randomParticle" type="button">Aleatorio</button></label>`;
 }
 for(const [k,v] of Object.entries(l.nums))h+=`<label><span>${pretty(k)}</span><input data-num="${k}" type="number" step="0.05" value="${v}"></label>`;
 if(l.colors.length){h+='<div class="full colors"><span class="muted">Colores</span>';l.colors.forEach((c,i)=>h+=`<div class="cr"><input data-col="${i}" type="color" value="${c}"><input data-hex="${i}" value="${c}"><button data-rmcol="${i}">×</button></div>`);h+='<button id="addColor">+ Color</button></div>'}
 h+="</div>";box.innerHTML=h;
 box.querySelectorAll("[data-num]").forEach(x=>x.oninput=()=>{l.nums[x.dataset.num]=+x.value;updateOutput()});
 box.querySelectorAll("[data-opt]").forEach(x=>x.onchange=()=>{l.opts[x.dataset.opt]=x.value;if(x.dataset.opt==="shape")renderMask();updateOutput()});
 box.querySelectorAll("[data-col]").forEach(x=>x.oninput=()=>{let i=+x.dataset.col;l.colors[i]=x.value;box.querySelector(`[data-hex="${i}"]`).value=x.value;updateOutput()});
 box.querySelectorAll("[data-hex]").forEach(x=>x.onchange=()=>{let i=+x.dataset.hex;if(/^#[0-9a-f]{6}$/i.test(x.value)){l.colors[i]=x.value;box.querySelector(`[data-col="${i}"]`).value=x.value;updateOutput()}});
 box.querySelectorAll("[data-rmcol]").forEach(x=>x.onclick=()=>{l.colors.splice(+x.dataset.rmcol,1);renderProps();updateOutput()});
 let ac=$("addColor");if(ac)ac.onclick=()=>{l.colors.push("#ffffff");renderProps();updateOutput()};
 let rp=$("randomParticle");if(rp)rp.onclick=()=>{randomizeParticle(l);renderProps();renderMask();updateOutput()};
 if(l.type==="particles"){$("particleDesigner").classList.remove("hidden");renderMask()}
}
function randomizeParticle(l){
 l.nums.count=6+Math.floor(Math.random()*14);l.nums.size=+(0.7+Math.random()*1.5).toFixed(2);l.nums.speed=+(0.4+Math.random()*1.8).toFixed(2);
 l.nums.spread_x=15+Math.floor(Math.random()*35);l.nums.spread_y=8+Math.floor(Math.random()*25);l.nums.velocity_y=+(-5+Math.random()*10).toFixed(2);
 l.nums.orbit=+(Math.random()*1.5).toFixed(2);l.nums.twinkle=+(Math.random()).toFixed(2);l.nums.seed=Math.floor(Math.random()*1000);
}
const masks={
 star:["000010000","000111000","101111101","011111110","111111111","011111110","101111101","000111000","000010000"],
 spark:["000010000","000010000","000010000","111111111","000111000","111111111","000010000","000010000","000010000"],
 heart:["000000000","011001100","111111110","111111110","011111100","001111000","000110000","000000000","000000000"]
};
function renderMask(){
 let l=state.layers[selected];if(!l||l.type!=="particles")return;
 if(!l.mask||l.mask.length!==9)l.mask=masks.star.slice();
 let g=$("pixelGrid");g.innerHTML="";
 for(let y=0;y<9;y++)for(let x=0;x<9;x++){let b=document.createElement("button");b.className="px "+(l.mask[y][x]==="1"?"on":"");b.onclick=()=>{let row=l.mask[y].split("");row[x]=row[x]==="1"?"0":"1";l.mask[y]=row.join("");renderMask();updateOutput()};g.appendChild(b)}
}
function setMask(m){let l=state.layers[selected];if(l&&l.type==="particles"){l.mask=m.slice();renderMask();updateOutput()}}
$("maskClear").onclick=()=>setMask(Array(9).fill("000000000"));
$("maskInvert").onclick=()=>{let l=state.layers[selected];if(!l||l.type!=="particles")return;l.mask=l.mask.map(r=>[...r].map(c=>c==="1"?"0":"1").join(""));renderMask();updateOutput()};
$("maskStar").onclick=()=>setMask(masks.star);$("maskSpark").onclick=()=>setMask(masks.spark);$("maskHeart").onclick=()=>setMask(masks.heart);
const canvas=$("canvas"),ctx=canvas.getContext("2d");new ResizeObserver(()=>resize()).observe(canvas);
function resize(){let r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);ctx.setTransform(d,0,0,d,0,0)}
function charTransform(i,t){let x=0,y=0;for(let l of state.layers){if(!l.enabled)continue;let p=l.nums;if(l.type==="wave")y+=Math.sin(i*.65-t*p.speed*6)*p.amplitude*3;if(l.type==="bounce")y-=Math.abs(Math.sin((t*p.speed-i*.08*p.spacing)*Math.PI))*p.height*4;if(l.type==="shake"){x+=(hash(i*11+Math.floor(t*p.speed*25))-.5)*p.amount*3;y+=(hash(i*17+Math.floor(t*p.speed*27))-.5)*p.amount*3}if(l.type==="wobble"){x+=Math.sin(t*p.speed*3+i*.8)*p.amount*2;y+=Math.cos(t*p.speed*3+i*.6)*p.amount*2}}return{x,y}}
function charColor(i,t,x){let c=rgb(state.marker);for(let l of state.layers){if(!l.enabled)continue;if(l.type==="gradient")c=palette(l.colors,x/(400*Math.max(l.nums.scale,.01))-t*l.nums.speed*.5);if(l.type==="rainbow"){let h=fract(x*.0025/Math.max(l.nums.scale,.01)-t*l.nums.speed*.25);c=hsv(h,l.nums.saturation,1)}}return c}
function hsv(h,s,v){let i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),tt=v*(1-(1-f)*s),r,g,b;switch(i%6){case 0:r=v;g=tt;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=tt;break;case 3:r=p;g=q;b=v;break;case 4:r=tt;g=p;b=v;break;default:r=v;g=p;b=q}return[r,g,b].map(n=>Math.round(n*255))}
function drawMask(x,y,size,mask,color,a=1){ctx.save();ctx.fillStyle=css(color,a);let cell=size/9;for(let yy=0;yy<9;yy++)for(let xx=0;xx<9;xx++)if(mask[yy]?.[xx]==="1")ctx.fillRect(x+(xx-4.5)*cell,y+(yy-4.5)*cell,Math.max(1,cell),Math.max(1,cell));ctx.restore()}
function presetMask(shape){if(shape==="custom")return null;if(shape==="star")return masks.star;if(shape==="heart")return masks.heart;if(shape==="cross")return masks.spark;if(shape==="dot")return["000000000","000000000","000000000","000111000","000111000","000111000","000000000","000000000","000000000"];if(shape==="square")return["000000000","000000000","001111100","001111100","001111100","001111100","001111100","000000000","000000000"];if(shape==="diamond")return["000010000","000111000","001111100","011111110","111111111","011111110","001111100","000111000","000010000"];if(shape==="ring")return["000111000","001000100","010000010","100000001","100000001","100000001","010000010","001000100","000111000"];return masks.star}
function drawParticles(t,cx,cy,textW){
 for(let l of state.layers){if(!l.enabled||l.type!=="particles")continue;let p=l.nums,count=Math.max(1,Math.floor(p.count)),mask=presetMask(l.opts.shape)||l.mask,cols=l.colors.length?l.colors:["#fff"];
  for(let i=0;i<count;i++){let seed=hash(i*37+p.seed),age=fract(t*p.speed/p.lifetime+seed),sx=(hash(i*53+p.seed*2)-.5)*p.spread_x*2,sy=(hash(i*71+p.seed*3)-.5)*p.spread_y*2;
   let x=cx+sx,y=cy+sy,spawn=l.opts.spawn;
   if(spawn==="above")y=cy-p.spread_y-Math.abs(sy*.4); if(spawn==="below")y=cy+p.spread_y+Math.abs(sy*.4);
   if(spawn==="rain"){y=cy-p.spread_y+age*p.spread_y*2;x=cx+sx} if(spawn==="rise"){y=cy+p.spread_y-age*p.spread_y*2}
   if(spawn==="trail"){x=cx-textW/2+age*textW;y=cy+sy*.5}
   if(spawn==="orbit"||p.orbit>0){let ang=age*Math.PI*2*(1+p.orbit)+seed*6.28;x=cx+Math.cos(ang)*(textW*.55+sx*.2);y=cy+Math.sin(ang)*(p.spread_y+8)}
   x+=p.velocity_x*age*5;y+=p.velocity_y*age*5+p.gravity*age*age*10;
   let alpha=Math.sin(Math.PI*age);alpha*=1-p.twinkle*.5+p.twinkle*(.5+.5*Math.sin(t*10+i));
   let col=rgb(cols[i%cols.length]);drawMask(x,y,p.size*10,mask,col,Math.max(0,alpha));
  }
 }
}
function render(now){fbTick(now);let r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);let t=paused?0:now/1000,text=state.previewText||"TEXT",fs=Math.max(18,Math.min(54,r.width/(text.length*1.15)));ctx.font=`${fs}px 'Press Start 2P',ui-monospace,monospace`;ctx.textBaseline="middle";
 let widths=[...text].map(c=>ctx.measureText(c).width),total=widths.reduce((a,b)=>a+b,0),x=r.width/2-total/2,cy=r.height/2;drawParticles(t,r.width/2,cy,total);
 [...text].forEach((ch,i)=>{let w=widths[i],tr=charTransform(i,t),c=charColor(i,t,x-(r.width/2-total/2)),shadow=state.layers.find(l=>l.enabled&&l.type==="shadow"),glow=state.layers.find(l=>l.enabled&&l.type==="glow");
  ctx.save();ctx.translate(x+tr.x,cy+tr.y);if(shadow){ctx.fillStyle=shadow.colors[0];ctx.fillText(ch,2,3)}if(glow){ctx.shadowColor=glow.colors[0];ctx.shadowBlur=12*glow.nums.strength}ctx.fillStyle=css(c);ctx.fillText(ch,0,0);ctx.restore();x+=w});
 requestAnimationFrame(render)}
requestAnimationFrame(render);
function yamlQ(s){return`"${String(s).replaceAll("\\","\\\\").replaceAll('"','\\"')}"`}
function yaml(){
 let y=`text-effects:\n  ${state.id}:\n    enabled: true\n    name: ${yamlQ(state.name)}\n    marker: ${yamlQ(state.marker.toUpperCase())}\n    target: ${yamlQ(state.target)}\n    operations:\n`;
 for(let l of state.layers){y+=`      - type: ${l.type}\n        enabled: ${l.enabled}\n`;if(l.colors.length){y+=`        colors:\n`;l.colors.forEach(c=>y+=`          - ${yamlQ(c.toUpperCase())}\n`)}
  for(let [k,v] of Object.entries(l.opts||{}))y+=`        ${k.replaceAll("_","-")}: ${yamlQ(v)}\n`;
  for(let [k,v] of Object.entries(l.nums||{}))y+=`        ${k.replaceAll("_","-")}: ${v}\n`;
  if(l.type==="particles"&&l.opts.shape==="custom"){y+=`        mask:\n`;l.mask.forEach(row=>y+=`          - ${yamlQ(row)}\n`)}
 }
 y+=fbYaml();
 return y
}
function operationGlsl(){
 let l=state.layers[selected];if(!l)return"// No layer selected";
 if(l.type!=="particles")return`// ${l.type}\n// Esta capa será compilada por newResources.`;
 return `// Generated custom particle operation\nnr_particles(\n  shape="${l.opts.shape}", spawn="${l.opts.spawn}", count=${l.nums.count}, size=${l.nums.size},\n  speed=${l.nums.speed}, lifetime=${l.nums.lifetime}, spread=vec2(${l.nums.spread_x}, ${l.nums.spread_y}),\n  velocity=vec2(${l.nums.velocity_x}, ${l.nums.velocity_y}), gravity=${l.nums.gravity}, orbit=${l.nums.orbit}, twinkle=${l.nums.twinkle}, seed=${l.nums.seed}\n);`
}
function project(){return{format:"newresources-text-effect",version:2,...state}}
function download(name,text,type="text/plain"){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function updateOutput(){$("output").value=yaml();fbUpdate();$("mini").textContent=`<${state.marker.toUpperCase()}>Tu texto`;$("legacy").textContent=legacy(state.marker)+"Tu texto";$("markerStatus").className=markerOk(state.marker)?"ok":"bad";$("markerStatus").textContent=markerOk(state.marker)?"✓ Marker compatible":"⚠ Marker corregido a múltiplos de 4"}
function sync(full=true){$("name").value=state.name;$("id").value=state.id;$("marker").value=state.marker;$("markerColor").value=state.marker;$("target").value=state.target;$("previewText").value=state.previewText;renderLayers();renderProps();fbSync();updateOutput()}
$("name").oninput=e=>{state.name=e.target.value;updateOutput()};$("id").oninput=e=>{state.id=e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,"_");e.target.value=state.id;updateOutput()};
$("marker").onchange=e=>{state.marker=normalizeMarker(e.target.value);sync(false)};$("markerColor").oninput=e=>{state.marker=normalizeMarker(e.target.value);sync(false)};$("markerRnd").onclick=()=>{state.marker=randomMarker();sync(false)};
$("target").onchange=e=>{state.target=e.target.value;updateOutput()};$("previewText").oninput=e=>state.previewText=e.target.value;$("clear").onclick=()=>{state.layers=[];selected=-1;sync()};
$("pause").onclick=()=>{paused=!paused;$("pause").textContent=paused?"Reanudar":"Pausar"};document.querySelectorAll(".bg").forEach(b=>b.onclick=()=>{document.querySelectorAll(".bg").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("stage").className="stage "+b.dataset.bg});
$("copyMini").onclick=()=>navigator.clipboard.writeText($("mini").textContent);$("copyYaml").onclick=()=>navigator.clipboard.writeText(yaml());$("exportYaml").onclick=()=>download(`${state.id}.yml`,yaml(),"text/yaml");$("exportGlsl").onclick=()=>download(`${state.id}-operation.glsl`,operationGlsl());$("exportProject").onclick=()=>download(`${state.id}.nreffect`,JSON.stringify(project(),null,2),"application/json");
$("newBtn").onclick=()=>{state={fallback:defFb(),name:"Nuevo efecto",id:"nuevo_efecto",marker:randomMarker(),target:"1.21.6-1.21.11",previewText:"NUEVO EFECTO",layers:[layer("gradient"),layer("particles")]};selected=1;sync()};
$("importInput").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let o=JSON.parse(await f.text());if(o.format!=="newresources-text-effect")throw Error("Formato no compatible");state={name:o.name,id:o.id,marker:normalizeMarker(o.marker),target:o.target||"1.21.6-1.21.11",previewText:o.previewText||"TEXT",layers:o.layers||[],fallback:{...defFb(),...(o.fallback||{})}};selected=0;sync()}catch(err){alert(err.message)}e.target.value=""};
const hexOf=c=>"#"+c.map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function colorLayer(){let r=null;for(const l of state.layers){if(!l.enabled)continue;if(l.type==="gradient"&&l.colors.length)r=l;if(l.type==="rainbow")r=l}return r}
function fbEditable(){return state.fallback.custom||!colorLayer()}
function fbAutoColors(){const l=colorLayer();if(l&&l.type==="gradient")return l.colors.map(c=>c.toUpperCase());if(l&&l.type==="rainbow")return[0,1,2,3,4,5].map(i=>hexOf(hsv(i/6,l.nums.saturation,1)));return state.fallback.colors.map(c=>c.toUpperCase())}
function fbColors(){const c=fbEditable()?state.fallback.colors:fbAutoColors();return c.length?c.map(x=>x.toUpperCase()):["#FFFFFF"]}
function fbTags(){const f=state.fallback,o=[];if(f.bold)o.push("b");if(f.italic)o.push("i");if(f.underline)o.push("u");if(f.strike)o.push("st");return o}
const LEG={b:"&l",i:"&o",u:"&n",st:"&m"};
function fbPeriod(){const l=colorLayer();if(l&&l.type==="rainbow")return 4/Math.max(.01,l.nums.speed);return 2/Math.max(.01,l&&l.nums.speed||.55)}
function fbInterval(){return Math.max(1,Math.round(fbPeriod()*20/state.fallback.frames))}
function fbStops(cols,q){if(cols.length===1)return rgb(cols[0]);q=Math.max(0,Math.min(cols.length-1,q));const i=Math.min(Math.floor(q),cols.length-2);return mix(rgb(cols[i]),rgb(cols[i+1]),q-i)}
function fbChars(text,frame){const cols=fbColors(),ch=[...text],n=ch.length,F=state.fallback.frames;
 return ch.map((c,i)=>({ch:c,c:frame==null?fbStops(cols,n>1?i/(n-1)*(cols.length-1):0):palette(cols,i/Math.max(n,1)-frame/F)}))}
function fbMini(text,frame){const cols=fbColors(),tags=fbTags();let inner;
 if(frame==null)inner=cols.length>1?`<gradient:${cols.join(":")}>${text}</gradient>`:`<color:${cols[0]}>${text}</color>`;
 else inner=fbChars(text,frame).map(o=>o.ch===" "?" ":`<${hexOf(o.c)}>${o.ch}`).join("");
 return tags.map(t=>`<${t}>`).join("")+inner+tags.slice().reverse().map(t=>`</${t}>`).join("")}
function fbLegacy(text,frame){const fm=fbTags().map(t=>LEG[t]).join(""),fmt=state.fallback.underline||state.fallback.strike;
 return fbChars(text,frame).map(o=>o.ch===" "&&!fmt?" ":legacy(hexOf(o.c))+fm+o.ch).join("")}
function fbYaml(){const f=state.fallback;if(!f.enabled)return"";const cols=fbColors();
 let y=`    fallback:\n      enabled: true\n      mode: ${f.animate?"animated":"static"}\n      colors:\n`;cols.forEach(c=>y+=`        - ${yamlQ(c)}\n`);
 y+=`      formats: [${fbTags().map(t=>({b:"bold",i:"italic",u:"underline",st:"strikethrough"})[t]).join(", ")}]\n`;
 y+=`      minimessage: ${yamlQ(fbMini("%text%"))}\n`;
 if(f.animate)y+=`      cyclic: true\n      frames: ${f.frames}\n      interval-ticks: ${fbInterval()}\n`;
 return y}
function fbExportText(){const t=state.previewText||"TEXT",f=state.fallback;
 let s=`# Fallback sin texturepack - ${state.name}\n\n[MiniMessage]\n${fbMini(t)}\n\n[Legacy]\n${fbLegacy(t)}\n`;
 if(f.animate){s+=`\n# Animación: ${f.frames} frames, ${fbInterval()} ticks por frame\n`;for(let i=0;i<f.frames;i++)s+=`\n[Frame ${i+1} - MiniMessage]\n${fbMini(t,i)}\n[Frame ${i+1} - Legacy]\n${fbLegacy(t,i)}\n`}
 return s}
function renderFbColors(){const box=$("fbColors"),ed=fbEditable(),cols=ed?state.fallback.colors:fbAutoColors();
 if(!ed){const l=colorLayer();box.innerHTML=`<div class="swatches">${cols.map(c=>`<i style="background:${c}" title="${c}"></i>`).join("")}</div><div class="hint">Automático: usa los colores de la capa ${l?defs[l.type].label:"—"}.</div>`;return}
 box.innerHTML=cols.map((c,i)=>`<div class="cr"><input data-fc="${i}" type="color" value="${c.toLowerCase()}"><input data-fh="${i}" value="${c.toUpperCase()}"><button data-fr="${i}">×</button></div>`).join("")+'<button id="fbAdd" type="button">+ Color</button>';
 const f=state.fallback;
 box.querySelectorAll("[data-fc]").forEach(x=>x.oninput=()=>{const i=+x.dataset.fc;f.colors[i]=x.value.toUpperCase();box.querySelector(`[data-fh="${i}"]`).value=x.value.toUpperCase();updateOutput()});
 box.querySelectorAll("[data-fh]").forEach(x=>x.onchange=()=>{const i=+x.dataset.fh;if(/^#[0-9a-f]{6}$/i.test(x.value)){f.colors[i]=x.value.toUpperCase();box.querySelector(`[data-fc="${i}"]`).value=x.value.toLowerCase();updateOutput()}});
 box.querySelectorAll("[data-fr]").forEach(x=>x.onclick=()=>{if(f.colors.length>1){f.colors.splice(+x.dataset.fr,1);renderFbColors();updateOutput()}});
 $("fbAdd").onclick=()=>{f.colors.push("#FFFFFF");renderFbColors();updateOutput()}}
function fbSync(){const f=state.fallback,auto=!!colorLayer();
 $("fbEnabled").checked=f.enabled;$("fbBold").checked=f.bold;$("fbItalic").checked=f.italic;$("fbUnder").checked=f.underline;$("fbStrike").checked=f.strike;$("fbAnimate").checked=f.animate;$("fbFrames").value=f.frames;
 $("fbCustom").checked=fbEditable();$("fbCustom").disabled=!auto;$("fbFramesRow").classList.toggle("hidden",!f.animate);
 $("fbBody").classList.toggle("hidden",!f.enabled);renderFbColors()}
function fbUpdate(){const f=state.fallback,t=state.previewText||"TEXT";if(!fbEditable())renderFbColors();
 $("fbMini").value=fbMini(t);$("fbLegacy").value=fbLegacy(t);
 $("fbInfo").textContent=f.animate?`Animado: ${f.frames} frames, 1 frame cada ${fbInterval()} ticks (${fbInterval()*50} ms). Descarga todos los frames con «Exportar fallback».`:"Gradiente estático (como RGBirdflop).";
 fbKey=""}
let fbKey="";
function fbTick(now){const f=state.fallback,bar=$("fbBar");if(!f.enabled){bar.classList.add("hidden");return}bar.classList.remove("hidden");
 const fr=f.animate?(paused?0:Math.floor(now/(fbInterval()*50))%f.frames):null,t=state.previewText||"TEXT",tags=fbTags();
 const key=[fr,t,fbColors().join(),tags.join(),f.frames].join("|");if(key===fbKey)return;fbKey=key;
 const pv=$("fbPreview");pv.style.fontWeight=f.bold?"700":"400";pv.style.fontStyle=f.italic?"italic":"normal";
 pv.style.textDecoration=[f.underline&&"underline",f.strike&&"line-through"].filter(Boolean).join(" ")||"none";
 pv.innerHTML=fbChars(t,fr).map(o=>`<span style="color:${hexOf(o.c)}">${esc(o.ch)}</span>`).join("")}
[["fbEnabled","enabled"],["fbBold","bold"],["fbItalic","italic"],["fbUnder","underline"],["fbStrike","strike"],["fbAnimate","animate"]].forEach(([id,k])=>$(id).onchange=e=>{state.fallback[k]=e.target.checked;fbSync();updateOutput()});
$("fbCustom").onchange=e=>{const f=state.fallback;if(e.target.checked)f.colors=fbAutoColors();f.custom=e.target.checked;fbSync();updateOutput()};
$("fbFrames").onchange=e=>{state.fallback.frames=Math.max(4,Math.min(60,Math.round(+e.target.value)||16));fbSync();updateOutput()};
$("copyFbMini").onclick=()=>navigator.clipboard.writeText($("fbMini").value);$("copyFbLegacy").onclick=()=>navigator.clipboard.writeText($("fbLegacy").value);
$("exportFb").onclick=()=>download(`${state.id}-fallback.txt`,fbExportText());
renderPalette();sync();
})();