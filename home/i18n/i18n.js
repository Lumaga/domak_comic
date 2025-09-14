// Function to update content based on selected language
localStorage.language =
	localStorage.language || document.documentElement.lang || "en";

var lang_db = {};

class I18n {
	constructor() {
		this.set_language(localStorage.language);
	}

	async set_language(lang) {
		localStorage.language = lang;
		const new_data = await this._load_language_data("i18n", localStorage.language);
		if (new_data) {
			console.log("found new data ", new_data);
			this._merge(lang_db, new_data);
			console.log(JSON.stringify(lang_db));
		}
		for (const name of gloomlet_names) {
			const path = `gloomlets/${name}`;
			const new_data = await this._load_language_data(path, localStorage.language);
			if (new_data) {
				console.log("found new data ", new_data);
				this._merge(lang_db, new_data);
				console.log(JSON.stringify(lang_db));
			}
		}
		console.log(lang_db);
		this.update_content();
	}

	async update_content(name) {
		const root = name ? document.querySelector(`gloomlet[name=${name}]`) :  document;

		console.log("updating language data for root: ", root);
	
		root.querySelectorAll("[data-i18n]").forEach((element) => {
			const key = element.getAttribute("data-i18n");
			if (!lang_db[localStorage.language][key]) {
				return;
			}
			try {
				if (element.tagName == "IMG") {
					element.alt = lang_db[localStorage.language][key];
					element.title = lang_db[localStorage.language][key];
				} else if (
					element.tagName == "INPUT" &&
					element.type == "submit"
				) {
					element.value = lang_db[localStorage.language][key];
				} else {
					element.innerHTML = lang_db[localStorage.language][key];
				}
			} catch (e) {
				console.log(`No translation found for ${key}`);
			}
		});

		root.querySelectorAll("[language]").forEach((element) => {
			if (element.getAttribute("language") == localStorage.language) {
				console.log("showing ", element);
				element.classList.remove("hidden");
			} else {
				console.log("hiding ", element);
				element.classList.add("hidden");
			}
		});

		if (name) {
			try {
					root.update_language();
				} catch(e) {}
		} else {
			for (const gloomlet of gloomlet_scripts) {
				try {
					gloomlet.update_language();
				} catch(e) {}
			}
		}
	}

	// Function to fetch language data
	async _load_language_data(root, lang) {
		console.log("loading", lang, "for", root);
		try {
			const response = await fetch(`/${root}/${lang}.json`).then(response => response.json());
			const lang_obj = new Object();
			Object.defineProperty(lang_obj, lang, {
				value: response,
			});
			return lang_obj;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	async load_gloomlet(name){
		const path = `gloomlets/${name}`;
		const new_data = await this._load_language_data(path, localStorage.language);
		if (new_data) {
			console.log("found new data ", new_data);
			this._merge(lang_db, new_data);
		}
		console.log(JSON.stringify(lang_db));
		this.update_content(name);
	}

	_merge(target, source) {
		target[localStorage.language] = {...target[localStorage.language], ...source[localStorage.language]}
	}
}

const i18n = new I18n();
