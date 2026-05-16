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

let width; let height;

let field; let ds_field; let cell_field;
let won;

let rand; let random_step;

let start_time; let timer_interval; 

const won_label = document.getElementById("won-label");
const timer = document.getElementById("timer");
const seed_label = document.getElementById("seed-label");

function set_cell(x, y, value)
{
  let cell = cell_field[x+y*width];

  if (value > 0)
  {
    cell.textContent = value;
    cell.style.backgroundColor = "white";

    field[y*width+x] = value;
    return;
  }

  if (value === CELL.BLOCKED)
  {
    cell.textContent = "";
    cell.style.backgroundColor = "gray";

    field[y*width+x] = value;
    return;
  }

  if (field[y*width+x] > 0 || field[y*width+x] === CELL.BLOCKED) return;
  
  field[y*width+x] = value;

  if (value === CELL.EMPTY)
  {
    cell.textContent = "";
    cell.style.backgroundColor = "white";
  }
  else if (value === CELL.FULL)
  {
    cell.textContent = "";
    cell.style.backgroundColor = "black";
  }
  else if (value === CELL.MARKED)
  {
    cell.textContent = ".";
    cell.style.backgroundColor = "white";
  }
}

function clear_field()
{
  for (let x = 0; x < width; x++) for (let y = 0; y < height; y++) set_cell(x, y, CELL.EMPTY);
}

function generate_paths(path_count)
{
  let count = Math.floor(rand() * (path_count + 1));

  if (random_step < width * height / 2)
  {
    if (path_count === 4 && count < 3) count = 3;
    else if (path_count === 3 && count < 2) count = 2;
    else if (path_count === 2 && count < 1) count = 1;
    else if (path_count === 1) count = 1;
  }

  let paths = [false, false, false, false];

  for (let i = 0; i < count; i++)
  {
    let index = Math.floor(rand() * (path_count - i));

    for (let j = 0; ;j++) if (paths[j] === false) { if (index === 0) {paths[j] = true; break;} index--;}
  }

  //return ( * free_count < 1.5 - Math.log(random_step) / 20.);
  //return (free_count * rand() < 1.2);

  random_step++;
  return paths;
}

const game_field = document.getElementById("game-field");

let mouse_down = false;
let mouse_color = null;

function check_island_recursive(x, y)
{
  if (ds_field[x+y*width] === 1 || field[x+y*width] === CELL.BLOCKED || field[x+y*width] === CELL.FULL) return 0;
  if (field[x+y*width] > 0 && ds_field[x+y*width] === 0) return NaN;
  
  ds_field[x+y*width] = 1;
  sum = 1;

  if (x > 0)          sum += check_island_recursive(x-1, y);
  if (x < width - 1)  sum += check_island_recursive(x+1, y);
  if (y > 0)          sum += check_island_recursive(x, y-1);
  if (y < height -1)  sum += check_island_recursive(x, y+1);

  return sum;
}

function label_island_recursive(x, y, counter, size)
{
  if (ds_field[x+y*width] === 2 || field[x+y*width] === CELL.BLOCKED || field[x+y*width] === CELL.FULL) return counter;

  if (counter === 0) { field[x+y*width] = size; return -1;}
  counter--;

  if (x > 0)          counter = label_island_recursive(x-1, y, counter, size);
  if (counter === -1) return -1;
  if (x < width - 1)  counter = label_island_recursive(x+1, y, counter, size);
  if (counter === -1) return -1;
  if (y > 0)          counter = label_island_recursive(x, y-1, counter, size);
  if (counter === -1) return -1;
  if (y < height -1)  counter = label_island_recursive(x, y+1, counter, size);

  return counter;
}

function trace_stream_recursive(x, y)
{
  if (field[x+y*width] !== CELL.FULL || ds_field[x+y*width] !== 0) return;

  ds_field[x+y*width] = 1;

  if (x > 0)          trace_stream_recursive(x-1, y);
  if (x < width - 1)  trace_stream_recursive(x+1, y);
  if (y > 0)          trace_stream_recursive(x, y-1);
  if (y < height -1)  trace_stream_recursive(x, y+1);
}

