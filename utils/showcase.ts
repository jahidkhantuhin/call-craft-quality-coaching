export type CallOutcome = "Booked" | "Follow-up" | "Resolved" | "Missed";

export interface CallRubric {
  greeting: number;
  discovery: number;
  resolution: number;
  empathy: number;
}

export interface DemoCall {
  id: string;
  caller: string;
  business: string;
  agent: string;
  outcome: CallOutcome;
  score: number;
  durationSeconds: number;
  timestamp: string;
  topic: string;
  summary: string;
  note: string;
  reviewed: boolean;
  rubric: CallRubric;
}

const daysAgo = (days: number, hour: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
};

export const demoCalls: DemoCall[] = [
  {
    id: "CL-2048",
    caller: "Alex Morgan",
    business: "Northstar Dental",
    agent: "Riley Bennett",
    outcome: "Booked",
    score: 96,
    durationSeconds: 284,
    timestamp: daysAgo(0, 10),
    topic: "New patient consultation",
    summary:
      "The agent clarified insurance coverage, offered two appointment options, and confirmed the caller's preferred time.",
    note: "Excellent listening and a clear, confident close.",
    reviewed: true,
    rubric: { greeting: 100, discovery: 95, resolution: 95, empathy: 95 },
  },
  {
    id: "CL-2047",
    caller: "Taylor Brooks",
    business: "Cedar Grove Plumbing",
    agent: "Jordan Lee",
    outcome: "Follow-up",
    score: 78,
    durationSeconds: 412,
    timestamp: daysAgo(0, 9),
    topic: "Urgent repair estimate",
    summary:
      "The caller described a leaking water heater. The agent gathered useful details but did not confirm a callback window.",
    note:
      "Confirm the next step and a specific follow-up time before ending the call.",
    reviewed: false,
    rubric: { greeting: 82, discovery: 85, resolution: 68, empathy: 77 },
  },
  {
    id: "CL-2046",
    caller: "Morgan Price",
    business: "Harborview Wellness",
    agent: "Casey Nguyen",
    outcome: "Booked",
    score: 92,
    durationSeconds: 336,
    timestamp: daysAgo(1, 14),
    topic: "Initial wellness visit",
    summary:
      "The agent explained the intake process in plain language and scheduled a first visit that worked for the caller.",
    note: "Strong explanation; consider checking for any remaining questions.",
    reviewed: true,
    rubric: { greeting: 94, discovery: 90, resolution: 91, empathy: 93 },
  },
  {
    id: "CL-2045",
    caller: "Sam Ellis",
    business: "Summit Home Services",
    agent: "Avery Patel",
    outcome: "Resolved",
    score: 88,
    durationSeconds: 198,
    timestamp: daysAgo(2, 11),
    topic: "Service-area question",
    summary:
      "The caller's address was outside the service area. The agent explained the limitation and shared a practical alternative.",
    note:
      "A thoughtful resolution that left the caller with a useful next step.",
    reviewed: true,
    rubric: { greeting: 90, discovery: 86, resolution: 88, empathy: 88 },
  },
  {
    id: "CL-2044",
    caller: "Avery Patel",
    business: "Pine & Peak Orthodontics",
    agent: "Riley Bennett",
    outcome: "Missed",
    score: 71,
    durationSeconds: 94,
    timestamp: daysAgo(2, 9),
    topic: "Appointment availability",
    summary:
      "The caller asked about evening appointments. The conversation ended before the agent offered an alternative.",
    note:
      "Practice a warm transfer or callback offer when availability is limited.",
    reviewed: false,
    rubric: { greeting: 82, discovery: 70, resolution: 62, empathy: 70 },
  },
  {
    id: "CL-2043",
    caller: "Jamie Rivera",
    business: "Northstar Dental",
    agent: "Jordan Lee",
    outcome: "Booked",
    score: 94,
    durationSeconds: 321,
    timestamp: daysAgo(3, 15),
    topic: "Cleaning and check-up",
    summary:
      "The agent matched the caller with a convenient appointment and recapped the visit details before wrapping up.",
    note: "Great recap and a personable close.",
    reviewed: true,
    rubric: { greeting: 96, discovery: 93, resolution: 94, empathy: 93 },
  },
  {
    id: "CL-2042",
    caller: "Drew Foster",
    business: "Cedar Grove Plumbing",
    agent: "Casey Nguyen",
    outcome: "Follow-up",
    score: 74,
    durationSeconds: 376,
    timestamp: daysAgo(5, 13),
    topic: "Drain inspection",
    summary:
      "The agent identified the issue and explained the estimate process, but did not ask when the caller would be available.",
    note: "Offer a choice of arrival windows to make scheduling easier.",
    reviewed: false,
    rubric: { greeting: 78, discovery: 82, resolution: 68, empathy: 68 },
  },
  {
    id: "CL-2041",
    caller: "Quinn Parker",
    business: "Harborview Wellness",
    agent: "Avery Patel",
    outcome: "Booked",
    score: 91,
    durationSeconds: 305,
    timestamp: daysAgo(6, 10),
    topic: "Nutrition consultation",
    summary:
      "The agent answered questions about the first appointment and helped the caller choose a suitable time.",
    note: "Clear, supportive guidance from start to finish.",
    reviewed: true,
    rubric: { greeting: 92, discovery: 90, resolution: 91, empathy: 91 },
  },
];

export function filterDemoCalls(
  calls: DemoCall[],
  query = "",
  outcome: CallOutcome | "All outcomes" = "All outcomes"
): DemoCall[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return calls.filter((call) => {
    const matchesOutcome =
      outcome === "All outcomes" || call.outcome === outcome;
    const searchableText = [
      call.id,
      call.caller,
      call.business,
      call.agent,
      call.topic,
      call.summary,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return (
      matchesOutcome &&
      (!normalizedQuery || searchableText.includes(normalizedQuery))
    );
  });
}

export function summarizeDemoCalls(calls: DemoCall[]) {
  if (calls.length === 0) {
    return { total: 0, averageScore: 0, bookingRate: 0, coachingCount: 0 };
  }

  const scoreTotal = calls.reduce((total, call) => total + call.score, 0);
  const bookedCalls = calls.filter((call) => call.outcome === "Booked").length;
  const coachingCount = calls.filter((call) => call.score < 80).length;

  return {
    total: calls.length,
    averageScore: Math.round(scoreTotal / calls.length),
    bookingRate: Math.round((bookedCalls / calls.length) * 100),
    coachingCount,
  };
}
