import { ContentScriptContext } from "wxt/client";
import App from "./App.vue";
import { createApp } from "vue";
import "./reset.css";

export default defineContentScript({
  // matches: ['*://x.com/**'],
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {

    console.log("Injecting script...");
    await injectScript("/injected.js", {
      keepInDom: true,
    });
    console.log("Done!");

    addProfileBtn();

    const ui = await defineOverlay(ctx);
    // Mount initially
    ui.mount();
    // Re-mount when page changes
    ctx.addEventListener(window, "wxt:locationchange", (event) => {
      ui.mount();
    });
  },
});

const addProfileBtn = () => {
  let href = ''
  let interval = 0
  const startInjectProfileBtnInterval = () => {
    console.log('====> startInjectProfileBtnInterval :')
    let intervalTimes = 1
    const maxInterverTimes = 4
    const intervalTimeSpan = 500
    interval = setInterval(() => {
      if (intervalTimes > maxInterverTimes) {
        console.log('====> startInjectProfileBtnInterval abortInject :', intervalTimes)
        clearInterval(interval)
        return
      }
      intervalTimes++

      // detect user profile website
      // const profileInTwitter = document.querySelector('[data-testid="UserProfileHeader_Items"]')
      // if (!profileInTwitter) return

      // const userUrl = document.querySelector('[data-testid="UserUrl"]')
      // console.log('====> userurl :', userUrl.innerText)

      // add a button


      clearInterval(interval)
    }, intervalTimeSpan)
  }

  // check href change interval
  setInterval(() => {
    if (href==='' || href !== location.href) {
      href = location.href
      if (interval) {
        console.log('====> clearInterval in setInterval :', interval)
        clearInterval(interval)
      }
      startInjectProfileBtnInterval()
    }
  }, 500)
}

function defineOverlay(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: "vue-overlay",
    position: "modal",
    zIndex: 99999,
    onMount(container, _shadow, shadowHost) {
      const app = createApp(App);
      app.mount(container);
      shadowHost.style.pointerEvents = "none";
      return app;
    },
    onRemove(app) {
      app?.unmount();
    },
  });
}