function check_state()
{
  ds_field = Array(width * height).fill(0);

  // check island sizes
  for (let x = 0; x < width; x++)
  {
    for (let y = 0; y < height; y++)
    {
      if (field[x+y*width] > 0)
      {
        ds_field[x+y*width] = 2;
        let res = check_island_recursive(x, y);
        if ( res !== field[x+y*width])
        {
          console.log(`island at x: ${x}, y: ${y} has size ${res} instead of ${field[x+y*width]}`);
          return false;
        }
      }
    }
  }

  // check for pools
  for (let x = 0; x < width - 1; x++)
  {
    for (let y = 0; y < height - 1; y++)
    {
      if (
        field[x + y * width] === CELL.FULL &&
        field[x+1 + y * width] === CELL.FULL &&
        field[x + (y+1) * width] === CELL.FULL &&
        field[x+1 + (y+1) * width] === CELL.FULL
      )
      {
        console.log(`pool at x: ${x}, y: ${y}`);
        return false;
      }
    }
  }

  // check for connected stream
  for (let i = 0; i < width * height; i++) if (field[i] === CELL.FULL) {trace_stream_recursive(i % width, Math.floor(i / width)); break;}

  for (let x = 0; x < width; x++)
  {
    for (let y = 0; y < height; y++)
    {
      if (ds_field[x+y*width] === 0 && field[x+y*width] !== CELL.BLOCKED)
      {
        console.log(`cell at x: ${x}, y: ${y} not connected to main stream`);
        return false;
      }
    }
  }


  clearInterval(timer_interval);
  won = true;
  won_label.textContent = "!!! YOU WON !!!";
  return true;
}

function all_empty_neighbot(x, y, src_dir)
{
  if (src_dir !== DIRECTION.LEFT  && x > 0)           if (field[x-1+y*width] !== CELL.EMPTY) return false;
  if (src_dir !== DIRECTION.RIGHT && x < width - 1)   if (field[x+1+y*width] !== CELL.EMPTY) return false;
  if (src_dir !== DIRECTION.UP    && y > 0)           if (field[x+(y-1)*width] !== CELL.EMPTY) return false;
  if (src_dir !== DIRECTION.DOWN  && y < height - 1)  if (field[x+(y+1)*width] !== CELL.EMPTY) return false;
  
  return true;
}

function generate_field_stream_recursive(x, y, src_dir)
{
  field[x+y*width] = CELL.FULL;

  let free_count = 0;
  let left_free = false; let right_free = false; let up_free = false; let down_free = false;

  if (src_dir !== DIRECTION.LEFT  && x > 0)           if (all_empty_neighbot(x-1, y, DIRECTION.RIGHT))  {left_free = true; free_count++};
  if (src_dir !== DIRECTION.RIGHT && x < width - 1)   if (all_empty_neighbot(x+1, y, DIRECTION.LEFT))   {right_free = true; free_count++};
  if (src_dir !== DIRECTION.UP    && y > 0)           if (all_empty_neighbot(x, y-1, DIRECTION.DOWN))   {up_free = true; free_count++};
  if (src_dir !== DIRECTION.DOWN  && y < height - 1)  if (all_empty_neighbot(x, y+1, DIRECTION.UP))     {down_free = true; free_count++};
  
  if (free_count === 0) return;

  let paths = generate_paths(free_count);
  let path_i = 0;

  if (left_free) {{if(paths[path_i]) field[x-1+y*width] = CELL.MARKED; else left_free = false;} path_i++; }
  if (right_free) {{if(paths[path_i]) field[x+1+y*width] = CELL.MARKED; else right_free = false;} path_i++; }
  if (up_free) {{if(paths[path_i]) field[x+(y-1)*width] = CELL.MARKED; else up_free = false;} path_i++; }
  if (down_free) {{if(paths[path_i]) field[x+(y+1)*width] = CELL.MARKED; else down_free = false;} path_i++; }

  if (left_free)  generate_field_stream_recursive(x-1, y, DIRECTION.RIGHT);
  if (right_free) generate_field_stream_recursive(x+1, y, DIRECTION.LEFT);
  if (up_free)    generate_field_stream_recursive(x, y-1, DIRECTION.DOWN);
  if (down_free)  generate_field_stream_recursive(x, y+1, DIRECTION.UP);
}

