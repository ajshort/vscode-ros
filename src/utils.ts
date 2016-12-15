import * as pfs from "./promise-fs";

/**
 * Gets the names of installed distros.
 */
export function getDistros(): Promise<string[]> {
  return pfs.readdir("/opt/ros");
}
