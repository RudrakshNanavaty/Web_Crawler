const { crawlPage } = require('./crawl.js');

async function main() {
	if (process.argv.length < 3) {
		console.log('Please provide a URL.');
	} else if (process.argv.length > 3) console.log('Too many arguments.');
	else {
		const pages = await crawlPage(process.argv[2], process.argv[2], {});

		printReport(pages);
	}
}

main();

/**
 * Prints the report on the website's internal linking profile
 * @param {Object} pages
 */
function printReport(pages) {
	// convert to array of objects
	pages = Object.entries(pages).map(([key, value]) => {
		return { url: key, count: value };
	});

	pages.sort((page1, page2) => page1 - page2);

	console.log('\nDone.\n\nGenerating Report...\n');

	pages.forEach(page => {
		console.log(`Found ${page.count} internal links to ${page.url}`);
	});
}
