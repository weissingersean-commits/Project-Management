const SHIPMENT_STATUSES=[
  {id:"pending",label:"Pending",color:"#9CA3AF"},
  {id:"in_transit",label:"In Transit",color:"#3B82F6"},
  {id:"delivered",label:"Delivered",color:"#059669"},
];

function renderShipments(job){
  const jid=job.id;const shipments=job.shipments||[];
  const container=h("div",null);

  shipments.forEach((sh,idx)=>{
    const st=SHIPMENT_STATUSES.find(s=>s.id===sh.status)||SHIPMENT_STATUSES[0];
    const isEditing=S.editingShipment[jid]===idx;

    if(isEditing){
      const f=S.shipmentForms[jid]||{...sh};
      const sF=(k,v)=>{S.shipmentForms[jid]={...(S.shipmentForms[jid]||sh),[k]:v};render()};
      const card=h("div",{style:{background:"#F9F9F7",border:"1px solid var(--line)",borderRadius:"8px",padding:"12px",marginBottom:"8px"}});
      const r1=h("div",{className:"grid2"});
      const nw=h("div",null);nw.appendChild(h("label",{className:"lbl"},"Shipment Name"));nw.appendChild(h("input",{className:"inp",value:f.name||"",onInput:e=>sF("name",e.target.value)}));r1.appendChild(nw);
      const sw=h("div",null);sw.appendChild(h("label",{className:"lbl"},"Status"));
      const sel=h("select",{className:"inp",style:{cursor:"pointer"},onChange:e=>sF("status",e.target.value)});
      SHIPMENT_STATUSES.forEach(s=>{const o=h("option",{value:s.id},s.label);if((f.status||"pending")===s.id)o.selected=true;sel.appendChild(o)});
      sw.appendChild(sel);r1.appendChild(sw);card.appendChild(r1);
      const r2=h("div",{className:"grid2",style:{marginTop:"6px"}});
      const cw=h("div",null);cw.appendChild(h("label",{className:"lbl"},"Carrier"));cw.appendChild(h("input",{className:"inp",placeholder:"UPS, FedEx...",value:f.carrier||"",onInput:e=>sF("carrier",e.target.value)}));r2.appendChild(cw);
      const tw=h("div",null);tw.appendChild(h("label",{className:"lbl"},"Tracking #"));tw.appendChild(h("input",{className:"inp",placeholder:"1Z999AA10123456784",value:f.tracking||"",onInput:e=>sF("tracking",e.target.value)}));r2.appendChild(tw);card.appendChild(r2);
      const r3=h("div",{className:"grid2",style:{marginTop:"6px"}});
      const ew=h("div",null);ew.appendChild(h("label",{className:"lbl"},"ETA Date"));ew.appendChild(h("input",{className:"inp",type:"date",value:f.etaDate||"",onInput:e=>sF("etaDate",e.target.value)}));r3.appendChild(ew);
      const nt=h("div",null);nt.appendChild(h("label",{className:"lbl"},"Contents / Notes"));nt.appendChild(h("input",{className:"inp",placeholder:"What's in this shipment...",value:f.notes||"",onInput:e=>sF("notes",e.target.value)}));r3.appendChild(nt);card.appendChild(r3);
      const acts=h("div",{style:{display:"flex",gap:"6px",marginTop:"10px"}});
      acts.appendChild(h("button",{className:"btn-sm btn-dark",onClick:()=>{const upd=[...shipments];upd[idx]={...upd[idx],...S.shipmentForms[jid]};updJob(jid,{shipments:upd});delete S.editingShipment[jid];delete S.shipmentForms[jid]}},"Save"));
      acts.appendChild(h("button",{className:"btn-sm btn-ghost",onClick:()=>{delete S.editingShipment[jid];delete S.shipmentForms[jid];render()}},"Cancel"));
      acts.appendChild(h("button",{className:"btn-sm",style:{background:"#FEE2E2",color:"var(--danger)"},onClick:()=>{if(!confirm("Remove this shipment?"))return;updJob(jid,{shipments:shipments.filter((_,i)=>i!==idx)});delete S.editingShipment[jid];delete S.shipmentForms[jid]}},"Delete"));
      card.appendChild(acts);container.appendChild(card);
    }else{
      const isLate=sh.etaDate&&sh.status==="in_transit"&&dL(sh.etaDate)<0;
      const card=h("div",{style:{background:"#fff",border:"1px solid "+(isLate?"#FECACA":"var(--line)"),borderLeft:"3px solid "+st.color,borderRadius:"8px",padding:"10px 12px",marginBottom:"8px",cursor:"pointer"},onClick:()=>{S.editingShipment[jid]=idx;S.shipmentForms[jid]={...sh};render()}});
      const top=h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}});
      top.appendChild(h("div",{style:{fontWeight:"700",fontSize:"13px",color:"#111"}},sh.name||"Unnamed Shipment"));
      top.appendChild(h("span",{style:{fontSize:"10px",fontWeight:"700",padding:"2px 7px",borderRadius:"4px",background:st.color+"18",color:st.color}},st.label));
      card.appendChild(top);
      const meta=[];if(sh.carrier)meta.push(sh.carrier);if(sh.tracking)meta.push("📦 "+sh.tracking);if(sh.etaDate)meta.push((isLate?"⚠ LATE — ETA: ":"ETA: ")+sh.etaDate);
      if(meta.length)card.appendChild(h("div",{style:{fontSize:"12px",color:isLate?"var(--danger)":"var(--ink3)",marginTop:"4px"}},meta.join("  ·  ")));
      if(sh.notes)card.appendChild(h("div",{style:{fontSize:"12px",color:"var(--ink3)",marginTop:"3px",fontStyle:"italic"}},sh.notes));
      container.appendChild(card);
    }
  });

  if(S.addingShipment[jid]){
    const f=S.shipmentForms[jid]||{name:"",carrier:"",tracking:"",etaDate:"",status:"pending",notes:""};
    const sF=(k,v)=>{S.shipmentForms[jid]={...(S.shipmentForms[jid]||{}),[k]:v};render()};
    const form=h("div",{style:{background:"#F9F9F7",border:"1px solid var(--line)",borderRadius:"8px",padding:"12px",marginTop:"4px"}});
    form.appendChild(h("div",{style:{fontWeight:"700",fontSize:"12px",color:"#555",marginBottom:"8px"}},"New Shipment"));
    const nw=h("div",null);nw.appendChild(h("label",{className:"lbl"},"Shipment Name"));nw.appendChild(h("input",{className:"inp",placeholder:"e.g. Shipment 1 — Cable & Field Sensors",value:f.name||"",onInput:e=>sF("name",e.target.value)}));form.appendChild(nw);
    const r2=h("div",{className:"grid2",style:{marginTop:"6px"}});
    const cw=h("div",null);cw.appendChild(h("label",{className:"lbl"},"Carrier"));cw.appendChild(h("input",{className:"inp",placeholder:"UPS, FedEx...",value:f.carrier||"",onInput:e=>sF("carrier",e.target.value)}));r2.appendChild(cw);
    const tw=h("div",null);tw.appendChild(h("label",{className:"lbl"},"Tracking #"));tw.appendChild(h("input",{className:"inp",placeholder:"1Z999AA10123456784",value:f.tracking||"",onInput:e=>sF("tracking",e.target.value)}));r2.appendChild(tw);form.appendChild(r2);
    const r3=h("div",{className:"grid2",style:{marginTop:"6px"}});
    const ew=h("div",null);ew.appendChild(h("label",{className:"lbl"},"ETA Date"));ew.appendChild(h("input",{className:"inp",type:"date",value:f.etaDate||"",onInput:e=>sF("etaDate",e.target.value)}));r3.appendChild(ew);
    const sw2=h("div",null);sw2.appendChild(h("label",{className:"lbl"},"Status"));
    const sel2=h("select",{className:"inp",style:{cursor:"pointer"},onChange:e=>sF("status",e.target.value)});
    SHIPMENT_STATUSES.forEach(s=>{const o=h("option",{value:s.id},s.label);if((f.status||"pending")===s.id)o.selected=true;sel2.appendChild(o)});
    sw2.appendChild(sel2);r3.appendChild(sw2);form.appendChild(r3);
    const nt=h("div",{style:{marginTop:"6px"}});nt.appendChild(h("label",{className:"lbl"},"Contents / Notes"));nt.appendChild(h("input",{className:"inp",placeholder:"Cable, sensors, enclosure...",value:f.notes||"",onInput:e=>sF("notes",e.target.value)}));form.appendChild(nt);
    const acts=h("div",{style:{display:"flex",gap:"6px",marginTop:"10px"}});
    acts.appendChild(h("button",{className:"btn-sm btn-dark",onClick:()=>{if(!(f.name||"").trim())return;const newSh={id:uid(),name:f.name,carrier:f.carrier||"",tracking:f.tracking||"",etaDate:f.etaDate||"",status:f.status||"pending",notes:f.notes||""};updJob(jid,{shipments:[...shipments,newSh]});S.addingShipment[jid]=false;delete S.shipmentForms[jid]}},"Add Shipment"));
    acts.appendChild(h("button",{className:"btn-sm btn-ghost",onClick:()=>{S.addingShipment[jid]=false;delete S.shipmentForms[jid];render()}},"Cancel"));
    form.appendChild(acts);container.appendChild(form);
  }else{
    container.appendChild(h("button",{style:{marginTop:"6px",width:"100%",padding:"7px",borderRadius:"7px",border:"1px dashed var(--line)",background:"transparent",fontSize:"12px",fontWeight:"700",color:"var(--ink3)",cursor:"pointer"},onClick:()=>{S.addingShipment[jid]=true;S.shipmentForms[jid]={name:"",carrier:"",tracking:"",etaDate:"",status:"pending",notes:""};render()}},"+ Add Shipment"));
  }

  return container;
}
