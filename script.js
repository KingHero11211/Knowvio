// ============================================================
// THREE.JS IMPORTS (static - works with importmap)
// ============================================================
import * as THREE from 'three';

// ============================================================
// LENIS SMOOTH SCROLL
// ============================================================
import Lenis from 'lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Expose lenis globally for scroll triggers
window.lenis = lenis;

// ============================================================
// THREE.JS HERO 3D BACKGROUND
// ============================================================
async function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, SphereGeometry, TorusGeometry,
    MeshBasicMaterial, MeshStandardMaterial, Mesh, Group, Color, AmbientLight, DirectionalLight,
    Points, BufferGeometry, BufferAttribute, PointsMaterial, AdditiveBlending,
    Clock, Vector3 } = THREE;

  const scene = new Scene();
  scene.background = new Color(0xffffff);

  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 30);

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xffffff, 0);

  // Lighting
  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const dirLight2 = new DirectionalLight(0x3B48C4, 0.5);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  // Floating geometric shapes group
  const shapesGroup = new Group();
  scene.add(shapesGroup);

  const shapeGeometries = [
    new BoxGeometry(1.5, 1.5, 1.5),
    new SphereGeometry(1, 32, 32),
    new TorusGeometry(1, 0.4, 16, 32),
    new BoxGeometry(1, 1, 1),
    new SphereGeometry(0.8, 24, 24),
  ];

  const shapeMaterials = [
    new MeshStandardMaterial({ color: 0x26307A, metalness: 0.3, roughness: 0.6, transparent: true, opacity: 0.15 }),
    new MeshStandardMaterial({ color: 0x3B48C4, metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0.12 }),
    new MeshStandardMaterial({ color: 0x0F7A5D, metalness: 0.2, roughness: 0.7, transparent: true, opacity: 0.1 }),
    new MeshStandardMaterial({ color: 0x26307A, metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.18 }),
    new MeshStandardMaterial({ color: 0x3B48C4, metalness: 0.3, roughness: 0.6, transparent: true, opacity: 0.14 }),
  ];

  const shapes = [];
  const shapeCount = 12;

  for (let i = 0; i < shapeCount; i++) {
    const geo = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
    const mat = shapeMaterials[Math.floor(Math.random() * shapeMaterials.length)];
    const mesh = new Mesh(geo, mat);

    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20 - 10
    );

    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    mesh.userData = {
      rotationSpeed: new Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002
      ),
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.0005 + Math.random() * 0.001,
      floatAmplitude: 0.5 + Math.random() * 1,
      initialPosition: mesh.position.clone(),
    };

    shapesGroup.add(mesh);
    shapes.push(mesh);
  }

  // Particle network background
  const particlesCount = 800;
  const particlesGeometry = new BufferGeometry();
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  const sizes = new Float32Array(particlesCount);

  const color1 = new Color(0x26307A);
  const color2 = new Color(0x3B48C4);
  const color3 = new Color(0x0F7A5D);

  for (let i = 0; i < particlesCount; i++) {
    const radius = 15 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi) - 5;

    const colorChoice = Math.random();
    let particleColor;
    if (colorChoice < 0.4) particleColor = color1;
    else if (colorChoice < 0.7) particleColor = color2;
    else particleColor = color3;

    colors[i * 3] = particleColor.r * 0.3;
    colors[i * 3 + 1] = particleColor.g * 0.3;
    colors[i * 3 + 2] = particleColor.b * 0.3;

    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new BufferAttribute(colors, 3));
  particlesGeometry.setAttribute('size', new BufferAttribute(sizes, 1));

  const particlesMaterial = new PointsMaterial({
    size: 1,
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
    blending: AdditiveBlending,
  });

  const particles = new Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  // Connection lines between nearby particles
  const lineGeometry = new BufferGeometry();
  const linePositions = [];
  const maxConnectionDistance = 4;

  for (let i = 0; i < particlesCount; i++) {
    for (let j = i + 1; j < particlesCount; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < maxConnectionDistance) {
        linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }

  lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(linePositions), 3));
  const lineMaterial = new MeshBasicMaterial({
    color: 0x3B48C4,
    transparent: true,
    opacity: 0.08,
    blending: AdditiveBlending,
  });
  const lines = new Mesh(lineGeometry, lineMaterial);
  scene.add(lines);

  // Animation
  const clock = new Clock();
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  function animate() {
    const elapsed = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Smooth mouse follow
    targetX += (mouseX - targetX) * 0.02;
    targetY += (mouseY - targetY) * 0.02;

    camera.position.x += (targetX * 2 - camera.position.x) * 0.02;
    camera.position.y += (targetY * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Animate shapes
    shapes.forEach((mesh, i) => {
      mesh.rotation.x += mesh.userData.rotationSpeed.x;
      mesh.rotation.y += mesh.userData.rotationSpeed.y;
      mesh.rotation.z += mesh.userData.rotationSpeed.z;

      mesh.position.y = mesh.userData.initialPosition.y + Math.sin(elapsed * mesh.userData.floatSpeed + mesh.userData.floatOffset) * mesh.userData.floatAmplitude;
      mesh.position.x = mesh.userData.initialPosition.x + Math.cos(elapsed * mesh.userData.floatSpeed * 0.7 + mesh.userData.floatOffset) * mesh.userData.floatAmplitude * 0.5;
    });

    // Rotate particle system slowly
    particles.rotation.y += 0.0001;
    particles.rotation.x += 0.00005;
    lines.rotation.y += 0.0001;
    lines.rotation.x += 0.00005;

    // Subtle camera drift
    camera.position.z = 30 + Math.sin(elapsed * 0.1) * 2;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('mousemove', onMouseMove);
    renderer.dispose();
    shapeGeometries.forEach(g => g.dispose());
    shapeMaterials.forEach(m => m.dispose());
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
  });

  // Store for cleanup
  canvas._threeCleanup = () => {
    window.removeEventListener('mousemove', onMouseMove);
    renderer.dispose();
    shapeGeometries.forEach(g => g.dispose());
    shapeMaterials.forEach(m => m.dispose());
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
  };
}

