import { Page } from "playwright";

export type DiscoveredAction = {
  id: string;
  type: "button" | "link";
  label: string;
  viewportSafe: boolean;
};

export async function discoverActions(page: Page): Promise<DiscoveredAction[]> {
  return await page.evaluate(() => {
    const actions: DiscoveredAction[] = [];

    function inViewport(el: Element) {
      const r = el.getBoundingClientRect();
      return (
        r.top >= 0 &&
        r.left >= 0 &&
        r.bottom <= window.innerHeight &&
        r.right <= window.innerWidth
      );
    }

    document.querySelectorAll("button").forEach(el => {
      const label = el.textContent?.trim();
      if (!label || label.length<2) return;

      actions.push({
        id: `button:${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
        type: "button",
        label,
        viewportSafe: inViewport(el)
      });
    });

    document.querySelectorAll("a[href]").forEach(el => {
      const label = el.textContent
                    ?.replace(/\s+/g, " ")
                    .trim();

      if (!label) return;

      actions.push({
        id: `link:${label.toLowerCase().replace(/\s+/g, "_")}`,
        type: "link",
        label,
        viewportSafe: inViewport(el)
      });
    });

    return actions;
  });
}
