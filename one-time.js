const OTHER_PAGE_HREF = '/other-page.html';

const PERMISSIONS_API_STATUSES = {
  // key = status ID, value: user-friendly string to display
  granted: '🟢 granted',
  denied: '🔴 denied',
  prompt: '🔵 prompt',
};

const API_ACCESS_STATUSES = {
  success: '🟢 success',
  error: '🔴 error',
  unknown: '⚫️ unknown',
};

// Display the Permissions API status (https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
function updatePermissionsApiStatus(permissionName, permissionStatus) {
  const textToDisplay = PERMISSIONS_API_STATUSES[permissionStatus];
  document.querySelector(`#${permissionName}-permission-status`).innerText =
    textToDisplay;
}

// Display the feature access status (whether the feature can actually be accessed successfully in the browser)
function updateAccessStatus(permissionName, accessStatus) {
  const textToDisplay = API_ACCESS_STATUSES[accessStatus];
  document.querySelector(`#${permissionName}-access-status`).innerText =
    textToDisplay;
}
// Utils
function successCallback(permissionName) {
  return () => updateAccessStatus(permissionName, 'success');
}
function errorCallback(permissionName) {
  return () => updateAccessStatus(permissionName, 'error');
}

// Main
window.addEventListener('load', function () {
  // Display the page's origin for demo instructions purposes
  document
    .querySelectorAll('.origin')
    .forEach((el) => (el.innerText = document.location.origin));

  document.getElementById('other-page').setAttribute('href', OTHER_PAGE_HREF);

  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  const register = {
    geolocation: function () {
      navigator.geolocation.getCurrentPosition(
        successCallback('geolocation'),
        errorCallback('geolocation')
      );
    },
    camera: function () {
      navigator.mediaDevices
        ? navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(successCallback('camera'), errorCallback('camera'))
        : navigator.getUserMedia(
            { video: true },
            successCallback('camera'),
            errorCallback('camera')
          );
    },
    microphone: function () {
      navigator.mediaDevices
        ? navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(successCallback('microphone'), errorCallback('microphone'))
        : navigator.getUserMedia(
            { audio: true },
            successCallback('microphone'),
            errorCallback('microphone')
          );
    },
    // camera-microphone and not camera+microphone to ensure functioning CSS selector
    'camera-microphone': function () {
      navigator.mediaDevices
        ? navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then(
              successCallback('camera-microphone'),
              errorCallback('camera-microphone')
            )
        : navigator.getUserMedia(
            { audio: true, video: true },
            successCallback('camera-microphone'),
            errorCallback('camera-microphone')
          );
    },
  };

  for (const permissionType in register) {
    const permissionName = permissionType;
    // We don't try to access any feature on page load; we wait for user action instead
    // This is a best practice for permissions, and also allows the demo to better showcase one-time permissions

    navigator.permissions.query({ name: permissionName }).then(
      (permissionStatus) => {
        // Display initial Permissions API status
        updatePermissionsApiStatus(permissionName, permissionStatus.state);

        // Add listener on Permissions API status change
        permissionStatus.onchange = () => {
          // Display updated Permissions API status
          updatePermissionsApiStatus(permissionName, permissionStatus.state);
          // Log the Permissions API status change in the console
          console.info(
            `${permissionName} permission state has changed to '${permissionStatus.state}'`
          );
        };
      }, // Rejected promise callback if Permissions API isn't supported in this browser of for this capability
      () => {
        console.warn(
          `${permissionName}: In this browser, the status of this permission can't be queried via the Permissions API`
        );
      }
    );

    document.getElementById(permissionName).addEventListener('click', () => {
      register[permissionName]();
    });
  }
});
