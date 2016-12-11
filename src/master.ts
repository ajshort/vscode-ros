import * as vscode from "vscode";
import * as xmlrpc from "xmlrpc";

const CALLER_ID = "vscode-ros";

/**
 * Exposes the ROS master XML-RPC api.
 */
export class XmlRpcApi {
  private client: xmlrpc.Client;

  public constructor(uri: string) {
    this.client = xmlrpc.createClient(uri);
  }

  /**
   * Returns true if a master process is running.
   */
  public check(): Promise<boolean> {
    return this.getPid().then(() => true, () => false);
  }

  public getPid(): Promise<number> {
    return this.methodCall("getPid");
  }

  private methodCall(method: string, ...args: any[]) {
    return new Promise((resolve, reject) => {
      this.client.methodCall(method, [CALLER_ID, ...args], (err, val) => {
        if (err) {
          reject(err);
        } else if (val[0] !== 1) {
          reject(val);
        } else {
          resolve(val[2]);
        }
      });
    });
  }
}

/**
 * Shows the ROS master status in the status bar.
 */
export class StatusBarItem {
  private item: vscode.StatusBarItem;
  private timer: NodeJS.Timer;
  private status: boolean;

  public constructor(private api: XmlRpcApi) {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
    this.item.text = "$(question) ROS master";
  }

  public activate() {
    this.item.show();
    this.timer = setInterval(() => this.update(), 200);
  }

  public dispose() {
    this.item.dispose();
  }

  private async update() {
    const status = await this.api.check();

    if (status === this.status) {
      return;
    }

    this.item.text = (status ? "$(check)" : "$(x)") + " ROS master";
    this.status = status;
  }
}
