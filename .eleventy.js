const archive = require("./src/_data/archive.json");

// Момент сборки: BUILD_NOW (ISO) или текущее время
const buildNow = process.env.BUILD_NOW ? Date.parse(process.env.BUILD_NOW) : Date.now();

module.exports = function(eleventyConfig) {

  // --- Архив: после срока страница миссии в Аргентину не собирается ---
  if (buildNow >= Date.parse(archive.argentinaMission)) {
    eleventyConfig.ignores.add("src/mission-argentina-2026.njk");
  }

  // --- Фильтр: true, если срок iso пуст или ещё не наступил ---
  eleventyConfig.addFilter("visibleNow", (iso) => !iso || buildNow < Date.parse(iso));

  // --- Passthrough copy: статика без обработки ---
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // --- PWA: манифест и service worker в корень сайта ---
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/sw.js": "sw.js" });

  // --- Watch targets (для dev-сервера) ---
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // --- Фильтр: текущий год ---
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
