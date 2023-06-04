const fs = require("fs");
const yargs = require("yargs/yargs");
const colors = require("colors");
const puppeteer = require("puppeteer");

const log = console.log;
const argv = yargs(process.argv).argv;

const saveFile = (historicalData) => {
  const startDate = historicalData[0].year;
  log(colors.yellow(`Starting year: ${startDate}`));
  const dir = "./output";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFile(
    `./output/${argv.portfolio}.json`,
    JSON.stringify(historicalData, null, 2),
    (err) => {
      if (err) return log(colors.red(err));
    }
  );
  log(colors.green(`Success! 😀\n`));
};

log(colors.yellow.bgBlack.underline("\nLazy Portfolio Historical Data\n"));

if (!argv.portfolio) {
  log(colors.red("Invalid arguments! 😖\n"));
  return;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto(
    `https://www.lazyportfolioetf.com/allocation/${argv.portfolio}/`
  );
  const element = await page.waitForSelector("#yearReturns tbody");
  const value = await page.evaluate((el) => {
    let data = [];
    Array.from(el.children)
      .reverse()
      .forEach((year) => {
        if (year.children[0].textContent && year.children[1]) {
          for (let index = 1; index <= 12; index++) {
            if (year.children[index + 2].textContent.trim()) {
              data.push({
                year: year.children[0].textContent,
                month: index,
                return: Number(year.children[index + 2].textContent),
              });
            }
          }
        }
      });
    return data;
  }, element);
  saveFile(value);
  await browser.close();
})();
