import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

import { getMonumentImage } from './imageConfig';

// ── Inline styles & theme ─────────────────────────────────────────────────────
const T = {
  bg0: '#060a0f', bg1: '#0c1420', bg2: '#101c2c', bg3: '#142030',
  border: '#1e3448', borderBright: '#2a4a6a',
  accent: '#00d4ff', accentDim: '#0099cc', accentGlow: 'rgba(0,212,255,0.15)',
  gold: '#ffc947', goldDim: '#cc9900',
  red: '#ff3b3b', redDim: '#cc0000', redGlow: 'rgba(255,59,59,0.15)',
  orange: '#ff8c00', orangeGlow: 'rgba(255,140,0,0.15)',
  green: '#00e676', greenDim: '#00b248', greenGlow: 'rgba(0,230,118,0.15)',
  text: '#e8f4f8', textDim: '#8ba8be', textMuted: '#4a6880',
  fontHead: "'Rajdhani', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  fontBody: "'Noto Sans', sans-serif",
};

const css = (obj) => Object.entries(obj).map(([k,v])=>`${k.replace(/([A-Z])/g,'-$1').toLowerCase()}:${v}`).join(';');

// ── Sample data ───────────────────────────────────────────────────────────────
const MONUMENTS = [
  { id:'taj-mahal', name:'Taj Mahal', state:'Uttar Pradesh', city:'Agra', lat:27.1751, lng:78.0421, status:'critical', riskScore:87, yearBuilt:1653, category:'World Heritage Site', description:'Iconic Mughal-era mausoleum, UNESCO World Heritage Site, symbol of India.', threats:['Encroachment','Air Pollution','Tourism Pressure'], detections:{ encroachment:{detected:true,distance:45,zone:'prohibited',confidence:0.94}, vegetation:{detected:true,coverage:12,type:'Moss & Algae',confidence:0.88}, structural:{detected:true,severity:'moderate',cracks:3,confidence:0.91}, vandalism:{detected:false,confidence:0.97} }, alerts:[{type:'encroachment',message:'Illegal construction 45m from boundary',severity:'critical',time:'2h ago'},{type:'vegetation',message:'Moss growth on north minaret',severity:'warning',time:'6h ago'}] },
  { id:'qutub-minar', name:'Qutub Minar', state:'Delhi', city:'New Delhi', lat:28.5244, lng:77.1855, status:'warning', riskScore:62, yearBuilt:1193, category:'World Heritage Site', description:'UNESCO-listed minaret complex, oldest mosque in India, 12th century Mamluk architecture.', threats:['Vegetation Overgrowth','Structural Fatigue','Urban Encroachment'], detections:{ encroachment:{detected:true,distance:180,zone:'regulated',confidence:0.86}, vegetation:{detected:true,coverage:23,type:'Weeds & Creepers',confidence:0.92}, structural:{detected:false,confidence:0.89}, vandalism:{detected:false,confidence:0.99} }, alerts:[{type:'vegetation',message:'Creeper growth on boundary walls',severity:'warning',time:'4h ago'}] },
  { id:'hampi', name:'Hampi Ruins', state:'Karnataka', city:'Hampi', lat:15.3350, lng:76.4600, status:'critical', riskScore:91, yearBuilt:1336, category:'World Heritage Site', description:'Vijayanagara Empire ruins across 4,100 hectares, UNESCO World Heritage Site.', threats:['Illegal Construction','Vegetation Damage','Structural Collapse'], detections:{ encroachment:{detected:true,distance:28,zone:'prohibited',confidence:0.97}, vegetation:{detected:true,coverage:45,type:'Trees & Shrubs',confidence:0.95}, structural:{detected:true,severity:'severe',cracks:12,confidence:0.93}, vandalism:{detected:true,type:'Graffiti',confidence:0.88} }, alerts:[{type:'encroachment',message:'New construction 28m from protected zone',severity:'critical',time:'30m ago'},{type:'structural',message:'12 cracks detected on Virupaksha Temple',severity:'critical',time:'3h ago'},{type:'vandalism',message:'Graffiti on eastern wall',severity:'warning',time:'12h ago'}] },
  { id:'konark-sun-temple', name:'Konark Sun Temple', state:'Odisha', city:'Konark', lat:19.8876, lng:86.0945, status:'warning', riskScore:74, yearBuilt:1250, category:'World Heritage Site', description:'13th-century Sun Temple, UNESCO World Heritage Site, masterpiece of Kalinga architecture.', threats:['Coastal Erosion','Salt Damage','Vegetation'], detections:{ encroachment:{detected:false,confidence:0.95}, vegetation:{detected:true,coverage:18,type:'Coastal Weeds',confidence:0.90}, structural:{detected:true,severity:'moderate',cracks:7,confidence:0.87}, vandalism:{detected:false,confidence:0.98} }, alerts:[{type:'structural',message:'Salt crystallization damage on outer walls',severity:'warning',time:'8h ago'}] },
  { id:'ajanta-caves', name:'Ajanta Caves', state:'Maharashtra', city:'Aurangabad', lat:20.5519, lng:75.7033, status:'safe', riskScore:28, yearBuilt:200, category:'World Heritage Site', description:'2nd century BCE Buddhist cave monuments with exquisite paintings.', threats:['Humidity','Minor Vegetation'], detections:{ encroachment:{detected:false,confidence:0.99}, vegetation:{detected:true,coverage:8,type:'Moss',confidence:0.82}, structural:{detected:false,confidence:0.94}, vandalism:{detected:false,confidence:0.99} }, alerts:[] },
  { id:'red-fort', name:'Red Fort', state:'Delhi', city:'New Delhi', lat:28.6562, lng:77.2410, status:'warning', riskScore:55, yearBuilt:1648, category:'World Heritage Site', description:'Mughal Emperor Shah Jahan palace complex, UNESCO World Heritage Site.', threats:['Urban Pressure','Air Pollution'], detections:{ encroachment:{detected:true,distance:220,zone:'regulated',confidence:0.79}, vegetation:{detected:true,coverage:15,type:'Grass & Weeds',confidence:0.85}, structural:{detected:false,confidence:0.91}, vandalism:{detected:true,type:'Minor Graffiti',confidence:0.76} }, alerts:[{type:'vandalism',message:'Minor graffiti on inner boundary wall',severity:'warning',time:'5h ago'}] },
  { id:'khajuraho', name:'Khajuraho Temples', state:'Madhya Pradesh', city:'Khajuraho', lat:24.8318, lng:79.9199, status:'safe', riskScore:32, yearBuilt:950, category:'World Heritage Site', description:'Chandela dynasty temples with intricate sculptural artwork.', threats:['Minor Vegetation','Weathering'], detections:{ encroachment:{detected:false,confidence:0.97}, vegetation:{detected:true,coverage:11,type:'Lichen',confidence:0.84}, structural:{detected:false,confidence:0.93}, vandalism:{detected:false,confidence:0.99} }, alerts:[] },
  { id:'ellora-caves', name:'Ellora Caves', state:'Maharashtra', city:'Aurangabad', lat:20.0258, lng:75.1780, status:'safe', riskScore:22, yearBuilt:600, category:'World Heritage Site', description:'34 monasteries and temples of Buddhist, Hindu, and Jain faith.', threats:['Minor Humidity'], detections:{ encroachment:{detected:false,confidence:0.99}, vegetation:{detected:false,confidence:0.96}, structural:{detected:false,confidence:0.98}, vandalism:{detected:false,confidence:0.99} }, alerts:[] },
];

