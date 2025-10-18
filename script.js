// Modal de zoom para imágenes de gorras
function createImgModal() {
  if(document.querySelector('.modal-img-viewer')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-img-viewer';
  modal.innerHTML = `
    <div class="modal-img-content" role="dialog" aria-modal="true">
      <button class="modal-img-close" title="Cerrar" aria-label="Cerrar imagen">&times;</button>
      <img src="" alt="Gorra ampliada">
    </div>
  `;
  document.body.appendChild(modal);

  // Adjuntar listeners aquí para evitar referencias rotas
  const closeBtn = modal.querySelector('.modal-img-close');
  const content = modal.querySelector('.modal-img-content');
  const img = modal.querySelector('img');

  closeBtn.addEventListener('click', (ev)=>{ ev.stopPropagation(); hideImgModal(); });
  // clic fuera del contenido cierra
  modal.addEventListener('click', (ev)=>{ if(ev.target === modal) hideImgModal(); });
  // tecla ESC cierra
  window.addEventListener('keydown', (ev)=>{ if(ev.key === 'Escape') hideImgModal(); });

  // prevenir que clicks dentro del content disparen el overlay
  content.addEventListener('click', (ev)=> ev.stopPropagation());
}

function showImgModal(src, alt) {
  let modal = document.querySelector('.modal-img-viewer');
  if(!modal) createImgModal(), modal = document.querySelector('.modal-img-viewer');
  const content = modal.querySelector('.modal-img-content');
  const img = modal.querySelector('img');
  // No mostrar texto alternativo mientras carga (evita ver precio/nombre)
  img.alt = '';
  img.style.opacity = '0';
  content.classList.remove('show');
  // mostrar overlay pero sin la imagen hasta que cargue
  modal.classList.add('active');
  content.classList.remove('hide');

  // normalizar rutas Windows a file:/// y otras URLs
  function normalizeUrl(u){
    if(!u) return u;
    // si viene una data: o blob: o about: dejar tal cual
    if(/^\s*(data:|blob:|about:)/i.test(u)) return u;
    try{ const parsed = new URL(u); return parsed.href; }catch(e){}
    // windows style path (C:\... or C:/...)
    if(/^[a-zA-Z]:\\|^[a-zA-Z]:\//.test(u)){
      const path = u.replace(/\\/g, '/');
      return encodeURI('file:///' + path);
    }
    return encodeURI(u);
  }
  const useSrc = normalizeUrl(src);
  // asignar directamente al elemento y usar handlers claros — soporta data: y blob:
  img.onload = () => {
    content.classList.add('show');
    img.style.opacity = '';
    img.style.visibility = '';
    const closeBtn = document.querySelector('.modal-img-close');
    if(closeBtn) closeBtn.focus();
  };
  img.onerror = (err)=>{
    // Silencioso: evitar spam de mensajes. Limpiar handler y cerrar modal.
    img.onerror = null;
    setTimeout(()=> hideImgModal(), 300);
  };
  // ocultar mientras carga para evitar flashes
  img.style.visibility = 'hidden';
  img.src = useSrc;
}

function hideImgModal() {
  const modal = document.querySelector('.modal-img-viewer');
  const content = modal.querySelector('.modal-img-content');
  const img = modal.querySelector('img');
  // iniciar animación de salida
  content.classList.remove('show');
  content.classList.add('hide');
  setTimeout(()=>{
    modal.classList.remove('active');
    content.classList.remove('hide');
    img.src = '';
  }, 360);
}

createImgModal();
// Delegación para abrir modal al hacer click en cualquier imagen dentro de productos
const productsSection = document.querySelector('.products');
if(productsSection){
  productsSection.addEventListener('click', (e)=>{
    const img = e.target.closest('img');
    if(img && productsSection.contains(img)){
      showImgModal(img.src || img.getAttribute('src'), img.alt || img.getAttribute('alt'));
    }
  });
}

// Inicialización al cargar el documento: cargar imágenes persistidas, listeners y mostrar sección por defecto
document.addEventListener('DOMContentLoaded', ()=>{
  // Mostrar la sección home por defecto (mantener UX original)
  document.querySelectorAll('#home, #products, #contact, #game').forEach(s=> s.classList.remove('section-visible'));
  const home = document.getElementById('home');
  if(home) home.classList.add('section-visible');
  // controlar visibilidad del carrito según sección visible
  const cartAside = document.querySelector('aside.cart');
  if(cartAside) cartAside.style.display = (document.getElementById('products').classList.contains('section-visible')) ? '' : 'none';
});

// Nota: handlers del modal se adjuntan al crear el modal (createImgModal)
// Menú hamburguesa
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
if(navToggle && mainNav){
  navToggle.addEventListener('click', ()=>{
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // cerrar al pulsar en un enlace
  mainNav.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> mainNav.classList.remove('open')));
}

// TOASTS: notificaciones elegantes en la UI
function createToastContainer(){
  if(document.querySelector('.toast-container')) return;
  const c = document.createElement('div');
  c.className = 'toast-container';
  document.body.appendChild(c);
}

function showToast(message, type='success', time=3000){
  createToastContainer();
  const c = document.querySelector('.toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  c.appendChild(t);
  requestAnimationFrame(()=> t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(),240); }, time);
}

