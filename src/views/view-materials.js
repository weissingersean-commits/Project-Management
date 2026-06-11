function renderMats(){
  const allP=S.jobs.flatMap(j=>(j.parts||[]).map(p=>({...p,jobName:j.name})));const container=h("div",{style:{padding:"14px"}});
  const pLate=allP.filter(p=>p.etaDate&&(p.status==="ordered"||p.status==="shipped")&&dL(p.etaDate)<0);
  if(pLate.length){
    const al=h("div",{style:{padding:"9px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:"8px",marginBottom:"12px"}},h("div",{style:{fontSize:"12px",fontWeight:"700",color:"var(--danger)",marginBottom:"4px"}},"🚨 "+pLate.length+" past ETA"));
    pLate.forEach(p=>al.appendChild(h("div",{style:{fontSize:"12px",color:"#991B1B",padding:"1px 0"}},h("strong",null,p.name)," — "+p.jobName+" · "+Math.abs(dL(p.etaDate))+"d late")));
    container.appendChild(al);
  }
  PART_STATUSES.forEach(st=>{
    const items=allP.filter(p=>p.status===st.id);if(!items.length)return;
    const sec=h("div",{className:"mat-s"},h("div",{className:"mat-h",style:{color:st.color}},st.dot+" "+st.label+" ("+items.length+")"));
    items.forEach(p=>{const pD=PHASES.find(ph=>ph.id===p.phase);
      sec.appendChild(h("div",{className:"mat-c",style:{borderLeft:"3px solid "+st.color}},
        h("div",{style:{display:"flex",justifyContent:"space-between"}},
          h("div",null,h("span",{style:{fontSize:"13px",fontWeight:"700",color:"var(--ink)"}},p.name+(p.qty>1?" ×"+p.qty:"")),pD?h("span",{className:"ph-tag",style:{background:pD.color+"14",color:pD.color}},pD.label):null),
          h("div",{style:{fontSize:"10px",color:"#aaa",fontWeight:"600",textAlign:"right"}},"⚓ "+p.jobName),
        ),
        h("div",{style:{fontSize:"11px",color:"#888",marginTop:"2px"}},(p.supplier||"")+(p.etaDate?" · ETA "+p.etaDate:"")+(p.tracking?" · 📍"+p.tracking:"")),
      ));
    });container.appendChild(sec);
  });
  if(!allP.length)container.appendChild(h("div",{className:"empty"},h("div",{className:"empty-i"},"📦"),h("div",{className:"empty-t"},"No materials tracked yet")));
  return container;
}
