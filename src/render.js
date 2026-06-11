function render(){
  const app=document.getElementById("app");app.innerHTML="";
  app.appendChild(renderHeader());

  if(S.view==="dashboard"){
    app.appendChild(renderDashboard());
  }else if(S.view==="jobs"){
    const active=S.jobs.filter(j=>j.phase!=="complete");
    const overdue=active.filter(j=>urg(j.due,j.phase)==="overdue");
    if(overdue.length)app.appendChild(h("div",{className:"alert-bar"},"⚠️ "+overdue.length+" job"+(overdue.length>1?"s":"")+" overdue — "+overdue.map(j=>j.name).join(", ")));
    renderJobsView(app);
  }else if(S.view==="materials"){
    app.appendChild(renderMats());
  }else if(S.view==="settings"){
    app.appendChild(renderSettings());
  }

  app.appendChild(h("div",{style:{height:"40px"}}));
  const modal=renderModal();if(modal)app.appendChild(modal);

  if(S.view==="jobs"&&S.search){
    const si=app.querySelector(".sbar input");
    if(si){si.focus();si.setSelectionRange(S.search.length,S.search.length)}
  }
}
render();