// ============================================================
// MOBILE NAV
// ============================================================
const menuToggle = document.querySelector('.menu-toggle');
const mobilePanel = document.querySelector('.mobile-panel');
if (menuToggle && mobilePanel) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobilePanel.classList.toggle('open');
  });
  mobilePanel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobilePanel.classList.remove('open');
    });
  });
}

// ============================================================
// SCROLL REVEAL (Enhanced with Lenis)
// ============================================================
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ============================================================
// HERO PIPELINE — sequential "flow" animation
// ============================================================
function animateSteps(selector, interval) {
  const groups = document.querySelectorAll(selector);
  groups.forEach(group => {
    const steps = Array.from(group.querySelectorAll('[data-step]'));
    if (!steps.length) return;
    let i = 0;
    function tick() {
      steps.forEach(s => s.classList.remove('lit', 'active'));
      const el = steps[i];
      el.classList.add('lit');
      el.classList.add('active');
      i = (i + 1) % steps.length;
    }
    tick();
    setInterval(tick, interval);
  });
}
animateSteps('.pipeline', 1400);
animateSteps('.pipeline-track', 1500);
animateSteps('.timeline', 2200);

// ============================================================
// FAQ ACCORDION
// ============================================================
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      }
    });
    if (isOpen) {
      item.classList.remove('open');
      a.style.maxHeight = null;
    } else {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// ============================================================
// FORMS
// ============================================================
document.querySelectorAll('form[data-form]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    const success = document.querySelector(form.dataset.success);
    if (success) success.classList.add('show');
  });
});

// ============================================================
// 3D CARD TILT EFFECT ON SCROLL
// ============================================================
function initCardTilt() {
  const cards = document.querySelectorAll('.service-card, .example-card, .price-card, .plain-card, .cs-card, .resp-card, .pipeline-card, .lead-card, .dash-card');
  
  cards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
    
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 5;
      const rotateY = ((centerX - x) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    };
    
    const handleLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    };
    
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
  });
}

// ============================================================
// SCROLL-TRIGGERED 3D PIPELINE ANIMATION
// ============================================================
function initPipeline3D() {
  const pipelineSteps = document.querySelectorAll('.pipeline-track .stage');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
          entry.target.style.transitionDelay = `${index * 100}ms`;
        }, index * 100);
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -100px 0px' });
  
  pipelineSteps.forEach(step => observer.observe(step));
}

// ============================================================
// SCROLL PROGRESS INDICATOR
// ============================================================
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    z-index: 1000;
    transform-origin: left;
    transform: scaleX(0);
    pointer-events: none;
  `;
  document.body.appendChild(progressBar);
  
  lenis.on('scroll', ({ scroll, limit }) => {
    const progress = scroll / limit;
    progressBar.style.transform = `scaleX(${progress})`;
  });
}

// ============================================================
// SMOOTH ANCHOR SCROLLING WITH LENIS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, immediate: false });
      
      // Close mobile menu if open
      if (mobilePanel) mobilePanel.classList.remove('open');
      if (menuToggle) menuToggle.classList.remove('active');
    }
  });
});

// ============================================================
// NAV SHADOW ON SCROLL
// ============================================================
const nav = document.querySelector('.nav');
if (nav) {
  lenis.on('scroll', ({ scroll }) => {
    if (scroll > 8) {
      nav.style.boxShadow = '0 1px 0 rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.03)';
    } else {
      nav.style.boxShadow = 'none';
    }
  });
}

// ============================================================
// INITIALIZE ALL 3D EFFECTS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Init 3D hero if canvas exists
    if (document.getElementById('hero-canvas')) {
      initHero3D().catch(err => {
        console.warn('3D hero failed to initialize:', err);
        // Hide canvas on failure
        const canvas = document.getElementById('hero-canvas');
        if (canvas) canvas.style.display = 'none';
      });
    }
    
    // Init card tilt effects
    initCardTilt();
    
    // Init pipeline 3D animation
    initPipeline3D();
    
    // Init scroll progress
    initScrollProgress();
    
    // Add 3D hover effect to nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.style.position = 'relative';
      link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-2px)';
      });
      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0)';
      });
    });
    
    // Add 3D effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.style.transformStyle = 'preserve-3d';
      btn.addEventListener('mousedown', () => {
        btn.style.transform = 'translateZ(-2px) scale(0.98)';
      });
      btn.addEventListener('mouseup', () => {
        btn.style.transform = 'translateZ(0) scale(1)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateZ(0) scale(1)';
      });
    });
  } catch (err) {
    console.error('Initialization error:', err);
  }
});

// ============================================================
// PERFORMANCE: Reduce motion for users who prefer it
// ============================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches) {
  document.documentElement.style.setProperty('--animation-duration', '0.001ms');
}