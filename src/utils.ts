import * as pfs from "./promise-fs";
import { dirname } from "path";

/**
 * Traverses up directories to find a catkin workspace.
 */
export async function findCatkinWorkspace(dir: string): Promise<string> {
  while (dir && dirname(dir) !== dir) {
    if (await pfs.exists(`${dir}/.catkin_workspace`)) {
      return dir;
    }

    dir = dirname(dir);
  }
}

/**
 * Gets the names of installed distros.
 */
export function getDistros(): Promise<string[]> {
  return pfs.readdir("/opt/ros");
}
