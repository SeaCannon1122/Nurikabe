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

function trace_stream_recursive(x, y)
{
  if (field[x+y*width] !== CELL.FULL || ds_field[x+y*width] !== 0) return;

  ds_field[x+y*width] = 1;

  if (x > 0)          trace_stream_recursive(x-1, y);
  if (x < width - 1)  trace_stream_recursive(x+1, y);
  if (y > 0)          trace_stream_recursive(x, y-1);
  if (y < height -1)  trace_stream_recursive(x, y+1);
}

function check_state(should_log)
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
          if(should_log) console.log(`island at x: ${x}, y: ${y} has size ${res} instead of ${field[x+y*width]}`);
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
        if(should_log) console.log(`pool at x: ${x}, y: ${y}`);
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
        if(should_log) console.log(`cell at x: ${x}, y: ${y} not connected to main stream`);
        return false;
      }
    }
  }

  return true;
}