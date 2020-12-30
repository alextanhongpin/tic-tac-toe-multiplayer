# tic-tac-toe-multiplayer
Real-time tic-tac-toe with WebSocket, applied using event sourcing.


## Event Sourcing Concepts


### Events

Each entity produces __event__ for a given behaviour (lifecycle event, creation/deletion, updates etc).

The event stores the __final__ (derived) changes of the entity and increments its version by 1. The event would first be persisted, before the changes are applied to the entity.

Since we are representing our events as JavaScript class, we need a way to serialize and deserialize it:

```js
// The base event for Game entity.
export class GameEvent {
  constructor(aggregateId, aggregateVersion) {
    this.aggregateId = aggregateId;
    this.aggregateVersion = aggregateVersion;
  }

  // Overrides JSON.stringify by attaching event `type`.
  toJSON() {
    const obj = Object.fromEntries(Object.entries(this));
    return {
      ...obj,
      type: this.constructor.name
    };
  }
}
```

We can create new event by extending the `GameEvent`:

```js
export class GameCreated extends GameEvent {
  constructor(
    aggregateId,
    aggregateVersion,
    { cells, players, labels, round }
  ) {
    super(aggregateId, aggregateVersion);
    this.cells = cells;
    this.players = players;
    this.labels = labels;
    this.round = round;
  }
}
```

[##](##) Entity

Each base entity has a unique aggregate id and version (as well as type once we serialize it). To rebuild an entity, we can just pass in the historical events.

Note that we only keep track changes of the entity from the last state (determined by aggregate version), so if we build an entity from the last 10 events, the version would be 10, but we do not store the previous events when rebuilding. Only events that are created after this version would be appended.

```js
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
```

In the `apply()` method, we check that the entity's aggregate id matches that of event, and the event has a version higher than the entity.

When rebuilding an entity from past event, we just want to `apply` the changes (so as to not trigger side effects). When triggering new behaviour, we call the `raise` method, which will also store the changes.


The pseudo code for custom entity is as follow:

```js
// Game entity.
class Game extends Entity {
  // Each behaviour raises an event.
  move() {
    // Check business logic, skip or raise event.

    // Create event.
    const event = new PlayerMoved(
      this.aggregateId,
      this.aggregateVersion + 1,
      {
        position,
        label,
        round: this.round + 1
      }
    );
    // Raise event.
    this.raise(event)
  }
}

// Creating new entity requires another factory method in order to
raise the event.
// We do not put it in the constructor, else rebuilding the game from past events will always trigger an unwanted `raise()`.
export function createGame(aggregateId) {
  const event = new GameCreated(aggregateId, 1, {
    round: 0,
    players: [],
    labels: "xo",
    cells: Array(9).fill(null)
  });
  const game = new Game(aggregateId);
  game.raise(event);
  return game;
}

// Rebuilding entity from the past events.
const events = [....]
const pastGame = new Game('', 0, events)
```
