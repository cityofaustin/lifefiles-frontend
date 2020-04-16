import StringUtil from './StringUtil';

describe('StringUtil', () => {
  it('gets first uppercase letter from input', () => {
    const input = 'sallyowner';
    const result = StringUtil.getFirstUppercase(input);
    expect(result).toBe('S');
  });

  it('should create a valid uuid', () => {
    const result = StringUtil.getUuidv4();
    console.log(result);
    expect(result).toBeTruthy();
  });

});
