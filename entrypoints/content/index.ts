import { ContentScriptContext } from "wxt/client";
import App from "./App.vue";
import BuyButton from "./Button.vue";
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

    const ui = await defineBuy(ctx);
    // Mount initially
    ui.mount();
    // Re-mount when page changes
    ctx.addEventListener(window, "wxt:locationchange", (event) => {
      ui.mount();
    });
  },
});

/**
 *
 * @param shadowRootContainer - The HTML element that is the shadowRoot's parent
 * @param portalRoot - The HTML element that you want Modals to be teleported to
 * @returns
 */
function patchPortalRoot(
  shadowRootContainer: HTMLElement,
  portalRoot?: HTMLElement,
) {
  const elementById = Document.prototype.getElementById

  const element = portalRoot || shadowRootContainer.shadowRoot?.children[0]
  if (!element)
    return

  Document.prototype.getElementById = function (elementId: string) {
    if (elementId === 'headlessui-portal-root') {
      const d = document.createElement('div')
      d.id = 'headlessui-portal-root'
      element.appendChild(d)
      return d
    }
    return elementById.call(this, elementId)
  }

  const activeElementDescriptorGetter = Object.getOwnPropertyDescriptor(
    Document.prototype,
    'activeElement',
  )?.get

  Object.defineProperty(Document.prototype, 'activeElement', {
    get() {
      const activeElement = activeElementDescriptorGetter?.call(this)
      if (activeElement === shadowRootContainer)
        return shadowRootContainer.shadowRoot?.activeElement
    },
  })

  const targetGetter = Object.getOwnPropertyDescriptor(
    Event.prototype,
    'target',
  )?.get

  Object.defineProperty(Event.prototype, 'target', {
    get() {
      const target = targetGetter?.call(this)

      if (target === shadowRootContainer && this.path)
        return this.path[0]

      return target
    },
  })
}

const setupApp = app => {
  const tabId = ref('')
  app.provide('tabId', tabId)
}

function addProfileBtn() {
  let href = ''
  let interval = 1
  let __DEV__ = false
  console.log('====> startInjectProfileBtnInterval :')

  const container = document.createElement('div')
  container.id = `profile-url-buy-btn`
  const root = document.createElement('div')
  patchPortalRoot(container, root)
  const styleEl = document.createElement('link')
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  const app = createApp(BuyButton)
  setupApp(app)
  const profileId = ref('')
  app.provide('profileId', profileId)
  app.mount(root)

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

      const descInTwitter = document.querySelector('[data-testid="UserDescription"]')
      if (!descInTwitter) return

      const descText = descInTwitter.innerText
      const index = descText.indexOf('rwa-wallet.com')
      if (index === -1) return
      
      let nftId = descText.substr(index).replace('rwa-wallet.com/', '')
      nftId = nftId.split(' ')[0]
      // if (!nftId) return
      profileId.value = nftId
      console.log('====> descText, nftId :', descText, nftId)
      const usernameNode = document.querySelector('[data-testid="UserName"]')
      const avatarRowNode = usernameNode.previousSibling

      clearInterval(interval)

      const parentNode = avatarRowNode?.lastChild
      const firstChild = parentNode.firstChild
      parentNode.insertBefore(container, firstChild)
    }, intervalTimeSpan)
  }

  // check href change interval
  setInterval(() => {
    if (href==='' || href !== location.href) {
      href = location.href
      if (interval) {
        console.log('====> clearInterval in setInterval :', interval)
        profileId.value = ''
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

function defineBuy(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: "buy-button",
    position: "inline",
    zIndex: 99999,
    onMount(container, _shadow, shadowHost) {
      addProfileBtn(container, _shadow, shadowHost);
    },
    onRemove(app) {
      app.unmount();
    },
  });
}
