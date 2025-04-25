const API_STATUS_TO_DISPLAY_TEXT = {
  success: "🟢 success",
  error: "🔴 error",
  unknown: "⚫️ unknown",
};

// Display the feature access status (whether the feature can actually be accessed successfully in the browser)
function updateaccessStatus(permissionName, accessStatus, errorMessage) {
  const textToDisplay = API_STATUS_TO_DISPLAY_TEXT[accessStatus];
  document.querySelector(`#${permissionName}-access-status`).innerText =
    textToDisplay;
  if (errorMessage) {
    document.querySelector(`#${permissionName}-error-message`).innerText =
      errorMessage;
  }
}

// Utils (copied from `index.js`)
function successCallback(permissionName) {
  return () => updateaccessStatus(permissionName, "success");
}
function errorCallback(permissionName) {
  return (error) => updateaccessStatus(permissionName, "error", error.message);
}

const PEPC_TYPES_WITH_GRANTED_HANDLER = {
  geolocation: () => {
    navigator.geolocation.getCurrentPosition(
      successCallback("geolocation"),
      errorCallback("geolocation"),
    );
  },
  camera: () => {
    // TODO: Verify camera API works.
  },
  microphone: () => {
    // TODO: Verify microphone API works.
  },
  "camera-microphone": () => {
    // TODO: Verify camera-microphone API works.
  },
};

window.addEventListener("load", () => {
  for (const [type, grantedHandler] of Object.entries(
    PEPC_TYPES_WITH_GRANTED_HANDLER,
  )) {
    const pepc = document.getElementById(type);

    pepc.addEventListener("promptdismiss", () => {
      console.log("Dismiss, permission status: " + pepc.permissionStatus);
      if (pepc.permissionStatus === "granted") {
        grantedHandler();
      }
    });

    pepc.addEventListener("promptaction", () => {
      console.log("Action, permission status: " + pepc.permissionStatus);
      if (pepc.permissionStatus === "granted") {
        grantedHandler();
      }
    });
  }
});
