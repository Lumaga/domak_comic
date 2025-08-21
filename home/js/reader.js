var db;
var page_list = [];
var current_page;
var max_page_number;
var first_load = true;
const disable_disqus = false;

load_db().then((success) => {
	if (success) {
		//console.log("database loaded");
		main();
	} else {
		//const new_url = new URL(window.location.origin + "/db_load_error.html");
		//window.location.replace(new_url);
	}
});

async function main() {
	// Prioritize URL queries
	const query = new URLSearchParams(window.location.search);
	//console.log("looking for search queries");
	if (query.size) {
		for (const [key, value] of query.entries()) {
			//console.log(`${key}, ${value}`);
			switch (key) {
				case "page":
					const page_obj = await get_page(value);
					set_current_page(page_obj);
					break;
				case "lang":
					const lang_obj = await fetch_language_data(value);
					if (lang_obj) {
						set_current_language(lang_obj);
					}
					break;
				default:
					//console.log(`${key} is not a valid query`);
					query.delete(key);
					break;
			}
		}
	}

	// Fill in with stored user preferences, if found
	//console.log("looking for localStorage");
	if (localStorage.length) {
		//console.log("localStorage found, applying");
		for (const [key, value] of Object.entries(localStorage)) {
			//console.log(`${key}, ${value}`);
			switch (key) {
				case "latest_read_page":
					if (query.has("page")) {
						break;
					}
					const page_obj = await get_page(value);
					set_current_page(page_obj);
					break;
				case "lang":
					if (query.has("lang")) {
						break;
					}
					const lang_obj = await fetch_language_data(value);
					if (lang_obj) {
						set_current_language(lang_obj);
					}
					break;
				case "preferred_scale":
					set_page_scale(value);
					break;
				default:
					//console.log(`${key} is not a valid stored value`);
					break;
			}
		}
	}

	// No page defined, load latest page
	if (!current_page) {
		const page_obj = await get_page(page_list[max_page_number - 1]);
		set_current_page(page_obj);
	}

	// If the current page is wider than the user's window
	// and they have original size as their preferred,
	// override it and set to width instead
	if (
		window.innerWidth <
		document.querySelector("#comicpage img").getBoundingClientRect().width
	) {
		set_page_scale("width");
		//console.log("too big!");
	}

	update_url();
	if (!disable_disqus) {
		disqus();
	}
}

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
	try {
		//console.log("attempting to get page: ", identifier);
		const response = await fetch(`comic/${identifier}/page.json`, {}); // type: Promise<Response>
		const page_obj = new Object(JSON.parse(await response.text()));
		Object.defineProperty(page_obj, "identifier", { value: identifier });
		Object.defineProperty(page_obj, "number", {
			value: page_list.indexOf(identifier) + 1,
		});
		//console.log(page_obj);
		return page_obj;
	} catch (e) {
		console.error(e);
		console.log(
			"Page does not exist, attempting to return latest page instead"
		);
		try {
			const latest_page = page_list[page_list.length - 1];
			const response = await fetch(`comic/${latest_page}/page.json`, {}); // type: Promise<Response>
			const page_obj = new Object(JSON.parse(await response.text()));
			Object.defineProperty(page_obj, "identifier", {
				value: latest_page,
			});
			Object.defineProperty(page_obj, "number", {
				value: page_list.indexOf(latest_page) + 1,
			});
			//console.log(page_obj.identifier);
			//console.log(page_obj);
			return page_obj;
		} catch (e) {
			console.error(e);
		}
	}
}

async function set_current_page(page_obj) {
	current_page = page_obj;
	write_page();
}

async function load_image(image_url) {
	let img;
	const imageLoadPromise = new Promise((resolve) => {
		img = new Image();
		img.onload = resolve;
		img.src = image_url;
	});
	//console.log("image loading");
	await imageLoadPromise;
	//console.log("image loaded");
	return "image loaded callback";
}

//function used to write comic page to web page
async function write_page() {
	//image_node.setAttribute("src", "img/blank_page.png");

	let altText = ""; //variable for alt text

	let img_name = current_page[current_langauge].image;
	const path = "comic/" + current_page.identifier + "/" + img_name;

	await load_image(path).then((response) => {
		const image_node = document.querySelector("#comicpage img");
		//console.log(response);
		image_node.setAttribute("src", path);
		if (!first_load) {
			image_node.scrollIntoView({ behavior: "smooth", block: "start" });
		}
		first_load = false;
		update_page_info();
		update_nav_options();
		update_url();
		try {
			update_disqus();
		} catch (e) {}
	});

	const author_notes = document.querySelector(".author_notes .text");
	author_notes.innerHTML = current_page[current_langauge].comment;
}

function toggle_scale_popout() {
	const element = document.querySelector(".reader_settings");
	element.classList.toggle("hide_dropdown");
}

