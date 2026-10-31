/**
 * Modern Hesap Makinesi (Calculator)
 * Clean, modular and robust JavaScript implementation
 */

class SoundController {
  constructor() {
    this.audioCtx = null;
    this.enabled = localStorage.getItem('calc_sound') !== 'false';
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('calc_sound', this.enabled);
    return this.enabled;
  }

  playClick(type = 'num') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'equals') {
        // Joyful chime for equals
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'op' || type === 'func') {
        // Snappy click for operators/functions
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else {
        // Subtle soft tap for numbers
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // Audio might be blocked before first user interaction
    }
  }
}

class Calculator {
  constructor(previousOperandEl, currentOperandEl) {
    this.previousOperandEl = previousOperandEl;
    this.currentOperandEl = currentOperandEl;
    this.sound = new SoundController();
    this.history = JSON.parse(localStorage.getItem('calc_history') || '[]');
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.overwrite = false;
    this.hasError = false;
    this.highlightActiveOperator();
    this.updateClearButton();
  }

  // Clear Entry (C) vs All Clear (AC)
  clearEntry() {
    if (this.hasError) {
      this.clear();
      this.updateDisplay();
      return;
    }
    // If user is currently typing a number and previous operation exists, just clear current number
    if (this.currentOperand !== '0' && this.currentOperand !== '' && !this.overwrite) {
      this.currentOperand = '0';
      this.updateDisplay();
      this.updateClearButton();
    } else {
      this.clear();
      this.updateDisplay();
    }
  }

  delete() {
    if (this.hasError) {
      this.clear();
      this.updateDisplay();
      return;
    }
    if (this.overwrite) {
      this.currentOperand = '0';
      this.overwrite = false;
      this.updateDisplay();
      this.updateClearButton();
      return;
    }
    // If waiting for second operand, backspace cancels operator and restores first operand for editing
    if (this.currentOperand === '' && this.previousOperand !== '') {
      this.currentOperand = this.previousOperand;
      this.previousOperand = '';
      this.operation = undefined;
      this.highlightActiveOperator();
      this.updateDisplay();
      this.updateClearButton();
      return;
    }
    if (this.currentOperand === '0') return;

    if (this.currentOperand.length === 1 || 
       (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
    this.updateClearButton();
  }

  appendNumber(number) {
    if (this.hasError) {
      this.clear();
    }
    if (this.overwrite) {
      this.currentOperand = number.toString();
      this.overwrite = false;
      this.updateDisplay();
      this.updateClearButton();
      return;
    }
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      // Limit input length to prevent unbounded string overflow
      if (this.currentOperand.replace(/[^0-9]/g, '').length >= 16) return;
      this.currentOperand = `${this.currentOperand}${number}`;
    }
    this.updateDisplay();
    this.updateClearButton();
  }

  appendDecimal() {
    if (this.hasError || this.overwrite) {
      this.currentOperand = '0.';
      this.overwrite = false;
      this.hasError = false;
      this.updateDisplay();
      this.updateClearButton();
      return;
    }
    if (this.currentOperand.includes('.')) return;
    if (this.currentOperand === '') {
      this.currentOperand = '0.';
    } else {
      this.currentOperand = `${this.currentOperand}.`;
    }
    this.updateDisplay();
    this.updateClearButton();
  }

  toggleSign() {
    if (this.hasError || this.currentOperand === '0' || this.currentOperand === '') return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = `-${this.currentOperand}`;
    }
    this.updateDisplay();
  }

  applyPercent() {
    if (this.hasError) return;
    const current = parseFloat(this.currentOperand || this.previousOperand);
    if (isNaN(current)) return;

    // Contextual percentage logic:
    // If there is an active addition or subtraction: e.g. 200 + 10% = 200 + 20
    if (this.previousOperand && (this.operation === '+' || this.operation === '−')) {
      const prev = parseFloat(this.previousOperand);
      if (!isNaN(prev)) {
        const percentValue = this.roundPrecision(prev * (current / 100));
        this.currentOperand = percentValue.toString();
        this.updateDisplay();
        return;
      }
    }

    // Standard percentage: value / 100
    const result = this.roundPrecision(current / 100);
    this.currentOperand = result.toString();
    this.overwrite = true;
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.hasError) {
      this.clear();
    }
    // If user clicked operator again without entering new number, simply change the operator
    if (this.currentOperand === '') {
      if (this.previousOperand !== '') {
        this.operation = operation;
        this.highlightActiveOperator();
        this.updateDisplay();
      }
      return;
    }

