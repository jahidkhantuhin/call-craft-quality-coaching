<template>
  <div v-if="showcaseMode" class="showcase" @keydown.esc.window="closeReview">
    <aside class="sidebar">
      <a class="brand" href="/" aria-label="CallCraft overview">
        <brand-mark />
        <span>{{ appName }}</span>
      </a>

      <div class="nav-label">WORKSPACE</div>
      <button
        class="nav-item"
        :class="{ active: activeView === 'overview' }"
        @click="activeView = 'overview'"
      >
        <v-icon small>mdi-view-dashboard-outline</v-icon>
        Overview
      </button>
      <button
        class="nav-item"
        :class="{ active: activeView === 'calls' }"
        @click="activeView = 'calls'"
      >
        <v-icon small>mdi-phone-outline</v-icon>
        Call reviews
        <span class="nav-count">{{ calls.length }}</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: activeView === 'insights' }"
        @click="activeView = 'insights'"
      >
        <v-icon small>mdi-chart-box-outline</v-icon>
        Insights
      </button>
      <nuxt-link class="nav-item route-nav-item" to="/clients">
        <v-icon small>mdi-domain</v-icon>
        Clients
      </nuxt-link>
      <nuxt-link class="nav-item route-nav-item" to="/reports/score-report">
        <v-icon small>mdi-file-chart-outline</v-icon>
        Score report
      </nuxt-link>

      <div class="sidebar-spacer"></div>
      <div class="sidebar-note">
        <span class="note-icon"><v-icon small>mdi-sparkles</v-icon></span>
        <strong>Made for better conversations</strong>
        <p>Every review is a chance to help your team grow.</p>
      </div>
      <nuxt-link class="profile profile-link" to="/profile">
        <div class="avatar">JK</div>
        <div>
          <strong>Jahid Khan</strong>
          <span>Full-stack engineer</span>
        </div>
        <v-icon small>mdi-dots-horizontal</v-icon>
      </nuxt-link>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="breadcrumbs">
          Workspace <span>/</span>
          {{
            activeView === "overview"
              ? "Overview"
              : activeView === "calls"
              ? "Call reviews"
              : "Insights"
          }}
        </div>
        <div class="topbar-actions">
          <span class="demo-badge"><span></span> LIVE DEMO</span>
          <span class="today-label">{{ todayLabel }}</span>
        </div>
      </header>

      <div class="page-content">
        <section class="page-heading">
          <div>
            <div class="eyebrow">CALL QUALITY WORKSPACE</div>
            <h1>
              {{
                activeView === "insights"
                  ? "Insights that move teams forward."
                  : activeView === "calls"
                  ? "Every conversation, in focus."
                  : "Let's make every call count."
              }}
            </h1>
            <p>
              {{
                activeView === "insights"
                  ? "See what is working and where a little coaching can make a big difference."
                  : activeView === "calls"
                  ? "Review recent conversations and turn great moments into repeatable habits."
                  : "A clearer view of your team's conversations, quality, and next best actions."
              }}
            </p>
          </div>
          <button class="primary-button" @click="activeView = 'calls'">
            <v-icon small color="white">mdi-headphones</v-icon>
            Review calls
          </button>
        </section>

        <section class="metric-grid" aria-label="Call quality summary">
          <article class="metric-card">
            <div class="metric-label">
              Calls reviewed
              <span class="metric-icon violet"
                ><v-icon small>mdi-phone-check-outline</v-icon></span
              >
            </div>
            <div class="metric-value">
              {{ metrics.total }} <span class="metric-trend">this week</span>
            </div>
            <div class="metric-foot">
              <span class="trend-up">↑ 12%</span> <span>vs. last week</span>
            </div>
          </article>
          <article class="metric-card">
            <div class="metric-label">
              Average quality score
              <span class="metric-icon mint"
                ><v-icon small>mdi-star-outline</v-icon></span
              >
            </div>
            <div class="metric-value">
              {{ metrics.averageScore }}<small>/100</small>
            </div>
            <div class="metric-foot">
              <span class="trend-up">↑ 4.8 pts</span> <span>vs. last week</span>
            </div>
          </article>
          <article class="metric-card">
            <div class="metric-label">
              Booking rate
              <span class="metric-icon amber"
                ><v-icon small>mdi-calendar-check-outline</v-icon></span
              >
            </div>
            <div class="metric-value">
              {{ metrics.bookingRate }}<small>%</small>
            </div>
            <div class="metric-foot">
              <span class="trend-up">↑ 6.2%</span> <span>vs. last week</span>
            </div>
          </article>
          <article class="metric-card">
            <div class="metric-label">
              Coaching opportunities
              <span class="metric-icon coral"
                ><v-icon small>mdi-lightbulb-on-outline</v-icon></span
              >
            </div>
            <div class="metric-value">
              {{ metrics.coachingCount
              }}<span class="metric-trend">to revisit</span>
            </div>
            <div class="metric-foot">
              <span class="trend-neutral">A chance to grow</span>
            </div>
          </article>
        </section>

        <section v-if="activeView === 'insights'" class="insights-grid">
          <article class="panel trend-panel">
            <div class="panel-heading">
              <div>
                <h2>Quality score trend</h2>
                <p>Average call score by day</p>
              </div>
              <span class="panel-pill">Last 7 days</span>
            </div>
            <div
              class="chart"
              role="img"
              aria-label="Average daily call quality scores for the last seven days"
            >
              <div
                v-for="day in weeklyTrend"
                :key="day.label"
                class="chart-column"
              >
                <span class="chart-score">{{ day.score || "—" }}</span>
                <div class="chart-track">
                  <div class="chart-bar" :style="{ height: day.height }"></div>
                </div>
                <span class="chart-label">{{ day.label }}</span>
              </div>
            </div>
          </article>
          <article class="panel rubric-panel">
            <div class="panel-heading">
              <div>
                <h2>Team strengths</h2>
                <p>Average rubric score</p>
              </div>
            </div>
            <div
              v-for="item in rubricSummary"
              :key="item.label"
              class="rubric-row"
            >
              <div class="rubric-meta">
                <span>{{ item.label }}</span
                ><strong>{{ item.score }}%</strong>
              </div>
              <div class="rubric-track">
                <div :style="{ width: `${item.score}%` }"></div>
              </div>
            </div>
            <div class="insight-callout">
              <v-icon small color="primary">mdi-lightbulb-on-outline</v-icon
              ><span
                ><strong>Coaching focus</strong> Build more consistent follow-up
                plans at the close of each call.</span
              >
            </div>
          </article>
        </section>

        <section v-else-if="activeView === 'overview'" class="overview-grid">
          <article class="panel calls-panel">
            <div class="panel-heading">
              <div>
                <h2>Recent calls</h2>
                <p>A snapshot of your latest quality reviews</p>
              </div>
              <button class="text-button" @click="activeView = 'calls'">
                View all <v-icon x-small>mdi-arrow-right</v-icon>
              </button>
            </div>
            <div class="table-toolbar">
              <label class="search-box">
                <v-icon small>mdi-magnify</v-icon>
                <input
                  v-model="searchQuery"
                  type="search"
                  placeholder="Search calls, clients, or agents"
                  aria-label="Search calls"
                />
              </label>
              <select
                v-model="selectedOutcome"
                aria-label="Filter calls by outcome"
                class="outcome-select"
              >
                <option>All outcomes</option>
                <option>Booked</option>
                <option>Follow-up</option>
                <option>Resolved</option>
                <option>Missed</option>
              </select>
            </div>
            <div class="table-scroll">
              <table class="calls-table">
                <thead>
                  <tr>
                    <th>CALLER</th>
                    <th>CLIENT</th>
                    <th>OUTCOME</th>
                    <th>SCORE</th>
                    <th>DATE</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="call in pageCalls"
                    :key="call.id"
                    tabindex="0"
                    @click="openReview(call)"
                    @keydown.enter="openReview(call)"
                  >
                    <td>
                      <div class="caller-cell">
                        <span
                          class="caller-avatar"
                          :class="avatarTone(call.id)"
                          >{{ initials(call.caller) }}</span
                        ><span
                          ><strong>{{ call.caller }}</strong
                          ><small
                            >{{ call.id }} ·
                            {{ formatDuration(call.durationSeconds) }}</small
                          ></span
                        >
                      </div>
                    </td>
                    <td>
                      <span class="client-cell">{{ call.business }}</span
                      ><small class="agent-name">with {{ call.agent }}</small>
                    </td>
                    <td>
                      <span class="outcome" :class="outcomeTone(call.outcome)"
                        ><i></i>{{ call.outcome }}</span
                      >
                    </td>
                    <td>
                      <span class="score-pill" :class="scoreTone(call.score)">{{
                        call.score
                      }}</span>
                    </td>
                    <td class="date-cell">{{ formatDate(call.timestamp) }}</td>
                    <td>
                      <button
                        class="row-action"
                        :aria-label="`Review call ${call.id}`"
                        @click.stop="openReview(call)"
                      >
                        <v-icon small>mdi-chevron-right</v-icon>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="pageCalls.length === 0">
                    <td colspan="6" class="empty-state">
                      No calls match your search. Try another name or outcome.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="table-footer">
              <span
                >Showing
                {{ pageCalls.length ? (page - 1) * pageSize + 1 : 0 }}–{{
                  Math.min(page * pageSize, filteredCalls.length)
                }}
                of {{ filteredCalls.length }} calls</span
              >
              <div class="pagination">
                <button
                  aria-label="Previous page"
                  :disabled="page <= 1"
                  @click="page--"
                >
                  <v-icon small>mdi-chevron-left</v-icon></button
                ><span>{{ page }} / {{ pageCount }}</span
                ><button
                  aria-label="Next page"
                  :disabled="page >= pageCount"
                  @click="page++"
                >
                  <v-icon small>mdi-chevron-right</v-icon>
                </button>
              </div>
            </div>
          </article>

          <aside class="panel trend-panel overview-trend">
            <div class="panel-heading">
              <div>
                <h2>Quality this week</h2>
                <p>Your team's daily average</p>
              </div>
              <span class="trend-tag">↑ 4.8%</span>
            </div>
            <div
              class="chart compact-chart"
              role="img"
              aria-label="Daily average quality score for the last seven days"
            >
              <div
                v-for="day in weeklyTrend"
                :key="day.label"
                class="chart-column"
              >
                <span class="chart-score">{{ day.score || "—" }}</span>
                <div class="chart-track">
                  <div class="chart-bar" :style="{ height: day.height }"></div>
                </div>
                <span class="chart-label">{{ day.label }}</span>
              </div>
            </div>
            <div class="chart-legend"><span></span> Average quality score</div>
            <div class="coaching-card">
              <span class="coaching-icon"
                ><v-icon small>mdi-lightbulb-on-outline</v-icon></span
              >
              <div>
                <strong>One small next step</strong>
                <p>Make the next step clear before each conversation ends.</p>
              </div>
            </div>
          </aside>
        </section>

        <section v-else class="panel full-calls-panel">
          <div class="panel-heading">
            <div>
              <h2>Call review queue</h2>
              <p>
                Search, filter, and open a review to explore the scoring rubric.
              </p>
            </div>
            <span class="panel-pill">Synthetic demo data</span>
          </div>
          <div class="table-toolbar">
            <label class="search-box"
              ><v-icon small>mdi-magnify</v-icon
              ><input
                v-model="searchQuery"
                type="search"
                placeholder="Search calls, clients, or agents"
                aria-label="Search calls"
            /></label>
            <select
              v-model="selectedOutcome"
              aria-label="Filter calls by outcome"
              class="outcome-select"
            >
              <option>All outcomes</option>
              <option>Booked</option>
              <option>Follow-up</option>
              <option>Resolved</option>
              <option>Missed</option>
            </select>
          </div>
          <div class="table-scroll">
            <table class="calls-table">
              <thead>
                <tr>
                  <th>CALLER</th>
                  <th>CLIENT</th>
                  <th>OUTCOME</th>
                  <th>SCORE</th>
                  <th>DATE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="call in pageCalls"
                  :key="call.id"
                  tabindex="0"
                  @click="openReview(call)"
                  @keydown.enter="openReview(call)"
                >
                  <td>
                    <div class="caller-cell">
                      <span
                        class="caller-avatar"
                        :class="avatarTone(call.id)"
                        >{{ initials(call.caller) }}</span
                      ><span
                        ><strong>{{ call.caller }}</strong
                        ><small
                          >{{ call.id }} ·
                          {{ formatDuration(call.durationSeconds) }}</small
                        ></span
                      >
                    </div>
                  </td>
                  <td>
                    <span class="client-cell">{{ call.business }}</span
                    ><small class="agent-name">with {{ call.agent }}</small>
                  </td>
                  <td>
                    <span class="outcome" :class="outcomeTone(call.outcome)"
                      ><i></i>{{ call.outcome }}</span
                    >
                  </td>
                  <td>
                    <span class="score-pill" :class="scoreTone(call.score)">{{
                      call.score
                    }}</span>
                  </td>
                  <td class="date-cell">{{ formatDate(call.timestamp) }}</td>
                  <td>
                    <button
                      class="row-action"
                      :aria-label="`Review call ${call.id}`"
                      @click.stop="openReview(call)"
                    >
                      <v-icon small>mdi-chevron-right</v-icon>
                    </button>
                  </td>
                </tr>
                <tr v-if="pageCalls.length === 0">
                  <td colspan="6" class="empty-state">
                    No calls match your search. Try another name or outcome.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span
              >Showing {{ pageCalls.length ? (page - 1) * pageSize + 1 : 0 }}–{{
                Math.min(page * pageSize, filteredCalls.length)
              }}
              of {{ filteredCalls.length }} calls</span
            >
            <div class="pagination">
              <button
                aria-label="Previous page"
                :disabled="page <= 1"
                @click="page--"
              >
                <v-icon small>mdi-chevron-left</v-icon></button
              ><span>{{ page }} / {{ pageCount }}</span
              ><button
                aria-label="Next page"
                :disabled="page >= pageCount"
                @click="page++"
              >
                <v-icon small>mdi-chevron-right</v-icon>
              </button>
            </div>
          </div>
        </section>

        <footer class="page-footer">
          <span
            >CallCraft <span class="footer-dot">·</span> Quality scoring and coaching
            clear.</span
          ><span
            >Portfolio showcase by Jahid Khan
            <span class="footer-dot">·</span> Demo records are fictional</span
          >
        </footer>
      </div>
    </main>

    <div v-if="selectedCall" class="modal-backdrop" @click.self="closeReview">
      <section
        class="review-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'review-title'"
      >
        <header class="dialog-header">
          <div>
            <span class="eyebrow">CALL REVIEW · {{ selectedCall.id }}</span>
            <h2 id="review-title">{{ selectedCall.topic }}</h2>
          </div>
          <button
            class="close-button"
            aria-label="Close review"
            @click="closeReview"
          >
            <v-icon>mdi-close</v-icon>
          </button>
        </header>
        <div class="dialog-summary">
          <div
            class="caller-avatar dialog-avatar"
            :class="avatarTone(selectedCall.id)"
          >
            {{ initials(selectedCall.caller) }}
          </div>
          <div>
            <strong>{{ selectedCall.caller }}</strong
            ><span
              >{{ selectedCall.business }} ·
              {{ formatDate(selectedCall.timestamp) }}</span
            >
          </div>
          <span class="score-pill" :class="scoreTone(selectedCall.score)"
            >{{ selectedCall.score }}<small> / 100</small></span
          >
        </div>
        <div class="recording-preview">
          <button
            type="button"
            class="play-icon"
            aria-label="Open simulated player controls"
            @click="$router.push(`/player?call_id=${selectedCall.id}`)"
          >
            <v-icon color="white">mdi-play</v-icon>
          </button>
          <div class="recording-wave" aria-hidden="true">
            <i
              v-for="bar in 40"
              :key="bar"
              :style="{ height: `${18 + ((bar * 17) % 46)}%` }"
            ></i>
          </div>
          <span>{{ formatDuration(selectedCall.durationSeconds) }}</span>
          <p>
            Open the simulated player controls; no real recording is included.
          </p>
        </div>
        <p class="call-summary">{{ selectedCall.summary }}</p>
        <div class="rubric-editor">
          <div class="rubric-editor-heading">
            <strong>Quality score</strong><span>{{ draftScore }} / 100</span>
          </div>
          <label
            v-for="item in rubricFields"
            :key="item.key"
            class="slider-row"
          >
            <span
              >{{ item.label
              }}<strong>{{ draftRubric[item.key] }}%</strong></span
            >
            <input
              v-model.number="draftRubric[item.key]"
              type="range"
              min="0"
              max="100"
              :aria-label="item.label"
            />
          </label>
        </div>
        <label class="note-label" for="coach-note">Coaching note</label>
        <textarea
          id="coach-note"
          v-model="draftNote"
          rows="3"
          placeholder="Add a constructive note for the next coaching conversation…"
        ></textarea>
        <div class="dialog-footer">
          <span
            :class="selectedCall.reviewed ? 'reviewed-state' : 'pending-state'"
            ><v-icon x-small>{{
              selectedCall.reviewed ? "mdi-check-circle" : "mdi-clock-outline"
            }}</v-icon
            >{{ selectedCall.reviewed ? "Reviewed" : "Needs review" }}</span
          >
          <button class="primary-button" @click="saveReview">
            <v-icon small color="white">mdi-check</v-icon> Save review
          </button>
        </div>
      </section>
    </div>

    <transition name="toast"
      ><div v-if="notice" class="notice-toast">
        <v-icon small color="white">mdi-check-circle</v-icon>{{ notice }}
      </div></transition
    >
  </div>

  <v-container v-else>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title
            >Welcome back
            {{
              authenticatedUser &&
              `${authenticatedUser.first_name} ${authenticatedUser.last_name}`
            }}</v-card-title
          >
          <v-card-text>What do you want to do next?</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-btn
          to="/calls"
          v-if="$store.getters['users/isAllowed']('view calls')"
          >Calls</v-btn
        >
        <v-btn
          to="/clients"
          v-if="$store.getters['users/isAllowed']('view clients')"
          >Clients</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import {
  CallOutcome,
  CallRubric,
  DemoCall,
  demoCalls,
  filterDemoCalls,
  summarizeDemoCalls,
} from "~/utils/showcase";

