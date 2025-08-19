// Basic test to ensure Jest is working correctly
describe('Basic Tests', () => {
  test('Jest is working', () => {
    expect(true).toBe(true);
  });

  test('Basic arithmetic', () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
  });

  test('String operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
    expect('world'.length).toBe(5);
  });
});