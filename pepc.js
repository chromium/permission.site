const PEPC_TYPES = [
    'camera',
    'microphone',
    'camera-microphone',
    'geolocation'
]

window.addEventListener("load", function () {
    PEPC_TYPES.forEach((id) => {
        const pepc = document.getElementById(id);

        pepc.addEventListener('promptdismiss', function () {
            console.log('Dismiss, permission status: ' + pepc.permissionStatus);
        });

        pepc.addEventListener('promptaction', function () {
            console.log('Action, permission status: ' + pepc.permissionStatus);
        });
    });
});
