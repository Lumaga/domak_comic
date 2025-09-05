var current_language = "en";

// Function to update content based on selected language
function update_content(langData, root) {
	root.querySelectorAll("[data-i18n]").forEach((element) => {
		const key = element.getAttribute("data-i18n");
		if (!langData[key]) {
			return
		}
		try {
			if (element.tagName == "IMG") {
				element.alt = langData[key];
				element.title = langData[key];
			} else if (element.tagName == "INPUT" && element.type == "submit") {
				element.value = langData[key];
			} else {
				element.innerHTML = langData[key];
			}
		} catch (e) {
			console.log(`No translation found for ${key}`);
		}
	});
}

// Function to fetch language data
async function fetch_language_data(lang) {
	try {
		const response = await fetch(`i18n/${lang}.json`);
		const lang_obj = new Object({ identifier: lang });
		Object.defineProperty(lang_obj, "replacements", {
			value: JSON.parse(await response.text()),
		});
		//console.log(lang_obj);
		return lang_obj;
	} catch (e) {
		console.error(e);
		return e;
	}
}

async function set_current_language(lang_obj, root) {
	current_language = lang_obj.identifier;
	document.querySelector("html").setAttribute("lang", current_language);
	update_content(lang_obj.replacements, root);
}

async function set_language(lang) {
	const lang_obj = await fetch_language_data(lang);
	set_current_language(await lang_obj, document);
	localStorage.lang = lang;
	//console.log(localStorage);
}

async function update_module_lang(name) {
	const module_root = document.querySelector(`module[name="${name}"]`);
	const lang = localStorage.lang ? localStorage.lang : current_language;
	const lang_obj = await fetch_language_data(lang);
	update_content(await lang_obj.replacements, module_root);
}