    if (this.previousOperand !== '') {
      this.compute(false);
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
    this.highlightActiveOperator();
    this.updateDisplay();
  }

  compute(isFinal = true) {
    let computation;
    const prev = parseFloat(this.previousOperand);
    // If current operand is empty when equals is pressed, use previous operand
    const current = this.currentOperand !== '' ? parseFloat(this.currentOperand) : prev;

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '−':
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.hasError = true;
          this.currentOperand = 'Sıfıra bölünemez';
          this.previousOperand = '';
          this.operation = undefined;
          this.highlightActiveOperator();
          this.updateDisplay();
          this.updateClearButton();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    const cleanResult = this.roundPrecision(computation);
    
    if (isFinal) {
      // Record in calculation history
      this.addHistoryRecord({
        expression: `${this.formatDisplayNumber(this.previousOperand)} ${this.operation} ${this.formatDisplayNumber(current.toString())}`,
        result: cleanResult.toString()
      });
      this.previousOperand = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation} ${this.formatDisplayNumber(current.toString())} =`;
      this.operation = undefined;
    } else {
      this.previousOperand = cleanResult.toString();
    }

    this.currentOperand = cleanResult.toString();
    this.overwrite = true;
    this.highlightActiveOperator();
    this.updateDisplay();
    this.updateClearButton();
  }

  // Handle floating point precision quirks (e.g. 0.1 + 0.2 = 0.3)
  roundPrecision(num) {
    if (isNaN(num) || !isFinite(num)) return num;
    return parseFloat(num.toPrecision(12));
  }

  formatDisplayNumber(numStr) {
    if (!numStr) return '';
    if (numStr === 'Sıfıra bölünemez') return numStr;

    const num = parseFloat(numStr);
    // Scientific notation for very large or tiny numbers
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-7 && num !== 0)) {
      return num.toExponential(6);
    }

    const stringNumber = numStr.toString();
    const parts = stringNumber.split('.');
    const integerPart = parseFloat(parts[0]);
    const decimalPart = parts[1];

    let integerDisplay = '';
    if (isNaN(integerPart)) {
      integerDisplay = parts[0] === '-' ? '-' : '';
    } else {
      integerDisplay = integerPart.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    if (decimalPart != null) {
      return `${integerDisplay}.${decimalPart}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    if (this.hasError) {
      this.currentOperandEl.innerText = this.currentOperand;
      this.currentOperandEl.classList.add('text-rose-400', 'text-2xl');
      this.currentOperandEl.classList.remove('text-3xl', 'sm:text-4xl');
      this.previousOperandEl.innerText = '';
      return;
    }

    this.currentOperandEl.classList.remove('text-rose-400', 'text-2xl');

    // Smooth UX: when waiting for next operand, keep previous operand visible
    const displayVal = this.currentOperand !== '' 
      ? this.currentOperand 
      : (this.previousOperand !== '' ? this.previousOperand : '0');

    const formattedVal = this.formatDisplayNumber(displayVal);

    // Dynamic responsive font sizing
    if (formattedVal.length > 14) {
      this.currentOperandEl.className = 'font-mono text-xl sm:text-2xl font-bold tracking-tight break-all transition-all duration-150 mt-1 select-all';
    } else if (formattedVal.length > 9) {
      this.currentOperandEl.className = 'font-mono text-2xl sm:text-3xl font-bold tracking-tight break-all transition-all duration-150 mt-1 select-all';
    } else {
      this.currentOperandEl.className = 'font-mono text-3xl sm:text-4xl font-bold tracking-tight break-all transition-all duration-150 mt-1 select-all';
    }

    this.currentOperandEl.innerText = formattedVal;

    if (this.operation != null) {
      this.previousOperandEl.innerText = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandEl.innerText = this.previousOperand;
    }
  }

