export default defineContentScript({
  matches: ['*://x.com/**'],
  async main() {
    console.log("Injecting script...");
    await injectScript("/injected.js", {
      keepInDom: true,
    });
    console.log("Done!");
  },
});

