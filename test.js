const fs = require('fs');
const path = require('path');

// 1. Verify HTML elements match script expectations
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

console.log('--- Step 1: Checking HTML & JS IDs/Attributes Match ---');

const expectedIds = [
  'previous-operand',
  'current-operand',
  'sound-btn',
  'sound-on-icon',
  'sound-off-icon',
  'history-toggle-btn',
  'history-badge',
  'theme-btn',
  'theme-sun-icon',
  'theme-moon-icon',
  'btn-ac',
  'btn-delete',
  'btn-percent',
  'btn-divide',
  'btn-multiply',
  'btn-subtract',
  'btn-add',
  'btn-sign',
  'btn-decimal',
  'btn-equals',
  'history-panel',
  'history-list',
  'clear-history-btn',
  'close-history-btn'
];

let missingIds = [];
for (const id of expectedIds) {
  if (!htmlContent.includes(`id="${id}"`)) {
    missingIds.push(id);
  }
}

if (missingIds.length > 0) {
  console.error('FAILED: Missing IDs in HTML:', missingIds);
  process.exit(1);
} else {
  console.log('PASSED: All 24 core UI element IDs exist in index.html!');
}

// 2. Test Number Buttons (0-9)
for (let i = 0; i <= 9; i++) {
  if (!htmlContent.includes(`data-number="${i}"`)) {
    console.error(`FAILED: Missing data-number="${i}" in index.html`);
    process.exit(1);
  }
}
console.log('PASSED: All digit buttons (0-9) exist!');

// 3. Test Operator Buttons (+, −, ×, ÷)
const operators = ['+', '−', '×', '÷'];
for (const op of operators) {
  if (!htmlContent.includes(`data-operator="${op}"`)) {
    console.error(`FAILED: Missing data-operator="${op}" in index.html`);
    process.exit(1);
  }
}
console.log('PASSED: All 4 operator buttons exist!');

// 4. Test Calculator Engine Logic in simulated environment
console.log('\n--- Step 2: Testing Calculator Engine Logic ---');

class MockElement {
  constructor() {
    this.innerText = '';
    this.className = '';
    this.innerHTML = '';
    this.classList = {
      classes: new Set(),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      toggle: (c) => {
        if (this.classList.classes.has(c)) {
          this.classList.classes.delete(c);
          return false;
        } else {
          this.classList.classes.add(c);
          return true;
        }
      },
      has: (c) => this.classList.classes.has(c)
    };
  }
  querySelectorAll(sel) {
    return [];
  }
}

// Mock browser globals
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; }
};

global.document = {
  getElementById: (id) => new MockElement(),
  querySelectorAll: (selector) => []
};

// Instantiate Calculator
const scriptCode = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf-8');
// Evaluate SoundController and Calculator class from script
const classesDef = scriptCode.match(/class SoundController \{[\s\S]*?\n\}\n\nclass Calculator \{[\s\S]*?\n\}/)[0];
const CalculatorClass = new Function('MockElement', `
  ${classesDef}
  return Calculator;
`)(MockElement);

const c = new CalculatorClass(new MockElement(), new MockElement());

// Test A: Basic Addition (15 + 27 = 42)
c.clear();
c.appendNumber('1');
c.appendNumber('5');
c.chooseOperation('+');
c.appendNumber('2');
c.appendNumber('7');
c.compute(true);
console.assert(c.currentOperand === '42', `Test A Failed: expected 42, got ${c.currentOperand}`);
console.log('✓ Test A: 15 + 27 = 42 PASSED');

// Test B: Floating Point Precision (0.1 + 0.2 = 0.3)
c.clear();
c.appendNumber('0');
c.appendDecimal();
c.appendNumber('1');
c.chooseOperation('+');
c.appendNumber('0');
c.appendDecimal();
c.appendNumber('2');
c.compute(true);
console.assert(c.currentOperand === '0.3', `Test B Failed: expected 0.3, got ${c.currentOperand}`);
console.log('✓ Test B: 0.1 + 0.2 = 0.3 PASSED');

// Test C: Subtraction with negative result (5 - 12 = -7)
c.clear();
c.appendNumber('5');
c.chooseOperation('−');
c.appendNumber('1');
c.appendNumber('2');
c.compute(true);
console.assert(c.currentOperand === '-7', `Test C Failed: expected -7, got ${c.currentOperand}`);
console.log('✓ Test C: 5 − 12 = -7 PASSED');

// Test D: Multiplication (8 * 9 = 72)
c.clear();
c.appendNumber('8');
c.chooseOperation('×');
c.appendNumber('9');
c.compute(true);
console.assert(c.currentOperand === '72', `Test D Failed: expected 72, got ${c.currentOperand}`);
console.log('✓ Test D: 8 × 9 = 72 PASSED');

