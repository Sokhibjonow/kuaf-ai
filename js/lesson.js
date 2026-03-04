document.addEventListener('DOMContentLoaded', () => {
    initLessonFeatures();
});

function initLessonFeatures() {

    const cpuParts = document.querySelectorAll('.cpu-part');
    cpuParts.forEach(part => {
        part.addEventListener('mouseenter', () => {
            const infoId = `info-${part.dataset.info}`;
            const infoBlock = document.getElementById(infoId);
            if (infoBlock) {

                document.querySelectorAll('.info-block').forEach(block => {
                    block.style.opacity = '0.5';
                });
                infoBlock.style.opacity = '1';
                infoBlock.style.transform = 'scale(1.02)';
            }
        });
        
        part.addEventListener('mouseleave', () => {
            document.querySelectorAll('.info-block').forEach(block => {
                block.style.opacity = '1';
                block.style.transform = 'scale(1)';
            });
        });
    });


    window.addEventListener('scroll', updateScrollProgress);
}

function updateScrollProgress() {
    const article = document.querySelector('.lesson-article');
    if (!article) return;
    
    const scrollTop = window.pageYOffset;
    const docHeight = article.offsetHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    const scrollPercentRounded = Math.round(scrollPercent * 100);
    
    console.log(`Scroll progress: ${scrollPercentRounded}%`);
}


function estimateReadingTime() {
    const article = document.querySelector('.lesson-article');
    if (!article) return 0;
    
    const text = article.innerText;
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const time = Math.ceil(wordCount / wordsPerMinute);
    
    return time;
}