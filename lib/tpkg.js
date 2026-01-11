export function validateTPKG(t: any) {
  const required = ["name", "version", "description", "type", "install"];
  for (const f of required) {
    if (!t[f]) throw new Error(`Missing field: ${f}`);
  }

  if (!["bash", "python", "node"].includes(t.type))
    throw new Error("Invalid tool type");

  return true;
}
