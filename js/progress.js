class ProgressTracker {
    constructor() {
        this.progress = this.loadProgress();
        this.init();
    }

    loadProgress() {
        const saved = localStorage.getItem('courseProgress');
        return saved ? JSON.parse(saved) : {};
    }

    saveProgress() {
        localStorage.setItem('courseProgress', JSON.stringify(this.progress));
    }

    markLessonComplete(course, lessonNum) {
        if (!this.progress[course]) {
            this.progress[course] = {};
        }
        this.progress[course][`lesson${lessonNum}`] = true;
        this.saveProgress();
        this.updateUI(course);
    }

    getLessonStatus(course, lessonNum) {
        return this.progress[course]?.[`lesson${lessonNum}`] || false;
    }

    getCourseProgress(course, totalLessons) {
        if (!this.progress[course]) return 0;
        
        const completed = Object.keys(this.progress[course]).length;
        return Math.round((completed / totalLessons) * 100);
    }

    updateUI(course) {
        const progressBars = document.querySelectorAll(`[data-course="${course}"]`);
        const totalLessons = 8; 
        const percentage = this.getCourseProgress(course, totalLessons);
        
        progressBars.forEach(bar => {
            if (bar.classList.contains('progress-fill')) {
                bar.style.width = `${percentage}%`;
            } else if (bar.classList.contains('progress-circle')) {
                const circumference = 339.292;
                const offset = circumference - (percentage / 100) * circumference;
                bar.style.strokeDashoffset = offset;
            }
        });

for (let i = 1; i <= totalLessons; i++) {
    const statusElement = document.querySelector(`[data-lesson-status="${i}"]`);
    if (statusElement) {
        if (this.getLessonStatus(course, i)) {
            statusElement.textContent = '✅';
        } else {
            statusElement.textContent = '🔓'; 
        }
    }
}


        const completedCounter = document.getElementById('completedLessons');
        if (completedCounter) {
            const completed = Object.keys(this.progress[course] || {}).length;
            completedCounter.textContent = completed;
        }

        const percentageElement = document.querySelector('.progress-percentage');
        if (percentageElement) {
            percentageElement.textContent = `${percentage}%`;
        }
    }

    init() {

        const courseElements = document.querySelectorAll('[data-course]');
        const courses = [...new Set([...courseElements].map(el => el.dataset.course))];
        
        courses.forEach(course => {
            this.updateUI(course);
        });
    }
}


const progressTracker = new ProgressTracker();


window.markLessonComplete = function(lessonNum) {
    const courseMatch = window.location.pathname.match(/\/courses\/([^\/]+)\//);
    if (courseMatch) {
        const course = courseMatch[1];
        progressTracker.markLessonComplete(course, lessonNum);
    }
};
