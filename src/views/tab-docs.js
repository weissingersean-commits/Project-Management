function renderDocs(job){
  const docs=job.docs||[];const jid=job.id;const container=h("div",null);
  docs.forEach((d,i)=>{
    const st=DOC_STATUSES.find(s=>s.id===d.status)||DOC_STATUSES[0];
    const due=dL(d.dueDate);const isLate=d.dueDate&&d.status!=="approved"&&due!==null&&due<0;
    container.appendChild(h("div",{className:"dr"},
      h("div",{className:"dr-dot",style:{background:st.color}}),
      h("div",{style:{flex:"1",minWidth:"0"}},
        h("div",{style:{fontSize:"13px",fontWeight:"700",color:"var(--ink)"}},d.name),
        h("div",{style:{fontSize:"11px",color:isLate?"var(--danger)":"#888",fontWeight:isLate?"700":"400"}},d.type+(d.dueDate?" · Due "+d.dueDate+(isLate?" ("+Math.abs(due)+"d late)":""):""))
      ),
      (()=>{const sel=h("select",{className:"pr-sel",style:{color:st.color},onChange:e=>{const up=[...docs];up[i]={...d,status:e.target.value};updJob(jid,{docs:up})}});DOC_STATUSES.forEach(s=>{const o=h("option",{value:s.id},s.label);if(s.id===d.status)o.selected=true;sel.appendChild(o)});return sel})(),
      h("button",{className:"ck-x",onClick:()=>updJob(jid,{docs:docs.filter((_,j)=>j!==i)})},"×"),
    ));
  });
  if(S.addingDoc[jid]){
    const f=S.docForms[jid]||{name:"",type:"GA Drawing",status:"pending",dueDate:"",notes:""};
    const sF=(k,v)=>{S.docForms[jid]={...(S.docForms[jid]||f),[k]:v}};
    container.appendChild(h("div",{className:"iform fi"},
      h("div",{className:"grid2"},
        h("div",{className:"full"},h("label",{className:"lbl req"},"Document Name"),h("input",{className:"inp",value:f.name,placeholder:"e.g. GA Drawing Rev B",onInput:e=>sF("name",e.target.value)})),
        h("div",null,h("label",{className:"lbl"},"Type"),(()=>{const sel=h("select",{className:"inp",onInput:e=>sF("type",e.target.value)});DOC_TYPES.forEach(t=>{const o=h("option",{value:t},t);if(t===f.type)o.selected=true;sel.appendChild(o)});return sel})()),
        h("div",null,h("label",{className:"lbl"},"Due Date"),h("input",{className:"inp",type:"date",value:f.dueDate,onInput:e=>sF("dueDate",e.target.value)})),
        h("div",{className:"full"},h("label",{className:"lbl"},"Notes"),h("input",{className:"inp",value:f.notes,placeholder:"Rev notes, who needs it...",onInput:e=>sF("notes",e.target.value)})),
      ),
      h("div",{className:"iform-acts"},
        h("button",{className:"btn-sm btn-outline",onClick:()=>{delete S.addingDoc[jid];render()}},"Cancel"),
        h("button",{className:"btn-sm btn-dark",style:{opacity:(S.docForms[jid]&&S.docForms[jid].name||"").trim()?"1":"0.35"},onClick:()=>{
          const fd=S.docForms[jid];if(!fd||!fd.name.trim())return;delete S.addingDoc[jid];delete S.docForms[jid];updJob(jid,{docs:[...docs,{...fd,id:uid()}]});
        }},"Add"),
      ),
    ));
  }else{
    container.appendChild(h("button",{className:"btn-sm btn-ghost",style:{marginTop:"8px",width:"100%"},onClick:()=>{S.addingDoc[jid]=true;S.docForms[jid]={name:"",type:"GA Drawing",status:"pending",dueDate:"",notes:""};render()}},"+ Add Document"));
  }
  return container;
}