function create_field(w, h, seed)
{
  if (timer_interval) clearInterval(timer_interval);

  width = w; height = h;
  field = Array(width * height).fill(CELL.EMPTY);
  cell_field = []

  seed_label.textContent = `id: w${width}h${height}s${seed}`;
  rand = () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  random_step = 0;
  
  generate_field_stream_recursive(Math.floor(rand() * width), Math.floor(rand() * height), DIRECTION.NONE);

  ds_field = Array(width * height).fill(0);

  for (let x = 0; x < width; x++)
  {
    for (let y = 0; y < height; y++)
    {
      let island_size = check_island_recursive(x, y);
      if (island_size !== 0) label_island_recursive(x, y, Math.floor(rand() * island_size), island_size);
    }
  }

  game_field.style.gridTemplateColumns = `repeat(${width}, ${700/width}px)`;
  game_field.style.gridTemplateRows = `repeat(${height}, ${700/width}px)`;

  game_field.innerHTML = "";

  for (let i = 0; i < width * height; i++)
  {
    const cell = document.createElement("div");
    cell.dataset.x = i % width;
    cell.dataset.y = Math.floor(i / width);

    cell.classList.add("cell");
    cell.className = "cell";

    cell_field.push(cell);
    game_field.appendChild(cell);

    set_cell(i % width, Math.floor(i / width), field[i]);
  }

  document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("mousedown", (e) => {
      const x = Number(cell.dataset.x);
      const y = Number(cell.dataset.y);

      if (field[x+y*width] !== CELL.EMPTY && field[x+y*width] !== CELL.FULL && field[x+y*width] !== CELL.MARKED) return;

      mouse_down = true;

      if (e.button === 0)
      {
        if (field[x+y*width] === CELL.FULL) mouse_color = CELL.EMPTY;
        else mouse_color = CELL.FULL;
      }
      else if (e.button === 2)
      {
        if (field[x+y*width] === CELL.MARKED) mouse_color = CELL.EMPTY;
        else mouse_color = CELL.MARKED;
      }
      set_cell(x, y, mouse_color);
    });

    cell.addEventListener("mouseover", () => {
      if (mouse_down)
      {
        const x = Number(cell.dataset.x);
        const y = Number(cell.dataset.y);
        set_cell(x, y, mouse_color);
      }
    });

  });

  clear_field();
  won = false;
  won_label.textContent = "";

  start_time = Date.now();

  timer_interval = setInterval(() => {timer.textContent = `${((Date.now() - start_time) / 1000).toFixed(1)} ms`;}, 100);
}

function new_field(w, h)
{
  create_field(w, h, Math.floor(Math.random() * 999999));
}

const clear_button = document.getElementById("clear-button");
clear_button.addEventListener("click", () => {clear_field();});

const size_10_button = document.getElementById("10-button");
const size_15_button = document.getElementById("15-button");
const size_20_button = document.getElementById("20-button");
const size_25_button = document.getElementById("25-button");

size_10_button.addEventListener("click", () => {new_field(10,10); });
size_15_button.addEventListener("click", () => {new_field(15,15); });
size_20_button.addEventListener("click", () => {new_field(20,20); });
size_25_button.addEventListener("click", () => {new_field(25,25); });

document.addEventListener("mouseup", () => {
  if (mouse_down === true) if (won === false) check_state();
  mouse_down = false;
  mouse_color = null;
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

const solve_button = document.getElementById("solve-button");
solve_button.addEventListener("click", () => {if (won === false) {solve(); check_state();} });

const load_input_field = document.getElementById("load-input-field");
load_input_field.value = "";

function create_field_from_id()
{
  let match = load_input_field.value.match(/w(\d+)h(\d+)s(\d+)/);

  create_field(Number(match[1]), Number(match[2]), Number(match[3]))
}

const load_button = document.getElementById("load-button");
load_button.addEventListener("click", () => {create_field_from_id(); });

new_field(10, 10);