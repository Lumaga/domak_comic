var about_language = localStorage.lang || "en";
document.querySelector(`#lang_${about_language}`).classList.remove("hidden");

const language_change_callback = (mutationsList) => {
	for (const mutation of mutationsList) {
		if (
			mutation.type !== "attributes" ||
			mutation.attributeName !== "lang"
		) {
			return;
		}
        document.querySelector(`#lang_${about_language}`).classList.add("hidden");
		about_language = mutation.target.getAttribute("lang");
        document.querySelector(`#lang_${about_language}`).classList.remove("hidden");
	}
};

const language_change_observer = new MutationObserver(language_change_callback);
language_change_observer.observe(document.querySelector("html"), {
	attributes: true,
});