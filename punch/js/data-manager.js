class DataManager {
    constructor() {
        this.classData = null;
        this.cache = new Map();
        this.lastFetch = null;
        this.cacheTimeout = 5 * 60 * 1000;
    }

    async loadClassData() {
        if (this.cache.has('classData') && this.isCacheValid()) {
            return this.cache.get('classData');
        }

        try {
            const response = await fetch('../data/students.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!this.validateDataStructure(data)) {
                throw new Error('Invalid data structure in students.json');
            }
            
            this.classData = data;
            this.cache.set('classData', data);
            this.lastFetch = Date.now();
            
            return data;
        } catch (error) {
            console.error('Error loading class data:', error);
            
            const fallbackData = this.getFallbackData();
            this.classData = fallbackData;
            return fallbackData;
        }
    }

    validateDataStructure(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.classes || typeof data.classes !== 'object') return false;
        
        for (const className in data.classes) {
            if (!Array.isArray(data.classes[className])) return false;
            if (data.classes[className].length === 0) return false;
            
            for (const student of data.classes[className]) {
                if (typeof student !== 'string' || student.trim() === '') return false;
            }
        }
        
        return true;
    }

    isCacheValid() {
        if (!this.lastFetch) return false;
        return Date.now() - this.lastFetch < this.cacheTimeout;
    }

    async getClasses() {
        const data = await this.loadClassData();
        return Object.keys(data.classes);
    }

    async getStudentsForClass(className) {
        const data = await this.loadClassData();
        
        if (!data.classes[className]) {
            throw new Error(`Class "${className}" not found`);
        }
        
        return [...data.classes[className]];
    }

    async getRandomStudent(className) {
        const students = await this.getStudentsForClass(className);
        const randomIndex = Math.floor(Math.random() * students.length);
        return students[randomIndex];
    }

    async getClassSize(className) {
        const students = await this.getStudentsForClass(className);
        return students.length;
    }

    getFallbackData() {
        return {
            classes: {
                "Training Gym": [
                    "Fighter 1",
                    "Fighter 2",
                    "Fighter 3",
                    "Fighter 4",
                    "Fighter 5"
                ]
            }
        };
    }

    async preloadAllData() {
        await this.loadClassData();
        const classes = await this.getClasses();
        
        for (const className of classes) {
            await this.getStudentsForClass(className);
        }
        
        return true;
    }
}

const dataManager = new DataManager();