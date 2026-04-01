import { 
  canCreateResume, 
  canImportResume, 
  canUseAITools, 
  getJobFitLimit 
} from "../permissions";

describe("Permissions Logic", () => {
  describe("canCreateResume", () => {
    it("deve permitir criar 1 currículo no plano FREE se tiver 0", () => {
      expect(canCreateResume("free", 0)).toBe(true);
    });

    it("não deve permitir criar mais de 1 currículo no plano FREE", () => {
      expect(canCreateResume("free", 1)).toBe(false);
    });

    it("deve permitir currículos infinitos nos planos PRO e MONTHLY", () => {
      expect(canCreateResume("pro", 999)).toBe(true);
      expect(canCreateResume("monthly", 999)).toBe(true);
    });

    it("não deve permitir currículos se estiver BANNED ou FROZEN", () => {
      expect(canCreateResume("banned", 0)).toBe(false);
      expect(canCreateResume("frozen", 0)).toBe(false);
    });
  });

  describe("canImportResume (PDF)", () => {
    it("não deve permitir importação no plano FREE", () => {
      expect(canImportResume("free")).toBe(false);
    });

    it("deve permitir importação nos planos PRO e MONTHLY", () => {
      expect(canImportResume("pro")).toBe(true);
      expect(canImportResume("monthly")).toBe(true);
    });
  });

  describe("canUseAITools", () => {
    it("não deve permitir ferramentas de IA no plano FREE", () => {
      expect(canUseAITools("free")).toBe(false);
    });

    it("deve permitir ferramentas de IA nos planos PRO e MONTHLY", () => {
      expect(canUseAITools("pro")).toBe(true);
      expect(canUseAITools("monthly")).toBe(true);
    });
  });

  describe("getJobFitLimit", () => {
    it("deve retornar 1 para FREE", () => {
      expect(getJobFitLimit("free")).toBe(1);
    });

    it("deve retornar 5 para PRO", () => {
      expect(getJobFitLimit("pro")).toBe(5);
    });

    it("deve retornar 25 para MONTHLY", () => {
      expect(getJobFitLimit("monthly")).toBe(25);
    });
  });
});
