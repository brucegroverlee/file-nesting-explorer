import * as vscode from "vscode";
import Mixpanel from "mixpanel";
import { appId } from "../AppId";
import { os } from "../Os";

let initialized = false;
let mixpanel: ReturnType<typeof Mixpanel.init> | null = null;
const distinctId = vscode?.env?.machineId || "unknown";

const MIXPANEL_TOKEN = "20e6fc60e1f781ba491213789d2618cf";

export const initMixpanel = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  try {
    mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

    const extension = vscode.extensions.getExtension(
      "GroverLee.file-nesting-explorer"
    );
    const extensionVersion = extension?.packageJSON?.version || "unknown";

    mixpanel.people.set(distinctId, {
      extension_version: extensionVersion,
      app_id: appId,
      os,
    });
  } catch (e) {
    // Swallow errors to avoid breaking the extension runtime.
    mixpanel = null;
    console.log("Failed to initialize Mixpanel", e);
  }
};

export const track = (event: string, properties?: any) => {
  try {
    if (!mixpanel) {
      console.log("Mixpanel client not initialized", event, properties);
      return;
    }

    mixpanel.track(event, {
      ...(properties || {}),
      distinct_id: distinctId,
    });
  } catch (e) {
    console.log("Failed to track event", event, properties);
  }
};
