function renderHeader(){
  const{jobs,view}=S;
  const active=jobs.filter(j=>j.phase!=="complete");
  const overdue=active.filter(j=>urg(j.due,j.phase)==="overdue");
  const allP=jobs.flatMap(j=>(j.parts||[]));
  const pN=allP.filter(p=>p.status==="needed");
  const pL=allP.filter(p=>p.etaDate&&(p.status==="ordered"||p.status==="shipped")&&dL(p.etaDate)<0);

  const nav=[
    ["dashboard","Dashboard"],
    ["jobs","Jobs"],
    ["materials","Materials"],
    ["settings","Settings"],
  ];

  return h("div",{className:"hdr"},
    h("div",{className:"hdr-row"},
      h("div",null,
        h("div",{className:"hdr-sub"},S.settings.company.name||"Marine Alarm Systems"),
        h("h1",null,"Job Manager"),
      ),
      view!=="settings"?h("button",{className:"btn-add",onClick:()=>set({editing:{},view:"jobs"})},"+ New Job"):null,
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
}
