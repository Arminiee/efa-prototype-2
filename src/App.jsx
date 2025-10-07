import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Download, BarChart3, MapPinned, Building2, Loader2, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, PieChart, Pie, LineChart, Line, Legend, CartesianGrid } from "recharts";

// ---- Robust sizing helpers (works in iframes & dynamic layouts)
function useMeasure() {
  const ref = React.useRef(null);
  const [rect, setRect] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect;
        setRect({ width: cr.width, height: cr.height });
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, rect];
}

function ChartContainer({ height = 260, children }) {
  const [ref, rect] = useMeasure();
  // Nudge Recharts after mount for environments reporting 0 width initially
  React.useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ height }}>
      {rect.width > 10 ? children : <div style={{height}} />}
    </div>
  );
}


function useWindowSize(){
  const [size, setSize] = React.useState({ w: typeof window !== 'undefined' ? window.innerWidth : 0, h: typeof window !== 'undefined' ? window.innerHeight : 0 });
  React.useEffect(()=>{
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    const nudge = () => setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
    window.addEventListener('resize', onResize);
    window.addEventListener('pageshow', nudge);
    document.addEventListener('visibilitychange', nudge);
    const t = setTimeout(nudge, 300);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pageshow', nudge);
      document.removeEventListener('visibilitychange', nudge);
      clearTimeout(t);
    }
  },[]);
  return size;
}


const DIVISIONS = ["Dhaka","Chattogram","Khulna","Barishal","Rajshahi","Sylhet","Rangpur","Mymensingh"];
const ENCROACH_TYPES = ["River","Forest"];
const STATUS_FILED = ["Filed","In Trial","Verdict Given"];
const IMPLEMENTATION_STATUS = ["Not yet started","In-progress","Completed on-time","Completed - delayed","Overdue","Pending"];

function daysBetween(a,b){return Math.round((new Date(b)-new Date(a))/(1000*60*60*24));}
function fmtBDT(n){return `৳${(n||0).toLocaleString()}`}
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const rand = mulberry32(20250930);
function pick(arr){return arr[Math.floor(rand()*arr.length)]}
function sampleDate(start="2023-01-01", end="2025-09-15"){const s=new Date(start).getTime();const e=new Date(end).getTime();return new Date(s+rand()*(e-s)).toISOString().slice(0,10)}

const CASE_GLOBAL_AGRO = {
  caseId: "ECC/KHL/2023/0045",
  slug: "ECC-KHL-2023-0045",
  title: "People vs Global Agro Ltd",
  division: "Khulna",
  type: "Forest",
  siteName: "Sundarbans Reserve Forest, Chandpai Range",
  subject: "Encroachment of 50 acres of protected forest land",
  complainant: "Department of Forest, Ministry of Environment, Forest and Climate Change",
  respondent: "Global Agro Ltd. and its Managing Director, Mr. Tareq Ahmed",
  caseType: "Illegal Land Grabbing and Deforestation",
  filingDate: "2023-03-15",
  hearingDates: ["2023-06-10","2023-09-05","2024-04-18"],
  verdictDate: "2024-06-25",
  filedStatus: "Verdict Given",
  verdictSummary: `The court found Global Agro Ltd. guilty of illegally encroaching upon 50 acres of protected forest land within the Sundarbans Reserve Forest. The respondent was ordered to cease all activities, vacate the land, pay a fine of ৳50,00,000, and bear the full cost of a restoration plan. The Managing Director received a 6-month suspended sentence contingent on compliance by the deadline.`,
  enforcement: {
    agency: "Khulna District Administration (with Department of Forest)",
    complianceDeadline: "2024-09-23",
    officerName: "Mr. Kazi Nazrul Islam",
    officerDesignation: "Deputy Commissioner (DC), Khulna",
    budgetAllocated: 1500000,
    implementationStatus: "Overdue",
    actionPlan: [
      {phase: 1, name: "Notice & Demarcation", status: "Completed"},
      {phase: 2, name: "Eviction Drive", status: "Delayed (legal challenge)"},
      {phase: 3, name: "Restoration Assessment", status: "Pending"},
      {phase: 4, name: "Recovery & Reforestation", status: "Pending"},
      {phase: 5, name: "Monitoring", status: "Pending"},
    ],
  },
  metrics: { areaEncroachedAcres: 50, areaRecoveredAcres: 0, fineLevied: 5000000, fineCollected: 0 },
};

