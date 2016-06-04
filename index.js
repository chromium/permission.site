
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

  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );
  navigator.requestFullscreen = (
    navigator.requestFullscreen ||
    navigator.webkitRequestFullscreen ||
    navigator.mozRequestFullscreen ||
    navigator.msRequestFullscreen
  );
  navigator.requestMIDIAccess = (
    navigator.requestMIDIAccess ||
    navigator.webkitRequestMIDIAccess ||
    navigator.mozRequestMIDIAccess ||
    navigator.msRequestMIDIAccess
  );
  document.body.requestFullScreen = (
    document.body.requestFullScreen ||
    document.body.webkitRequestFullScreen ||
    document.body.mozRequestFullScreen ||
    document.body.msRequestFullScreen
  );
  document.body.requestPointerLock = (
    document.body.requestPointerLock ||
    document.body.webkitRequestPointerLock ||
    document.body.mozRequestPointerLock ||
    document.body.msRequestPointerLock
  );

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
      navigator.getUserMedia(
        {video: true},
        displayOutcome("camera", "success"),
        displayOutcome("camera", "error")
      );
    },
    "microphone": function() {
      navigator.getUserMedia(
        {audio: true},
        displayOutcome("microphone", "success"),
        displayOutcome("microphone", "error")
      );
    },
    "camera+microphone": function() {
      navigator.getUserMedia(
        {audio: true, video: true},
        displayOutcome("camera+microphone", "success"),
        displayOutcome("camera+microphone", "error")
      );
    },
    "midi": function() {
      navigator.requestMIDIAccess({
        sysex: true
      }).then(
        displayOutcome("midi", "success"),
        displayOutcome("midi", "error")
      );
    },
    "bluetooth": function() {
      navigator.bluetooth.requestDevice({
        filters: [{services: ['battery_service']}]
      }).then(
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
        navigator.requestMediaKeySystemAccess(
          keySystem,
          [
            { distinctiveIdentifier: "required",
              persistentState: "required",
              label: "'distinctiveIdentifier' and 'persistentState' required"
            },
            { distinctiveIdentifier: "required",
              label: "'distinctiveIdentifier' required"
            },
            { persistentState: "required",
              label: "'persistentState' required"
            },
            { label: "empty" }
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
    "fullscreen": function() {
      // Note: As of 2014-12-16, fullscreen only allows "ask" and "allow" in Chrome.
      document.body.requestFullScreen(
        /* no callback */
      );
    },
    "pointerlock": function() {
      document.body.requestPointerLock(
        /* no callback */
      );
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
    }
  };

  for (var type in register) {
    document.getElementById(type).addEventListener('click',
      register[type]
    );
  }

});
