
document.addEventListener('DOMContentLoaded', () => {
    initCourseFilters();
});

function initCourseFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const courseCards = document.querySelectorAll('.course-card');
    
    if (!filterTabs.length) return;
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;
            

            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            

            courseCards.forEach(card => {
                if (filter === 'all' || card.dataset.level === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

console.log('Courses page loaded');
