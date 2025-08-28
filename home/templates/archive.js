var archive_language = "en";
var archive_html = "";

document.addEventListener("click", (event) => {
	if (event.target.parentNode.classList.contains("expandable")) {
		console.log(event.target);
		event.target.parentNode.classList.toggle("open");
	}
});

load_db().then((success) => {
	if (success) {
		//console.log("database loaded");
		main();
	} else {
		const new_url = new URL(window.location.origin + "/db_load_error.html");
		window.location.assign(new_url);
	}
});

async function main() {
	try {
		document.getElementById("archive_content").innerHTML = "";
	} catch (e) {}
	archive_html = "";
	for (const chapter of Object.keys(db.published)) {
		const name = db.published[chapter][`name_${archive_language}`];
		const pages = db.published[chapter].pages;
		let pages_html = "";
		for (const page of pages) {
			const page_obj = await get_page(page);
			let html = `<a class="page" href="/index.html?page=${page}">
				<div class="ninepatch_paper_3">
					<img src="/comic/${page}/${page_obj.thumbnail}" class="thumbnail" />
				</div>
				<h3>${page_obj[archive_language].title}</h3>
			</a>
			`;
			pages_html = pages_html.concat(html);
		}
		let chapter_html = `<div class="chapter expandable ninepatch_paper_2">
		<h2>${name}</h2>
		<div class="page_list">
		${pages_html}
		</div>
		</div>`;
		archive_html = archive_html.concat(chapter_html);
	}
	//console.log(archive_html);

	wait_for_element("#archive_content").then((element) => {
		element.innerHTML = archive_html;
		document.querySelector(".chapter:last-of-type").classList.add("open");
	});
}

const language_change_callback = (mutationsList) => {
	for (const mutation of mutationsList) {
		if (
			mutation.type !== "attributes" ||
			mutation.attributeName !== "lang"
		) {
			return;
		}
		archive_language = mutation.target.getAttribute("lang");
		main();
	}
};

const language_change_observer = new MutationObserver(language_change_callback);
language_change_observer.observe(document.querySelector("html"), {
	attributes: true,
});