// Notificación de Logro (Estilo Minecraft)
function showAchievement() {
  const achievement = document.getElementById('achievement-toast');
  if (!achievement) return;

  achievement.classList.add('show');

  setTimeout(() => {
    achievement.classList.remove('show');
  }, 4000); // La notificación se oculta después de 4 segundos
}

// Notificación de Logro "Tryhard"
function showTryhardAchievement() {
  const achievement = document.getElementById('tryhard-toast');
  if (!achievement) return;

  achievement.classList.add('show');

  setTimeout(() => {
    achievement.classList.remove('show');
  }, 4000);
}

// Notificación de Game Over
function showGameOverToast() {
  const toast = document.getElementById('gameover-toast');
  if (!toast) return;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}


// Smooth scroll y animación de click en menú
document.querySelectorAll('.main-nav a').forEach(a=>{
  a.addEventListener('click', function(e){
    const href = this.getAttribute('href');
    if(href && href.startsWith('#')){
      e.preventDefault();
      const target = document.querySelector(href);
      if(target){
        // animación de click pequeña
        this.classList.add('clicked');
        setTimeout(()=> this.classList.remove('clicked'), 220);
        // Mostrar solo la sección seleccionada, incluyendo el juego
        document.querySelectorAll('#home, #products, #contact, #game').forEach(s=> s.classList.remove('section-visible'));
        target.classList.add('section-visible');
        // cerrar menú en móvil si está abierto
        if(mainNav && mainNav.classList.contains('open')) mainNav.classList.remove('open');
      }
    }
  });
});

// IntersectionObserver para animar secciones cuando entran en viewport
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('show');
    }
  });
},{threshold:0.12});

document.querySelectorAll('#home, #products, #contact, #game').forEach(el=>{
  el.classList.add('anim-enter');
  observer.observe(el);
});

// (La inicialización del DOMContentLoaded se consolidó arriba.)

// Escuchar cambios de sección visible para mostrar/ocultar carrito
const sectionObserver = new MutationObserver(()=>{
  const cartAside = document.querySelector('aside.cart');
  if(!cartAside) return;
  const productsVisible = document.getElementById('products').classList.contains('section-visible');
  cartAside.style.display = productsVisible ? '' : 'none';
});
sectionObserver.observe(document.getElementById('products'), { attributes: true, attributeFilter: ['class'] });
// Si la sección products está visible por defecto, mostrar carrito
const cartAsideInit = document.querySelector('aside.cart');
if(cartAsideInit && document.getElementById('products').classList.contains('section-visible')) cartAsideInit.style.display = '';

