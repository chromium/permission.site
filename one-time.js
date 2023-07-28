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
};

// Display the Permissions API status (https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
}

// Feature access status
function updateAccessStatus(permissionName, accessStatus) {
  const displayStatus = API_ACCESS_STATUSES[accessStatus];
  document.querySelector(`#${permissionName}-access-status`).innerText =
    displayStatus;
}

// Both statuses
function displayStatuses(permissionName, accessStatus) {
  updatePermissionsApiStatus(permissionName);
  updateAccessStatus(permissionName, accessStatus);
}

// Utils
function successCallback(permissionName) {
  return () => displayStatuses(permissionName, 'success');
}
function errorCallback(permissionName) {
  return () => displayStatuses(permissionName, 'error');
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
    const type = permissionType;
    updatePermissionsApiStatus(type);
    document.getElementById(type).addEventListener('click', () => {
      register[type]();
    });
  }
});
