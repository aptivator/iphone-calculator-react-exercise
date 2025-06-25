export const decimalsMinimum = 3;

export const digitsLimit = 9;

export const digitsLimitScientific = 8;

export const displayBaseAspectRatio = 4.654162962962962962962962962963;

export const displayBaseHeight = 10.383696010550609957138147049126;

export const errorMessage = 'Error';

export const initialState = {operands: ['0'], activeIndex: 0, operators: []};

export const operations = {
  '÷': (num1, num2) => num1 / num2,
  '×': (num1, num2) => num1 * num2,
  '-': (num1, num2) => num1 - num2,
  '+': (num1, num2) => num1 + num2
};

export const priorities = {
  '÷': 10,
  '×': 10,
  '-': 1,
  '+': 1
};
