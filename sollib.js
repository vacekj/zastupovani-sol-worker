/*const { Page, Browser } = require("@types/puppeteer");*/

const { parseTable } = require("./parsing");

/**
 *
 * @param {Browser} browser
 * @param username
 * @param password
 * @returns {Promise<{browser: Browser, error: Error|null, username?: string}>}
 */
async function login({ browser, LOL, password }) {
	if (!LOL || !password) {
		throw new NoUserPass("No username or password was provided.");
	}
	try {
		const page = (await browser.pages())[0];
		await page.goto("https://www.skolaonline.cz/Aktuality.aspx");
		await page.evaluate(`
		document.querySelector("#JmenoUzivatele").value = "${LOL}";`);
		await page.evaluate(`
		document.querySelector("#HesloUzivatele").value = "${password}";`);
		await page.click("#dnn_ctr994_SOLLogin_btnODeslat");
		/* TODO: handle failed login. search for selector #dnn_ctr994_SOLLogin_lblChybaPrihlaseni */
		await page.waitForNavigation();
		await page.waitForSelector(".user", {
			timeout: 2 * 1000
		});
		const username =
			await page.evaluate(`
		document.querySelector(".username").innerHTML;
		`);
		return { browser, error: null, username };
	} catch (error) {
		return { browser, error, };
	}
}

/**
 *
 * @param {Browser} browser
 * @param {string} date
 * @returns {Promise<{browser: Browser, error: Error|null, fetchDate?: string, suplovaniTable?: HTMLTableElement}>}
 */
async function getSuplovaniPage(browser, date) {
	try {
		const page = (await browser.pages())[0];
		await page.goto("https://aplikace.skolaonline.cz/SOL/App/Rozvrh/KSU016_SuplovaniVypis.aspx");
		await page.waitFor("#ctl00_main_DBDatum_wdcDatum_input");
		await page.evaluate(`
		document.querySelector("#ctl00_main_DBDatum_wdcDatum_input").value = "${date}";`);
		await page.click("#ctl00_main_DBDatum_wdcDatum_input"); /* Needed for input to defocus and update its text*/
		await page.click("label[for='ctl00_main_rbStudent']");
		await page.click("[name='ctl00$main$btnZobraz']");
		await page.waitForNavigation();

		if ((await page.$("#ctl00_main_DBDatum_CVDateValidator")) != null) {
			return { browser, error: new DateNotFound() };
		} else {
			await page.waitForSelector("#ctl00_main_lblVypisDatum");
			const fetchDate = await page.evaluate(`
		document.querySelector("#ctl00_main_lblVypisDatum").innerHTML;
		`);/*#G_ctl00xmainxgridZaci*/
			const suplovaniTable = await page.evaluate(`
			document.querySelector("html").outerHTML`);

			return { browser, error: null, fetchDate, suplovaniTable };
		}
	} catch (e) {
		return { browser, error: e };
	}
}

/**
 *
 * @param {HTMLTableElement} suplovaniTable
 * @returns {Promise<void>}
 */
function parseSuplovaniTable(suplovaniTable) {
	return parseTable(suplovaniTable);
}

class DateNotFound extends Error {

}

class NoUserPass extends Error {

}

module.exports = { login, parseSuplovaniTable, getSuplovaniPage, DateNotFound };
