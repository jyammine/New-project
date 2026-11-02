import * as migration_20261102_225833_initial from './20261102_225833_initial';

export const migrations = [
  {
    up: migration_20261102_225833_initial.up,
    down: migration_20261102_225833_initial.down,
    name: '20261102_225833_initial'
  },
];
