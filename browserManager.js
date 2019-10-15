const puppeteer = require("puppeteer");

class BrowserManager {

	/**
	 *
	 * @returns {Promise<{ browser, error }>}
	 */
	async launchBrowser(headless = true) {
		const browser = await puppeteer
			.launch({
				headless: process.env.DEVELOPMENT ? false : headless,
				args: ['--disable-setuid-sandbox',
					'--no-zygote'],
				userDataDir: "C:/pupdata"
			});
		return { browser, error: null };
	}
}

module.exports = { BrowserManager };