// Scrollspy: resaltar enlace activo según sección visible
const navLinks = document.querySelectorAll('.main-nav a');
const sections = document.querySelectorAll('#home, #products, #contact, #game');
window.addEventListener('scroll', ()=>{
  let current = '#home';
  sections.forEach(sec=>{
    const rect = sec.getBoundingClientRect();
    if(rect.top <= 120 && rect.bottom > 120){ current = `#${sec.id}`; }
  });
  navLinks.forEach(l=> l.classList.toggle('active', l.getAttribute('href') === current));
});
// Lógica simple de carrito con límite de 2 por producto por persona
const MAX_PER_PRODUCT = 2;

const cart = {}; // {id: qty}

function formatCurrency(n){ return n + ''; }

function updateCartUI(){
  const list = document.querySelector('.cart-items');
  list.innerHTML = '';
  let total = 0;
  for(const [id, item] of Object.entries(cart)){
    const li = document.createElement('li');
    li.textContent = `${item.name} x${item.qty}`;
    const span = document.createElement('span');
    span.textContent = `${item.price * item.qty} C$`;
    li.appendChild(span);
    list.appendChild(li);
    total += item.price * item.qty;
  }
  document.getElementById('total').textContent = total;
}

function saveCart(){
  localStorage.setItem('elegance_cart', JSON.stringify(cart));
}

function loadCart(){
  try{
    const raw = localStorage.getItem('elegance_cart');
    if(raw){
      const parsed = JSON.parse(raw);
      for(const k of Object.keys(parsed)) cart[k] = parsed[k];
    }
  }catch(e){console.warn('no se pudo cargar el carrito', e)}
}

function getProductData(article){
  const id = article.dataset.id;
  const name = article.querySelector('h2').textContent;
  const price = parseInt(article.querySelector('.qty').dataset.price,10);
  return {id,name,price};
}

function onAddClick(e){
  const article = e.target.closest('.product');
  const qtyInput = article.querySelector('.qty');
  let qty = parseInt(qtyInput.value,10)||0;
  if(qty < 1){ showToast('Selecciona las unidades deseadas (máximo 2).', 'warn'); return; }
  if(qty > MAX_PER_PRODUCT){
    showToast('El límite de gorras es solo 2 por persona.', 'warn');
    qtyInput.value = MAX_PER_PRODUCT;
    qty = MAX_PER_PRODUCT;
  }

  const {id,name,price} = getProductData(article);
  const existing = cart[id] ? cart[id].qty : 0;
  if(existing + qty > MAX_PER_PRODUCT){
    showToast('El límite de gorras es solo 2 por persona.', 'warn');
    return;
  }

  cart[id] = { name, price, qty: (existing + qty) };
  qtyInput.value = 0;
  updateCartUI();
  saveCart();
}

function onCheckout(){
  if(Object.keys(cart).length === 0){
    showToast('Necesitas agregar algo al carrito.', 'warn');
    return;
  }

  let message = '¡Hola! Quisiera ordenar los siguientes productos:\n\n';
  let total = 0;

  for (const item of Object.values(cart)) {
    const itemTotal = item.price * item.qty;
    message += `- ${item.name} (x${item.qty}) - ${itemTotal} C$\n`;
    total += itemTotal;
  }

  message += `\n*Total a pagar: ${total} C$*`;

  const phoneNumber = '50558657750';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  showToast('Redirigiendo a WhatsApp para completar tu pedido...', 'success');
  
  // Limpiamos el carrito después de generar el enlace
  for(const k of Object.keys(cart)) delete cart[k];
  saveCart();
  updateCartUI();

  // Abrimos WhatsApp en una nueva pestaña después de un breve momento
  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
  }, 500);
}

// Inicialización
loadCart();
updateCartUI();

document.querySelectorAll('.add').forEach(btn=>btn.addEventListener('click', onAddClick));
document.getElementById('checkout').addEventListener('click', onCheckout);

