import { randomInt } from "crypto";

export function generateReferenceId() {
  return String(randomInt(1000000, 10000000));
}
