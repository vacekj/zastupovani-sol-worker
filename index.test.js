const sollib = require("./index");
const { BrowserManager } = require("./browserManager");
/* const { Browser, Page } = require("@types/puppeteer"); */

/**
 * @var {Browser} browser
 */
let browser;

beforeAll(() => {
	require("dotenv")
		.config();
});

beforeEach(() => {
	const browserManager = new BrowserManager();
	return browserManager
		.launchBrowser()
		.then(browserInstance => browser = browserInstance.browser);
});

test("Logs in", async () => {
	const result = await sollib.login({
		browser,
		LOL: process.env.SOL_USERNAME,
		password: process.env.SOL_PASSWORD
	});
	expect(result.error)
		.toEqual(null);
	expect(typeof result.username)
		.toBe("string");
	expect(result.username.length)
		.toBeGreaterThan(0);
}, 10 * 1000);

test("Fails to log in with bogus credentials", async () => {
	const result = await sollib.login({ browser, LOL: "aaaaaaaaa", password: "bbbbbbbb" });
	expect(result.error)
		.not
		.toBe(null);
}, 10 * 1000);

test("Gets Suplovani", async () => {
	const login = await sollib.login({ browser, LOL: process.env.SOL_USERNAME, password: process.env.SOL_PASSWORD });
	const suplovani = await sollib.getSuplovaniPage(login.browser, "4.9.2019");
	expect(suplovani.error)
		.toEqual(null);
	expect(typeof suplovani.fetchDate)
		.toBe("string");
	expect(suplovani.fetchDate.length)
		.toBeGreaterThan(0);
}, 20 * 1000);

test("Doesn't get suplovani of nonexistent date", async () => {
	const login = await sollib.login({ browser, LOL: process.env.SOL_USERNAME, password: process.env.SOL_PASSWORD });
	const suplovani = await sollib.getSuplovaniPage(login.browser, "1.1.2000");
	expect(suplovani.error)
		.toBeInstanceOf(sollib.DateNotFound);
}, 20 * 1000);

test("Parses suplovani table", async (done) => {
	try {
		const login = await sollib.login({
			browser,
			LOL: process.env.SOL_USERNAME,
			password: process.env.SOL_PASSWORD
		});
		const suplovani = await sollib.getSuplovaniPage(login.browser, "4.9.2019");
		const parsedSuplovani = sollib.parseSuplovaniTable(suplovani.suplovaniTable);
		expect(parsedSuplovani)
			.toBeInstanceOf(Array);
		expect(parsedSuplovani.length)
			.toBeGreaterThan(0);
		done();
	} catch (e) {
		throw e;
	}

}, 20 * 1000);

afterEach(() => {
	return browser.close();
});
