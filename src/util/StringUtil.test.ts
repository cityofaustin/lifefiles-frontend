import StringUtil from './StringUtil';

describe('StringUtil', () => {
  it('gets first uppercase letter from input', () => {
    const input = 'sallyowner';
    const result = StringUtil.getFirstUppercase(input);
    expect(result).toBe('S');
  });
});
