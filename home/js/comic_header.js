//the header of the site would be handled in this javascript file, so you don't have to copypaste the whole thing onto every page.
//at the bottom of your page, but before the js script calls and the closing body tag, put an empty div with a class of "writeHeader"
document.querySelector(".writeHeader").innerHTML = `
    <header align="center">
	
	<div id="language" style="background-color: #F6AE63; align: center";> 
		<a href="index.html">English</a> |
		<a href="ES/index_es.html">Español</a>
	</div>
	
        <a href="index.html"><img src="img/logo.png" alt="Domak" /></a> 

        <div id="nav">
            <a href="index.html">Home</a> |
            <a href="archive.html">Archive</a> |
            <a href="characters.html">Characters</a> |
            <a href="about.html">About</a>
        </div>
    </header>
`;