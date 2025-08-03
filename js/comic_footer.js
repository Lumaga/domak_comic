//the footer of the site would be handled in this javascript file, so you don't have to copypaste the whole thing onto every page.
//at the bottom of your page, but before the js script calls and the closing body tag, put an empty div with a class of "writeFooter"
document.querySelector(".writeFooter").innerHTML = `
    <footer>
        <p>Domak © Lumaga 2025.</p>
        <p style="font-size:7px">I can't get the footer to look right, but it does the job.</p> 
        <p><strong>This website is powered by</strong></p>
        <a href="https://rarebit.neocities.org"><img src="img/rarebitlogo_small.png" height = "30" / style="margin-bottom: 3px";></a>
    </footer>
`;