// --- LÓGICA DE LA SECCIÓN DE JUEGOS ---

const snakeGame = {
  canvas: document.getElementById('gameCanvas'),
  ctx: null,
  scoreEl: document.getElementById('score'),
  view: document.getElementById('snake-game-view'),
  startMenu: document.querySelector('#snake-game-view .game-start-menu'),
  highScoreEl: document.getElementById('snake-high-score'),
  highScore: 0,
  gameOverMenu: document.querySelector('#snake-game-view .game-over-menu'),
  gameArea: document.querySelector('#snake-game-view .game-area'),
  scoreDisplay: document.getElementById('score-display'),
  actionBtn: document.getElementById('gameActionBtn'),
  gridSize: 20,
  snake: [],
  food: {},
  direction: 'right',
  score: 0,
  gameOver: false,
  interval: null,

  init() {
    this.ctx = this.canvas.getContext('2d');
    this.actionBtn.addEventListener('click', () => this.start());
    this.setupMobileControls();
    document.addEventListener('keydown', (e) => this.handleInput(e));    
    this.loadHighScore();
    this.gameOverMenu.querySelector('.game-btn').addEventListener('click', () => {
        this.start();
    });
    this.drawInitialState();
    this.resetUI();
  },

  setupMobileControls() {
    document.querySelectorAll('#snake-controls .control-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setDirection(btn.dataset.direction);
      });
    });
  },

  loadHighScore() {
    this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
    this.highScoreEl.textContent = this.highScore;
  },

  drawInitialState() {
    this.ctx.fillStyle = '#1a1d21';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'var(--muted)';
    this.ctx.font = '16px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('¡Listo para jugar!', this.canvas.width / 2, this.canvas.height / 2);
  },

  placeFood() {
    this.food = {
      x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
      y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
    };
    for (const segment of this.snake) {
      if (segment.x === this.food.x && segment.y === this.food.y) {
        this.placeFood();
        return;
      }
    }
  },

  update() {
    if (this.gameOver) return;
    const head = { ...this.snake[0] };
    if (this.direction === 'right') head.x++;
    if (this.direction === 'left') head.x--;
    if (this.direction === 'up') head.y--;
    if (this.direction === 'down') head.y++;

    if (head.x < 0 || head.x * this.gridSize >= this.canvas.width || head.y < 0 || head.y * this.gridSize >= this.canvas.height) {
      return this.end();
    }
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) return this.end();
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.scoreEl.textContent = this.score;
      this.placeFood();
    } else {
      this.snake.pop();
    }
    this.draw();
  },

  setDirection(newDirection) {
    if ((newDirection === 'up') && this.direction !== 'down') this.direction = 'up';
    else if ((newDirection === 'down') && this.direction !== 'up') this.direction = 'down';
    else if ((newDirection === 'left') && this.direction !== 'right') this.direction = 'left';
    else if ((newDirection === 'right') && this.direction !== 'left') this.direction = 'right';
  },

  draw() {
    this.ctx.fillStyle = '#1a1d21';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.snake.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0 ? '#8b5cf6' : '#5eead4';
      this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 1, this.gridSize - 1);
    });
    this.ctx.fillStyle = '#f87171';
    this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize, this.gridSize);
  },

  handleInput(e) {
    const key = e.key;
    const isVisible = this.view.style.display !== 'none';
    if (!isVisible) return;

    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      if (this.gameOver || !this.interval) {
        this.start();
      }
      return;
    }

    const isGameKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key);
    if (isGameKey) {
      e.preventDefault();
      this.setDirection(key.replace('Arrow', '').toLowerCase());
    }
  },

  start() {
    this.startMenu.style.display = 'none';
    // Limpiar el estado de Game Over si existiera
    this.gameOverMenu.style.display = 'none';
    this.canvas.classList.remove('blurred');

    this.gameArea.style.display = 'block';
    this.snake = [{ x: Math.floor(this.canvas.width / this.gridSize / 2), y: Math.floor(this.canvas.height / this.gridSize / 2) }];
    this.direction = 'right';
    this.score = 0;
    this.scoreEl.textContent = this.score;
    this.gameOver = false;
    this.placeFood();
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.update(), 120);
  },

  end() {
    this.gameOver = true;
    clearInterval(this.interval);
    this.interval = null;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore);
      this.highScoreEl.textContent = this.highScore;
      showAchievement();
    }
    showGameOverToast();
    this.canvas.classList.add('blurred');
    this.gameOverMenu.style.display = 'flex';
  },

  resetUI() {
    this.gameOver = true;
    this.startMenu.style.display = 'block';
    this.gameArea.style.display = 'none';
    this.drawInitialState();
  },

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.resetUI();
    }
  }
};

