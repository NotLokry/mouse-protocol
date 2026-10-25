# Razer DeathAdder V3 Pro (`1532:00b7` receiver, `1532:00b6` wired) hardware session, 2026-09-15

Stock HyperSpeed receiver, firmware "Mouse 2.1", Windows 11. Driven from Node
over hidapi (node-hid) with an unmodified `RazerHidClient` from this package,
Razer Synapse and its services fully quit. The control interface was `MI_00`,
the collection whose only usage is Generic Desktop Mouse.

- `write-results-2026-09-15.json`: 13 write/read-back steps (DPI, polling,
  auto sleep, low power) with the value the setter returned and the value a
  fresh connection read back, plus the off-list 2000 Hz refusal. The mouse
  was restored to its original state at the end.
- `write-roundtrip-2026-09-15.hex`: all 486 feature reports of that session,
  in order. Serial payload redacted.

- `wired-write-results-2026-09-15.json` and `wired-write-roundtrip-2026-09-15.hex`:
  the same 13 steps and 486 reports over the cable (`1532:00b6`), 13/13.

Also done in the same session but not captured as reports:

- 3-minute soak: 31/31 `readStatus()` reads, 822 to 914 ms each, no failures.
- Polling measured with a `pointerrawupdate` counter (1 s window, peak):
  842 Hz at 1000 Hz, 124 Hz after writing 125 Hz on the legacy command.
- Auto sleep 60 s and low power 5 % re-read as written after switching the
  mouse off and on at its power switch.

- Wired polling measured 126 Hz peak at 125; wired soak 31/31 at 824 to 887 ms;
  battery read "Charging" and climbed 25 % to 32 % across the wired runs.

See `docs/razer-testing.md`, "DeathAdder V3 Pro", for what this settled. The docs section references this folder.
