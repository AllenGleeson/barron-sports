export const COURSE_PASS_PERCENT = 80;

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
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
      summary: "Muzzle, trigger finger, and how to prove a firearm clear before you trust it.",
      minutes: 8,
      paragraphs: [
        "Every habit in this lesson is about where the muzzle points and whether the firearm is actually empty. The sample film shows the same rules on the counter, where most handling in the shop starts.",
      ],
      points: [
        "Keep the muzzle pointing in a safe direction the whole time you handle the firearm.",
        "Keep your finger off the trigger until you have decided to fire and the muzzle is on a safe target.",
        "Treat every firearm as loaded until you have proved it clear.",
        "Prove it clear by opening the action and looking into the chamber and the magazine.",
        "Pass it on only with the action open, the muzzle in a safe direction, and the other person ready to take it.",
      ],
      handout: "Safe handling notes",
      video: {
        title: "Safe handling on the counter",
        minutes: 4,
        caption: "Placeholder film. The live lesson will show muzzle direction, an open action, and a careful handover.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "muzzle",
            prompt: "Where does the muzzle point while you are handling a firearm?",
            options: [
              { id: "people", label: "Towards the nearest person, so they can see it" },
              { id: "safe", label: "In a safe direction, the whole time" },
              { id: "up", label: "Straight up, including indoors" },
              { id: "ground", label: "At your own foot, so it stays low" },
            ],
            correctOptionId: "safe",
            explanation: "A safe direction is one where an accidental discharge would not harm a person.",
          },
          {
            id: "trigger",
            prompt: "When does your finger go on the trigger?",
            options: [
              { id: "pickup", label: "As soon as you pick the firearm up" },
              { id: "aim", label: "As soon as you start to aim" },
              { id: "decision", label: "Only after you have decided to fire and the muzzle is on a safe target" },
              { id: "always", label: "The whole time, for a firm hold" },
            ],
            correctOptionId: "decision",
            explanation: "Until that moment the finger stays outside the trigger guard.",
          },
          {
            id: "loaded",
            prompt: "You pick a firearm up off the counter. What do you assume?",
            options: [
              { id: "empty", label: "That it is empty, because it is in the shop" },
              { id: "loaded", label: "That it is loaded, until you have proved it clear" },
              { id: "ask", label: "That it is safe if nobody mentions it" },
              { id: "looks", label: "That it is empty if the muzzle looks clear" },
            ],
            correctOptionId: "loaded",
            explanation: "Appearance is not a check. Prove it clear before you trust it.",
          },
          {
            id: "clear",
            prompt: "How do you prove a firearm clear?",
            options: [
              { id: "weight", label: "By the weight of it in your hands" },
              { id: "look", label: "By opening the action and looking into the chamber and the magazine" },
              { id: "shake", label: "By shaking it to listen for a cartridge" },
              { id: "dry", label: "By pressing the trigger and listening for a click" },
            ],
            correctOptionId: "look",
            explanation: "Open the action and check the chamber and magazine by eye.",
          },
          {
            id: "pass",
            prompt: "What is the right way to pass a firearm to someone else?",
            options: [
              { id: "closed", label: "Action closed, so nothing can fall out" },
              { id: "toss", label: "Held out for them to take whenever they are ready" },
              { id: "open", label: "Action open, muzzle in a safe direction, and only when they are ready" },
              { id: "muzzle", label: "Muzzle towards them so they can take the grip" },
            ],
            correctOptionId: "open",
            explanation: "The other person should be ready, the action open, and the muzzle still safe.",
          },
        ],
      },
    },
    {
      slug: "storage-transport",
      title: "Storage and transport",
      summary: "Unloaded in a locked cabinet at home, and cased for the journey.",
      minutes: 7,
      paragraphs: [
        "This lesson is shop guidance for the preview course. The conditions on a firearm certificate, and the Garda Commissioner’s Guidelines, govern storage in practice.",
      ],
      points: [
        "Store the firearm unloaded, in a locked cabinet.",
        "Store ammunition apart from the firearm.",
        "Keep the cabinet keys away from the cabinet.",
        "For a journey, unload it, case it, and keep it out of sight.",
        "Take it out of the vehicle when the journey ends. A parked car is not storage.",
      ],
      handout: "Storage and transport notes",
      video: {
        title: "From cabinet to case",
        minutes: 3,
        caption: "Placeholder film. The live lesson will show an unloaded firearm going into a case for the journey.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "cabinet",
            prompt: "How is a firearm stored at home in this course?",
            options: [
              { id: "wardrobe", label: "Loaded, in a wardrobe" },
              { id: "cabinet", label: "Unloaded, in a locked cabinet" },
              { id: "case", label: "In its case, behind the sofa" },
              { id: "car", label: "In the car, so it is ready to leave" },
            ],
            correctOptionId: "cabinet",
            explanation: "Unloaded, and locked away. The certificate conditions still apply.",
          },
          {
            id: "ammo",
            prompt: "Where does the ammunition go?",
            options: [
              { id: "same", label: "In the same cabinet, loose beside the firearm" },
              { id: "apart", label: "Stored apart from the firearm" },
              { id: "chamber", label: "Left in the chamber so the count stays correct" },
              { id: "glove", label: "In the glovebox" },
            ],
            correctOptionId: "apart",
            explanation: "This course keeps ammunition stored apart from the firearm.",
          },
          {
            id: "keys",
            prompt: "Where do the cabinet keys live?",
            options: [
              { id: "lock", label: "Left in the cabinet lock" },
              { id: "top", label: "On top of the cabinet" },
              { id: "away", label: "Away from the cabinet" },
              { id: "case", label: "Inside the gun case" },
            ],
            correctOptionId: "away",
            explanation: "A key left with the cabinet undoes the lock.",
          },
          {
            id: "journey",
            prompt: "How does a firearm travel in a vehicle for this course?",
            options: [
              { id: "loaded", label: "Loaded, on the passenger seat" },
              { id: "cased", label: "Unloaded, cased, and out of sight" },
              { id: "open", label: "Uncased, with the muzzle out the window" },
              { id: "boot-loaded", label: "Loaded in the boot, if the boot is shut" },
            ],
            correctOptionId: "cased",
            explanation: "Unload it, case it, and keep it out of sight for the journey.",
          },
          {
            id: "parked",
            prompt: "The journey is over and the car is parked. Where should the firearm be?",
            options: [
              { id: "car", label: "Left in the car until the next outing" },
              { id: "out", label: "Taken out of the vehicle. A parked car is not storage" },
              { id: "under", label: "Under a seat, if the car is locked" },
              { id: "night", label: "In the car overnight, if ammunition is at home" },
            ],
            correctOptionId: "out",
            explanation: "When the journey ends, the firearm comes out of the vehicle.",
          },
        ],
      },
    },
    {
      slug: "field-range",
      title: "Field and range",
      summary: "What has to be true beyond the target before a shot is safe.",
      minutes: 8,
      paragraphs: [
        "A safe shot is one you have checked, not one that feels quiet. On a range, the range officer decides when firing is allowed.",
      ],
      points: [
        "Know what is beyond the target before you fire.",
        "Do not fire towards people, buildings, roads, livestock or dogs.",
        "On a range, follow the range officer and fire only when the range is live.",
        "If you are unsure of the backstop, the shot is unsafe.",
        "When you are not shooting, keep the action open and the muzzle in a safe direction.",
      ],
      handout: "Field and range notes",
      video: {
        title: "Beyond the target",
        minutes: 4,
        caption: "Placeholder film. The live lesson will walk through a backstop, a stop on the range, and an open action between shots.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "beyond",
            prompt: "What do you need to know before you fire?",
            options: [
              { id: "beyond", label: "What is beyond the target" },
              { id: "wind", label: "Only the wind direction" },
              { id: "company", label: "Only that your companions are behind you" },
              { id: "light", label: "Only that the light is good enough to see the foresight" },
            ],
            correctOptionId: "beyond",
            explanation: "The background decides whether the shot is safe.",
          },
          {
            id: "towards",
            prompt: "Which of these is a safe direction of fire in this course?",
            options: [
              { id: "road", label: "Towards a road, if no car is in sight" },
              { id: "stock", label: "Over livestock, if they are far away" },
              { id: "backstop", label: "Towards a backstop you have checked, with no people, buildings, roads, livestock or dogs in the way" },
              { id: "dog", label: "Past a dog, if the dog is sitting" },
            ],
            correctOptionId: "backstop",
            explanation: "People, buildings, roads, livestock and dogs are all reasons not to fire.",
          },
          {
            id: "range",
            prompt: "When may you fire on a range?",
            options: [
              { id: "arrive", label: "As soon as you arrive at your stand" },
              { id: "live", label: "Only when the range officer has the range live" },
              { id: "quiet", label: "Whenever the firing point is quiet" },
              { id: "own", label: "Whenever you have proved your own firearm clear" },
            ],
            correctOptionId: "live",
            explanation: "The range officer controls when the range is live.",
          },
          {
            id: "unsure",
            prompt: "You cannot tell what the backstop is. What does this course say?",
            options: [
              { id: "unsafe", label: "The shot is unsafe" },
              { id: "low", label: "Fire low and it will be fine" },
              { id: "once", label: "One shot is acceptable, to check" },
              { id: "ask-after", label: "Fire, then ask the people with you" },
            ],
            correctOptionId: "unsafe",
            explanation: "If the backstop is uncertain, you do not fire.",
          },
          {
            id: "between",
            prompt: "What do you do with the firearm when you are not shooting?",
            options: [
              { id: "closed", label: "Keep the action closed and the muzzle on the ground" },
              { id: "open", label: "Keep the action open and the muzzle in a safe direction" },
              { id: "sling", label: "Sling it with the action closed and a cartridge in the chamber" },
              { id: "person", label: "Point it at the ground near the nearest person" },
            ],
            correctOptionId: "open",
            explanation: "Action open, muzzle in a safe direction, until you are shooting again.",
          },
        ],
      },
    },
    {
      slug: "before-the-shot",
      title: "Before the shot",
      summary: "Identify what you are looking at, and leave the shot if you are not sure.",
      minutes: 7,
      paragraphs: [
        "The last lesson is about the decision, not the firearm. If you cannot name what you are looking at, or you cannot place the shot cleanly with a safe background, you do not shoot.",
      ],
      points: [
        "Identify the animal for certain before you consider a shot.",
        "If you are not sure what it is, you do not shoot.",
        "Take a shot only when the background is safe and you can place it cleanly.",
        "Do not shoot beyond the distance where you are still accurate and still sure of the background.",
        "Mark the spot and follow up. Do not leave an animal you have wounded.",
      ],
      handout: "Before the shot notes",
      video: {
        title: "The decision to fire",
        minutes: 3,
        caption: "Placeholder film. The live lesson will cover identification, distance, and following up.",
      },
      quiz: {
        passPercent: COURSE_PASS_PERCENT,
        questions: [
          {
            id: "identify",
            prompt: "When do you consider a shot at an animal?",
            options: [
              { id: "movement", label: "As soon as something moves" },
              { id: "certain", label: "Only after you have identified it for certain" },
              { id: "shape", label: "When the shape looks about right" },
              { id: "companion", label: "When someone else says they heard one" },
            ],
            correctOptionId: "certain",
            explanation: "Identification comes before the decision to fire.",
          },
          {
            id: "unsure-animal",
            prompt: "You are not sure what the animal is. What do you do?",
            options: [
              { id: "no-shot", label: "You do not shoot" },
              { id: "closer", label: "Fire once to make it move closer" },
              { id: "guess", label: "Shoot if your first guess is a lawful quarry" },
              { id: "light", label: "Shoot if the light is fading and you may not get another chance" },
            ],
            correctOptionId: "no-shot",
            explanation: "Uncertainty means there is no shot.",
          },
          {
            id: "clean",
            prompt: "The animal is identified. When is the shot acceptable in this course?",
            options: [
              { id: "any", label: "Whenever you can see it" },
              { id: "clean", label: "When the background is safe and you can place the shot cleanly" },
              { id: "far", label: "When it is the only animal you have seen all day" },
              { id: "running", label: "When it is running, so it does not leave the ground" },
            ],
            correctOptionId: "clean",
            explanation: "A safe background and a clean placement are both required.",
          },
          {
            id: "distance",
            prompt: "The animal is further away than you can shoot accurately. What does this course say?",
            options: [
              { id: "leave", label: "Leave the shot" },
              { id: "high", label: "Aim high to allow for the distance" },
              { id: "two", label: "Fire twice to improve the odds" },
              { id: "closer-shot", label: "Fire and hope it moves closer" },
            ],
            correctOptionId: "leave",
            explanation: "Past the distance where you are accurate and sure of the background, you do not shoot.",
          },
          {
            id: "follow",
            prompt: "You have wounded an animal. What do you do next?",
            options: [
              { id: "leave", label: "Leave it and carry on" },
              { id: "mark", label: "Mark the spot and follow up" },
              { id: "wait", label: "Wait until the next day" },
              { id: "another", label: "Look for a different animal instead" },
            ],
            correctOptionId: "mark",
            explanation: "Mark the spot and follow up. Do not leave an animal you have wounded.",
          },
        ],
      },
    },
  ] satisfies CourseLesson[],
};

export type QuizGrade = {
  correct: number;
  total: number;
  scorePercent: number;
  passed: boolean;
  results: { id: string; chosenId: string | null; isCorrect: boolean }[];
};

export function requiredCorrectCount(questionCount: number, passPercent: number) {
  return Math.ceil((questionCount * passPercent) / 100);
}

export function gradeQuiz(
  quiz: CourseLesson["quiz"],
  answers: Record<string, string>,
): QuizGrade {
  let correct = 0;
  const results = quiz.questions.map((question) => {
    const chosenId = answers[question.id] ?? null;
    const isCorrect = chosenId === question.correctOptionId;
    if (isCorrect) correct += 1;
    return { id: question.id, chosenId, isCorrect };
  });
  const scorePercent = Math.round((correct / quiz.questions.length) * 100);
  return {
    correct,
    total: quiz.questions.length,
    scorePercent,
    passed: scorePercent >= quiz.passPercent,
    results,
  };
}

export function lessonBySlug(slug: string) {
  return learnerCourse.lessons.find((lesson) => lesson.slug === slug) ?? learnerCourse.lessons[0];
}
