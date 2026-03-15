import * as vscode from "vscode";
import Mixpanel from "mixpanel";
import { appId } from "../AppId";
import { os } from "../Os";

let initialized = false;
let mixpanel: ReturnType<typeof Mixpanel.init> | null = null;

const MIXPANEL_TOKEN = "20e6fc60e1f781ba491213789d2618cf";

const getDistinctId = () => vscode.env.machineId || "unknown";

const getExtensionVersion = () => {
  const extension = vscode.extensions.getExtension(
    "GroverLee.file-nesting-explorer"
  );

  return extension?.packageJSON?.version || "unknown";
};

const handleMixpanelError = (error: Error | null | undefined, action: string) => {
  if (!error) {
    return;
  }

  console.log(`Mixpanel ${action} failed`, error);
};

export const initMixpanel = (context: vscode.ExtensionContext) => {
  if (initialized) {
    return;
  }

  initialized = true;

  if (context.extensionMode !== vscode.ExtensionMode.Production) {
    return;
  }

  const distinctId = getDistinctId();
  const extensionVersion = getExtensionVersion();

  try {
    mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

    mixpanel.people.set(distinctId, {
      extension_version: extensionVersion,
      app_id: appId,
      os,
    }, (error) => handleMixpanelError(error, "people.set"));
  } catch (e) {
    // Swallow errors to avoid breaking the extension runtime.
    mixpanel = null;
    console.log("Failed to initialize Mixpanel", e);
  }
};

export const track = (event: string, properties?: any) => {
  try {
    if (!mixpanel) {
      return;
    }

    const distinctId = getDistinctId();
    const extensionVersion = getExtensionVersion();

    mixpanel.track(event, {
      ...(properties || {}),
      distinct_id: distinctId,
      extension_version: extensionVersion,
      app_id: appId,
      os,
    }, (error) => handleMixpanelError(error, `track(${event})`));
  } catch (e) {
    console.log("Failed to track event", event, properties);
  }
};
