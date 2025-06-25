import {useRef}                           from 'react'
import {assertValidOperandInput}          from './_lib/utils';
import {evaluate, evaluateWithPriorities} from './_lib/utils';
import {getOrInitializeOperand}           from './_lib/utils';
import {prerenderAndDisplay}              from './_lib/utils';
import {errorMessage, initialState}       from './_lib/vars';
import                                         './calculator.css';

export function Calculator({height = '80vh'}) {
  let clonedState = structuredClone(initialState);
  let state = useRef(clonedState);
  let mainEl = useRef();
  let prerenderEl = useRef();
  let displayEl = useRef();
  let resetEl = useRef();

  function calculate() {
    let {current} = state;
    let {operators} = current;

    if(operators.length) {
      let {operands, operatorEl, lastAction} = current;
      let operator = operators.at(-1);
      let operand = operands.at(-1);

      if(operatorEl.classList.contains('selected') && lastAction === setOperator) {
        operands.push(operand);
      }

      operatorEl.classList.remove('selected');
      
      if(evaluate(operands, operators)) {
        operands.push(operand);
        operators[0] = operator;
        render(operands[0]);
      } else {
        return errorReset(errorMessage);
      }
      
      current.activeIndex = 0;
      current.lastAction = calculate;
    }
  }

  function errorReset(message) {
    fullReset(message);
    mainEl.current.classList.add('disabled');
  }

  function fullReset(message) {
    state.current.operatorEl?.classList.remove('selected');
    state.current = structuredClone(initialState);
    render(message);
  }

  function render(operand = '0') {
    prerenderAndDisplay(operand, prerenderEl, displayEl);
  }

  function reset() {
    let {current} = state;
    let {lastAction, operatorEl, operators} = current;

    if(lastAction === reset || !operators.length) {
      fullReset();
    } else {
      let {operands, activeIndex} = current;
      let nonZeroOperands = operands.filter((operand) => operand !== '0');

      if(!nonZeroOperands.length) {
        fullReset();
      } else {
        if(lastAction === takeInput) {
          operatorEl.classList.add('selected');
        } else if(lastAction === calculate) {
          activeIndex = current.activeIndex = 0;
        }
  
        render(operands[activeIndex] = '0');
      }
    }

    resetEl.current.classList.remove('clear');
    current.lastAction = reset;
    mainEl.current.classList.remove('disabled');
  }

  function setOperator({currentTarget}, currentOperator) {
    let {current} = state;
    let {operatorEl, operands, operators, lastAction} = current;
    
    if(lastAction === calculate) {
      operands.splice(1);
      operators.splice(1);
      operators[0] = currentOperator;
      current.activeIndex = 1;
    } else {
      let {length: operandsInitialCount} = operands;
      operators[operands.length - 1] = currentOperator;

      if(evaluateWithPriorities(operands, operators)) {
        current.activeIndex = operands.length;
    
        if(operands.length !== operandsInitialCount) {
          render(operands.at(-1));
        }
      } else {
        return errorReset(errorMessage);
      }
    }

    current.operatorEl = currentTarget;
    operatorEl?.classList.remove('selected');
    currentTarget.classList.add('selected');
    current.lastAction = setOperator;
  }

  function takeInput(ch) {
    let {current} = state;
    let {operands, operatorEl, activeIndex, lastAction} = current;

    if(lastAction === calculate) {
      var operand = operands[activeIndex] = '0';
    } else {
      operand = getOrInitializeOperand(operands, activeIndex);
    }

    if(assertValidOperandInput(operand, ch)) {
      if(+operand === 0 && ch !== '.' && !operand.includes('.')) {
        if(operand[0] === '-') {
          operand = '-' + ch;
        } else {
          operand = ch;
        }
      } else {
        operand += ch;
      }
  
      render(operands[activeIndex] = operand);
      resetEl.current.classList.add('clear');
      operatorEl?.classList.remove('selected');
      current.lastAction = takeInput;
    }
  }

  function toPercent() {
    let {current} = state;
    let {activeIndex, lastAction, operatorEl, operands} = current;

    if(lastAction === setOperator) {
      var operand = operands.at(-1);
    } else {
      operand = getOrInitializeOperand(operands, activeIndex);
    }

    operand = operands[activeIndex] = operand / 100 + '';
    render(operand);
    operatorEl?.classList.remove('selected');
  }

  function toggleMinus() {
    let {current} = state;
    let {activeIndex, operatorEl, operands} = current;
    let operand = getOrInitializeOperand(operands, activeIndex);
    let hasMinus = operand[0] === '-';

    operatorEl?.classList.remove('selected');
    operand = hasMinus ? operand.slice(1) : '-' + operand;
    render(operands[activeIndex] = operand);
  }

  return <>
    <div className="iphone-calculator" ref={mainEl} style={{height}}>
      <div className="prerender-area">
        <span ref={prerenderEl}></span>
      </div>
      <div className="display">
        <span ref={displayEl}>0</span>
      </div>
      <div className="keys">
        <div className="key-wrapper">
          <div ref={resetEl} className="key adjustment resetter" onClick={reset}>
            <span className="key-value"></span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key adjustment plus-minus" onClick={toggleMinus}>
            <span className="small-plus-background" />
            <span className="small-plus">ᐩ</span>
            <span className="small-minus-background" />
            <span className="small-minus"></span>
            <span className="key-value">%</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key adjustment" onClick={toPercent}>
            <span className="key-value">%</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key operator" onClick={(e) => setOperator(e, '÷')}>
            <span className="key-value">÷</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('7')}>
            <span className="key-value">7</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('8')}>
            <span className="key-value">8</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('9')}>
            <span className="key-value">9</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key operator" onClick={(e) => setOperator(e, '×')}>
            <span className="key-value">×</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('4')}>
            <span className="key-value">4</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('5')}>
            <span className="key-value">5</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('6')}>
            <span className="key-value">6</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key operator minus" onClick={(e) => setOperator(e, '-')}>
            <span className="key-value">_</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('1')}>
            <span className="key-value">1</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('2')}>
            <span className="key-value">2</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('3')}>
            <span className="key-value">3</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key operator" onClick={(e) => setOperator(e, '+')}>
            <span className="key-value">+</span>
          </div>
        </div>
        <div className="key-wrapper span-2">
          <div className="key number" onClick={() => takeInput('0')}>
            <span className="key-value zero">0</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key number" onClick={() => takeInput('.')}>
            <span className="key-value">.</span>
          </div>
        </div>
        <div className="key-wrapper">
          <div className="key operator" onClick={calculate}>
            <span className="key-value">=</span>
          </div>
        </div>
      </div>
    </div>
  </>;
}
