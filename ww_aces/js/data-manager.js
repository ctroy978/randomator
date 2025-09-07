class DataManager {
    constructor() {
        this.squadronData = null;
        this.cache = new Map();
        this.lastFetch = null;
        this.cacheTimeout = 5 * 60 * 1000;
    }

    async loadSquadronData() {
        if (this.cache.has('squadronData') && this.isCacheValid()) {
            return this.cache.get('squadronData');
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
            
            this.squadronData = data;
            this.cache.set('squadronData', data);
            this.lastFetch = Date.now();
            
            return data;
        } catch (error) {
            console.error('Error loading squadron data:', error);
            
            const fallbackData = this.getFallbackData();
            this.squadronData = fallbackData;
            return fallbackData;
        }
    }

    validateDataStructure(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.classes || typeof data.classes !== 'object') return false;
        
        for (const squadronName in data.classes) {
            if (!Array.isArray(data.classes[squadronName])) return false;
            if (data.classes[squadronName].length === 0) return false;
            
            for (const pilot of data.classes[squadronName]) {
                if (typeof pilot !== 'string' || pilot.trim() === '') return false;
            }
        }
        
        return true;
    }

    isCacheValid() {
        if (!this.lastFetch) return false;
        return Date.now() - this.lastFetch < this.cacheTimeout;
    }

    async getSquadrons() {
        const data = await this.loadSquadronData();
        return Object.keys(data.classes);
    }

    async getPilotsForSquadron(squadronName) {
        const data = await this.loadSquadronData();
        
        if (!data.classes[squadronName]) {
            throw new Error(`Squadron "${squadronName}" not found`);
        }
        
        return [...data.classes[squadronName]];
    }

    async getRandomPilot(squadronName) {
        const pilots = await this.getPilotsForSquadron(squadronName);
        const randomIndex = Math.floor(Math.random() * pilots.length);
        return pilots[randomIndex];
    }

    async getSquadronSize(squadronName) {
        const pilots = await this.getPilotsForSquadron(squadronName);
        return pilots.length;
    }

    getFallbackData() {
        return {
            classes: {
                "Eagle Squadron": [
                    "Ace Pilot 1",
                    "Ace Pilot 2",
                    "Ace Pilot 3",
                    "Ace Pilot 4",
                    "Ace Pilot 5"
                ]
            }
        };
    }

    clearCache() {
        this.cache.clear();
        this.lastFetch = null;
    }

    async preloadAllData() {
        try {
            await this.loadSquadronData();
            const squadrons = await this.getSquadrons();
            
            for (const squadronName of squadrons) {
                await this.getPilotsForSquadron(squadronName);
            }
            
            return true;
        } catch (error) {
            console.error('Error preloading data:', error);
            return false;
        }
    }
}

window.dataManager = new DataManager();