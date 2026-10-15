import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChartNoAxesCombined } from 'lucide-react';

export default function PlacementChart({ rows, year }) {
  const id=useId(),reduced=useReducedMotion();
  const maximum=Math.max(1,...rows.flatMap(row=>[row.placements,row.offers||0]));
  const offers=rows.some(row=>row.offers!==null);
  return <figure className="placement-chart-v12" aria-labelledby={id}>
    <figcaption id={id}><ChartNoAxesCombined size={19}/><span>By department<small>{year} · published counts</small></span></figcaption>
    <div className="placement-chart-legend"><span><i/>Placements</span>{offers&&<span><i/>Offers</span>}</div>
    <div className="placement-chart-rows">{rows.map(row=><div className="placement-chart-row" key={row.sourceName}><span>{row.name==='Electronics & Telecom'?'E&TC':row.name}</span><div className="placement-chart-bars"><div><motion.i className="chart-placed" initial={false} animate={{width:`${row.placements/maximum*100}%`}} transition={reduced?{duration:0}:{type:'spring',stiffness:100,damping:22}}/><b>{row.placements}</b></div>{offers&&<div><motion.i className="chart-offered" initial={false} animate={{width:`${row.offers/maximum*100}%`}} transition={reduced?{duration:0}:{type:'spring',stiffness:100,damping:22}}/><b>{row.offers}</b></div>}</div></div>)}</div>
    <p>{offers?'Each series uses the same scale. Placements and offers are separate counts.':'The source does not publish offer counts for this year.'}</p>
  </figure>;
}
