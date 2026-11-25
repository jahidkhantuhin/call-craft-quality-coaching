import {
  demoCalls,
  filterDemoCalls,
  summarizeDemoCalls,
} from "../utils/showcase";

describe("CallCraft Quality Coaching showcase data", () => {
  test("provides realistic synthetic records for the local demo", () => {
    expect(demoCalls).toHaveLength(8);
    expect(
      demoCalls.every((call) => call.id && call.summary && call.rubric)
    ).toBe(true);
  });

  test("filters by outcome and case-insensitive search", () => {
    expect(filterDemoCalls(demoCalls, "", "Booked")).toHaveLength(4);
    expect(filterDemoCalls(demoCalls, "northstar")).toHaveLength(2);
    expect(filterDemoCalls(demoCalls, "  CL-2047  ")[0].caller).toBe(
      "Taylor Brooks"
    );
  });

  test("summarizes scores and returns safe zero values for no results", () => {
    expect(summarizeDemoCalls(demoCalls)).toEqual({
      total: 8,
      averageScore: 86,
      bookingRate: 50,
      coachingCount: 3,
    });
    expect(summarizeDemoCalls([])).toEqual({
      total: 0,
      averageScore: 0,
      bookingRate: 0,
      coachingCount: 0,
    });
  });

  test("combines the search and outcome filters without changing the queue", () => {
    const originalIds = demoCalls.map((call) => call.id);

    expect(
      filterDemoCalls(demoCalls, "jordan lee", "Booked").map((call) => call.id)
    ).toEqual(["CL-2043"]);
    expect(filterDemoCalls(demoCalls, "CL-2047", "Booked")).toEqual([]);
    expect(filterDemoCalls(demoCalls, "no matching conversation")).toEqual([]);
    expect(demoCalls.map((call) => call.id)).toEqual(originalIds);
  });

  test("counts scores below 80 for coaching and rounds summary rates", () => {
    const [booked, followUp, anotherCall] = demoCalls;
    const calls = [
      { ...booked, score: 79 },
      { ...followUp, score: 80 },
      { ...anotherCall, outcome: followUp.outcome, score: 81 },
    ];

    expect(summarizeDemoCalls(calls)).toEqual({
      total: 3,
      averageScore: 80,
      bookingRate: 33,
      coachingCount: 1,
    });
  });
});
