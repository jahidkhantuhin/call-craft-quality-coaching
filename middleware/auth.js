export default function ({ redirect, store }) {
  if (process.env.showcaseMode) return;

  const isAuthenticated = store.getters["users/isAuthenticated"] ? true : false;
  if (!isAuthenticated) {
    redirect({ path: "/login" });
  }
}
