// Test Unitaire
// src/utils/invoice-utils.js (exemple de fonction à tester)
export function calculateTotal(items) {
    return items.reduce((total, item) => total + item.price, 0);
  }
  
  // src/utils/invoice-utils.test.js
  import { calculateTotal } from './invoice-utils';
  
  describe('calculateTotal', () => {
    test('should return the correct total for an array of items', () => {
      const items = [
        { name: 'Item 1', price: 10 },
        { name: 'Item 2', price: 20 },
      ];
      expect(calculateTotal(items)).toBe(30);
    });
  
    test('should return 0 for an empty array', () => {
      const items = [];
      expect(calculateTotal(items)).toBe(0);
    });
  });
  