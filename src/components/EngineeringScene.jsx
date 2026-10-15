import { useEffect, useId, useRef, useState } from 'react';
import './engineering-scene.css';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const CRANK_RADIUS = 1.05;
const ROD_LENGTH = 3.3;

function sliderPosition(degrees) {
  const theta = degrees * Math.PI / 180;
  return CRANK_RADIUS * Math.cos(theta) + Math.sqrt(ROD_LENGTH ** 2 - (CRANK_RADIUS * Math.sin(theta)) ** 2);
}

function prepareScene(THREE, canvas, mode) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 80);
  scene.add(new THREE.HemisphereLight(0xf0f6ff, 0x245958, 2.2));
  const key = new THREE.DirectionalLight(0xfff0da, 3.3);
  key.position.set(3, 7, 7); key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: .1, far: 30 });
  key.shadow.normalBias = .025;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa2ceec, 2.1);
  rim.position.set(-5, 3, -5); scene.add(rim);
  const material = (color, metalness = .55, roughness = .3) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const teal = material(0x277b7d, .48, .27);
  const copper = material(0xd3854e, .68, .28);
  const aluminium = material(0xa5b2bc, .76, .25);
  const dark = material(0x243844, .45, .38);
  const root = new THREE.Group(); scene.add(root);
  function mesh(geometry, surface, parent = root) {
    const object = new THREE.Mesh(geometry, surface); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
  }
  function box(x, y, z, surface, position, parent) {
    const object = mesh(new THREE.BoxGeometry(x, y, z), surface, parent); object.position.set(...position); return object;
  }
  function cylinder(radius, length, surface, position, axis = 'z', parent) {
    const object = mesh(new THREE.CylinderGeometry(radius, radius, length, 40), surface, parent);
    if (axis === 'z') object.rotation.x = Math.PI / 2;
    if (axis === 'x') object.rotation.z = Math.PI / 2;
    object.position.set(...position); return object;
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), new THREE.ShadowMaterial({ opacity: .17 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = mode === 'computer' ? -.18 : -1.58; floor.receiveShadow = true; scene.add(floor);
  let pose;
  if (mode === 'computer') {
    const layers = Array.from({ length: 5 }, () => new THREE.Group()); layers.forEach(layer => root.add(layer));
    const board = material(0x205b59, .2, .42);
    box(5.1, .15, 3.3, board, [0, 0, 0], layers[0]);
    // Conductive paths and peripheral packages stay on the PCB as the processor opens.
    const traceMaterial = new THREE.LineBasicMaterial({ color: 0xb6a276, transparent: true, opacity: .85 });
    for (let index = 0; index < 10; index++) {
      const side = index % 2 ? -1 : 1;
      const z = -1.25 + Math.floor(index / 2) * .6;
      const points = [new THREE.Vector3(side * 2.25, .083, z), new THREE.Vector3(side * 1.5, .083, z), new THREE.Vector3(side * 1.14, .083, z * .6)];
      layers[0].add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), traceMaterial));
      box(.32, .18, .44, dark, [side * 2.08, .17, z], layers[0]);
    }
    for (const x of [-1.9, 1.9]) for (const z of [-1.2, 1.2]) cylinder(.1, .12, aluminium, [x, .13, z], 'y', layers[0]);
    box(2.25, .17, 2.25, dark, [0, 0, 0], layers[1]);
    for (let i = 0; i < 12; i++) for (const side of [-1, 1]) {
      box(.1, .055, .08, copper, [side * 1.1, -.1, -.98 + i * .178], layers[1]);
      box(.08, .055, .1, copper, [-.98 + i * .178, -.1, side * 1.1], layers[1]);
    }
    box(1.35, .09, 1.35, material(0x596479, .8, .2), [0, 0, 0], layers[2]);
    // Etched die detail describes circuitry without inventing a commercial processor.
    for (let i = 0; i < 4; i++) box(.22, .006, .95, material(0x95a5b6, .7, .26), [-.45 + i * .3, .048, 0], layers[2]);
    box(2.3, .13, 2.3, copper, [0, 0, 0], layers[3]);
    box(2.45, .12, 2.45, aluminium, [0, 0, 0], layers[4]);
    for (let i = 0; i < 13; i++) box(.085, .43, 2.25, aluminium, [-1.08 + i * .18, .27, 0], layers[4]);
    const resting = [0, .28, .47, .63, .81];
    pose = value => {
      const amount = value / 100;
      layers.forEach((layer, index) => { layer.position.y = resting[index] + index * amount * .47; });
      root.rotation.y = -.16 + amount * .22;
    };
  } else {
    box(6.8, .22, 1.8, dark, [1.95, -1.43, 0]);
    box(.55, 1.1, .72, aluminium, [0, -.88, -.1]);
    cylinder(.28, .75, aluminium, [0, 0, 0]);
    const wheel = new THREE.Group(); root.add(wheel);
    const ring = mesh(new THREE.TorusGeometry(1.23, .11, 12, 64), teal, wheel);
    ring.position.z = -.2;
    cylinder(.27, .27, teal, [0, 0, -.2], 'z', wheel);
    for (let i = 0; i < 4; i++) {
      const spoke = box(2.4, .13, .16, teal, [0, 0, -.2], wheel); spoke.rotation.z = i * Math.PI / 4;
    }
    cylinder(.14, .54, copper, [CRANK_RADIUS, 0, .05], 'z', wheel);
    const rod = mesh(new THREE.CylinderGeometry(.105, .105, 1, 20), aluminium);
    const rodEnd = cylinder(.18, .23, copper, [0, 0, .34]);
    const carriage = box(.53, .7, .9, teal, [ROD_LENGTH, 0, 0]);
    const pin = cylinder(.16, .4, aluminium, [ROD_LENGTH, 0, .29]);
    for (const y of [-.57, .57]) box(3.25, .09, 1.04, aluminium, [3.35, y, -.05]);
    for (const x of [2.1, 4.65]) {
      box(.13, 1.25, 1.04, dark, [x, 0, -.05]);
      box(.32, .34, 1.05, aluminium, [x, -1.16, -.05]);
    }
    const up = new THREE.Vector3(0, 1, 0);
    const start = new THREE.Vector3(); const finish = new THREE.Vector3(); const delta = new THREE.Vector3();
    pose = value => {
      const angle = value * Math.PI / 180;
      const x = sliderPosition(value);
      wheel.rotation.z = angle;
      start.set(CRANK_RADIUS * Math.cos(angle), CRANK_RADIUS * Math.sin(angle), .34);
      finish.set(x, 0, .34); delta.subVectors(finish, start);
      rod.position.copy(start).add(finish).multiplyScalar(.5);
      rod.scale.y = delta.length(); rod.quaternion.setFromUnitVectors(up, delta.normalize());
      rodEnd.position.copy(start); carriage.position.x = x; pin.position.x = x;
    };
  }
  const resize = () => {
    const width = Math.max(1, canvas.clientWidth); const height = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.75));
    renderer.setSize(width, height, false); camera.aspect = width / height;
    const tight = camera.aspect < 1.35;
    if (mode === 'computer') { camera.position.set(tight ? 7.8 : 7, tight ? 7.5 : 6.8, tight ? 9.5 : 8.5); camera.lookAt(0, 1.3, 0); }
    else { camera.position.set(tight ? 8.2 : 7.5, tight ? 4.5 : 3.8, tight ? 9.5 : 8.5); camera.lookAt(1.8, -.2, 0); }
    camera.updateProjectionMatrix();
  };
  resize();
  return {
    renderer, scene, camera, pose, resize,
    destroy() {
      const geometries = new Set(); const materials = new Set();
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(item => materials.add(item)); });
      geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose());
      renderer.dispose(); renderer.forceContextLoss();
    },
  };
}

