import { describe, it, expect, vi } from "vitest";
import { processExtensionDefinition, isExtensionDefinitionPath } from "../../src/utils/server/extension/processor";

// Mock the compiler module
vi.mock("../../src/utils/server/extension/compiler", () => ({
  buildExtensionWithVite: vi.fn().mockResolvedValue("compiled-vue-code"),
}));

describe("Extension Processor", () => {
  describe("isExtensionDefinitionPath", () => {
    it("should return true for extension_definition paths", () => {
      expect(isExtensionDefinitionPath("/api/extension_definition")).toBe(true);
      expect(isExtensionDefinitionPath("/api/extension_definition/123")).toBe(true);
      expect(isExtensionDefinitionPath("/extension_definition")).toBe(true);
    });

    it("should return false for non-extension_definition paths", () => {
      expect(isExtensionDefinitionPath("/api/users")).toBe(false);
      expect(isExtensionDefinitionPath("/api/posts")).toBe(false);
      expect(isExtensionDefinitionPath("/extension")).toBe(false);
    });
  });

  describe("processExtensionDefinition", () => {
    it("should return body unchanged for non-POST/PATCH methods", async () => {
      const body = { code: "test code" };
      const result = await processExtensionDefinition(body, "GET");
      
      expect(result.processedBody).toBe(body);
      expect(result.compiledCode).toBeUndefined();
    });

    it("should return body unchanged when no code field", async () => {
      const body = { name: "test" };
      const result = await processExtensionDefinition(body, "POST");
      
      expect(result.processedBody).toBe(body);
      expect(result.compiledCode).toBeUndefined();
    });

    it("should process Vue SFC and return compiled code", async () => {
      const vueSfcBody = {
        code: `
          <template>
            <div>Hello World</div>
          </template>
          <script>
          export default {
            name: 'TestComponent'
          }
          </script>
        `
      };

      const result = await processExtensionDefinition(vueSfcBody, "POST");
      
      expect(result.processedBody.extensionId).toMatch(/^extension_[0-9a-f-]{36}$/i);
      expect(result.processedBody.compiledCode).toBe("compiled-vue-code");
      expect(result.compiledCode).toBe("compiled-vue-code");
    });

    it("should process JS bundle and validate syntax", async () => {
      const jsBundleBody = {
        code: `
          function Component() {
            return 'Hello World';
          }
          export default Component;
        `
      };

      const result = await processExtensionDefinition(jsBundleBody, "PATCH");
      
      expect(result.processedBody.extensionId).toMatch(/^extension_[0-9a-f-]{36}$/i);
      expect(result.processedBody.compiledCode).toBeUndefined();
      expect(result.compiledCode).toBeUndefined();
    });

    it("should throw error for invalid Vue SFC", async () => {
      const invalidSfcBody = {
        code: `
          <template>
            <div>Hello World</div>
          <script>
          export default {}
          </script>
        `
      };

      await expect(
        processExtensionDefinition(invalidSfcBody, "POST")
      ).rejects.toThrow("unbalanced tags");
    });

    it("should throw error for invalid JS bundle", async () => {
      const invalidJsBody = {
        code: `function test() { console.log("test"); }`
      };

      await expect(
        processExtensionDefinition(invalidJsBody, "POST")
      ).rejects.toThrow("must have export statement");
    });

    it("should preserve existing extension ID if valid", async () => {
      const validExtensionId = "extension_123e4567-e89b-12d3-a456-426614174000";
      const body = {
        extensionId: validExtensionId,
        code: `
          function Component() {
            return 'Hello World';
          }
          export default Component;
        `
      };

      const result = await processExtensionDefinition(body, "POST");
      
      expect(result.processedBody.extensionId).toBe(validExtensionId);
    });

    it("should handle compilation errors gracefully", async () => {
      // Mock compilation failure
      const { buildExtensionWithVite } = await import("../../src/utils/server/extension/compiler");
      vi.mocked(buildExtensionWithVite).mockRejectedValueOnce(
        new Error("Compilation failed")
      );

      const vueSfcBody = {
        code: `
          <template>
            <div>Hello World</div>
          </template>
          <script>
          export default {
            name: 'TestComponent'
          }
          </script>
        `
      };

      await expect(
        processExtensionDefinition(vueSfcBody, "POST")
      ).rejects.toThrow(/Failed to build Vue SFC/);
    });
  });
});