function renderDashboard(){
  const{jobs}=S;
  const active=jobs.filter(j=>j.phase!=="complete");
  const overdue=active.filter(j=>urg(j.due,j.phase)==="overdue");
  const hot=active.filter(j=>urg(j.due,j.phase)==="hot");
  const allParts=jobs.flatMap(j=>(j.parts||[]).map(p=>({...p,jobName:j.name,jobId:j.id})));
  const partsNeeded=allParts.filter(p=>p.status==="needed");
  const partsLate=allParts.filter(p=>p.etaDate&&(p.status==="ordered"||p.status==="shipped")&&dL(p.etaDate)<0);

  // empty state
  if(!jobs.length){
    return h("div",{style:{textAlign:"center",padding:"70px 20px 40px",color:"#bbb"}},
      h("div",{style:{fontSize:"56px",marginBottom:"14px"}},"⚓"),
      h("div",{style:{fontSize:"20px",fontWeight:"800",color:"#555",marginBottom:"6px"}},"Welcome to Job Manager"),
      h("div",{style:{fontSize:"14px",color:"#aaa",marginBottom:"24px"}},"Track jobs, materials, and documents for every vessel project."),
      h("button",{className:"btn-add",style:{fontSize:"15px",padding:"12px 24px"},onClick:()=>set({editing:{},view:"jobs"})},"+ Create Your First Job"),
    );
  }

  const wrap=h("div",{style:{padding:"14px",maxWidth:"960px",margin:"0 auto"}});

  // ── Stat cards ──
  const makeStatCard=(label,value,color,sub)=>h("div",{style:{background:"#fff",borderRadius:"10px",padding:"14px 16px",borderTop:"3px solid "+color}},
    h("div",{style:{fontSize:"30px",fontWeight:"900",color,lineHeight:"1.1"}},""+value),
    h("div",{style:{fontSize:"10px",fontWeight:"700",color:"#888",textTransform:"uppercase",letterSpacing:".5px",marginTop:"2px"}},label),
    sub||null,
  );

  const phasePills=h("div",{style:{display:"flex",gap:"3px",flexWrap:"wrap",marginTop:"6px"}});
  PHASES.filter(p=>p.id!=="complete").forEach(p=>{
    const cnt=active.filter(j=>j.phase===p.id).length;if(!cnt)return;
    phasePills.appendChild(h("span",{style:{fontSize:"9px",fontWeight:"700",padding:"2px 6px",borderRadius:"10px",background:p.color+"18",color:p.color}},cnt+" "+p.label));
  });

  const statGrid=h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"10px",marginBottom:"14px"}});
  statGrid.appendChild(makeStatCard("Active Jobs",active.length,"#5B8DEF",phasePills));
  statGrid.appendChild(makeStatCard("Overdue",overdue.length,overdue.length?"#DC2626":"#9CA3AF"));
  statGrid.appendChild(makeStatCard("Hot (≤7 days)",hot.length,hot.length?"#D97706":"#9CA3AF"));
  statGrid.appendChild(makeStatCard("Parts Needed",partsNeeded.length,partsNeeded.length?"#E8A838":"#9CA3AF"));
  if(partsLate.length)statGrid.appendChild(makeStatCard("Parts Late",partsLate.length,"#DC2626"));
  wrap.appendChild(statGrid);

  // ── Two-column row: Deadlines + Phase distribution ──
  const twoCol=h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}});

  // Upcoming deadlines
  const upcoming=[];
  const today=new Date();today.setHours(0,0,0,0);
  const in14=new Date(today);in14.setDate(in14.getDate()+14);
  jobs.filter(j=>j.phase!=="complete").forEach(j=>{
    [["due","Due"],["dockDate","Dock"],["seaTrialDate","Sea Trial"]].forEach(([key,lbl])=>{
      if(!j[key])return;
      const d=new Date(j[key]+"T00:00:00");
      if(d>=today&&d<=in14)upcoming.push({job:j,date:j[key],days:dL(j[key]),lbl});
    });
  });
  upcoming.sort((a,b)=>a.date.localeCompare(b.date));

  const dlSec=h("div",{style:{background:"#fff",borderRadius:"10px",padding:"14px 16px"}},
    h("div",{style:{fontSize:"10px",fontWeight:"800",textTransform:"uppercase",letterSpacing:"1px",color:"#888",marginBottom:"10px"}},"Upcoming (14 days)"),
  );
  if(!upcoming.length){
    dlSec.appendChild(h("div",{style:{fontSize:"13px",color:"#bbb",padding:"8px 0"}},"No deadlines in next 14 days ✓"));
  }else{
    upcoming.slice(0,6).forEach(({job,days,lbl})=>{
      const isToday=days===0;
      const dc=days<=0?"#DC2626":days<=3?"#B45309":"#1D4ED8";
      const bg=days<=0?"#FEF2F2":days<=3?"#FFFBEB":"#EFF6FF";
      dlSec.appendChild(h("div",{style:{display:"flex",alignItems:"center",gap:"8px",padding:"6px 0",borderBottom:"1px solid #F3F3F0",cursor:"pointer"},onClick:()=>set({view:"jobs",expanded:{...S.expanded,[job.id]:true}})},
        h("div",{style:{width:"38px",textAlign:"center",background:bg,borderRadius:"6px",padding:"3px 2px",flexShrink:"0"}},
          h("div",{style:{fontSize:"14px",fontWeight:"900",color:dc,lineHeight:"1"}},isToday?"!":""+days),
          h("div",{style:{fontSize:"8px",fontWeight:"700",color:"#aaa",marginTop:"1px"}},isToday?"TODAY":"days"),
        ),
        h("div",{style:{flex:"1",minWidth:"0"}},
          h("div",{style:{fontSize:"13px",fontWeight:"700",color:"#111",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},job.name),
          h("div",{style:{fontSize:"11px",color:"#888"}},lbl+(job.client?" · "+job.client:"")),
        ),
      ));
    });
  }
  twoCol.appendChild(dlSec);

  // Phase distribution
  const phSec=h("div",{style:{background:"#fff",borderRadius:"10px",padding:"14px 16px"}},
    h("div",{style:{fontSize:"10px",fontWeight:"800",textTransform:"uppercase",letterSpacing:"1px",color:"#888",marginBottom:"10px"}},"Jobs by Phase"),
  );
  PHASES.forEach(p=>{
    const cnt=jobs.filter(j=>j.phase===p.id).length;if(!cnt)return;
    const pct=Math.round((cnt/jobs.length)*100);
    phSec.appendChild(h("div",{style:{marginBottom:"9px"}},
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px"}},
        h("div",{style:{fontSize:"12px",fontWeight:"700",color:p.color}},p.label),
        h("div",{style:{fontSize:"11px",fontWeight:"700",color:"#888"}},cnt+" job"+(cnt!==1?"s":"")),
      ),
      h("div",{style:{height:"6px",background:"#F3F3F0",borderRadius:"3px",overflow:"hidden"}},
        h("div",{style:{height:"100%",width:pct+"%",background:p.color,borderRadius:"3px"}}),
      ),
    ));
  });
  twoCol.appendChild(phSec);
  wrap.appendChild(twoCol);

  // ── Parts alerts ──
  const jobsWithNeeded=jobs.filter(j=>(j.parts||[]).some(p=>p.status==="needed"));
  if(jobsWithNeeded.length){
    const pO={overdue:0,hot:1,soon:2,ok:3,none:4,done:5};
    const alertSec=h("div",{style:{background:"#fff",borderRadius:"10px",padding:"14px 16px",marginBottom:"14px"}},
      h("div",{style:{fontSize:"10px",fontWeight:"800",textTransform:"uppercase",letterSpacing:"1px",color:"#888",marginBottom:"10px"}},"Parts Alerts — Procurement Needed"),
    );
    [...jobsWithNeeded].sort((a,b)=>(pO[urg(a.due,a.phase)]??5)-(pO[urg(b.due,b.phase)]??5)).slice(0,5).forEach(job=>{
      const needed=(job.parts||[]).filter(p=>p.status==="needed");
      const u=urg(job.due,job.phase);const uc=UC[u];
      alertSec.appendChild(h("div",{style:{display:"flex",alignItems:"flex-start",gap:"10px",padding:"8px 0",borderBottom:"1px solid #F3F3F0",cursor:"pointer"},onClick:()=>set({view:"jobs",expanded:{...S.expanded,[job.id]:true},tabs:{...S.tabs,[job.id]:"parts"}})},
        h("div",{style:{width:"8px",height:"8px",borderRadius:"4px",background:u==="overdue"?"#DC2626":u==="hot"?"#D97706":"#9CA3AF",marginTop:"4px",flexShrink:"0"}}),
        h("div",{style:{flex:"1",minWidth:"0"}},
          h("div",{style:{fontSize:"13px",fontWeight:"700",color:"#111"}},job.name+" — "+needed.length+" part"+(needed.length!==1?"s":"")+" needed"),
          h("div",{style:{fontSize:"11px",color:"#888",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},needed.map(p=>p.name).join(", ")),
        ),
        u!=="none"&&u!=="done"?h("span",{style:{fontSize:"10px",fontWeight:"700",padding:"2px 6px",borderRadius:"4px",background:uc.bg,color:uc.c,border:"1px solid "+uc.br,flexShrink:"0"}},urgLbl(job.due,job.phase)):null,
      ));
    });
    wrap.appendChild(alertSec);
  }

  // ── Recent jobs ──
  const recent=[...jobs].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")).slice(0,4);
  if(recent.length){
    const recSec=h("div",{style:{background:"#fff",borderRadius:"10px",padding:"14px 16px"}},
      h("div",{style:{fontSize:"10px",fontWeight:"800",textTransform:"uppercase",letterSpacing:"1px",color:"#888",marginBottom:"10px"}},"Recent Jobs"),
    );
    recent.forEach(job=>{
      const phase=PHASES.find(p=>p.id===job.phase)||PHASES[0];
      const tasks=job.tasks||[];const done=tasks.filter(t=>t.done).length;
      const u=urg(job.due,job.phase);const uc=UC[u];
      recSec.appendChild(h("div",{style:{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid #F3F3F0",cursor:"pointer"},onClick:()=>set({view:"jobs",expanded:{...S.expanded,[job.id]:true}})},
        h("div",{style:{width:"8px",height:"8px",borderRadius:"4px",background:phase.color,flexShrink:"0"}}),
        h("div",{style:{flex:"1",minWidth:"0"}},
          h("div",{style:{fontSize:"13px",fontWeight:"700",color:"#111",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},job.name),
          h("div",{style:{fontSize:"11px",color:"#888"}},phase.label+(job.client?" · "+job.client:"")+(tasks.length?" · "+done+"/"+tasks.length+" tasks":"")),
        ),
        u!=="none"&&u!=="done"?h("span",{style:{fontSize:"10px",fontWeight:"700",padding:"2px 6px",borderRadius:"4px",background:uc.bg,color:uc.c,border:"1px solid "+uc.br,flexShrink:"0"}},urgLbl(job.due,job.phase)):null,
        h("span",{style:{fontSize:"14px",color:"#ddd"}},"▸"),
      ));
    });
    wrap.appendChild(recSec);
  }

  return wrap;
}
