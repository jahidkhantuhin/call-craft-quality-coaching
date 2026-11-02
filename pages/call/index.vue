<template>
  <showcase-workspace-page
    v-if="showcaseMode"
    view="call"
    :call-id="$route.query.id"
  />
  <v-card v-else>
    <v-card-title>Open a call from the call list</v-card-title>
    <v-card-actions><v-btn to="/calls">Go to calls</v-btn></v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import ShowcaseWorkspacePage from "~/components/showcase/WorkspacePage.vue";

export default Vue.extend({
  layout: process.env.showcaseMode ? "showcase" : "default",
  components: { ShowcaseWorkspacePage },
  data() {
    return { showcaseMode: Boolean(process.env.showcaseMode) };
  },
  head: {
    title: "Call review",
  },
});
</script>
