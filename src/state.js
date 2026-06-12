const STORE="mas-pm-v1";
const STORE_OLD="mas-jm-v6";

function defaultSettings(){
  return{
    company:{name:"Marine Alarm Systems",address:"",phone:"",email:""},
    numbering:{quotePrefix:"Q",quoteNext:1,poPrefix:"PO",poNext:1,invPrefix:"INV",invNext:1},
    tax:{rate:0,label:"Tax"},
    currency:"USD",
  };
}

function loadState(){
  try{
    const raw=localStorage.getItem(STORE);
    if(raw)return JSON.parse(raw);
    // migrate from v6
    const old=localStorage.getItem(STORE_OLD);
    if(old){
      const jobs=JSON.parse(old)||[];
      const st={jobs,contacts:[],settings:defaultSettings()};
      localStorage.setItem(STORE,JSON.stringify(st));
      return st;
    }
    return{jobs:[],contacts:[],settings:defaultSettings()};
  }catch{return{jobs:[],contacts:[],settings:defaultSettings()};}
}

function saveState(data){
  localStorage.setItem(STORE,JSON.stringify(data));
}

const _loaded=loadState();

let S={
  jobs:_loaded.jobs||[],
  contacts:_loaded.contacts||[],
  settings:Object.assign(defaultSettings(),_loaded.settings||{}),
  // ui state (not persisted)
  view:"dashboard",
  editing:null,
  filter:"all",
  search:"",
  expanded:{},
  tabs:{},
  addingPart:{},
  editingPart:{},
  partForms:{},
  addingDoc:{},
  docForms:{},
  addingShipment:{},
  editingShipment:{},
  shipmentForms:{},
  showNotifications:false,,
};

function set(p){Object.assign(S,p);render()}
function persist(){saveState({jobs:S.jobs,contacts:S.contacts,settings:S.settings});render()}
function updJob(id,p){S.jobs=S.jobs.map(j=>j.id===id?{...j,...p}:j);persist()}
function delJob(id){S.jobs=S.jobs.filter(j=>j.id!==id);delete S.expanded[id];persist()}
