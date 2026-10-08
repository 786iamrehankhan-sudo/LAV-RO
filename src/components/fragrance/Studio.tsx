import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, RoundedBox, Sparkles, Line } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import { fragrances, type LightMode } from '@/lib/fragrances';

function token(name: string) {
  const css = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'rgb(160,160,160)';
  ctx.fillStyle = css;
  ctx.fillRect(0,0,1,1);
  const d = ctx.getImageData(0,0,1,1).data;
  return `rgb(${d[0]},${d[1]},${d[2]})`;
}
const paletteNames = ['studio-black','studio-glass','studio-metal','studio-amber','studio-rose','studio-green','studio-ivory','studio-cool','studio-warm'] as const;
type Palette = Record<typeof paletteNames[number], string>;
function usePalette(): Palette {
  return useMemo(() => Object.fromEntries(paletteNames.map(n => [n,token(n)])) as Palette, []);
}
function useVisibility() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), { rootMargin: '100px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}
function labelTexture(name: string, palette: Palette) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = palette['studio-black']; ctx.fillRect(0,0,512,512);
    ctx.strokeStyle = palette['studio-metal']; ctx.lineWidth=2; ctx.strokeRect(14,14,484,484);
    ctx.fillStyle = palette['studio-ivory']; ctx.textAlign='center';
    ctx.font = '48px Georgia'; ctx.fillText('LAVÉRO',256,158);
    ctx.font = '56px Georgia'; ctx.fillText(name,256,260);
    ctx.font = '15px sans-serif'; ctx.fillText('E A U  D E  P A R F U M',256,350);
    ctx.font = '13px sans-serif'; ctx.fillText('THE ART OF WEARING A MOMENT',256,417);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
export function Bottle({index=0,position=[0,0,0],scale=1,animated=true,onSelect,rotate=false}: {index?:number; position?:[number,number,number];scale?:number;animated?:boolean;onSelect?:()=>void;rotate?:boolean}) {
  const product = fragrances[index] ?? fragrances[0];
  const reduced = useReducedMotion();
  const ref=useRef<THREE.Group>(null); const liquid=useRef<THREE.Mesh>(null);
  const palette=usePalette(); const [hover,setHover]=useState(false);
  const label=useMemo(()=>labelTexture(product.name,palette),[index,palette]);
  useEffect(()=>()=>label.dispose(),[label]);
  useFrame(({clock},raw)=> {
    const dt=Math.min(raw,.05);
    if(ref.current && animated && !reduced) {
      const target=rotate ? ref.current.rotation.y + dt*.35 : -.19+Math.sin(clock.elapsedTime*.18)*.08;
      ref.current.rotation.y=rotate ? target : THREE.MathUtils.damp(ref.current.rotation.y,target,3,dt);
      ref.current.position.y=position[1]+Math.sin(clock.elapsedTime*.5)*.025;
    }
    if(liquid.current && animated && !reduced) liquid.current.rotation.z=Math.sin(clock.elapsedTime*.8)*.008;
  });
  return <group ref={ref} position={position} scale={scale} rotation={[0,-.19,0]} onClick={()=>onSelect?.()} onPointerOver={()=>setHover(true)} onPointerOut={()=>setHover(false)}>
    <RoundedBox args={[1.62,2.35,.78]} radius={.14} smoothness={4} position={[0,1.48,0]} castShadow>
      <meshPhysicalMaterial color={palette['studio-glass']} metalness={.05} roughness={hover?.06:.13} transmission={.83} thickness={.42} ior={1.5} clearcoat={1} transparent opacity={.94}/>
    </RoundedBox>
    <RoundedBox ref={liquid} args={[1.34,1.65,.57]} radius={.09} smoothness={3} position={[0,1.2,0]}>
      <meshPhysicalMaterial color={palette[product.color]} transmission={.45} thickness={.6} roughness={.18} transparent opacity={.85}/>
    </RoundedBox>
    <RoundedBox args={[1.45,.13,.7]} radius={.04} smoothness={2} position={[0,.35,0]}><meshPhysicalMaterial color={palette['studio-metal']} metalness={.7} roughness={.13}/></RoundedBox>
    <mesh position={[0,2.7,0]}><cylinderGeometry args={[.28,.28,.22,32]}/><meshStandardMaterial color={palette['studio-metal']} metalness={1} roughness={.2}/></mesh>
    <RoundedBox args={[.98,.66,.76]} radius={.055} smoothness={3} position={[0,3.08,0]} castShadow><meshStandardMaterial color={palette['studio-black']} metalness={.75} roughness={.24}/></RoundedBox>
    <RoundedBox args={[1,.055,.78]} radius={.01} smoothness={2} position={[0,2.81,0]}><meshStandardMaterial color={palette['studio-metal']} metalness={1} roughness={.15}/></RoundedBox>
    <mesh position={[0,1.55,.404]}><planeGeometry args={[.98,1.02]}/><meshStandardMaterial map={label} roughness={.65} emissive={palette['studio-ivory']} emissiveMap={label} emissiveIntensity={.13}/></mesh>
    <mesh position={[0,3.422,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.4,.35]}/><meshStandardMaterial map={label} roughness={.4}/></mesh>
  </group>;
}
function Floor() {
  const palette=usePalette();
  const tex=useMemo(()=>{
    const size=128,data=new Uint8Array(size*size*4);
    for(let i=0;i<size*size;i++){ const n=25+Math.floor((Math.sin(i*12.9898)*43758.5453%1+1)*12); data.set([n,n,n,255],i*4); }
    const t=new THREE.DataTexture(data,size,size);t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,10);return t;
  },[]);
  useEffect(()=>()=>tex.dispose(),[tex]);
  return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.045,0]} receiveShadow><planeGeometry args={[80,80]}/><meshStandardMaterial color={palette['studio-black']} roughness={.24} metalness={.72} roughnessMap={tex}/></mesh>;
}
function Lighting({mode}:{mode:LightMode}) {
  const p=usePalette(); const warm=['Sunset','Candlelight'].includes(mode);
  const color=warm?p['studio-warm']:mode==='Daylight'?p['studio-ivory']:p['studio-cool'];
  return <>
    <color attach="background" args={[p['studio-black']]}/>
    <fog attach="fog" args={[p['studio-black'],12,38]}/>
    <ambientLight intensity={.65}/>
    <spotLight position={[3,7,4]} intensity={mode==='Daylight'?120:85} angle={.5} penumbra={1} color={color} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
    <pointLight position={[-3,3,-2]} intensity={35} color={p['studio-warm']}/>
    <Environment resolution={128}>
      <Lightformer intensity={3} position={[0,5,-2]} scale={[7,2,1]} color={p['studio-ivory']}/>
      <Lightformer intensity={4} position={[-4,2,2]} rotation-y={Math.PI/2} scale={[2,7,1]} color={color}/>
      <Lightformer intensity={3} position={[4,3,2]} rotation-y={-Math.PI/2} scale={[1,6,1]} color={p['studio-warm']}/>
    </Environment>
  </>;
}
function CameraJourney({inspect}:{inspect:boolean}) {
  const reduced = useReducedMotion();
  const {size}=useThree(); const progress=useRef({value:0}); const target=useMemo(()=>new THREE.Vector3(),[]);
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const tween=gsap.to(progress.current,{value:1,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    return ()=>{tween.scrollTrigger?.kill();tween.kill();};
  },[]);
  useFrame(({camera,pointer},raw)=>{
    if(inspect || reduced) return;
    const dt=Math.min(raw,.05);const mobile=size.width<800;
    target.set(mobile?0:0+pointer.x*.18,2.6+pointer.y*.09, mobile?8.5:8.1-progress.current.value*.7);
    camera.position.lerp(target,1-Math.exp(-3*dt)); camera.lookAt(mobile?0:0,1.7,0);
  });
  return null;
}
export function HeroStudio({index,light,inspect,rotate}:{index:number;light:LightMode;inspect:boolean;rotate:boolean}) {
  const {ref, visible}=useVisibility();
  return <div ref={ref} className="h-full w-full"><Canvas frameloop={visible?'always':'never'} dpr={[1,1.5]} shadows={{type:THREE.PCFShadowMap}} camera={{position:[0,2.6,8.1],fov:38}} gl={{antialias:true}}>
    <Lighting mode={light}/><Floor/>
    <Suspense fallback={null}><HeroObject index={index} rotate={rotate}/></Suspense>
    <CameraJourney inspect={inspect}/>
    {inspect&&<InspectionControls/>}
  </Canvas></div>;
}
function InspectionControls() {
  const {size}=useThree();
  return <OrbitControls target={[size.width<800?0:1.45,1.7,0]} enablePan={false} minDistance={4} maxDistance={12}/>;
}
function HeroObject({index,rotate}:{index:number;rotate:boolean}) {
  const {size}=useThree(); const p=usePalette();const mobile=size.width<800;
  return <group position={[mobile?0:1.45,0,0]}>
    <Bottle index={index} rotate={rotate}/>
    <mesh position={[0,.1,0]}><cylinderGeometry args={[1.5,1.6,.2,64]}/><meshStandardMaterial color={p['studio-black']} metalness={.55} roughness={.3}/></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.205,0]}><ringGeometry args={[1.46,1.475,96]}/><meshBasicMaterial color={p['studio-metal']} transparent opacity={.35}/></mesh>
    <Sparkles count={65} scale={[8,6,5]} size={1.5} speed={.2} opacity={.35} color={p['studio-metal']}/>
    {[[1.5,1,-3],[2.8,3,-3]].map((pos,i)=><mesh key={i} position={pos as [number,number,number]} rotation={[.3,.5,.5]}><torusGeometry args={[1.2,.012,8,80]}/><meshStandardMaterial color={p['studio-metal']} metalness={.9} roughness={.3}/></mesh>)}
  </group>;
}
export function CollectionStudio({selected,onSelect}:{selected:number;onSelect:(n:number)=>void}) {
  const {ref,visible}=useVisibility();
  return <div ref={ref} className="h-full w-full"><Canvas frameloop={visible?'always':'never'} dpr={1} camera={{position:[0,3.2,12],fov:38}}>
    <Lighting mode="Daylight"/><Floor/>
    <Suspense fallback={null}>{fragrances.map((_,i)=><Bottle key={i} index={i} position={[(i-2)*2.25,i===selected?.15:0,0]} scale={.8} onSelect={()=>onSelect(i)}/>)}</Suspense>
    <OrbitControls enableZoom={false} enablePan={false} target={[0,1.5,0]} minAzimuthAngle={-.35} maxAzimuthAngle={.35} minPolarAngle={1.2} maxPolarAngle={1.5}/>
  </Canvas></div>;
}
export function FormulaStudio({active,onSelect}:{active:number;onSelect:(n:number)=>void}) {
  const p=usePalette();
  const reduced=useReducedMotion();
  const {ref,visible}=useVisibility();
  const positions=[[-1.5,1,0],[-.5,1.9,.5],[.8,1.5,0],[1.5,.4,.5],[.1,-.2,0],[-1.1,-.4,.5],[-.4,.7,-.6]] as const;
  return <div ref={ref} className="h-full w-full"><Canvas frameloop={visible?'always':'never'} dpr={1} camera={{position:[0,1,6],fov:42}}>
    <Lighting mode="Moonlight"/>
    <group>{positions.map((pos,i)=><mesh key={i} position={pos} onClick={()=>onSelect(i)}><sphereGeometry args={[i===active?.2:.13,24,24]}/><meshStandardMaterial color={p[i===active?'studio-warm':'studio-metal']} metalness={.85} roughness={.2}/></mesh>)}
    {([[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,2],[6,4]] as const).map(([a,b],i)=><Line key={i} points={[positions[a],positions[b]]} color={p['studio-metal']} lineWidth={1} transparent opacity={.4}/>)}</group>
    <OrbitControls target={[0,.7,0]} enablePan={false} minDistance={3} maxDistance={9} autoRotate={!reduced} autoRotateSpeed={.5}/>
  </Canvas></div>;
}