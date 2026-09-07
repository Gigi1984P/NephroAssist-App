import { cn, sanitizeSearch } from "@/lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const active = true;
    expect(cn("base", active && "active")).toBe("base active");
    expect(cn("base", !active && "active")).toBe("base");
  });

  it("handles arrays of classes", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("handles empty/null/undefined inputs", () => {
    expect(cn("foo", null, undefined, "bar")).toBe("foo bar");
  });
});

describe("sanitizeSearch", () => {
  it("returns empty string for falsy input", () => {
    expect(sanitizeSearch("")).toBe("");
    expect(sanitizeSearch(null as any)).toBe("");
    expect(sanitizeSearch(undefined as any)).toBe("");
  });

  it("removes SQL LIKE wildcards", () => {
    expect(sanitizeSearch("te%st_")).toBe("test");
  });

  it("removes backslashes", () => {
    expect(sanitizeSearch("foo\\bar")).toBe("foobar");
  });

  it("removes HTML/XML injection chars", () => {
    expect(sanitizeSearch("<script>alert(1)</script>")).toBe("scriptalert(1)/script");
    expect(sanitizeSearch('"quoted"')).toBe("quoted");
    expect(sanitizeSearch("it's")).toBe("its");
  });

  it("trims whitespace", () => {
    expect(sanitizeSearch("  hello  ")).toBe("hello");
  });

  it("returns safe string unchanged", () => {
    expect(sanitizeSearch("Hello World")).toBe("Hello World");
  });
});