const rubricFields: Array<{ key: keyof CallRubric; label: string }> = [
  { key: "greeting", label: "Opening & greeting" },
  { key: "discovery", label: "Needs discovery" },
  { key: "resolution", label: "Resolution" },
  { key: "empathy", label: "Empathy & rapport" },
];

interface ShowcaseData {
  appName: string;
  showcaseMode: boolean;
  activeView: string;
  calls: DemoCall[];
  searchQuery: string;
  selectedOutcome: CallOutcome | "All outcomes";
  page: number;
  pageSize: number;
  selectedCall: DemoCall | null;
  draftRubric: CallRubric;
  draftNote: string;
  rubricFields: Array<{ key: keyof CallRubric; label: string }>;
  notice: string;
  noticeTimer: number;
}

interface ShowcaseComputed {
  authenticatedUser: { first_name?: string; last_name?: string } | null;
  todayLabel: string;
  filteredCalls: DemoCall[];
  pageCount: number;
  pageCalls: DemoCall[];
  metrics: {
    total: number;
    averageScore: number;
    bookingRate: number;
    coachingCount: number;
  };
  weeklyTrend: Array<{ label: string; score: number; height: string }>;
  rubricSummary: Array<{ label: string; score: number }>;
  draftScore: number;
}

interface ShowcaseMethods {
  initials(name: string): string;
  avatarTone(id: string): string;
  outcomeTone(outcome: CallOutcome): string;
  scoreTone(score: number): string;
  formatDuration(seconds: number): string;
  formatDate(timestamp: string): string;
  openReview(call: DemoCall): void;
  closeReview(): void;
  saveReview(): void;
}

