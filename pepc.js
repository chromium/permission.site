const API_ACCESS_STATUSES = {
    success: '🟢 success',
    error: '🔴 error',
    unknown: '⚫️ unknown',
};
// Display the feature access status (whether the feature can actually be accessed successfully in the browser)
function updateAccessStatus(permissionName, accessStatus, message) {
    const textToDisplay = API_ACCESS_STATUSES[accessStatus];
    document.querySelector(`#${permissionName}-access-status`).innerText =
        textToDisplay;
    if (message) {
        document.querySelector(`#${permissionName}-error-message`).innerText = message
    }
}
// Utils
function successCallback(permissionName) {
    return () => updateAccessStatus(permissionName, 'success');
}
function errorCallback(permissionName) {
    return (error) => updateAccessStatus(permissionName, 'error', error.message);
}

const PEPC_TYPES_WITH_GRANTED_HANDLER = {
    'camera': () => { },
    'microphone': () => { },
    'camera-microphone': () => { },
    'geolocation': function () {
        navigator.geolocation.getCurrentPosition(
            successCallback('geolocation'),
            errorCallback('geolocation')
        );
    }
}

window.addEventListener("load", function () {
    for (const [type, grantedHandler] of Object.entries(PEPC_TYPES_WITH_GRANTED_HANDLER)) {
        const pepc = document.getElementById(type);

        pepc.addEventListener('promptdismiss', function () {
            console.log('Dismiss, permission status: ' + pepc.permissionStatus);
            if (pepc.permissionStatus == 'granted') {
                grantedHandler();
            }
        });

        pepc.addEventListener('promptaction', function () {
            console.log('Action, permission status: ' + pepc.permissionStatus);
            if (pepc.permissionStatus == 'granted') {
                grantedHandler();
            }
        });
    }
});
