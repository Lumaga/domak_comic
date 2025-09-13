// Function to update content based on selected language
localStorage.language =
	localStorage.language || document.documentElement.lang || "en";

class I18n {
	language_data;

	constructor() {
		this.set_language(localStorage.language);
	}

	async set_language(lang) {
		localStorage.language = lang;
		this.language_data = await this._fetch_language_data(localStorage.language);
		this.update_content();
	}

	async update_content() {
		document.querySelectorAll("[data-i18n]").forEach((element) => {
			const key = element.getAttribute("data-i18n");
			if (!this.language_data.replacements[key]) {
				return;
			}
			try {
				if (element.tagName == "IMG") {
					element.alt = this.language_data.replacements[key];
					element.title = this.language_data.replacements[key];
				} else if (
					element.tagName == "INPUT" &&
					element.type == "submit"
				) {
					element.value = this.language_data.replacements[key];
				} else {
					element.innerHTML = this.language_data.replacements[key];
				}
			} catch (e) {
				console.log(`No translation found for ${key}`);
			}
		});

		document.querySelectorAll("[language]").forEach((element) => {
			if (element.getAttribute("language") == localStorage.language) {
				console.log("showing ", element);
				element.classList.remove("hidden");
			} else {
				console.log("hiding ", element);
				element.classList.add("hidden");
			}
		});

		for (const gloomlet of gloomlets) {
			try {
				gloomlet.update_language();
			} catch(e) {}
		}
	}

	// Function to fetch language data
	async _fetch_language_data(lang) {
		console.log(lang);
		try {
			const response = await fetch(`/i18n/${lang}.json`);
			const lang_obj = new Object({ identifier: lang });
			Object.defineProperty(lang_obj, "replacements", {
				value: JSON.parse(await response.text()),
			});
			return lang_obj;
		} catch (e) {
			console.error(e);
			return e;
		}
	}
}

const i18n = new I18n();
