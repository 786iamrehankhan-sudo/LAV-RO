import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, Expand, Menu, RotateCcw, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroStudio, CollectionStudio, FormulaStudio } from '@/components/fragrance/Studio';
import { fragrances, lightModes, quizQuestions, matchScent, type LightMode } from '@/lib/fragrances';
import iris from '@/assets/iris-editorial.jpg';

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'LAVÉRO — The Art of Wearing a Moment' },
    { name: 'description', content: 'LAVÉRO — a modern fragrance house where scent, design and memory become one immersive experience.' },
    { property: 'og:title', content: 'LAVÉRO — The Art of Wearing a Moment' },
    { property: 'og:description', content: 'The art of wearing a moment. Enter the immersive LAVÉRO fragrance atelier.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/iris-editorial.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'LAVÉRO — The Art of Wearing a Moment' },
    { name: 'twitter:description', content: 'The art of wearing a moment.' },
    { name: 'twitter:image', content: '/iris-editorial.jpg' },
  ] }),
  component: FragranceExperience,
});

function FragranceExperience() {
  const [intro,setIntro]=useState(true);
  const [selected,setSelected]=useState(0);
  const [light,setLight]=useState<LightMode>('Midnight');
  const [inspect,setInspect]=useState(false);
  const [rotate,setRotate]=useState(false);
  const [modal,setModal]=useState<'quiz'|'detail'|'bag'|null>(null);
  const [menu,setMenu]=useState(false);
  const [activeNote,setActiveNote]=useState(0);
  const reduced=useReducedMotion();
  const studioRef=useRef<HTMLDivElement>(null);
  const product=fragrances[selected] ?? fragrances[0];
  useEffect(()=>{ const t=setTimeout(()=>setIntro(false),2200); return ()=>clearTimeout(t); },[]);
  useEffect(()=>{
    if(!modal) return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const dialog=document.querySelector<HTMLElement>('[role="dialog"]');
    dialog?.focus();
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape')setModal(null);
      if(e.key==='Tab'&&dialog){
        const items=Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input'));
        const first=items[0],last=items.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
    };
    const overflow=document.body.style.overflow; document.body.style.overflow='hidden';
    window.addEventListener('keydown',onKey);
    return ()=>{window.removeEventListener('keydown',onKey);document.body.style.overflow=overflow;previous?.focus();};
  },[modal]);
  const choose=(n:number)=>{setSelected(n);};
  const explore=()=>{document.getElementById('collection')?.scrollIntoView({behavior:reduced?'instant':'smooth'});};
  const fullScreen=()=>{if(document.fullscreenElement)document.exitFullscreen();else studioRef.current?.requestFullscreen();};
  return <main>
    <AnimatePresence>{intro&&<motion.div className="intro" exit={{opacity:0,transition:{duration:reduced?0:.6}}}>
      <Button variant="editorial" className="intro-skip" onClick={()=>setIntro(false)}>Skip intro <ArrowRight/></Button>
      <div className="intro-spark"/><div className="intro-wordmark">LAVÉRO</div>
      <p className="eyebrow text-muted-foreground">The art of wearing a moment.</p>
      <Button variant="editorial" onClick={()=>setIntro(false)}>Enter experience <ArrowRight/></Button>
    </motion.div>}</AnimatePresence>
    <header className="site-header">
      <a href="#" className="brand" aria-label="LAVÉRO home">LAVÉRO</a>
      <nav className="hidden md:flex gap-10" aria-label="Main navigation">
        <a className="nav-link" href="#collection">The collection</a>
        <a className="nav-link" href="#ingredients">The ingredients</a>
        <a className="nav-link" href="#atelier">Our atelier</a>
      </nav>
      <div className="flex items-center gap-7">
        <Button variant="editorial" className="hidden sm:inline-flex border-none" onClick={()=>setModal('quiz')}>Find your scent <ArrowRight/></Button>
        <Button variant="ghost" size="icon" aria-label="Shopping bag" title="Shopping bag" onClick={()=>setModal('bag')}><ShoppingBag/></Button>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={menu?'Close menu':'Open menu'} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</Button>
      </div>
    </header>
    {menu&&<nav className="absolute top-[78px] inset-x-0 bg-secondary z-20 p-8 flex flex-col gap-7" aria-label="Mobile navigation">
      {['collection','ingredients','atelier'].map(id=><a key={id} className="nav-link" href={`#${id}`} onClick={()=>setMenu(false)}>{id==='atelier'?'Our atelier':`The ${id}`}</a>)}
      <Button variant="editorial" onClick={()=>{setMenu(false);setModal('quiz');}}>Find your scent <ArrowRight/></Button>
    </nav>}
    <section className="hero" aria-label="LAVÉRO fragrance studio">
      <div className="hero-canvas" ref={studioRef}><HeroStudio index={selected} light={light} inspect={inspect} rotate={rotate&&!reduced}/></div>
      <motion.div className="hero-copy" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:1.3,delay:.2}}>
        <p className="eyebrow text-primary">A fragrance. A feeling. A world.</p>
        <h1 className="hero-title">LAVÉRO<span className="block italic text-primary">Beyond scent.</span></h1>
        <p className="hero-description">Not just worn. Remembered.<br/>Discover a collection of moments,<br/>composed to become a part of you.</p>
        <div className="mt-9"><Button variant="editorial" className="h-11 gap-8" onClick={explore}>Enter the collection <ArrowRight/></Button></div>
      </motion.div>
      <div className="studio-controls">
        <Button variant="studio" size="icon" aria-label="Change studio lighting" title={`Change light · ${light}`} onClick={()=>setLight(lightModes[(lightModes.indexOf(light)+1)%lightModes.length] ?? 'Midnight')}><span className={`light-dot ${light.toLowerCase()}`}/></Button>
        <Button variant="studio" size="icon" aria-label={rotate?'Pause rotation':'Rotate bottle'} title={rotate?'Pause rotation':'Rotate bottle'} aria-pressed={rotate} onClick={()=>setRotate(!rotate)}><RotateCcw/></Button>
        <Button variant="studio" size="icon" aria-label={inspect?'Exit inspection':'Inspect bottle'} title="360° inspection" aria-pressed={inspect} onClick={()=>setInspect(!inspect)}><SlidersHorizontal/></Button>
        <Button variant="studio" size="icon" aria-label="Fullscreen studio" title="Fullscreen studio" onClick={fullScreen}><Expand/></Button>
      </div>
      <div className="hero-bottom">
        <a href="#collection" className="flex items-center gap-4 text-muted-foreground"><ArrowDown size={16}/><span className="eyebrow">Scroll to discover</span></a>
        <div className="hidden sm:block text-center"><p className="eyebrow">LAVÉRO {product.name}</p><p className="text-[10px] text-muted-foreground mt-2">{product.family} &nbsp; / &nbsp; Eau de parfum</p></div>
        <div className="text-right"><p className="eyebrow text-muted-foreground">The atmosphere</p><p className="editorial text-xl mt-1" aria-live="polite">{light}</p></div>
      </div>
    </section>

    <section id="collection" className="section-band">
      <div className="section-heading"><div><p className="eyebrow text-muted-foreground mb-5">01 / The collection</p><h2 className="section-title">Five scents.<br/><i>Infinite moments.</i></h2></div><p className="hidden sm:block text-xs text-muted-foreground">A world for every version of you.</p></div>
      <div className="h-[310px] sm:h-[380px]" aria-label="Interactive fragrance collection"><CollectionStudio selected={selected} onSelect={choose}/></div>
      <div className="collection-list">
        {fragrances.map((p,i)=><article key={p.name} className={`collection-item ${selected===i?'active':''}`}>
          <div className="flex justify-between"><span className="eyebrow text-muted-foreground">0{i+1}</span><span className="text-[10px] text-muted-foreground">Eau de parfum</span></div>
          <h3>{p.name}</h3><p>{p.family}</p>
          <Button variant="editorial" className="mt-5 gap-4" onClick={()=>{choose(i);setModal('detail');}}>Discover <ArrowRight/></Button>
        </article>)}
      </div>
    </section>

    <section id="ingredients" className="section-band">
      <div className="ingredient-layout">
        <img className="ingredient-photo" src={iris} width={1024} height={1024} loading="lazy" alt="Ivory iris and amber resin on wet dark stone"/>
        <div><p className="eyebrow text-muted-foreground mb-6">02 / The ingredients</p><h2 className="section-title">Nature, in its<br/><i>most intimate form.</i></h2>
          <p className="text-xs text-muted-foreground leading-7 mt-7 mb-6 max-w-sm">A bright beginning. A heart that unfolds. A trace that stays. Every note is chosen for the feeling it leaves behind.</p>
          {['Top notes','Heart notes','Base notes'].map((name,i)=><div className="note-row" key={name}><span>{name}</span><Button variant="editorial" className="border-none h-auto py-0" onClick={()=>{setActiveNote(i);document.getElementById('formula')?.scrollIntoView({behavior:'smooth'});}}>{['Bergamot · Pink pepper','Iris · Jasmine','Amber · Vanilla · Musk'][i]} <ArrowRight/></Button></div>)}
        </div>
      </div>
    </section>

    <section id="formula" className="section-band">
      <div className="ingredient-layout">
        <div><p className="eyebrow text-muted-foreground mb-6">03 / The composition</p><h2 className="section-title">An invisible<br/><i>architecture.</i></h2><p className="text-xs text-muted-foreground leading-7 mt-7 max-w-sm">A constellation of contrasts. Each molecule, a small part of something that cannot be explained. Only felt.</p>
          <div className="mt-8 border-t border-border pt-5"><p className="eyebrow text-muted-foreground">The note</p><p className="editorial text-3xl mt-3" aria-live="polite">{['Bergamot','Pink pepper','Iris','Jasmine','Amber','Vanilla','Musk'][activeNote]}</p></div>
          <div className="flex flex-wrap gap-2 mt-5">{['Bergamot','Pink pepper','Iris','Jasmine','Amber','Vanilla','Musk'].map((note,i)=><Button key={note} variant={i===activeNote?'secondary':'ghost'} size="sm" aria-pressed={activeNote===i} onClick={()=>setActiveNote(i)}>{note}</Button>)}</div>
        </div><div className="formula-canvas"><FormulaStudio active={activeNote} onSelect={setActiveNote}/></div>
      </div>
    </section>

    <section id="atelier" className="section-band">
      <div className="section-heading"><div><p className="eyebrow text-muted-foreground mb-6">04 / The LAVÉRO atelier</p><h2 className="section-title">Behind <i>the scent.</i></h2></div><span className="eyebrow text-muted-foreground hidden sm:block">Precision meets intuition</span></div>
      {[['The idea','It begins with a moment. A place, a person, a feeling worth keeping.'],['The ingredient','An exploration of texture, character, and the unexpected beauty of nature.'],['The formula','Notes are layered, refined, and reimagined. Nothing added without intention.'],['The balance','A conversation between strength and softness. The art is knowing when to stop.'],['The bottle','The final expression. A feeling made tangible, waiting to become yours.']].map(([name,text],i)=><div className="lab-step" key={name}><span className="eyebrow text-muted-foreground">0{i+1}</span><h3>{name}</h3><p>{text}</p></div>)}
    </section>
    <section className="quiz-band"><p className="eyebrow text-muted-foreground mb-6">Your moment. Your signature.</p><h2 className="section-title">Find the scent<br/>that <i>feels like you.</i></h2><Button variant="editorial" className="mt-9 gap-10" onClick={()=>setModal('quiz')}>Find my scent <ArrowRight/></Button></section>
    <footer className="footer"><a href="#" className="brand">LAVÉRO</a><p className="eyebrow text-muted-foreground">The art of wearing a moment.</p><p className="text-[10px] text-muted-foreground">© 2026 LAVÉRO</p></footer>

    <AnimatePresence>{modal&&<motion.div className="modal-scrim" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setModal(null)}>
      <motion.div className="experience-modal" role="dialog" aria-modal="true" aria-label={modal==='quiz'?'Find your scent':modal==='detail'?`LAVÉRO ${product.name}`:'Shopping bag'} tabIndex={-1} onClick={e=>e.stopPropagation()} initial={{y:20}} animate={{y:0}}>
        <Button variant="ghost" size="icon" className="modal-close" aria-label="Close dialog" onClick={()=>setModal(null)}><X/></Button>
        {modal==='quiz'?<ScentQuiz onResult={n=>choose(n)} onExplore={()=>setModal('detail')}/>:modal==='detail'?<>
          <p className="eyebrow text-muted-foreground mb-4">The signature collection</p><h2 className="section-title">LAVÉRO <i>{product.name}</i></h2>
          <div className="h-[280px]"><HeroStudio index={selected} light={light} inspect={false} rotate={!reduced}/></div>
          <p className="editorial text-2xl">{product.mood}</p><p className="text-xs text-muted-foreground leading-7 mt-4">{product.story}</p>
          <div className="flex justify-between border-y border-border py-5 my-6"><span className="eyebrow">{product.family}</span><span className="text-xs text-muted-foreground">{product.notes.join(' · ')}</span></div>
          <p className="text-xs text-muted-foreground">The collection is not available to purchase yet.</p>
          <div className="flex justify-between mt-6"><Button variant="ghost" aria-label="Previous fragrance" onClick={()=>choose((selected+4)%5)}><ChevronLeft/>Previous</Button><Button variant="ghost" aria-label="Next fragrance" onClick={()=>choose((selected+1)%5)}>Next<ChevronRight/></Button></div>
        </>:<><p className="eyebrow text-muted-foreground mb-5">Your collection</p><h2 className="section-title">A moment<br/><i>worth waiting for.</i></h2><p className="text-sm text-muted-foreground leading-7 mt-7">The LAVÉRO collection is not available to purchase yet.</p><Button variant="editorial" className="mt-8" onClick={()=>{setModal(null);explore();}}>Explore the collection <ArrowRight/></Button></>}
      </motion.div>
    </motion.div>}</AnimatePresence>
  </main>;
}

