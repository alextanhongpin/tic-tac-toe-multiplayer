export default class PubSub {
  #events = {};
  on(name, fn) {
    if (!this.#events[name]) {
      this.#events[name] = [fn];
    } else {
      this.#events[name].push(fn);
    }
  }
  emit(name, args) {
    const events = this.#events[name];
    if (!events) return;
    for (let event of events) {
      event(args);
    }
  }
  off(name, fn) {
    if (!this.#events[name]) return;
    this.#events[name] = this.#events[name].filter(it => it !== fn);
  }
}
