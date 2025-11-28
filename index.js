import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

console.log('Импорты загружены: THREE =', THREE, 'GLTFLoader =', GLTFLoader);

const envelope = document.getElementById('envelope');
const canvas = document.getElementById('scene');
const loaderEl = document.getElementById('loader');
const music = document.getElementById('music');

let scene, camera, renderer, model;
let threeInitialized = false;
let fadeIn = { active: false, progress: 0, speed: 0.02 };

function init3D() {
  if (threeInitialized) return;
  threeInitialized = true;

  console.log('init3D вызвана');

  canvas.classList.add('visible');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  camera.position.set(0, 0.8, 3);

  const amb = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(2, 3, 2);
  scene.add(dir);

  loaderEl.style.display = 'block';

  const loader = new GLTFLoader();
  loader.load('./assets/model.glb', (gltf) => {
    model = gltf.scene;

    model.scale.set(0.5, 0.5, 0.5);
    model.position.set(0, 0.3, 0);
    model.rotation.set(0, 0, 0);

    model.traverse((node) => {
      if (node.isMesh && node.material) {
        if (Array.isArray(node.material)) {
          node.material = node.material.map((m) => m.clone());
          node.material.forEach((m) => { m.transparent = true; m.opacity = 0; m.depthWrite = false; });
        } else {
          node.material = node.material.clone();
          node.material.transparent = true;
          node.material.opacity = 0;
          node.material.depthWrite = false;
        }
      }
    });

    scene.add(model);
    fadeIn.active = true;
    fadeIn.progress = 0;
    loaderEl.style.display = 'none';
  }, undefined, (err) => {
    console.error('Model load error', err);
    loaderEl.textContent = 'Ошибка загрузки модели';
  });

  animate();
}

function resizeRendererToDisplaySize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.floor(width * devicePixelRatio) || canvas.height !== Math.floor(height * devicePixelRatio)) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (!renderer) return;
  resizeRendererToDisplaySize();

  if (model) {
    const time = performance.now() * 0.001;
    model.rotation.y = Math.sin(time) * 0.4 + Math.PI;
  }

  if (fadeIn.active && model) {
    fadeIn.progress = Math.min(1, fadeIn.progress + fadeIn.speed);

    model.traverse((node) => {
      if (node.isMesh && node.material) {
        const updateMat = (m) => { if (m) m.opacity = fadeIn.progress; };
        Array.isArray(node.material) ? node.material.forEach(updateMat) : updateMat(node.material);
      }
    });

    if (fadeIn.progress >= 1) {
      fadeIn.active = false;
      model.traverse((node) => {
        if (node.isMesh && node.material) {
          const finalize = (m) => {
            if (!m) return;
            m.opacity = 1;
            m.transparent = false;
            m.depthWrite = true;
            m.needsUpdate = true;
          };
          Array.isArray(node.material) ? node.material.forEach(finalize) : finalize(node.material);
        }
      });
    }
  }

  renderer.render(scene, camera);
}

envelope.addEventListener('click', () => {
  if (envelope.classList.contains('opened')) return;

  envelope.classList.add('opened');
  music.volume = 0.8;
  music.play().catch((err) => console.log('Автозапуск заблокирован:', err));

  setTimeout(() => {
    envelope.style.display = 'none';
    document.body.classList.add('night');
    showStars();
    init3D();
  }, 900);
});

function showStars() {
  const starsEl = document.querySelector('.stars');
  if (!starsEl) return;
  starsEl.innerHTML = '';
  const w = window.innerWidth, h = window.innerHeight;
  const count = Math.floor((w * h) / 3500);
  for (let i = 0; i < count; ++i) {
    const star = document.createElement('div');
    const type = 'type' + (1 + Math.floor(Math.random() * 4));
    star.className = 'star ' + type;
    const x = Math.random() * 100, y = Math.random() * 100;
    star.style.left = x + 'vw';
    star.style.top = y + 'vh';
    star.style.opacity = 0;
    starsEl.appendChild(star);
    setTimeout(() => { star.style.opacity = 0.7 + Math.random() * 0.3; }, 100 + Math.random() * 1200);
  }
  starsEl.classList.add('visible');
}

window.addEventListener('resize', () => {
  if (!renderer) return;
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
});