export default Vue.extend<ShowcaseData, ShowcaseMethods, ShowcaseComputed>({
  layout: process.env.showcaseMode ? "showcase" : "default",
  head() {
    return { title: "Call quality workspace" };
  },
  data() {
    return {
      appName: process.env.appName || "CallCraft",
      showcaseMode: Boolean(process.env.showcaseMode),
      activeView: "overview",
      calls: demoCalls.map((call) => ({ ...call, rubric: { ...call.rubric } })),
      searchQuery: "",
      selectedOutcome: "All outcomes" as CallOutcome | "All outcomes",
      page: 1,
      pageSize: 5,
      selectedCall: null as DemoCall | null,
      draftRubric: {
        greeting: 0,
        discovery: 0,
        resolution: 0,
        empathy: 0,
      } as CallRubric,
      draftNote: "",
      rubricFields,
      notice: "",
      noticeTimer: 0 as any,
    };
  },
  computed: {
    authenticatedUser(): { first_name?: string; last_name?: string } | null {
      return this.$auth.user as {
        first_name?: string;
        last_name?: string;
      } | null;
    },
    todayLabel(): string {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    },
    filteredCalls(): DemoCall[] {
      return filterDemoCalls(
        this.calls,
        this.searchQuery,
        this.selectedOutcome
      );
    },
    pageCount(): number {
      return Math.max(1, Math.ceil(this.filteredCalls.length / this.pageSize));
    },
    pageCalls(): DemoCall[] {
      return this.filteredCalls.slice(
        (this.page - 1) * this.pageSize,
        this.page * this.pageSize
      );
    },
    metrics() {
      return summarizeDemoCalls(this.calls);
    },
    weeklyTrend(): Array<{ label: string; score: number; height: string }> {
      return Array.from({ length: 7 }, (_value, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const dailyCalls = this.calls.filter((call) => {
          const time = new Date(call.timestamp).getTime();
          return time >= date.getTime() && time < nextDay.getTime();
        });
        const score = dailyCalls.length
          ? Math.round(
              dailyCalls.reduce((total, call) => total + call.score, 0) /
                dailyCalls.length
            )
          : 0;

        return {
          label: date.toLocaleDateString("en-US", { weekday: "short" }),
          score,
          height: `${Math.max(score, 5)}%`,
        };
      });
    },
    rubricSummary(): Array<{ label: string; score: number }> {
      return this.rubricFields.map((field) => ({
        label: field.label,
        score: this.calls.length
          ? Math.round(
              this.calls.reduce(
                (total, call) => total + call.rubric[field.key],
                0
              ) / this.calls.length
            )
          : 0,
      }));
    },
    draftScore(): number {
      const values = Object.values(this.draftRubric);
      return Math.round(
        values.reduce((total, value) => total + value, 0) / values.length
      );
    },
  },
  watch: {
    searchQuery() {
      this.page = 1;
    },
    selectedOutcome() {
      this.page = 1;
    },
    pageCount(value: number) {
      if (this.page > value) this.page = value;
    },
  },
  methods: {
    initials(name: string): string {
      return name
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("");
    },
    avatarTone(id: string): string {
      const tones = ["tone-violet", "tone-mint", "tone-amber", "tone-blue"];
      const number = Number(id.replace(/\D/g, ""));
      return tones[number % tones.length];
    },
    outcomeTone(outcome: CallOutcome): string {
      return `outcome-${outcome.toLowerCase().replace("-", "")}`;
    },
    scoreTone(score: number): string {
      return score >= 90
        ? "score-high"
        : score >= 80
        ? "score-mid"
        : "score-low";
    },
    formatDuration(seconds: number): string {
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(
        2,
        "0"
      )}`;
    },
    formatDate(timestamp: string): string {
      return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    },
    openReview(call: DemoCall) {
      this.selectedCall = call;
      this.draftRubric = { ...call.rubric };
      this.draftNote = call.note;
    },
    closeReview() {
      this.selectedCall = null;
    },
    saveReview() {
      if (!this.selectedCall) return;
      const callIndex = this.calls.findIndex(
        (call) => call.id === this.selectedCall!.id
      );
      if (callIndex < 0) return;

      const updatedCall = {
        ...this.calls[callIndex],
        rubric: { ...this.draftRubric },
        score: this.draftScore,
        note: this.draftNote.trim(),
        reviewed: true,
      };
      this.$set(this.calls, callIndex, updatedCall);
      let storageSaved = false;
      try {
        window.localStorage.setItem(
          "call-lens-demo-calls",
          JSON.stringify(
            this.calls.map(({ id, score, rubric, note, reviewed }) => ({
              id,
              score,
              rubric,
              note,
              reviewed,
            }))
          )
        );
        storageSaved = true;
      } catch {
        storageSaved = false;
      }
      this.closeReview();
      this.notice = storageSaved
        ? "Review saved in this browser"
        : "Review updated for this session; browser storage is unavailable.";
      window.clearTimeout(this.noticeTimer);
      this.noticeTimer = window.setTimeout(() => {
        this.notice = "";
      }, 3200);
    },
  },
  created() {
    try {
      const saved = window.localStorage.getItem("call-lens-demo-calls");
      if (!saved) return;
      const updates = JSON.parse(saved) as DemoCall[];
      updates.forEach((update) => {
        const index = this.calls.findIndex((call) => call.id === update.id);
        if (index >= 0) {
          this.$set(this.calls, index, {
            ...this.calls[index],
            ...update,
            rubric: { ...this.calls[index].rubric, ...update.rubric },
          });
        }
      });
    } catch {
      this.notice = "Saved demo reviews could not be loaded.";
    }
  },
  beforeDestroy() {
    window.clearTimeout(this.noticeTimer);
  },
});
</script>

<style lang="scss" scoped>
.showcase {
  --ink: #17213a;
  --muted: #78829a;
  --line: #edf0f6;
  --surface: #fff;
  --canvas: #f7f8fc;
  --violet: #6758e8;
  display: flex;
  min-height: 100vh;
  background: var(--canvas);
  color: var(--ink);
  font-family: Inter, "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
}
.sidebar {
  background: #121b31;
  color: #b6bfd1;
  display: flex;
  flex: 0 0 250px;
  flex-direction: column;
  min-height: 100vh;
  padding: 27px 17px 18px;
}
.brand {
  align-items: center;
  color: white;
  display: flex;
  font-size: 19px;
  font-weight: 750;
  gap: 11px;
  letter-spacing: -0.5px;
  margin: 0 0 53px 8px;
  text-decoration: none;
}
.brand-mark {
  height: 38px;
  width: 38px;
}
.nav-label,
.eyebrow {
  color: #969db1;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.25px;
}
.nav-label {
  margin: 0 12px 12px;
}
.nav-item {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 9px;
  color: #aab4ca;
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: 12px;
  margin: 2px 0;
  min-height: 44px;
  padding: 0 12px;
  text-align: left;
  transition: background 0.18s, color 0.18s;
  width: 100%;
}

.route-nav-item {
  text-decoration: none;
}

.profile-link {
  color: inherit;
  text-decoration: none;
}
.nav-item:hover {
  background: #1b2742;
  color: white;
}
.nav-item .v-icon {
  color: currentColor !important;
  flex: 0 0 20px;
  width: 20px;
}
.nav-item.active {
  background: #292e50;
  color: #fff;
}
.nav-item.active .v-icon {
  color: #a89cff;
}
.nav-count {
  background: #293650;
  border-radius: 20px;
  color: #c5cde0;
  font-size: 11px;
  margin-left: auto;
  padding: 3px 8px;
}
.sidebar-spacer {
  flex: 1;
  min-height: 80px;
}
.sidebar-note {
  background: linear-gradient(140deg, #212b49, #1a2841);
  border: 1px solid #2a3551;
  border-radius: 12px;
  margin: 0 1px 21px;
  padding: 15px 13px 13px;
}
.note-icon,
.coaching-icon {
  align-items: center;
  background: #39365e;
  border-radius: 9px;
  color: #b9aaff;
  display: inline-flex;
  height: 31px;
  justify-content: center;
  margin-bottom: 12px;
  width: 31px;
}
.sidebar-note strong {
  color: #eff1f8;
  display: block;
  font-size: 12px;
}
.sidebar-note p {
  color: #a4aec1;
  font-size: 11px;
  line-height: 1.55;
  margin: 7px 0 0;
}
.profile {
  align-items: center;
  border-top: 1px solid #28334a;
  display: flex;
  gap: 10px;
  padding: 17px 1px 0;
}
.avatar,
.caller-avatar {
  align-items: center;
  border-radius: 50%;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 750;
  height: 35px;
  justify-content: center;
  width: 35px;
}
.avatar {
  background: #d7d1ff;
  color: #5143b5;
}
.profile strong,
.profile span {
  display: block;
}
.profile strong {
  color: #f5f6fa;
  font-size: 12px;
}
.profile span {
  color: #8e9ab1;
  font-size: 10px;
  margin-top: 3px;
}
.profile > .v-icon {
  color: #8190aa;
  margin-left: auto;
}
.main-content {
  flex: 1;
  min-width: 0;
}
.topbar {
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid var(--line);
  display: flex;
  height: 67px;
  justify-content: space-between;
  padding: 0 clamp(20px, 4vw, 55px);
}
.breadcrumbs {
  color: #303b54;
  font-size: 12px;
  font-weight: 650;
}
.breadcrumbs span {
  color: #bac0ce;
  margin: 0 9px;
}
.topbar-actions {
  align-items: center;
  display: flex;
  gap: 22px;
}
.demo-badge {
  align-items: center;
  background: #e8f8f2;
  border-radius: 20px;
  color: #238a6d;
  display: inline-flex;
  font-size: 9px;
  font-weight: 800;
  gap: 7px;
  letter-spacing: 0.75px;
  padding: 7px 10px;
}
.demo-badge span {
  background: #38bf91;
  border-radius: 50%;
  height: 6px;
  width: 6px;
}
.today-label {
  color: #8992a6;
  font-size: 11px;
}
.page-content {
  margin: 0 auto;
  max-width: 1470px;
  padding: 34px clamp(20px, 4vw, 55px) 20px;
}
.page-heading {
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin-bottom: 26px;
}
.page-heading .eyebrow {
  color: var(--violet);
  margin-bottom: 10px;
}
.page-heading h1 {
  color: var(--ink);
  font-size: clamp(24px, 2.5vw, 32px);
  font-weight: 730;
  letter-spacing: -1.05px;
  line-height: 1.2;
  margin: 0;
}
.page-heading p {
  color: var(--muted);
  font-size: 13px;
  margin: 10px 0 0;
}
.primary-button {
  align-items: center;
  background: linear-gradient(110deg, #6d5ce8, #594bd0);
  border: 0;
  border-radius: 8px;
  box-shadow: 0 5px 13px #6758e82b;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  gap: 8px;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  transition: box-shadow 0.18s, transform 0.18s;
  white-space: nowrap;
}
.primary-button:hover {
  box-shadow: 0 8px 18px #6758e84a;
  transform: translateY(-1px);
}
.metric-grid {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 19px;
}
.metric-card,
.panel {
  background: var(--surface);
  border: 1px solid #edf0f5;
  border-radius: 12px;
  box-shadow: 0 2px 8px #19224405;
}
.metric-card {
  min-height: 133px;
  padding: 17px 17px 14px;
}
.metric-label {
  align-items: center;
  color: #778198;
  display: flex;
  font-size: 11px;
  font-weight: 600;
  justify-content: space-between;
}
.metric-icon {
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  width: 30px;
}
.metric-icon.violet {
  background: #f0edff;
  color: #7162e5;
}
.metric-icon.mint {
  background: #e8f8f3;
  color: #29a883;
}
.metric-icon.amber {
  background: #fff5e3;
  color: #d99528;
}
.metric-icon.coral {
  background: #fff0ed;
  color: #db7966;
}
.metric-value {
  color: var(--ink);
  font-size: 27px;
  font-weight: 750;
  letter-spacing: -0.8px;
  line-height: 1;
  margin: 13px 0 10px;
}
.metric-value small {
  color: #9aa2b3;
  font-size: 13px;
  font-weight: 600;
  margin-left: 3px;
}
.metric-trend {
  color: #99a1b1;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0;
  margin-left: 6px;
}
.metric-foot {
  align-items: center;
  color: #9aa1b1;
  display: flex;
  font-size: 10px;
  gap: 6px;
}
.trend-up {
  color: #269d78;
  font-weight: 700;
}
.trend-neutral {
  color: #9d7c34;
  font-weight: 600;
}
.overview-grid {
  align-items: flex-start;
  display: grid;
  gap: 17px;
  grid-template-columns: minmax(0, 1.85fr) minmax(260px, 0.9fr);
}
.panel {
  min-width: 0;
  padding: 20px 19px 0;
}
.panel-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 17px;
}
.panel-heading h2 {
  color: var(--ink);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
  margin: 0;
}
.panel-heading p {
  color: #939bad;
  font-size: 10px;
  margin: 5px 0 0;
}
.text-button {
  background: transparent;
  border: 0;
  color: var(--violet);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 650;
}
.panel-pill {
  background: #f5f6fa;
  border-radius: 20px;
  color: #818a9e;
  font-size: 9px;
  font-weight: 650;
  padding: 7px 10px;
}
.table-toolbar {
  align-items: center;
  border-top: 1px solid #f1f2f6;
  display: flex;
  gap: 10px;
  padding: 12px 0;
}
.search-box {
  align-items: center;
  background: #fafbfc;
  border: 1px solid #eceef3;
  border-radius: 7px;
  color: #9aa1b0;
  display: flex;
  flex: 1;
  gap: 7px;
  min-width: 120px;
  padding: 0 9px;
}
.search-box input {
  background: transparent;
  border: 0;
  color: var(--ink);
  font: inherit;
  font-size: 10px;
  height: 34px;
  min-width: 0;
  outline: 0;
  width: 100%;
}
.search-box input::placeholder {
  color: #a3aaba;
}
.outcome-select {
  background: #fff;
  border: 1px solid #eceef3;
  border-radius: 7px;
  color: #677187;
  font: inherit;
  font-size: 10px;
  height: 36px;
  max-width: 130px;
  padding: 0 8px;
}
.table-scroll {
  overflow-x: auto;
}
.calls-table {
  border-collapse: collapse;
  min-width: 620px;
  text-align: left;
  width: 100%;
}
.calls-table thead {
  background: #fafbfc;
}
.calls-table th {
  color: #9ba3b2;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 0.8px;
  padding: 10px 9px;
}
.calls-table td {
  border-bottom: 1px solid #f1f2f6;
  color: #4a556d;
  font-size: 10px;
  padding: 10px 9px;
}
.calls-table tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}
.calls-table tbody tr:hover {
  background: #fafaff;
}
.calls-table tbody tr:focus-visible {
  outline: 2px solid #8277ef;
  outline-offset: -2px;
}
.caller-cell {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 135px;
}
.caller-cell strong,
.caller-cell small {
  display: block;
}
.caller-cell strong,
.client-cell {
  color: #303b54;
  font-size: 10px;
  font-weight: 650;
}
.caller-cell small,
.agent-name {
  color: #9da4b2;
  display: block;
  font-size: 9px;
  margin-top: 4px;
  white-space: nowrap;
}
.caller-avatar {
  height: 29px;
  width: 29px;
}
.tone-violet {
  background: #eeeaff;
  color: #6558c6;
}
.tone-mint {
  background: #e4f6ef;
  color: #278b6c;
}
.tone-amber {
  background: #fff2dd;
  color: #b87d22;
}
.tone-blue {
  background: #e8f0ff;
  color: #4774bf;
}
.outcome {
  align-items: center;
  border-radius: 20px;
  display: inline-flex;
  font-size: 9px;
  font-weight: 650;
  gap: 5px;
  padding: 5px 8px;
  white-space: nowrap;
}
.outcome i {
  border-radius: 50%;
  height: 5px;
  width: 5px;
}
.outcome-booked {
  background: #e9f8f1;
  color: #258664;
}
.outcome-booked i {
  background: #30ad80;
}
.outcome-followup {
  background: #fff5e4;
  color: #a87720;
}
.outcome-followup i {
  background: #e5a944;
}
.outcome-resolved {
  background: #eef3ff;
  color: #5372ba;
}
.outcome-resolved i {
  background: #6b8bd4;
}
.outcome-missed {
  background: #fff0ed;
  color: #bd6a5a;
}
.outcome-missed i {
  background: #df8372;
}
.score-pill {
  background: #f3f5f8;
  border-radius: 7px;
  display: inline-block;
  font-size: 10px;
  font-weight: 750;
  min-width: 34px;
  padding: 6px 7px;
  text-align: center;
}
.score-high {
  background: #eaf8f1;
  color: #248665;
}
.score-mid {
  background: #fff6e8;
  color: #a87822;
}
.score-low {
  background: #fff0ed;
  color: #bd6a5a;
}
.date-cell {
  color: #828b9e !important;
  white-space: nowrap;
}
.row-action {
  align-items: center;
  background: #fff;
  border: 1px solid #eceef3;
  border-radius: 6px;
  color: #8992a5;
  cursor: pointer;
  display: inline-flex;
  height: 25px;
  justify-content: center;
  width: 25px;
}
.row-action:hover {
  border-color: #c9c4fa;
  color: var(--violet);
}
.empty-state {
  color: #8992a5 !important;
  padding: 32px 12px !important;
  text-align: center;
}
.table-footer {
  align-items: center;
  color: #939bad;
  display: flex;
  font-size: 9px;
  justify-content: space-between;
  min-height: 47px;
}
.pagination {
  align-items: center;
  display: flex;
  gap: 8px;
}
.pagination button {
  align-items: center;
  background: white;
  border: 1px solid #eceef3;
  border-radius: 5px;
  color: #707b91;
  cursor: pointer;
  display: inline-flex;
  height: 25px;
  justify-content: center;
  width: 25px;
}
.pagination button:disabled {
  color: #c3c8d2;
  cursor: default;
}
.overview-trend {
  padding-bottom: 18px;
}
.trend-tag {
  background: #e8f8f2;
  border-radius: 20px;
  color: #268766;
  font-size: 9px;
  font-weight: 700;
  padding: 6px 8px;
}
.chart {
  align-items: flex-end;
  display: flex;
  gap: 10px;
  height: 215px;
  justify-content: space-around;
  padding: 12px 5px 0;
}
.compact-chart {
  height: 165px;
  gap: 6px;
  padding-top: 3px;
}
.chart-column {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
  max-width: 48px;
}
.chart-score {
  color: #929bad;
  font-size: 9px;
  height: 16px;
}
.chart-track {
  align-items: flex-end;
  background: #f6f5ff;
  border-radius: 7px 7px 2px 2px;
  display: flex;
  height: calc(100% - 39px);
  justify-content: center;
  overflow: hidden;
  width: 100%;
}
.chart-bar {
  background: linear-gradient(180deg, #9287f4, #6658df);
  border-radius: 6px 6px 2px 2px;
  min-height: 4px;
  transition: height 0.3s ease;
  width: 65%;
}
.chart-label {
  color: #9199aa;
  font-size: 9px;
  margin-top: 7px;
}
.chart-legend {
  align-items: center;
  color: #8d96a8;
  display: flex;
  font-size: 9px;
  gap: 7px;
  margin-top: 11px;
}
.chart-legend span {
  background: #7669e5;
  border-radius: 50%;
  height: 7px;
  width: 7px;
}
.coaching-card {
  align-items: flex-start;
  background: #f8f7ff;
  border: 1px solid #efedff;
  border-radius: 9px;
  display: flex;
  gap: 10px;
  margin-top: 19px;
  padding: 12px 10px;
}
.coaching-icon {
  background: #eeebff;
  color: #6f62df;
  flex: 0 0 auto;
  height: 27px;
  margin: 0;
  width: 27px;
}
.coaching-card strong {
  color: #3a3b59;
  display: block;
  font-size: 10px;
}
.coaching-card p {
  color: #81869e;
  font-size: 9px;
  line-height: 1.5;
  margin: 5px 0 0;
}
.insights-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.3fr) minmax(300px, 0.9fr);
}
.trend-panel,
.rubric-panel {
  padding-bottom: 20px;
}
.rubric-panel {
  padding-top: 20px;
}
.rubric-row {
  margin: 22px 0;
}
.rubric-meta {
  color: #667087;
  display: flex;
  font-size: 11px;
  justify-content: space-between;
  margin-bottom: 8px;
}
.rubric-meta strong {
  color: #364159;
}
.rubric-track {
  background: #f0f1f7;
  border-radius: 10px;
  height: 7px;
  overflow: hidden;
}
.rubric-track div {
  background: linear-gradient(90deg, #7568e9, #9b91f2);
  border-radius: 10px;
  height: 100%;
  transition: width 0.25s;
}
.insight-callout {
  align-items: flex-start;
  background: #f8f7ff;
  border-radius: 8px;
  color: #737992;
  display: flex;
  font-size: 10px;
  gap: 9px;
  line-height: 1.6;
  margin-top: 25px;
  padding: 12px;
}
.insight-callout strong {
  color: #4d4a7a;
  display: block;
}
.full-calls-panel {
  padding-bottom: 1px;
}
.page-footer {
  align-items: center;
  color: #9aa2b1;
  display: flex;
  font-size: 9px;
  justify-content: space-between;
  padding: 20px 1px 5px;
}
.footer-dot {
  color: #c8cbd5;
  margin: 0 4px;
}
.modal-backdrop {
  align-items: center;
  background: #10172ac2;
  display: flex;
  inset: 0;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  position: fixed;
  z-index: 20;
}
.review-dialog {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 25px 80px #11162d47;
  max-width: 620px;
  padding: 23px 25px 18px;
  width: 100%;
}
.dialog-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
}
.dialog-header .eyebrow {
  color: #7668e4;
  font-size: 9px;
}
.dialog-header h2 {
  color: var(--ink);
  font-size: 20px;
  letter-spacing: -0.5px;
  margin: 7px 0 0;
}
.close-button {
  align-items: center;
  background: #f5f6f9;
  border: 0;
  border-radius: 50%;
  color: #788198;
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
}
.dialog-summary {
  align-items: center;
  border-bottom: 1px solid var(--line);
  display: flex;
  gap: 10px;
  padding: 16px 0;
}
.dialog-avatar {
  height: 37px;
  width: 37px;
}
.dialog-summary strong,
.dialog-summary span:not(.score-pill) {
  display: block;
}
.dialog-summary strong {
  color: #333e56;
  font-size: 12px;
}
.dialog-summary div:nth-child(2) span {
  color: #929bad;
  font-size: 10px;
  margin-top: 4px;
}
.dialog-summary .score-pill {
  margin-left: auto;
}
.score-pill small {
  font-size: 8px;
  font-weight: 600;
}
.recording-preview {
  align-items: center;
  background: linear-gradient(110deg, #f8f7ff, #f4f8fc);
  border: 1px solid #eeeff7;
  border-radius: 10px;
  display: flex;
  gap: 10px;
  margin: 16px 0 12px;
  min-height: 69px;
  padding: 11px;
}
.play-icon {
  align-items: center;
  background: #7063e2;
  border: 0;
  border-radius: 50%;
  display: flex;
  flex: 0 0 auto;
  height: 34px;
  justify-content: center;
  padding: 0;
  width: 34px;
  cursor: pointer;
}
.recording-wave {
  align-items: center;
  display: flex;
  flex: 1;
  gap: 2px;
  height: 36px;
  justify-content: center;
  overflow: hidden;
}
.recording-wave i {
  background: #bbb5f2;
  border-radius: 4px;
  min-height: 4px;
  width: 3px;
}
.recording-preview > span {
  color: #69738a;
  font-size: 9px;
  white-space: nowrap;
}
.recording-preview p {
  color: #969eb0;
  font-size: 8px;
  margin: 0;
}
.call-summary {
  color: #727d92;
  font-size: 11px;
  line-height: 1.65;
  margin: 12px 0 18px;
}
.rubric-editor {
  background: #fafbfe;
  border: 1px solid #f0f1f5;
  border-radius: 9px;
  padding: 14px 14px 9px;
}
.rubric-editor-heading {
  color: #364159;
  display: flex;
  font-size: 11px;
  justify-content: space-between;
  margin-bottom: 13px;
}
.rubric-editor-heading span {
  color: #665ad1;
  font-weight: 750;
}
.slider-row {
  display: block;
  margin: 10px 0;
}
.slider-row > span {
  color: #69748a;
  display: flex;
  font-size: 10px;
  justify-content: space-between;
}
.slider-row strong {
  color: #48536a;
}
.slider-row input {
  accent-color: #6b5fe1;
  display: block;
  height: 15px;
  margin: 4px 0 0;
  width: 100%;
}
.note-label {
  color: #505b71;
  display: block;
  font-size: 10px;
  font-weight: 700;
  margin: 15px 0 7px;
}
.review-dialog textarea {
  border: 1px solid #e8eaf0;
  border-radius: 8px;
  color: #4c5870;
  font: inherit;
  font-size: 10px;
  line-height: 1.5;
  outline: 0;
  padding: 10px;
  resize: vertical;
  width: 100%;
}
.review-dialog textarea:focus {
  border-color: #9a90ed;
  box-shadow: 0 0 0 3px #8174e51b;
}
.dialog-footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
}
.dialog-footer > span {
  align-items: center;
  display: flex;
  font-size: 10px;
  gap: 5px;
}
.reviewed-state {
  color: #278765;
}
.pending-state {
  color: #a27a2d;
}
.notice-toast {
  align-items: center;
  background: #1a2941;
  border-radius: 9px;
  bottom: 25px;
  box-shadow: 0 8px 25px #10172a36;
  color: #fff;
  display: flex;
  font-size: 11px;
  gap: 8px;
  padding: 12px 16px;
  position: fixed;
  right: 25px;
  z-index: 30;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.toast-enter,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 1100px) {
  .sidebar {
    flex-basis: 210px;
  }
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .overview-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .overview-trend {
    display: none;
  }
}
@media (max-width: 700px) {
  .showcase {
    display: block;
  }
  .sidebar {
    align-items: center;
    flex-direction: row;
    min-height: auto;
    padding: 10px 15px;
    position: sticky;
    top: 0;
    z-index: 5;
  }
  .brand {
    font-size: 16px;
    margin: 0 auto 0 0;
  }
  .brand-mark {
    height: 33px;
    width: 33px;
  }
  .nav-label,
  .sidebar-spacer,
  .sidebar-note,
  .profile {
    display: none;
  }
  .nav-item {
    border-radius: 8px;
    font-size: 0;
    gap: 0;
    justify-content: center;
    margin: 0 2px;
    min-height: 38px;
    padding: 0;
    width: 39px;
  }
  .nav-item .v-icon {
    font-size: 20px;
  }
  .nav-count {
    display: none;
  }
  .topbar {
    height: 52px;
    padding: 0 17px;
  }
  .today-label {
    display: none;
  }
  .page-content {
    padding: 25px 15px 18px;
  }
  .page-heading {
    align-items: flex-start;
    gap: 12px;
  }
  .page-heading h1 {
    font-size: 24px;
  }
  .page-heading p {
    font-size: 11px;
    line-height: 1.5;
    max-width: 440px;
  }
  .page-heading .primary-button {
    font-size: 0;
    min-height: 38px;
    padding: 0 11px;
  }
  .page-heading .primary-button .v-icon {
    margin: 0;
  }
  .metric-grid {
    gap: 9px;
  }
  .metric-card {
    min-height: 120px;
    padding: 13px 12px;
  }
  .metric-label {
    font-size: 9px;
    gap: 4px;
  }
  .metric-icon {
    height: 25px;
    width: 25px;
  }
  .metric-value {
    font-size: 23px;
  }
  .panel {
    padding-left: 12px;
    padding-right: 12px;
  }
  .table-toolbar {
    flex-wrap: wrap;
  }
  .search-box {
    flex-basis: 100%;
  }
  .outcome-select {
    max-width: none;
    width: 100%;
  }
  .page-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }
  .insights-grid {
    grid-template-columns: 1fr;
  }
  .review-dialog {
    padding: 18px 15px 14px;
  }
  .recording-preview {
    gap: 7px;
  }
  .recording-preview p {
    display: none;
  }
  .modal-backdrop {
    align-items: flex-start;
    padding: 10px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
