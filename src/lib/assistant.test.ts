import { describe, expect, it } from "vitest";

import { answerSiteQuestion, isBeatSearchRequest, parseBeatSearch } from "./assistant";

describe("site assistant answers", () => {
  it("explains purchase through WhatsApp and links to the catalogue", () => {
    const answer = answerSiteQuestion("Comment acheter une licence ?");

    expect(answer?.text).toContain("WhatsApp");
    expect(answer?.actions).toContainEqual({ label: "Explorer les beats", href: "/beats" });
  });

  it("helps users reach their favorites and cart after sign-in", () => {
    expect(answerSiteQuestion("Où sont mes beats favoris ?")?.actions).toContainEqual({
      label: "Voir mes favoris",
      href: "/auth?redirect=%2Fprofile%23favorites",
    });
    expect(answerSiteQuestion("Comment ouvrir le panier ?")?.actions).toContainEqual({
      label: "Ouvrir mon panier",
      href: "/auth?redirect=%2Fprofile%23cart",
    });
  });

  it("does not mistake an unsupported question for a beat search", () => {
    const answer = answerSiteQuestion("Comment supprimer mon compte ?");

    expect(answer?.actions).toContainEqual({ label: "Page de contact", href: "/contact" });
    expect(isBeatSearchRequest("Comment supprimer mon compte ?")).toBe(false);
  });
});

describe("assistant beat search parsing", () => {
  it("extracts useful style terms and BPM from a natural French request", () => {
    expect(parseBeatSearch("Je cherche un beat drill sombre à 140 BPM")).toEqual({
      bpm: 140,
      terms: ["drill", "sombre"],
    });
    expect(isBeatSearchRequest("Je cherche un beat drill à 140 BPM")).toBe(true);
  });

  it("normalizes R&B while preserving short style searches", () => {
    expect(parseBeatSearch("R&B")).toEqual({ bpm: null, terms: ["rnb"] });
    expect(isBeatSearchRequest("Afro")).toBe(true);
    expect(isBeatSearchRequest("Flou")).toBe(true);
  });
});
