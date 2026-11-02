import "server-only";

/**
 * The quiz answers, kept out of the browser bundle so learners can't read them.
 * Used only by the server's grading (`src/lib/course/grading.ts`). Keyed by lesson
 * slug, then question id; every question in `curriculum.ts` needs an entry here.
 */
export const quizAnswers: Record<string, Record<string, { correctOptionId: string; explanation: string }>> = {
  "safe-handling": {
    loaded: {
      correctOptionId: "check",
      explanation: "Every gun is loaded until you have checked it yourself.",
    },
    handover: {
      correctOptionId: "open",
      explanation: "Keep the gun open whenever you can, and always when handing it over.",
    },
    loading: {
      correctOptionId: "risk",
      explanation: "An accidental discharge is most likely while loading, so point the muzzle somewhere safe.",
    },
    safety: {
      correctOptionId: "rely",
      explanation: "A safety can fail. Muzzle direction and trigger discipline still apply.",
    },
    alcohol: {
      correctOptionId: "no",
      explanation: "Alcohol and drugs have no place around firearms.",
    },
  },
  "gun-and-ammunition": {
    barrel: {
      correctOptionId: "before",
      explanation: "An obstruction in the barrel can burst it. Check before loading.",
    },
    mixed: {
      correctOptionId: "correct",
      explanation: "Mixed ammunition makes it easy to load the wrong cartridge.",
    },
    steel: {
      correctOptionId: "proof",
      explanation: "If you are unsure whether your gun is suitable, have it inspected before use.",
    },
    misfire: {
      correctOptionId: "hold",
      explanation: "A cartridge can fire late. Wait 20 seconds before you unload.",
    },
    dull: {
      correctOptionId: "check",
      explanation: "A dull blast can mean the shot or wad is still in the barrel.",
    },
  },
  "storage-transport": {
    shotgun: {
      correctOptionId: "lock",
      explanation: "One shotgun needs a trigger lock and must be stored broken down.",
    },
    four: {
      correctOptionId: "alarm",
      explanation: "Two guns need a safe, four need a safe and an alarm, and six need a monitored alarm too.",
    },
    ammo: {
      correctOptionId: "locked",
      explanation: "Ammunition is locked away and kept apart from the firearms, in storage and in transit.",
    },
    silencer: {
      correctOptionId: "yes",
      explanation: "Silencers and night-vision scopes are treated as firearms.",
    },
    authority: {
      correctOptionId: "super",
      explanation: "The district Superintendent grants the licence and can attach conditions to it.",
    },
  },
  "in-the-field": {
    birdshot: {
      correctOptionId: "200",
      explanation: "Bird shot can travel over 200 metres, so know what is well beyond your target.",
    },
    backstop: {
      correctOptionId: "bank",
      explanation: "Water and flat, hard surfaces can make a rifle bullet ricochet.",
    },
    scope: {
      correctOptionId: "no",
      explanation: "Looking through the scope means pointing the rifle at whatever you are looking at.",
    },
    obstacle: {
      correctOptionId: "unload",
      explanation: "Always unload before crossing an obstacle.",
    },
    group: {
      correctOptionId: "officer",
      explanation: "Pick a Safety Officer, set zones of fire, and know where everyone is at all times.",
    },
  },
  "hunting-and-the-law": {
    permission: {
      correctOptionId: "trespass",
      explanation: "Without the landowner's permission, it is armed trespass.",
    },
    conflict: {
      correctOptionId: "avoid",
      explanation: "Walk away from confrontations and keep a record of any conflict.",
    },
    vehicle: {
      correctOptionId: "no",
      explanation: "Both are illegal.",
    },
    foreshore: {
      correctOptionId: "tidal",
      explanation: "Tidal areas and larger lakes need a foreshore licence.",
    },
    doubt: {
      correctOptionId: "dont",
      explanation: "When in doubt, don't shoot. And never shoot birds with a rifle.",
    },
  },
};
