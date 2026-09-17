window.addEventListener("DOMContentLoaded", () => {
  const videoPreview = document.getElementById("video-feed");
  const logOutput = document.getElementById("log-output");
  let currentStream = null;

  // Web Audio variables for mic level visualization
  let audioCtx = null;
  let analyser = null;
  let source = null;
  let animationId = null;

  function log(message, type = "info") {
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;
    logOutput.appendChild(entry);
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function stopAudioVisualization() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (source) {
      source.disconnect();
      source = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    const volumeContainer = document.getElementById("volume-meter-container");
    if (volumeContainer) {
      volumeContainer.style.display = "none";
    }
  }

  function visualizeAudio(stream) {
    if (!stream || stream.getAudioTracks().length === 0) {
      return;
    }

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const volumeMeter = document.getElementById("volume-meter-bar");
      const volumeContainer = document.getElementById("volume-meter-container");
      if (volumeContainer) {
        volumeContainer.style.display = "block";
      }

      function draw() {
        if (!audioCtx) return;
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          total += dataArray[i];
        }
        const average = total / bufferLength;

        if (volumeMeter) {
          volumeMeter.style.width = Math.min(100, (average / 128) * 100) + "%";
        }
      }

      draw();
    } catch (e) {
      console.error("Web Audio API error: ", e);
      log(
        `Failed to initialize Web Audio level visualization: ${e.message}`,
        "error",
      );
    }
  }

  function clearCurrentStream() {
    stopAudioVisualization();
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        track.stop();
      });
      videoPreview.srcObject = null;
      currentStream = null;
      log("Previous stream tracks stopped and cleared.", "info");
    }
  }

  // --- Legacy Setup (behaving like PEPC) ---
  function setupLegacyElement(el, testName, constraints) {
    if (!el) return;

    const handlePermissionChange = (event) => {
      log(
        `[Legacy Event:${event.type}] ${testName} permissionStatus: ${el.permissionStatus}`,
        "info",
      );
      if (el.permissionStatus === "granted") {
        log(
          `${testName} Permission granted. Requesting getUserMedia...`,
          "info",
        );
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then((stream) => {
            clearCurrentStream();
            currentStream = stream;
            videoPreview.srcObject = currentStream;
            const vTracks = currentStream.getVideoTracks().length;
            const aTracks = currentStream.getAudioTracks().length;
            log(
              `${testName} Success! Stream acquired (Video tracks: ${vTracks}, Audio tracks: ${aTracks})`,
              "success",
            );
            // Start audio level visualizer if microphone is active
            visualizeAudio(currentStream);
          })
          .catch((err) => {
            log(
              `${testName} getUserMedia Failed: ${err.name} - ${err.message}`,
              "error",
            );
          });
      }
    };

    el.addEventListener("promptaction", handlePermissionChange);
    el.addEventListener("promptdismiss", handlePermissionChange);
  }

  // --- Media Capture Setup (onstream, onerror, oncancel) ---
  function setupMediaCaptureElement(el, testName, constraints) {
    if (!el) return;

    if (constraints && typeof el.setConstraints === "function") {
      el.setConstraints(constraints);
      log(
        `Constraints set for ${testName}: ${JSON.stringify(constraints)}`,
        "info",
      );
    }

    const handleSuccess = (sourceName) => {
      // Prevent duplicate preview binding if both properties and listeners fire
      if (currentStream !== el.stream) {
        clearCurrentStream();
        currentStream = el.stream;
        videoPreview.srcObject = currentStream;
        // Start audio level visualizer if microphone is active
        visualizeAudio(currentStream);
      }
      const vTracks = currentStream ? currentStream.getVideoTracks().length : 0;
      const aTracks = currentStream ? currentStream.getAudioTracks().length : 0;
      log(
        `[${sourceName}] ${testName} Success! Stream acquired (Video tracks: ${vTracks}, Audio tracks: ${aTracks})`,
        "success",
      );
    };

    const handleFailure = (sourceName) => {
      log(
        `[${sourceName}] ${testName} Failed: ${el.error?.name || "Unknown Error"}`,
        "error",
      );
    };

    const handleCancel = (sourceName) => {
      log(
        `[${sourceName}] ${testName} Cancelled: Permission prompt dismissed/cancelled.`,
        "info",
      );
    };

    // Register via properties (onstream, onerror, oncancel)
    el.onstream = () => handleSuccess("Property:onstream");
    el.onerror = () => handleFailure("Property:onerror");
    el.oncancel = () => handleCancel("Property:oncancel");

    // Register via event listeners
    el.addEventListener("stream", () => handleSuccess("Listener:stream"));
    el.addEventListener("error", () => handleFailure("Listener:error"));
    el.addEventListener("cancel", () => handleCancel("Listener:cancel"));
  }

  const OT_TOKEN =
    "As0h1KZNvjE/ahZ5XIjLEylA1lNDTQ+VFANatlPIrPi5fntBf9nZPUBNeIbHvOupoy1hXWZYE4q4rniDLGWSuAoAAABseyJvcmlnaW4iOiJodHRwczovL3Blcm1pc3Npb24uc2l0ZTo0NDMiLCJmZWF0dXJlIjoiVXNlck1lZGlhRWxlbWVudCIsImV4cGlyeSI6MTc5MDAzNTIwMCwiaXNTdWJkb21haW4iOnRydWV9";
  const toggleOtBtn = document.getElementById("toggle-ot-btn");
  const modeIndicator = document.getElementById("mode-indicator");

  function updateModeUI() {
    const meta = document.querySelector('meta[http-equiv="origin-trial"]');
    const hasToken = meta && meta.getAttribute("content") === OT_TOKEN;

    if (hasToken) {
      modeIndicator.textContent = "LEGACY (ORIGIN TRIAL ACTIVE)";
      toggleOtBtn.textContent = "Disable Legacy Mode (OT)";
    } else {
      modeIndicator.textContent = "STANDARD";
      toggleOtBtn.textContent = "Enable Legacy Mode (OT)";
    }
  }

  function toggleOriginTrial() {
    const isLegacy = sessionStorage.getItem("legacyModeActive") === "true";
    if (isLegacy) {
      sessionStorage.setItem("legacyModeActive", "false");
    } else {
      sessionStorage.setItem("legacyModeActive", "true");
    }
    // Reload is required for Chrome to re-evaluate the Origin Trial state and register the custom HTML elements.
    window.location.reload();
  }

  if (toggleOtBtn) {
    toggleOtBtn.addEventListener("click", toggleOriginTrial);
  }

  // Initialize on load based on stored session state
  updateModeUI();

  logOutput.innerHTML = "";
  log("System ready. Click elements above to test.", "info");

  // Setup Media Capture elements
  setupMediaCaptureElement(
    document.getElementById("um-both"),
    "Usermedia (Camera & Mic)",
    { audio: {}, video: {} },
  );
  setupMediaCaptureElement(
    document.getElementById("cam-element"),
    "Camera Only",
  );
  setupMediaCaptureElement(
    document.getElementById("mic-element"),
    "Microphone Only",
  );

  // Setup Media Capture elements in Icon-Only Mode
  setupMediaCaptureElement(
    document.getElementById("um-both-icon-only"),
    "Usermedia Icon-Only (Camera & Mic)",
    { audio: {}, video: {} },
  );
  setupMediaCaptureElement(
    document.getElementById("cam-icon-only"),
    "Camera Icon-Only",
  );
  setupMediaCaptureElement(
    document.getElementById("mic-icon-only"),
    "Microphone Icon-Only",
  );

  // Setup Legacy elements
  setupLegacyElement(
    document.getElementById("um-legacy-audio"),
    "Legacy Usermedia (Microphone)",
    { audio: {}, video: false },
  );
  setupLegacyElement(
    document.getElementById("um-legacy-video"),
    "Legacy Usermedia (Camera)",
    { audio: false, video: {} },
  );
  setupLegacyElement(
    document.getElementById("um-legacy-both"),
    "Legacy Usermedia (Camera & Mic)",
    { audio: {}, video: {} },
  );
});
