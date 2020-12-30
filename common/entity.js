import PubSub from "./pubsub.js";

export default class Entity extends PubSub {
  constructor(aggregateId, aggregateVersion = 0, events = []) {
    super();
    this.aggregateId = aggregateId;
    this.aggregateVersion = aggregateVersion;
    for (let event of events) {
      this.apply(event);
    }
    this.events = events;
  }

  // Ensure that the version and id matches.
  apply(event) {
    if (
      event.aggregateVersion != this.aggregateVersion + 1 &&
      event.aggregateId !== this.aggregateId
    )
      return;
    this.aggregateId = event.aggregateId;
    this.aggregateVersion = event.aggregateVersion;
  }

  raise(event) {
    this.events.push(event);
    this.apply(event);

    // PubSub (optional).
    this.emit(event.constructor.name, event);
  }

  // Include type when serializing.
  toJSON() {
    const obj = Object.fromEntries(Object.entries(this));
    return {
      ...obj,
      type: this.constructor.name
    };
  }
}
