var current_langauge = "en";

/*
const query = new URLSearchParams(window.location.search);
if (query.get("lang")) {
    current_langauge = query.get("lang");
}
*/

// Function to update content based on selected language
function update_content(langData) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerHTML = langData[key];
    });
}

// Function to fetch language data
async function fetch_language_data(lang) {
    const response = await fetch(`../languages/${lang}.json`);
    return response.json();
}

// Call updateContent() on page load
window.addEventListener('DOMContentLoaded', async () => {
    const user_preferred_language = localStorage.getItem('language') || 'en';
    console.log(user_preferred_language);
    if (current_langauge != user_preferred_language) {
        current_langauge = user_preferred_language;
        write_page();
    }
    const langData = await fetch_language_data(user_preferred_language);
    update_content(langData);
});

async function set_language(lang) {
	if (lang == "es") {
		current_langauge = "es";
	} else {
		current_langauge = "en";
	}
    localStorage.setItem('language', lang);
    const langData = await fetch_language_data(lang);
    update_content(langData);
//	const new_url = new URL(window.location.href);
//	new_url.searchParams.set('lang', current_langauge);
//	window.history.pushState(null, '', new_url.toString());
	write_page();
}