import { describe, it, expect } from "vitest";
import { 
  isProbablyVueSFC, 
  assertValidVueSFC, 
  assertValidJsBundleSyntax 
} from "../../src/utils/server/extension/validation";

describe("Extension Validation", () => {
  describe("isProbablyVueSFC", () => {
    it("should detect valid Vue SFC with template and script", () => {
      const vueSfc = `
        <template>
          <div>Hello World</div>
        </template>
        <script>
        export default {
          name: 'TestComponent'
        }
        </script>
      `;
      expect(isProbablyVueSFC(vueSfc)).toBe(true);
    });

    it("should detect valid Vue SFC with only template", () => {
      const vueSfc = `<template><div>Hello</div></template>`;
      expect(isProbablyVueSFC(vueSfc)).toBe(true);
    });

    it("should detect valid Vue SFC with style", () => {
      const vueSfc = `
        <template><div>Test</div></template>
        <style scoped>.test { color: red; }</style>
      `;
      expect(isProbablyVueSFC(vueSfc)).toBe(true);
    });

    it("should return false for non-SFC content", () => {
      expect(isProbablyVueSFC("console.log('hello')")).toBe(false);
      expect(isProbablyVueSFC("function test() {}")).toBe(false);
      expect(isProbablyVueSFC("")).toBe(false);
    });

    it("should return false for non-string input", () => {
      expect(isProbablyVueSFC(null as any)).toBe(false);
      expect(isProbablyVueSFC(undefined as any)).toBe(false);
      expect(isProbablyVueSFC(123 as any)).toBe(false);
    });

    it("should return false for incomplete SFC", () => {
      expect(isProbablyVueSFC("<template>")).toBe(false);
      expect(isProbablyVueSFC("<script>")).toBe(false);
    });
  });

  describe("assertValidVueSFC", () => {
    it("should pass for valid SFC with balanced tags", () => {
      const validSfc = `
        <template>
          <div>Hello World</div>
        </template>
        <script>
        export default {
          name: 'TestComponent'
        }
        </script>
      `;
      expect(() => assertValidVueSFC(validSfc)).not.toThrow();
    });

    it("should throw for unbalanced template tags", () => {
      const invalidSfc = `
        <template>
          <div>Hello World</div>
        <script>
        export default {}
        </script>
      `;
      expect(() => assertValidVueSFC(invalidSfc)).toThrow("unbalanced tags");
    });

    it("should throw for SFC with no template or script", () => {
      const invalidSfc = `<style>.test { color: red; }</style>`;
      expect(() => assertValidVueSFC(invalidSfc)).toThrow("must have at least <template> or <script>");
    });

    it("should throw for invalid export default syntax", () => {
      const invalidSfc = `
        <template><div>Test</div></template>
        <script>
        export default
        </script>
      `;
      expect(() => assertValidVueSFC(invalidSfc)).toThrow("proper export default syntax");
    });

    it("should pass for script with proper export default", () => {
      const validSfc = `
        <template><div>Test</div></template>
        <script>
        export default {
          name: 'TestComponent'
        }
        </script>
      `;
      expect(() => assertValidVueSFC(validSfc)).not.toThrow();
    });
  });

  describe("assertValidJsBundleSyntax", () => {
    it("should pass for valid JS bundle with export", () => {
      const validBundle = `
        function Component() {
          return 'Hello World';
        }
        export default Component;
      `;
      expect(() => assertValidJsBundleSyntax(validBundle)).not.toThrow();
    });

    it("should pass for valid JS bundle with module.exports", () => {
      const validBundle = `
        function Component() {
          return 'Hello World';
        }
        module.exports = Component;
      `;
      expect(() => assertValidJsBundleSyntax(validBundle)).not.toThrow();
    });

    it("should pass for valid JS bundle with window", () => {
      const validBundle = `
        function Component() {
          return 'Hello World';
        }
        window.Component = Component;
      `;
      expect(() => assertValidJsBundleSyntax(validBundle)).not.toThrow();
    });

    it("should throw for unbalanced brackets", () => {
      const invalidBundle = `function test() { console.log("test"); `;
      expect(() => assertValidJsBundleSyntax(invalidBundle)).toThrow("unbalanced brackets");
    });

    it("should throw for bundle without export", () => {
      const invalidBundle = `function test() { console.log("test"); }`;
      expect(() => assertValidJsBundleSyntax(invalidBundle)).toThrow("must have export statement");
    });

    it("should throw for incomplete function declaration", () => {
      const invalidBundle = `
        function() {
        export default something;
      `;
      expect(() => assertValidJsBundleSyntax(invalidBundle)).toThrow("unbalanced brackets");
    });

    it("should handle complex nested brackets", () => {
      const validBundle = `
        export default {
          data() {
            return {
              items: [1, 2, 3],
              config: { nested: { deep: true } }
            };
          },
          methods: {
            test(param) {
              return param;
            }
          }
        };
      `;
      expect(() => assertValidJsBundleSyntax(validBundle)).not.toThrow();
    });
  });
});