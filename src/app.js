let cell_field;
let won;

let start_time; let timer_interval; 

const won_label = document.getElementById("won-label");
const timer = document.getElementById("timer");
const seed_label = document.getElementById("seed-label");
const gen_clear_checkbox = document.getElementById("gen-clear-checkbox");
gen_clear_checkbox.checked = true;

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

const game_field = document.getElementById("game-field");

let mouse_down = false;
let mouse_color = null;

function clear_cell_field()
{
  for (let x = 0; x < width; x++) for (let y = 0; y < height; y++) set_cell(x, y, CELL.EMPTY);
}

function new_cell_field(w, h)
{
  if (timer_interval) clearInterval(timer_interval);

  let seed_val = Math.floor(Math.random() * 999999);

  generate_field(w, h, seed_val)
  if (gen_clear_checkbox.checked) clear_field()

  cell_field = []

  seed_label.textContent = `id: w${width}h${height}s${seed_val}`;
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

  won = false;
  won_label.textContent = "";

  start_time = Date.now();

  timer_interval = setInterval(() => {timer.textContent = `${((Date.now() - start_time) / 1000).toFixed(1)} s`;}, 100);
}

function check_cell_field_state()
{
  if (!check_state(true)) return;

  clearInterval(timer_interval);
  won = true;
  won_label.textContent = "!!! YOU WON !!!";
}

const clear_button = document.getElementById("clear-button");
clear_button.addEventListener("click", () => {clear_field();});

const size_10_button = document.getElementById("10-button");
const size_15_button = document.getElementById("15-button");
const size_20_button = document.getElementById("20-button");
const size_25_button = document.getElementById("25-button");

size_10_button.addEventListener("click", () => {new_cell_field(10,10); });
size_15_button.addEventListener("click", () => {new_cell_field(15,15); });
size_20_button.addEventListener("click", () => {new_cell_field(20,20); });
size_25_button.addEventListener("click", () => {new_cell_field(25,25); });

document.addEventListener("mouseup", () => {
  if (mouse_down === true) if (won === false) check_cell_field_state();
  mouse_down = false;
  mouse_color = null;
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

const solve_button = document.getElementById("solve-button");
solve_button.addEventListener("click", () => {if (won === false) {solve(); check_cell_field_state();} });

const load_input_field = document.getElementById("load-input-field");
load_input_field.value = "";

function create_field_from_id()
{
  let match = load_input_field.value.match(/w(\d+)h(\d+)s(\d+)/);

  create_field(Number(match[1]), Number(match[2]), Number(match[3]))
}

const load_button = document.getElementById("load-button");
load_button.addEventListener("click", () => {create_field_from_id(); });

new_cell_field(10, 10);