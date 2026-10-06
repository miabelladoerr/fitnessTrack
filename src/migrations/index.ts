import * as migration_20261006_150045_initial from './20261006_150045_initial';

export const migrations = [
  {
    up: migration_20261006_150045_initial.up,
    down: migration_20261006_150045_initial.down,
    name: '20261006_150045_initial'
  },
];
