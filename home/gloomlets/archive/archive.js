class Archive {
	constructor() {
		document.addEventListener("click", (event) => {
			if (event.target.parentNode.classList.contains("expandable")) {
				console.log(event.target);
				event.target.parentNode
					.querySelector(".page_collapse")
					.classList.toggle("open");
			}
		});

		load_db().then((success) => {
			if (success) {
				this._write().then(() => 
				document
					.querySelector(".chapter:last-of-type")
					.querySelector(".page_collapse")
					.classList.toggle("open")
				)
			} else {
				const new_url = new URL(
					window.location.origin + "/db_load_error.html"
				);
				window.location.assign(new_url);
			}
		});
	}

	async update_language() {
		this._write();
	}

	async _write() {
		let archive_html = "";
		for (const chapter of Object.keys(db.published)) {
			const name = db.published[chapter][`name_${localStorage.language}`];
			const pages = db.published[chapter].pages;
			let pages_html = "";
			for (const page of pages) {
				const page_obj = await get_page(page);
				let html = `<a class="page" href="/index.html?page=${page}">
					<div>
						<img src="/comic/${page}/${page_obj.thumbnail}" class="thumbnail" />
					</div>
					<div class="page_info">
					<h3>${page_obj[localStorage.language].title}</h3>
					<span>${page_obj.publication_date}</span>
					</div>
				</a>
				`;
				pages_html = pages_html.concat(html);
			}
			let chapter_html = `<div class="chapter expandable">
			<h2 class="ninepatch_title">${name}</h2>
			<div class="page_collapse ninepatch_paper_2">
			<div class="page_list">
			${pages_html}
			</div>
			</div>
			</div>`;
			archive_html = archive_html.concat(chapter_html);
		}
		document.getElementById("archive_content").innerHTML = archive_html;
	}
}

const archive = new Archive();
gloomlet_scripts.push(archive);
