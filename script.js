const displayElement = document.getElementById('display');
const historyElement = document.getElementById('history');
const memoryIndicator = document.getElementById('memory-indicator');

let memoryValue = 0;
let expression = '';
let lastResult = null;
let isEvaluated = false;

const buttonGrid = document.querySelector('.button-grid');
const operators = ['+', '-', '−', '×', '÷', '^'];

function updateDisplay(value) {
  displayElement.value = value;
}

function appendToExpression(value) {
  if (isEvaluated) {
    if (!operators.includes(value) && value !== '(' && value !== ')' && value !== '.') {
      expression = '';
    }
    isEvaluated = false;
  }

  if (expression === '0' && value !== '.' && !operators.includes(value) && value !== '(' && value !== ')') {
    expression = value;
  } else {
    expression += value;
  }

  updateDisplay(expression || '0');
}

function clearAll() {
  expression = '';
  lastResult = null;
  isEvaluated = false;
  historyElement.textContent = '';
  updateDisplay('0');
}

function clearEntry() {
  expression = '';
  updateDisplay('0');
}

function backspace() {
  if (isEvaluated) {
    expression = '';
    isEvaluated = false;
    updateDisplay('0');
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay(expression || '0');
}

function toggleMemoryIndicator() {
  if (memoryValue === 0) {
    memoryIndicator.classList.remove('active');
    memoryIndicator.textContent = 'M';
  } else {
    memoryIndicator.classList.add('active');
    memoryIndicator.textContent = 'M+';
  }
}

function memoryClear() {
  memoryValue = 0;
  toggleMemoryIndicator();
}

function memoryRecall() {
  appendToExpression(formatNumber(memoryValue));
}

function memoryAdd() {
  const value = evaluateExpression(expression || '0');
  if (!Number.isNaN(value)) {
    memoryValue += value;
    toggleMemoryIndicator();
  }
}

function memorySubtract() {
  const value = evaluateExpression(expression || '0');
  if (!Number.isNaN(value)) {
    memoryValue -= value;
    toggleMemoryIndicator();
  }
}

function formatNumber(number) {
  if (Number.isFinite(number)) {
    return Number.isInteger(number)
      ? String(number)
      : String(Number(number.toPrecision(12))).replace(/(?:\.0+|(?<=\.\d+)0+)$/, '');
  }
  return String(number);
}

function replaceMathSymbols(expr) {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**')
    .replace(/π/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/asin\(/g, 'Math.asin(')
    .replace(/acos\(/g, 'Math.acos(')
    .replace(/atan\(/g, 'Math.atan(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/exp\(/g, 'Math.exp(');
}

function sanitizeExpression(expr) {
  const cleaned = expr.replace(/[^0-9.+\-*/%^()πeasincoqrtlgx]/g, '');
  return cleaned;
}

function evaluateExpression(expr) {
  if (!expr) return 0;

  try {
    const sanitized = sanitizeExpression(expr);
    const parsed = replaceMathSymbols(sanitized);
    const result = Function(`"use strict"; return (${parsed});`)();
    if (typeof result === 'number' && Number.isFinite(result)) {
      lastResult = result;
      return result;
    }
    return NaN;
  } catch {
    return NaN;
  }
}

function evaluate() {
  const value = evaluateExpression(expression);
  if (Number.isNaN(value)) {
    updateDisplay('Error');
    historyElement.textContent = expression;
    expression = '';
    isEvaluated = true;
    return;
  }

  historyElement.textContent = expression;
  expression = formatNumber(value);
  updateDisplay(expression);
  isEvaluated = true;
}

function applyInverse() {
  const value = evaluateExpression(expression || '0');
  if (Number.isNaN(value) || value === 0) {
    updateDisplay('Error');
    expression = '';
    isEvaluated = true;
    return;
  }
  expression = formatNumber(1 / value);
  updateDisplay(expression);
  isEvaluated = true;
}

function applyPercentage() {
  const value = evaluateExpression(expression || '0');
  if (Number.isNaN(value)) {
    updateDisplay('Error');
    expression = '';
    isEvaluated = true;
    return;
  }
  expression = formatNumber(value / 100);
  updateDisplay(expression);
  isEvaluated = true;
}

buttonGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  switch (action) {
    case 'clear-all':
      clearAll();
      return;
    case 'clear-entry':
      clearEntry();
      return;
    case 'backspace':
      backspace();
      return;
    case 'memory-clear':
      memoryClear();
      return;
    case 'memory-recall':
      memoryRecall();
      return;
    case 'memory-add':
      memoryAdd();
      return;
    case 'memory-subtract':
      memorySubtract();
      return;
    case 'evaluate':
      evaluate();
      return;
    case 'inverse':
      applyInverse();
      return;
    case 'percent':
      applyPercentage();
      return;
    default:
      if (value) {
        appendToExpression(value);
      }
  }
});

window.addEventListener('keydown', (event) => {
  const key = event.key;
  const digitMatch = /^[0-9]$/;
  const validKeys = ['+', '-', '*', '/', '^', '.', '(', ')'];

  if (digitMatch.test(key)) {
    appendToExpression(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluate();
    return;
  }

  if (key === 'Backspace') {
    backspace();
    return;
  }

  if (key === 'Escape') {
    clearAll();
    return;
  }

  if (key === '%') {
    applyPercentage();
    return;
  }

  if (validKeys.includes(key)) {
    const symbol = key === '*' ? '×' : key === '/' ? '÷' : key;
    appendToExpression(symbol);
  }
});

clearAll();
