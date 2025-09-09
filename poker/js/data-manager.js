class DataManager {
    constructor() {
        this.classData = null;
        this.cache = new Map();
    }

    async loadClassData() {
        if (this.cache.has('classData')) {
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

    getFallbackData() {
        return {
            classes: {
                "Demo Class": [
                    "Student 1",
                    "Student 2", 
                    "Student 3",
                    "Student 4",
                    "Student 5"
                ]
            }
        };
    }

    getClassNames() {
        if (!this.classData) return [];
        return Object.keys(this.classData.classes);
    }

    getStudentsFromClass(className) {
        if (!this.classData || !this.classData.classes[className]) return [];
        return [...this.classData.classes[className]];
    }

    getRandomStudents(className, count = 4) {
        const students = this.getStudentsFromClass(className);
        if (students.length === 0) return [];
        
        const shuffled = [...students].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
}

const dataManager = new DataManager();