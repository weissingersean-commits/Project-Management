function renderParts(job){
  const parts=job.parts||[];const jid=job.id;const container=h("div",null);
  const late=parts.filter(p=>p.etaDate&&(p.status==="ordered"||p.status==="shipped")&&dL(p.etaDate)<0);
  if(late.length)container.appendChild(h("div",{style:{padding:"6px 10px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:"7px",marginBottom:"8px",fontSize:"11px",fontWeight:"700",color:"var(--danger)"}},"⚠ "+late.length+" past ETA: "+late.map(p=>p.name).join(", ")));

  const grouped={};parts.forEach((p,i)=>{const ph=p.phase||"general";if(!grouped[ph])grouped[ph]=[];grouped[ph].push({...p,idx:i})});
  [...PHASES.map(p=>p.id),"general"].forEach(phId=>{
    const items=grouped[phId];if(!items||!items.length)return;
    const pD=PHASES.find(p=>p.id===phId);
    container.appendChild(h("div",{className:"section-lbl"},h("span",{style:{color:pD?pD.color:"#888"}},pD?pD.label:"General")));
    items.forEach(p=>{
      const ps=PART_STATUSES.find(s=>s.id===p.status)||PART_STATUSES[0];
      const eta=dL(p.etaDate);const isLate=p.etaDate&&(p.status==="ordered"||p.status==="shipped")&&eta!==null&&eta<0;
      container.appendChild(h("div",{className:"pr"},
        h("span",{style:{fontSize:"12px"}},ps.dot),
        h("div",{style:{flex:"1",minWidth:"0"}},
          h("div",null,h("span",{style:{fontSize:"13px",fontWeight:"700",color:"var(--ink)"}},p.name+(p.qty>1?" ×"+p.qty:"")),p.partNumber?h("span",{style:{fontWeight:"400",color:"#aaa",marginLeft:"6px"}},"#"+p.partNumber):null),
          h("div",{style:{fontSize:"11px",color:isLate?"var(--danger)":"#888",fontWeight:isLate?"700":"400"}},(p.supplier||"")+(p.etaDate?" · ETA "+p.etaDate+(isLate?" ("+Math.abs(eta)+"d late)":eta!==null?" ("+eta+"d)":""):"")+(p.tracking?" · 📍"+p.tracking:"")),
        ),
        (()=>{const sel=h("select",{className:"pr-sel",style:{color:ps.color},onChange:e=>{const up=[...parts];up[p.idx]={...parts[p.idx],status:e.target.value};updJob(jid,{parts:up})}});PART_STATUSES.forEach(s=>{const o=h("option",{value:s.id},s.label);if(s.id===p.status)o.selected=true;sel.appendChild(o)});return sel})(),
        h("button",{style:{background:"none",border:"none",cursor:"pointer",fontSize:"12px",color:"#bbb"},onClick:()=>{S.editingPart[jid]=p.idx;S.partForms[jid]={...parts[p.idx]};S.addingPart[jid]=true;render()}},"✏️"),
        h("button",{className:"ck-x",onClick:()=>updJob(jid,{parts:parts.filter((_,j)=>j!==p.idx)})},"×"),
      ));
    });
  });

  if(S.addingPart[jid]){
    const f=S.partForms[jid]||{name:"",partNumber:"",supplier:"",qty:1,status:"needed",orderDate:"",etaDate:"",tracking:"",notes:"",phase:job.phase};
    const isEdit=S.editingPart[jid]!==undefined&&S.editingPart[jid]!==null;
    const sF=(k,v)=>{S.partForms[jid]={...(S.partForms[jid]||f),[k]:v}};
    const form=h("div",{className:"iform fi"},
      h("div",{className:"grid2"},
        h("div",{className:"full"},h("label",{className:"lbl req"},"Part / Component"),h("input",{className:"inp",value:f.name,placeholder:"e.g. Low Oil Pressure Switch - Murphy ES2P",onInput:e=>sF("name",e.target.value)})),
        h("div",null,h("label",{className:"lbl"},"Part #"),h("input",{className:"inp",value:f.partNumber,onInput:e=>sF("partNumber",e.target.value)})),
        h("div",null,h("label",{className:"lbl"},"Qty"),h("input",{className:"inp",type:"number",min:"1",value:""+f.qty,onInput:e=>sF("qty",parseInt(e.target.value)||1)})),
        h("div",null,h("label",{className:"lbl"},"Supplier"),h("input",{className:"inp",value:f.supplier,onInput:e=>sF("supplier",e.target.value)})),
        h("div",null,h("label",{className:"lbl"},"For Phase"),(()=>{const sel=h("select",{className:"inp",onInput:e=>sF("phase",e.target.value)});PHASES.forEach(p=>{const o=h("option",{value:p.id},p.label);if((f.phase||job.phase)===p.id)o.selected=true;sel.appendChild(o)});sel.appendChild(h("option",{value:"general"},"General"));return sel})()),
        h("div",null,h("label",{className:"lbl"},"Status"),(()=>{const sel=h("select",{className:"inp",onInput:e=>sF("status",e.target.value)});PART_STATUSES.forEach(s=>{const o=h("option",{value:s.id},s.label);if(s.id===f.status)o.selected=true;sel.appendChild(o)});return sel})()),
        h("div",null,h("label",{className:"lbl"},"Order Date"),h("input",{className:"inp",type:"date",value:f.orderDate,onInput:e=>sF("orderDate",e.target.value)})),
        h("div",null,h("label",{className:"lbl"},"ETA Date"),h("input",{className:"inp",type:"date",value:f.etaDate,onInput:e=>sF("etaDate",e.target.value)})),
        h("div",{className:"full"},h("label",{className:"lbl"},"Tracking #"),h("input",{className:"inp",value:f.tracking,onInput:e=>sF("tracking",e.target.value)})),
        h("div",{className:"full"},h("label",{className:"lbl"},"Notes"),h("input",{className:"inp",value:f.notes,placeholder:"Lead time, alternates, specs...",onInput:e=>sF("notes",e.target.value)})),
      ),
      h("div",{className:"iform-acts"},
        h("button",{className:"btn-sm btn-outline",onClick:()=>{delete S.addingPart[jid];delete S.editingPart[jid];render()}},"Cancel"),
        h("button",{className:"btn-sm btn-dark",style:{opacity:(S.partForms[jid]&&S.partForms[jid].name||"").trim()?"1":"0.35"},onClick:()=>{
          const fd=S.partForms[jid];if(!fd||!fd.name.trim())return;let up;
          if(isEdit){up=[...parts];up[S.editingPart[jid]]={...fd}}else{up=[...parts,{...fd,id:uid()}]}
          delete S.addingPart[jid];delete S.editingPart[jid];delete S.partForms[jid];updJob(jid,{parts:up});
        }},isEdit?"Update":"Add Part"),
      ),
    );container.appendChild(form);
  }else{
    container.appendChild(h("button",{className:"btn-sm btn-ghost",style:{marginTop:"8px",width:"100%"},onClick:()=>{S.addingPart[jid]=true;S.partForms[jid]={name:"",partNumber:"",supplier:"",qty:1,status:"needed",orderDate:"",etaDate:"",tracking:"",notes:"",phase:job.phase};delete S.editingPart[jid];render()}},"+ Add Part / Material"));
  }
  return container;
}