export default function EngineeringScene({ mode = 'mechanical' }) {
  const computer = mode === 'computer';
  const controlId = useId();
  const stage = useRef(null); const canvas = useRef(null); const engine = useRef(null);
  const visible = useRef(false); const current = useRef(computer ? 28 : 38); const manualRef = useRef(false);
  const draw = useRef(() => {}); const reset = useRef(() => {}); const drag = useRef(null);
  const [value, setValue] = useState(computer ? 28 : 38);
  const [manual, setManual] = useState(false); const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false); const [status, setStatus] = useState('waiting');

  useEffect(() => {
    let disposed = false; let started = false; let frame = 0;
    const target = stage.current; const element = canvas.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReduced = preference.matches;
    let motionPaused = document.body.classList.contains('motion-paused');
    setReduced(prefersReduced); setPaused(motionPaused);
    current.current = computer ? 28 : 38; manualRef.current = false; setManual(false); setValue(current.current);
    const render = () => {
      if (disposed || !visible.current || !engine.current || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (disposed || !visible.current || !engine.current) return;
        engine.current.pose(current.current); engine.current.renderer.render(engine.current.scene, engine.current.camera);
      });
    };
    const scroll = () => {
      if (!visible.current || manualRef.current || motionPaused || prefersReduced) return;
      const rect = target.getBoundingClientRect();
      const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
      const next = Math.round(progress * (computer ? 100 : 360));
      if (current.current !== next) { current.current = next; setValue(next); render(); }
    };
    draw.current = render;
    reset.current = () => { manualRef.current = false; setManual(false); current.current = computer ? 28 : 38; setValue(current.current); scroll(); render(); };
    const initialise = async () => {
      if (started || disposed) return;
      started = true; setStatus('loading');
      try {
        const THREE = await import('three');
        if (disposed) return;
        engine.current = prepareScene(THREE, element, computer ? 'computer' : 'mechanical');
        setStatus('ready'); render();
      } catch { if (!disposed) setStatus('failed'); }
    };
    const nearby = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { initialise(); nearby.disconnect(); } }, { rootMargin: '250px' });
    const viewport = new IntersectionObserver(entries => {
      visible.current = entries[0].isIntersecting;
      if (visible.current) { scroll(); render(); }
      else if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
    }, { threshold: .01 });
    nearby.observe(target); viewport.observe(target);
    const resized = new ResizeObserver(() => { engine.current?.resize(); render(); }); resized.observe(target);
    const preferences = () => { prefersReduced = preference.matches; setReduced(prefersReduced); scroll(); };
    const pauseChanges = new MutationObserver(() => { motionPaused = document.body.classList.contains('motion-paused'); setPaused(motionPaused); scroll(); });
    pauseChanges.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const lost = () => { if (!disposed) setStatus('failed'); };
    element.addEventListener('webglcontextlost', lost);
    preference.addEventListener('change', preferences);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      disposed = true; nearby.disconnect(); viewport.disconnect(); resized.disconnect(); pauseChanges.disconnect();
      preference.removeEventListener('change', preferences); window.removeEventListener('scroll', scroll); element.removeEventListener('webglcontextlost', lost);
      if (frame) window.cancelAnimationFrame(frame);
      engine.current?.destroy(); engine.current = null; visible.current = false; draw.current = () => {}; reset.current = () => {};
    };
  }, [computer]);

  const change = next => {
    const bounded = clamp(Math.round(next), 0, computer ? 100 : 360);
    manualRef.current = true; current.current = bounded; setManual(true); setValue(bounded); draw.current();
  };
  const legends = computer ? [['PCB', 'teal'], ['Package', 'dark'], ['Silicon', 'silver'], ['Spreader', 'copper'], ['Cooling', 'silver']] : [['Flywheel', 'teal'], ['Connecting rod', 'silver'], ['Sliding piston', 'teal']];

  return <section className="engineering-scene" aria-label={computer ? 'Interactive three-dimensional processor model' : 'Interactive three-dimensional slider-crank model'}>
    <div className="es-heading"><div><p className="es-kicker">INTERACTIVE / 3D</p><h3>{computer ? 'Inside a processor.' : 'See how motion works.'}</h3></div><span className="es-instruction">{manual ? 'Manual control' : paused || reduced ? 'Use the slider to explore' : 'Scroll to explore · drag to control'}</span></div>
    <div className={`es-stage ${status === 'ready' ? 'is-ready' : ''}`} ref={stage} aria-busy={status === 'loading'}>
      <canvas ref={canvas} aria-label={computer ? 'Three-dimensional circuit board with five separated processor layers' : 'Three-dimensional flywheel driving a fixed-length connecting rod and a piston along straight guides'} role="img"
        onPointerDown={event => { if (event.button !== 0 || status !== 'ready') return; drag.current = { x: event.clientX, value: current.current, pointer: event.pointerId }; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={event => { if (drag.current?.pointer === event.pointerId) change(drag.current.value + (event.clientX - drag.current.x) / Math.max(1, event.currentTarget.clientWidth) * (computer ? 100 : 360)); }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} />
      {status !== 'ready' && <div className={`es-status ${status === 'failed' ? 'has-error' : ''}`} role="status"><span className="es-loading-mark" aria-hidden="true" /><p>{status === 'failed' ? '3D view is unavailable in this browser.' : status === 'loading' ? 'Preparing the 3D model…' : '3D model loads as you approach.'}</p></div>}
      <div className="es-legend" aria-label="Model parts">{legends.map(([label, tone], index) => <span key={label}><i className={`es-dot es-${tone}`} aria-hidden="true" />{computer && <small>{index + 1}</small>}{label}</span>)}</div>
    </div>
    <div className="es-controls"><label htmlFor={controlId}>{computer ? 'Layer separation' : 'Crank angle'}<output>{value}{computer ? '%' : '°'}</output></label><input id={controlId} type="range" min="0" max={computer ? 100 : 360} value={value} onChange={event => change(Number(event.target.value))} aria-valuetext={computer ? `${value} percent layer separation` : `${value} degrees; piston position ${sliderPosition(value).toFixed(2)} relative units`} /><button type="button" onClick={() => reset.current()}>Reset view</button></div>
    <p className="es-caption">{computer ? 'A conceptual view of a PCB, processor package, silicon die, heat spreader and cooling fins. Scroll separates the parts; the slider lets you inspect the stack.' : 'A fixed-length connecting rod converts circular rotation into straight piston travel. Turn the crank to follow the mechanism.'}<span>Conceptual teaching model · does not depict an SNJB machine or facility.</span></p>
  </section>;
}
