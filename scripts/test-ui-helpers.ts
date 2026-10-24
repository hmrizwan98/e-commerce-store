/**
 * Checkout address mapping + NativeSelect option parsing.
 * Run: npx tsx --test scripts/test-ui-helpers.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import {
  cleanAdministrativeName,
  countryCodeFor,
  hasRoad,
  line1ForConfidence,
  locationConfidence,
  mapNominatimItem,
  pickCity,
} from "../src/lib/location/address-mapping";
import { optionsFromChildren } from "../src/components/ui/NativeSelect";

test("admin suffixes are stripped from city names", () => {
  assert.equal(cleanAdministrativeName("Karachi Division"), "Karachi");
  assert.equal(cleanAdministrativeName("Malir District"), "Malir");
  assert.equal(cleanAdministrativeName("Lahore"), "Lahore");
  assert.equal(cleanAdministrativeName(undefined), "");
});

test("city prefers a real settlement, then a cleaned division (the 'Karachi Division' bug)", () => {
  assert.equal(pickCity({ city: "Karachi", state_district: "Karachi Division" }), "Karachi");
  assert.equal(pickCity({ state_district: "Karachi Division", county: "Malir District" }), "Karachi");
  assert.equal(pickCity({ town: "Murree", county: "Rawalpindi District" }), "Murree");
  assert.equal(pickCity({ village: "Chak 45" }), "Chak 45");
});

const karachiReverse = {
  display_name: "Street 12, Muhammadi Colony, Malir Town, Karachi Division, Sindh, 75080, Pakistan",
  lat: "24.89",
  lon: "67.19",
  address: {
    road: "Street 12",
    neighbourhood: "Muhammadi Colony",
    city_district: "Malir Town",
    state_district: "Karachi Division",
    state: "Sindh",
    postcode: "75080",
    country: "Pakistan",
    country_code: "pk",
  },
};

test("Nominatim result maps to checkout fields", () => {
  const s = mapNominatimItem(karachiReverse);
  assert.equal(s.city, "Karachi");
  assert.equal(s.state, "Sindh");
  assert.equal(s.country, "Pakistan");
  assert.equal(s.postalCode, "75080");
  assert.equal(s.line1, "Street 12, Muhammadi Colony, Malir Town");
  assert.equal(s.area, "Muhammadi Colony");
  assert.equal(s.lat, 24.89);
  assert.equal(hasRoad(karachiReverse), true);
});

test("line1 never repeats the city and has no empty parts", () => {
  const s = mapNominatimItem({ address: { suburb: "Lahore", city: "Lahore", house_number: "12", road: "Mall Road" } });
  assert.equal(s.line1, "12 Mall Road");
});

test("repeated area names are de-duplicated (live Nominatim shape)", () => {
  const s = mapNominatimItem({
    display_name: "Muhammadi Colony, Malir, Sabir Colony, Malir Town, Malir District, Karachi Division, Sindh, 75080, Pakistan",
    address: { neighbourhood: "Muhammadi Colony, Malir", city_district: "Malir District", town: "Malir Town", city: "Karachi Division", state: "Sindh", postcode: "75080", country: "Pakistan" },
  });
  assert.equal(s.city, "Karachi");
  assert.equal(s.line1, "Muhammadi Colony, Malir");
});

test("filled detail is limited by location accuracy (no invented street)", () => {
  const s = mapNominatimItem(karachiReverse);
  assert.equal(locationConfidence(25, s, true), "street");
  assert.equal(locationConfidence(600, s, true), "area");
  assert.equal(locationConfidence(25, s, false), "area");
  assert.equal(locationConfidence(5000, s, true), "city");
  assert.equal(locationConfidence(undefined, s, true), "city");
  assert.equal(line1ForConfidence(s, "street"), "Street 12, Muhammadi Colony, Malir Town");
  assert.equal(line1ForConfidence(s, "area"), "Muhammadi Colony");
  assert.equal(line1ForConfidence(s, "city"), "");
});

test("country codes for suggestion filtering", () => {
  assert.equal(countryCodeFor("Pakistan"), "pk");
  assert.equal(countryCodeFor("United Kingdom"), "gb");
  assert.equal(countryCodeFor("Mars"), undefined);
});

test("NativeSelect reads <option> children incl. arrays, fragments and numbers", () => {
  const h = React.createElement;
  const opts = optionsFromChildren([
    h("option", { key: "a", value: "" }, "Any"),
    h(React.Fragment, { key: "f" }, h("option", { value: 2 }, "Two"), h("option", { value: "3", disabled: true }, "Three ", "(soon)")),
    ["x", "y"].map((v) => h("option", { key: v, value: v }, v.toUpperCase())),
    null,
    false,
  ]);
  assert.deepEqual(opts, [
    { value: "", label: "Any", disabled: undefined },
    { value: "2", label: "Two", disabled: undefined },
    { value: "3", label: "Three (soon)", disabled: true },
    { value: "x", label: "X", disabled: undefined },
    { value: "y", label: "Y", disabled: undefined },
  ]);
});

test("option without value uses its text (native behaviour)", () => {
  const opts = optionsFromChildren(React.createElement("option", null, "Plain"));
  assert.deepEqual(opts, [{ value: "Plain", label: "Plain", disabled: undefined }]);
});
