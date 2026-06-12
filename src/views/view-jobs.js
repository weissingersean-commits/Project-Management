function renderCard(job){
  const phase=PHASES.find(p=>p.id===job.phase)||PHASES[0];const u=urg(job.due,job.phase),uc=UC[u],lbl=urgLbl(job.due,job.phase);
  const isOpen=S.expanded[job.id];const tab=S.tabs[job.id]||"tasks";
  const tasks=job.tasks||[],parts=job.parts||[],docs=job.docs||[],shipments=job.shipments||[];
  const tD=tasks.filter(t=>t.done).length,pW=parts.filter(p=>p.status!=="received").length,dO=docs.filter(d=>d.status!=="approved").length;
  const pL=parts.filter(p=>p.etaDate&&(p.status==="ordered"||p.status==="shipped")&&dL(p.etaDate)<0).length;
  const sIT=shipments.filter(s=>s.status==="in_transit").length;
  const counts=[tasks.length>0&&tD+"/"+tasks.length+" tasks",pW>0&&pW+" parts waiting",sIT>0&&sIT+" shipment"+(sIT>1?"s":"")+" in transit",dO>0&&dO+" docs open"].filter(Boolean);
  const bc=u==="overdue"?"#EF4444":u==="hot"?"#F59E0B":phase.color;

  const card=h("div",{className:"jc fi",style:{borderLeft:"4px solid "+bc,boxShadow:u==="overdue"?"0 1px 8px rgba(220,38,38,.08)":"0 1px 3px rgba(0,0,0,.04)"}},
    h("div",{className:"jc-head",onClick:()=>{S.expanded[job.id]=!isOpen;render()}},
      h("div",{style:{display:"flex",alignItems:"flex-start",gap:"10px"}},
        h("div",{style:{flex:"1",minWidth:"0"}},
          h("div",{className:"jc-name"},job.name),
          h("div",{className:"jc-meta"},[job.client,job.vesselName&&("⚓ "+job.vesselName),job.vesselType&&("("+job.vesselType+")")].filter(Boolean).join(" · ")),
          (job.poNumber||job.alarmPoints)?h("div",{className:"jc-meta",style:{marginTop:"1px"}},[job.poNumber&&("PO: "+job.poNumber),job.alarmPoints&&(job.alarmPoints+" pts")].filter(Boolean).join(" · ")):null,
          h("div",{className:"jc-badges"},
            h("span",{className:"badge",style:{background:phase.color+"14",color:phase.color}},phase.label),
            lbl?h("span",{className:"badge",style:{background:uc.bg,color:uc.c,border:"1px solid "+uc.br,animation:u==="overdue"?"pulse 1.5s ease-in-out infinite":"none"}},(u==="overdue"?"⚠ ":"")+lbl):null,
            pL>0?h("span",{style:{fontSize:"10px",fontWeight:"700",color:"var(--danger)"}},"📦 "+pL+" late"):null,
            job.value?h("span",{style:{fontSize:"11px",color:"#aaa",fontWeight:"600"}},"$"+parseFloat(job.value).toLocaleString()):null,
          ),
          counts.length?h("div",{className:"jc-counts"},counts.join(" · ")):null,
        ),
        h("span",{style:{fontSize:"14px",color:"#ccc",marginTop:"2px"}},isOpen?"▾":"▸"),
      ),
    ),
  );
  if(!isOpen)return card;

  const body=h("div",{className:"jc-body fi"});
  if(job.scope)body.appendChild(h("div",{className:"jc-notes"},h("strong",null,"Scope: "),job.scope));
  if(job.notes)body.appendChild(h("div",{className:"jc-notes"},job.notes));
  const dates=[job.startDate&&("Start: "+job.startDate),job.dockDate&&("Dock: "+job.dockDate),job.seaTrialDate&&("Sea Trial: "+job.seaTrialDate)].filter(Boolean);
  if(dates.length)body.appendChild(h("div",{style:{fontSize:"12px",color:"var(--ink3)",margin:"6px 0",display:"flex",gap:"12px",flexWrap:"wrap"}},...dates.map(d=>h("span",null,"📅 "+d))));

  const pRow=h("div",{className:"ph-row"});
  PHASES.forEach(p=>{
    pRow.appendChild(h("button",{className:"ph-btn",style:job.phase===p.id?{borderColor:p.color,borderWidth:"2px",background:p.color+"14",color:p.color}:{},onClick:()=>{
      if(p.id!==job.phase&&p.id!=="complete"){
        const existing=tasks.map(t=>t.text.toLowerCase());
        const nt=(PHASE_CHECKLISTS[p.id]||[]).filter(t=>!existing.includes(t.toLowerCase())).map(t=>({text:t,done:false,id:uid(),phase:p.id}));
        if(nt.length>0&&confirm("Add "+nt.length+" starter tasks for "+p.label+"?")){updJob(job.id,{phase:p.id,tasks:[...tasks,...nt]});return}
      }
      updJob(job.id,{phase:p.id});
    }},p.label));
  });
  body.appendChild(pRow);

  const tabRow=h("div",{className:"tabs"});
  [["tasks","Tasks ("+tasks.length+")"],["parts","Materials ("+parts.length+")"],["shipments","Shipments ("+shipments.length+")"],["docs","Docs ("+docs.length+")"]].forEach(([id,l])=>{
    tabRow.appendChild(h("button",{className:"tab"+(tab===id?" on":""),onClick:()=>{S.tabs[job.id]=id;render()}},l));
  });
  body.appendChild(tabRow);
  const tc=h("div",{style:{marginTop:"10px"}});
  if(tab==="tasks")tc.appendChild(renderTasks(job));else if(tab==="parts")tc.appendChild(renderParts(job));else if(tab==="shipments")tc.appendChild(renderShipments(job));else tc.appendChild(renderDocs(job));
  body.appendChild(tc);
  body.appendChild(h("div",{className:"acts-row"},
    h("button",{className:"btn-ghost",style:{flex:"1"},onClick:()=>set({editing:{...job}})},"✏️ Edit Job"),
    h("button",{className:"btn-ghost",onClick:()=>{S.expanded[job.id]=false;render()}},"▲ Collapse"),
    h("button",{style:{padding:"8px 14px",background:"#FEE2E2",color:"var(--danger)",borderRadius:"8px",border:"none",fontSize:"13px",fontWeight:"600"},onClick:()=>{if(confirm("Delete this job?"))delJob(job.id)}},"🗑"),
  ));
  card.appendChild(body);return card;
}

