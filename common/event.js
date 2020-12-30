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

export class GameWon extends GameEvent {
  constructor(aggregateId, aggregateVersion, playerId) {
    super(aggregateId, aggregateVersion);
    this.playerId = playerId;
  }
}

export class GameDraw extends GameEvent {}
export class GameReset extends GameEvent {
  constructor(aggregateId, aggregateVersion, { cells, labels, round }) {
    super(aggregateId, aggregateVersion);
    this.cells = cells;
    this.labels = labels;
    this.round = round;
  }
}

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

export class PlayerAdded extends GameEvent {
  constructor(aggregateId, aggregateVersion, players) {
    super(aggregateId, aggregateVersion);
    this.players = players;
  }
}

export class PlayerRemoved extends GameEvent {
  constructor(aggregateId, aggregateVersion, players) {
    super(aggregateId, aggregateVersion);
    this.players = players;
  }
}

export class PlayerMoved extends GameEvent {
  constructor(aggregateId, aggregateVersion, { position, label, round }) {
    super(aggregateId, aggregateVersion);
    this.position = position;
    this.label = label;
    this.round = round;
  }
}

export const mapEvent = event => {
  switch (event.type) {
    case "GameReset":
      return new GameReset(event.aggregateId, event.aggregateVersion, event);
    case "GameCreated":
      return new GameCreated(event.aggregateId, event.aggregateVersion, event);
    case "GameDraw":
      return new GameDraw(event.aggregateId, event.aggregateVersion);
    case "GameWon":
      return new GameWon(
        event.aggregateId,
        event.aggregateVersion,
        event.playerId
      );
    case "PlayerMoved":
      return new PlayerMoved(event.aggregateId, event.aggregateVersion, event);

    case "PlayerAdded":
      return new PlayerAdded(
        event.aggregateId,
        event.aggregateVersion,
        event.players
      );
    case "PlayerRemoved":
      return new PlayerRemoved(
        event.aggregateId,
        event.aggregateVersion,
        event.players
      );
    default:
      throw new Error(`mapEventError: not implemented ${event}`);
  }
};
