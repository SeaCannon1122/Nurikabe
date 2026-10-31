let width; let height;

let field; let ds_field;

let rand; let random_step;

const CELL = {
  EMPTY: 0,
  FULL: -1,
  MARKED: -2,
  BLOCKED: -3
};

const DIRECTION = {
  NONE: -1,
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

function clear_field()
{
  for (let i = 0; i < width * height; i++) if (field[i] === CELL.FULL || field[i] === CELL.MARKED) field[i] = CELL.EMPTY;
}