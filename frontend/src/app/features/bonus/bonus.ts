import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface Point {
  x: number;
  y: number;
}

interface Bounds extends Point {
  w: number;
  h: number;
}

type ClipRect = Bounds;

interface SpriteEntity {
  img: HTMLImageElement;
  position: Point;
  bounds: Bounds;
  clipRect?: ClipRect;
  scale?: Point;
}

interface Bullet extends SpriteEntity {
  direction: number;
  speed: number;
  alive: boolean;
}

interface Player extends SpriteEntity {
  clipRect: ClipRect;
  scale: Point;
  lives: number;
  xVel: number;
  bullets: Bullet[];
  bulletDelayAccumulator: number;
  score: number;
}

interface Alien extends SpriteEntity {
  clipRects: ClipRect[];
  clipRect: ClipRect;
  scale: Point;
  alive: boolean;
  onFirstState: boolean;
  stepDelay: number;
  stepAccumulator: number;
  doShoot: boolean;
  bullet: Bullet | null;
}

interface Particle {
  x: number;
  y: number;
  xunits: number;
  yunits: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
  height: number;
  gravity: number;
  moves: number;
}

interface ParticleManager {
  particlePool: Particle[];
  particles: Particle[];
}

@Component({
  selector: 'app-bonus',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bonus.html',
  styleUrl: './bonus.scss',
})
export class BonusComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private keyStates: boolean[] = [];
  private prevKeyStates: boolean[] = [];
  private lastTime = 0;
  private player!: Player;
  private aliens: Alien[] = [];
  private particleManager!: ParticleManager;
  private updateAlienLogic = false;
  private alienDirection = -1;
  private alienYDown = 0;
  private alienCount = 0;
  private wave = 1;
  hasGameStarted = false;
  private spriteSheetImg!: HTMLImageElement;
  private bulletImg!: HTMLImageElement;
  private audioCtx: AudioContext | null = null;

  private readonly CANVAS_WIDTH = 640;
  private readonly CANVAS_HEIGHT = 640;
  private readonly SPRITE_SHEET_SRC =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAEACAYAAAADRnAGAAACGUlEQVR42u3aSQ7CMBAEQIsn8P+/hiviAAK8zFIt5QbELiTHmfEYE3L9mZE9AAAAqAVwBQ8AAAD6THY5CgAAAKbfbPX3AQAAYBEEAADAuZrC6UUyfMEEAIBiAN8OePXnAQAAsLcmmKFPAQAAgHMbm+gbr3Sdo/LtcAAAANR6GywPAgBAM4D2JXAAABoBzBjA7AmlOx8AAEAzAOcDAADovTc4vQim6wUCABAYQG8QAADd4dPd2fRVYQAAANQG0B4HAABAawDnAwAA6AXgfAAAALpA2uMAAABwPgAAgPoAM9Ci/R4AAAD2dmqcEQIAIC/AiQGuAAYAAECcRS/a/cJXkUf2AAAAoBaA3iAAALrD+gIAAADY9baX/nwAAADNADwFAADo9YK0e5FMX/UFACA5QPSNEAAAAHKtCekmDAAAAADvBljtfgAAAGgMMGOrunvCy2uCAAAACFU6BwAAwF6AGQPa/XsAAADYB+B8AAAAtU+ItD4OAwAAAFVhAACaA0T7B44/BQAAANALwGMQAAAAADYO8If2+P31AgAAQN0SWbhFDwCAZlXgaO1xAAAA1FngnA8AACAeQPSNEAAAAM4CnC64AAAA4GzN4N9NSfgKEAAAAACszO26X8/X6BYAAAD0Anid8KcLAAAAAAAAAJBnwNEvAAAA9Jns1ygAAAAAAAAAAAAAAAAAAABAQ4COCENERERERERERBrnAa1sJuUVr3rsAAAAAElFTkSuQmCC';

  private readonly PLAYER_CLIP_RECT: ClipRect = { x: 0, y: 204, w: 62, h: 32 };
  private readonly ALIEN_BOTTOM_ROW = [
    { x: 0, y: 0, w: 51, h: 34 },
    { x: 0, y: 102, w: 51, h: 34 },
  ];
  private readonly ALIEN_MIDDLE_ROW = [
    { x: 0, y: 137, w: 50, h: 33 },
    { x: 0, y: 170, w: 50, h: 34 },
  ];
  private readonly ALIEN_TOP_ROW = [
    { x: 0, y: 68, w: 50, h: 32 },
    { x: 0, y: 34, w: 50, h: 32 },
  ];
  private readonly ALIEN_X_MARGIN = 40;
  private readonly ALIEN_SQUAD_WIDTH = 11 * 40;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.setImageSmoothing(false);

    this.spriteSheetImg = new Image();
    this.spriteSheetImg.src = this.SPRITE_SHEET_SRC;

    const bulletCanvas = document.createElement('canvas');
    bulletCanvas.width = 2;
    bulletCanvas.height = 8;
    const bCtx = bulletCanvas.getContext('2d')!;
    bCtx.fillStyle = 'white';
    bCtx.fillRect(0, 0, 2, 8);
    this.bulletImg = new Image();
    this.bulletImg.src = bulletCanvas.toDataURL();

    this.lastTime = performance.now();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.audioCtx?.close();
  }

  // ── Web Audio helpers ──────────────────────────────────────────────────────

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.15,
    freqEnd?: number,
  ): void {
    const ctx = this.getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    if (freqEnd !== undefined) {
      oscillator.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  private playNoise(duration: number, volume = 0.1): void {
    const ctx = this.getAudioCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  private soundShoot(): void {
    this.playTone(880, 0.08, 'square', 0.12, 440);
  }

  private soundAlienExplode(): void {
    this.playNoise(0.18, 0.2);
    this.playTone(150, 0.18, 'sawtooth', 0.1, 60);
  }

  private soundPlayerHit(): void {
    this.playTone(200, 0.4, 'sawtooth', 0.15, 50);
    this.playNoise(0.4, 0.15);
  }

  private soundWaveClear(): void {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.15, 'square', 0.12), i * 120);
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (this.hasGameStarted || e.key === 'Enter') {
      e.preventDefault();
    }
    this.keyStates[e.keyCode] = true;
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    this.keyStates[e.keyCode] = false;
  }

  private setImageSmoothing(value: boolean): void {
    this.ctx.imageSmoothingEnabled = value;
  }

  private initGame(): void {
    this.aliens = [];
    this.player = this.createPlayer();
    this.particleManager = this.createParticleManager();
    this.setupAlienFormation();
  }

  private createPlayer(): Player {
    return {
      img: this.spriteSheetImg,
      clipRect: { ...this.PLAYER_CLIP_RECT },
      position: { x: this.CANVAS_WIDTH / 2, y: this.CANVAS_HEIGHT - 70 },
      scale: { x: 0.85, y: 0.85 },
      bounds: { x: 0, y: 0, w: 0, h: 0 },
      lives: 3,
      xVel: 0,
      bullets: [],
      bulletDelayAccumulator: 0,
      score: 0,
    };
  }

  private createBullet(x: number, y: number, direction: number, speed: number): Bullet {
    return {
      img: this.bulletImg,
      position: { x, y },
      bounds: { x, y, w: 2, h: 8 },
      direction,
      speed,
      alive: true,
    };
  }

  private createEnemy(clipRects: ClipRect[], x: number, y: number): Alien {
    return {
      img: this.spriteSheetImg,
      clipRects,
      clipRect: { ...clipRects[0] },
      position: { x, y },
      scale: { x: 0.5, y: 0.5 },
      bounds: { x: 0, y: 0, w: 0, h: 0 },
      alive: true,
      onFirstState: true,
      stepDelay: 1,
      stepAccumulator: 0,
      doShoot: false,
      bullet: null,
    };
  }

  private createParticleManager(): ParticleManager {
    return { particlePool: [], particles: [] };
  }

  private setupAlienFormation(): void {
    this.alienCount = 0;
    for (let i = 0; i < 55; i++) {
      const gridX = i % 11;
      const gridY = Math.floor(i / 11);
      let clipRects;
      if (gridY <= 1) clipRects = this.ALIEN_BOTTOM_ROW;
      else if (gridY <= 3) clipRects = this.ALIEN_MIDDLE_ROW;
      else clipRects = this.ALIEN_TOP_ROW;

      this.aliens.push(
        this.createEnemy(
          clipRects,
          this.CANVAS_WIDTH / 2 -
            this.ALIEN_SQUAD_WIDTH / 2 +
            this.ALIEN_X_MARGIN / 2 +
            gridX * this.ALIEN_X_MARGIN,
          this.CANVAS_HEIGHT / 3.25 - gridY * 40,
        ),
      );
      this.alienCount++;
    }
  }

  private resetGame(): void {
    this.aliens = [];
    this.setupAlienFormation();
    this.player.lives = 3;
    this.player.score = 0;
    this.player.position = { x: this.CANVAS_WIDTH / 2, y: this.CANVAS_HEIGHT - 70 };
    this.player.bullets = [];
  }

  private updateBounds(entity: SpriteEntity): void {
    if (entity.clipRect) {
      const scale = entity.scale ?? { x: 1, y: 1 };
      const w = ~~(0.5 + entity.clipRect.w * scale.x);
      const h = ~~(0.5 + entity.clipRect.h * scale.y);
      entity.bounds = { x: entity.position.x - w / 2, y: entity.position.y - h / 2, w, h };
    } else {
      entity.bounds = {
        x: entity.position.x,
        y: entity.position.y,
        w: entity.img.width,
        h: entity.img.height,
      };
    }
  }

  private checkCollision(a: Bounds, b: Bounds): boolean {
    const xOverlap = (a.x >= b.x && a.x <= b.x + b.w) || (b.x >= a.x && b.x <= a.x + a.w);
    const yOverlap = (a.y >= b.y && a.y <= b.y + b.h) || (b.y >= a.y && b.y <= a.y + a.h);
    return xOverlap && yOverlap;
  }

  private updateGame(dt: number): void {
    // Player input
    if (this.keyStates[37]) this.player.xVel = -175;
    else if (this.keyStates[39]) this.player.xVel = 175;
    else this.player.xVel = 0;

    if (!this.prevKeyStates[88] && this.keyStates[88]) {
      if (this.player.bulletDelayAccumulator > 0.5) {
        this.player.bullets.push(
          this.createBullet(this.player.position.x, this.player.position.y - 20, 1, 1000),
        );
        this.player.bulletDelayAccumulator = 0;
        this.soundShoot();
      }
    }

    this.player.bulletDelayAccumulator += dt;
    this.player.position.x += this.player.xVel * dt;
    this.player.position.x = Math.min(Math.max(this.player.position.x, 30), this.CANVAS_WIDTH - 30);

    // Update player bullets
    for (let i = this.player.bullets.length - 1; i >= 0; i--) {
      const bullet = this.player.bullets[i];
      bullet.position.y -= bullet.speed * dt;
      bullet.bounds = { x: bullet.position.x, y: bullet.position.y, w: 2, h: 8 };
      if (bullet.position.y < 0) bullet.alive = false;
      if (!bullet.alive) this.player.bullets.splice(i, 1);
    }

    // Update aliens
    if (this.updateAlienLogic) {
      this.updateAlienLogic = false;
      this.alienDirection = -this.alienDirection;
      this.alienYDown = 25;
    }

    for (let i = this.aliens.length - 1; i >= 0; i--) {
      const alien = this.aliens[i];
      if (!alien.alive) {
        this.aliens.splice(i, 1);
        this.alienCount--;
        if (this.alienCount < 1) {
          this.wave++;
          this.setupAlienFormation();
          this.soundWaveClear();
        }
        continue;
      }

      alien.stepDelay = (this.alienCount * 20 - this.wave * 10) / 1000;
      if (alien.stepDelay <= 0.05) alien.stepDelay = 0.05;

      alien.stepAccumulator += dt;
      if (alien.stepAccumulator >= alien.stepDelay) {
        if (alien.position.x < 45 && this.alienDirection < 0) this.updateAlienLogic = true;
        if (this.alienDirection === 1 && alien.position.x > this.CANVAS_WIDTH - 45)
          this.updateAlienLogic = true;
        if (alien.position.y > this.CANVAS_WIDTH - 50) this.resetGame();

        if (Math.random() * 1000 <= 5 * (alien.stepDelay + 1)) alien.doShoot = true;
        alien.position.x += 10 * this.alienDirection;
        alien.onFirstState = !alien.onFirstState;
        alien.clipRect = alien.onFirstState ? { ...alien.clipRects[0] } : { ...alien.clipRects[1] };
        alien.stepAccumulator = 0;
      }
      alien.position.y += this.alienYDown;
      this.updateBounds(alien);

      if (alien.doShoot) {
        alien.doShoot = false;
        alien.bullet = this.createBullet(alien.position.x, alien.position.y + 15, -1, 500);
      }

      if (alien.bullet?.alive) {
        alien.bullet.position.y += alien.bullet.speed * dt;
        alien.bullet.bounds = {
          x: alien.bullet.position.x,
          y: alien.bullet.position.y,
          w: 2,
          h: 8,
        };
        if (alien.bullet.position.y > this.CANVAS_HEIGHT) alien.bullet.alive = false;
      }
    }
    this.alienYDown = 0;

    // Collisions: player bullets vs aliens
    this.updateBounds(this.player);
    for (const bullet of this.player.bullets) {
      for (const alien of this.aliens) {
        if (alien.alive && this.checkCollision(bullet.bounds, alien.bounds)) {
          alien.alive = false;
          bullet.alive = false;
          this.createExplosion(alien.position.x, alien.position.y, 'white', 70, 5, 5, 3, 0.15, 50);
          this.player.score += 25;
          this.soundAlienExplode();
        }
      }
    }

    // Collisions: alien bullets vs player
    for (const alien of this.aliens) {
      if (alien.bullet?.alive && this.checkCollision(alien.bullet.bounds, this.player.bounds)) {
        if (this.player.lives === 0) {
          this.hasGameStarted = false;
        } else {
          alien.bullet.alive = false;
          this.createExplosion(
            this.player.position.x,
            this.player.position.y,
            'green',
            100,
            8,
            8,
            6,
            0.001,
            40,
          );
          this.player.position = { x: this.CANVAS_WIDTH / 2, y: this.CANVAS_HEIGHT - 70 };
          this.player.lives--;
          this.soundPlayerHit();
        }
        break;
      }
    }

    this.prevKeyStates = [...this.keyStates];
  }

  private createExplosion(
    x: number,
    y: number,
    color: string,
    count: number,
    w: number,
    h: number,
    spd: number,
    grav: number,
    lif: number,
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 360;
      const speed = (Math.random() * spd) / 2 + spd;
      const life = Math.floor(Math.random() * lif) + lif / 2;
      const rad = (angle * Math.PI) / 180;
      this.particleManager.particles.push({
        x,
        y,
        xunits: Math.cos(rad) * speed,
        yunits: Math.sin(rad) * speed,
        life,
        maxLife: life,
        color,
        width: w,
        height: h,
        gravity: grav,
        moves: 0,
      });
    }
  }

  private drawParticles(): void {
    const particles = this.particleManager.particles;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.moves++;
      p.x += p.xunits;
      p.y += p.yunits + p.gravity * p.moves;
      p.life--;
      if (p.life <= 0) {
        particles.splice(i, 1);
      } else {
        this.ctx.globalAlpha = p.life / p.maxLife;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x, p.y, p.width, p.height);
        this.ctx.globalAlpha = 1;
      }
    }
  }

  private drawGame(): void {
    const ctx = this.ctx;

    // Player
    ctx.save();
    ctx.transform(
      this.player.scale.x,
      0,
      0,
      this.player.scale.y,
      this.player.position.x,
      this.player.position.y,
    );
    ctx.drawImage(
      this.spriteSheetImg,
      this.player.clipRect.x,
      this.player.clipRect.y,
      this.player.clipRect.w,
      this.player.clipRect.h,
      -this.player.clipRect.w / 2,
      -this.player.clipRect.h / 2,
      this.player.clipRect.w,
      this.player.clipRect.h,
    );
    ctx.restore();

    // Player bullets
    for (const b of this.player.bullets) {
      if (b.alive) ctx.drawImage(b.img, b.position.x, b.position.y);
    }

    // Aliens
    for (const alien of this.aliens) {
      if (!alien.alive) continue;
      ctx.save();
      ctx.transform(alien.scale.x, 0, 0, alien.scale.y, alien.position.x, alien.position.y);
      ctx.drawImage(
        this.spriteSheetImg,
        alien.clipRect.x,
        alien.clipRect.y,
        alien.clipRect.w,
        alien.clipRect.h,
        -alien.clipRect.w / 2,
        -alien.clipRect.h / 2,
        alien.clipRect.w,
        alien.clipRect.h,
      );
      ctx.restore();

      if (alien.bullet?.alive) {
        ctx.drawImage(alien.bullet.img, alien.bullet.position.x, alien.bullet.position.y);
      }
    }

    // Particles
    this.drawParticles();

    // HUD
    ctx.fillStyle = '#02ff12';
    ctx.fillRect(0, this.CANVAS_HEIGHT - 30, this.CANVAS_WIDTH, 2);
    ctx.font = '20px Play, monospace';
    ctx.fillStyle = 'white';
    ctx.fillText(this.player.lives + ' x ', 10, this.CANVAS_HEIGHT - 7.5);
    ctx.drawImage(
      this.spriteSheetImg,
      this.player.clipRect.x,
      this.player.clipRect.y,
      this.player.clipRect.w,
      this.player.clipRect.h,
      45,
      this.CANVAS_HEIGHT - 23,
      this.player.clipRect.w * 0.5,
      this.player.clipRect.h * 0.5,
    );

    const scoreText = 'SCORE: ' + this.player.score;
    const scoreMetrics = ctx.measureText(scoreText);
    ctx.fillText(scoreText, this.CANVAS_WIDTH / 2 - scoreMetrics.width / 2, 20);
  }

  private drawStartScreen(): void {
    const ctx = this.ctx;
    ctx.font = '36px Play, monospace';
    ctx.fillStyle = '#FFFFFF';

    const title = 'Space Invaders';
    const titleMetrics = ctx.measureText(title);
    ctx.fillText(title, this.CANVAS_WIDTH / 2 - titleMetrics.width / 2, this.CANVAS_HEIGHT / 2.75);

    if (~~(0.5 + Date.now() / 500) % 2) {
      const startText = 'Press Enter to play !';
      const startMetrics = ctx.measureText(startText);
      ctx.fillText(
        startText,
        this.CANVAS_WIDTH / 2 - startMetrics.width / 2,
        this.CANVAS_HEIGHT / 2,
      );
    }
  }

  private animate = (): void => {
    const now = performance.now();
    let dt = now - this.lastTime;
    if (dt > 100) dt = 100;

    if (!this.prevKeyStates[13] && this.keyStates[13] && !this.hasGameStarted) {
      this.getAudioCtx(); // unlock audio on first user gesture
      this.initGame();
      this.hasGameStarted = true;
    }

    if (this.hasGameStarted) {
      this.updateGame(dt / 1000);
    }

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    if (this.hasGameStarted) {
      this.drawGame();
    } else {
      this.drawStartScreen();
    }

    this.lastTime = now;
    this.prevKeyStates = [...this.keyStates];
    this.animationId = requestAnimationFrame(this.animate);
  };
}
