<template>
  <v-app class="showcase-shell">
    <v-navigation-drawer
      v-if="$route.path !== '/'"
      v-model="drawer"
      app
      width="252"
      class="showcase-drawer"
    >
      <nuxt-link to="/" class="shell-brand">
        <brand-mark />
        <span>{{ appName }}</span>
      </nuxt-link>

      <div class="shell-section-label">WORKSPACE</div>
      <v-list nav dense>
        <v-list-item
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          exact
          class="shell-nav-item"
        >
          <v-list-item-icon
            ><v-icon>{{ item.icon }}</v-icon></v-list-item-icon
          >
          <v-list-item-content>
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action v-if="item.count">
            <span class="shell-nav-count">{{ item.count }}</span>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <div class="shell-spacer"></div>
      <div class="shell-demo-note">
        <v-icon color="primary" small>mdi-sparkles</v-icon>
        <strong>Interactive portfolio demo</strong>
        <span>All workspace data is fictional and stays in this browser.</span>
      </div>
      <nuxt-link to="/profile" class="shell-user">
        <v-avatar color="primary" size="38"><span>JK</span></v-avatar>
        <span><strong>Jahid Khan</strong><small>Workspace profile</small></span>
        <v-icon small>mdi-chevron-right</v-icon>
      </nuxt-link>
    </v-navigation-drawer>

    <v-app-bar v-if="$route.path !== '/'" app flat class="showcase-toolbar">
      <v-app-bar-nav-icon
        class="mobile-menu-button"
        aria-label="Toggle navigation"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
      <v-spacer />
      <v-chip small color="green lighten-5" text-color="green darken-2">
        <span class="live-dot"></span> DEMO DATA
      </v-chip>
    </v-app-bar>

    <v-main
      class="showcase-main"
      :class="{ 'showcase-root-main': $route.path === '/' }"
    >
      <div v-if="$route.path !== '/'" class="showcase-content">
        <nuxt />
      </div>
      <nuxt v-else />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { demoCalls } from "~/utils/showcase";

export default Vue.extend({
  data() {
    return {
      drawer: true,
      appName: process.env.appName || "CallCraft",
      navigation: [
        { label: "Overview", to: "/", icon: "mdi-view-dashboard-outline" },
        {
          label: "Call reviews",
          to: "/calls",
          icon: "mdi-phone-outline",
          count: demoCalls.length,
        },
        { label: "Clients", to: "/clients", icon: "mdi-domain" },
        {
          label: "Insights & reports",
          to: "/reports/score-report",
          icon: "mdi-chart-box-outline",
        },
        { label: "Profile", to: "/profile", icon: "mdi-account-outline" },
      ],
    };
  },
  computed: {
    pageTitle(): string {
      const currentPath = this.$route.path;
      if (currentPath.startsWith("/call/")) return "Call review";
      if (currentPath === "/calls") return "Call reviews";
      if (currentPath === "/clients") return "Clients";
      if (currentPath === "/reports/score-report") return "Insights & reports";
      if (currentPath === "/profile") return "Workspace profile";
      if (currentPath === "/player") return "Call player";
      return this.appName;
    },
  },
});
</script>

<style lang="scss">
.showcase-shell {
  background: #f5f7fb;
  color: #17213a;
}

.showcase-drawer {
  border-right: 1px solid #e8ebf2 !important;
  padding: 18px 14px;
}

.shell-brand {
  align-items: center;
  color: #17213a !important;
  display: flex;
  font-size: 19px;
  font-weight: 750;
  gap: 10px;
  height: 50px;
  padding: 0 12px;
  text-decoration: none;
}

.shell-brand img {
  height: 34px;
  width: 34px;
}

.shell-section-label {
  color: #98a1b3;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  margin: 34px 12px 10px;
}

.shell-nav-item {
  border-radius: 9px;
  color: #69758b;
  margin: 3px 0;
  min-height: 45px;
}

.shell-nav-item .v-list-item__icon {
  margin-right: 12px !important;
}

.shell-nav-item.v-list-item--active {
  background: #edf2ff;
  color: #5263d5 !important;
}

.shell-nav-count {
  color: #7d899d;
  font-size: 11px;
  font-weight: 700;
}

.shell-spacer {
  height: calc(100vh - 500px);
  min-height: 30px;
}

.shell-demo-note {
  background: #f5f7fb;
  border: 1px solid #e8ebf2;
  border-radius: 12px;
  display: grid;
  gap: 8px;
  margin: 10px 4px 16px;
  padding: 15px;
}

.shell-demo-note strong {
  font-size: 12px;
}

.shell-demo-note span {
  color: #78849a;
  font-size: 11px;
  line-height: 1.5;
}

.shell-user {
  align-items: center;
  border-top: 1px solid #edf0f5;
  color: #17213a !important;
  display: flex;
  gap: 10px;
  padding: 15px 4px 2px;
  text-decoration: none;
}

.shell-user > span:nth-child(2) {
  display: grid;
  flex: 1;
  font-size: 12px;
  gap: 3px;
}

.shell-user small {
  color: #8893a6;
  font-size: 10px;
}

.showcase-toolbar {
  border-bottom: 1px solid #e8ebf2 !important;
  padding: 0 28px;
}

.showcase-toolbar .v-toolbar__title {
  color: #25304a;
  font-size: 15px;
  font-weight: 700;
}

.showcase-main {
  background: #f5f7fb;
}

.showcase-content {
  margin: 0 auto;
  max-width: 1440px;
  padding: 36px;
}

.showcase-root-main {
  padding-top: 0 !important;
}

.live-dot {
  background: #36b37e;
  border-radius: 50%;
  display: inline-block;
  height: 7px;
  margin-right: 7px;
  width: 7px;
}

.mobile-menu-button {
  display: none;
}

@media (max-width: 959px) {
  .showcase-content {
    padding: 24px;
  }

  .mobile-menu-button {
    display: inline-flex;
  }
}

@media (max-width: 600px) {
  .showcase-content {
    padding: 16px;
  }

  .showcase-toolbar {
    padding: 0 10px;
  }
}
</style>
