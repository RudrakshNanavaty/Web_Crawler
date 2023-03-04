const { test, expect } = require('@jest/globals');
const { normalizeURL, getURLsFromHTML } = require('./crawl.js');

// ---------- Tests for normalizeURL ----------
describe('Testing normalizeURL', () => {
	test('Converts to lowercase', () => {
		expect(normalizeURL('https://eXaMple.cOm/pAth')).toEqual(
			'https://example.com/path'
		);
	});

	test("Truncates trailing '/'", () => {
		expect(normalizeURL('https://example.com/path/')).toEqual(
			'https://example.com/path'
		);
	});

	test("Truncates 'www.'", () => {
		expect(normalizeURL('https://example.com/path/')).toEqual(
			'https://example.com/path'
		);

		expect(normalizeURL('https://www.example.com/path/')).toEqual(
			'https://example.com/path'
		);
	});

	test('Preserves other subdomains', () => {
		expect(normalizeURL('https://subdomain.example.com/path')).toEqual(
			'https://subdomain.example.com/path'
		);
	});

	test('Preserves ports', () => {
		expect(normalizeURL('https://example.com:8080/path/')).toEqual(
			'https://example.com:8080/path'
		);
	});

	test('Preserves query params and hashes', () => {
		expect(
			normalizeURL(
				'https://www.example.com:8080/path/to/page?param1=value1&param2=value2#section1'
			)
		).toEqual(
			'https://example.com:8080/path/to/page?param1=value1&param2=value2#section1'
		);
	});
});

// ---------- Tests for getURLsFromHTML ----------
describe('getURLsFromHTML converts relative URLs to absolute', () => {
	const htmlString = `<a href="https://www.example.com/path/to/page">Link 1</a>
					<a href="/path/to/page">Link 2</a>
                    <a href="/path/to/page?param1=value1&param2=value2#section1">Link 3</a>`;

	const testMessages = [
		'Absolute Path',
		'Relative path',
		'Relative path with query and hashes'
	];

	const links = getURLsFromHTML(htmlString, 'https://www.example.com');

	links.forEach((link, index) => {
		test(testMessages[index], () => {
			console.log(link);
			expect(link).toMatch(/^[https?:\/\/|www\.].+(\..+)+[^\/]$/);
		});
	});

	test('Handles errors for invalid URLs', () => {
		const inputBody = `<html>
			<body>
				<a href="path/one">
					<span>Boot.dev></span>
				</a>
			</body>
		</html>`;

		expect(getURLsFromHTML(inputBody, 'https://blog.boot.dev')).toEqual([]);
	});
});