const dinoGame = {
  canvas: document.getElementById('dinoCanvas'),
  view: document.getElementById('dino-game-view'),
  startMenu: document.querySelector('#dino-game-view .game-start-menu'),
  gameArea: document.querySelector('#dino-game-view .game-area'),
  ctx: null,
  scoreEl: document.getElementById('dino-score'),
  highScoreEl: document.getElementById('dino-high-score'),
  highScore: 0,
  gameOverMenu: document.querySelector('#dino-game-view .game-over-menu'),
  actionBtn: document.getElementById('dinoGameActionBtn'),

  dino: { x: 50, y: 250, width: 40, height: 50, dy: 0, gravity: 0.8, jumpPower: -15, onGround: true },
  obstacles: [],
  gameSpeed: 5,
  score: 0,
  gameOver: false,
  gameLoop: null,
  frames: 0,
  achieved1000: false,

  init() {
    this.ctx = this.canvas.getContext('2d');
    this.canvas.height = 300; this.canvas.width = 400;
    this.dino.y = this.canvas.height - this.dino.height - 10; // Posición inicial en el suelo
    this.actionBtn.addEventListener('click', () => this.start());    
    document.addEventListener('keydown', (e) => this.handleInput(e));
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.jump(); });
    this.loadHighScore();
    this.gameOverMenu.querySelector('.game-btn').addEventListener('click', () => {
        this.start();
    });
    this.resetUI();
  },

  loadHighScore() {
    this.highScore = parseInt(localStorage.getItem('dinoHighScore') || '0', 10);
    this.highScoreEl.textContent = this.highScore;
  },

  handleInput(e) {
    const isVisible = this.view.style.display !== 'none';
    if (!isVisible) return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (this.gameOver || !this.gameLoop) {
        this.start();
      } else {
        this.jump();
      }
    }
  },

  jump() {
    if (this.dino.onGround && !this.gameOver) {
      this.dino.dy = this.dino.jumpPower;
      this.dino.onGround = false;
    }
  },

  start() {
    this.gameOver = false;
    this.score = 0;
    this.gameSpeed = 5;
    this.obstacles = [];
    this.frames = 0;
    this.achieved900 = false;
    this.scoreEl.textContent = this.score;
    this.startMenu.style.display = 'none';
    // Limpiar el estado de Game Over si existiera
    this.gameOverMenu.style.display = 'none';
    this.canvas.classList.remove('blurred');

    this.gameArea.style.display = 'block';
    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
    this.loop();
  },

  end() {
    this.gameOver = true;
    cancelAnimationFrame(this.gameLoop);
    this.gameLoop = null;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('dinoHighScore', this.highScore);
      this.highScoreEl.textContent = this.highScore;
      showAchievement();
    }
    showGameOverToast();
    this.canvas.classList.add('blurred');
    this.gameOverMenu.style.display = 'flex';
  },

  loop() {
    if (this.gameOver) return;
    this.update();
    this.draw();
    this.gameLoop = requestAnimationFrame(() => this.loop());
  },

  update() {
    this.frames++;
    // Actualizar dino
    this.dino.dy += this.dino.gravity;
    this.dino.y += this.dino.dy;
    const groundPosition = this.canvas.height - this.dino.height - 10;
    if (this.dino.y > groundPosition) {
      this.dino.y = groundPosition;
      this.dino.dy = 0;
      this.dino.onGround = true;
    }

    // Generar y mover obstáculos
    if (this.frames % Math.max(40, Math.floor(120 - this.gameSpeed * 5)) === 0) {
      const height = Math.random() * 20 + 30;
      this.obstacles.push({
        x: this.canvas.width,
        y: this.canvas.height - height - 10,
        width: 20,
        height: height
      });
    }
    this.obstacles.forEach(obs => obs.x -= this.gameSpeed);
    this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > 0);

    // Colisiones
    for (const obs of this.obstacles) {
      if (this.dino.x < obs.x + obs.width && this.dino.x + this.dino.width > obs.x &&
          this.dino.y < obs.y + obs.height && this.dino.y + this.dino.height > obs.y) {
        return this.end();
      }
    }

    // Puntuación y velocidad
    this.score = Math.floor(this.frames / 5);
    this.scoreEl.textContent = this.score;
    if (this.frames % 100 === 0) this.gameSpeed += 0.1;

    // Logro de 1000 puntos
    if (this.score >= 1000 && !this.achieved1000) {
      this.achieved1000 = true;
      showTryhardAchievement();
    }
  },

  draw() {
    // Fondo
    this.ctx.fillStyle = '#1a1d21';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Suelo
    this.ctx.fillStyle = 'var(--muted)';
    this.ctx.fillRect(0, this.canvas.height - 10, this.canvas.width, 10);
    // Dino
    this.ctx.fillStyle = '#8b5cf6';
    this.ctx.fillRect(this.dino.x, this.dino.y, this.dino.width, this.dino.height);
    // Obstáculos
    this.ctx.fillStyle = '#f87171';
    this.obstacles.forEach(obs => this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height));
  },

  drawInitialState() {
    this.draw();
    this.ctx.fillStyle = 'var(--accent)';
    this.ctx.font = '16px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('¡Listo para saltar!', this.canvas.width / 2, this.canvas.height / 2);
  },

  resetUI() {
    this.gameOver = true;
    this.startMenu.style.display = 'block';
    this.gameArea.style.display = 'none';
    this.drawInitialState();
  },

  stop() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
      this.resetUI();
    }
  }
};

