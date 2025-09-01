import { describe, it, expect } from "vitest";
import { autoAssignExtensionName, isValidExtensionId } from "../../src/utils/server/extension/naming";

describe("Extension Naming", () => {
  describe("autoAssignExtensionName", () => {
    it("should assign new extension ID when none exists", () => {
      const body = {};
      const result = autoAssignExtensionName(body);
      
      expect(result.extensionId).toBeDefined();
      expect(result.extensionId).toMatch(/^extension_[0-9a-f-]{36}$/i);
    });

    it("should assign new extension ID when existing ID is invalid", () => {
      const body = { extensionId: "invalid-id" };
      const result = autoAssignExtensionName(body);
      
      expect(result.extensionId).toBeDefined();
      expect(result.extensionId).toMatch(/^extension_[0-9a-f-]{36}$/i);
      expect(result.extensionId).not.toBe("invalid-id");
    });

    it("should keep valid existing extension ID", () => {
      const validId = "extension_123e4567-e89b-12d3-a456-426614174000";
      const body = { extensionId: validId };
      const result = autoAssignExtensionName(body);
      
      expect(result.extensionId).toBe(validId);
    });

    it("should preserve other body properties", () => {
      const body = { name: "test", code: "console.log('test')" };
      const result = autoAssignExtensionName(body);
      
      expect(result.name).toBe("test");
      expect(result.code).toBe("console.log('test')");
      expect(result.extensionId).toBeDefined();
    });
  });

  describe("isValidExtensionId", () => {
    it("should return true for valid extension ID", () => {
      const validId = "extension_123e4567-e89b-12d3-a456-426614174000";
      expect(isValidExtensionId(validId)).toBe(true);
    });

    it("should return false for invalid extension ID", () => {
      expect(isValidExtensionId("invalid-id")).toBe(false);
      expect(isValidExtensionId("extension_invalid")).toBe(false);
      expect(isValidExtensionId("")).toBe(false);
    });

    it("should return false for non-string input", () => {
      expect(isValidExtensionId(null as any)).toBe(false);
      expect(isValidExtensionId(undefined as any)).toBe(false);
      expect(isValidExtensionId(123 as any)).toBe(false);
    });
  });
});