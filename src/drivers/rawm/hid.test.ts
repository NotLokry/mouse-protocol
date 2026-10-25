import assert from "node:assert/strict";
import test from "node:test";
import { RawmHidClient } from "./hid.ts";

const device = (vendorId: number, productId: number, reportId = 0): HIDDevice => ({
  vendorId, productId, collections: [{
    usagePage: 0xff00,
    usage: 1,
    inputReports: [{ reportId, items: [] }],
    outputReports: [{ reportId, items: [] }],
  }],
} as unknown as HIDDevice);

test("RAWM driver claims every scraped mouse transport on report zero", () => {
  for (let productId = 0x2328; productId <= 0x2339; productId += 1) {
    assert.equal(RawmHidClient.isSupported(device(0x1915, productId)), true);
  }
});

test("RAWM driver leaves Orbital and unrelated Nordic devices alone", () => {
  assert.equal(RawmHidClient.isSupported(device(0x1915, 0x080c)), false);
  assert.equal(RawmHidClient.isSupported(device(0x1915, 0x2328, 1)), false);
  assert.equal(RawmHidClient.isSupported(device(0x1234, 0x2328)), false);
});