  updateClearButton() {
    const acBtn = document.getElementById('btn-ac');
    if (!acBtn) return;
    if (this.currentOperand !== '0' && this.currentOperand !== '' && !this.overwrite) {
      acBtn.innerText = 'C';
      acBtn.title = 'Mevcut Girişi Temizle (Esc)';
    } else {
      acBtn.innerText = 'AC';
      acBtn.title = 'Hepsini Temizle (Esc)';
    }
  }

  highlightActiveOperator() {
    const operatorButtons = document.querySelectorAll('.btn-operator');
    operatorButtons.forEach(btn => {
      if (this.operation && btn.getAttribute('data-operator') === this.operation) {
        btn.classList.add('operator-active');
      } else {
        btn.classList.remove('operator-active');
      }
    });
  }

  // History management
  addHistoryRecord(record) {
    this.history.unshift(record);
    if (this.history.length > 30) this.history.pop();
    localStorage.setItem('calc_history', JSON.stringify(this.history));
    this.renderHistory();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
    this.renderHistory();
  }

  renderHistory() {
    const historyList = document.getElementById('history-list');
    const historyBadge = document.getElementById('history-badge');
    if (!historyList) return;

    if (this.history.length === 0) {
      historyList.innerHTML = '<p class="text-slate-500 text-center py-8 text-xs font-sans">Henüz işlem geçmişi yok</p>';
      if (historyBadge) historyBadge.classList.add('hidden');
      return;
    }

    if (historyBadge) historyBadge.classList.remove('hidden');

    historyList.innerHTML = this.history.map((item, index) => `
      <div class="history-card p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-white/10 transition cursor-pointer group" data-history-idx="${index}">
        <div class="text-xs text-slate-400 group-hover:text-slate-300 transition break-all">${item.expression}</div>
        <div class="text-base font-bold text-cyan-400 group-hover:text-cyan-300 transition break-all mt-0.5">= ${this.formatDisplayNumber(item.result)}</div>
      </div>
    `).join('');

    // Attach click listeners to restore result to calculator
    historyList.querySelectorAll('.history-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = card.getAttribute('data-history-idx');
        const item = this.history[idx];
        if (item) {
          this.currentOperand = item.result;
          this.previousOperand = '';
          this.operation = undefined;
          this.overwrite = true;
          this.highlightActiveOperator();
          this.updateDisplay();
          this.sound.playClick('num');
          // Close history drawer
          document.getElementById('history-panel').classList.add('hidden');
        }
      });
    });
  }
}

