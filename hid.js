function hex16(value) {
  return `0x${value.toString(16).toUpperCase().padStart(4, "0")}`;
}

function setStatus(text) {
  const statusEl = document.getElementById("hid-status");
  if (statusEl) {
    statusEl.textContent = text;
  }
}

function setButtonOutcome(outcome) {
  const button = document.getElementById("connect-hid");
  if (!button) {
    return;
  }
  button.classList.remove("success", "error", "default");
  if (outcome) {
    button.classList.add(outcome);
  }
}

function createMessageListItem(text) {
  const li = document.createElement("li");
  li.className = "hid-device-item";
  li.textContent = text;
  return li;
}

function createDeviceListItem(device) {
  const li = document.createElement("li");
  li.className = "hid-device-item";

  const info = document.createElement("div");
  const name = document.createElement("div");
  name.textContent = device.productName || "Unnamed HID Device";

  const meta = document.createElement("div");
  meta.className = "hid-device-meta";
  meta.textContent = `${hex16(device.vendorId)}:${hex16(device.productId)}`;

  info.appendChild(name);
  info.appendChild(meta);

  const state = document.createElement("span");
  state.className = `hid-device-state${device.opened ? " open" : ""}`;
  state.textContent = device.opened ? "Opened" : "Permitted";

  li.appendChild(info);
  li.appendChild(state);
  return li;
}

async function renderDevices() {
  const list = document.getElementById("device-list");
  if (!("hid" in navigator)) {
    list.replaceChildren(
      createMessageListItem("WebHID is not available in this browser context."),
    );
    return;
  }

  try {
    const devices = await navigator.hid.getDevices();
    if (devices.length === 0) {
      list.replaceChildren(createMessageListItem("No devices connected."));
      return;
    }

    const items = [];
    for (const device of devices) {
      if (!device.opened) {
        try {
          await device.open();
          setStatus(
            `Opened ${device.productName || "HID Device"} (${hex16(device.vendorId)}:${hex16(device.productId)})`,
          );
        } catch (err) {
          setStatus(`${err.name}: ${err.message}`);
        }
      }
      items.push(createDeviceListItem(device));
    }
    list.replaceChildren(...items);
  } catch (err) {
    setStatus(`${err.name}: ${err.message}`);
  }
}

async function connectDevice() {
  if (!("hid" in navigator)) {
    setStatus("navigator.hid is not available.");
    setButtonOutcome("error");
    return;
  }

  try {
    const selected = await navigator.hid.requestDevice({ filters: [] });
    if (!selected || selected.length === 0) {
      setStatus("No device selected.");
      setButtonOutcome("error");
      await renderDevices();
      return;
    }

    for (const device of selected) {
      if (!device.opened) {
        await device.open();
      }
      setStatus(
        `Opened ${device.productName || "HID Device"} (${hex16(device.vendorId)}:${hex16(device.productId)})`,
      );
    }
    setButtonOutcome("success");
  } catch (err) {
    setStatus(`${err.name}: ${err.message}`);
    setButtonOutcome("error");
  }

  await renderDevices();
}

window.addEventListener("load", () => {
  const connectButton = document.getElementById("connect-hid");
  if (connectButton) {
    connectButton.addEventListener("click", connectDevice);
  }

  if (!("hid" in navigator)) {
    setStatus("navigator.hid is not available.");
    renderDevices();
    return;
  }

  navigator.hid.addEventListener("connect", renderDevices);
  navigator.hid.addEventListener("disconnect", renderDevices);
  renderDevices();
});
