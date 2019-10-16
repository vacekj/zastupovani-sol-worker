const puppeteer = require("puppeteer");
const fse = require("fs-extra");

class BrowserManager {

	/**
	 *
	 * @returns {Promise<{ browser, error }>}
	 */
	async launchBrowser(headless = false) {
		const userDataDir = "C:/pupdata";
		fse.removeSync(userDataDir + "/");

		const browser = await puppeteer
			.launch({
				pipe: true,
				headless: false,
				args: [
					'--disable-setuid-sandbox',
					'--no-zygote',
					"--window-size=1920,1080",
					"--disable-gpu",
					"--start-maximized",
					"--disable-web-security"],
				userDataDir: userDataDir
			});
		return { browser, error: null };
	}
}

module.exports = { BrowserManager };
