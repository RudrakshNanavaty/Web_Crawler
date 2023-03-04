const { crawlPage } = require('./crawl.js');

async function main() {
	if (process.argv.length < 3) {
		console.log('Please provide a URL.');
	} else if (process.argv.length > 3) console.log('Too many arguments.');
	else {
		const pages = await crawlPage(process.argv[2], process.argv[2], {});

		console.log('\n');
		console.debug(pages);
	}
}

main();
