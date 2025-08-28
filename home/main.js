window.addEventListener("load", function () {
	let html = document.querySelector("html");
	let scroller = document.querySelector("body");

	// Force scrollbars to display
	scroller.style.setProperty("overflow", "scroll");
	scroller.style.setProperty("overflow-x", "unset");
	html.style.setProperty("overflow-x", "unset");

	// Wait for next from so scrollbars appear
	requestAnimationFrame(() => {
		// True width of the viewport, minus scrollbars
		scroller.style.setProperty("--vw", scroller.clientWidth / 100);

		// Width of the scrollbar
		scroller.style.setProperty(
			"--scrollbar-width",
			`${window.innerWidth - scroller.clientWidth}px`
		);

		// Reset overflow
		scroller.style.setProperty("overflow", "");
		scroller.style.setProperty("overflow-x", "hidden");
		html.style.setProperty("overflow-x", "hidden");
	});
});

// functions for loading the database and fetching pages

var db;
var page_list = [];
var chapter_list = [];

async function load_db() {
	try {
		const response = await fetch("comic/db.json", {}); // type: Promise<Response>
		db = JSON.parse(await response.text());
		for (const chapter of Object.keys(db.published)) {
			//console.log(chapter);
			const pages = db.published[chapter].pages;
			//console.log(pages);
			for (const page of pages) {
				//console.log(page);
				page_list.push(page);
				chapter_list.push(chapter);
			}
		}
		max_page_number = page_list.length;
		//console.log("max page number: ", max_page_number);
		return true;
	} catch (e) {
		console.error(e);
		//console.log("Failed to load main database, abort loading page");
		return false;
	}
}

async function get_page(identifier) {
	let page_obj;
	//console.log("attempting to get page: ", identifier);
	try {
		page_obj = await fetch(`comic/${identifier}/page.json`);
		page_obj = await page_obj.json();
	} catch (e) {
		console.error(
			`page ${identifier} does not exist, attempting to load latest page instead`
		);
		identifier = page_list[page_list.length - 1];
		page_obj = await fetch(`comic/${identifier}/page.json`);
		page_obj = await page_obj.json();
	}
	//console.log("got a page, adding extra variables");
	page_obj["identifier"] = identifier;
	page_obj["number"] = page_list.indexOf(identifier) + 1;
	//console.log(page_obj);
	return page_obj;
}
