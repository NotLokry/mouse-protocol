# RAWM protocol testing

## ES21 Pro wired

Hardware verified on macOS through Chrome WebHID on 2026-09-16.

- USB identity: `1915:2334`, product `ES21Pro`, manufacturer `Rawmtech`
- Control collection: usage page `0xFF00`, usage `0x0001`
- Reports: input `0`, output `0`, 64 bytes; no feature reports
- Status query: official RAWM event query on report `0`
- Device response: `ES21Pro`, firmware `G-1.3.1`, PAW3950 sensor

## ES21 Pro wireless

- Receiver identity: `1915:232b`, product `RAWM HS Receiver`
- Status reads verified over the receiver transport on hardware
- Observed status: four DPI stages (400/800/1600/3200), 800 DPI active,
  1000 Hz, 60-second sleep, low LOD, zero debounce, and readable battery and
  charging state
- Motion sync, angle snapping, ripple control, power mode, and angle tuning
  all decoded successfully

The full RAWM HUB catalog exposes settings using the shared protocol. Every
write starts from the device's complete reported configuration, preserves the
unmodified fields, and requires read-back confirmation. Only the ES21 Pro
wired and `0x232b` receiver paths have been exercised on physical hardware.
