import Vue from "vue";
import { VueReCaptcha } from "vue-recaptcha-v3";

const siteKey = process.env.recaptchaSiteKey;

if (siteKey) {
  Vue.use(VueReCaptcha, { siteKey });
}
