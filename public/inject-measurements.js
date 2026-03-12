// Measurement script to be injected
(function() {
    const logo = document.querySelector('nav a[href="/"]');
    const specShell = document.querySelector('.spec-shell');
    const readerContent = document.querySelector('.spec-reader-content');
    const contentArea = document.querySelector('.spec-content-area');
    
    const results = {};
    [['logo', logo], ['spec-shell', specShell], ['reader-content', readerContent], ['content-area', contentArea]].forEach(([name, el]) => {
        if (el) {
            const rect = el.getBoundingClientRect();
            results[name] = { left: rect.left, width: rect.width };
        } else {
            results[name] = null;
        }
    });
    
    // Create a display element
    const display = document.createElement('div');
    display.id = 'measurement-results';
    display.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #1a1a1a; color: #0f0; padding: 20px; border: 2px solid #0f0; z-index: 999999; font-family: monospace; font-size: 12px; max-width: 400px; white-space: pre-wrap;';
    display.textContent = JSON.stringify(results, null, 2);
    document.body.appendChild(display);
    
    // Also log to console
    console.log('MEASUREMENT RESULTS:', results);
    console.log(JSON.stringify(results, null, 2));
    
    return results;
})();
