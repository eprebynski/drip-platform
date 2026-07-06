export function field(type, options = {}) {
  return Object.freeze({ type, required: true, ...options });
}

export function optional(type, options = {}) {
  return field(type, { ...options, required: false });
}

export function arrayOf(itemType, options = {}) {
  return field("array", { items: { type: itemType }, ...options });
}

export function optionalArrayOf(itemType, options = {}) {
  return optional("array", { items: { type: itemType }, ...options });
}

export function defineSchema(name, fields, options = {}) {
  return Object.freeze({
    name,
    allowAdditional: options.allowAdditional ?? true,
    fields: Object.freeze(fields)
  });
}

export function validateSchema(schema, value) {
  const errors = [];

  if (!isPlainObject(value)) {
    return {
      valid: false,
      errors: [`${schema.name} must be an object`]
    };
  }

  for (const [name, descriptor] of Object.entries(schema.fields)) {
    const fieldValue = value[name];
    const isMissing = fieldValue === undefined || fieldValue === null;

    if (descriptor.required !== false && isMissing) {
      errors.push(`${schema.name}.${name} is required`);
      continue;
    }

    if (isMissing) {
      continue;
    }

    validateField(`${schema.name}.${name}`, descriptor, fieldValue, errors);
  }

  if (!schema.allowAdditional) {
    for (const key of Object.keys(value)) {
      if (!schema.fields[key]) {
        errors.push(`${schema.name}.${key} is not allowed`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function assertValid(schema, value) {
  const result = validateSchema(schema, value);
  if (!result.valid) {
    throw new Error(result.errors.join("; "));
  }
  return value;
}

function validateField(path, descriptor, value, errors) {
  if (descriptor.enum && !descriptor.enum.includes(value)) {
    errors.push(`${path} must be one of ${descriptor.enum.join(", ")}`);
    return;
  }

  switch (descriptor.type) {
    case "string":
      if (typeof value !== "string" || value.trim() === "") {
        errors.push(`${path} must be a non-empty string`);
      }
      break;
    case "string-empty-ok":
      if (typeof value !== "string") {
        errors.push(`${path} must be a string`);
      }
      break;
    case "number":
      if (typeof value !== "number" || Number.isNaN(value)) {
        errors.push(`${path} must be a number`);
      }
      break;
    case "integer":
      if (!Number.isInteger(value)) {
        errors.push(`${path} must be an integer`);
      }
      break;
    case "boolean":
      if (typeof value !== "boolean") {
        errors.push(`${path} must be a boolean`);
      }
      break;
    case "date-string":
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        errors.push(`${path} must be an ISO-compatible date string`);
      }
      break;
    case "url":
      if (typeof value !== "string" || !isUrl(value)) {
        errors.push(`${path} must be a valid URL`);
      }
      break;
    case "array":
      validateArray(path, descriptor, value, errors);
      break;
    case "object":
      if (!isPlainObject(value)) {
        errors.push(`${path} must be an object`);
      }
      break;
    case "record":
      if (!isPlainObject(value)) {
        errors.push(`${path} must be a record object`);
      }
      break;
    case "any":
      break;
    default:
      errors.push(`${path} has unknown schema type ${descriptor.type}`);
  }
}

function validateArray(path, descriptor, value, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return;
  }

  if (!descriptor.items) {
    return;
  }

  value.forEach((item, index) => {
    validateField(`${path}[${index}]`, descriptor.items, item, errors);
  });
}

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
