var published_pages;
var current_page;
var current_page_identifier;
var current_page_number;
var max_page_number;
var first_load = true;

load_db().then((response) => {
	published_pages = JSON.parse(response);
	console.log(published_pages);
	const query = new URLSearchParams(window.location.search);
	if (query.get("page") && published_pages.published.includes(query.get("page"))) {
		console.log("Published pages includes ", query.get("page"));
		get_page(published_pages.published.indexOf(query.get("page"))).then((response) => {
			console.log(response);
			current_page = JSON.parse(response);
			write_page();
		});
	} else {
		console.log("Published pages DOES NOT include ", query.get("page"), " getting latest page instead")
		get_latest_page().then((response) => {
			console.log(response);
			current_page = JSON.parse(response);
			write_page();
		});
	}

});

async function load_db() {
	const response = await fetch("comic/published.json", {}); // type: Promise<Response>
	if (!response.ok) {
		throw Error(response.statusText);
	}
	return response.text();
}

async function get_latest_page() {
	const subfolder =
		published_pages.published[published_pages.published.length - 1];
	const response = await fetch(`comic/${subfolder}/page.json`, {}); // type: Promise<Response>
	if (!response.ok) {
		throw Error(response.statusText);
	}
	current_page_number = published_pages.published.length;
	console.log("current page number: ", current_page_number);
	max_page_number = published_pages.published.length;
	console.log("max page number: ", max_page_number);
	current_page_identifier = subfolder;
	const new_url = new URL(window.location.href);
	new_url.searchParams.set('page', subfolder);
	window.history.pushState(null, '', new_url.toString());
	return response.text();
}

async function get_page(num) {
	const subfolder =
		published_pages.published[num];
	const response = await fetch(`comic/${subfolder}/page.json`, {}); // type: Promise<Response>
	if (!response.ok) {
		throw Error(response.statusText);
	}
	current_page_number = num + 1;
	console.log("current page number: ", current_page_number);
	max_page_number = published_pages.published.length;
	console.log("max page number: ", max_page_number);
	current_page_identifier = subfolder;
	const new_url = new URL(window.location.href);
	new_url.searchParams.set('page', subfolder);
	window.history.pushState(null, '', new_url.toString());
	return response.text();
}

async function load_image(image_url) {
    let img;
    const imageLoadPromise = new Promise(resolve => {
		img = new Image();
        img.onload = resolve;
        img.src = image_url;
    });
	console.log("image loading");
    await imageLoadPromise;
    console.log("image loaded");
    return "image loaded callback"
}

//function used to write comic page to web page
async function write_page() {
	const parent_node = document.getElementById("comicpage");
	
	parent_node.setAttribute("style","height:1412px;width:100vw;");
	if (parent_node.hasChildNodes()) {
		parent_node.firstChild.remove();
	}

	let altText = ""; //variable for alt text
	
	let img_name;
	switch (current_langauge) {
		case "es":
			img_name = current_page.page_es;
			break;
		default:
			img_name = current_page.page_en;
			break;
	}
	
	const path = "comic/" + published_pages.published[current_page_number - 1] + "/" + img_name;
	
	const img_tag = document.createElement("img");
	img_tag.src = path;
	parent_node.appendChild(img_tag);
	await load_image(path).then((response) => {
		console.log(response);
		const parent_node = document.getElementById("comicpage");
		parent_node.setAttribute("style","");
		if (!first_load) {
			parent_node.scrollIntoView({ behavior: "smooth", block: "start" });
		}
		first_load = false;
	});
	
	const author_notes = document.querySelector(".notes");
	switch (current_langauge) {
		case "es":
			author_notes.innerHTML = current_page.comment_es;
			break;
		default:
			author_notes.innerHTML = current_page.comment_en;
			break;
	}
	update_nav_options();
	update_page_info();
		parent_node.setAttribute("style","");
}

function toggle_scale_popout() {
	const element = document.querySelector(".scale_selector");
	element.classList.toggle("hide_scale_selector");
}

function set_page_scale(selection) {
	const page_el = document.getElementById("comicpage");
	const fit_list = ["fit_width", "fit_height", "fit_both", "fit_original"]
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
			break
		default:
			page_el.classList.remove(...fit_list);
			page_el.classList.add("fit_width");
			break;
	}
	page_el.scrollIntoView({ behavior: "smooth", block: "start" });
	document
		.querySelector(".scale_selector")
		.classList.add("hide_scale_selector");
}

function update_nav_options() {
	const nav_first = Array.from(document.querySelectorAll(".nav_first"));
	const nav_prev = Array.from(document.querySelectorAll(".nav_prev"));
	const nav_next = Array.from(document.querySelectorAll(".nav_next"));
	const nav_last = Array.from(document.querySelectorAll(".nav_last"));
	if (current_page_number == 1) {
		for (el of nav_first.concat(nav_prev)) {
			el.classList.add("hide_nav");
		}
		for (el of nav_last.concat(nav_next)) {
			el.classList.remove("hide_nav");
		}
	} else if (current_page_number == max_page_number) {
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
		current_page_number;
	document.getElementById("max_page_number").innerHTML = max_page_number;
}

function on_click_page() {
	document
		.getElementById("comicpage")
		.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function set_current_page(page_num) {
	current_page_number = page_num;
	const subfolder = published_pages.published[current_page_number - 1];
	const response = await fetch(`comic/${subfolder}/page.json`, {}); // type: Promise<Response>
	if (!response.ok) {
		throw Error(response.statusText);
	}
	console.log("current page number: ", current_page_number);
	
	const new_url = new URL(window.location.href);
	new_url.searchParams.set('page', subfolder);
	window.history.pushState(null, '', new_url.toString());
	current_page_identifier = subfolder;
	return response.text();
}

function nav_to_first_page() {
	set_current_page(1).then((response) => {
		console.log(response);
		current_page = JSON.parse(response);
		write_page();
	});
}

function nav_to_prev_page() {
	set_current_page(current_page_number - 1).then((response) => {
		console.log(response);
		current_page = JSON.parse(response);
		write_page();
	});
}

function nav_to_next_page() {
	set_current_page(current_page_number + 1).then((response) => {
		console.log(response);
		current_page = JSON.parse(response);
		write_page();
	});
}

function nav_to_last_page() {
	set_current_page(max_page_number).then((response) => {
		console.log(response);
		current_page = JSON.parse(response);
		write_page();
	});
}

/**
*  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
*  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
/*
var disqus_config = function () {
	this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
	this.page.identifier = current_page_identifier; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
	};

function load_disqus_embed() { // DON'T EDIT BELOW THIS LINE
	var d = document, s = d.createElement('script');
	s.src = 'https://lumaga-draws.disqus.com/embed.js';
	s.setAttribute('data-timestamp', + new Date());
	(d.head || d.body).appendChild(s);
}*/