function generateCases(n=32){
  const rivers = ["Buriganga","Turag","Shitalakkhya","Karnaphuli","Meghna","Padma","Surma","Jamuna","Halda"];
  const forests = ["Bhawal Sal Forest","Modhupur Sal Forest","Sundarbans (Satkhira)","Sundarbans (Sharankhola)","Teknaf Wildlife Sanctuary","Khasia Hills Reserve"];
  const respondents = ["Delta Bricks Ltd","Eastern Aggregates","City Developers PLC","North Star Fisheries","Abdul Matin & Associates","Green Leaf Timber Co.","Padma Sand Traders","Karnaphuli Dredging Co."];
  const complainants = ["Department of Environment","DoE, Divisional Office","Forest Department","River Conservation Trust","Local Administration","Citizen Coalition for Rivers"];
  const arr = [];
  for(let i=0;i<n;i++){
    const type = pick(ENCROACH_TYPES);
    const division = pick(DIVISIONS);
    const siteName = type === "River" ? `${pick(rivers)} River` : pick(forests);
    const filingDate = sampleDate("2023-01-01","2025-01-31");
    const withVerdict = rand() > 0.45;
    const verdictDate = withVerdict ? sampleDate("2023-07-01","2025-09-20") : null;
    const filedStatus = withVerdict ? "Verdict Given" : pick(["Filed","In Trial"]);
    const implStatusPool = withVerdict ? IMPLEMENTATION_STATUS : ["Pending","Not yet started","In-progress"];
    const implementationStatus = pick(implStatusPool);
    const encAcres = Math.round(rand()*120)+5;
    const recAcres = implementationStatus.includes("Completed") ? Math.round(encAcres*(0.5+rand()*0.5)) : 0;
    const fineLevied = (Math.round((rand()*8+2))*500000);
    const fineCollected = implementationStatus.startsWith("Completed") ? Math.round(fineLevied*(0.6+rand()*0.4)) : (rand()>0.5? Math.round(fineLevied*(0.1+rand()*0.2)) : 0);
    const caseNum = `${String(i+1).padStart(4,"0")}`;
    const id = `ECC/${division.slice(0,3).toUpperCase()}/${filingDate.slice(0,4)}/${caseNum}`;
    arr.push({
      caseId: id,
      slug: id.replaceAll("/","-"),
      title: `People vs ${pick(respondents)}`,
      division, type, siteName,
      subject: type==="River" ? `Illegal sand extraction and riverbank occupation at ${siteName}` : `Illegal occupation and tree felling in ${siteName}`,
      complainant: pick(complainants),
      respondent: pick(respondents),
      caseType: type==="River" ? "Illegal Sand Extraction & Bank Occupation" : "Illegal Land Grabbing and Deforestation",
      filingDate, hearingDates: withVerdict ? [sampleDate("2023-06-01","2025-06-01"), sampleDate("2023-07-01","2025-08-15")] : [sampleDate("2023-07-01","2025-08-15")],
      verdictDate, filedStatus,
      verdictSummary: withVerdict ? `Court ordered cessation, recovery of encroached ${encAcres} acres and fines. Compliance by 90 days.` : "Case in progress; hearings scheduled.",
      enforcement: {
        agency: type==="River" ? `${division} District Administration (with DoE)` : `${division} District Administration (with Forest Department)`,
        complianceDeadline: withVerdict ? sampleDate("2024-02-01","2025-12-31") : null,
        officerName: pick(["Md. Saiful Islam","Shahnaz Rahman","Kazi Nazrul Islam","Farzana Ahmed","Ashiqur Rahman","Nusrat Jahan"]),
        officerDesignation: pick(["Deputy Commissioner","Additional Deputy Commissioner","Upazila Nirbahi Officer","Assistant Commissioner (Land)"]),
        budgetAllocated: Math.round((rand()*2+0.5)*1000000),
        implementationStatus,
        actionPlan: [
          {phase:1,name:"Notice & Demarcation",status: withVerdict? (rand()>0.2?"Completed":"Pending"):"Pending"},
          {phase:2,name:"Eviction Drive",status: pick(["Pending","In-progress","Delayed","Completed"])},
          {phase:3,name:"Restoration Assessment",status: pick(["Pending","Scheduled","In-progress"])},
          {phase:4,name:"Recovery & Reforestation",status: pick(["Pending","Scheduled","In-progress"])},
          {phase:5,name:"Monitoring",status: pick(["Pending","Planned"])},
        ],
      },
      metrics: { areaEncroachedAcres: encAcres, areaRecoveredAcres: recAcres, fineLevied, fineCollected },
    });
  }
  return arr;
}

