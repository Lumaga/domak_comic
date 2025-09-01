function chimebar_main() {
    const script = document.createElement("script");
    script.id="chimescript";
    script.dir="up";
    script.type="module";
    script.src="https://chimeracomics.org/js/chimebar.js";
    script.mode="light";
    document.body.appendChild(script);
}
chimebar_main();