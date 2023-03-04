const url = require('url');
const jsdom = require('jsdom');

/**
 * @param {string} link The URL to normalize
 * @returns {string} The passed URL minus bloat
 */
function normalizeURL(link) {
	const parsedUrl = url.parse(link.toLowerCase());

	// truncate subdomain if === 'www.'
	let hostName = parsedUrl.hostname.startsWith('www.')
		? parsedUrl.hostname.substring(4)
		: parsedUrl.hostname;

	// normalize whatever parts of the url exists
	link = `${parsedUrl.protocol}//${hostName}${
		!parsedUrl.port ? '' : `:${parsedUrl.port}`
	}${parsedUrl.path === '/' ? '' : parsedUrl.path}${
		!parsedUrl.hash ? '' : `${parsedUrl.hash}`
	}`;

	// return after truncation trailing '/' if exists
	return link.endsWith('/') ? link.slice(0, -1) : link;
}

/**
 * @param {string} htmlBody A valid HTML string expected
 * @param {string} baseURL Required in to convert relative URLs to absolute
 * @returns {Array<string>} An array of the normalized version of all the links in the html page
 */
function getURLsFromHTML(htmlBody, baseURL) {
	const links = [];
	const dom = new jsdom.JSDOM(htmlBody);

	// get all <a> elements
	const aElements = dom.window.document.querySelectorAll('a');

	// handle absolute and relative URLs
	aElements.forEach(aElement => {
		if (aElement.href.startsWith('/')) {
			try {
				links.push(new URL(aElement.href, baseURL).href);
			} catch (err) {
				console.log(`${err.message}: ${aElement.href}`);
			}
		} else {
			try {
				links.push(new URL(aElement.href).href);
			} catch (err) {
				console.log(`${err.message}: ${aElement.href}`);
			}
		}
	});

	// return normalized links
	return links.map(link => normalizeURL(link));
}

/**
 * This is a recursive function
 * @param {String} baseURL
 * @param {String} currentURL
 * @param {Object} pages
 * @returns {Object} updated value of pages
 */
async function crawlPage(baseURL, currentURL, pages) {
	// convert strings to URL objects
	const base = new URL(baseURL);
	const current = new URL(currentURL);

	// Ensure currentURL is on the same domain as baseURL
	if (base.host !== current.host) return pages;

	// Normalize currentURL
	const normalizedCurrentURL = normalizeURL(current.href);

	// Check if pages object already has entry for normalizedCurrentURL
	if (pages[normalizedCurrentURL]) {
		pages[normalizedCurrentURL].count++;
		return pages;
	}

	// initialize this page in the map
	// since it doesn't exist yet
	pages[normalizedCurrentURL] = 1;

	console.log(`Crawling ${normalizedCurrentURL}`);

	try {
		const response = await fetch(currentURL);

		if (response.status > 399) {
			console.log(`Got HTTP error, status code: ${response.status}`);
			return pages;
		}

		const contentType = response.headers.get('content-type');

		if (!contentType.includes('text/html')) {
			console.log(`Got non-html response: ${contentType}`);
			return pages;
		}

		htmlBody = await response.text();
	} catch (err) {
		console.log(err.message);
	}

	const nextURLs = getURLsFromHTML(htmlBody, baseURL);

	for (const nextURL of nextURLs) {
		pages = await crawlPage(baseURL, nextURL, pages);
	}

	return pages;
}

module.exports = { normalizeURL, getURLsFromHTML, crawlPage };