function renderJobsView(app){
  const sb=h("div",{className:"sbar"});
  sb.appendChild(h("input",{placeholder:"Search jobs, clients, vessels, PO#...",value:S.search,onInput:e=>{S.search=e.target.value;render()}}));
  app.appendChild(sb);

  const fl=h("div",{className:"filts"});
  fl.appendChild(h("button",{className:"fbtn"+(S.filter==="all"?" on":""),onClick:()=>{S.filter="all";render()}},"All ("+S.jobs.length+")"));
  PHASES.forEach(p=>{
    const c=S.jobs.filter(j=>j.phase===p.id).length;
    fl.appendChild(h("button",{className:"fbtn"+(S.filter===p.id?" on":""),style:S.filter===p.id?{background:p.color+"18",color:p.color}:{},onClick:()=>{S.filter=p.id;render()}},p.label+" ("+c+")"));
  });
  app.appendChild(fl);

  let filtered=S.jobs.filter(j=>{
    if(S.filter!=="all"&&j.phase!==S.filter)return false;
    if(S.search){const s=S.search.toLowerCase();return[j.name,j.client,j.vesselName,j.poNumber].some(f=>(f||"").toLowerCase().includes(s))}return true;
  });
  const pO={overdue:0,hot:1,soon:2,ok:3,none:4,done:5};
  filtered.sort((a,b)=>{const ua=pO[urg(a.due,a.phase)]??5,ub=pO[urg(b.due,b.phase)]??5;if(ua!==ub)return ua-ub;if(a.due&&b.due)return a.due.localeCompare(b.due);return a.due?-1:1});

  const list=h("div",{className:"jlist"});
  if(!filtered.length)list.appendChild(h("div",{className:"empty"},h("div",{className:"empty-i"},S.jobs.length?"🔍":"⚓"),h("div",{className:"empty-t"},S.jobs.length?"No matches":"No jobs yet"),!S.jobs.length?h("div",{style:{fontSize:"13px",marginTop:"4px",color:"#ccc"}},"Tap '+ New Job' to get started"):null));
  filtered.forEach(j=>list.appendChild(renderCard(j)));
  app.appendChild(list);
}
