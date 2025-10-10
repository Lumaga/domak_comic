class Reader {
	current_page;
	current_chapter;
	max_page_number;
	disable_disqus = false;

	constructor() {
		load_db().then((success) => {
			if (success) {
				this.max_page_number = page_list.length;
				this._main();
			} else {
				const new_url = new URL(
					window.location.origin + "/db_load_error.html"
				);
				window.location.assign(new_url);
			}
		});

		document.addEventListener("click", (event) => {
			if (
				!event.target.classList.contains("toggle") &&
				!document
					.querySelector(".reader_settings")
					.classList.contains("hide_dropdown")
			) {
				document
					.querySelector(".reader_settings")
					.classList.add("hide_dropdown");
			}
		});

		document.body.addEventListener("scroll", (event) => {
			document
				.querySelector(".reader_settings")
				.classList.add("hide_dropdown");
		});

		document.addEventListener("scroll", (event) => {
			document
				.querySelector(".reader_settings")
				.classList.add("hide_dropdown");
		});

		this.setup_disqus();
	}

	async _main() {
		// Prioritize URL queries
		const query = new URLSearchParams(window.location.search);
		if (query.size) {
			for (const [key, value] of query.entries()) {
				switch (key) {
					case "page":
						const page_obj = await get_page(value);
						this.set_current_page(page_obj);
						break;
					default:
						query.delete(key);
						break;
				}
			}
		}

		// Fill in with stored user preferences, if found
		if (localStorage.length) {
			for (const [key, value] of Object.entries(localStorage)) {
				switch (key) {
					case "latest_read_page":
						if (query.has("page")) {
							break;
						}
						const page_obj = await get_page(value);
						this.set_current_page(page_obj);
						break;
					case "preferred_scale":
						this.set_page_scale(value);
						break;
					case "colorize_page":
						if (localStorage.colorize_page == 1) {
							console.log(
								"colorize on",
								localStorage.colorize_page
							);
							document
								.querySelector(".page_container")
								.classList.add("colorize_page");
						} else {
							console.log(
								"colorize off",
								localStorage.colorize_page
							);
							document
								.querySelector(".page_container")
								.classList.remove("colorize_page");
						}
						break;
					default:
						break;
				}
			}
		}

		// No page defined, load latest page
		if (!this.current_page) {
			const page_obj = await get_page(page_list[max_page_number - 1]);
			this.set_current_page(page_obj);
		}

		// If the current page is wider than the user's window
		// and they have original size as their preferred,
		// override it and set to width instead
		if (
			window.innerWidth <
			document.querySelector("#comicpage img").getBoundingClientRect()
				.width
		) {
			this.set_page_scale("width");
		}

		this.update_url();
		if (!this.disable_disqus) {
			this.disqus();
		}
	}

	async set_current_page(page_obj) {
		this.current_page = page_obj;
		window.current_page = page_obj;
		this._write_page();
	}

	//function used to write comic page to web page
	async _write_page() {
		const image_node = document.querySelector("#comicpage img");
		let img_name = this.current_page[localStorage.language].image;
		const path = "comic/" + this.current_page.identifier + "/" + img_name;
		image_node.setAttribute("src", path);
		this.update_page_info();
		this.update_nav_options();
		this.update_alt_text();
		this.update_url();
		const author_notes = document.querySelector(".author_notes .text");
		author_notes.innerHTML =
			this.current_page[localStorage.language].comment;
		const comment_image = document.getElementById("comment_image");
		if (this.current_page.comment_image != "") {
			comment_image.src =
				"comic/" +
				this.current_page.identifier +
				"/" +
				this.current_page.comment_image;
			comment_image.classList.remove("hidden");
		} else {
			comment_image.removeAttribute("src");
			comment_image.classList.add("hidden");
		}

		try {
			this._update_disqus();
		} catch (e) {}
	}

	update_alt_text() {
		try {
			const text = this.current_page[localStorage.language].alt_text;
			if (text != "") {
				document
					.querySelector(".text_description")
					.classList.remove("hidden");
				document
					.querySelector(".text_description_toggle")
					.classList.remove("hidden");
				const text_element =
					document.querySelector(".text_description");
				text_element.innerHTML = text;
			} else {
				document
					.querySelector(".text_description")
					.classList.add("hidden");
				document
					.querySelector(".text_description_toggle")
					.classList.add("hidden");
			}
		} catch (e) {
			document.querySelector(".text_description").classList.add("hidden");
			document
				.querySelector(".text_description_toggle")
				.classList.add("hidden");
		}
	}

	show_reader_help() {
		document.querySelector(".reader_help").classList.remove("hidden");
	}

	toggle_scale_popout() {
		const element = document.querySelector(".reader_settings");
		var rect = document
			.querySelector(".scale_selector")
			.getBoundingClientRect();
		console.log(rect);
		const dropdown = document.querySelector(".reader_settings dropdown");
		dropdown.style.top = `${rect.bottom}px`;
		dropdown.style.left = `${rect.left}px`;
		element.classList.toggle("hide_dropdown");
	}

	choose_page_scale(selection) {
		this.set_page_scale(selection);
		//const page_el = document.getElementById("comicpage");
		//page_el.scrollIntoView({ behavior: "smooth", block: "start" });
		localStorage.preferred_scale = selection;
	}

	set_page_scale(selection) {
		const page_el = document.getElementById("comicpage");
		const fit_list = [
			"fit_width",
			"fit_height",
			"fit_both",
			"fit_original",
		];
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
	}

	toggle_page_colorize() {
		console.log("colorize before", localStorage.colorize_page);
		localStorage.colorize_page ^= true;
		console.log("colorize after", localStorage.colorize_page);
		if (localStorage.colorize_page == 1) {
			document
				.querySelector(".page_container")
				.classList.add("colorize_page");
		} else {
			document
				.querySelector(".page_container")
				.classList.remove("colorize_page");
		}
	}

	toggle_text_description() {
		document.querySelector(".text_description").classList.toggle("open");
	}

	// dynamically react to window resizing, pretty glitchy at the moment
	// TODO: fix the glitchyness
	/*
	window.addEventListener(
		"resize",
		debounce(function (e) {
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
	*/

	update_nav_options() {
		const nav_first = Array.from(document.querySelectorAll(".nav_first"));
		const nav_prev = Array.from(document.querySelectorAll(".nav_prev"));
		const nav_next = Array.from(document.querySelectorAll(".nav_next"));
		const nav_last = Array.from(document.querySelectorAll(".nav_last"));
		if (this.current_page.number == 1) {
			for (const el of nav_first.concat(nav_prev)) {
				el.classList.add("hide_nav");
			}
			for (const el of nav_last.concat(nav_next)) {
				el.classList.remove("hide_nav");
			}
		} else if (this.current_page.number == max_page_number) {
			for (const el of nav_first.concat(nav_prev)) {
				el.classList.remove("hide_nav");
			}
			for (const el of nav_last.concat(nav_next)) {
				el.classList.add("hide_nav");
			}
		} else {
			for (const el of nav_first.concat(nav_prev)) {
				el.classList.remove("hide_nav");
			}
			for (const el of nav_last.concat(nav_next)) {
				el.classList.remove("hide_nav");
			}
		}
	}

	update_page_info() {
		document.getElementById("chapter_name").innerHTML =
			db.published[chapter_list[this.current_page.number - 1]][
				`name_${localStorage.language}`
			];
		document.getElementById("page_name").innerHTML =
			this.current_page[localStorage.language].title;
	}

	on_click_page(event) {
		let rect = document.getElementById("comicpage").getBoundingClientRect();
		const quarter = (rect.right - rect.left) / 4;
		if (event.clientX < rect.left + quarter) {
			this.nav_to_prev_page();
		} else if (event.clientX > rect.right - quarter) {
			this.nav_to_next_page();
		} else {
			document
				.getElementById("comicpage")
				.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}

	async nav_to_page_number(page_num) {
		if (page_num <= page_list.length) {
			const page_obj = await get_page(page_list[page_num - 1]);
			await this.set_current_page(page_obj);
		}
	}

	nav_to_first_page() {
		this.nav_to_page_number(1).then(() => {
			localStorage.latest_read_page = this.current_page.identifier;
		});
	}

	nav_to_prev_page() {
		if (this.current_page.number == 1) {
			return;
		}
		this.nav_to_page_number(this.current_page.number - 1).then(() => {
			localStorage.latest_read_page = this.current_page.identifier;
		});
	}

	nav_to_next_page() {
		if (this.current_page.number == page_list.length) {
			return;
		}
		this.nav_to_page_number(this.current_page.number + 1).then(() => {
			localStorage.latest_read_page = this.current_page.identifier;
		});
	}

	nav_to_last_page() {
		this.nav_to_page_number(this.max_page_number).then(() => {
			console.log("foo");
			localStorage.latest_read_page = this.current_page.identifier;
		});
	}

	update_url() {
		return;
		const new_url = new URL(window.location.origin);
		new_url.searchParams.set("page", this.current_page.identifier);
		window.history.pushState(null, "", new_url.toString());
	}

	update_language() {
		this._write_page();

		window.disqus_language =
			localStorage.language == "es" ? "es_419" : localStorage.language;
		try {
			this._update_disqus();
		} catch (e) {}
	}

	setup_disqus() {
		/**
		 *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
		 *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */

		window.disqus_config = function () {
			this.page.url =
				window.location.origin +
				`/?page=${window.current_page.identifier}`;
			this.page.title = `Domak: Page ${window.current_page.number}`;
			this.language = window.disqus_language;
		};

		window.disqus_language =
			localStorage.language == "es" ? "es_419" : localStorage.language;
	}

	disqus() {
		var d = document,
			s = d.createElement("script");
		s.src = "https://lumaga-draws.disqus.com/embed.js";
		s.setAttribute("data-timestamp", +new Date());
		(d.head || d.body).appendChild(s);
	}

	_update_disqus() {
		if (!this.disable_disqus) {
			DISQUS.reset({
				reload: true,
				config: disqus_config,
			});
		}
	}
}

const reader = new Reader();
gloomlet_scripts.push(reader);
