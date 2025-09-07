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
        return (Date.now() - this.lastFetch) < this.cacheTimeout;
    }

    getFallbackData() {
        return {
            classes: {
                "Demo Class": [
                    "Alex Runner",
                    "Bailey Jumper",
                    "Casey Dodger",
                    "Dana Leaper",
                    "Eli Sprinter",
                    "Fran Dasher",
                    "Gabe Hopper",
                    "Hana Vaulter"
                ]
            }
        };
    }

    getClasses() {
        if (!this.classData) return [];
        return Object.keys(this.classData.classes);
    }

    getStudents(className) {
        if (!this.classData || !this.classData.classes[className]) return [];
        return [...this.classData.classes[className]];
    }

    getRandomStudent(className) {
        const students = this.getStudents(className);
        if (students.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * students.length);
        return students[randomIndex];
    }

    async preloadAllData() {
        await this.loadClassData();
        return true;
    }

    clearCache() {
        this.cache.clear();
        this.lastFetch = null;
    }
}

const dataManager = new DataManager();