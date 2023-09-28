const pattern = /-\S+ \S+/g;

export function extractArgs(arg, mapper = (opt) => opt) {
  let match = pattern.exec(arg);
  const result = {};
  while (match) {
    const [opt, value] = match[0].split(" ");
    const key = mapper(opt);
    if (key) {
      if (result[key]) {
        result[key].push(value);
      } else result[key] = [value];
    }

    match = pattern.exec(arg);
  }
  return result;
}

export async function call(fn, ...args) {
  let result = fn(...args);
  while (result instanceof Promise) {
    result = await result;
  }
  return result;
}
