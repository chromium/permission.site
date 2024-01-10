
//  - Information about clearing settings in Chrome (can't link to chrome:// URLs)
//  - Indicate if permissions are already granted, if the relevant API allows it.

window.addEventListener("load", function() {

  var toggle = document.querySelector("#toggle");
  toggle.classList.add("instant");
  if (window.location.protocol == "https:") {
    toggle.classList.add("https");
    toggle.protocol = "http:";
  } else if (window.location.protocol == "http:") {
    toggle.classList.add("http");
    toggle.protocol = "https:";
  }
  setTimeout(function() {
    toggle.classList.remove("instant");
  }, 10);

  function displayOutcome(type, outcome) {
    return function() {
      var argList = [outcome, type].concat([].slice.call(arguments));
      switch(outcome) {
        case "success":
          console.info.apply(console, argList);
          break;
        case "error":
          console.error.apply(console, argList);
          break;
        default:
          console.log.apply(console, argList);
      }
      document.getElementById(type).classList.remove('success', 'error', 'default');
      document.getElementById(type).classList.add(outcome);
    };
  };

  function displayOutcomeForNotifications(outcome) {
    switch(outcome) {
      case "granted":
        console.info(outcome, "notifications");
        document.getElementById("notifications").classList.add("success");
        break;
      case "denied":
      case "default":
        // "default" is supposed to be like "denied", except the user hasn't made an explicit decision yet.
        // https://notifications.spec.whatwg.org/#permission-model
        console.error(outcome, "notifications");
        document.getElementById("notifications").classList.add("error");
        break;
      default:
        throw "Unknown notification API response.";
    }
  };

  function triggerDownload() {
    // Based on http://stackoverflow.com/a/27280611
    var a = document.createElement('a');
    a.download = "test-image.png";
    a.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAABC0lEQVQYlTXPPUsCYQDA8b/e04tdQR5ZBpE3NAR6S0SDVDZKDQ2BY9TUy1foE0TQ1Edo6hOEkyUG0QuBRtQgl0hnenVdnZD5eLbU7xv8Avy5X16KhrQBg47EtpziXO6qBhAEeNEm0qr7VdBcLxt2mlnNbhVu0NMAgdj1wvjOoX2xdSt0L7MGgx2GGid8yLrJvJMUkbKfOF8N68bUIqcz2wQR7GUcYvJIr1dFQijvkh89xGV6BPPMwvMF/nQXJMgWiM+KLPX2tc0HNa/HUxDv2owpx7xV+023Hiwpdt7yhmcjj9/NdrIhn8LrPVmotctWVd01Nt27wH9T3YhHU5O+sT/6SuVZKa4cNGoAv/ZMas7pC/KaAAAAAElFTkSuQmCC";
    a.click();
  }

  function isFullscreen() {
    return document.fullscreenElement ||
           document.webkitFullscreenElement ||
           document.mozFullScreenElement ||
           document.msFullscreenElement;
  }

  function isPointerLocked() {
    return document.pointerLockElement ||
           document.webkitPointerLockElement ||
           document.mozPointerLockElement ||
           document.msPointerLockElement;
  }

  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );
  navigator.requestMIDIAccess = (
    navigator.requestMIDIAccess ||
    navigator.webkitRequestMIDIAccess ||
    navigator.mozRequestMIDIAccess ||
    navigator.msRequestMIDIAccess
  );
  document.documentElement.requestFullscreen = (
    document.documentElement.requestFullscreen ||
    document.documentElement.webkitRequestFullscreen ||
    document.documentElement.mozRequestFullscreen ||
    document.documentElement.msRequestFullscreen
  );
  document.exitFullscreen = (
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen
  );
  document.body.requestPointerLock = (
    document.body.requestPointerLock ||
    document.body.webkitRequestPointerLock ||
    document.body.mozRequestPointerLock ||
    document.body.msRequestPointerLock
  );
  document.exitPointerLock = (
    document.exitPointerLock ||
    document.webkitExitPointerLock ||
    document.mozExitPointerLock ||
    document.msExitPointerLock
  );

  document.addEventListener("fullscreenchange", (e) => {
    displayOutcome("fullscreen", isFullscreen() ? "success" : "default")(e);
  });
  document.addEventListener("fullscreenerror", (e) => {
    displayOutcome("fullscreen", "error")(e);
  });
  document.addEventListener("pointerlockchange", (e) => {
    displayOutcome("pointerlock", isPointerLocked() ? "success" : "default")(e);
  });
  document.addEventListener("pointerlockerror", (e) => {
    displayOutcome("pointerlock", "error")(e);
  });

  var register = {
    "notifications": function () {
      Notification.requestPermission(
        displayOutcomeForNotifications
      );
    },
    "location": function() {
      navigator.geolocation.getCurrentPosition(
        displayOutcome("location", "success"),
        displayOutcome("location", "error")
      );
    },
    "camera": function() {
      navigator.mediaDevices ?
        navigator.mediaDevices.getUserMedia(
          {video: true}).then(
            displayOutcome("camera", "success"),
            displayOutcome("camera", "error")
        ) :
        navigator.getUserMedia(
          {video: true},
          displayOutcome("camera", "success"),
          displayOutcome("camera", "error")
        );
    },
    "microphone": function() {
      navigator.mediaDevices ?
        navigator.mediaDevices.getUserMedia(
          {audio: true}).then(
            displayOutcome("microphone", "success"),
            displayOutcome("microphone", "error")
        ) :
        navigator.getUserMedia(
          {audio: true},
          displayOutcome("microphone", "success"),
          displayOutcome("microphone", "error")
        );
    },
    "camera+microphone": function() {
      navigator.mediaDevices ?
        navigator.mediaDevices.getUserMedia(
          {audio: true, video: true}).then(
            displayOutcome("camera+microphone", "success"),
            displayOutcome("camera+microphone", "error")
        ) :
        navigator.getUserMedia(
          {audio: true, video: true},
          displayOutcome("camera+microphone", "success"),
          displayOutcome("camera+microphone", "error")
        );
    },
    "pan-tilt-zoom": function() {
      navigator.mediaDevices ?
        navigator.mediaDevices.getUserMedia(
          {video: {pan: true, tilt: true, zoom: true}}).then(
            displayOutcome("pan-tilt-zoom", "success"),
            displayOutcome("pan-tilt-zoom", "error")
        ) :
        navigator.getUserMedia(
          {video: {pan: true, tilt: true, zoom: true}},
          displayOutcome("pan-tilt-zoom", "success"),
          displayOutcome("pan-tilt-zoom", "error")
        );
    },
    "pan-tilt-zoom+microphone": function() {
      navigator.mediaDevices ?
        navigator.mediaDevices.getUserMedia(
          {video: {pan: true, tilt: true, zoom: true}, audio: true}).then(
            displayOutcome("pan-tilt-zoom+microphone", "success"),
            displayOutcome("pan-tilt-zoom+microphone", "error")
        ) :
        navigator.getUserMedia(
          {video: {pan: true, tilt: true, zoom: true}, audio: true},
          displayOutcome("pan-tilt-zoom+microphone", "success"),
          displayOutcome("pan-tilt-zoom+microphone", "error")
        );
    },
    "screenshare": function() {
      navigator.mediaDevices.getDisplayMedia().then(
        displayOutcome("screenshare", "success"),
        displayOutcome("screenshare", "error")
      );
    },
    "midi": function() {
      navigator.requestMIDIAccess({
        sysex: false
      }).then(
        displayOutcome("midi", "success"),
        displayOutcome("midi", "error")
      );
    },
    "midi+sysex": function() {
      navigator.requestMIDIAccess({
        sysex: true
      }).then(
        displayOutcome("midi+sysex", "success"),
        displayOutcome("midi+sysex", "error")
      );
    },
    "bluetooth": function() {
      navigator.bluetooth.requestDevice({
        // filters: [...] <- Prefer filters to save energy & show relevant devices.
        // acceptAllDevices here ensures dialog can populate, we don't care with what.
        acceptAllDevices:true
      })
      .then(device => device.gatt.connect())
      .then(
        displayOutcome("bluetooth", "success"),
        displayOutcome("bluetooth", "error")
      );
    },
    "usb": function() {
      navigator.usb.requestDevice({filters: [{}]}).then(
        displayOutcome("usb", "success"),
        displayOutcome("usb", "error")
      );
    },
    "serial": function() {
      navigator.serial.requestPort({filters: []}).then(
        displayOutcome("serial", "success"),
        displayOutcome("serial", "error")
      );
    },
    "hid": function() {
      navigator.hid.requestDevice({filters: []}).then(
        devices => {
          displayOutcome("hid", devices.length > 0 ? "success" : "error")();
        },
        displayOutcome("hid", "error")
      );
    },
    "eme": function() {
      // https://w3c.github.io/encrypted-media/#requestMediaKeySystemAccess
      // Tries multiple configuration per key system. The configurations are in
      // descending order of privileges such that a supported permission-requiring
      // configuration should be attempted before a configuration that does not
      // require permissions.

      var knownKeySystems = [
        "com.example.somesystem",  // Ensure no real system is the first tried.
        "com.widevine.alpha",
        "com.microsoft.playready",
        "com.adobe.primetime",
        "com.apple.fps.2_0",
        "com.apple.fps",
        "com.apple.fps.1_0",
        "com.example.somesystem"  // Ensure no real system is the last tried.
      ];
      var tryKeySystem = function(keySystem) {
        // http://w3c.github.io/encrypted-media/#idl-def-mediakeysystemconfiguration
        // One of videoCapabilities or audioCapabilities must be present. Pick
        // a set that all browsers should support at least one of.
        var capabilities = [
          { contentType: 'audio/mp4; codecs="mp4a.40.2"' },
          { contentType: 'audio/webm; codecs="opus"' },
        ];
        navigator.requestMediaKeySystemAccess(
          keySystem,
          [
            { distinctiveIdentifier: "required",
              persistentState: "required",
              audioCapabilities: capabilities,
              label: "'distinctiveIdentifier' and 'persistentState' required"
            },
            { distinctiveIdentifier: "required",
              audioCapabilities: capabilities,
              label: "'distinctiveIdentifier' required"
            },
            { persistentState: "required",
              audioCapabilities: capabilities,
              label: "'persistentState' required"
            },
            { audioCapabilities: capabilities,
              label: "empty"
            },
            { label: "no capabilities" }
          ]
        ).then(
          function (mediaKeySystemAccess) {
            displayOutcome("eme", "success")(
              "Key System: " + keySystem,
              "Configuration: " + mediaKeySystemAccess.getConfiguration().label,
              mediaKeySystemAccess);
          },
          function (error) {
            if (knownKeySystems.length > 0)
              return tryKeySystem(knownKeySystems.shift());

            displayOutcome("eme", "error")(
              error,
              error.name == "NotSupportedError" ? "No known key systems supported or permitted." : "");
          }
        );
      };
      tryKeySystem(knownKeySystems.shift());
    },
    "idle-detection": (function () {
      let controller = null;

      return async function () {
        if (controller) {
          controller.abort();
          controller = null;
          displayOutcome("idle-detection", "default")();
          return;
        }

        try {
          const status = await IdleDetector.requestPermission();
          if (status != "granted") {
            displayOutcome("idle-detection", "error")(`Permission status: ${status}`);
            return;
          }

          controller = new AbortController();
          const detector = new IdleDetector();
          detector.addEventListener('change', () => {
            console.log(`Idle change: ${detector.userState}, ${detector.screenState}.`);
          });
          await detector.start({signal: controller.signal});
          displayOutcome("idle-detection", "success")();
        } catch (e) {
          controller = null;
          displayOutcome("idle-detection", "error")(e);
        }
      };
    }()),
    "copy": (function() {
      var interceptCopy = false;

      document.addEventListener("copy", function(e){
        if (interceptCopy) {
          // From http://www.w3.org/TR/clipboard-apis/#h4_the-copy-action
          e.clipboardData.setData("text/plain",
            "This text was copied from the permission.site clipboard example."
          );
          e.clipboardData.setData("text/html",
            "This text was copied from the " +
            "<a href='https://permission.site/'>" +
            "permission.site</a> clipboard example."
          );
          e.preventDefault();
        }
      });

      return function() {
        interceptCopy = true;
        document.execCommand("copy");
        interceptCopy = false;
      };
    }()),
    "popup": function() {
      var w = window.open(
        location.href,
        "Popup",
        "resizable,scrollbars,status"
      )
      displayOutcome("popup", w ? "success" : "error")(w);
    },
    "popup-delayed": function() {
      setTimeout(function() {
        var w = window.open(
          location.href,
          "Popup",
          "resizable,scrollbars,status"
        )
        displayOutcome("popup-delayed", w ? "success" : "error")(w);
      }, 5000);
    },
    "fullscreen": function() {
      try {
        if (!isFullscreen()) {
          document.documentElement.requestFullscreen().then(
            displayOutcome("fullscreen", "success")("enter"),
            displayOutcome("fullscreen", "error")
          );
        } else {
          document.exitFullscreen().then(
            displayOutcome("fullscreen", "default")("exit"),
            displayOutcome("fullscreen", "error")
          );
        }
      } catch (e) {
        displayOutcome("fullscreen", "error")(e);
      }
    },
    "pointerlock": function() {
      try {
        if (!window.pointerLocked) {
          document.body.requestPointerLock().then(
            displayOutcome("pointerlock", "success")("locked"),
            displayOutcome("pointerlock", "error")
          );
        } else {
          document.exitPointerLock();
          displayOutcome("pointerlock", "default")("unlocked");
        }
      } catch (e) {
        displayOutcome("pointerlock", "error")(e);
      }
    },
    "keyboardlock": function() {
      try {
        if (!window.keyboardLockRequested) {
          window.keyboardLockRequested = true;
          // Note: As of 2023-12-14, Chrome resolves the promise immediately and holds the lock in a pending state when the document is not fullscreen.
          navigator.keyboard.lock().then(
            displayOutcome("keyboardlock", "success")(isFullscreen() ? "locked" : "will lock in fullscreen"),
            displayOutcome("keyboardlock", "error")
          );
        } else {
          window.keyboardLockRequested = false;
          navigator.keyboard.unlock();
          displayOutcome("keyboardlock", "default")("unlocked");
        }
      } catch (e) {
        displayOutcome("keyboardlock", "error")(e);
      }
    },
    "download": function() {
      // Two downloads at the same time trigger a permission prompt in Chrome.
      triggerDownload();
      triggerDownload();
    },
    "keygen": function() {
      var keygen = document.createElement("keygen");
      document.getElementById("keygen-container").appendChild(keygen);
    },
    "persistent-storage": function() {
      // https://storage.spec.whatwg.org
      navigator.storage.persist().then(
        function(persisted) {
          displayOutcome("persistent-storage", persisted ? "success" : "default")(persisted);
        },
        displayOutcome("persistent-storage", "error")
      )
    },
    
    "protocol-handler": function() {
      // https://www.w3.org/TR/html5/webappapis.html#navigatorcontentutils
      var url = window.location + '%s';
      try {
        navigator.registerProtocolHandler('web+permissionsite', url, 'title');
      } catch(e) {
        displayOutcome("protocol-handler", "error")(e);
      }
    },

    "read-text": function() {
      var cb = navigator.clipboard;
      if (cb) {
        cb.readText().then(function(data) {
          displayOutcome("read-text", "success")("Successfully read data from clipboard: '" + data + "'");
        }, function() {
          displayOutcome("read-text", "error")("Failed to read from clipboard");
        });
      } else {
        displayOutcome("read-text", "error")("navigator.clipboard not available");
      }
    },

    "write-text": function() {
      var cb = navigator.clipboard;
      if (cb) {
        navigator.clipboard.writeText("new clipboard data").then(function() {
          displayOutcome("write-text", "success")("Successfully wrote data to clipboard");
        }, function() {
          displayOutcome("write-text", "error")("Failed to write to clipboard");
        });
      } else {
        displayOutcome("write-text", "error")("navigator.clipboard not available");
      }
    },

    "read-text-delayed": function() {
      var cb = navigator.clipboard;
      if (cb) {
        setTimeout(function() {
          navigator.clipboard.readText().then(function(data) {
            displayOutcome("read-text-delayed", "success")("Successfully read data from clipboard: '" + data + "'");
          }, function() {
            displayOutcome("read-text-delayed", "error")("Failed to read from clipboard");
          });
        }, 5000);
      } else {
        displayOutcome("read-text-delayed", "error")("navigator.clipboard not available");
      }
    },

    "write-text-delayed": function() {
      var cb = navigator.clipboard;
      if (cb) {
        setTimeout(function() {
          navigator.clipboard.writeText("new (delayed) clipboard data").then(function() {
            displayOutcome("write-text-delayed", "success")("Successfully wrote data to clipboard");
          }, function() {
            displayOutcome("write-text-delayed", "error")("Failed to write to clipboard");
          });
        }, 5000);
      } else {
        displayOutcome("write-text-delayed", "error")("navigator.clipboard not available");
      }
    },

    "webauthn-attestation": function() {
      // From https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
      // This code is public domain, per https://developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses

      // sample arguments for registration
      var createCredentialDefaultArgs = {
          publicKey: {
              // Relying Party (a.k.a. - Service):
              rp: {
                  name: "Acme"
              },

              // User:
              user: {
                  id: new Uint8Array(16),
                  name: "john.p.smith@example.com",
                  displayName: "John P. Smith"
              },

              pubKeyCredParams: [{
                  type: "public-key",
                  alg: -7
              }],

              attestation: "direct",

              timeout: 60000,

              challenge: new Uint8Array([ // must be a cryptographically random number sent from a server
                  0x8C, 0x0A, 0x26, 0xFF, 0x22, 0x91, 0xC1, 0xE9, 0xB9, 0x4E, 0x2E, 0x17, 0x1A, 0x98, 0x6A, 0x73,
                  0x71, 0x9D, 0x43, 0x48, 0xD5, 0xA7, 0x6A, 0x15, 0x7E, 0x38, 0x94, 0x52, 0x77, 0x97, 0x0F, 0xEF
              ]).buffer
          }
      };

      // sample arguments for login
      var getCredentialDefaultArgs = {
          publicKey: {
              timeout: 60000,
              // allowCredentials: [newCredential] // see below
              challenge: new Uint8Array([ // must be a cryptographically random number sent from a server
                  0x79, 0x50, 0x68, 0x71, 0xDA, 0xEE, 0xEE, 0xB9, 0x94, 0xC3, 0xC2, 0x15, 0x67, 0x65, 0x26, 0x22,
                  0xE3, 0xF3, 0xAB, 0x3B, 0x78, 0x2E, 0xD5, 0x6F, 0x81, 0x26, 0xE2, 0xA6, 0x01, 0x7D, 0x74, 0x50
              ]).buffer
          },
      };

      // register / create a new credential
      navigator.credentials.create(createCredentialDefaultArgs)
          .then((cred) => {
              console.log("NEW CREDENTIAL", cred);

              // normally the credential IDs available for an account would come from a server
              // but we can just copy them from above...
              var idList = [{
                  id: cred.rawId,
                  transports: ["usb", "nfc", "ble"],
                  type: "public-key"
              }];
              getCredentialDefaultArgs.publicKey.allowCredentials = idList;
              return navigator.credentials.get(getCredentialDefaultArgs);
          })
          .then((assertion) => {
            displayOutcome("webauthn-attestation", "success")(assertion);
          })
          .catch((err) => {
            displayOutcome("webauthn-attestation", "error")(err);
          });
    },
    "nfc": function() {
      if ('NDEFReader' in window) {
        const reader = new NDEFReader();
        reader.scan()
        .then(() => {
          displayOutcome("nfc", "success")("Successfully started NFC scan");
        })
        .catch((err) => {
          displayOutcome("nfc", "error")(err);
        });
      } else {
        displayOutcome("nfc", "error")("NDEFReader is not available");
      }
    },
    "vr": function() {
      if ('xr' in navigator) {
        navigator.xr.requestSession('immersive-vr')
        .then(() => {
          displayOutcome("vr", "success")("Successfully entered VR");
        })
        .catch((err) => {
          displayOutcome("vr", "error")(err);
        });
      } else {
        displayOutcome("vr", "error")("navigator.xr is not available");
      }
    },
    "ar": function() {
      if ('xr' in navigator) {
        navigator.xr.requestSession('immersive-ar')
        .then(() => {
          displayOutcome("ar", "success")("Successfully entered AR");
        })
        .catch((err) => {
          displayOutcome("ar", "error")(err);
        });
      } else {
        displayOutcome("ar", "error")("navigator.xr is not available");
      }
    },
    "orientation": function() {
      if ("ondeviceorientation" in window) {
        const handleDeviceOrientation = () => window.addEventListener("deviceorientation", (event) => {
          if (event.alpha === null && event.beta === null && event.gamma === null) {
            displayOutcome("orientation", "error")("Device has no the required sensors");
          } else {
            displayOutcome("orientation", "success")("Device has the required sensors");
          }
        }, { once: true });

        if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
          window.DeviceOrientationEvent.requestPermission()
            .then((permissionState) => {
              console.log(`Device Orientation permission state: ${permissionState}`);
              if (permissionState !== "granted") {
                // If permission prompt is ignored or dismissed,
                // the permission state value is `default`, and permission can be requested again.
                // https://w3c.github.io/deviceorientation/#id=permission-model
                displayOutcome("orientation", "error")(`Device Orientation permission state: ${permissionState}`);
              } else {
                handleDeviceOrientation();
              }
            })
            .catch((error) => {
              displayOutcome("orientation", "error")(error);
            });
        } else {
          console.log("Device Orientation doesn't require permission request");
          handleDeviceOrientation();
        }
      } else {
        displayOutcome("orientation", "error")("Device Orientation is not supported");
      }
    },
    "motion": function() {
      if ("ondevicemotion" in window) {
        const handleDeviceMotion = () => window.addEventListener("devicemotion", (event) => {
          if (
            event.acceleration.x === null &&
            event.acceleration.y === null &&
            event.acceleration.z === null &&
            event.accelerationIncludingGravity.x === null &&
            event.accelerationIncludingGravity.y === null &&
            event.accelerationIncludingGravity.z === null &&
            event.rotationRate.alpha === null &&
            event.rotationRate.beta === null &&
            event.rotationRate.gamma === null
          ) {
            displayOutcome("motion", "error")("Device has no the required sensors");
          } else {
            displayOutcome("motion", "success")("Device has the required sensors");
          }
        }, { once: true });

        if (window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission) {
          window.DeviceMotionEvent.requestPermission()
            .then((permissionState) => {
              console.log(`Device Motion permission state: ${permissionState}`);
              if (permissionState !== "granted") {
                // If permission prompt is ignored or dismissed,
                // the permission state value is `default`, and permission can be requested again.
                // https://w3c.github.io/deviceorientation/#id=permission-model
                displayOutcome("motion", "error")(`Device Motion permission state: ${permissionState}`);
              } else {
                handleDeviceMotion();
              }
            })
            .catch((error) => {
              displayOutcome("motion", "error")(error);
            });
        } else {
          console.log("Device Motion doesn't require permission request");
          handleDeviceMotion();
        }
      } else {
        displayOutcome("motion", "error")("Device Motion is not supported");
      }
    }
  };

  for (var type in register) {
    document.getElementById(type).addEventListener('click',
      register[type]
    );
  }

});
