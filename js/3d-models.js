
class Model3DManager {
    constructor() {
        this.activeModel = null;
        this.isRotating = true;
        this.models = {};
        this.init();
    }

    init() {
        this.setupControlButtons();
        this.initializeModels();
    }

    setupControlButtons() {
        const controlButtons = document.querySelectorAll('.control-btn');
        controlButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleControl(action, btn);
            });
        });
    }

    handleControl(action, btn) {
        const model = document.querySelector('.model-3d');
        
        switch(action) {
            case 'rotate':
                this.toggleRotation(model, btn);
                break;
            case 'reset':
                this.resetView(model);
                break;
            case 'zoom-in':
                this.zoom(model, 1.2);
                break;
            case 'zoom-out':
                this.zoom(model, 0.8);
                break;
        }
    }

    toggleRotation(model, btn) {
        if (!model) return;
        
        this.isRotating = !this.isRotating;
        
        if (this.isRotating) {
            model.classList.remove('paused');
            btn.textContent = '⏸️ Пауза';
        } else {
            model.classList.add('paused');
            btn.textContent = '▶️ Вращать';
        }
    }

    resetView(model) {
        if (!model) return;
        
        model.style.transform = '';
        this.isRotating = true;
        model.classList.remove('paused');
    }

    zoom(model, factor) {
        if (!model) return;
        
        const currentScale = this.getCurrentScale(model);
        const newScale = currentScale * factor;
        

        if (newScale >= 0.5 && newScale <= 3) {
            model.style.transform = `scale(${newScale})`;
        }
    }

    getCurrentScale(model) {
        const transform = window.getComputedStyle(model).transform;
        if (transform === 'none') return 1;
        
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',');
            return parseFloat(values[0]);
        }
        return 1;
    }

    initializeModels() {

        this.models.cpu = this.createCPUModel();
        

        this.models.gpu = this.createGPUModel();
        

        this.models.ram = this.createRAMModel();
        

        this.addDragInteraction();
    }

    createCPUModel() {
        return {
            name: 'CPU',
            specs: {
                cores: '8 ядер',
                threads: '16 потоков',
                frequency: '3.6 GHz',
                cache: '32 MB',
                tdp: '65W'
            }
        };
    }

    createGPUModel() {
        return {
            name: 'GPU',
            specs: {
                memory: '8 GB GDDR6',
                cores: '2560 CUDA',
                frequency: '1.7 GHz',
                bandwidth: '448 GB/s',
                tdp: '220W'
            }
        };
    }

    createRAMModel() {
        return {
            name: 'RAM',
            specs: {
                capacity: '16 GB',
                type: 'DDR4',
                frequency: '3200 MHz',
                latency: 'CL16',
                voltage: '1.35V'
            }
        };
    }

    addDragInteraction() {
        const viewers = document.querySelectorAll('.model-viewer');
        
        viewers.forEach(viewer => {
            let isDragging = false;
            let startX, startY;
            let currentRotationY = 0;
            let currentRotationX = -20;
            
            const model = viewer.querySelector('.model-3d');
            if (!model) return;
            
            viewer.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                model.classList.add('paused');
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                currentRotationY += deltaX * 0.5;
                currentRotationX -= deltaY * 0.5;
                

                currentRotationX = Math.max(-90, Math.min(0, currentRotationX));
                
                model.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
                
                startX = e.clientX;
                startY = e.clientY;
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        });
    }

    updateSpecs(modelName) {
        const model = this.models[modelName];
        if (!model) return;
        
        const specsContainer = document.querySelector('.model-specs');
        if (!specsContainer) return;
        
        specsContainer.innerHTML = '';
        
        Object.entries(model.specs).forEach(([key, value]) => {
            const specItem = document.createElement('div');
            specItem.className = 'spec-item';
            specItem.innerHTML = `
                <span class="spec-label">${this.formatSpecLabel(key)}</span>
                <span class="spec-value">${value}</span>
            `;
            specsContainer.appendChild(specItem);
        });
    }

    formatSpecLabel(key) {
        const labels = {
            cores: 'Ядра',
            threads: 'Потоки',
            frequency: 'Частота',
            cache: 'Кэш',
            tdp: 'TDP',
            memory: 'Память',
            bandwidth: 'Пропускная способность',
            capacity: 'Объём',
            type: 'Тип',
            latency: 'Задержка',
            voltage: 'Напряжение'
        };
        return labels[key] || key;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Model3DManager();
    });
} else {
    new Model3DManager();
}