const statusColor = (s) => s==='critical' ? T.red : s==='warning' ? T.orange : T.green;
const statusBg = (s) => s==='critical' ? T.redGlow : s==='warning' ? T.orangeGlow : T.greenGlow;

// ── Shared UI components ──────────────────────────────────────────────────────
const Badge = ({status}) => (
  <span style={{background:statusBg(status),color:statusColor(status),border:`1px solid ${statusColor(status)}`,padding:'2px 10px',borderRadius:3,fontFamily:T.fontMono,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:'uppercase'}}>
    {status}
  </span>
);

const StatCard = ({label,value,sub,color=T.accent,icon}) => (
  <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:'18px 22px',flex:1,minWidth:160,position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:color}}/>
    <div style={{fontFamily:T.fontMono,fontSize:11,color:T.textMuted,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>{label}</div>
    <div style={{fontFamily:T.fontHead,fontSize:32,fontWeight:700,color,lineHeight:1}}>{value}</div>
    {sub && <div style={{fontFamily:T.fontBody,fontSize:12,color:T.textDim,marginTop:4}}>{sub}</div>}
  </div>
);

const SectionHeader = ({title,sub}) => (
  <div style={{marginBottom:20}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:3,height:22,background:T.accent,borderRadius:2}}/>
      <h2 style={{margin:0,fontFamily:T.fontHead,fontSize:20,fontWeight:700,color:T.text,letterSpacing:1}}>{title}</h2>
    </div>
    {sub && <div style={{fontFamily:T.fontBody,fontSize:13,color:T.textDim,marginTop:4,marginLeft:13}}>{sub}</div>}
  </div>
);