snakeGame.init();
dinoGame.init();

// Lógica de navegación del menú de juegos
const gameSelectionMenu = document.getElementById('game-selection-menu');
const gamesContainer = document.querySelector('.games-container');
const gameSelectBtns = document.querySelectorAll('.game-select-btn');
const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn');

gameSelectBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const gameId = btn.dataset.game;
    gameSelectionMenu.style.display = 'none';
    gamesContainer.style.display = 'flex';
    document.getElementById(`${gameId}-game-view`).style.display = 'flex';
  });
});

backToMenuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const gameId = btn.dataset.game;
    document.getElementById(`${gameId}-game-view`).style.display = 'none';
    gamesContainer.style.display = 'none';
    gameSelectionMenu.style.display = 'flex';
    // Detener el juego activo al volver al menú
    if (gameId === 'snake') snakeGame.stop();
    if (gameId === 'dino') dinoGame.stop();
  });
});

// Iniciar/detener el juego cuando la sección se muestra u oculta.
const gameSection = document.getElementById('game');
const gameVisibilityObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.attributeName === 'class') {
      const isVisible = gameSection.classList.contains('section-visible');
      if (!isVisible) {
        // Detiene ambos juegos si la sección se oculta para ahorrar recursos.
        snakeGame.stop();
        dinoGame.stop();
        // También resetea la vista al menú principal de juegos
        backToMenuBtns.forEach(btn => btn.click());
      }
    }
  }
});
gameVisibilityObserver.observe(gameSection, { attributes: true });
