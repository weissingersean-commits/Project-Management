function renderTasks(job){
  const tasks=job.tasks||[];const container=h("div",null);
  const grouped={};tasks.forEach((t,i)=>{const ph=t.phase||"other";if(!grouped[ph])grouped[ph]=[];grouped[ph].push({...t,idx:i})});
  const order=[...PHASES.map(p=>p.id),"other"];
  order.forEach(phId=>{
    const items=grouped[phId];if(!items||!items.length)return;
    const pD=PHASES.find(p=>p.id===phId);const dc=items.filter(t=>t.done).length;
    container.appendChild(h("div",{className:"section-lbl"},h("span",{style:{color:pD?pD.color:"#888"}},pD?pD.label:"Other"),h("span",{className:"cnt"},dc+"/"+items.length)));
    items.forEach(t=>{
      container.appendChild(h("div",{className:"ck"},
        h("input",{type:"checkbox",checked:t.done,onChange:()=>{const up=[...tasks];up[t.idx]={...tasks[t.idx],done:!t.done};updJob(job.id,{tasks:up})}}),
        h("span",{className:"ck-t"+(t.done?" done":"")},t.text),
        h("button",{className:"ck-x",onClick:()=>updJob(job.id,{tasks:tasks.filter((_,j)=>j!==t.idx)})},"×"),
      ));
    });
  });
  const addRow=h("div",{style:{display:"flex",gap:"6px",marginTop:"8px",alignItems:"center"}});
  const phSel=h("select",{className:"inp",style:{width:"auto",minWidth:"100px",fontSize:"12px"}});
  PHASES.filter(p=>p.id!=="complete").forEach(p=>{const o=h("option",{value:p.id},p.label);if(p.id===job.phase)o.selected=true;phSel.appendChild(o)});
  phSel.appendChild(h("option",{value:"other"},"Other"));
  const inp=h("input",{className:"inp",placeholder:"Add task...",style:{flex:"1"}});
  const btn=h("button",{className:"btn-sm btn-dark",onClick:()=>{if(!inp.value.trim())return;updJob(job.id,{tasks:[...tasks,{text:inp.value.trim(),done:false,id:uid(),phase:phSel.value}]});inp.value=""}},"+");
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")btn.click()});
  addRow.append(phSel,inp,btn);container.appendChild(addRow);

  const missing=PHASES.filter(p=>p.id!=="complete"&&!(grouped[p.id]&&grouped[p.id].length>0));
  if(missing.length>0){
    container.appendChild(h("div",{style:{marginTop:"10px",display:"flex",gap:"4px",flexWrap:"wrap",alignItems:"center"}},
      h("span",{style:{fontSize:"11px",color:"var(--ink3)"}},"Load checklist:"),
      ...missing.map(p=>h("button",{className:"btn-sm",style:{background:p.color+"14",color:p.color,fontSize:"10px"},onClick:()=>{
        const nt=(PHASE_CHECKLISTS[p.id]||[]).map(t=>({text:t,done:false,id:uid(),phase:p.id}));updJob(job.id,{tasks:[...tasks,...nt]});
      }},p.label)),
    ));
  }
  return container;
}
