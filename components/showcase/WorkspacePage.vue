<template>
  <div class="workspace-page">
    <header class="workspace-heading">
      <div>
        <div class="workspace-eyebrow">{{ eyebrow }}</div>
        <h1>{{ heading }}</h1>
        <p>{{ description }}</p>
      </div>
      <nuxt-link
        v-if="view === 'calls' || view === 'clients'"
        class="workspace-primary-link"
        to="/reports/score-report"
      >
        <v-icon small color="white">mdi-chart-box-outline</v-icon>
        View insights
      </nuxt-link>
    </header>

    <template v-if="view === 'calls'">
      <section class="workspace-stats">
        <article class="workspace-stat">
          <span>Total conversations</span><strong>{{ calls.length }}</strong
          ><small>Across {{ clientSummaries.length }} demo clients</small>
        </article>
        <article class="workspace-stat">
          <span>Average quality score</span
          ><strong>{{ metrics.averageScore }}</strong
          ><small>Out of 100 points</small>
        </article>
        <article class="workspace-stat">
          <span>Needs coaching</span><strong>{{ metrics.coachingCount }}</strong
          ><small>Calls below an 80-point score</small>
        </article>
      </section>

      <section class="workspace-panel">
        <div class="workspace-toolbar">
          <label class="workspace-search">
            <v-icon small>mdi-magnify</v-icon>
            <input
              v-model="search"
              type="search"
              aria-label="Search calls"
              placeholder="Search caller, business, topic or agent"
              @input="page = 1"
            />
          </label>
          <select
            v-model="selectedBusiness"
            aria-label="Filter by client"
            @change="page = 1"
          >
            <option value="">All clients</option>
            <option v-for="client in clientSummaries" :key="client.name">
              {{ client.name }}
            </option>
          </select>
          <select
            v-model="outcome"
            aria-label="Filter by call outcome"
            @change="page = 1"
          >
            <option>All outcomes</option>
            <option>Booked</option>
            <option>Follow-up</option>
            <option>Resolved</option>
            <option>Missed</option>
          </select>
        </div>
        <div class="workspace-table-scroll">
          <table class="workspace-table">
            <thead>
              <tr>
                <th>CALLER</th>
                <th>CLIENT / AGENT</th>
                <th>OUTCOME</th>
                <th>SCORE</th>
                <th>WHEN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="call in visibleCalls" :key="call.id">
                <td>
                  <strong>{{ call.caller }}</strong
                  ><small
                    >{{ call.id }} ·
                    {{ formatDuration(call.durationSeconds) }}</small
                  >
                </td>
                <td>
                  <strong>{{ call.business }}</strong
                  ><small>with {{ call.agent }}</small>
                </td>
                <td>
                  <span class="workspace-outcome" :class="tone(call.outcome)">{{
                    call.outcome
                  }}</span>
                </td>
                <td>
                  <span
                    class="workspace-score"
                    :class="scoreTone(call.score)"
                    >{{ call.score }}</span
                  >
                </td>
                <td>{{ formatDate(call.timestamp) }}</td>
                <td>
                  <nuxt-link
                    class="workspace-row-link"
                    :to="`/call?id=${call.id}`"
                    :aria-label="`Open ${call.id} review`"
                    ><v-icon small>mdi-chevron-right</v-icon></nuxt-link
                  >
                </td>
              </tr>
              <tr v-if="visibleCalls.length === 0">
                <td colspan="6" class="workspace-empty">
                  No calls match these filters. Try a different search or
                  outcome.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="workspace-pagination">
          <span
            >Showing
            {{ filteredCalls.length ? (page - 1) * pageSize + 1 : 0 }}–{{
              Math.min(page * pageSize, filteredCalls.length)
            }}
            of {{ filteredCalls.length }} calls</span
          >
          <div>
            <button
              aria-label="Previous page"
              :disabled="page <= 1"
              @click="page--"
            >
              <v-icon small>mdi-chevron-left</v-icon>
            </button>
            <span>{{ page }} / {{ pageCount }}</span>
            <button
              aria-label="Next page"
              :disabled="page >= pageCount"
              @click="page++"
            >
              <v-icon small>mdi-chevron-right</v-icon>
            </button>
          </div>
        </div>
      </section>
    </template>

    <template v-else-if="view === 'clients'">
      <div class="client-layout">
        <section class="workspace-panel client-list">
          <div class="workspace-toolbar">
            <label class="workspace-search">
              <v-icon small>mdi-magnify</v-icon>
              <input
                v-model="search"
                type="search"
                aria-label="Search clients"
                placeholder="Find a client"
              />
            </label>
          </div>
          <button
            v-for="client in filteredClients"
            :key="client.name"
            class="client-choice"
            :class="{ selected: selectedBusiness === client.name }"
            @click="selectedBusiness = client.name"
          >
            <span class="client-avatar">{{ initials(client.name) }}</span>
            <span>
              <strong>{{ client.name }}</strong>
              <small>
                {{ client.calls.length }}
                {{
                  client.calls.length === 1 ? "conversation" : "conversations"
                }}
              </small>
            </span>
            <v-icon small>mdi-chevron-right</v-icon>
          </button>
          <div v-if="filteredClients.length === 0" class="workspace-empty">
            No clients match that search.
          </div>
        </section>

        <section class="workspace-panel client-detail">
          <template v-if="selectedClient">
            <div class="client-detail-heading">
              <span class="client-avatar large">{{
                initials(selectedClient.name)
              }}</span>
              <div>
                <div class="workspace-eyebrow">CLIENT OVERVIEW</div>
                <h2>{{ selectedClient.name }}</h2>
                <p>
                  Demo account · {{ selectedClient.calls.length }} conversations
                </p>
              </div>
            </div>
            <div class="workspace-stats compact-stats">
              <article class="workspace-stat">
                <span>Average score</span
                ><strong>{{ averageFor(selectedClient.calls) }}</strong>
              </article>
              <article class="workspace-stat">
                <span>Booked calls</span
                ><strong>{{ bookedFor(selectedClient.calls) }}</strong>
              </article>
            </div>
            <h3 class="workspace-subheading">Recent conversations</h3>
            <div class="client-calls">
              <nuxt-link
                v-for="call in selectedClient.calls"
                :key="call.id"
                :to="`/call?id=${call.id}`"
              >
                <span
                  ><strong>{{ call.topic }}</strong
                  ><small
                    >{{ call.caller }} · {{ formatDate(call.timestamp) }}</small
                  ></span
                >
                <span class="workspace-score" :class="scoreTone(call.score)">{{
                  call.score
                }}</span>
              </nuxt-link>
            </div>
            <nuxt-link
              class="workspace-text-link"
              :to="`/calls?business=${encodeURIComponent(selectedClient.name)}`"
              >Explore all call reviews
              <v-icon x-small>mdi-arrow-right</v-icon></nuxt-link
            >
          </template>
          <div v-else class="workspace-empty large-empty">
            Select a client to see its call history.
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="view === 'report'">
      <section class="workspace-stats">
        <article class="workspace-stat">
          <span>Calls in period</span><strong>{{ reportCalls.length }}</strong
          ><small>Based on synthetic sample records</small>
        </article>
        <article class="workspace-stat">
          <span>Average quality</span
          ><strong
            >{{ reportMetrics.averageScore
            }}<small class="stat-unit">/100</small></strong
          ><small>Across visible calls</small>
        </article>
        <article class="workspace-stat">
          <span>Booking rate</span
          ><strong
            >{{ reportMetrics.bookingRate
            }}<small class="stat-unit">%</small></strong
          ><small>Calls marked booked</small>
        </article>
        <article class="workspace-stat">
          <span>Coaching focus</span
          ><strong>{{ reportMetrics.coachingCount }}</strong
          ><small>Conversations scoring below 80</small>
        </article>
      </section>
      <section class="workspace-panel report-panel">
        <div class="workspace-panel-heading">
          <div>
            <h2>Call quality report</h2>
            <p>Review outcomes and quality scores for the selected period.</p>
          </div>
          <div class="report-actions">
            <select v-model.number="reportDays" aria-label="Report time period">
              <option :value="7">Last 7 days</option>
              <option :value="30">Last 30 days</option>
              <option :value="90">Last 90 days</option>
            </select>
            <button class="workspace-secondary-button" @click="exportReport">
              <v-icon small>mdi-download</v-icon> Export CSV
            </button>
          </div>
        </div>
        <div
          class="report-chart"
          role="img"
          aria-label="Quality score chart for recent calls"
        >
          <div
            v-for="(call, index) in chartCalls"
            :key="call.id"
            class="report-bar-column"
          >
            <span>{{ call.score }}</span>
            <div class="report-bar-track">
              <div
                class="report-bar"
                :style="{ height: `${call.score}%` }"
              ></div>
            </div>
            <small>{{ chartLabels[index] }}</small>
          </div>
        </div>
      </section>
      <section class="workspace-panel report-table-panel">
        <div class="workspace-panel-heading">
          <div>
            <h2>Conversation breakdown</h2>
            <p>Click a call to open its scoring detail.</p>
          </div>
        </div>
        <div class="workspace-table-scroll">
          <table class="workspace-table">
            <thead>
              <tr>
                <th>CALLER</th>
                <th>CLIENT</th>
                <th>OUTCOME</th>
                <th>SCORE</th>
                <th>REVIEW</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="call in reportCalls" :key="call.id">
                <td>
                  <strong>{{ call.caller }}</strong
                  ><small>{{ call.id }}</small>
                </td>
                <td>{{ call.business }}</td>
                <td>
                  <span class="workspace-outcome" :class="tone(call.outcome)">{{
                    call.outcome
                  }}</span>
                </td>
                <td>
                  <span
                    class="workspace-score"
                    :class="scoreTone(call.score)"
                    >{{ call.score }}</span
                  >
                </td>
                <td>{{ call.reviewed ? "Reviewed" : "Needs review" }}</td>
                <td>
                  <nuxt-link
                    class="workspace-row-link"
                    :to="`/call?id=${call.id}`"
                    :aria-label="`Open ${call.id} review`"
                    ><v-icon small>mdi-chevron-right</v-icon></nuxt-link
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <template v-else-if="view === 'profile'">
      <section class="profile-layout">
        <article class="workspace-panel profile-card">
          <div class="profile-banner"></div>
          <v-avatar color="primary" size="82" class="profile-avatar">{{
            initials(profile.name)
          }}</v-avatar>
          <div class="profile-card-body">
            <div class="workspace-eyebrow">SHOWCASE USER</div>
            <h2>{{ profile.name }}</h2>
            <p>{{ profile.role }}</p>
            <div class="profile-email">
              <v-icon small>mdi-email-outline</v-icon>{{ profile.email }}
            </div>
          </div>
        </article>
        <article class="workspace-panel profile-form">
          <div class="workspace-panel-heading">
            <div>
              <h2>Profile details</h2>
              <p>Changes are stored only in this browser.</p>
            </div>
          </div>
          <label
            >Full name<input v-model.trim="profile.name" autocomplete="name"
          /></label>
          <label
            >Email address<input
              v-model.trim="profile.email"
              type="email"
              autocomplete="email"
          /></label>
          <label>Role<input v-model.trim="profile.role" /></label>
          <div class="profile-save-row">
            <span v-if="notice" class="workspace-notice">{{ notice }}</span
            ><button class="workspace-primary-link" @click="saveProfile">
              Save profile
            </button>
          </div>
        </article>
      </section>
    </template>

    <template v-else-if="view === 'call'">
      <template v-if="activeCall">
        <div class="call-detail-toolbar">
          <nuxt-link to="/calls" class="workspace-text-link"
            ><v-icon small>mdi-arrow-left</v-icon> Back to calls</nuxt-link
          ><span class="workspace-outcome" :class="tone(activeCall.outcome)">{{
            activeCall.outcome
          }}</span>
        </div>
        <section class="workspace-panel call-detail-heading">
          <div>
            <div class="workspace-eyebrow">
              {{ activeCall.business }} · {{ activeCall.id }}
            </div>
            <h2>{{ activeCall.topic }}</h2>
            <p>
              {{ activeCall.caller }} spoke with {{ activeCall.agent }} ·
              {{ formatDate(activeCall.timestamp) }} ·
              {{ formatDuration(activeCall.durationSeconds) }}
            </p>
          </div>
          <div class="call-score-display" :class="scoreTone(updatedScore)">
            <strong>{{ updatedScore }}</strong
            ><small>/ 100</small>
          </div>
        </section>
        <div class="call-review-grid">
          <section class="workspace-panel rubric-editor">
            <div class="workspace-panel-heading">
              <div>
                <h2>Quality rubric</h2>
                <p>Adjust each dimension and save the review.</p>
              </div>
            </div>
            <label
              v-for="dimension in rubricDimensions"
              :key="dimension.key"
              class="rubric-slider"
            >
              <span
                ><strong>{{ dimension.label }}</strong
                ><b>{{ activeCall.rubric[dimension.key] }}%</b></span
              >
              <input
                v-model.number="activeCall.rubric[dimension.key]"
                type="range"
                min="0"
                max="100"
                step="1"
              />
            </label>
            <label class="coaching-note"
              >Coaching note<textarea
                v-model="activeCall.note"
                rows="4"
                maxlength="500"
              ></textarea>
            </label>
            <div class="profile-save-row">
              <span v-if="notice" class="workspace-notice">{{ notice }}</span
              ><button class="workspace-primary-link" @click="saveReview">
                <v-icon small color="white">mdi-check</v-icon> Save review
              </button>
            </div>
          </section>
          <aside class="workspace-panel transcript-panel">
            <div class="workspace-panel-heading">
              <div>
                <h2>Call context</h2>
                <p>Fictional demo transcript</p>
              </div>
            </div>
            <p class="call-summary">{{ activeCall.summary }}</p>
            <div class="transcript-line">
              <strong>{{ activeCall.caller }}</strong
              ><span
                >“I’m hoping you can help me figure out the best next
                step.”</span
              >
            </div>
            <div class="transcript-line agent">
              <strong>{{ activeCall.agent }}</strong
              ><span
                >“Absolutely. I’ll ask a couple of questions so I can find the
                right option for you.”</span
              >
            </div>
            <div class="transcript-line">
              <strong>{{ activeCall.caller }}</strong
              ><span>“That sounds good. What would you recommend?”</span>
            </div>
            <button
              class="workspace-secondary-button player-link"
              @click="$router.push(`/player?call_id=${activeCall.id}`)"
            >
              <v-icon small>mdi-play-circle-outline</v-icon> Open demo player
            </button>
            <small class="demo-disclaimer"
              >No real recording is attached to this sample call.</small
            >
          </aside>
        </div>
      </template>
      <section v-else class="workspace-panel unknown-call">
        <h2>Call not found</h2>
        <p>This sample call ID is not in the demo dataset.</p>
        <nuxt-link class="workspace-primary-link" to="/calls"
          >Return to call reviews</nuxt-link
        >
      </section>
    </template>

    <template v-else-if="view === 'player'">
      <section class="workspace-panel demo-player">
        <div class="player-orb">
          <v-icon color="white" x-large>mdi-headphones</v-icon>
        </div>
        <div class="workspace-eyebrow">CALL AUDIO PREVIEW</div>
        <h2>{{ activeCall ? activeCall.topic : "Sample conversation" }}</h2>
        <p>
          {{
            activeCall
              ? `${activeCall.caller} · ${activeCall.business}`
              : "Fictional CallCraft demo audio"
          }}
        </p>
        <div class="player-waveform" aria-label="Simulated audio timeline">
          <span
            v-for="(height, index) in waveform"
            :key="index"
            :class="{ played: index / waveform.length < progress / 100 }"
            :style="{ height: `${height}px` }"
          ></span>
        </div>
        <div class="player-time">
          <span>{{ formatDuration(Math.round(playhead)) }}</span
          ><span>{{
            formatDuration(activeCall ? activeCall.durationSeconds : 284)
          }}</span>
        </div>
        <div class="player-controls">
          <button aria-label="Rewind ten seconds" @click="skip(-10)">
            <v-icon>mdi-rewind</v-icon>
          </button>
          <button
            class="player-play"
            :aria-label="playing ? 'Pause preview' : 'Play preview'"
            @click="togglePlayback"
          >
            <v-icon color="white">{{
              playing ? "mdi-pause" : "mdi-play"
            }}</v-icon>
          </button>
          <button aria-label="Forward ten seconds" @click="skip(10)">
            <v-icon>mdi-fast-forward</v-icon>
          </button>
        </div>
        <span class="demo-disclaimer"
          >This is a playback-control preview. No real call recording is
          included.</span
        >
        <nuxt-link
          v-if="activeCall"
          class="workspace-text-link"
          :to="`/call?id=${activeCall.id}`"
          >Return to call review
          <v-icon x-small>mdi-arrow-right</v-icon></nuxt-link
        >
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { DemoCall, demoCalls, summarizeDemoCalls } from "~/utils/showcase";

