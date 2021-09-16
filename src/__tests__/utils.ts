import { abbreviateNumber } from "../utils/format";

describe("Utils", () => {
  describe("abbreviateNumber", () => {
    it("should return an empty string", () => {
      const result = abbreviateNumber("abc" as any);
      expect(result).toBe("");
    });

    it("should return 0", () => {
      const result = abbreviateNumber(0);
      expect(result).toBe("0");
    });

    it("should return 1.00K", () => {
      const result = abbreviateNumber(Math.pow(10, 3));
      expect(result).toBe("1.00K");
    });

    it("should return 1.00M", () => {
      const result = abbreviateNumber(Math.pow(10, 6));
      expect(result).toBe("1.00M");
    });

    it("should return 1.00B", () => {
      const result = abbreviateNumber(Math.pow(10, 9));
      expect(result).toBe("1.00B");
    });

    it("should return 1.00T", () => {
      const result = abbreviateNumber(Math.pow(10, 12));
      expect(result).toBe("1.00T");
    });
  });
});