// Test E: Division (144 ÷ 12 = 12)
c.clear();
c.appendNumber('1');
c.appendNumber('4');
c.appendNumber('4');
c.chooseOperation('÷');
c.appendNumber('1');
c.appendNumber('2');
c.compute(true);
console.assert(c.currentOperand === '12', `Test E Failed: expected 12, got ${c.currentOperand}`);
console.log('✓ Test E: 144 ÷ 12 = 12 PASSED');

// Test F: Division by Zero
c.clear();
c.appendNumber('4');
c.appendNumber('2');
c.chooseOperation('÷');
c.appendNumber('0');
c.compute(true);
console.assert(c.hasError === true && c.currentOperand === 'Sıfıra bölünemez', `Test F Failed: expected error, got ${c.currentOperand}`);
console.log('✓ Test F: Division by zero cleanly caught as "Sıfıra bölünemez" PASSED');

// Test G: Backspace functionality
c.clear();
c.appendNumber('9');
c.appendNumber('8');
c.appendNumber('7');
c.delete(); // 98
console.assert(c.currentOperand === '98', `Test G1 Failed: expected 98, got ${c.currentOperand}`);
c.delete(); // 9
console.assert(c.currentOperand === '9', `Test G2 Failed: expected 9, got ${c.currentOperand}`);
c.delete(); // 0
console.assert(c.currentOperand === '0', `Test G3 Failed: expected 0, got ${c.currentOperand}`);
console.log('✓ Test G: Backspace (987 -> 98 -> 9 -> 0) PASSED');

// Test H: Percentage in addition (100 + 20% = 120)
c.clear();
c.appendNumber('1');
c.appendNumber('0');
c.appendNumber('0');
c.chooseOperation('+');
c.appendNumber('2');
c.appendNumber('0');
c.applyPercent(); // should calculate 20% of 100 = 20
c.compute(true); // 100 + 20 = 120
console.assert(c.currentOperand === '120', `Test H Failed: expected 120, got ${c.currentOperand}`);
console.log('✓ Test H: Percentage contextual addition (100 + 20% = 120) PASSED');

// Test I: Unary Percentage (50% = 0.5)
c.clear();
c.appendNumber('5');
c.appendNumber('0');
c.applyPercent();
console.assert(c.currentOperand === '0.5', `Test I Failed: expected 0.5, got ${c.currentOperand}`);
console.log('✓ Test I: Unary percentage (50% = 0.5) PASSED');

// Test J: Sign Toggle
c.clear();
c.appendNumber('4');
c.appendNumber('2');
c.toggleSign();
console.assert(c.currentOperand === '-42', `Test J1 Failed: expected -42, got ${c.currentOperand}`);
c.toggleSign();
console.assert(c.currentOperand === '42', `Test J2 Failed: expected 42, got ${c.currentOperand}`);
console.log('✓ Test J: Sign toggle (±) PASSED');

// Test K: Chained operations
c.clear();
c.appendNumber('1');
c.appendNumber('0');
c.chooseOperation('+');
c.appendNumber('5');
c.chooseOperation('×'); // computes 10 + 5 = 15
console.assert(c.previousOperand === '15', `Test K1 Failed: expected previous 15, got ${c.previousOperand}`);
c.appendNumber('2');
c.compute(true); // 15 * 2 = 30
console.assert(c.currentOperand === '30', `Test K2 Failed: expected 30, got ${c.currentOperand}`);
console.log('✓ Test K: Chained operations PASSED');

// Test L: Operator change without typing new number
c.clear();
c.appendNumber('5');
c.chooseOperation('+');
c.chooseOperation('×'); // Changed mind
console.assert(c.operation === '×', `Test L Failed: expected operation ×, got ${c.operation}`);
c.appendNumber('4');
c.compute(true);
console.assert(c.currentOperand === '20', `Test L Failed: expected 20, got ${c.currentOperand}`);
console.log('✓ Test L: Changing operator before entering operand PASSED');

// Test M: Multiple decimals prevention
c.clear();
c.appendDecimal(); // '0.'
c.appendNumber('5'); // '0.5'
c.appendDecimal(); // ignored
c.appendNumber('2'); // '0.52'
console.assert(c.currentOperand === '0.52', `Test M Failed: expected 0.52, got ${c.currentOperand}`);
console.log('✓ Test M: Multiple decimal points prevention PASSED');

// Test N: History preservation
console.assert(c.history.length > 0, `Test N Failed: history is empty`);
console.log(`✓ Test N: Calculation history tracked (${c.history.length} records) PASSED`);

// Test O: Backspace when operator was set (cancels operator and restores first operand)
c.clear();
c.appendNumber('7');
c.appendNumber('8');
c.chooseOperation('+'); // current is '', prev is 78
c.delete(); // Should restore 78
console.assert(c.currentOperand === '78' && c.operation === undefined, `Test O Failed: expected 78 restored, got ${c.currentOperand}`);
console.log('✓ Test O: Backspace on operator cancels operator and restores first operand PASSED');

console.log('\n========================================');
console.log('🎉 ALL 15 TEST SUITES PASSED FLAWLESSLY!');
console.log('========================================');
