<template>
  <showcase-workspace-page
    v-if="showcaseMode"
    view="call"
    :call-id="$route.params.id"
  />
  <div v-else>
    <CallScore
      v-if="$store.getters['calls/callLoadFailed'] === false"
    ></CallScore>
    <v-card v-else>
      <v-card-title> Call load failed. </v-card-title>
      <v-card-text>
        Something went wrong while loading rated call detail.
      </v-card-text>
      <v-card-actions>
        <v-btn to="/calls"> Go back to calls </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import CallScore from "~/components/Call/Index.vue";
import ShowcaseWorkspacePage from "~/components/showcase/WorkspacePage.vue";
export default Vue.extend({
  name: "call-score",
  layout: process.env.showcaseMode ? "showcase" : "default",
  middleware: "auth",
  components: {
    CallScore,
    ShowcaseWorkspacePage,
  },
  data() {
    return { showcaseMode: Boolean(process.env.showcaseMode) };
  },
  beforeMount() {
    if (this.showcaseMode) return;
    this.$store.commit("calls/setCallLoadFailed", false);
  },
  mounted() {
    if (this.showcaseMode) return;
    this.$store.commit("setPageTitle", "Score Call");
  },
});
</script>