type RubricKey = keyof DemoCall["rubric"];
type WorkspaceView =
  | "calls"
  | "clients"
  | "report"
  | "profile"
  | "call"
  | "player";

interface WorkspaceProps {
  view: WorkspaceView;
  callId: string;
}

interface ClientSummary {
  name: string;
  calls: DemoCall[];
}

interface WorkspaceProfile {
  name: string;
  email: string;
  role: string;
}

interface WorkspaceData {
  calls: DemoCall[];
  search: string;
  outcome: string;
  selectedBusiness: string;
  page: number;
  pageSize: number;
  reportDays: number;
  profile: WorkspaceProfile;
  notice: string;
  playing: boolean;
  playhead: number;
  playbackInterval: number | null;
  rubricDimensions: Array<{ key: RubricKey; label: string }>;
  waveform: number[];
}

interface WorkspaceComputed {
  eyebrow: string;
  heading: string;
  description: string;
  filteredCalls: DemoCall[];
  pageCount: number;
  visibleCalls: DemoCall[];
  metrics: ReturnType<typeof summarizeDemoCalls>;
  clientSummaries: ClientSummary[];
  filteredClients: ClientSummary[];
  selectedClient: ClientSummary | undefined;
  reportCalls: DemoCall[];
  reportMetrics: ReturnType<typeof summarizeDemoCalls>;
  chartCalls: DemoCall[];
  chartLabels: string[];
  activeCall: DemoCall | undefined;
  updatedScore: number;
  progress: number;
}

