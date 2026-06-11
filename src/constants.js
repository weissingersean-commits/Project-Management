const PHASES=[
  {id:"design",label:"Design",color:"#5B8DEF"},
  {id:"procurement",label:"Procurement",color:"#E8A838"},
  {id:"build",label:"Build / Assembly",color:"#D97B2A"},
  {id:"install",label:"Install",color:"#7B68EE"},
  {id:"test",label:"Test / Commission",color:"#10B981"},
  {id:"complete",label:"Complete",color:"#059669"},
];

const PHASE_CHECKLISTS={
  design:[
    "Receive and review alarm point list from client",
    "Get engine / machinery specs and manuals",
    "Identify sensor types and ranges needed",
    "Create General Arrangement (GA) drawing",
    "Create wiring diagram / schematics",
    "Submit drawings for client / class approval",
    "Revise drawings per feedback",
    "Final drawing approval received",
  ],
  procurement:[
    "Generate Bill of Materials (BOM) from approved design",
    "Request quotes from suppliers",
    "Issue Purchase Orders",
    "Confirm lead times with suppliers",
    "Track shipments - sensors",
    "Track shipments - panel components",
    "Track shipments - wire / cable",
    "Track shipments - misc hardware",
    "Receive and inspect all materials",
    "Report any damaged or incorrect items",
  ],
  build:[
    "Panel layout and component mounting",
    "Wire panel internals per schematic",
    "Label all wiring and terminals",
    "Program alarm controller / PLC",
    "Bench test - verify each alarm channel",
    "Bench test - verify outputs (horn, lights, shutdown)",
    "QC inspection of completed panel",
    "Prepare panel for shipping / transport",
  ],
  install:[
    "Coordinate vessel availability / dock schedule",
    "Mobilize tools and crew to vessel",
    "Mount alarm panel in engine room / wheelhouse",
    "Run cable and conduit to sensor locations",
    "Install sensors at machinery",
    "Terminate wiring at panel and sensors",
    "Label all field wiring",
    "Verify power supply connections",
  ],
  test:[
    "Power up system - check for faults",
    "Simulate each alarm point - verify annunciation",
    "Test horn silence / acknowledge functions",
    "Test lamp test function",
    "Verify shutdown circuits if applicable",
    "Test wheelhouse remote / repeater panel",
    "Demonstrate system to chief engineer / captain",
    "Complete test report and sign-off sheet",
    "Submit documentation to class society if required",
    "Punch list items - address any deficiencies",
  ],
  complete:[
    "Deliver final as-built drawings to client",
    "Deliver operation and maintenance manual",
    "Submit final invoice",
    "Collect payment",
    "Archive job files",
  ],
};

const PART_STATUSES=[
  {id:"needed",label:"Needed",color:"#DC2626",dot:"\u{1F534}"},
  {id:"ordered",label:"Ordered",color:"#D97706",dot:"\u{1F7E1}"},
  {id:"shipped",label:"Shipped",color:"#3B82F6",dot:"\u{1F535}"},
  {id:"received",label:"Received",color:"#059669",dot:"\u{1F7E2}"},
];

const DOC_STATUSES=[
  {id:"pending",label:"Pending",color:"#D97706"},
  {id:"in_progress",label:"In Progress",color:"#3B82F6"},
  {id:"submitted",label:"Submitted",color:"#7B68EE"},
  {id:"approved",label:"Approved",color:"#059669"},
  {id:"rejected",label:"Rejected",color:"#DC2626"},
];

const DOC_TYPES=["GA Drawing","Wiring Diagram","Spec Sheet","Bill of Materials","Approval Letter","Class Certificate","Test Report","Punch List","Photo / As-Built","Invoice","Purchase Order","Other"];
const VESSEL_TYPES=["Tugboat","Towboat","Push Boat","Barge","Crew Boat","Supply Vessel (OSV)","Ferry","Tanker","Cargo / Freighter","Dredge","Workboat","Yacht","Military","Other"];

const UC={
  overdue:{c:"#DC2626",bg:"#FEF2F2",br:"#FECACA"},
  hot:{c:"#B45309",bg:"#FFFBEB",br:"#FDE68A"},
  soon:{c:"#1D4ED8",bg:"#EFF6FF",br:"#BFDBFE"},
  ok:{c:"#6B7280",bg:"transparent",br:"transparent"},
  done:{c:"#059669",bg:"#F0FDF4",br:"#BBF7D0"},
  none:{c:"#9CA3AF",bg:"transparent",br:"transparent"},
};
