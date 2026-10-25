import assert from "node:assert/strict";
import test from "node:test";
import { RAWM_DEVICES, buildRawmMouseParams, buildRawmQuery, buildRawmSleepCommand, frameRawmEvent, frameRawmEvents, parseRawmIdentity, parseRawmQueryResult, rawmEventPayload } from "./index.ts";

test("every RAWM HUB catalog transport exposes settings", () => {
  assert.equal([...RAWM_DEVICES.values()].every((device) => device.verified === true), true);
});

test("RAWM query matches the official event shape", () => {
  assert.deepEqual([...buildRawmQuery(0x12345678).slice(0, 9)], [1, 13, 3, 0, 0, 0x78, 0x56, 0x34, 0x12]);
  const framed = frameRawmEvent(buildRawmQuery(1));
  assert.deepEqual(rawmEventPayload(framed), buildRawmQuery(1));
});

test("RAWM identity accepts the compact fields returned by firmware", () => {
  assert.deepEqual(parseRawmIdentity('{"dn":"ES21Pro","battery":83,"chr":1,"cpi":1600,"polling":4000,"ms":1,"wired":0}'), {
    revision: undefined, battery: 83, charging: true, dpi: 1600, pollingRate: 4000,
    dpiLevels: undefined, powerMode: undefined, deviceName: "ES21Pro", productId: undefined,
    lod: undefined, keyDelay: undefined, motionSync: true, angleTuning: undefined,
    angleSnapping: undefined, rippleControl: undefined, sleepTime: undefined,
    wired: false, sensor: undefined, glassMode: undefined, glassModeEnabled: undefined,
    light: undefined, cpiLevelColors: undefined, onboard: undefined,
    txOutputPower: undefined, batteryLevels: undefined, autoTxPower: undefined,
    onboardStatus: undefined, crcSupported: undefined,
  });
});

test("RAWM angle tuning decodes the firmware's signed byte", () => {
  assert.equal(parseRawmIdentity('{"at":231}').angleTuning, -25);
  assert.equal(parseRawmIdentity('{"at":25}').angleTuning, 25);
});

test("RAWM mouse settings preserve the complete vendor parameter record", () => {
  const command = buildRawmMouseParams({
    dpi: 800, pollingRate: 1000, dpiLevels: [400, 800, 1600, 3200],
    cpiLevelColors: [4, 2, 3, 1], keyDelay: [0, 0, 0, 0, 0, 0, 0],
    lod: 1, motionSync: false, angleTuning: 0, angleSnapping: false,
    rippleControl: false,
  });
  assert.equal(command[0]! & 0x0f, 3);
  assert.equal(command[1], command.length);
  assert.deepEqual([...command.slice(2, 9)], [0x15, 0x20, 0x03, 0xe8, 0x03, 0x30, 4]);
  assert.deepEqual([...command.slice(9, 17)], [0x90, 0x01, 0x20, 0x03, 0x40, 0x06, 0x80, 0x0c]);
  assert.equal(command.length > 63, true);
  const frames = frameRawmEvents(command);
  assert.equal(frames.length, 2);
  assert.deepEqual([...rawmEventPayload(frames[0])!, ...rawmEventPayload(frames[1])!], [...command]);
});

test("RAWM sleep uses its dedicated little-endian config command", () => {
  assert.deepEqual([...buildRawmSleepCommand(300)], [3, 5, 0x21, 0x2c, 1]);
});

test("RAWM query result parses the synchronized JSON stream", () => {
  const json = new TextEncoder().encode('{"dn":"MH01","cpi":800}');
  const message = new Uint8Array(4 + 2 + json.length);
  message.set([0xff, 0xff, 0xff, 0xff]);
  const length = json.length + 2;
  message[4] = (length >> 4) & 0xf0 | 2;
  message[5] = length & 0xff;
  message.set(json, 6);
  assert.equal(parseRawmQueryResult(message)?.deviceName, "MH01");
});

test("RAWM query result skips 0xff runs in receiver telemetry", () => {
  const json = new TextEncoder().encode('{"dn":"ES21Pro","cpi":800}');
  const decoy = Uint8Array.from([0x0b, 4, 0x15, 1, 0xff, 0xff, 0xff, 0xff, 0x0b, 4, 0x14, 2]);
  const message = new Uint8Array(decoy.length + 4 + 2 + json.length);
  message.set(decoy);
  message.set([0xff, 0xff, 0xff, 0xff], decoy.length);
  const start = decoy.length + 4;
  const length = json.length + 2;
  message[start] = (length >> 4) & 0xf0 | 2;
  message[start + 1] = length & 0xff;
  message.set(json, start + 2);
  assert.equal(parseRawmQueryResult(message)?.dpi, 800);
});

test("RAWM query result skips an incomplete result-shaped telemetry decoy", () => {
  const json = new TextEncoder().encode('{"dn":"ES21Pro","cpi":1600}');
  const decoy = Uint8Array.from([0xff, 0xff, 0xff, 0xff, 0xf2, 0xff, 0x00]);
  const message = new Uint8Array(decoy.length + 4 + 2 + json.length);
  message.set(decoy);
  message.set([0xff, 0xff, 0xff, 0xff], decoy.length);
  const start = decoy.length + 4;
  const length = json.length + 2;
  message[start] = (length >> 4) & 0xf0 | 2;
  message[start + 1] = length & 0xff;
  message.set(json, start + 2);
  assert.equal(parseRawmQueryResult(message)?.dpi, 1600);
});
