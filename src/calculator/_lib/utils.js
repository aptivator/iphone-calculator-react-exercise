import {decimalsMinimum, digitsLimit, displayBaseAspectRatio, displayBaseHeight} from './vars';
import {errorMessage, operations, priorities}                 from './vars';

function performOperation(operation, operand1, operand2) {
  let result = operations[operation](operand1, operand2);

  if(Math.abs(result) <= Number.MAX_VALUE) {
    return result + '';
  }
}

export function assertValidOperandInput(operand, ch) {
  if(ch === '.' && operand.includes('.')) {
    return;
  }

  if(countDigits(operand) === digitsLimit) {
    return;
  }

  return true;
}

function countDigits(str) {
  return str.match(/\d/g).length;
}

export function evaluate(operands, operators) {
  let operator = operators.pop();
  let operand2 = operands.pop();
  let operand1 = operands.pop();
  let result = performOperation(operator, +operand1, +operand2);

  if(result) {
    operands.push(result);

    if(operators.length) {
      return evaluate(operands, operators);
    }

    return true;
  }
}

export function evaluateWithPriorities(operands, operators) {
  if(operators.length > 1) {
    let {length} = operators;
    let currentOperator = operators.at(-1);
    let prevOperator = operators.at(-2);

    if(priorities[prevOperator] - priorities[currentOperator] >= 0) {
      let operand2 = operands.pop();
      let operand1 = operands.pop();
      let result = performOperation(prevOperator, +operand1, +operand2);

      if(result) {
        operands.push(result);
        operators[length - 2] = currentOperator;
        operators.pop();
  
        return evaluateWithPriorities(operands, operators);
      }

      return;
    }
  }

  return true;
}

function formatNumber(number) {
  if(number !== errorMessage) {
    let isRegular = !number.includes('e');

    if(countDigits(number) > digitsLimit && isRegular) {
      number = tryToRound(number, digitsLimit, decimalsMinimum);
    }
  
    if(countDigits(number) <= digitsLimit && isRegular) {
      number = formatNumberRegular(number);
    } else {
      number = formatNumberScientific(number);
    }
  }

  return number;
}

function formatNumberRegular(number) {
  let [whole, decimal] = number.split('.');
  whole = whole.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');

  if(number.includes('.')) {
    whole += '.';
  }

  if(decimal) {
    whole += decimal;
  }

  return whole;
}

function formatNumberScientific(number) {
  let numberScientific = (+number + 0.0).toExponential();
  let [coefficient, exponentFull] = numberScientific.split('e');
  let exponent = exponentFull.slice(1);
  let sign = exponentFull[0] === '-' ? '-' : '';
  let roundingFactor = 8 - (exponent.length + (sign === '-' ? 2 : 1));
  coefficient = round(+coefficient, roundingFactor);
  return coefficient + 'e' + sign + exponent;
}

export function getOrInitializeOperand(operands, activeIndex) {
  let operand = operands[activeIndex];

  if(!operand) {
    operand = operands[activeIndex] = '0';
  }

  return operand;
}

export function prerenderAndDisplay(number, prerenderEl, displayEl) {
  let numberFormatted = formatNumber(number);
  prerenderEl.current.innerText = numberFormatted;
  let {width, height} = prerenderEl.current.getBoundingClientRect();
  let aspectRatio = width / height;
  let currentAspectRatio = Math.max(aspectRatio, displayBaseAspectRatio);
  let heightFactor = currentAspectRatio / displayBaseAspectRatio;
  let newHeight = displayBaseHeight / heightFactor;
  displayEl.current.parentNode.style.height = newHeight + '%';
  displayEl.current.innerHTML = numberFormatted;
}

function round(number, digits) {
  let base = Math.pow(10, digits);
  return Math.round(number * base) / base;
}

function tryToRound(number, digitsLimit, decimalsMinimum) {
  let [whole] = number.split('.');
  let roundingFactor = digitsLimit - whole.length;

  if(roundingFactor >= decimalsMinimum) {
    number = round(+number, roundingFactor) + '';
  }

  return number;
}
