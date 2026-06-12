import { describe, expect, test } from "bun:test";
import { classifyMarketItem } from "./classification";

describe("classifyMarketItem", () => {
  test("classifies emissive wearable items", () => {
    const item = classifyMarketItem("No Mercy Balaclava");

    expect(item.itemKind).toBe("wearable");
    expect(item.slot).toBe("face");
    expect(item.baseTemplate).toBe("balaclava");
    expect(item.emissive).toBe(true);
  });

  test("does not misclassify commodity bags as backpacks", () => {
    const item = classifyMarketItem("High Quality Bag");

    expect(item.itemKind).toBe("non_renderable");
    expect(item.slot).toBeNull();
    expect(item.renderTarget).toBe("none");
  });
});

