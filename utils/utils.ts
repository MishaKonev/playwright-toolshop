export const utils = {
  // Unique enough for parallel workers and repeated CI runs against a shared database
  uniquify(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  },

  uniqueEmail(prefix = 'pw'): string {
    return `${this.uniquify(prefix)}@example.com`.toLowerCase();
  },

  // "$14.15" -> 14.15
  parsePrice(text: string): number {
    return Number(text.replace(/[^0-9.]/g, ''));
  },
};
