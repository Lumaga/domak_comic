
# Using the Gloomjam Template

## The comic database

In order to load your own comic material into the built in reader and archive Gloomlets, you will need to manually add each new entry into two places.

First you will need to create an entry in the db.json file located in the comic folder.

Under the "published" key, you will need an entry for each chapter of your comic, in order from top to bottom. Each chapter will be an value of "chapter_\<number\>". And it will contains it's name as well as which pages are associated with it, in order.

An example of the comic.db file may look like this:

    {
        "published": {
            "chapter_1": {
                "name_en": "No turn back",
                "name_es": "No vuelta atrás",
                "pages": 
                    [
                        "testpage_01",
                        "testpage_02",
                        "testpage_03"
                    ]
            },
            "chapter_2": {
                "name_en": "Yes turn back",
                "name_es": "Si vuelta atrás",
                "pages": 
                    [
                        "testpage_04"
                    ]
            }
        }
    }

You will notice that you can have translations of the chapter names here, this will be gone over in more detail in the *Translations* section below.

Another key thing to note is that *every page MUST use a unique identifier* in the database, even if the pages they refer to are in different chapters.

Once you have an entry for a page in the database, you will need to create a subfolder using the same identifier as it's name.

You will need to create a page.json file that includes all of the data, as well as the image for your page, a thumbnail for the archive, and other files if needed for your author's comment.

An example of a page.json may look like this:

    {
        "thumbnail": "thumb.png",
        "publication_date": "2025 08 17",
        "additional_credits": "",
        "comment_image": "hildaterry.png",

        "en": {
            "title": "Witches Notes #1",
            "image": "page_en.jpg",
            "alt_text": "",
            "comment": "Hello world #1"
        },

        "es": {
            "title": "Notas de Brujas #1",
            "image": "page_es.jpg",
            "alt_text": "",
            "comment": "Hola mundo. #1"
        }
    }

## Gloomlets

The Gloomjam template makes use of module like elements called Gloomlets.

To use a gloomlet, create an HTML element with a name attribute:

    <gloomlet name="example"></gloomlet>

The contents of the Gloomlet must then be put in the gloomlets folder, with a subfolder of the same name.

Then you can put any combination of CSS, HTML, and JS files in the subfolder that will then be dynamically loaded whenever the parent page is. These files must also share the name of the Gloomlet.

An example of a folder would look like this:

    /
    ├─ gloomlets/
        ├─ footer/
            ├─ footer.css
            ├─ footer.html
            ├─ footer.js

When creating HTML for a Gloomlet, you can nest other Gloomlets with no restrictions. Any time an element is needed more than once, it would be advisible to create a Gloomlet for it.