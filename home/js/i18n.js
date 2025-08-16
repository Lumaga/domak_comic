var current_langauge = "en";

// Function to update content based on selected language
function update_content(langData) {
	document.querySelectorAll("[data-i18n]").forEach((element) => {
		const key = element.getAttribute("data-i18n");
		try {
			element.innerHTML = langData[key];
		} catch (e) {
			console.log(`No translation found for ${key}`);
		}
	});
}

// Function to fetch language data
async function fetch_language_data(lang) {
	try {
		const response = await fetch(`../languages/${lang}.json`);
		const lang_obj = new Object({ identifier: lang });
		Object.defineProperty(lang_obj, "replacements", {
			value: JSON.parse(await response.text()),
		});
		console.log(lang_obj);
		return lang_obj;
	} catch (e) {
		console.error(e);
		return e;
	}
}

async function set_current_language(lang_obj) {
	current_langauge = lang_obj.identifier;
	update_content(lang_obj.replacements);
	const disqus_lang = current_langauge == "es" ? "es_419" : current_langauge;
	disqus_language = disqus_lang;
	update_disqus();
	console.log("Disqus language: ", disqus_language);
}

async function set_language(lang) {
	const lang_obj = await fetch_language_data(lang);
	set_current_language(await lang_obj);
	localStorage.lang = lang;
	//console.log(localStorage);
}
