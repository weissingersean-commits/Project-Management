function renderModal(){
  if(!S.editing)return null;
  const j=S.editing;const isE=!!j.id;
  const ov=h("div",{className:"mo",onClick:e=>{if(e.target===ov)set({editing:null})}});
  const box=h("div",{className:"mo-box fi"});
  box.appendChild(h("div",{className:"mo-hdr"},h("h2",null,isE?"Edit Job":"New Job"),h("button",{className:"mo-x",onClick:()=>set({editing:null})},"×")));
  const frm=h("div",{style:{display:"grid",gap:"10px"}});

  frm.appendChild(h("div",{className:"section-lbl"},"⚓ Vessel & Client"));
  let r=h("div",{className:"grid2"});
  r.appendChild(mkF("Vessel Name","vesselName",j,"M/V Gulf Runner",true));
  r.appendChild(mkSel("Vessel Type","vesselType",j,VESSEL_TYPES.map(v=>({v,l:v})),j.vesselType||"Tugboat"));
  frm.appendChild(r);
  r=h("div",{className:"grid2"});
  r.appendChild(mkF("Client / Company","client",j,"",true));
  r.appendChild(mkF("IMO / Hull #","imo",j,""));
  frm.appendChild(r);

  frm.appendChild(h("div",{className:"section-lbl"},"📋 Job Details"));
  frm.appendChild(mkF("Job / Project Name","name",j,"e.g. Engine Room Alarm Panel Replacement",true));
  const sw=h("div",null);sw.appendChild(h("label",{className:"lbl req"},"Scope of Work"));
  sw.appendChild(h("textarea",{className:"inp",rows:"3",style:{resize:"vertical"},value:j.scope||"",placeholder:"Describe the work: number of alarm points, new install vs retrofit, any special requirements (class society, shutdown circuits, remote panels)...",onInput:e=>{S.editing={...S.editing,scope:e.target.value}}}));
  frm.appendChild(sw);
  r=h("div",{className:"grid2"});
  r.appendChild(mkF("PO / Contract #","poNumber",j,""));
  r.appendChild(mkF("Alarm Point Count","alarmPoints",j,"e.g. 24",false,"number"));
  frm.appendChild(r);
  r=h("div",{className:"grid2"});
  r.appendChild(mkF("Est. Value ($)","value",j,""));
  r.appendChild(mkSel("Starting Phase","phase",j,PHASES.map(p=>({v:p.id,l:p.label})),j.phase||"design"));
  frm.appendChild(r);

  frm.appendChild(h("div",{className:"section-lbl"},"📅 Schedule"));
  r=h("div",{className:"grid2"});
  r.appendChild(mkF("Start Date","startDate",j,"",false,"date"));
  r.appendChild(mkF("Due Date","due",j,"",true,"date"));
  frm.appendChild(r);
  r=h("div",{className:"grid2"});
  r.appendChild(mkF("Dock Date","dockDate",j,"",false,"date"));
  r.appendChild(mkF("Sea Trial Date","seaTrialDate",j,"",false,"date"));
  frm.appendChild(r);

  const nw=h("div",null);nw.appendChild(h("label",{className:"lbl"},"Additional Notes"));
  nw.appendChild(h("textarea",{className:"inp",rows:"2",style:{resize:"vertical"},value:j.notes||"",placeholder:"Special instructions, contacts, location...",onInput:e=>{S.editing={...S.editing,notes:e.target.value}}}));
  frm.appendChild(nw);

  if(!isE)frm.appendChild(h("div",{style:{padding:"10px 12px",background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:"8px",fontSize:"12px",color:"#1D4ED8",fontWeight:"600",marginTop:"4px"}},"💡 A starter checklist will be loaded based on the starting phase. You can edit, add, or remove tasks after creating the job."));

  box.appendChild(frm);
  box.appendChild(h("div",{className:"mo-foot"},
    h("button",{className:"btn-outline",onClick:()=>set({editing:null})},"Cancel"),
    h("button",{className:"btn-dark",style:{fontWeight:"700",opacity:(j.name||"").trim()&&(j.vesselName||"").trim()?"1":"0.35"},onClick:()=>{
      const f=S.editing;if(!(f.name||"").trim()||!(f.vesselName||"").trim())return;
      if(f.id){S.jobs=S.jobs.map(j2=>j2.id===f.id?{...j2,...f}:j2)}
      else{const ph=f.phase||"design";const st=(PHASE_CHECKLISTS[ph]||[]).map(t=>({text:t,done:false,id:uid(),phase:ph}));const defSh=[{id:uid(),name:"Shipment 1 — Cable & Field Sensors",carrier:"",tracking:"",etaDate:"",status:"pending",notes:"Cable, conduit, field sensors, terminal blocks"},{id:uid(),name:"Shipment 2 — MAS Enclosure & HMIs",carrier:"",tracking:"",etaDate:"",status:"pending",notes:"Main alarm panel enclosure, HMI displays, power supplies"}];S.jobs.push({...f,phase:ph,id:uid(),tasks:st,parts:[],docs:[],shipments:defSh,createdAt:new Date().toISOString()})}
      S.editing=null;persist();
    }},isE?"Save Changes":"Create Job"),
  ));
  ov.appendChild(box);return ov;
}

function mkF(label,key,job,ph,req,type){
  const w=h("div",null);w.appendChild(h("label",{className:"lbl"+(req?" req":"")},label));
  w.appendChild(h("input",{className:"inp",type:type||"text",value:job[key]||"",placeholder:ph||"",onInput:e=>{S.editing={...S.editing,[key]:e.target.value}}}));return w;
}

function mkSel(label,key,job,opts,def){
  const w=h("div",null);w.appendChild(h("label",{className:"lbl"},label));
  const sel=h("select",{className:"inp",style:{cursor:"pointer"},onChange:e=>{S.editing={...S.editing,[key]:e.target.value}}});
  opts.forEach(o=>{const op=h("option",{value:o.v},o.l);if((job[key]||def)===o.v)op.selected=true;sel.appendChild(op)});
  w.appendChild(sel);return w;
}
