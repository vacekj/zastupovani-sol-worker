const cheerio = require("cheerio");

function parseTable(html, dupCols = true, dupRows = true) {
	const $ = cheerio.load(html);
	const columns = [];
	let currX = 0;
	let currY = 0;

	Array
		.from($("tr", $("table#G_ctl00xmainxgridZaci")))
		.map((row, rowIDX) => {
			currY = 0;
			Array.from($("td, th", row))
				.map((col, colIDX) => {
					const rowspan = col.attribs["rowspan"] || 1;
					const colspan = col.attribs["colspan"] || 1;
					const content = col.childNodes[0].children[0].data
						|| "";

					let x;
					let y = 0;
					for (x = 0; x < rowspan; x++) {
						for (y = 0; y < colspan; y++) {
							if (columns[currY + y] === undefined) {
								columns[currY + y] = [];
							}

							while (columns[currY + y][currX + x] !== undefined) {
								currY += 1;
								if (columns[currY + y] === undefined) {
									columns[currY + y] = [];
								}
							}

							if ((x === 0 || dupRows) && (y === 0 || dupCols)) {
								columns[currY + y][currX + x] = content;
							} else {
								columns[currY + y][currX + x] = "";
							}
						}
					}
					currY += 1;
				});
			currX += 1;
		});

	return columns;
}

module.exports = { parseTable };
