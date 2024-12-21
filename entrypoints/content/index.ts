import { ContentScriptContext } from "wxt/client";
import App from "./App.vue";
import BuyButton from "./Button.vue";
import TextInTwitterBtn from "./TextInTwitterBtn.vue";
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
  if (!element) {
    console.log('empty element')
    return
  }

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

      const descNode = document.querySelector('[data-testid="UserDescription"]')
      console.log("get UserDescription", descNode)

      const profileNode = document.querySelector('[data-testid="UserProfileHeader_Items"]')
      console.log("get profileNode", profileNode)

      clearInterval(interval)

      const parent = descNode?.parentNode?.parentNode?.parentNode
      const target = profileNode?.parentNode
      console.log("get parent", parent)
      console.log("get target", target)
      if (parent && target) {
        parent.insertBefore(container, target)
      }
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

function addCardInTwitterStatus() {
  let href = ''
  let __DEV__ = false
  let targetNode = null
  let interval = 0
  let observer = null

  const parseItem = item => {
    if(!item) return

    const datetimeLink = item.querySelector('[datetime]').parentNode
    const id = datetimeLink.getAttribute('href')
    const container = document.createElement('div')
    container.id = `blink-tweet-item-${id}`
    const root = document.createElement('div')
    patchPortalRoot(container, root)
    const styleEl = document.createElement('link')
    const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
    styleEl.setAttribute('rel', 'stylesheet')
    styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
    shadowDOM.appendChild(styleEl)
    shadowDOM.appendChild(root)

    const statusRowNode = item.querySelector('[data-testid="reply"]').parentNode.parentNode.parentNode
    statusRowNode.before(container)
    const app = createApp(TextInTwitterBtn)
    setupApp(app)
    app.mount(root)
  }

  const startInjectTweetNFTCardInterval = () => {
    console.log('====> startInjectTweetNFTCardInterval :')
    let intervalTimes = 1
    const maxInterverTimes = 4
    const intervalTimeSpan = 500
    interval = setInterval(() => {
      if (intervalTimes > maxInterverTimes) {
        console.log('====> startInjectTweetNFTCardInterval abortInject :', intervalTimes)
        clearInterval(interval)
        return
      }
      intervalTimes++

      targetNode = document.querySelector('[aria-labelledby*="accessible-list-"]')
      if (!targetNode) {
        console.log('====> not found aria-labelledby*="accessible-list-')
        return
      }

      const list = document.querySelectorAll('[aria-labelledby*="accessible-list-"] article[data-testid="tweet"]')
      list.forEach(parseItem)
      
      // 观察器的配置（需要观察什么变动）
      const config = { childList: true };

      // 当观察到变动时执行的回调函数
      const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for (let mutation of mutationsList) {
          console.log('====> mutation :', mutation.type)
          if (mutation.type === "childList") {
            for (var i = 0; i < mutation.addedNodes.length; i++){
              parseItem(mutation.addedNodes[i].querySelector('article[data-testid="tweet"]'))
            }
          }
        }
      }

      // 创建一个观察器实例并传入回调函数
      observer = new MutationObserver(callback);

      // 以上述配置开始观察目标节点
      observer.observe(targetNode.querySelector('[data-testid="cellInnerDiv"]').parentNode, config);
      clearInterval(interval)
    }, intervalTimeSpan)
  }

  setInterval(() => {
    if (href==='' || href !== location.href) {
      href = location.href
      if (interval) {
        console.log('====> clearInterval in setInterval :', interval)
        clearInterval(interval)
      }

      if (observer) {
        observer.disconnect();
      }

      startInjectTweetNFTCardInterval()
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
      addProfileBtn();
      addCardInTwitterStatus();
    },
    onRemove(app) {
      app.unmount();
    },
  });
}