function choose_page_scale(selection) {
	set_page_scale(selection);
	const page_el = document.getElementById("comicpage");
	page_el.scrollIntoView({ behavior: "smooth", block: "start" });
	localStorage.preferred_scale = selection;
	//console.log(localStorage);
}

function set_page_scale(selection) {
	const page_el = document.getElementById("comicpage");
	const fit_list = ["fit_width", "fit_height", "fit_both", "fit_original"];
	switch (selection) {
		case "height":
			page_el.classList.remove(...fit_list);
			page_el.classList.add("fit_height");
			break;
		case "both":
			page_el.classList.remove(...fit_list);
			page_el.classList.add("fit_both");
			break;
		case "original":
			page_el.classList.remove(...fit_list);
			page_el.classList.add("fit_original");
			break;
		default:
			page_el.classList.remove(...fit_list);
			page_el.classList.add("fit_width");
			break;
	}
	document
		.querySelector(".scale_selector")
		.classList.add("hide_scale_selector");
}

window.addEventListener(
	"resize",
	debounce(function (e) {
		//console.log(window.innerWidth);
		const page_elem = document.getElementById("comicpage");
		const img_width = page_elem
			.querySelector("img")
			.getBoundingClientRect().width;
		if (
			page_elem.classList.contains("fit_width") &&
			window.innerWidth > img_width
		) {
			set_page_scale("original");
		} else if (
			page_elem.classList.contains("fit_original") &&
			window.innerWidth < img_width
		) {
			set_page_scale("fit_width");
		}
	})
);

function debounce(func) {
	var timer;
	return function (event) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(func, 100, event);
	};
}

function update_nav_options() {
	const nav_first = Array.from(document.querySelectorAll(".nav_first"));
	const nav_prev = Array.from(document.querySelectorAll(".nav_prev"));
	const nav_next = Array.from(document.querySelectorAll(".nav_next"));
	const nav_last = Array.from(document.querySelectorAll(".nav_last"));
	if (current_page.number == 1) {
		for (el of nav_first.concat(nav_prev)) {
			el.classList.add("hide_nav");
		}
		for (el of nav_last.concat(nav_next)) {
			el.classList.remove("hide_nav");
		}
	} else if (current_page.number == max_page_number) {
		for (el of nav_first.concat(nav_prev)) {
			el.classList.remove("hide_nav");
		}
		for (el of nav_last.concat(nav_next)) {
			el.classList.add("hide_nav");
		}
	} else {
		for (el of nav_first.concat(nav_prev)) {
			el.classList.remove("hide_nav");
		}
		for (el of nav_last.concat(nav_next)) {
			el.classList.remove("hide_nav");
		}
	}
}

function update_page_info() {
	document.getElementById("current_page_number").innerHTML =
		current_page.number;
	document.getElementById("max_page_number").innerHTML = max_page_number;
}

function on_click_page() {
	document
		.getElementById("comicpage")
		.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function nav_to_page_number(page_num) {
	if (page_num <= page_list.length) {
		const page_obj = await get_page(page_list[page_num - 1]);
		await set_current_page(page_obj);
	}
}

function nav_to_first_page() {
	nav_to_page_number(1).then(() => {
		localStorage.latest_read_page = current_page.identifier;
		//console.log(localStorage);
	});
}

function nav_to_prev_page() {
	nav_to_page_number(current_page.number - 1).then(() => {
		localStorage.latest_read_page = current_page.identifier;
		//console.log(localStorage);
	});
}

function nav_to_next_page() {
	nav_to_page_number(current_page.number + 1).then(() => {
		localStorage.latest_read_page = current_page.identifier;
		//console.log(localStorage);
	});
}

function nav_to_last_page() {
	nav_to_page_number(max_page_number).then(() => {
		localStorage.latest_read_page = current_page.identifier;
		//console.log(localStorage);
	});
}

function update_url() {
	const new_url = new URL(window.location.origin);
	////console.log(window.location);
	new_url.searchParams.set("page", current_page.identifier);
	//new_url.searchParams.set("lang", current_langauge);
	window.history.pushState(null, "", new_url.toString());
}

/**
 *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
 *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */

var disqus_language;

var disqus_config = function () {
	this.page.url =
		window.location.origin + `/?page=${current_page.identifier}`;
	//this.page.identifier = current_page.identifier;
	this.page.title = `Domak: Page ${current_page.number}`;
	this.language = disqus_language;
	//console.log(this.page);
};

function disqus() {
	// DON'T EDIT BELOW THIS LINE
	var d = document,
		s = d.createElement("script");
	s.src = "https://lumaga-draws.disqus.com/embed.js";
	s.setAttribute("data-timestamp", +new Date());
	(d.head || d.body).appendChild(s);
}

function update_disqus() {
	DISQUS.reset({
		reload: true,
		config: disqus_config,
	});
}