const INITIAL_CASES = [CASE_GLOBAL_AGRO, ...generateCases(32)];

export default function App(){
  const [route, setRoute] = useState("home");
  const [cases, setCases] = useState(INITIAL_CASES);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ division: "All", type: "All", status: "All" });
  const [selectedCase, setSelectedCase] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(()=>{ document.title = "Environmental Encroachment Case Tracker"; },[])

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    return cases.filter(c=>{
      const okDiv = filters.division==="All" || c.division===filters.division;
      const okType = filters.type==="All" || c.type===filters.type;
      const okStat = filters.status==="All" || c.enforcement?.implementationStatus===filters.status;
      const text = `${c.caseId} ${c.title} ${c.respondent} ${c.subject} ${c.siteName} ${c.division} ${c.type}`.toLowerCase();
      const okQ = !q || text.includes(q);
      return okDiv && okType && okStat && okQ;
    })
  },[cases, query, filters])

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header onNavigate={setRoute} route={route} setCreateOpen={setCreateOpen} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {route==="home" && <Home setRoute={setRoute} cases={cases} />}
        {route==="cases" && (
          <Cases
            cases={filtered}
            allCases={cases}
            query={query}
            setQuery={setQuery}
            filters={filters}
            setFilters={setFilters}
            onOpenCase={setSelectedCase}
          />
        )}
        {route==="stats" && <Stats cases={cases} />}
        {route==="about" && <About />}
      </main>

      <Dialog open={!!selectedCase} onOpenChange={(o)=>!o && setSelectedCase(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCase && <CaseDetails data={selectedCase} />}
        </DialogContent>
      </Dialog>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Add a new case</SheetTitle></SheetHeader>
          <CreateCase onCreate={(c)=>{ setCases(prev=>[c,...prev]); setCreateOpen(false); }} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Header({ onNavigate, route, setCreateOpen }){
  const nav = (key,label)=> (
    <Button variant={route===key?"default":"ghost"} onClick={()=>onNavigate(key)}>{label}</Button>
  );
  return (
    <header className="bg-white/80 backdrop-blur sticky top-0 z-30 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="font-semibold text-xl">Evidence for Accountability</div>
        <div className="text-xs text-neutral-500">Environmental Encroachment Case Tracker</div>
        <div className="flex-1"/>
        {nav("home","Home")}
        {nav("cases","Cases")}
        {nav("stats","Stats & Reports")}
        {nav("about","About")}
        <Button className="ml-2" onClick={()=>setCreateOpen(true)}>+ Add Case</Button>
      </div>
    </header>
  )
}

function Home({ setRoute, cases }){
  const totals = useMemo(()=>{
    const total = cases.length;
    const forest = cases.filter(c=>c.type==="Forest").length;
    const river = total-forest;
    return { total, forest, river };
  },[cases])
  return (
    <section className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4 items-center">
        <div>
          <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-3xl font-semibold tracking-tight">
            Environmental Encroachment Case Tracker
          </motion.h1>
          <p className="text-neutral-600 mt-2">For justice, transparency and accountability.</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={()=>setRoute("cases")}>Search Cases</Button>
            <Button variant="outline" onClick={()=>setRoute("stats")}>📊 Stats & Reports</Button>
          </div>
        </div>
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Database Snapshot</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <KPI label="Total Cases" value={totals.total} />
              <KPI label="Forest Cases" value={totals.forest} />
              <KPI label="River Cases" value={totals.river} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function KPI({label,value,sub}){
  return (
    <div className="bg-neutral-50 border rounded-2xl p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-2xl font-semibold">{typeof value==="number"? value.toLocaleString(): value}</div>
      {sub && <div className="text-xs text-neutral-500 mt-1">{sub}</div>}
    </div>
  )
}

function Cases({ cases, allCases, query, setQuery, filters, setFilters, onOpenCase }){
  const unique = (arr,k)=> Array.from(new Set(arr.map(o=>o[k])));
  const divisions = ["All", ...unique(allCases,"division")];
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-xl font-semibold">Environmental Encroachment Case Database</div>
        <div className="ml-auto flex gap-2">
          <Input placeholder="Search by ID, type, respondent…" value={query} onChange={e=>setQuery(e.target.value)} className="w-72"/>
          <div className="w-40">
            <Select value={filters.division} onValueChange={v=>setFilters({...filters, division:v})}>
              <SelectTrigger><SelectValue placeholder="Division"/></SelectTrigger>
              <SelectContent>
                {divisions.map(d=>(<SelectItem key={d} value={d}>{d}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Select value={filters.type} onValueChange={v=>setFilters({...filters, type:v})}>
              <SelectTrigger><SelectValue placeholder="River/Forest"/></SelectTrigger>
              <SelectContent>
                {(["All",...ENCROACH_TYPES]).map(t=>(<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-52">
            <Select value={filters.status} onValueChange={v=>setFilters({...filters, status:v})}>
              <SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger>
              <SelectContent>
                {(["All",...IMPLEMENTATION_STATUS]).map(s=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map(c=>(
          <Card key={c.caseId} className="rounded-2xl shadow-sm hover:shadow transition">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium line-clamp-1">{c.title}</div>
                <Badge variant="outline">{c.type}</Badge>
              </div>
              <div className="text-xs text-neutral-500 line-clamp-1"><span className="mr-1">📍</span>{c.siteName}</div>
              <div className="text-xs text-neutral-500"><span className="mr-1">🏢</span>{c.division}</div>
              <div className="text-xs"><span className="font-mono">{c.caseId}</span></div>
              <div className="flex items-center gap-2 text-xs">
                <StatusBadge status={c.filedStatus} />
                <StatusBadge status={c.enforcement?.implementationStatus} />
              </div>
              <div className="text-xs text-neutral-600 line-clamp-2">{c.subject}</div>
              <div className="pt-2 flex gap-2">
                <Button size="sm" onClick={()=>onOpenCase(c)}>View details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {cases.length===0 && <div className="text-sm text-neutral-500">No cases match your filters.</div>}
    </section>
  )
}

function StatusBadge({ status }){
  if(!status) return null;
  const map = {
    Filed: {cls:"bg-neutral-100"},
    "In Trial": {cls:"bg-amber-100"},
    "Verdict Given": {cls:"bg-emerald-100"},
    "Not yet started": {cls:"bg-neutral-100"},
    "In-progress": {cls:"bg-sky-100"},
    "Completed on-time": {cls:"bg-emerald-100"},
    "Completed - delayed": {cls:"bg-yellow-100"},
    Overdue: {cls:"bg-rose-100"},
    Pending: {cls:"bg-neutral-100"},
  }
  const m = map[status] || {cls:"bg-neutral-100"}
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${m.cls}`}>{status}</span>
}

function CaseDetails({ data }){
  const d = data;
  const durationToVerdict = d.verdictDate ? daysBetween(d.filingDate, d.verdictDate) : null;
  const overdue = d.enforcement?.implementationStatus === "Overdue";
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-xl">{d.title}</DialogTitle>
        <DialogDescription className="text-xs">{d.siteName}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-xs">Case ID: {d.caseId}</Badge>
        <StatusBadge status={d.filedStatus} />
        <StatusBadge status={d.enforcement?.implementationStatus} />
        {overdue && <Badge className="bg-rose-600 text-white">Enforcement overdue</Badge>}
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Case Summary</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <Info label="Subject" value={d.subject} />
          <Info label="Respondent" value={d.respondent} />
          <Info label="Key Outcome" value={d.verdictSummary?.slice(0,140)+"…"} />
          <Info label="Enforcement Agency" value={d.enforcement?.agency} />
          <Info label="Compliance Deadline" value={d.enforcement?.complianceDeadline || "—"} />
          <Info label="Division" value={d.division} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            <Info label="Type of Encroachment" value={d.type} />
            <Info label="River/Forest" value={d.siteName} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Case Proceedings</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-2 text-sm">
            <Info label="Case Type" value={d.caseType} />
            <Info label="Filing Date" value={d.filingDate} />
            <Info label="Verdict Date" value={d.verdictDate || "—"} />
            <Info label="Complainant" value={d.complainant} />
            <Info label="Hearing Dates" value={(d.hearingDates||[]).join(", ")} />
            {durationToVerdict && <Info label="Duration (filing→verdict)" value={`${durationToVerdict} days`} />}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Verdict Summary</CardTitle></CardHeader>
        <CardContent className="text-sm whitespace-pre-wrap">{d.verdictSummary || "—"}</CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Enforcement Details</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-2 text-sm">
          <Info label="Enforcement Agency" value={d.enforcement?.agency} />
          <Info label="Compliance Deadline" value={d.enforcement?.complianceDeadline || "—"} />
          <Info label="Officer in-charge (Name)" value={d.enforcement?.officerName} />
          <Info label="Officer in-charge (Designation)" value={d.enforcement?.officerDesignation} />
          <Info label="Budget Allocated" value={fmtBDT(d.enforcement?.budgetAllocated)} />
          <Info label="Implementation Status" value={d.enforcement?.implementationStatus} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Action Plan</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <ol className="list-decimal space-y-1 pl-4">
            {(d.enforcement?.actionPlan||[]).map((p,i)=>(<li key={i}><span className="font-medium">Phase {p.phase} – {p.name}:</span> {p.status}</li>))}
          </ol>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Case Metrics</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-2 text-sm">
          <Info label="Area Encroached" value={`${d.metrics?.areaEncroachedAcres||0} acres`} />
          <Info label="Area Recovered" value={`${d.metrics?.areaRecoveredAcres||0} acres`} />
          <Info label="Fine Levied" value={fmtBDT(d.metrics?.fineLevied)} />
          <Info label="Fine Collected" value={fmtBDT(d.metrics?.fineCollected)} />
        </CardContent>
      </Card>
    </div>
  )
}
function Info({label,value}){return (<div><div className="text-xs text-neutral-500">{label}</div><div className="text-sm font-medium leading-snug">{value||"—"}</div></div>)}

function CreateCase({ onCreate }){
  const [form, setForm] = useState({ division:"Dhaka", type:"River" });
  const [saving, setSaving] = useState(false);
  const set = (k,v)=> setForm(prev=>({...prev, [k]:v}))
  const create = ()=>{
    setSaving(true);
    setTimeout(()=>{
      const id = `ECC/${(form.division||"DHK").slice(0,3).toUpperCase()}/${(form.filingDate||"2025").slice(0,4)}/${Math.floor(1000+Math.random()*9000)}`
      const obj = {
        caseId: id, slug: id.replaceAll("/","-"),
        title: form.title || `People vs ${form.respondent||"Respondent"}`,
        division: form.division, type: form.type, siteName: form.siteName, subject: form.subject,
        complainant: form.complainant, respondent: form.respondent, caseType: form.caseType,
        filingDate: form.filingDate, hearingDates: (form.hearingDates||"").split(",").map(s=>s.trim()).filter(Boolean),
        verdictDate: form.verdictDate || null, filedStatus: form.filedStatus || (form.verdictDate?"Verdict Given":"Filed"),
        verdictSummary: form.verdictSummary,
        enforcement: {
          agency: form.enfAgency, complianceDeadline: form.complianceDeadline,
          officerName: form.officerName, officerDesignation: form.officerDesignation,
          budgetAllocated: Number(form.budgetAllocated)||0, implementationStatus: form.implStatus || "Pending",
          actionPlan: (form.actionPlan||"").split("\\n").filter(Boolean).map((line,i)=>({phase:i+1, name: line.split(":")[0]||`Phase ${i+1}`, status: line.split(":")[1]||"Pending"}))
        },
        metrics: {
          areaEncroachedAcres: Number(form.areaEncroached)||0,
          areaRecoveredAcres: Number(form.areaRecovered)||0,
          fineLevied: Number(form.fineLevied)||0,
          fineCollected: Number(form.fineCollected)||0,
        }
      }
      onCreate(obj); setSaving(false)
    }, 500)
  }
  return (
    <div className="space-y-4 py-4 px-4">
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Case title (e.g., People vs XYZ Ltd)" onChange={e=>set("title",e.target.value)} />
        <Input placeholder="Case Type" onChange={e=>set("caseType",e.target.value)} />
        <div>
          <div className="text-xs mb-1">Division</div>
          <Select value={form.division} onValueChange={v=>set("division",v)}>
            <SelectTrigger><SelectValue placeholder="Division"/></SelectTrigger>
            <SelectContent>{DIVISIONS.map(d=>(<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs mb-1">Type</div>
          <Select value={form.type} onValueChange={v=>set("type",v)}>
            <SelectTrigger><SelectValue placeholder="River/Forest"/></SelectTrigger>
            <SelectContent>{ENCROACH_TYPES.map(t=>(<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <Input placeholder="River/Forest name (e.g., Padma River)" onChange={e=>set("siteName",e.target.value)} />
        <Input placeholder="Subject (what happened)" onChange={e=>set("subject",e.target.value)} />
        <Input placeholder="Complainant" onChange={e=>set("complainant",e.target.value)} />
        <Input placeholder="Respondent" onChange={e=>set("respondent",e.target.value)} />
        <div>
          <div className="text-xs mb-1">Filing Date</div>
          <Input type="date" onChange={e=>set("filingDate",e.target.value)} />
        </div>
        <Input placeholder="Hearing Dates (comma separated YYYY-MM-DD)" onChange={e=>set("hearingDates",e.target.value)} />
        <div>
          <div className="text-xs mb-1">Verdict Date (optional)</div>
          <Input type="date" onChange={e=>set("verdictDate",e.target.value)} />
        </div>
        <div>
          <div className="text-xs mb-1">Filed Status</div>
          <Select onValueChange={v=>set("filedStatus",v)}>
            <SelectTrigger><SelectValue placeholder="Filed status"/></SelectTrigger>
            <SelectContent>{STATUS_FILED.map(s=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>

      <Textarea placeholder="Verdict Summary" onChange={e=>set("verdictSummary",e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Enforcement Agency" onChange={e=>set("enfAgency",e.target.value)} />
        <div>
          <div className="text-xs mb-1">Compliance Deadline</div>
          <Input type="date" placeholder="Compliance Deadline" onChange={e=>set("complianceDeadline",e.target.value)} />
        </div>
        <Input placeholder="Officer Name" onChange={e=>set("officerName",e.target.value)} />
        <Input placeholder="Officer Designation" onChange={e=>set("officerDesignation",e.target.value)} />
        <Input placeholder="Budget Allocated (BDT)" onChange={e=>set("budgetAllocated",e.target.value)} />
        <div>
          <div className="text-xs mb-1">Implementation Status</div>
          <Select onValueChange={v=>set("implStatus",v)}>
            <SelectTrigger><SelectValue placeholder="Implementation Status"/></SelectTrigger>
            <SelectContent>{IMPLEMENTATION_STATUS.map(s=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>

      <Textarea placeholder={"Action Plan (one per line, e.g.\\nNotice & Demarcation: Completed\\nEviction Drive: Pending)"} onChange={e=>set("actionPlan",e.target.value)} />

      <div className="grid grid-cols-4 gap-3">
        <Input placeholder="Area Encroached (acres)" onChange={e=>set("areaEncroached",e.target.value)} />
        <Input placeholder="Area Recovered (acres)" onChange={e=>set("areaRecovered",e.target.value)} />
        <Input placeholder="Fine Levied (BDT)" onChange={e=>set("fineLevied",e.target.value)} />
        <Input placeholder="Fine Collected (BDT)" onChange={e=>set("fineCollected",e.target.value)} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={()=>window.alert("This is a demo. Data is stored in memory only.")}>Cancel</Button>
        <Button onClick={create} disabled={saving}>{saving? "Saving…" : "+ Create Case"}</Button>
      </div>

      <div className="text-[10px] text-neutral-500">Note: Workshop demo only. This form does not constitute legal filing.</div>
    </div>
  )
}

function Stats({ cases }){
  const kpis = useMemo(()=>{
    const active = cases.filter(c=>["Filed","In Trial","Verdict Given"].includes(c.filedStatus)).length;
    const durations = cases.filter(c=>c.verdictDate).map(c=>daysBetween(c.filingDate,c.verdictDate));
    const avgDuration = durations.length? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length) : 0;
    const finesLevied = cases.reduce((s,c)=>s+(c.metrics?.fineLevied||0),0);
    const finesCollected = cases.reduce((s,c)=>s+(c.metrics?.fineCollected||0),0);
    const areaEnc = cases.reduce((s,c)=>s+(c.metrics?.areaEncroachedAcres||0),0);
    const areaRec = cases.reduce((s,c)=>s+(c.metrics?.areaRecoveredAcres||0),0);
    const withVerdict = cases.filter(c=>c.filedStatus==="Verdict Given");
    const completed = cases.filter(c=>String(c.enforcement?.implementationStatus||"").startsWith("Completed"));
    const complianceRate = withVerdict.length ? Math.round((completed.length/withVerdict.length)*100) : 0;
    return { active, avgDuration, finesLevied, finesCollected, areaEnc, areaRec, complianceRate };
  },[cases])

  const statusDist = useMemo(()=>{
    const map = new Map();
    IMPLEMENTATION_STATUS.forEach(s=>map.set(s,0));
    cases.forEach(c=>map.set(c.enforcement?.implementationStatus || "Pending", (map.get(c.enforcement?.implementationStatus || "Pending")||0)+1));
    return Array.from(map.entries()).map(([name,value])=>({ name, value }))
  },[cases])

  const finesByDivision = useMemo(()=>{
    const map = new Map();
    DIVISIONS.forEach(d=>map.set(d,{division:d, levied:0, collected:0}))
    cases.forEach(c=>{
      const ent = map.get(c.division);
      ent.levied += (c.metrics?.fineLevied||0);
      ent.collected += (c.metrics?.fineCollected||0);
    })
    return Array.from(map.values())
  },[cases])

  const filingsByMonth = useMemo(()=>{
    const map = new Map();
    cases.forEach(c=>{
      const key = (c.filingDate||"").slice(0,7); if(!key) return; map.set(key,(map.get(key)||0)+1);
    })
    return Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([month,count])=>({month,count}))
  },[cases])

  const win = useWindowSize();
  return (
    <section className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <KPI label="Total Active Cases" value={kpis.active} />
        <KPI label="Average Time to Verdict" value={`${kpis.avgDuration} days`} sub="(median coming soon)" />
        <KPI label="Compliance Rate (verdict→completed)" value={`${kpis.complianceRate}%`} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Area (YTD)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <KPI label="Total Area Encroached" value={`${kpis.areaEnc} acres`} />
            <KPI label="Total Area Recovered" value={`${kpis.areaRec} acres`} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Fines (YTD)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <KPI label="Total Fines Levied" value={fmtBDT(kpis.finesLevied)} />
            <KPI label="Total Fines Collected" value={fmtBDT(kpis.finesCollected)} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Cases by Implementation Status</CardTitle></CardHeader>
          <CardContent style={{height:220}}>
            <ResponsiveContainer key={win.w} width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} />
                <Legend />
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Fines Levied vs Collected by Division</CardTitle></CardHeader>
          <CardContent style={{height:300}}>
            <ResponsiveContainer key={win.w} width="100%" height="100%">
              <BarChart data={finesByDivision}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="division" />
                <YAxis />
                <Legend />
                <RTooltip formatter={(v)=>fmtBDT(v)} />
                <Bar dataKey="levied" name="Levied" />
                <Bar dataKey="collected" name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Filings per Month</CardTitle></CardHeader>
          <CardContent style={{height:300}}>
            <ResponsiveContainer key={win.w} width="100%" height="100%">
              <LineChart data={filingsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Legend />
                <RTooltip />
                <Line type="monotone" dataKey="count" name="Filings" />
              </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Download Current Dataset</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={()=>downloadJSON("efa_cases.json", cases)}><span className="mr-1">⬇</span> Export JSON</Button>
          <span className="text-xs text-neutral-500 ml-2">Use this for offline review or loading into another tool.</span>
        </CardContent>
      </Card>
    </section>
  )
}
function downloadJSON(name, data){
  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),500);
}

function About(){
  const win = useWindowSize();
  return (
    <section className="space-y-3 max-w-3xl">
      <h2 className="text-xl font-semibold">About this Prototype</h2>
      <p className="text-neutral-700">This workshop prototype demonstrates a case database, detail view, enforcement tracking, and analytics for environmental encroachment cases in Bangladesh. Data here is synthetic and for testing only.</p>
      <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
        <li>Built for <span className="font-medium">Evidence for Accountability</span> (FCDO Frontier Tech Hub, YPF).</li>
        <li>Fields align with the mockup: Case Summary, Basic Info, Proceedings, Verdict, Enforcement, Action Plan, Metrics.</li>
        <li>No personal data beyond synthetic officer names; replace with real info post-MoU and legal review.</li>
      </ul>
      <p className="text-xs text-neutral-500">Disclaimer: Educational prototype. Not a court filing system; does not provide legal advice.</p>
    </section>
  )
}
