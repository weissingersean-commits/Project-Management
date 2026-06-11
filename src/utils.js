function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

function dL(d){if(!d)return null;const n=new Date();n.setHours(0,0,0,0);return Math.ceil((new Date(d+"T00:00:00")-n)/864e5)}
function urg(due,ph){if(ph==="complete")return"done";const d=dL(due);if(d===null)return"none";if(d<0)return"overdue";if(d<=3)return"hot";if(d<=7)return"soon";return"ok"}
function urgLbl(due,ph){if(ph==="complete")return"Done";const d=dL(due);if(d===null)return"";if(d<0)return Math.abs(d)+"d overdue";if(d===0)return"Today";return d+"d"}

function h(t,a,...c){
  const e=document.createElement(t);
  if(a)for(const[k,v]of Object.entries(a)){
    if(k==="style"&&typeof v==="object")Object.assign(e.style,v);
    else if(k.startsWith("on"))e.addEventListener(k.slice(2).toLowerCase(),v);
    else if(k==="className")e.className=v;
    else if(k==="checked")e.checked=v;
    else if(k==="selected")e.selected=v;
    else if(k==="value")e.value=v;
    else e.setAttribute(k,v);
  }
  for(const x of c){
    if(x==null||x===false)continue;
    if(typeof x==="string"||typeof x==="number")e.appendChild(document.createTextNode(x));
    else if(Array.isArray(x))x.forEach(z=>{if(z)e.appendChild(z)});
    else e.appendChild(x);
  }
  return e;
}
