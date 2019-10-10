const { addBusinessDays, format, isAfter, isWeekend, setHours, startOfWeek } = require("date-fns");
const fs = require("fs");
const fse = require("fs-extra");
const dotenv = require("dotenv");

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
	const dateString = format(dateToDisplay, "d.M.y");
	const suplovani = await work(dateString);
	writeSuplovaniToFile(suplovani, dateString);
}

function writeSuplovaniToFile(suplovani, dateString) {
	const path = `C:/solapi/${dateString}.txt`;
	console.log("Writing suplovani to path: " + path);
	fse.ensureFileSync(path);
	const json = JSON.stringify(suplovani);
	fs.writeFileSync(path, json, (err) => {
		if (err) console.log(err);
		console.log("Successfully written zastupovani to file.");
	});
}

async function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}


(async () => {
	console.log("Starting loop");
	// noinspection InfiniteLoopJS
	while (true) {
		await loop();
	}
})();