interface WorkspaceMethods {
  formatDate(value: string): string;
  formatDuration(seconds: number): string;
  initials(value: string): string;
  tone(outcome: string): string;
  scoreTone(score: number): string;
  averageFor(calls: DemoCall[]): number;
  bookedFor(calls: DemoCall[]): number;
  loadSavedState(): void;
  saveReview(): void;
  persistCalls(): boolean;
  saveProfile(): void;
  exportReport(): void;
  togglePlayback(): void;
  skip(seconds: number): void;
}

export default Vue.extend<
  WorkspaceData,
  WorkspaceMethods,
  WorkspaceComputed,
  WorkspaceProps
>({
  props: {
    view: {
      type: String as () => WorkspaceView,
      required: true,
    },
    callId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      calls: demoCalls,
      search: "",
      outcome: "All outcomes",
      selectedBusiness: "",
      page: 1,
      pageSize: 6,
      reportDays: 7,
      profile: {
        name: "Jahid Khan",
        email: "jahid.khan@example.com",
        role: "Senior Full-Stack Engineer",
      },
      notice: "",
      playing: false,
      playhead: 0,
      playbackInterval: null as number | null,
      rubricDimensions: [
        { key: "greeting" as RubricKey, label: "Professional greeting" },
        { key: "discovery" as RubricKey, label: "Needs discovery" },
        { key: "resolution" as RubricKey, label: "Resolution & next steps" },
        { key: "empathy" as RubricKey, label: "Empathy & rapport" },
      ],
      waveform: Array.from(
        { length: 64 },
        (_, index) => 10 + ((index * 19 + 13) % 31)
      ),
    };
  },
  computed: {
    eyebrow(): string {
      return {
        calls: "QUALITY WORKSPACE",
        clients: "ACCOUNT DIRECTORY",
        report: "PERFORMANCE ANALYTICS",
        profile: "YOUR WORKSPACE",
        call: "CALL REVIEW",
        player: "DEMO MEDIA",
      }[this.view];
    },
    heading(): string {
      return {
        calls: "Every conversation, in focus.",
        clients: "Know every customer better.",
        report: "Insights that move teams forward.",
        profile: "Your workspace profile.",
        call: "Review the conversation.",
        player: "Listen with the full context.",
      }[this.view];
    },
    description(): string {
      return {
        calls:
          "Explore recent calls, find a coaching moment, and open a review.",
        clients:
          "Browse fictional client accounts and the conversations behind them.",
        report:
          "A clear view of outcomes, quality trends, and coaching opportunities.",
        profile:
          "Edit your local demo profile. No changes are sent to a server.",
        call: "Explore a sample scorecard and adjust the coaching rubric.",
        player:
          "Try the player controls with a clearly labeled synthetic preview.",
      }[this.view];
    },
    filteredCalls(): DemoCall[] {
      const query = this.search.trim().toLocaleLowerCase();
      return this.calls.filter((call) => {
        const matchesOutcome =
          this.outcome === "All outcomes" || call.outcome === this.outcome;
        const matchesBusiness =
          !this.selectedBusiness || call.business === this.selectedBusiness;
        const searchable = [
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
          matchesBusiness &&
          (!query || searchable.includes(query))
        );
      });
    },
    pageCount(): number {
      return Math.max(1, Math.ceil(this.filteredCalls.length / this.pageSize));
    },
    visibleCalls(): DemoCall[] {
      const start = (this.page - 1) * this.pageSize;
      return this.filteredCalls.slice(start, start + this.pageSize);
    },
    metrics() {
      return summarizeDemoCalls(this.filteredCalls);
    },
    clientSummaries(): ClientSummary[] {
      return Array.from(new Set(this.calls.map((call) => call.business))).map(
        (name) => ({
          name,
          calls: this.calls
            .filter((call) => call.business === name)
            .sort(
              (left, right) =>
                new Date(right.timestamp).getTime() -
                new Date(left.timestamp).getTime()
            ),
        })
      );
    },
    filteredClients(): ClientSummary[] {
      const query = this.search.trim().toLocaleLowerCase();
      return this.clientSummaries.filter((client) =>
        client.name.toLocaleLowerCase().includes(query)
      );
    },
    selectedClient(): ClientSummary | undefined {
      return this.clientSummaries.find(
        (client) => client.name === this.selectedBusiness
      );
    },
    reportCalls(): DemoCall[] {
      const cutoff = Date.now() - this.reportDays * 24 * 60 * 60 * 1000;
      return this.calls
        .filter((call) => new Date(call.timestamp).getTime() >= cutoff)
        .sort(
          (left, right) =>
            new Date(right.timestamp).getTime() -
            new Date(left.timestamp).getTime()
        );
    },
    reportMetrics() {
      return summarizeDemoCalls(this.reportCalls);
    },
    chartCalls(): DemoCall[] {
      return [...this.reportCalls].slice(0, 7).reverse();
    },
    chartLabels(): string[] {
      return this.chartCalls.map((call) =>
        new Date(call.timestamp).toLocaleDateString(undefined, {
          weekday: "short",
        })
      );
    },
    activeCall(): DemoCall | undefined {
      const id = this.callId || (this.$route.params.id as string);
      return this.calls.find((call) => call.id === id);
    },
    updatedScore(): number {
      if (!this.activeCall) return 0;
      const rubric = this.activeCall.rubric;
      return Math.round(
        (rubric.greeting +
          rubric.discovery +
          rubric.resolution +
          rubric.empathy) /
          4
      );
    },
    progress(): number {
      const duration = this.activeCall ? this.activeCall.durationSeconds : 284;
      return Math.min(100, (this.playhead / duration) * 100);
    },
  },
  created() {
    this.loadSavedState();
    const businessFilter = this.$route.query.business;
    if (this.view === "calls" && typeof businessFilter === "string") {
      this.selectedBusiness = businessFilter;
    }
    if (this.view === "clients" && this.clientSummaries.length > 0) {
      this.selectedBusiness = this.clientSummaries[0].name;
    }
    if (this.activeCall) this.playhead = 0;
  },
  beforeDestroy() {
    if (this.playbackInterval !== null) {
      window.clearInterval(this.playbackInterval);
    }
  },
  methods: {
    formatDate(value: string): string {
      return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    },
    formatDuration(seconds: number): string {
      const minutes = Math.floor(seconds / 60);
      const remainder = seconds % 60;
      return `${minutes}:${String(remainder).padStart(2, "0")}`;
    },
    initials(value: string): string {
      return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    },
    tone(outcome: string): string {
      return outcome.toLocaleLowerCase().replace(/[^a-z]+/g, "-");
    },
    scoreTone(score: number): string {
      return score >= 90
        ? "score-high"
        : score >= 80
        ? "score-medium"
        : "score-low";
    },
    averageFor(calls: DemoCall[]): number {
      return calls.length
        ? Math.round(
            calls.reduce((total, call) => total + call.score, 0) / calls.length
          )
        : 0;
    },
    bookedFor(calls: DemoCall[]): number {
      return calls.filter((call) => call.outcome === "Booked").length;
    },
    loadSavedState(): void {
      if (typeof window === "undefined") return;
      try {
        const savedCalls = window.localStorage.getItem("call-lens-demo-calls");
        if (savedCalls) {
          const updates = JSON.parse(savedCalls) as Array<{
            id: string;
            score: number;
            rubric: DemoCall["rubric"];
            note: string;
            reviewed: boolean;
          }>;
          updates.forEach((update) => {
            const call = this.calls.find((item) => item.id === update.id);
            if (call) Object.assign(call, update);
          });
        }
        const savedProfile = window.localStorage.getItem(
          "call-lens-demo-profile"
        );
        if (savedProfile) {
          this.profile = {
            ...this.profile,
            ...(JSON.parse(savedProfile) as Partial<WorkspaceProfile>),
          };
        }
      } catch {
        this.notice = "Saved demo settings could not be loaded.";
      }
    },
    saveReview(): void {
      if (!this.activeCall) return;
      this.activeCall.score = this.updatedScore;
      this.activeCall.reviewed = true;
      if (this.persistCalls()) {
        this.notice = "Review saved in this browser.";
      }
    },
    persistCalls(): boolean {
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
        return true;
      } catch {
        this.notice =
          "The review changed for this session but could not be saved to browser storage.";
        return false;
      }
    },
    saveProfile(): void {
      if (
        !this.profile.name ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.profile.email)
      ) {
        this.notice = "Enter a name and a valid email address.";
        return;
      }
      try {
        window.localStorage.setItem(
          "call-lens-demo-profile",
          JSON.stringify(this.profile)
        );
        this.notice = "Profile saved in this browser.";
      } catch {
        this.notice = "The profile could not be saved to browser storage.";
      }
    },
    exportReport(): void {
      const rows = [
        [
          "Call ID",
          "Caller",
          "Client",
          "Agent",
          "Outcome",
          "Score",
          "Reviewed",
        ],
        ...this.reportCalls.map((call) => [
          call.id,
          call.caller,
          call.business,
          call.agent,
          call.outcome,
          String(call.score),
          call.reviewed ? "Yes" : "No",
        ]),
      ];
      const csv = rows
        .map((row) =>
          row.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")
        )
        .join("\r\n");
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "call-craft-quality-coaching-report.csv";
      link.click();
      URL.revokeObjectURL(url);
    },
    togglePlayback(): void {
      this.playing = !this.playing;
      if (this.playbackInterval !== null) {
        window.clearInterval(this.playbackInterval);
        this.playbackInterval = null;
      }
      if (this.playing) {
        this.playbackInterval = window.setInterval(() => {
          const duration = this.activeCall
            ? this.activeCall.durationSeconds
            : 284;
          if (this.playhead >= duration) {
            this.playing = false;
            if (this.playbackInterval !== null) {
              window.clearInterval(this.playbackInterval);
              this.playbackInterval = null;
            }
            return;
          }
          this.playhead += 1;
        }, 1000);
      }
    },
    skip(seconds: number): void {
      const duration = this.activeCall ? this.activeCall.durationSeconds : 284;
      this.playhead = Math.max(0, Math.min(duration, this.playhead + seconds));
    },
  },
});
</script>

