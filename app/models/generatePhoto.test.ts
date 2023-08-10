import { describe, test, expect } from "vitest";

import { generatePhoto } from "./generatePhoto";

describe("generatePhoto", () => {
  test.each([
    ["john@example.com", "J"],
    ["john.doe@example.com", "JD"],
    ["john.van.doe@example.com", "JVD"],
  ])("should generate a photo from %s with %s text", (email, initials) => {
    const photo = generatePhoto(email);
    expect(photo).toContain("data:image/svg+xml");
    expect(photo).toContain(initials);
  });

  test("should generate a photo with a custom background and foreground color", () => {
    const photo = generatePhoto("john@example.com", "#000000", "#ffffff");
    expect(photo).toContain("000000");
    expect(photo).toContain("ffffff");
  });
});
