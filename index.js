const { addBusinessDays, format, isAfter, isWeekend, setHours, startOfWeek } = require("date-fns");
const fs = require("fs");
const fse = require("fs-extra");
const dotenv = require("dotenv");
const chalk = require("chalk");

dotenv.config();

const work = require("./worker");

async function loop() {
	console.log("Working...");
	const today = new Date();

	let dateToDisplay = today;
	const endOfSchoolDay = setHours(new Date(), 16);

	if (isWeekend(today)) {
		dateToDisplay = startOfWeek(addBusinessDays(today, 1), {
			weekStartsOn: 1
		});
	} else if (isAfter(new Date(), endOfSchoolDay)) {
		dateToDisplay = addBusinessDays(new Date(), 1);
	}
	console.log("Fetching date " + chalk.bold(dateToDisplay.toLocaleDateString()));
	const dateString = format(dateToDisplay, "d.M.y");
	const suplovani = await work(dateString);
	writeSuplovaniToFile(suplovani, dateString);
}

function writeSuplovaniToFile(suplovani, dateString) {
	const path = `C:/solapi/${dateString}.txt`;
	console.log("Writing suplovani to path: " + path);
	fse.ensureFileSync(path);
	const json = JSON.stringify(suplovani);
	fs.writeFileSync(path, json);
	if (fse.existsSync(path)) {
		console.log(chalk.greenBright("Successfully written zastupovani to " + path));
	} else {
		console.error(chalk.red("Error while writing zastupovani to " + path));
	}
}

async function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}


(async () => {
	console.log(chalk.green("Starting loop"));
	// noinspection InfiniteLoopJS
	let i = 0;
	while (true) {
		console.log("==========================");
		console.log(chalk.bgWhite.black("Iteration #" + i++));
		await loop();
	}
})();
