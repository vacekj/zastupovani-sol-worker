const fkill = require("fkill");

const { BrowserManager } = require("./browserManager");
const sollib = require("./sollib");

async function getSuplovani(date) {
	console.log("Launching browser");
	const browserManager = new BrowserManager();
	let browser = await browserManager.launchBrowser();

	console.log("Logging in using username " + process.env.SOL_USERNAME);
	const loginAttempt = await sollib.login({
		browser: browser.browser,
		LOL: process.env.SOL_USERNAME,
		password: process.env.SOL_PASSWORD
	});

	if (loginAttempt.error || !loginAttempt.username) {
		throw loginAttempt.error;
	}

	console.log("Getting suplovani page");
	const suplovaniPage = await sollib.getSuplovaniPage(browser.browser, date);

	if (suplovaniPage.error) {
		if (suplovaniPage.error instanceof sollib.DateNotFound) {
			throw suplovaniPage.error;
		}
		throw suplovaniPage.error;
	}

	console.log("Parsing suplovani");
	const parsedSuplovani = sollib.parseSuplovaniTable(suplovaniPage.suplovaniTable);
	if (!parsedSuplovani) {
		throw new Error("Couldn't parse Suplovani.");
	}
	console.log("Closing browser");
	await browser.browser.close();
	await killChromiums();
	return { parsedSuplovani, fetchDate: suplovaniPage.fetchDate };
}

async function killChromiums() {
	console.log("Killing all chromiums...");
	try {
		await fkill("chromium.exe", {
			ignoreCase: true,
			tree: true
		});
	} catch (e) {
	}
}

module.exports = getSuplovani;
