window.addEventListener('load', function () {
    let scroller = document.querySelector("body");
    
    // Force scrollbars to display
    scroller.style.setProperty("overflow", "scroll");
    
    // Wait for next from so scrollbars appear
    requestAnimationFrame(() => {
        // True width of the viewport, minus scrollbars
        scroller.style.setProperty("--vw", scroller.clientWidth / 100);
        
        // Width of the scrollbar
        scroller.style.setProperty(
            "--scrollbar-width",
            `${window.innerWidth - scroller.clientWidth}px`
        );
        
        // Reset overflow
        scroller.style.setProperty("overflow", "");
    });
})