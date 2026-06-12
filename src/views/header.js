function renderHeader(){
  const{jobs,view}=S;
  const active=jobs.filter(j=>j.phase!=="complete");
  const overdue=active.filter(j=>urg(j.due,j.phase)==="overdue");
  const hot=active.filter(j=>urg(j.due,j.phase)==="hot");
  const allP=jobs.flatMap(j=>(j.parts||[]));
  const pN=allP.filter(p=>p.status==="needed");
  const pL=allP.filter(p=>p.etaDate&&(p.status==="ordered"||p.status==="shipped")&&dL(p.etaDate)<0);
  const allSh=jobs.flatMap(j=>(j.shipments||[]).map(s=>({...s,jobName:j.name})));
  const shLate=allSh.filter(s=>s.etaDate&&s.status==="in_transit"&&dL(s.etaDate)<0);

  const alertCount=overdue.length+shLate.length+pL.length;

  const nav=[
    ["dashboard","Dashboard"],
    ["jobs","Jobs"],
    ["materials","Materials"],
    ["settings","Settings"],
  ];

  const hdr=h("div",{className:"hdr"},
    h("div",{className:"hdr-row"},
      h("div",null,
        h("div",{className:"hdr-sub"},S.settings.company.name||"Marine Alarm Systems"),
        h("h1",null,"Job Manager"),
      ),
      h("div",{style:{display:"flex",gap:"8px",alignItems:"center"}},
        h("button",{className:"bell-btn",onClick:()=>{S.showNotifications=!S.showNotifications;render()},title:"Notifications"},
          "🔔",
          alertCount>0?h("span",{className:"bell-badge"},""+alertCount):null,
        ),
        view!=="settings"?h("button",{className:"btn-add",onClick:()=>set({editing:{},view:"jobs"})},"+ New Job"):null,
      ),
    ),
    h("div",{className:"stats"},
      ...[
        {l:"Active",v:active.length,c:"#5B8DEF"},
        {l:"Overdue",v:overdue.length,c:overdue.length?"#EF4444":"#555"},
        {l:"Parts Needed",v:pN.length,c:pN.length?"#E8A838":"#555"},
        {l:"Parts Late",v:pL.length,c:pL.length?"#EF4444":"#555"},
      ].map(s=>h("div",null,
        h("div",{className:"stat-v",style:{color:s.c}},""+s.v),
        h("div",{className:"stat-l"},s.l),
      )),
    ),
    h("div",{className:"nav"},
      ...nav.map(([id,l])=>h("button",{className:view===id?"on":"",onClick:()=>set({view:id})},l)),
    ),
  );

  if(S.showNotifications){
    const panel=h("div",{className:"notif-panel"});
    const items=[];
    overdue.forEach(j=>items.push({dot:"#EF4444",title:j.name,sub:"Overdue — "+urgLbl(j.due,j.phase)}));
    hot.forEach(j=>items.push({dot:"#F59E0B",title:j.name,sub:"Due soon — "+urgLbl(j.due,j.phase)}));
    shLate.forEach(s=>items.push({dot:"#EF4444",title:s.jobName+" — "+s.name,sub:"Shipment past ETA ("+s.etaDate+")"}));
    pL.forEach(p=>items.push({dot:"#F59E0B",title:p.name||(p.partNumber||"Part"),sub:"Part past ETA — "+urgLbl(p.etaDate)}));

    if(!items.length){
      panel.appendChild(h("div",{style:{color:"#888",fontSize:"13px",padding:"6px 0"}},"✓ All clear — no overdue items"));
    }else{
      items.forEach(it=>{
        const row=h("div",{className:"notif-item"});
        row.appendChild(h("div",{className:"notif-dot",style:{background:it.dot}}));
        const txt=h("div",null);
        txt.appendChild(h("div",{className:"notif-title"},it.title));
        txt.appendChild(h("div",{className:"notif-sub"},it.sub));
        row.appendChild(txt);
        panel.appendChild(row);
      });
    }
    hdr.appendChild(panel);
  }

  return hdr;
}
