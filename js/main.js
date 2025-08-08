var published_pages;
var current_page;
var current_page_number;
var max_page_number;
var current_langauge = "en";


load_db().then((response) => {
    published_pages = JSON.parse(response);
    console.log(published_pages);
    get_latest_page().then((response) => {
        console.log(response);
        current_page = JSON.parse(response);
        write_page(true);
    });
});

async function load_db() {
    const response = await fetch("comic/published.json", {}) // type: Promise<Response>
    if (!response.ok) {
        throw Error(response.statusText)
    }
    return response.text()
}

async function get_latest_page() {
    const subfolder = published_pages.published[published_pages.published.length - 1];
    const response = await fetch(`comic/${subfolder}/page.json`, {}) // type: Promise<Response>
    if (!response.ok) {
        throw Error(response.statusText)
    }
    current_page_number = published_pages.published.length;
    console.log("current page number: ", current_page_number)
    max_page_number = published_pages.published.length;
    console.log("max page number: ", max_page_number)
    return response.text()
}

//function used to write comic page to web page
function write_page(first_load) {
    const parent_node = document.getElementById("comicpage");
    let altText = ""; //variable for alt text
    let img_name;
    switch (current_langauge) {
        case "es":
            img_name = current_page.page_es;
            break
        default:
            img_name = current_page.page_en;
            break
    }
    const path =
        "comic/" +
        published_pages.published[current_page_number - 1] + "/" +
        img_name;
    
    const img_tag = document.createElement("img");
    img_tag.src = path;

    if (parent_node.hasChildNodes()) {
        parent_node.firstChild.remove();
    }

    parent_node.appendChild(img_tag);

    const author_notes = document.querySelector(".notes");
    switch (current_langauge) {
        case "es":
            author_notes.innerHTML = current_page.comment_es;
            break
        default:
            author_notes.innerHTML = current_page.comment_en;
            break
    }
    update_nav_options(first_load);
}

function set_language(lang) {
    if (lang == "es") {
        current_langauge = "es";
    } else {
        current_langauge = "en";
    }
    write_page();
}

function toggle_scale_popout() {
    const element = document.querySelector(".scale_selector");
    element.classList.toggle("hide_scale_selector");
}

function set_page_scale(selection) {
    const page_el = document.getElementById("comicpage");
    switch (selection){
        case "height":
            page_el.classList.remove("fit_width", "fit_both");
            page_el.classList.add("fit_height");
            break
        case "both":
            page_el.classList.remove("fit_width", "fit_height");
            page_el.classList.add("fit_both");
            break
        default:
            page_el.classList.remove("fit_both", "fit_height");
            page_el.classList.add("fit_width");
            break
    }
    page_el.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector(".scale_selector").classList.add("hide_scale_selector")
}

function update_nav_options(first_load) {
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
    if (!first_load) {
        document.getElementById("comicpage").scrollIntoView({ behavior: "smooth", block: "start" });
    }
}