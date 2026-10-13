import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PlayerProvider } from "./player";

describe("shared player audio element", () => {
  it("renders one persistent, preloaded audio element in the provider", () => {
    const markup = renderToStaticMarkup(
      createElement(PlayerProvider, null, createElement("main")),
    );

    expect(markup.match(/<audio\b/g)).toHaveLength(1);
    expect(markup).toContain('preload="auto"');
    expect(markup).toContain('playsInline=""');
    expect(markup).toContain('aria-hidden="true"');
  });
});
