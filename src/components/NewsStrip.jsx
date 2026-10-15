import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { loadHomepageSummary } from '../data/homepage-source.js';
import useAmbientAutoplay from '../hooks/useAmbientAutoplay.js';

export default function NewsStrip({navigate}) {
  const [data,setData]=useState(null), [index,setIndex]=useState(0), reduced=useReducedMotion();
  const swipe=useRef(null);
  useEffect(()=>{let active=true;loadHomepageSummary().then(value=>{if(active)setData(value)}).catch(()=>{});return()=>{active=false}},[]);
  const stories=data ? [
    {tag:'ON THE NOTICE BOARD', title:data.notices[1].title, date:data.notices[1].dateParts.join(' · '), image:'/images/project-lab.webp', imageNote:'SNJB project laboratory · illustrative photograph', href:'/#updates', cta:'See published notices', tone:'orange'},
    ...[/Voter Awareness/i,/Orientation/i].map((pattern,i)=>{const story=data.eventsVisible.find(event=>pattern.test(event.title));return story && {tag:i?'A NEW CHAPTER':'CAMPUS IN FOCUS',title:story.title,date:story.date,image:story.images[0].localPath,imageNote:'Published event photograph',href:'/#events',cta:'Explore the campus journal',tone:i?'violet':'teal'}}).filter(Boolean)
  ] : [];
  const current=stories[index%Math.max(1,stories.length)];
  const autoplay=useAmbientAutoplay({onAdvance:()=>setIndex(value=>(value+1)%stories.length),interval:5000,enabled:stories.length>1});
  const move=direction=>{if(!stories.length)return;autoplay.restart();setIndex(value=>(value+direction+stories.length)%stories.length)};
  const follow=(event,href)=>{if(!event.button&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(href,event)}};
  return <section className="campus-news-v12" aria-labelledby="campus-news-title" aria-roledescription="carousel" aria-description="Swipe or use left and right arrow keys to browse campus stories." ref={autoplay.ref} {...autoplay.interactionProps} data-autoplay={autoplay.playing?'playing':'paused'} data-slide-index={index} data-slide-count={stories.length} tabIndex={0} onKeyDown={event=>{if(event.target===event.currentTarget&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}}} onTouchStart={event=>{swipe.current=[event.touches[0].clientX,event.touches[0].clientY]}} onTouchEnd={event=>{if(!swipe.current)return;const [x,y]=swipe.current,dx=event.changedTouches[0].clientX-x,dy=event.changedTouches[0].clientY-y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);swipe.current=null}} onTouchCancel={()=>{swipe.current=null}}>
    <div className="news-v12-heading"><div><p className="h8-eyebrow">THE COLLEGE, IN MOTION</p><h2 id="campus-news-title">Happening at SNJB.</h2></div></div>
    {current?<div className="news-v12-stage"><AnimatePresence mode="wait" initial={false}><motion.article key={index} className={`news-v12-banner tone-${current.tone}`} initial={reduced?false:{opacity:0,y:12,filter:'blur(6px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} exit={reduced?undefined:{opacity:0,y:-10,filter:'blur(5px)'}} transition={{duration:reduced?0:.38}}>
      <div className="news-v12-copy"><span className="news-v12-tag"><i/>{current.tag}</span><p className="news-v12-date"><CalendarDays size={15}/>{current.date}</p><h3>{current.title}</h3><a href={current.href} onClick={event=>follow(event,current.href)}>{current.cta}<ArrowUpRight size={19}/></a></div><figure><img src={current.image} alt={current.imageNote} width="1000" height="750" loading="lazy"/><figcaption>{current.imageNote}</figcaption></figure><span className="news-v12-number" aria-hidden="true">0{index+1}</span>
    </motion.article></AnimatePresence></div>:<div className="news-v12-fallback"><a href="https://snjb.org/engineering/" target="_blank" rel="noreferrer">Read the college’s published news and notices<ArrowUpRight size={18}/></a></div>}
    {stories.length>1&&<span className="ambient-slide-progress" key={index} aria-hidden="true"/>}
  </section>;
}
