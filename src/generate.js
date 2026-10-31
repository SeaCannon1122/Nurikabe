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

function all_empty_neighbor(x, y, src_dir)
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

  if (src_dir !== DIRECTION.LEFT  && x > 0)           if (all_empty_neighbor(x-1, y, DIRECTION.RIGHT))  {left_free = true; free_count++};
  if (src_dir !== DIRECTION.RIGHT && x < width - 1)   if (all_empty_neighbor(x+1, y, DIRECTION.LEFT))   {right_free = true; free_count++};
  if (src_dir !== DIRECTION.UP    && y > 0)           if (all_empty_neighbor(x, y-1, DIRECTION.DOWN))   {up_free = true; free_count++};
  if (src_dir !== DIRECTION.DOWN  && y < height - 1)  if (all_empty_neighbor(x, y+1, DIRECTION.UP))     {down_free = true; free_count++};
  
  if (free_count === 0) return;

  let paths = generate_paths(free_count);
  let path_i = 0;

  if (left_free) {{if(paths[path_i]) field[x-1+y*width] = CELL.MARKED; else left_free = false;} path_i++; }
  if (right_free) {{if(paths[path_i]) field[x+1+y*width] = CELL.MARKED; else right_free = false;} path_i++; }
  if (up_free) {{if(paths[path_i]) field[x+(y-1)*width] = CELL.MARKED; else up_free = false;} path_i++; }
  if (down_free) {{if(paths[path_i]) field[x+(y+1)*width] = CELL.MARKED; else down_free = false;} path_i++; }

  // TODO: Reihenfolge auch zufällig

  if (left_free)  generate_field_stream_recursive(x-1, y, DIRECTION.RIGHT);
  if (right_free) generate_field_stream_recursive(x+1, y, DIRECTION.LEFT);
  if (up_free)    generate_field_stream_recursive(x, y-1, DIRECTION.DOWN);
  if (down_free)  generate_field_stream_recursive(x, y+1, DIRECTION.UP);
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

function generate_field(w, h, seed)
{
  width = w; height = h;
  field = Array(w*h).fill(CELL.EMPTY);

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
}