const AlertItem = ({alert}) => {
  const col = alert.severity==='critical' ? T.red : T.orange;
  const icons = {encroachment:'⚠', vegetation:'🌿', structural:'🔩', vandalism:'🎨'};
  return (
    <div style={{display:'flex',gap:12,padding:'10px 14px',borderBottom:`1px solid ${T.border}`,alignItems:'flex-start'}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:col,marginTop:5,flexShrink:0,boxShadow:`0 0 6px ${col}`}}/>
      <div style={{flex:1}}>
        <div style={{fontFamily:T.fontBody,fontSize:13,color:T.text}}>{icons[alert.type]||'⚡'} {alert.message}</div>
        <div style={{fontFamily:T.fontMono,fontSize:11,color:T.textMuted,marginTop:2}}>{alert.type.toUpperCase()} · {alert.time}</div>
      </div>
      <span style={{background:col+'22',color:col,border:`1px solid ${col}`,padding:'1px 8px',borderRadius:3,fontFamily:T.fontMono,fontSize:10,flexShrink:0}}>{alert.severity}</span>
    </div>
  );
};

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
const DashboardPage = ({onSelectMonument}) => {
  const [stats] = useState({
    total:3691,active:58,health:98.4,detections:1247,critical:14,warning:31,safe:3646,reports:89
  });
  const [tick,setTick] = useState(0);
  useEffect(()=>{const i=setInterval(()=>setTick(t=>t+1),3000);return()=>clearInterval(i);},[]);

  const allAlerts = MONUMENTS.flatMap(m=>m.alerts.map(a=>({...a,monument:m.name,monumentId:m.id})));
  const critAlerts = allAlerts.filter(a=>a.severity==='critical');
  const warnAlerts = allAlerts.filter(a=>a.severity==='warning');

  const barData = {
    labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets:[
      {label:'Encroachment',data:[12,19,15,23,18,27,21,31,25,29,34,28],backgroundColor:'rgba(255,59,59,0.6)',borderColor:T.red,borderWidth:1},
      {label:'Structural',data:[8,11,9,14,12,16,13,18,15,20,17,22],backgroundColor:'rgba(255,140,0,0.6)',borderColor:T.orange,borderWidth:1},
      {label:'Vegetation',data:[23,28,31,27,35,29,38,33,40,36,42,39],backgroundColor:'rgba(0,230,118,0.4)',borderColor:T.green,borderWidth:1},
    ]
  };

  const donutData = {
    labels:['Encroachment','Vegetation','Structural','Vandalism','Other'],
    datasets:[{data:[38,27,21,9,5],backgroundColor:['#ff3b3b','#00e676','#ff8c00','#ffc947','#00d4ff'],borderWidth:0}]
  };

  const lineData = {
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets:[{label:'AI Detections',data:[980,1120,1050,1310,1247,1180,1290],fill:true,backgroundColor:'rgba(0,212,255,0.08)',borderColor:T.accent,tension:0.4,pointBackgroundColor:T.accent}]
  };

  const chartOpts = {responsive:true,plugins:{legend:{labels:{color:T.textDim,font:{family:T.fontBody}}},tooltip:{backgroundColor:T.bg2,titleColor:T.accent,bodyColor:T.text,borderColor:T.border,borderWidth:1}},scales:{x:{ticks:{color:T.textDim},grid:{color:T.border}},y:{ticks:{color:T.textDim},grid:{color:T.border}}}};

  return (
    <div style={{padding:24}}>
      {/* System Status Bar */}
      <div style={{display:'flex',gap:8,alignItems:'center',background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:'8px 16px',marginBottom:20}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:T.green,animation:'pulse 2s infinite',boxShadow:`0 0 8px ${T.green}`}}/>
        <span style={{fontFamily:T.fontMono,fontSize:12,color:T.green}}>ALL SYSTEMS OPERATIONAL</span>
        <span style={{marginLeft:'auto',fontFamily:T.fontMono,fontSize:11,color:T.textMuted}}>LAST SYNC: {new Date().toLocaleTimeString()} IST</span>
        <span style={{fontFamily:T.fontMono,fontSize:11,color:T.textMuted}}>|</span>
        <span style={{fontFamily:T.fontMono,fontSize:11,color:T.accent}}>SATELLITE: ACTIVE</span>
        <span style={{fontFamily:T.fontMono,fontSize:11,color:T.textMuted}}>|</span>
        <span style={{fontFamily:T.fontMono,fontSize:11,color:T.accent}}>AI ENGINE: RUNNING</span>
      </div>

      {/* Stat Cards */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <StatCard label="Total Monuments" value={stats.total.toLocaleString()} sub="ASI Protected Sites" color={T.accent}/>
        <StatCard label="Active Alerts" value={stats.active} sub={`${critAlerts.length} Critical · ${warnAlerts.length} Warning`} color={T.red}/>
        <StatCard label="AI Detections Today" value={stats.detections.toLocaleString()} sub="Across all satellite passes" color={T.gold}/>
        <StatCard label="System Health" value={stats.health+'%'} sub="All sensors nominal" color={T.green}/>
        <StatCard label="Reports Generated" value={stats.reports} sub="This month" color={T.orange}/>
      </div>

      {/* Status Overview */}
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        {[{label:'CRITICAL',val:stats.critical,color:T.red},{label:'WARNING',val:stats.warning,color:T.orange},{label:'SAFE',val:stats.safe.toLocaleString(),color:T.green}].map(s=>(
          <div key={s.label} style={{flex:1,background:s.color+'11',border:`1px solid ${s.color}44`,borderRadius:6,padding:'12px 20px',textAlign:'center'}}>
            <div style={{fontFamily:T.fontMono,fontSize:11,color:s.color,letterSpacing:2}}>{s.label}</div>
            <div style={{fontFamily:T.fontHead,fontSize:36,fontWeight:700,color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
        {/* Incident Trends */}
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:20}}>
          <SectionHeader title="Incident Detection Trends" sub="Monthly breakdown by category"/>
          <Bar data={barData} options={chartOpts}/>
        </div>
        {/* Threat Breakdown */}
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:20}}>
          <SectionHeader title="Threat Distribution" sub="Current active incidents"/>
          <Doughnut data={donutData} options={{responsive:true,plugins:{legend:{position:'bottom',labels:{color:T.textDim,font:{family:T.fontBody},padding:8}},tooltip:{backgroundColor:T.bg2,borderColor:T.border,borderWidth:1}}}}/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:16}}>
        {/* AI Detection Activity */}
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:20}}>
          <SectionHeader title="AI Detection Activity" sub="Past 7 days"/>
          <Line data={lineData} options={chartOpts}/>
        </div>
        {/* Recent Alerts Feed */}
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontFamily:T.fontHead,fontSize:16,fontWeight:700,color:T.text}}>Live Alert Feed</span>
            <span style={{fontFamily:T.fontMono,fontSize:11,color:T.red,animation:'blink 1.5s infinite'}}>● LIVE</span>
          </div>
          <div style={{maxHeight:280,overflowY:'auto'}}>
            {allAlerts.length===0 && <div style={{padding:20,color:T.textMuted,fontFamily:T.fontBody,fontSize:13}}>No active alerts</div>}
            {allAlerts.map((a,i)=>(
              <div key={i} style={{cursor:'pointer'}} onClick={()=>onSelectMonument(MONUMENTS.find(m=>m.id===a.monumentId))}>
                <AlertItem alert={a}/>
                <div style={{paddingLeft:34,paddingBottom:8,fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>{a.monument}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAP PAGE ──────────────────────────────────────────────────────────────────
const MapPage = ({onSelectMonument, selectedMonument}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(()=>{
    if(mapInstanceRef.current) return;
    const L = window.L;
    if(!L) return;

    const map = L.map(mapRef.current, {
      center:[22,82], zoom:5,
      attributionControl:false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);

    const makeIcon = (status) => {
      const col = statusColor(status);
      return L.divIcon({
        html:`<div style="width:16px;height:16px;border-radius:50%;background:${col};border:2px solid #fff;box-shadow:0 0 10px ${col};"></div>`,
        iconSize:[16,16],iconAnchor:[8,8],className:''
      });
    };

    MONUMENTS.forEach(m=>{
      const marker = L.marker([m.lat,m.lng],{icon:makeIcon(m.status)})
        .addTo(map)
        .bindTooltip(`<div style="background:#0c1420;color:#e8f4f8;border:1px solid #1e3448;padding:6px 10px;border-radius:4px;font-family:monospace;font-size:12px;"><strong>${m.name}</strong><br/>Risk: ${m.riskScore}/100</div>`,{permanent:false,className:'heritage-tooltip'})
        .on('click',()=>onSelectMonument(m));
      markersRef.current.push(marker);
    });

    mapInstanceRef.current = map;
  },[onSelectMonument]);

  const critCount = MONUMENTS.filter(m=>m.status==='critical').length;
  const warnCount = MONUMENTS.filter(m=>m.status==='warning').length;
  const safeCount = MONUMENTS.filter(m=>m.status==='safe').length;

  return (
    <div style={{display:'flex',gap:0,height:'calc(100vh - 60px)'}}>
      {/* Map */}
      <div style={{flex:1,position:'relative'}}>
        <div style={{position:'absolute',top:12,left:12,zIndex:1000,background:T.bg1+'ee',border:`1px solid ${T.border}`,borderRadius:6,padding:'10px 14px'}}>
          <div style={{fontFamily:T.fontMono,fontSize:11,color:T.textMuted,marginBottom:8,letterSpacing:1}}>LEGEND</div>
          {[['Critical',T.red,critCount],['Warning',T.orange,warnCount],['Safe',T.green,safeCount]].map(([l,c,n])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:c,boxShadow:`0 0 6px ${c}`}}/>
              <span style={{fontFamily:T.fontBody,fontSize:12,color:T.textDim}}>{l}</span>
              <span style={{fontFamily:T.fontMono,fontSize:11,color:c,marginLeft:'auto'}}>{n}</span>
            </div>
          ))}
        </div>
        <div style={{position:'absolute',top:12,right:12,zIndex:1000,background:T.bg1+'ee',border:`1px solid ${T.border}`,borderRadius:6,padding:'10px 14px',maxWidth:200}}>
          <div style={{fontFamily:T.fontMono,fontSize:11,color:T.accent,letterSpacing:1}}>SATELLITE MODE</div>
          <div style={{fontFamily:T.fontBody,fontSize:12,color:T.textDim,marginTop:4}}>Monitoring {MONUMENTS.length} demo sites</div>
          <div style={{fontFamily:T.fontBody,fontSize:12,color:T.textDim}}>3,691 total ASI monuments</div>
        </div>
        <div ref={mapRef} style={{width:'100%',height:'100%'}}/>
      </div>

      {/* Monument detail panel */}
      {selectedMonument && (
        <div style={{width:360,background:T.bg1,borderLeft:`1px solid ${T.border}`,overflowY:'auto',flexShrink:0}}>
          <MonumentPanel monument={selectedMonument} onSelectMonument={onSelectMonument}/>
        </div>
      )}

      {!selectedMonument && (
        <div style={{width:320,background:T.bg1,borderLeft:`1px solid ${T.border}`,padding:16,overflowY:'auto',flexShrink:0}}>
          <div style={{fontFamily:T.fontHead,fontSize:16,fontWeight:700,color:T.text,marginBottom:12}}>MONUMENT INDEX</div>
          {MONUMENTS.sort((a,b)=>b.riskScore-a.riskScore).map(m=>(
            <div key={m.id} onClick={()=>onSelectMonument(m)} style={{cursor:'pointer',padding:'10px 12px',borderRadius:4,border:`1px solid ${T.border}`,marginBottom:8,background:T.bg2,transition:'all 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=statusColor(m.status)}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontFamily:T.fontHead,fontSize:14,fontWeight:600,color:T.text}}>{m.name}</span>
                <Badge status={m.status}/>
              </div>
              <div style={{fontFamily:T.fontBody,fontSize:12,color:T.textDim}}>{m.city}, {m.state}</div>
              <div style={{marginTop:6,height:4,background:T.bg0,borderRadius:2}}>
                <div style={{height:'100%',borderRadius:2,background:statusColor(m.status),width:`${m.riskScore}%`}}/>
              </div>
              <div style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted,marginTop:2}}>RISK: {m.riskScore}/100</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── MONUMENT PANEL ────────────────────────────────────────────────────────────
const MonumentPanel = ({monument:m, onClose, inModal}) => {
  const col = statusColor(m.status);

  return (
    <div style={{fontFamily:T.fontBody}}>
      {/* Photo Header */}
      <div style={{
        width:'100%',
        height:160,
        overflow:'hidden',
        borderBottom:`1px solid ${T.border}`,
        position:'relative'
      }}>
        <img
          src={getMonumentImage(m.id, 'main')}
          alt={m.name}
          style={{
            width:'100%',
            height:'100%',
            objectFit:'cover',
            filter:'brightness(0.7) saturate(0.8)'
          }}
          onError={(e) => {
            console.error("Image failed to load:", e.target.src);
            e.target.src = 'https://picsum.photos/seed/fallback/800/500';
          }}
        />
        <div style={{
          position:'absolute',
          bottom:0,left:0,right:0,
          background:'linear-gradient(transparent, rgba(6,10,15,0.9))',
          height:60
        }}/>
      </div>

      {/* Header Info */}
      <div style={{background:col+'15',borderBottom:`1px solid ${T.border}`,padding:'16px 20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontFamily:T.fontHead,fontSize:20,fontWeight:700,color:T.text}}>{m.name}</div>
            <div style={{fontSize:13,color:T.textDim,marginTop:2}}>{m.city}, {m.state}</div>
          </div>
          <Badge status={m.status}/>
        </div>
        <div style={{marginTop:10,display:'flex',gap:16}}>
          <div><span style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>RISK SCORE</span><div style={{fontFamily:T.fontMono,fontSize:22,color:col,fontWeight:700}}>{m.riskScore}</div></div>
          <div><span style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>BUILT</span><div style={{fontFamily:T.fontMono,fontSize:16,color:T.text}}>{m.yearBuilt}</div></div>
          <div><span style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>CATEGORY</span><div style={{fontSize:12,color:T.accent,marginTop:2}}>{m.category}</div></div>
        </div>
        <div style={{marginTop:8,height:6,background:T.bg0,borderRadius:3}}>
          <div style={{height:'100%',borderRadius:3,background:col,width:`${m.riskScore}%`,boxShadow:`0 0 6px ${col}`}}/>
        </div>
      </div>

      {/* Detection Results */}
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${T.border}`}}>
        <div style={{fontFamily:T.fontHead,fontSize:14,fontWeight:600,color:T.text,marginBottom:10,letterSpacing:1}}>AI DETECTION RESULTS</div>
        {[
          {key:'encroachment',label:'Encroachment',model:'YOLOv8'},
          {key:'vegetation',label:'Vegetation',model:'DeepLabV3+'},
          {key:'structural',label:'Structural Damage',model:'Mask-RCNN'},
          {key:'vandalism',label:'Vandalism',model:'YOLOv8'},
        ].map(({key,label,model})=>{
          const d = m.detections[key];
          return (
            <div key={key} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,padding:'8px 10px',background:T.bg2,borderRadius:4,border:`1px solid ${d.detected?col+'44':T.border}`}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:d.detected?col:T.green,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:T.text,fontWeight:500}}>{label}</div>
                <div style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>{model} · {(d.confidence*100).toFixed(0)}% conf</div>
              </div>
              <span style={{fontFamily:T.fontMono,fontSize:11,color:d.detected?col:T.green}}>{d.detected?'DETECTED':'CLEAR'}</span>
            </div>
          );
        })}
      </div>

      {/* Encroachment Zone Info */}
      {m.detections.encroachment.detected && (
        <div style={{padding:'14px 20px',background:T.red+'0a',borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontFamily:T.fontMono,fontSize:11,color:T.red,letterSpacing:1,marginBottom:6}}>⚠ ENCROACHMENT ALERT</div>
          <div style={{fontSize:13,color:T.text}}>Structure detected at <strong style={{color:T.red}}>{m.detections.encroachment.distance}m</strong> from monument boundary</div>
          <div style={{marginTop:4,fontSize:12,color:T.textDim}}>Zone: <span style={{color:m.detections.encroachment.zone==='prohibited'?T.red:T.orange,textTransform:'uppercase',fontWeight:600}}>{m.detections.encroachment.zone}</span> (0–100m restricted, 100–300m regulated)</div>
        </div>
      )}

      {/* Active Alerts */}
      {m.alerts.length > 0 && (
        <div style={{padding:'0 0 12px'}}>
          <div style={{padding:'12px 20px 8px',fontFamily:T.fontHead,fontSize:14,fontWeight:600,color:T.text,letterSpacing:1}}>ACTIVE ALERTS</div>
          {m.alerts.map((a,i)=><AlertItem key={i} alert={a}/>)}
        </div>
      )}

      {m.alerts.length===0 && (
        <div style={{padding:'16px 20px',color:T.green,fontFamily:T.fontMono,fontSize:12}}>✓ No active alerts</div>
      )}
    </div>
  );
};

// ── AI DETECTION VIEWER ───────────────────────────────────────────────────────
const DetectionPage = ({selectedMonument}) => {
  const [monument, setMonument] = useState(selectedMonument || MONUMENTS[0]);
  const [detType, setDetType] = useState('encroachment');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [sliderVal, setSliderVal] = useState(50);
  const canvasRef = useRef(null);

  const runDetection = useCallback(async ()=>{
    setRunning(true);
    setResult(null);
    try {
      // Call the real AI backend
      const res = await axios.post('http://localhost:8000/api/detect', {
        monument_id: monument.id,
        detection_type: detType
      });
      setResult({
        ...res.data,
        time: (res.data.processing_time_ms / 1000).toFixed(2) + 's',
        model: res.data.model_name
      });
    } catch (err) {
      console.error("AI Service Error:", err);
      // Fallback if backend is down
      const d = monument.detections[detType] || {};
      setResult({...d, model:'Fallback (Service Offline)', time:'0.00s', bounding_boxes:[], detected: false});
    }
    setRunning(false);
  },[monument,detType]);

  // Draw detection canvas
  useEffect(()=>{
    if(!result||!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(result.detected && result.bounding_boxes){
      const col = statusColor(monument.status);
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.fillStyle = col+'33';

      result.bounding_boxes.forEach(b=>{
        // The backend returns normalized coordinates 0-1, or we assume it might.
        // Wait, in our Python backend we normalized by dividing by img_w, so they are 0.0 to 1.0!
        const x = b.x * canvas.width;
        const y = b.y * canvas.height;
        const w = b.width * canvas.width;
        const h = b.height * canvas.height;
        
        ctx.fillRect(x,y,w,h);
        ctx.strokeRect(x,y,w,h);
        ctx.fillStyle = col;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(b.label+` ${(b.confidence*100).toFixed(0)}%`, x+4, y-6);
        ctx.fillStyle = col+'33';
      });
    }
  },[result, monument]);

  const detTypes = [
    {key:'encroachment',label:'Encroachment Detection',model:'YOLOv8-Heritage'},
    {key:'vegetation',label:'Vegetation Segmentation',model:'DeepLabV3+'},
    {key:'structural',label:'Structural Damage',model:'Mask-RCNN'},
    {key:'change',label:'Change Detection',model:'Siamese U-Net'},
  ];

  const imgSeed = `${monument.id}-${detType}`;

  return (
    <div style={{padding:24}}>
      <SectionHeader title="AI Detection Viewer" sub="Computer vision analysis of monument satellite imagery"/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
        {/* Controls */}
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:16}}>
          <div style={{fontFamily:T.fontHead,fontSize:14,color:T.text,marginBottom:10,letterSpacing:1}}>SELECT MONUMENT</div>
          {MONUMENTS.map(m=>(
            <div key={m.id} onClick={()=>{setMonument(m);setResult(null);}} style={{cursor:'pointer',padding:'8px 10px',borderRadius:4,marginBottom:6,border:`1px solid ${monument.id===m.id?statusColor(m.status):T.border}`,background:monument.id===m.id?statusColor(m.status)+'11':T.bg2}}>
              <div style={{fontFamily:T.fontBody,fontSize:13,color:T.text,fontWeight:monument.id===m.id?600:400}}>{m.name}</div>
              <Badge status={m.status}/>
            </div>
          ))}

          <div style={{marginTop:16,fontFamily:T.fontHead,fontSize:14,color:T.text,marginBottom:10,letterSpacing:1}}>DETECTION TYPE</div>
          {detTypes.map(d=>(
            <div key={d.key} onClick={()=>{setDetType(d.key);setResult(null);}} style={{cursor:'pointer',padding:'8px 10px',borderRadius:4,marginBottom:6,border:`1px solid ${detType===d.key?T.accent:T.border}`,background:detType===d.key?T.accentGlow:T.bg2}}>
              <div style={{fontFamily:T.fontBody,fontSize:12,color:detType===d.key?T.accent:T.text}}>{d.label}</div>
              <div style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>{d.model}</div>
            </div>
          ))}

          <button onClick={runDetection} disabled={running} style={{marginTop:12,width:'100%',padding:'10px',background:running?T.bg0:T.accent,color:running?T.textMuted:T.bg0,border:'none',borderRadius:4,fontFamily:T.fontHead,fontSize:15,fontWeight:700,cursor:running?'wait':'pointer',letterSpacing:1,transition:'all 0.2s'}}>
            {running ? '⟳ ANALYZING...' : '▶ RUN DETECTION'}
          </button>
        </div>

        {/* Viewer */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Satellite Image with overlay */}
          <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontFamily:T.fontMono,fontSize:12,color:T.accent}}>SATELLITE IMAGERY · {monument.name.toUpperCase()}</span>
              {result && <span style={{fontFamily:T.fontMono,fontSize:11,color:T.green}}>✓ Analysis complete in {result.time}</span>}
            </div>
            <div style={{position:'relative',borderRadius:4,overflow:'hidden',background:'#000'}}>
              <img
                src={`${getMonumentImage(monument.id, 'satellite')}?t=${result ? result.timestamp : 'init'}`}
                alt={`${monument.name} satellite view`}
                style={{width:'100%',display:'block',opacity:0.85,objectFit:'cover',height:350}}
                onError={(e) => {
                  e.target.src = getMonumentImage(monument.id, 'after');
                }}
              />
              <canvas ref={canvasRef} width={700} height={350} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}/>
              {running && (
                <div style={{position:'absolute',inset:0,background:'#000a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
                  <div style={{fontFamily:T.fontMono,color:T.accent,fontSize:13}}>⟳ PROCESSING SATELLITE IMAGERY...</div>
                  <div style={{fontFamily:T.fontMono,color:T.textDim,fontSize:11}}>Running {detTypes.find(d=>d.key===detType)?.model}</div>
                  <div style={{width:200,height:4,background:T.border,borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',background:T.accent,borderRadius:2,animation:'progressAnim 1.8s linear'}}/>
                  </div>
                </div>
              )}
              {!result && !running && (
                <div style={{position:'absolute',inset:0,background:'#000a',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontFamily:T.fontMono,color:T.textDim,fontSize:12}}>Press RUN DETECTION to analyze</div>
                </div>
              )}
            </div>
          </div>

          {/* Before/After Slider */}
          <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:16}}>
            <div style={{fontFamily:T.fontMono,fontSize:12,color:T.accent,marginBottom:10}}>CHANGE DETECTION · BEFORE / AFTER COMPARISON</div>
            <div style={{position:'relative',borderRadius:4,overflow:'hidden',height:200}}>
              <img
                src={getMonumentImage(monument.id, 'after')}
                alt="after"
                style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}
                onError={(e) => { e.target.src = getMonumentImage(monument.id, 'main'); }}
              />
              <div style={{position:'absolute',inset:0,overflow:'hidden',width:`${sliderVal}%`}}>
                <img
                  src={getMonumentImage(monument.id, 'before')}
                  alt="before"
                  style={{width:`${10000/sliderVal}%`,maxWidth:'none',height:'100%',objectFit:'cover'}}
                  onError={(e) => { e.target.src = getMonumentImage(monument.id, 'main'); }}
                />
              </div>
              <div style={{position:'absolute',top:0,bottom:0,left:`${sliderVal}%`,width:2,background:T.accent,transform:'translateX(-50%)'}}>
                <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:T.accent,borderRadius:'50%',width:20,height:20,cursor:'col-resize'}}/>
              </div>
              <input type="range" min={0} max={100} value={sliderVal} onChange={e=>setSliderVal(e.target.value)} style={{position:'absolute',inset:0,width:'100%',opacity:0,cursor:'col-resize',height:'100%'}}/>
              <div style={{position:'absolute',top:8,left:8,fontFamily:T.fontMono,fontSize:10,background:'#000a',color:T.textDim,padding:'2px 6px',borderRadius:2}}>BEFORE 2022</div>
              <div style={{position:'absolute',top:8,right:8,fontFamily:T.fontMono,fontSize:10,background:'#000a',color:T.accent,padding:'2px 6px',borderRadius:2}}>AFTER 2024</div>
            </div>
          </div>

          {/* Detection Result */}
          {result && (
            <div style={{background:result.detected?statusBg(monument.status):T.greenGlow,border:`1px solid ${result.detected?statusColor(monument.status):T.green}`,borderRadius:6,padding:16}}>
              <div style={{fontFamily:T.fontHead,fontSize:16,fontWeight:700,color:result.detected?statusColor(monument.status):T.green,marginBottom:8}}>
                {result.detected ? `⚠ ${detTypes.find(d=>d.key===detType)?.label.toUpperCase()} DETECTED` : `✓ NO THREAT DETECTED`}
              </div>
              <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                <div><span style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>CONFIDENCE</span><div style={{fontFamily:T.fontMono,fontSize:18,color:T.text}}>{((result.confidence||0.95)*100).toFixed(1)}%</div></div>
                {result.distance && <div><span style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>DISTANCE</span><div style={{fontFamily:T.fontMono,fontSize:18,color:T.red}}>{result.distance}m</div></div>}
                {result.coverage && <div><span style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>COVERAGE</span><div style={{fontFamily:T.fontMono,fontSize:18,color:T.orange}}>{result.coverage}%</div></div>}
                {result.cracks && <div><span style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>CRACKS</span><div style={{fontFamily:T.fontMono,fontSize:18,color:T.orange}}>{result.cracks}</div></div>}
                <div><span style={{fontFamily:T.fontMono,fontSize:10,color:T.textMuted}}>MODEL</span><div style={{fontFamily:T.fontMono,fontSize:13,color:T.accent}}>{result.model}</div></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── REPORTS PAGE ──────────────────────────────────────────────────────────────
const ReportsPage = ({selectedMonument}) => {
  const [monument, setMonument] = useState(selectedMonument || MONUMENTS[0]);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const generateReport = () => {
    setGenerating(true);
    setReport(null);
    setTimeout(()=>{
      const id = `ASI-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
      const issues = [];
      if(monument.detections.encroachment.detected) issues.push({type:'Encroachment',detail:`Structure at ${monument.detections.encroachment.distance}m (${monument.detections.encroachment.zone} zone)`,severity:'CRITICAL'});
      if(monument.detections.vegetation.detected) issues.push({type:'Vegetation Overgrowth',detail:`${monument.detections.vegetation.coverage}% — ${monument.detections.vegetation.type}`,severity:'WARNING'});
      if(monument.detections.structural.detected) issues.push({type:'Structural Damage',detail:`${monument.detections.structural.severity} — ${monument.detections.structural.cracks} crack sites`,severity:'CRITICAL'});
      if(monument.detections.vandalism.detected) issues.push({type:'Vandalism',detail:monument.detections.vandalism.type,severity:'WARNING'});

      const actions = [];
      if(monument.detections.encroachment.detected && monument.detections.encroachment.zone==='prohibited'){
        actions.push('Immediate removal of unauthorized structures under AMASR Act 1958 §30');
        actions.push('File FIR with local police & issue demolition notice within 24 hours');
      }
      if(monument.detections.structural.detected) actions.push('Emergency structural assessment by conservation architect within 48 hours');
      if(monument.detections.vegetation.detected) actions.push('Deploy vegetation clearance team with bio-safe herbicide treatment');
      actions.push('Increase CCTV surveillance coverage in affected zones');
      actions.push('Schedule follow-up satellite scan in 7 days');
      actions.push('Submit incident report to UNESCO World Heritage Committee');

      setReport({id,date:new Date().toLocaleDateString('en-IN'),time:new Date().toLocaleTimeString('en-IN'),monument,issues,actions,riskScore:monument.riskScore,status:monument.status.toUpperCase()});
      setGenerating(false);
    },2200);
  };

  const printReport = () => window.print();

  return (
    <div style={{padding:24}}>
      <SectionHeader title="ASI Incident Report Generator" sub="Auto-generate official Archaeological Survey of India inspection reports"/>
      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
        {/* Selector */}
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:16}}>
          <div style={{fontFamily:T.fontHead,fontSize:14,color:T.text,marginBottom:10,letterSpacing:1}}>SELECT MONUMENT</div>
          {MONUMENTS.map(m=>(
            <div key={m.id} onClick={()=>{setMonument(m);setReport(null);}} style={{cursor:'pointer',padding:'8px 10px',borderRadius:4,marginBottom:6,border:`1px solid ${monument.id===m.id?statusColor(m.status):T.border}`,background:monument.id===m.id?statusColor(m.status)+'11':T.bg2,transition:'all 0.2s'}}>
              <div style={{fontFamily:T.fontBody,fontSize:13,color:T.text,marginBottom:3}}>{m.name}</div>
              <Badge status={m.status}/>
            </div>
          ))}
          <button onClick={generateReport} disabled={generating} style={{marginTop:16,width:'100%',padding:'12px',background:generating?T.bg0:T.gold,color:T.bg0,border:'none',borderRadius:4,fontFamily:T.fontHead,fontSize:16,fontWeight:700,cursor:generating?'wait':'pointer',letterSpacing:1,transition:'all 0.2s'}}>
            {generating ? '⟳ GENERATING...' : '📄 GENERATE ASI REPORT'}
          </button>
        </div>

        {/* Report */}
        <div style={{background:report?'#fff':T.bg1,border:`2px solid ${report?'#1a237e':T.border}`,borderRadius:6,padding:report?32:16,color:report?'#111':T.textDim,fontFamily:report?T.fontBody:T.fontMono,minHeight:500,transition:'all 0.3s'}}>
          {!report && !generating && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:400,gap:12}}>
              <div style={{fontSize:40}}>📋</div>
              <div style={{fontSize:14,color:T.textDim}}>Select a monument and click Generate to create an official ASI report</div>
            </div>
          )}
          {generating && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:400,gap:16}}>
              <div style={{fontFamily:T.fontMono,color:T.accent,fontSize:13}}>⟳ GENERATING OFFICIAL REPORT...</div>
              {['Loading satellite detections','Running AI pipeline','Calculating risk score','Formatting ASI document'].map((s,i)=>(
                <div key={i} style={{fontFamily:T.fontMono,fontSize:11,color:T.textMuted,animation:`fadeIn 0.3s ${i*0.4}s both`}}>{'> '}{s}</div>
              ))}
            </div>
          )}
          {report && (
            <div>
              {/* Report Header */}
              <div style={{textAlign:'center',borderBottom:'3px double #1a237e',paddingBottom:16,marginBottom:16}}>
                <div style={{fontFamily:T.fontHead,fontSize:13,color:'#1a237e',letterSpacing:3,fontWeight:700}}>GOVERNMENT OF INDIA — MINISTRY OF CULTURE</div>
                <div style={{fontFamily:T.fontHead,fontSize:22,fontWeight:700,color:'#111',margin:'4px 0'}}>Archaeological Survey of India</div>
                <div style={{fontSize:11,color:'#666',letterSpacing:2}}>HERITAGE MONITORING DIVISION · HeritageGuard AI SYSTEM</div>
                <div style={{marginTop:8,display:'inline-block',background:'#1a237e',color:'#fff',padding:'3px 16px',borderRadius:2,fontFamily:T.fontHead,fontSize:12,letterSpacing:2}}>OFFICIAL REPORT — RESTRICTED</div>
              </div>

              {/* Report Meta */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16,fontSize:13}}>
                <div><strong>Report ID:</strong> {report.id}</div>
                <div><strong>Date:</strong> {report.date}</div>
                <div><strong>Time:</strong> {report.time}</div>
                <div><strong>Generated By:</strong> HeritageGuard AI v2.1</div>
                <div><strong>Site Name:</strong> {report.monument.name}</div>
                <div><strong>Location:</strong> {report.monument.city}, {report.monument.state}</div>
                <div><strong>Category:</strong> {report.monument.category}</div>
                <div><strong>Year Built:</strong> {report.monument.yearBuilt}</div>
              </div>

              {/* Risk Score */}
              <div style={{background:report.status==='CRITICAL'?'#ffebee':report.status==='WARNING'?'#fff8e1':'#e8f5e9',border:`1px solid ${report.status==='CRITICAL'?'#ef9a9a':report.status==='WARNING'?'#ffe082':'#a5d6a7'}`,borderRadius:4,padding:'12px 16px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>OVERALL RISK ASSESSMENT</div>
                  <div style={{fontSize:12,color:'#555',marginTop:2}}>Status: <strong style={{color:report.status==='CRITICAL'?'#c62828':report.status==='WARNING'?'#e65100':'#2e7d32'}}>{report.status}</strong></div>
                </div>
                <div style={{fontFamily:T.fontHead,fontSize:48,fontWeight:700,color:report.status==='CRITICAL'?'#c62828':report.status==='WARNING'?'#e65100':'#2e7d32'}}>{report.riskScore}<span style={{fontSize:18}}>/100</span></div>
              </div>

              {/* Issues */}
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14,borderBottom:'1px solid #1a237e',paddingBottom:4,marginBottom:8,color:'#1a237e'}}>DETECTED ISSUES</div>
                {report.issues.length===0 && <div style={{color:'#2e7d32',fontSize:13}}>✓ No significant issues detected</div>}
                {report.issues.map((issue,i)=>(
                  <div key={i} style={{display:'flex',gap:12,padding:'6px 0',borderBottom:'1px solid #eee',fontSize:13}}>
                    <span style={{fontWeight:700,minWidth:28,color:'#555'}}>{String.fromCharCode(65+i)}.</span>
                    <div>
                      <div style={{fontWeight:600}}>{issue.type} <span style={{fontSize:11,background:issue.severity==='CRITICAL'?'#ffebee':'#fff8e1',color:issue.severity==='CRITICAL'?'#c62828':'#e65100',padding:'1px 6px',borderRadius:2,fontFamily:'monospace'}}>{issue.severity}</span></div>
                      <div style={{color:'#555',marginTop:2}}>{issue.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Models Used */}
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14,borderBottom:'1px solid #1a237e',paddingBottom:4,marginBottom:8,color:'#1a237e'}}>AI PIPELINE USED</div>
                <div style={{fontSize:12,color:'#555',display:'flex',gap:8,flexWrap:'wrap'}}>
                  {['YOLOv8-Heritage v2.1.4','DeepLabV3+ v1.8.2','Mask-RCNN v3.0.1','Siamese U-Net v1.5.0'].map(m=>(
                    <span key={m} style={{background:'#e8eaf6',padding:'2px 8px',borderRadius:2,fontFamily:'monospace'}}>{m}</span>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div style={{marginBottom:20}}>
                <div style={{fontWeight:700,fontSize:14,borderBottom:'1px solid #1a237e',paddingBottom:4,marginBottom:8,color:'#1a237e'}}>RECOMMENDED ACTIONS</div>
                {report.actions.map((a,i)=>(
                  <div key={i} style={{display:'flex',gap:10,padding:'5px 0',fontSize:13}}>
                    <span style={{color:'#1a237e',fontWeight:700}}>{i+1}.</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>

              {/* Signature */}
              <div style={{borderTop:'1px solid #1a237e',paddingTop:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,fontSize:12,textAlign:'center'}}>
                <div><div style={{borderTop:'1px solid #333',marginBottom:4}}/>AI System Officer<br/>HeritageGuard AI</div>
                <div><div style={{borderTop:'1px solid #333',marginBottom:4}}/>Superintending Archaeologist<br/>ASI Regional Circle</div>
                <div><div style={{borderTop:'1px solid #333',marginBottom:4}}/>Director General<br/>Archaeological Survey of India</div>
              </div>

              <div style={{marginTop:12,textAlign:'center',fontSize:11,color:'#999',fontFamily:'monospace'}}>
                This report was auto-generated by HeritageGuard AI — CONFIDENTIAL — NOT FOR PUBLIC DISTRIBUTION<br/>
                ASI Monument Protection under Ancient Monuments & Archaeological Sites and Remains Act, 1958
              </div>

              <button onClick={printReport} style={{marginTop:12,width:'100%',padding:'10px',background:'#1a237e',color:'#fff',border:'none',borderRadius:4,fontFamily:T.fontHead,fontSize:14,fontWeight:700,cursor:'pointer',letterSpacing:1}}>
                🖨️ PRINT / DOWNLOAD REPORT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── ANALYTICS PAGE ────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const stateData = [
    {state:'Uttar Pradesh',monuments:743,critical:23,risk:72},
    {state:'Karnataka',monuments:506,critical:31,risk:68},
    {state:'Tamil Nadu',monuments:413,critical:18,risk:61},
    {state:'Rajasthan',monuments:398,critical:14,risk:58},
    {state:'Madhya Pradesh',monuments:312,critical:9,risk:49},
    {state:'Maharashtra',monuments:287,critical:11,risk:52},
    {state:'Odisha',monuments:241,critical:16,risk:64},
    {state:'Delhi',monuments:174,critical:8,risk:55},
  ];

  const barState = {
    labels: stateData.map(d=>d.state),
    datasets:[
      {label:'Total Monuments',data:stateData.map(d=>d.monuments),backgroundColor:'rgba(0,212,255,0.4)',borderColor:T.accent,borderWidth:1},
      {label:'Critical Sites',data:stateData.map(d=>d.critical),backgroundColor:'rgba(255,59,59,0.6)',borderColor:T.red,borderWidth:1},
    ]
  };

  const trendLine = {
    labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets:[
      {label:'Encroachment',data:[12,19,15,23,18,27,21,31,25,29,34,28],borderColor:T.red,fill:false,tension:0.4},
      {label:'Vegetation',data:[23,28,31,27,35,29,38,33,40,36,42,39],borderColor:T.green,fill:false,tension:0.4},
      {label:'Structural',data:[8,11,9,14,12,16,13,18,15,20,17,22],borderColor:T.orange,fill:false,tension:0.4},
    ]
  };

  const opts = {responsive:true,plugins:{legend:{labels:{color:T.textDim,font:{family:T.fontBody}}},tooltip:{backgroundColor:T.bg2,titleColor:T.accent,bodyColor:T.text,borderColor:T.border,borderWidth:1}},scales:{x:{ticks:{color:T.textDim},grid:{color:T.border}},y:{ticks:{color:T.textDim},grid:{color:T.border}}}};

  const endangered = [...MONUMENTS].sort((a,b)=>b.riskScore-a.riskScore).slice(0,5);

  return (
    <div style={{padding:24}}>
      <SectionHeader title="Risk Analytics Dashboard" sub="State-wise vulnerability assessment and encroachment trends"/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:20}}>
          <SectionHeader title="State-wise Monument Vulnerability"/>
          <Bar data={barState} options={{...opts,indexAxis:'y'}}/>
        </div>
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:20}}>
          <SectionHeader title="Encroachment Trends 2024"/>
          <Line data={trendLine} options={opts}/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Most Endangered */}
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:20}}>
          <SectionHeader title="Most Endangered Heritage Sites"/>
          {endangered.map((m,i)=>(
            <div key={m.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${T.border}`}}>
              <div style={{fontFamily:T.fontHead,fontSize:24,fontWeight:700,color:T.textMuted,minWidth:30}}>#{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:T.fontBody,fontSize:14,color:T.text,fontWeight:500}}>{m.name}</div>
                <div style={{fontFamily:T.fontBody,fontSize:12,color:T.textDim}}>{m.city}, {m.state}</div>
                <div style={{marginTop:4,height:4,background:T.bg0,borderRadius:2}}>
                  <div style={{height:'100%',borderRadius:2,background:statusColor(m.status),width:`${m.riskScore}%`,boxShadow:`0 0 4px ${statusColor(m.status)}`}}/>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:T.fontMono,fontSize:20,fontWeight:700,color:statusColor(m.status)}}>{m.riskScore}</div>
                <Badge status={m.status}/>
              </div>
            </div>
          ))}
        </div>

        {/* State Risk Table */}
        <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:6,padding:20}}>
          <SectionHeader title="State Risk Assessment"/>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:T.fontBody,fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`2px solid ${T.border}`}}>
                {['State','Monuments','Critical','Risk Score'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'6px 8px',fontFamily:T.fontMono,fontSize:10,color:T.textMuted,letterSpacing:1,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stateData.map((d,i)=>{
                const col = d.risk>65?T.red:d.risk>50?T.orange:T.green;
                return (
                  <tr key={d.state} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.bg2:'transparent'}}>
                    <td style={{padding:'8px',color:T.text}}>{d.state}</td>
                    <td style={{padding:'8px',color:T.textDim,fontFamily:T.fontMono}}>{d.monuments}</td>
                    <td style={{padding:'8px',color:T.red,fontFamily:T.fontMono}}>{d.critical}</td>
                    <td style={{padding:'8px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:60,height:4,background:T.bg0,borderRadius:2}}>
                          <div style={{width:`${d.risk}%`,height:'100%',background:col,borderRadius:2}}/>
                        </div>
                        <span style={{fontFamily:T.fontMono,color:col,fontSize:12}}>{d.risk}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [time, setTime] = useState(new Date());
  const leafletLoaded = useRef(false);

  useEffect(()=>{
    const t = setInterval(()=>setTime(new Date()),1000);
    return ()=>clearInterval(t);
  },[]);

  // Load Leaflet
  useEffect(()=>{
    if(leafletLoaded.current) return;
    const script = document.createElement('script');
    script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload=()=>{leafletLoaded.current=true;};
    document.head.appendChild(script);
  },[]);

  const handleSelectMonument = (m) => {
    setSelectedMonument(m);
    if(page==='dashboard') setPage('map');
  };

  const nav = [
    {key:'dashboard',label:'DASHBOARD',icon:'⬛'},
    {key:'map',label:'MONITOR MAP',icon:'🗺'},
    {key:'detection',label:'AI DETECTION',icon:'🔍'},
    {key:'reports',label:'REPORTS',icon:'📋'},
    {key:'analytics',label:'ANALYTICS',icon:'📊'},
  ];

  const critAlerts = MONUMENTS.flatMap(m=>m.alerts).filter(a=>a.severity==='critical').length;

  return (
    <div style={{minHeight:'100vh',background:T.bg0,color:T.text,fontFamily:T.fontBody}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:${T.bg0}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes progressAnim{0%{width:0%}100%{width:100%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        .leaflet-container{font-family:${T.fontBody}!important;background:${T.bg0}}
        @media print{nav,button{display:none!important}body{background:#fff!important}}
      `}</style>

      {/* Top Navigation */}
      <nav style={{background:T.bg1,borderBottom:`1px solid ${T.border}`,padding:'0 24px',display:'flex',alignItems:'center',height:60,gap:0,position:'sticky',top:0,zIndex:900}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginRight:32}}>
          <div style={{width:36,height:36,background:T.accentGlow,border:`2px solid ${T.accent}`,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🏛</div>
          <div>
            <div style={{fontFamily:T.fontHead,fontSize:18,fontWeight:700,color:T.accent,letterSpacing:2,lineHeight:1}}>HeritageGuard AI</div>
            <div style={{fontFamily:T.fontMono,fontSize:9,color:T.textMuted,letterSpacing:2}}>ARCHAEOLOGICAL SURVEY OF INDIA</div>
          </div>
        </div>

        {/* Nav Links */}
        {nav.map(n=>(
          <button key={n.key} onClick={()=>setPage(n.key)} style={{background:'none',border:'none',borderBottom:`2px solid ${page===n.key?T.accent:'transparent'}`,color:page===n.key?T.accent:T.textDim,fontFamily:T.fontHead,fontSize:13,fontWeight:600,letterSpacing:1,padding:'0 14px',height:60,cursor:'pointer',transition:'all 0.2s',display:'flex',alignItems:'center',gap:6}}>
            {n.label}
            {n.key==='map' && critAlerts>0 && <span style={{background:T.red,color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:10,fontFamily:T.fontMono}}>{critAlerts}</span>}
          </button>
        ))}

        {/* Right side */}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:16}}>
          <div style={{fontFamily:T.fontMono,fontSize:12,color:T.textMuted}}>{time.toLocaleTimeString('en-IN')} IST</div>
          <div style={{display:'flex',alignItems:'center',gap:6,background:T.greenGlow,border:`1px solid ${T.green}`,borderRadius:4,padding:'4px 10px'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:T.green,animation:'pulse 2s infinite'}}/>
            <span style={{fontFamily:T.fontMono,fontSize:11,color:T.green}}>SYSTEM ACTIVE</span>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{minHeight:'calc(100vh - 60px)'}}>
        {page==='dashboard' && <DashboardPage onSelectMonument={handleSelectMonument}/>}
        {page==='map' && <MapPage onSelectMonument={setSelectedMonument} selectedMonument={selectedMonument}/>}
        {page==='detection' && <DetectionPage selectedMonument={selectedMonument}/>}
        {page==='reports' && <ReportsPage selectedMonument={selectedMonument}/>}
        {page==='analytics' && <AnalyticsPage/>}
      </div>

      {/* Global Monument Quick-Panel (if selected on dashboard) */}
      {selectedMonument && page!=='map' && page!=='detection' && page!=='reports' && (
        <div style={{position:'fixed',bottom:20,right:20,width:340,background:T.bg1,border:`1px solid ${statusColor(selectedMonument.status)}`,borderRadius:6,boxShadow:`0 0 20px ${statusColor(selectedMonument.status)}33`,zIndex:800,maxHeight:'60vh',overflowY:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderBottom:`1px solid ${T.border}`,background:T.bg2}}>
            <span style={{fontFamily:T.fontMono,fontSize:11,color:T.accent,letterSpacing:1}}>SELECTED MONUMENT</span>
            <button onClick={()=>setSelectedMonument(null)} style={{background:'none',border:'none',color:T.textMuted,cursor:'pointer',fontSize:16}}>✕</button>
          </div>
          <MonumentPanel monument={selectedMonument}/>
          <div style={{padding:'8px 12px',display:'flex',gap:8,borderTop:`1px solid ${T.border}`}}>
            <button onClick={()=>setPage('detection')} style={{flex:1,padding:'6px',background:T.accentGlow,border:`1px solid ${T.accent}`,color:T.accent,borderRadius:4,fontFamily:T.fontMono,fontSize:11,cursor:'pointer'}}>VIEW DETECTION</button>
            <button onClick={()=>setPage('reports')} style={{flex:1,padding:'6px',background:T.goldDim+'22',border:`1px solid ${T.gold}`,color:T.gold,borderRadius:4,fontFamily:T.fontMono,fontSize:11,cursor:'pointer'}}>GENERATE REPORT</button>
          </div>
        </div>
      )}
    </div>
  );
}
