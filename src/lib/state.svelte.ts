export const globalState = $state({
  stats: {
    vitality: 87,
    productivity: 92,
    health: 84,
    finance: 78,
    habits: 95
  },
  activeProtocols: [
    { id: 1, title: 'Deep Work Block', value: '45:00 min', color: 'teal', type: 'focus' },
    { id: 2, title: 'Intermittent Fasting', value: '02:30:00 left', color: 'green', type: 'health' }
  ],
  weather: {
    location: 'Vienna, AT',
    temperature: 18,
    condition: 'Clear Sky',
    aqi: 42
  },
  
  // Methods for interactions
  updateVitality() {
    const total = this.stats.productivity + this.stats.health + this.stats.finance + this.stats.habits;
    this.stats.vitality = Math.round(total / 4);
  },
  
  improveStat(stat: 'productivity' | 'health' | 'finance' | 'habits', amount: number) {
    this.stats[stat] = Math.min(100, this.stats[stat] + amount);
    this.updateVitality();
  }
});
