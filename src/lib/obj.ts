export function set(obj: unknown, path: string[], value: unknown): void {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error("Target value must be a plain object");
  }

  let curr: any = obj;

  for (let i = 0; i < path.length; i++) {
    const key = path[i]!;

    if (i === path.length - 1) {
      curr[key] = value;
      return;
    }

    if (curr[key] === undefined) {
      curr[key] = {};
    } else if (
      typeof curr[key] !== "object" ||
      curr[key] === null ||
      Array.isArray(curr[key])
    ) {
      const fullPath = path.join(".");
      const currPath = path.slice(0, i + 1).join(".");
      const type = Array.isArray(curr[key]) ? "array" : typeof curr[key];
      throw new Error(`Cannot set '${fullPath}', '${currPath}' is ${type}`);
    }

    curr = curr[key];
  }
}

export function get(obj: unknown, path: string[]): unknown {
  let curr: any = obj;

  for (const key of path) {
    if (curr === null || typeof curr !== "object") {
      return undefined;
    }
    curr = curr[key];
  }

  return curr;
}

export function has(obj: unknown, path: string[]): boolean {
  let curr: any = obj;

  for (const key of path) {
    if (
      curr === null ||
      typeof curr !== "object" ||
      !Object.hasOwn(curr, key)
    ) {
      return false;
    }
    curr = curr[key];
  }

  return true;
}

export function remove(obj: unknown, path: string[]): void {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error("Target value must be a plain object");
  }

  let curr: any = obj;
  const stack: { parent: any; key: string }[] = [];

  for (const key of path) {
    if (
      curr === null ||
      typeof curr !== "object" ||
      !Object.hasOwn(curr, key)
    ) {
      const fullPath = path.join(".");
      throw new Error(`Cannot remove '${fullPath}', path does not exist`);
    }

    stack.push({ parent: curr, key });
    curr = curr[key];
  }

  const last = stack.pop()!;
  delete last.parent[last.key];

  while (stack.length > 0) {
    const { parent, key } = stack.pop()!;

    const value = parent[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      delete parent[key];
    } else {
      break;
    }
  }
}
