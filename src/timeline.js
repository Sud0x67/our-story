import { sceneCue } from './interaction-config.js';
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const ease = (n) => {
  n = clamp(n);
  return n * n * (3 - 2 * n);
};
export class FilmTimeline {
  constructor(
    scenes,
    { index = 0, elapsed = 0, paused = false, speed = 1, interactive = true } = {},
  ) {
    this.snapshots = new Map();
    this.scenes = scenes;
    this.paused = paused;
    this.speed = speed;
    this.interactive = interactive;
    this.goto(index, elapsed);
  }
  get scene() {
    return this.scenes[this.index];
  }
  get cue() {
    return sceneCue(this.scene.id);
  }
  get isFinal() {
    return this.index === this.scenes.length - 1;
  }
  get waiting() {
    return this.isFinal
      ? !this.opened && this.elapsed >= this.scene.waitAt
      : this.interactive && ['waiting', 'settled'].includes(this.phase);
  }
  get progress() {
    return clamp(this.elapsed / (this.isFinal ? this.scene.waitAt : this.scene.duration));
  }
  get opening() {
    return clamp(this.openElapsed / 4.5);
  }
  get action() {
    return this.actionDone ? 1 : clamp(this.actionElapsed / this.cue.duration);
  }
  get transition() {
    return this.phase === 'leaving' ? ease(this.exitElapsed / 0.95) : 0;
  }
  goto(index, elapsed = 0) {
    this.index = clamp(index, 0, this.scenes.length - 1);
    this.opened = false;
    this.openElapsed = 0;
    this.elapsed = clamp(
      elapsed,
      0,
      this.isFinal ? this.scene.waitAt : this.scene.duration - (this.interactive ? 0 : 0.001),
    );
    this.actionElapsed = 0;
    this.actionDone = this.interactive && !this.isFinal && this.elapsed >= this.scene.duration;
    this.actionStart = this.elapsed;
    this.exitElapsed = 0;
    this.settleElapsed = 0;
    this.autoContinue = false;
    this.pendingAction = false;
    this.destination = null;
    this.phase = this.isFinal
      ? 'arriving'
      : this.actionDone
        ? 'settled'
        : this.interactive && this.elapsed >= this.cue.introAt
          ? 'waiting'
          : 'arriving';
  }
  interact({ through = false } = {}) {
    if (this.paused) {
      this.paused = false;
      return true;
    }
    if (this.isFinal) return through ? false : this.open();
    if (!this.interactive) {
      this.goto(this.index + 1);
      return true;
    }
    if (
      this.phase === 'leaving' ||
      this.phase === 'acting' ||
      this.autoContinue ||
      this.pendingAction
    )
      return false;
    this.paused = false;
    if (this.phase === 'settled') {
      this.leave(this.index + 1);
      return true;
    }
    if (this.elapsed < this.cue.introAt) {
      this.phase = 'arriving';
      this.pendingAction = true;
      return true;
    }
    this.beginAction();
    return true;
  }
  beginAction() {
    this.phase = 'acting';
    this.actionStart = this.elapsed;
    this.actionElapsed = 0;
    this.pendingAction = false;
    this.autoContinue = true;
  }
  leave(index) {
    const phase = this.phase === 'settled' ? 'settled' : 'waiting';
    this.snapshots.set(this.index, {
      elapsed: this.elapsed,
      phase,
      actionDone: this.actionDone,
      opened: this.opened,
      openElapsed: this.openElapsed,
    });
    this.pendingAction = false;
    this.autoContinue = false;
    this.phase = 'leaving';
    this.exitElapsed = 0;
    this.destination = clamp(index, 0, this.scenes.length - 1);
  }
  navigate(direction) {
    if ((direction !== 1 && direction !== -1) || this.phase === 'leaving') return false;
    const destination = this.index + direction;
    if (destination < 0 || destination >= this.scenes.length) return false;
    this.paused = false;
    this.autoContinue = false;
    this.leave(destination);
    return true;
  }
  back() {
    return this.navigate(-1);
  }
  restart() {
    this.snapshots.clear();
    this.goto(0);
    this.paused = false;
  }
  tick(seconds) {
    if (this.paused || !Number.isFinite(seconds) || seconds <= 0) return false;
    const dt = seconds * this.speed;
    if (this.phase === 'leaving') {
      this.exitElapsed = Math.min(0.95, this.exitElapsed + dt);
      if (this.exitElapsed >= 0.95) {
        const destination = this.destination,
          saved = this.snapshots.get(destination);
        this.goto(destination);
        if (saved) {
          Object.assign(this, saved);
          this.actionStart = this.elapsed;
        }
        return true;
      }
      return false;
    }
    if (this.isFinal) {
      this.elapsed = Math.min(this.scene.waitAt, this.elapsed + dt);
      if (this.opened) this.openElapsed = Math.min(30, this.openElapsed + dt);
      return false;
    }
    if (this.interactive) {
      if (this.phase === 'acting') {
        this.actionElapsed = Math.min(this.cue.duration, this.actionElapsed + dt);
        this.elapsed =
          this.actionStart +
          (this.scene.duration - this.actionStart) *
            (this.cue.pace === 'linear' ? this.action : ease(this.action));
        if (this.actionElapsed >= this.cue.duration) {
          this.elapsed = this.scene.duration;
          this.actionDone = true;
          this.phase = 'settled';
          this.settleElapsed = 0;
        }
      } else if (this.phase === 'settled' && this.autoContinue) {
        this.settleElapsed += dt;
        if (this.settleElapsed >= 3) this.leave(this.index + 1);
      } else if (this.phase === 'arriving') {
        this.elapsed = Math.min(this.cue.introAt, this.elapsed + dt);
        if (this.elapsed >= this.cue.introAt) {
          if (this.pendingAction) this.beginAction();
          else this.phase = 'waiting';
        }
      }
      return false;
    }
    const old = this.index;
    this.elapsed += dt;
    while (!this.isFinal && this.elapsed >= this.scene.duration) {
      this.elapsed -= this.scene.duration;
      this.index++;
    }
    if (this.isFinal) this.elapsed = Math.min(this.elapsed, this.scene.waitAt);
    return this.index !== old;
  }
  open() {
    if (!this.isFinal || !this.waiting || this.phase === 'leaving') return false;
    this.opened = true;
    this.openElapsed = 0;
    this.paused = false;
    return true;
  }
  caption() {
    let caption = '',
      at = 0;
    for (const cue of this.scene.captions) {
      if (this.elapsed >= cue[0]) {
        at = cue[0];
        caption = cue[1];
      } else break;
    }
    return { text: caption, at };
  }
}
