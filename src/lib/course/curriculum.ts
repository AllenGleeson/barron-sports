export const COURSE_PASS_PERCENT = 80;

/**
 * Testing switch: opens every lesson and every step (reading, film, quiz)
 * without passing the ones before. Set to false before launch.
 */
export const COURSE_UNLOCK_ALL = true;

/**
 * Testing switch: quizzes open with the correct answers already ticked (the server sends
 * them with the learner's progress). Set to false before launch.
 */
export const COURSE_PREFILL_ANSWERS = true;

export type QuizOption = {
  id: string;
  label: string;
};

/**
 * A quiz question as the browser sees it. The correct answer and explanation are in
 * `quizAnswers.ts` (server only), and grading happens on the server.
 */
export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export type CourseLesson = {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  paragraphs: string[];
  points: string[];
  handout: string;
  video: {
    title: string;
    minutes: number;
    caption: string;
  };
  quiz: {
    passPercent: number;
    questions: QuizQuestion[];
  };
};

export const learnerCourse = {
  title: "Firearms safety",
  passPercent: COURSE_PASS_PERCENT,
  poster: {
    src: "/course/course-hero.jpg",
    alt: "Hunting rifle and shotgun on an outdoor shooting bench at dusk",
  },
  lessons: [
    {
      slug: "safe-handling",
      title: "Safe handling",
      summary: "Treat every gun as loaded, control the muzzle, and keep your finger off the trigger.",
      minutes: 8,
      paragraphs: [
        "Most accidents start with a gun someone believed was empty, or a muzzle nobody was watching. These habits apply every time you pick up a firearm: at home, in the shop and in the field.",
      ],
      points: [
        "Treat every gun as loaded until you have checked it yourself.",
        "Keep the gun open whenever you can, and always when you hand it to someone else.",
        "Keep it unloaded until you are ready to use it.",
        "Point the muzzle in a safe direction when you load. Loading is when an accidental discharge is most likely.",
        "Always keep the muzzle pointed in a safe direction, and never point it at anything you don't intend to shoot.",
        "Keep your finger off the trigger until you are ready to shoot.",
        "Keep the safety on until you intend to shoot, but never rely on it to stop the gun firing.",
        "Learn how your gun works and handles before you use it.",
        "Wear eye and ear protection when you can, especially around other shooters.",
        "Put your phone away while handling a gun. It is a serious distraction.",
        "Avoid alcohol and drugs completely when using firearms.",
      ],
      handout: "Safe handling notes",
      video: {
        title: "Safe handling on the counter",
        minutes: 4,
        caption: "Placeholder film. The live lesson will show checking a gun, an open action, and a careful handover.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "loaded",
            prompt: "Someone hands you a gun and says it is empty. What do you do?",
            options: [
              { id: "trust", label: "Take their word for it" },
              { id: "check", label: "Treat it as loaded until you have checked it yourself" },
              { id: "trigger", label: "Pull the trigger to check" },
              { id: "closed", label: "Assume it is empty if the action is closed" },
            ],
          },
          {
            id: "handover",
            prompt: "How do you hand a gun to someone else?",
            options: [
              { id: "closed", label: "Closed, so nothing falls out" },
              { id: "open", label: "Open, with the muzzle in a safe direction" },
              { id: "safety", label: "Closed, with the safety on" },
              { id: "muzzle", label: "Muzzle first, so they can see down the barrel" },
            ],
          },
          {
            id: "loading",
            prompt: "Why does muzzle direction matter so much when you load?",
            options: [
              { id: "risk", label: "Loading carries a higher risk of an accidental discharge" },
              { id: "speed", label: "It makes loading quicker" },
              { id: "range", label: "It only matters on a range" },
              { id: "none", label: "It doesn't matter while loading" },
            ],
          },
          {
            id: "safety",
            prompt: "The safety catch is on. What does that mean for you?",
            options: [
              { id: "fire", label: "The gun cannot fire, so you can relax" },
              { id: "point", label: "You can point it anywhere" },
              { id: "rely", label: "Keep it on until you intend to shoot, but don't rely on it" },
              { id: "trigger", label: "You can rest your finger on the trigger" },
            ],
          },
          {
            id: "alcohol",
            prompt: "You had a couple of drinks at lunch. Can you go shooting this afternoon?",
            options: [
              { id: "one", label: "Yes, if it was only one or two" },
              { id: "no", label: "No. Alcohol and drugs should be completely avoided with firearms" },
              { id: "driver", label: "Yes, if someone else drives" },
              { id: "range", label: "Yes, but only on a range" },
            ],
          },
        ],
      },
    },
    {
      slug: "gun-and-ammunition",
      title: "Your gun and its ammunition",
      summary: "Keep the gun in good order, use the right cartridges, and know what to do when a shot goes wrong.",
      minutes: 6,
      paragraphs: [
        "A gun in poor condition, or the wrong cartridge in the chamber, can turn a routine shot into an accident. This lesson covers the checks before you load, and what to do when a shot sounds or feels wrong.",
      ],
      points: [
        "Keep your firearm clean and in good, safe working order.",
        "Check the barrel is clear of obstructions before you load and shoot.",
        "Always use the correct ammunition for the gun, and never carry mixed ammunition.",
        "Use steel shot only in guns marked with the ⚜ steel-shot proof mark, with no more than ½ choke. If you are unsure, have the gun inspected before use.",
        "If the gun doesn't fire when you pull the trigger, hold your shooting position for 20 seconds. Then, with the muzzle and breech pointed in a safe direction, unload it.",
        "If a shot sounds like a dull blast, make sure nothing is left stuck in the barrel before you fire again.",
      ],
      handout: "Gun and ammunition notes",
      video: {
        title: "Checks before you load",
        minutes: 3,
        caption: "Placeholder film. The live lesson will show a barrel check, matching cartridges to the gun, and handling a misfire.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "barrel",
            prompt: "When do you check that the barrel is clear?",
            options: [
              { id: "season", label: "Once at the start of the season" },
              { id: "before", label: "Before you load and shoot" },
              { id: "clean", label: "Only after cleaning" },
              { id: "never", label: "Never. The first shot clears it" },
            ],
          },
          {
            id: "mixed",
            prompt: "Which is right about ammunition?",
            options: [
              { id: "any", label: "Any cartridge that fits the chamber is fine" },
              { id: "mixed", label: "Carry a mix of loads so you are ready for anything" },
              { id: "correct", label: "Use the correct ammunition for the gun, and never carry mixed ammunition" },
              { id: "pocket", label: "Keep spare cartridges loose in any pocket" },
            ],
          },
          {
            id: "steel",
            prompt: "When can you use steel shot?",
            options: [
              { id: "any", label: "In any shotgun" },
              { id: "proof", label: "Only in a gun with the ⚜ steel-shot proof mark, with no more than ½ choke" },
              { id: "full", label: "Only with full choke" },
              { id: "old", label: "Only in older guns" },
            ],
          },
          {
            id: "misfire",
            prompt: "You pull the trigger and nothing happens. What do you do?",
            options: [
              { id: "open", label: "Open the gun straight away to look" },
              { id: "again", label: "Pull the trigger again quickly" },
              { id: "hold", label: "Hold your position for 20 seconds, then unload with the muzzle and breech pointed in a safe direction" },
              { id: "barrel", label: "Look down the barrel to see what went wrong" },
            ],
          },
          {
            id: "dull",
            prompt: "A shot makes a dull blast instead of the normal report. What next?",
            options: [
              { id: "carry", label: "Carry on shooting" },
              { id: "check", label: "Make sure nothing is stuck in the barrel before firing again" },
              { id: "louder", label: "Fire again to clear it" },
              { id: "ignore", label: "Ignore it. It is just the weather" },
            ],
          },
        ],
      },
    },
    {
      slug: "storage-transport",
      title: "Storage, transport and licensing",
      summary: "What the law asks of you at home, on the road, and on your firearm certificate.",
      minutes: 7,
      paragraphs: [
        "Your firearm certificate comes with legal duties that carry on after you leave the field. These are the minimum storage requirements per household. The district Superintendent can add conditions to your licence, so check your own certificate as well.",
      ],
      points: [
        "One shotgun: a trigger lock, with the gun stored broken down.",
        "Two guns: an approved gun safe.",
        "Four guns: a safe and an alarm.",
        "Six guns: a safe and a monitored alarm with a maintenance contract.",
        "Keep ammunition in a locked receptacle, apart from the firearms, both at home and in transit.",
        "Silencers and night-vision scopes count as firearms. They must be on your certificate or have their own licence.",
        "The district Superintendent is the licensing authority for non-restricted firearms in your area, and can attach conditions to your licence.",
        "State the ammunition quota you need on the FCA1 application form, available on garda.ie.",
      ],
      handout: "Storage, transport and licensing notes",
      video: {
        title: "From safe to case",
        minutes: 3,
        caption: "Placeholder film. The live lesson will show a compliant safe, a locked ammunition box, and a gun cased for the journey.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "shotgun",
            prompt: "You keep one shotgun at home. What is the minimum storage?",
            options: [
              { id: "wardrobe", label: "Assembled, in a wardrobe" },
              { id: "lock", label: "A trigger lock, with the gun stored broken down" },
              { id: "case", label: "In its case under the bed" },
              { id: "none", label: "Nothing, for a single gun" },
            ],
          },
          {
            id: "four",
            prompt: "A household has four guns. What is the minimum storage?",
            options: [
              { id: "locks", label: "Trigger locks on each gun" },
              { id: "safe", label: "A safe only" },
              { id: "alarm", label: "A safe and an alarm" },
              { id: "room", label: "A locked room" },
            ],
          },
          {
            id: "ammo",
            prompt: "How should ammunition be kept, at home and on the road?",
            options: [
              { id: "with", label: "In the safe, loose beside the guns" },
              { id: "locked", label: "In a locked receptacle, apart from the firearms" },
              { id: "glovebox", label: "In an unlocked glovebox" },
              { id: "chamber", label: "In the chamber, ready to go" },
            ],
          },
          {
            id: "silencer",
            prompt: "Do you need a licence for a silencer or a night-vision scope?",
            options: [
              { id: "no", label: "No, they are only accessories" },
              { id: "yes", label: "Yes. They count as firearms and must be on your certificate or licensed separately" },
              { id: "rifle", label: "Only if you own a rifle" },
              { id: "shop", label: "Only if bought outside Ireland" },
            ],
          },
          {
            id: "authority",
            prompt: "Who is the licensing authority for non-restricted firearms in your area?",
            options: [
              { id: "npws", label: "The NPWS" },
              { id: "council", label: "The county council" },
              { id: "super", label: "The district Superintendent" },
              { id: "club", label: "Your gun club" },
            ],
          },
        ],
      },
    },
    {
      slug: "in-the-field",
      title: "Safe shooting in the field",
      summary: "Be sure of your target and what is beyond it, and keep control of the gun on rough ground and in a group.",
      minutes: 7,
      paragraphs: [
        "A safe shot depends on more than the target. Know how far your shot can travel, watch your footing, and agree who is where before anyone loads.",
      ],
      points: [
        "Be sure of your target and what is beyond it. Bird shot can travel over 200 metres.",
        "Every rifle shot needs a solid backstop. Don't fire a rifle at water or flat, hard surfaces that can cause a ricochet.",
        "Don't use a rifle scope as binoculars.",
        "Watch your footing, so a trip or stumble doesn't swing the muzzle towards anyone or make the gun fire.",
        "Unload your gun before crossing a fence, ditch or other obstacle.",
        "If you fall or trip, control the muzzle. Afterwards, check the gun for damage and the barrel for obstructions.",
        "When shooting in a group, pick one person to act as Safety Officer for the day.",
        "Agree everyone's zone of fire, and know where everyone is at all times.",
      ],
      handout: "Field safety notes",
      video: {
        title: "Beyond the target",
        minutes: 4,
        caption: "Placeholder film. The live lesson will walk through a backstop, crossing a fence, and zones of fire in a group.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "birdshot",
            prompt: "How far can bird shot travel?",
            options: [
              { id: "20", label: "About 20 metres" },
              { id: "50", label: "About 50 metres" },
              { id: "200", label: "Over 200 metres" },
              { id: "field", label: "No further than the end of the field" },
            ],
          },
          {
            id: "backstop",
            prompt: "Which of these is a safe backstop for a rifle shot?",
            options: [
              { id: "water", label: "The surface of a lake" },
              { id: "rock", label: "A flat sheet of rock" },
              { id: "bank", label: "A solid earth bank behind the target" },
              { id: "yard", label: "A concrete yard" },
            ],
          },
          {
            id: "scope",
            prompt: "You want a closer look at something across the field. Do you use your rifle scope?",
            options: [
              { id: "yes", label: "Yes, that is what it is for" },
              { id: "no", label: "No. A rifle scope is not a pair of binoculars" },
              { id: "safe", label: "Yes, if the safety is on" },
              { id: "unloaded", label: "Yes, if you think it is unloaded" },
            ],
          },
          {
            id: "obstacle",
            prompt: "You come to a fence you need to cross. What do you do with the gun?",
            options: [
              { id: "safety", label: "Put the safety on and climb over" },
              { id: "unload", label: "Unload it before crossing" },
              { id: "carry", label: "Carry it loaded, muzzle up" },
              { id: "throw", label: "Pass it over loaded to a friend" },
            ],
          },
          {
            id: "group",
            prompt: "You are shooting with a group. What do you agree before starting?",
            options: [
              { id: "order", label: "Who shoots first" },
              { id: "officer", label: "A Safety Officer for the day, and each person's zone of fire" },
              { id: "nothing", label: "Nothing. Everyone watches out for themselves" },
              { id: "bag", label: "How the bag will be shared" },
            ],
          },
        ],
      },
    },
    {
      slug: "hunting-and-the-law",
      title: "Hunting and the law",
      summary: "Permission, seasons, and where you can and can't shoot. When in doubt, don't shoot.",
      minutes: 6,
      paragraphs: [
        "Knowing what is legal is part of every shot. If anything is uncertain, whether it is the law, the quarry or the background, leave the shot.",
      ],
      points: [
        "Only shoot over land where you have permission. Shooting without it is armed trespass.",
        "Avoid confrontations, and keep a record of any conflicts.",
        "Hunting from a vehicle is illegal, and so is shooting from a public road.",
        "You need a foreshore licence from the NPWS to shoot in tidal areas and on larger lakes.",
        "Learn the open seasons for game, and which species are protected.",
        "Never shoot birds with a rifle.",
        "When in doubt, don't shoot.",
      ],
      handout: "Hunting and the law notes",
      video: {
        title: "Where you can shoot",
        minutes: 3,
        caption: "Placeholder film. The live lesson will cover permission, foreshore licences and open seasons.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "permission",
            prompt: "What is shooting over land without permission?",
            options: [
              { id: "fine", label: "Fine, if the land is unfenced" },
              { id: "trespass", label: "Armed trespass" },
              { id: "minor", label: "A minor matter, if nobody complains" },
              { id: "season", label: "Allowed during the open season" },
            ],
          },
          {
            id: "conflict",
            prompt: "Someone confronts you angrily while you are out shooting. What should you do?",
            options: [
              { id: "argue", label: "Stand your ground and argue it out" },
              { id: "avoid", label: "Avoid the confrontation and record what happened" },
              { id: "ignore", label: "Ignore them and keep shooting" },
              { id: "show", label: "Show them your gun and certificate" },
            ],
          },
          {
            id: "vehicle",
            prompt: "Can you shoot from your car, or from a public road?",
            options: [
              { id: "car", label: "From the car, if the engine is off" },
              { id: "road", label: "From the road, if no traffic is coming" },
              { id: "no", label: "No. Hunting from a vehicle and shooting from a public road are both illegal" },
              { id: "night", label: "Yes, but only at night" },
            ],
          },
          {
            id: "foreshore",
            prompt: "Where do you need a foreshore licence from the NPWS?",
            options: [
              { id: "tidal", label: "In tidal areas and on larger lakes" },
              { id: "forest", label: "In state forests" },
              { id: "farm", label: "On any farmland" },
              { id: "range", label: "On a shooting range" },
            ],
          },
          {
            id: "doubt",
            prompt: "You are not sure whether a bird is in season or protected. What do you do?",
            options: [
              { id: "shoot", label: "Shoot, and check afterwards" },
              { id: "rifle", label: "Take it with the rifle for a cleaner shot" },
              { id: "dont", label: "Don't shoot" },
              { id: "ask", label: "Shoot if your companion thinks it is fine" },
            ],
          },
        ],
      },
    },
  ] satisfies CourseLesson[],
};

/** One marked question, as returned by the server after grading. */
export type QuizResult = {
  id: string;
  chosenId: string | null;
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
};

export type QuizGrade = {
  correct: number;
  total: number;
  scorePercent: number;
  passed: boolean;
  results: QuizResult[];
};

export function requiredCorrectCount(questionCount: number, passPercent: number) {
  return Math.ceil((questionCount * passPercent) / 100);
}

/** Rebuilds a grade from marked results (e.g. the last attempt loaded from the server). */
export function gradeFromResults(quiz: CourseLesson["quiz"], results: QuizResult[]): QuizGrade {
  const correct = results.filter((result) => result.isCorrect).length;
  const total = quiz.questions.length;
  const scorePercent = Math.round((correct / total) * 100);
  return { correct, total, scorePercent, passed: scorePercent >= quiz.passPercent, results };
}

export function findLesson(slug: string) {
  return learnerCourse.lessons.find((lesson) => lesson.slug === slug) ?? null;
}

export function lessonBySlug(slug: string) {
  return findLesson(slug) ?? learnerCourse.lessons[0];
}