<style lang="scss" scoped>
.workspace-page {
  color: #17213a;
}

.workspace-heading,
.workspace-panel-heading,
.workspace-toolbar,
.workspace-pagination,
.report-actions,
.profile-save-row,
.call-detail-toolbar,
.player-time,
.player-controls {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.workspace-heading {
  gap: 20px;
  margin-bottom: 26px;
}

.workspace-eyebrow {
  color: #8190a8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  margin-bottom: 8px;
}

.workspace-heading h1 {
  color: #192541;
  font-size: clamp(24px, 3vw, 33px);
  letter-spacing: -0.035em;
  line-height: 1.2;
  margin: 0;
}

.workspace-heading p,
.workspace-panel-heading p {
  color: #8691a3;
  font-size: 13px;
  margin: 8px 0 0;
}

.workspace-primary-link,
.workspace-secondary-button {
  align-items: center;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
  justify-content: center;
  min-height: 40px;
  padding: 0 15px;
  text-decoration: none !important;
  white-space: nowrap;
}

.workspace-primary-link {
  background: #5865d9;
  color: white !important;
}

.workspace-primary-link:hover {
  background: #4754c5;
}

.workspace-secondary-button {
  background: white;
  border: 1px solid #e1e6ef;
  color: #45516a;
}

.workspace-stats {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 20px;
}

.workspace-stat,
.workspace-panel {
  background: white;
  border: 1px solid #e9edf3;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(32, 52, 86, 0.035);
}

.workspace-stat {
  display: grid;
  gap: 9px;
  padding: 18px 20px;
}

.workspace-stat > span {
  color: #77839a;
  font-size: 12px;
}

.workspace-stat > strong {
  color: #263453;
  font-size: 27px;
  line-height: 1;
}

.workspace-stat > small {
  color: #9aa4b4;
  font-size: 10px;
}

.stat-unit {
  color: #9aa4b4 !important;
  font-size: 13px !important;
  font-weight: 500;
}

.workspace-panel {
  margin-bottom: 20px;
  overflow: hidden;
}

.workspace-toolbar {
  gap: 12px;
  padding: 18px 20px;
}

.workspace-search {
  align-items: center;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  color: #9aa4b4;
  display: flex;
  gap: 9px;
  max-width: 430px;
  min-height: 40px;
  padding: 0 12px;
  width: 100%;
}

.workspace-search input {
  border: 0;
  color: #293650;
  flex: 1;
  font-size: 12px;
  min-width: 0;
  outline: 0;
}

.workspace-toolbar select,
.report-actions select {
  background: #fff;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  color: #4b5870;
  font-size: 12px;
  min-height: 40px;
  padding: 0 12px;
}

.workspace-table-scroll {
  overflow-x: auto;
}

.workspace-table {
  border-collapse: collapse;
  min-width: 700px;
  width: 100%;
}

.workspace-table th {
  background: #f9fafc;
  color: #8b96a8;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 12px 18px;
  text-align: left;
  white-space: nowrap;
}

.workspace-table td {
  border-top: 1px solid #eff1f5;
  color: #59667d;
  font-size: 11px;
  padding: 13px 18px;
  white-space: nowrap;
}

.workspace-table td strong,
.workspace-table td small {
  display: block;
}

.workspace-table td strong {
  color: #2b3853;
  font-size: 11px;
  margin-bottom: 4px;
}

.workspace-table td small {
  color: #98a2b1;
  font-size: 10px;
}

.workspace-outcome,
.workspace-score {
  border-radius: 20px;
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 5px 9px;
}

.booked {
  background: #e8f7ef;
  color: #20885b;
}

.follow-up {
  background: #fff4dc;
  color: #a87314;
}

.resolved {
  background: #e9f2ff;
  color: #3974bd;
}

.missed {
  background: #fff0ef;
  color: #c15c53;
}

.score-high {
  background: #e8f7ef;
  color: #21865b;
}

.score-medium {
  background: #fff4dc;
  color: #a87314;
}

.score-low {
  background: #fff0ef;
  color: #c15c53;
}

.workspace-row-link {
  align-items: center;
  border: 1px solid #e9edf3;
  border-radius: 7px;
  color: #7d89a0 !important;
  display: inline-flex;
  height: 29px;
  justify-content: center;
  text-decoration: none !important;
  width: 29px;
}

.workspace-row-link:hover {
  background: #f1f3ff;
  color: #5865d9 !important;
}

.workspace-empty {
  color: #8792a4;
  font-size: 12px;
  padding: 30px;
  text-align: center;
}

.workspace-pagination {
  border-top: 1px solid #eff1f5;
  color: #8a95a7;
  font-size: 11px;
  padding: 13px 18px;
}

.workspace-pagination div {
  align-items: center;
  display: flex;
  gap: 12px;
}

.workspace-pagination button {
  background: white;
  border: 1px solid #e4e8ef;
  border-radius: 6px;
  color: #59667d;
  cursor: pointer;
  height: 29px;
  width: 29px;
}

.workspace-pagination button:disabled {
  cursor: default;
  opacity: 0.4;
}

.client-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(240px, 0.8fr) minmax(0, 1.8fr);
}

