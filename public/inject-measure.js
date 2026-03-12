(function() {
    const logo = document.querySelector('nav a[href="/"]');
    const specShell = document.querySelector('.spec-shell');
    const readerContent = document.querySelector('.spec-reader-content');
    const contentArea = document.querySelector('.spec-content-area');
    const specContent = document.querySelector('.spec-content');
    const toc = document.querySelector('.spec-reader-toc');
    
    const results = {};
    [['logo', logo], ['spec-shell', specShell], ['reader-content', readerContent], ['content-area', contentArea], ['spec-content', specContent], ['toc', toc]].forEach(([name, el]) => {
        if (el) {
            const rect = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            results[name] = {
                left: rect.left,
                right: rect.right,
                width: rect.width,
                paddingLeft: cs.paddingLeft,
                paddingRight: cs.paddingRight,
                marginLeft: cs.marginLeft,
                marginRight: cs.marginRight,
                maxWidth: cs.maxWidth,
                boxSizing: cs.boxSizing
            };
        }
    });
    
    // Create a floating results box
    const resultsDiv = document.createElement('div');
    resultsDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: #000;
        color: #0f0;
        padding: 20px;
        border: 2px solid #0f0;
        z-index: 999999;
        max-width: 800px;
        max-height: 90vh;
        overflow: auto;
        font-family: monospace;
        font-size: 11px;
        white-space: pre;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    `;
    resultsDiv.textContent = JSON.stringify(results, null, 2);
    resultsDiv.id = 'measurement-results-overlay';
    
    // Remove existing overlay if present
    const existing = document.getElementById('measurement-results-overlay');
    if (existing) existing.remove();
    
    document.body.appendChild(resultsDiv);
    
    // Also log to console
    console.log('MEASUREMENT_RESULTS:', JSON.stringify(results, null, 2));
    
    // Return results
    return results;
})();
