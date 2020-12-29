export class GameEvent {
  constructor(aggregateId, aggregateVersion) {
    this.aggregateId = aggregateId;
    this.aggregateVersion = aggregateVersion;
  }
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