.client-list {
  padding-bottom: 8px;
}

.client-choice {
  align-items: center;
  background: white;
  border: 0;
  border-top: 1px solid #f0f2f6;
  color: #263453;
  cursor: pointer;
  display: flex;
  gap: 11px;
  padding: 14px 18px;
  text-align: left;
  width: 100%;
}

.client-choice.selected,
.client-choice:hover {
  background: #f5f6ff;
}

.client-choice > span:nth-child(2) {
  display: grid;
  flex: 1;
  gap: 5px;
}

.client-choice strong,
.client-calls strong {
  font-size: 11px;
}

.client-choice small,
.client-calls small {
  color: #8d98aa;
  font-size: 10px;
}

.client-avatar {
  align-items: center;
  background: #eef0ff;
  border-radius: 10px;
  color: #5965cc;
  display: inline-flex;
  flex: 0 0 38px;
  font-size: 11px;
  font-weight: 800;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.client-avatar.large {
  flex-basis: 54px;
  font-size: 14px;
  height: 54px;
  width: 54px;
}

.client-detail {
  padding: 23px;
}

.client-detail-heading {
  align-items: center;
  display: flex;
  gap: 15px;
  margin-bottom: 22px;
}

.client-detail-heading h2,
.workspace-panel-heading h2,
.profile-card h2,
.call-detail-heading h2,
.demo-player h2 {
  color: #25314c;
  font-size: 17px;
  margin: 0;
}

.client-detail-heading p {
  color: #8a95a7;
  font-size: 11px;
  margin: 6px 0 0;
}

.compact-stats {
  grid-template-columns: 1fr 1fr;
}

.compact-stats .workspace-stat {
  padding: 14px;
}

.compact-stats .workspace-stat > strong {
  font-size: 22px;
}

.workspace-subheading {
  color: #36435d;
  font-size: 12px;
  margin: 23px 0 10px;
}

.client-calls > a {
  align-items: center;
  border-top: 1px solid #eff1f5;
  color: #263453 !important;
  display: flex;
  justify-content: space-between;
  padding: 13px 3px;
  text-decoration: none !important;
}

.client-calls > a > span:first-child {
  display: grid;
  gap: 5px;
}

.workspace-text-link {
  color: #5865d9 !important;
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 5px;
  text-decoration: none !important;
}

.large-empty {
  padding: 90px 20px;
}

.report-panel,
.report-table-panel {
  padding: 21px;
}

.workspace-panel-heading {
  gap: 16px;
}

.report-actions {
  gap: 9px;
}

.report-chart {
  align-items: flex-end;
  border-bottom: 1px solid #e8ebf2;
  display: flex;
  gap: 18px;
  height: 235px;
  justify-content: space-around;
  margin-top: 25px;
  padding: 0 15px 0;
}

.report-bar-column {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
}

.report-bar-column > span {
  color: #8894a8;
  font-size: 10px;
}

.report-bar-track {
  align-items: flex-end;
  background: #f1f3f8;
  border-radius: 7px 7px 0 0;
  display: flex;
  height: 160px;
  max-width: 52px;
  overflow: hidden;
  width: 100%;
}

.report-bar {
  background: linear-gradient(180deg, #8b96fa, #5865d9);
  border-radius: 7px 7px 0 0;
  min-height: 12px;
  width: 100%;
}

.report-bar-column small {
  color: #909bae;
  font-size: 10px;
  padding-bottom: 10px;
}

.report-table-panel .workspace-panel-heading {
  margin-bottom: 16px;
}

.profile-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(250px, 0.8fr) minmax(0, 1.2fr);
}

.profile-card {
  min-height: 310px;
  overflow: hidden;
  position: relative;
}

.profile-banner {
  background: linear-gradient(115deg, #5865d9, #93a2ff);
  height: 112px;
}

.profile-avatar {
  border: 4px solid white;
  font-size: 20px;
  font-weight: 700;
  left: 22px;
  position: absolute;
  top: 72px;
}

.profile-card-body {
  padding: 58px 23px 23px;
}

.profile-card h2 {
  font-size: 20px;
  margin-bottom: 5px;
}

.profile-card p {
  color: #8a95a7;
  font-size: 11px;
  margin: 0 0 18px;
}

.profile-email {
  align-items: center;
  color: #657189;
  display: flex;
  font-size: 11px;
  gap: 9px;
}

.profile-form {
  padding: 23px;
}

.profile-form .workspace-panel-heading {
  margin-bottom: 19px;
}

.profile-form > label,
.coaching-note {
  color: #647087;
  display: grid;
  font-size: 11px;
  font-weight: 700;
  gap: 8px;
  margin-bottom: 17px;
}

.profile-form input,
.coaching-note textarea {
  background: white;
  border: 1px solid #e1e6ef;
  border-radius: 8px;
  color: #263453;
  font: inherit;
  font-weight: 400;
  outline: 0;
  padding: 11px 12px;
  width: 100%;
}

.profile-form input:focus,
.coaching-note textarea:focus {
  border-color: #6875e3;
  box-shadow: 0 0 0 3px rgba(88, 101, 217, 0.1);
}

.profile-save-row {
  gap: 10px;
  justify-content: flex-end;
  margin-top: 18px;
}

.workspace-notice {
  color: #29855f;
  font-size: 10px;
  margin-right: auto;
}

.call-detail-toolbar {
  margin-bottom: 15px;
}

.call-detail-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 23px;
}

.call-detail-heading h2 {
  font-size: 21px;
  margin-bottom: 8px;
}

.call-detail-heading p {
  color: #8390a4;
  font-size: 11px;
  margin: 0;
}

.call-score-display {
  align-items: baseline;
  border-radius: 14px;
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.call-score-display strong {
  font-size: 28px;
}

.call-score-display small {
  font-size: 10px;
}

.call-review-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
}

.rubric-editor,
.transcript-panel {
  padding: 22px;
}

.rubric-editor .workspace-panel-heading,
.transcript-panel .workspace-panel-heading {
  margin-bottom: 22px;
}

.rubric-slider {
  display: grid;
  gap: 9px;
  margin-bottom: 20px;
}

.rubric-slider > span {
  align-items: center;
  color: #5b6780;
  display: flex;
  font-size: 11px;
  justify-content: space-between;
}

.rubric-slider b {
  color: #5865d9;
}

.rubric-slider input {
  accent-color: #5865d9;
  width: 100%;
}

.coaching-note textarea {
  resize: vertical;
}

.call-summary {
  color: #67738a;
  font-size: 12px;
  line-height: 1.65;
  margin: 0 0 17px;
}

.transcript-line {
  border-left: 2px solid #dfe3f2;
  display: grid;
  gap: 5px;
  margin: 13px 0;
  padding-left: 12px;
}

.transcript-line.agent {
  border-color: #7882e4;
}

.transcript-line strong {
  color: #7e8ba0;
  font-size: 10px;
}

.transcript-line span {
  color: #49566f;
  font-size: 11px;
  line-height: 1.5;
}

.player-link {
  margin-top: 10px;
}

.demo-disclaimer {
  color: #9aa4b4;
  display: block;
  font-size: 9px;
  margin-top: 13px;
}

.unknown-call {
  padding: 30px;
}

.unknown-call h2 {
  margin-top: 0;
}

.unknown-call p {
  color: #7c8799;
  font-size: 12px;
}

.unknown-call .workspace-primary-link {
  margin-top: 8px;
}

.demo-player {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 20px auto;
  max-width: 670px;
  padding: 44px 30px 35px;
  text-align: center;
}

.player-orb {
  align-items: center;
  background: linear-gradient(140deg, #7884ed, #5260cc);
  border-radius: 50%;
  box-shadow: 0 12px 27px rgba(88, 101, 217, 0.22);
  display: flex;
  height: 82px;
  justify-content: center;
  margin-bottom: 24px;
  width: 82px;
}

.demo-player h2 {
  font-size: 21px;
}

.demo-player > p {
  color: #8792a5;
  font-size: 12px;
  margin: 8px 0 20px;
}

.player-waveform {
  align-items: center;
  display: flex;
  gap: 3px;
  height: 61px;
  justify-content: center;
  max-width: 510px;
  width: 100%;
}

.player-waveform span {
  background: #dfe3f1;
  border-radius: 3px;
  flex: 1;
  max-width: 6px;
}

.player-waveform span.played {
  background: #6874df;
}

.player-time {
  color: #8d98aa;
  font-size: 10px;
  max-width: 510px;
  width: 100%;
}

.player-controls {
  gap: 22px;
  justify-content: center;
  margin: 19px 0;
}

.player-controls button {
  align-items: center;
  background: transparent;
  border: 0;
  color: #66728a;
  cursor: pointer;
  display: flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.player-controls .player-play {
  background: #5865d9;
  border-radius: 50%;
  height: 52px;
  width: 52px;
}

.demo-player .demo-disclaimer {
  margin: 0 0 16px;
}

@media (max-width: 760px) {
  .workspace-stats {
    grid-template-columns: 1fr 1fr;
  }

  .client-layout,
  .profile-layout,
  .call-review-grid {
    grid-template-columns: 1fr;
  }

  .workspace-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .report-chart {
    gap: 8px;
    padding: 0;
  }
}

@media (max-width: 480px) {
  .workspace-stats {
    grid-template-columns: 1fr;
  }

  .workspace-toolbar,
  .report-actions,
  .workspace-panel-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .report-actions > * {
    width: 100%;
  }

  .workspace-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .call-detail-heading {
    align-items: flex-start;
    gap: 14px;
  }
}
</style>
