import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { get, has, remove, set } from "./obj.ts";

describe("obj utils", () => {
  describe("set", () => {
    it("sets a top-level key", () => {
      const obj: Record<string, unknown> = {};
      set(obj, ["a"], 1);
      assert.deepEqual(obj, { a: 1 });
    });

    it("sets a nested key in existing structure", () => {
      const obj = { a: { b: { c: 1 } } };
      set(obj, ["a", "b", "c"], 42);
      assert.deepEqual(obj, { a: { b: { c: 42 } } });
    });

    it("creates intermediate objects for missing path segments", () => {
      const obj: Record<string, unknown> = {};
      set(obj, ["a", "b", "c"], "v");
      assert.deepEqual(obj, { a: { b: { c: "v" } } });
    });

    it("overwrites an existing leaf value", () => {
      const obj = { a: "old" };
      set(obj, ["a"], "new");
      assert.deepEqual(obj, { a: "new" });
    });

    it("preserves sibling keys when adding a nested value", () => {
      const obj = { a: { b: 1 } };
      set(obj, ["a", "c"], 2);
      assert.deepEqual(obj, { a: { b: 1, c: 2 } });
    });

    it("throws when the root is null", () => {
      assert.throws(() => set(null, ["a"], 1), /plain object/);
    });

    it("throws when the root is an array", () => {
      assert.throws(() => set([], ["a"], 1), /plain object/);
    });

    it("throws when the root is a primitive", () => {
      assert.throws(() => set("str", ["a"], 1), /plain object/);
    });

    it("throws when an intermediate value is a string", () => {
      const obj = { a: "leaf" };
      assert.throws(() => set(obj, ["a", "b"], 1), /'a\.b'/);
    });

    it("throws when an intermediate value is an array", () => {
      const obj = { a: [1, 2] };
      assert.throws(() => set(obj, ["a", "b"], 1), /'a\.b'/);
    });

    it("throws when an intermediate value is null", () => {
      const obj = { a: null };
      assert.throws(() => set(obj, ["a", "b"], 1), /'a\.b'/);
    });
  });

  describe("get", () => {
    it("gets a top-level key", () => {
      assert.equal(get({ a: 1 }, ["a"]), 1);
    });

    it("gets a nested key", () => {
      assert.equal(get({ a: { b: { c: "v" } } }, ["a", "b", "c"]), "v");
    });

    it("returns undefined for a missing top-level key", () => {
      assert.equal(get({ a: 1 }, ["b"]), undefined);
    });

    it("returns undefined when descending past a primitive", () => {
      assert.equal(get({ a: 1 }, ["a", "b"]), undefined);
    });

    it("returns undefined when descending past null", () => {
      assert.equal(get({ a: null }, ["a", "b"]), undefined);
    });

    it("returns the value when it is explicitly undefined", () => {
      assert.equal(get({ a: undefined }, ["a"]), undefined);
    });
  });

  describe("has", () => {
    it("returns true for an existing top-level key", () => {
      assert.equal(has({ a: 1 }, ["a"]), true);
    });

    it("returns true for an existing nested key", () => {
      assert.equal(has({ a: { b: { c: 1 } } }, ["a", "b", "c"]), true);
    });

    it("returns true for an own key whose value is undefined", () => {
      assert.equal(has({ a: undefined }, ["a"]), true);
    });

    it("returns false for a missing key", () => {
      assert.equal(has({ a: 1 }, ["b"]), false);
    });

    it("returns false when descending past a primitive", () => {
      assert.equal(has({ a: 1 }, ["a", "b"]), false);
    });

    it("returns false for inherited properties", () => {
      assert.equal(has({}, ["toString"]), false);
    });
  });

  describe("remove", () => {
    it("removes a top-level key", () => {
      const obj = { a: 1, b: 2 };
      remove(obj, ["a"]);
      assert.deepEqual(obj, { b: 2 });
    });

    it("removes a nested key without pruning a non-empty parent", () => {
      const obj = { a: { b: 1, c: 2 } };
      remove(obj, ["a", "b"]);
      assert.deepEqual(obj, { a: { c: 2 } });
    });

    it("prunes a parent that becomes empty", () => {
      const obj = { a: { b: 1 }, c: 2 };
      remove(obj, ["a", "b"]);
      assert.deepEqual(obj, { c: 2 });
    });

    it("prunes multiple levels of empty parents", () => {
      const obj = { a: { b: { c: { d: 1 } } } };
      remove(obj, ["a", "b", "c", "d"]);
      assert.deepEqual(obj, {});
    });

    it("stops pruning at the first non-empty ancestor", () => {
      const obj = { a: { b: { c: 1 }, d: 2 } };
      remove(obj, ["a", "b", "c"]);
      assert.deepEqual(obj, { a: { d: 2 } });
    });

    it("throws when the root is null", () => {
      assert.throws(() => remove(null, ["a"]), /plain object/);
    });

    it("throws when the root is an array", () => {
      assert.throws(() => remove([], ["a"]), /plain object/);
    });

    it("throws when the path does not exist", () => {
      assert.throws(() => remove({ a: 1 }, ["b"]), /'b'/);
    });

    it("throws when an intermediate path segment is missing", () => {
      assert.throws(
        () => remove({ a: { b: 1 } }, ["a", "x", "y"]),
        /'a\.x\.y'/,
      );
    });

    it("does not treat inherited properties as removable", () => {
      assert.throws(() => remove({}, ["toString"]), /'toString'/);
    });
  });
});
