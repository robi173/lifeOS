export interface Task {
  id: number;
  title: string;
  priority: 'High' | 'Medium' | 'Maintenance';
  completed: boolean;
  time: string;
}

const STORAGE_KEY = 'lifeos_state';

const defaultState = {
  stats: {
    vitality: 87,
    productivity: 92,
    health: 84,
    finance: 78,
    habits: 95
  },
  tasks: [
    { id: 1, title: 'Finish SWP Project', priority: 'High', completed: false, time: '14:00' },
    { id: 2, title: 'Review PRs', priority: 'Medium', completed: true, time: '10:00' },
    { id: 3, title: 'Inbox Zero', priority: 'Maintenance', completed: false, time: '16:00' },
  ] as Task[],
  streak: 12,
  activeProtocols: [
    { id: 1, title: 'Deep Work Block', value: '45:00 min', color: 'teal', type: 'focus' },
    { id: 2, title: 'Intermittent Fasting', value: '02:30:00 left', color: 'green', type: 'health' }
  ],
  weather: {
    location: 'Vienna, AT',
    temperature: 18,
    condition: 'Clear Sky',
    aqi: 42
  }
};

// Initialize state from localStorage if available
const savedState = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
const initialState = savedState ? JSON.parse(savedState) : defaultState;

export const globalState = $state({
  ...initialState,
  
  // Persistence helper
  save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        stats: this.stats,
        tasks: this.tasks,
        streak: this.streak,
        activeProtocols: this.activeProtocols,
        weather: this.weather
      }));
    }
  },

  // Methods for interactions
  updateVitality() {
    const total = this.stats.productivity + this.stats.health + this.stats.finance + this.stats.habits;
    this.stats.vitality = Math.round(total / 4);
    this.save();
  },
  
  improveStat(stat: 'productivity' | 'health' | 'finance' | 'habits', amount: number) {
    this.stats[stat] = Math.min(100, this.stats[stat] + amount);
    this.updateVitality();
  },

  addTask(title: string, priority: 'High' | 'Medium' | 'Maintenance', time: string) {
    const newTask: Task = {
      id: Date.now(),
      title,
      priority,
      completed: false,
      time
    };
    this.tasks = [newTask, ...this.tasks];
    this.save();
  },

  toggleTask(id: number) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.save();
    }
  },

  incrementStreak() {
    this.streak += 1;
    this.save();
  }
});
