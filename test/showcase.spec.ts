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
});