function ScentQuiz({onResult,onExplore}:{onResult:(n:number)=>void;onExplore:()=>void}) {
  const [answers,setAnswers]=useState<string[]>([]);
  const [result,setResult]=useState<number|null>(null);
  const question=quizQuestions[answers.length] ?? quizQuestions[0];
  const matched=fragrances[result ?? 0] ?? fragrances[0];
  const select=(answer:string)=>{
    const next=[...answers,answer];setAnswers(next);
    if(next.length===quizQuestions.length){const n=matchScent(next);setResult(n);onResult(n);}
  };
  if(result!==null) return <div className="text-center"><p className="eyebrow text-primary mb-5">Your signature scent</p><h2 className="section-title">LAVÉRO <i>{matched.name}</i></h2><div className="h-[300px]"><HeroStudio index={result} light="Sunset" inspect={false} rotate={true}/></div><p className="editorial text-3xl">This one feels like you.</p><p className="text-xs text-muted-foreground mt-4">{matched.mood}</p><Button variant="editorial" className="mt-7" onClick={onExplore}>Explore fragrance <ArrowRight/></Button><div className="mt-5"><Button variant="ghost" size="sm" onClick={()=>{setAnswers([]);setResult(null);}}>Start again</Button></div></div>;
  return <><p className="eyebrow text-muted-foreground mb-6">Find your scent / 0{answers.length+1} of 04</p><h2 className="section-title">{question.title}</h2><div className="quiz-options">{question.options.map(option=><Button variant="outline" className="h-14 rounded-none bg-transparent" key={option} onClick={()=>select(option)}>{option}<ArrowRight/></Button>)}</div>{answers.length>0&&<Button variant="ghost" onClick={()=>setAnswers(answers.slice(0,-1))}><ChevronLeft/>Back</Button>}</>;
}