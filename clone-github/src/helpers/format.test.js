import {
  formatNumber,
  formatNumberWithComma,
  formatString,
  formatUrl,
} from "./format.js";

describe("formatNumber function", () => {
  test("not should formatNumber formater numbers of 1 digits", () => {
    const k = formatNumber(1);
    expect(k).toBe("1");
    expect(k).not.toBe(1);
    expect(k).not.toBe("1.");
    expect(k).not.toBe("1.0k");
  });

  test("not should formatNumber formater numbers of 2 digits", () => {
    const k = formatNumber(10);
    const k2 = formatNumber(13);

    expect(k).toBe("10");
    expect(k).not.toBe(10);
    expect(k).not.toBe("10.");
    expect(k).not.toBe("10.0k");

    expect(k2).toBe("13");
    expect(k2).not.toBe(13);
    expect(k2).not.toBe("13.");
    expect(k2).not.toBe("13k");
  });

  test("not should formatNumber formater numbers of 3 digits", () => {
    const k = formatNumber(100);
    const k2 = formatNumber(135);

    expect(k).toBe("100");
    expect(k).not.toBe(100);
    expect(k).not.toBe("100.");
    expect(k).not.toBe("1.0k");

    expect(k2).toBe("135");
    expect(k2).not.toBe(135);
    expect(k2).not.toBe("135.");
    expect(k2).not.toBe("135k");
  });
  test("should formatNumber formater numbers of 4 digits", () => {
    const k = formatNumber(1000);
    const k2 = formatNumber(1350);

    expect(k).toBe("1k");
    expect(k).not.toBe(1000);
    expect(k).not.toBe("1000");
    expect(k).not.toBe("1.0k");

    expect(k2).toBe("1.3k");
    expect(k2).not.toBe(1350);
    expect(k2).not.toBe("1350");
    expect(k2).not.toBe("1.35k");
  });

  test("should formatNumber formater numbers of 5 digits", () => {
    const k = formatNumber(10000);
    const k2 = formatNumber(13500);

    expect(k).toBe("10k");
    expect(k).not.toBe(10000);
    expect(k).not.toBe("10000");
    expect(k).not.toBe("10.0k");

    expect(k2).toBe("13.5k");
    expect(k2).not.toBe(13500);
    expect(k2).not.toBe("13500");
    expect(k2).not.toBe("13.50k");
  });
  test("should formatNumber formater numbers of 6 digits", () => {
    const k = formatNumber(100000);
    const k2 = formatNumber(135000);

    expect(k).toBe("100k");
    expect(k).not.toBe(100000);
    expect(k).not.toBe("100000");
    expect(k).not.toBe("100.0k");

    expect(k2).toBe("135k");
    expect(k2).not.toBe(135000);
    expect(k2).not.toBe("135000");
    expect(k2).not.toBe("135000k");
  });
  test("should formatNumber formater numbers of 7 digits", () => {
    const m = formatNumber(1000000);
    const m2 = formatNumber(1350000);

    expect(m).toBe("1m");
    expect(m).not.toBe(1000000);
    expect(m).not.toBe("1000000");
    expect(m).not.toBe("1.0m");

    expect(m2).toBe("1.3m");
    expect(m2).not.toBe(1350000);
    expect(m2).not.toBe("1350000");
    expect(m2).not.toBe("1.35m");
  });
  test("should formatNumber formater numbers of 8 digits", () => {
    const m = formatNumber(10000000);
    const m2 = formatNumber(13500000);

    expect(m).toBe("10m");
    expect(m).not.toBe(10000000);
    expect(m).not.toBe("10000000");
    expect(m).not.toBe("100.0m");

    expect(m2).toBe("13.5m");
    expect(m2).not.toBe(13500000);
    expect(m2).not.toBe("13500000");
    expect(m2).not.toBe("13.50m");
  });

  test("should formatNumber formater numbers of 9 digits", () => {
    const m = formatNumber(100000000);
    const m2 = formatNumber(135000000);

    expect(m).toBe("100m");
    expect(m).not.toBe(100000000);
    expect(m).not.toBe("100000000");
    expect(m).not.toBe("100.0m");

    expect(m2).toBe("135m");
    expect(m2).not.toBe(135000000);
    expect(m2).not.toBe("135000000");
    expect(m2).not.toBe("1.3500m");
  });
});

describe("formatNumberWithComma", () => {
  test("should numbers < 3 digits not format with comma", () => {
    const n1 = formatNumberWithComma(1);
    const n2 = formatNumberWithComma(10);
    const n3 = formatNumberWithComma(100);
    const n4 = formatNumberWithComma(1000);

    expect(n1).toBe("1");
    expect(n2).toBe("10");
    expect(n3).toBe("100");
    expect(n4).toBe("1,000");

    expect(n1).not.toBe(1);
    expect(n2).not.toBe(10);
    expect(n3).not.toBe(100);
    expect(n4).not.toBe(1000);
  });

  test("should numbers 4 digits  format with comma 1,000", () => {
    const n1 = formatNumberWithComma(1000);
    expect(n1).toBe("1,000");
    expect(n1).not.toBe(1000);
  });

  test("should numbers 5 digits  format with comma 10,000", () => {
    const n1 = formatNumberWithComma(10000);
    expect(n1).toBe("10,000");
    expect(n1).not.toBe(10000);
  });
  test("should numbers 6 digits  format with comma 100,000", () => {
    const n1 = formatNumberWithComma(100000);
    expect(n1).toBe("100,000");
    expect(n1).not.toBe(100000);
  });
  test("should numbers 7 digits  format with comma 1,000,000", () => {
    const n1 = formatNumberWithComma(1000000);
    expect(n1).toBe("1,000,000");
    expect(n1).not.toBe(1000000);
  });
  test("should numbers 8 digits  format with comma 10,000,000", () => {
    const n1 = formatNumberWithComma(10000000);
    expect(n1).toBe("10,000,000");
    expect(n1).not.toBe(10000000);
  });
  test("should numbers 9 digits  format with comma 100,000,000", () => {
    const n1 = formatNumberWithComma(100000000);
    expect(n1).toBe("100,000,000");
    expect(n1).not.toBe(100000000);
  });
  test("should numbers 10 digits  format with comma 1,000,000,000", () => {
    const n1 = formatNumberWithComma(1000000000);
    expect(n1).toBe("1,000,000,000");
    expect(n1).not.toBe(1000000000);
  });
});

describe('should remove "https://api.github.com/repos', () => {
  const url = formatUrl(
    "https://api.github.com/repos/s-KaiNet/spfx-fast-serve"
  );
  expect(url).toBe("//s-KaiNet/spfx-fast-serve");
  expect(url).not.toBe("//:");
  expect(url).not.toBe("https//:");
  expect(url).not.toHaveLength(0);
});

describe("should remove : of text", () => {
  const url = formatString(
    "Node.js JavaScript runtime :sparkles::turtle::rocket::sparkles:"
  );
  expect(url).toBe(
    "Node.js JavaScript runtime  sparkles  turtle  rocket  sparkles "
  );
  expect(url).not.toBe("::");
  expect(url).not.toBe("Node.js JavaScript runtime :sparkles:");
  expect(url).not.toHaveLength(0);
});
