function exportData(){
  const data={jobs:S.jobs,contacts:S.contacts,settings:S.settings,exportedAt:new Date().toISOString(),version:"mas-pm-v1"};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const date=new Date().toISOString().slice(0,10);
  a.href=url;a.download="mas-pm-backup-"+date+".json";a.click();
  URL.revokeObjectURL(url);
}

function importData(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      if(!Array.isArray(data.jobs)){alert("Invalid backup file — missing jobs array.");return}
      if(!confirm("This will replace all current data with the backup.\n\n"+data.jobs.length+" jobs found.\nExported: "+(data.exportedAt||"unknown")+"\n\nContinue?"))return;
      S.jobs=data.jobs||[];
      S.contacts=data.contacts||[];
      S.settings=Object.assign(defaultSettings(),data.settings||{});
      persist();
      alert("✓ Import complete: "+S.jobs.length+" jobs loaded.");
    }catch(err){alert("Error reading file. Make sure it is a valid backup JSON.\n\n"+err.message);}
  };
  reader.readAsText(file);
}

function renderSettings(){
  const cfg=S.settings;
  const wrap=h("div",{style:{padding:"14px",maxWidth:"600px",margin:"0 auto"}});

  const field=(label,val,onch,type)=>{
    const w=h("div",null);
    w.appendChild(h("label",{className:"lbl"},label));
    w.appendChild(h("input",{className:"inp",type:type||"text",value:val,onInput:e=>onch(e.target.value)}));
    return w;
  };

  // Company info
  const coSaved={...cfg.company};
  const coForm=h("div",{style:{background:"#fff",borderRadius:"10px",padding:"18px",marginBottom:"12px"}},
    h("div",{style:{fontSize:"14px",fontWeight:"800",marginBottom:"14px"}},"Company Info"),
    h("div",{style:{display:"grid",gap:"10px"}},
      field("Company Name",cfg.company.name,v=>{S.settings.company.name=v}),
      field("Address",cfg.company.address,v=>{S.settings.company.address=v}),
      h("div",{className:"grid2"},
        field("Phone",cfg.company.phone,v=>{S.settings.company.phone=v},"tel"),
        field("Email",cfg.company.email,v=>{S.settings.company.email=v},"email"),
      ),
    ),
    h("div",{style:{marginTop:"14px",display:"flex",justifyContent:"flex-end"}},
      h("button",{className:"btn-sm btn-dark",onClick:()=>{persist();const b=document.getElementById("co-saved");if(b){b.style.opacity="1";setTimeout(()=>{b.style.opacity="0"},1800)}}},"Save"),
      h("span",{id:"co-saved",style:{marginLeft:"10px",fontSize:"12px",color:"var(--ok)",fontWeight:"700",transition:"opacity .4s",opacity:"0"}},"✓ Saved"),
    ),
  );
  wrap.appendChild(coForm);

  // Data management
  const dataRow=(title,desc,ctrl)=>h("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",padding:"12px",background:"#F8F8F6",borderRadius:"8px"}},
    h("div",null,h("div",{style:{fontSize:"13px",fontWeight:"700"}},title),h("div",{style:{fontSize:"12px",color:"#888",marginTop:"2px"}},desc)),
    ctrl,
  );

  const fileInp=h("input",{type:"file",accept:".json",style:{display:"none"},onChange:importData});
  const importLbl=h("label",{style:{cursor:"pointer"}},
    h("span",{className:"btn-sm btn-outline"},"Import JSON"),
    fileInp,
  );

  wrap.appendChild(h("div",{style:{background:"#fff",borderRadius:"10px",padding:"18px",marginBottom:"12px"}},
    h("div",{style:{fontSize:"14px",fontWeight:"800",marginBottom:"14px"}},"Data Management"),
    h("div",{style:{display:"flex",flexDirection:"column",gap:"8px"}},
      dataRow("Export Data","Download all jobs and settings as a JSON backup file",h("button",{className:"btn-sm btn-dark",onClick:exportData},"Export JSON")),
      dataRow("Import Data","Restore from a previously exported JSON backup",importLbl),
    ),
  ));

  // Job stats
  const jobsByPhase=PHASES.map(p=>({phase:p,cnt:S.jobs.filter(j=>j.phase===p.id).length})).filter(x=>x.cnt>0);
  if(S.jobs.length){
    wrap.appendChild(h("div",{style:{background:"#fff",borderRadius:"10px",padding:"18px",marginBottom:"12px"}},
      h("div",{style:{fontSize:"14px",fontWeight:"800",marginBottom:"10px"}},"Overview"),
      h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}},
        ...[
          ["Total Jobs",""+S.jobs.length,"#5B8DEF"],
          ["Active",""+(S.jobs.filter(j=>j.phase!=="complete").length),"#E8A838"],
          ["Complete",""+(S.jobs.filter(j=>j.phase==="complete").length),"#059669"],
        ].map(([l,v,c])=>h("div",{style:{textAlign:"center",padding:"10px",background:"#F8F8F6",borderRadius:"8px"}},
          h("div",{style:{fontSize:"22px",fontWeight:"900",color:c}},v),
          h("div",{style:{fontSize:"10px",fontWeight:"700",color:"#888",textTransform:"uppercase"}},l),
        )),
      ),
    ));
  }

  // Danger zone
  wrap.appendChild(h("div",{style:{background:"#fff",border:"1px solid #FECACA",borderRadius:"10px",padding:"18px"}},
    h("div",{style:{fontSize:"14px",fontWeight:"800",color:"var(--danger)",marginBottom:"10px"}},"Danger Zone"),
    h("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}},
      h("div",null,
        h("div",{style:{fontSize:"13px",fontWeight:"700"}},"Reset All Data"),
        h("div",{style:{fontSize:"12px",color:"#888",marginTop:"2px"}},"Permanently delete all jobs, contacts, and settings"),
      ),
      h("button",{className:"btn-sm",style:{background:"var(--danger)",color:"#fff",flexShrink:"0"},onClick:()=>{
        if(confirm("This will permanently delete ALL data and cannot be undone.\n\nType DELETE to confirm") !==false){
          S.jobs=[];S.contacts=[];S.settings=defaultSettings();persist();
        }
      }},"Reset All"),
    ),
  ));

  return wrap;
}
