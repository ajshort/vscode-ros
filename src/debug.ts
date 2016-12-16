import * as extension from "./extension";

/**
 * Gets stringified settings to pass to the debug server.
 */
export async function getDebugSettings() {
  return JSON.stringify({ env: extension.env });
}
