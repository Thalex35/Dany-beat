import { describe, expect, it } from "vitest";

import {
  answerMusicQuestion,
  answerSiteQuestion,
  isBeatSearchRequest,
  parseBeatSearch,
} from "./assistant";

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

  it("answers music concepts in Haitian Creole", () => {
    expect(answerSiteQuestion("Ki sa BPM vle di?")?.text).toContain("BPM vle di");
    expect(answerMusicQuestion("What is the BPM?")?.text).toContain("battements par minute");
    expect(answerMusicQuestion("Kisa melodi ye?")?.text).toContain("Melodi se");
    expect(answerMusicQuestion("Ki sa konpa ye?")?.text).toContain("Konpa se");
    expect(answerMusicQuestion("What is the mood of a beat?")?.text).toContain(
      "L'ambiance (ou le mood)",
    );
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

  it("extracts a Haitian Creole genre and tempo without treating filler as search terms", () => {
    expect(parseBeatSearch("Mwen bezwen yon beat konpa a 110 BPM")).toEqual({
      bpm: 110,
      terms: ["konpa"],
    });
    expect(isBeatSearchRequest("Mwen bezwen yon beat konpa a 110 BPM")).toBe(true);
    expect(answerMusicQuestion("Kijan pou jwenn yon beat konpa?")).toBeNull();
    expect(isBeatSearchRequest("Kijan pou jwenn yon beat konpa?")).toBe(true);
  });

  it("does not turn a music-theory question into a catalogue search", () => {
    expect(isBeatSearchRequest("What does harmony mean in music?")).toBe(false);
    expect(answerMusicQuestion("What does harmony mean in music?")?.text).toContain(
      "La mélodie",
    );
    expect(answerMusicQuestion("sad mood")).toBeNull();
    expect(isBeatSearchRequest("sad mood")).toBe(true);
  });
});