// Initialize Application once DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const previousOperandEl = document.getElementById('previous-operand');
  const currentOperandEl = document.getElementById('current-operand');
  const calc = new Calculator(previousOperandEl, currentOperandEl);

  // Setup initial displays and history
  calc.updateDisplay();
  calc.renderHistory();

  // Button Click Handlers
  // 1. Number Buttons
  document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
      calc.sound.playClick('num');
      triggerButtonPressEffect(button);
      calc.appendNumber(button.getAttribute('data-number'));
    });
  });

  // 2. Operator Buttons (+, -, ×, ÷)
  document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
      calc.sound.playClick('op');
      triggerButtonPressEffect(button);
      calc.chooseOperation(button.getAttribute('data-operator'));
    });
  });

  // 3. Action Buttons (AC, Delete, Decimal, Sign, Percent, Equals)
  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      triggerButtonPressEffect(button);

      switch (action) {
        case 'all-clear':
          calc.sound.playClick('func');
          calc.clearEntry();
          break;
        case 'delete':
          calc.sound.playClick('func');
          calc.delete();
          break;
        case 'decimal':
          calc.sound.playClick('num');
          calc.appendDecimal();
          break;
        case 'toggle-sign':
          calc.sound.playClick('func');
          calc.toggleSign();
          break;
        case 'percent':
          calc.sound.playClick('func');
          calc.applyPercent();
          break;
        case 'calculate':
          calc.sound.playClick('equals');
          calc.compute(true);
          break;
      }
    });
  });

  // Visual button active animation helper
  function triggerButtonPressEffect(btn) {
    if (!btn) return;
    btn.classList.add('is-pressed');
    setTimeout(() => btn.classList.remove('is-pressed'), 140);
  }

  // Keyboard Mapping Support
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    let targetBtn = null;

    if (e.key >= '0' && e.key <= '9') {
      targetBtn = document.querySelector(`[data-number="${e.key}"]`);
      calc.sound.playClick('num');
      calc.appendNumber(e.key);
    } else if (e.key === '.' || e.key === ',') {
      targetBtn = document.getElementById('btn-decimal');
      calc.sound.playClick('num');
      calc.appendDecimal();
    } else if (e.key === '+') {
      targetBtn = document.getElementById('btn-add');
      calc.sound.playClick('op');
      calc.chooseOperation('+');
    } else if (e.key === '-') {
      targetBtn = document.getElementById('btn-subtract');
      calc.sound.playClick('op');
      calc.chooseOperation('−');
    } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
      targetBtn = document.getElementById('btn-multiply');
      calc.sound.playClick('op');
      calc.chooseOperation('×');
    } else if (e.key === '/') {
      e.preventDefault(); // Prevent browser quick search
      targetBtn = document.getElementById('btn-divide');
      calc.sound.playClick('op');
      calc.chooseOperation('÷');
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      targetBtn = document.getElementById('btn-equals');
      calc.sound.playClick('equals');
      calc.compute(true);
    } else if (e.key === 'Backspace') {
      targetBtn = document.getElementById('btn-delete');
      calc.sound.playClick('func');
      calc.delete();
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c' || e.key === 'Delete') {
      targetBtn = document.getElementById('btn-ac');
      calc.sound.playClick('func');
      calc.clearEntry();
    } else if (e.key === '%') {
      targetBtn = document.getElementById('btn-percent');
      calc.sound.playClick('func');
      calc.applyPercent();
    }

    if (targetBtn) {
      triggerButtonPressEffect(targetBtn);
    }
  });

  // Sound Toggle Controls
  const soundBtn = document.getElementById('sound-btn');
  const soundOnIcon = document.getElementById('sound-on-icon');
  const soundOffIcon = document.getElementById('sound-off-icon');

  function updateSoundUI(enabled) {
    if (enabled) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
      soundBtn.classList.remove('text-slate-600');
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
      soundBtn.classList.add('text-slate-600');
    }
  }

  updateSoundUI(calc.sound.enabled);

  soundBtn.addEventListener('click', () => {
    const isEnabled = calc.sound.toggle();
    updateSoundUI(isEnabled);
  });

  // Theme Toggle Controls
  const themeBtn = document.getElementById('theme-btn');
  const themeSunIcon = document.getElementById('theme-sun-icon');
  const themeMoonIcon = document.getElementById('theme-moon-icon');
  const htmlRoot = document.documentElement;

  // Restore saved theme or default to dark
  const savedTheme = localStorage.getItem('calc_theme') || 'dark';
  if (savedTheme === 'light') {
    htmlRoot.classList.remove('dark');
    themeSunIcon.classList.add('hidden');
    themeMoonIcon.classList.remove('hidden');
  } else {
    htmlRoot.classList.add('dark');
    themeSunIcon.classList.remove('hidden');
    themeMoonIcon.classList.add('hidden');
  }

  themeBtn.addEventListener('click', () => {
    const isDark = htmlRoot.classList.toggle('dark');
    localStorage.setItem('calc_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      themeSunIcon.classList.remove('hidden');
      themeMoonIcon.classList.add('hidden');
    } else {
      themeSunIcon.classList.add('hidden');
      themeMoonIcon.classList.remove('hidden');
    }
  });

  // History Drawer Controls
  const historyToggleBtn = document.getElementById('history-toggle-btn');
  const historyPanel = document.getElementById('history-panel');
  const closeHistoryBtn = document.getElementById('close-history-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  historyToggleBtn.addEventListener('click', () => {
    historyPanel.classList.toggle('hidden');
  });

  closeHistoryBtn.addEventListener('click', () => {
    historyPanel.classList.add('hidden');
  });

  clearHistoryBtn.addEventListener('click', () => {
    calc.clearHistory();
  });
});
