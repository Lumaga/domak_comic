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
        write_page_clickable(".page_img", true);
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
    max_page_number = published_pages.published.length;
    return response.text()
}

//SHOW COMIC PAGE, with clickable link
function write_page_clickable(div, clickable) {
    if (!clickable) {
        //display comic page without link
        document.querySelector(div).innerHTML = `<div id="comicpage"></div>`; 
    } else if (current_page_number < max_page_number) { //check whether comic is on the last page
        //display comic page and make it so that clicking it will lead you to the next page
        document.querySelector(div).innerHTML = `<div><a id="comicpage" href="?pg=next_page"/></a></div>`; 
    } else {
        //display comic page without link
        document.querySelector(div).innerHTML = `<div id="comicpage"></div>`; 
    }
    write_page();
}

//function used to split pages into multiple images if needed, and add alt text
function write_page() {
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
}

function set_language(lang) {
    if (lang == "es") {
        current_langauge = "es";
    } else {
        current_langauge = "en";
    }
    write_page();
}