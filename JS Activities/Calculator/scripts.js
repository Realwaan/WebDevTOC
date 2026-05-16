let currentInput = '';
let equationStr  = '';
let memory       = 0;
let memHasValue  = false;
let lastWasOp    = false;
let lastWasEq    = false;

const mainDisplay     = document.getElementById('mainDisplay');
const equationDisplay = document.getElementById('equationDisplay');
const memIndicator    = document.getElementById('memIndicator');

function tokenise(expr) {
  const tokens = [], ops = ['+','-','*','/'];
  let buf = '';
  for (const ch of expr) {
    if (ops.includes(ch)) {
      if (buf) tokens.push(buf);
      tokens.push(ch);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf) tokens.push(buf);
  return tokens;
}

function evalLTR(toks) {
  let r = parseFloat(toks[0]);
  for (let i = 1; i < toks.length - 1; i += 2) {
    const n = parseFloat(toks[i + 1]);
    if (toks[i] === '+') r += n;
    else if (toks[i] === '-') r -= n;
    else if (toks[i] === '*') r *= n;
    else r /= n;
  }
  return r;
}

function evalMDAS(tokens) {
  const toks = [...tokens];
  let i = 1;
  while (i < toks.length) {
    if (toks[i] === '*' || toks[i] === '/') {
      const a = parseFloat(toks[i - 1]), b = parseFloat(toks[i + 1]);
      toks.splice(i - 1, 3, String(toks[i] === '*' ? a * b : a / b));
    } else i += 2;
  }
  let r = parseFloat(toks[0]);
  for (let j = 1; j < toks.length - 1; j += 2) {
    const n = parseFloat(toks[j + 1]);
    if (toks[j] === '+') r += n;
    else r -= n;
  }
  return r;
}

function fmt(n) {
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  if (isNaN(n)) return 'Error';
  return parseFloat(n.toPrecision(10)).toString();
}

function render() {
  mainDisplay.textContent     = currentInput || '0';
  equationDisplay.textContent = equationStr.replace(/\*/g,'×').replace(/\//g,'÷');
  mainDisplay.style.fontSize  = currentInput.length > 12 ? '22px' : currentInput.length > 9 ? '28px' : '38px';
  memIndicator.classList.toggle('active', memHasValue);
}

function reset(full = false) {
  currentInput = '';
  lastWasOp = lastWasEq = false;
  if (full) equationStr = '';
  mainDisplay.classList.remove('result','error');
  render();
}

function showError() {
  equationStr = '';
  currentInput = '';
  lastWasOp = lastWasEq = false;
  mainDisplay.textContent = 'Error';
  mainDisplay.classList.add('error');
  equationDisplay.textContent = '';
}

function clearInput() { reset(); }
function allClear()   { reset(true); }

function backspace() {
  if (lastWasEq || lastWasOp) return;
  currentInput = currentInput.slice(0, -1);
  render();
}

function pressNum(d) {
  mainDisplay.classList.remove('result','error');
  if (lastWasEq) { currentInput = d; equationStr = ''; lastWasEq = lastWasOp = false; }
  else if (lastWasOp) { currentInput = d; lastWasOp = false; }
  else currentInput = currentInput === '0' ? d : currentInput + d;
  render();
}

function pressDecimal() {
  mainDisplay.classList.remove('result','error');
  if (lastWasEq) { currentInput = '0.'; equationStr = ''; lastWasEq = lastWasOp = false; render(); return; }
  if (lastWasOp || currentInput === '') { currentInput = '0.'; lastWasOp = false; render(); return; }
  if (!currentInput.includes('.')) currentInput += '.';
  else if (currentInput.endsWith('.')) currentInput = currentInput.slice(0, -1);
  render();
}

function pressOp(op) {
  mainDisplay.classList.remove('result','error');
  if (lastWasOp) {
    equationStr = equationStr.slice(0, -1) + op;
    highlightOp(op); render(); return;
  }
  if (lastWasEq) {
    equationStr = currentInput + op; lastWasEq = false; lastWasOp = true;
    highlightOp(op); render(); return;
  }
  const num = currentInput || '0';
  const expr = equationStr + num;
  if (!equationStr) {
    equationStr = num + op; currentInput = ''; lastWasOp = true;
    highlightOp(op); render(); return;
  }
  try {
    const r = evalLTR(tokenise(expr));
    if (!isFinite(r)) { showError(); return; }
    currentInput = fmt(r);
    equationStr  = currentInput + op;
    lastWasOp = true; lastWasEq = false;
  } catch { showError(); return; }
  highlightOp(op); render();
}

function pressEquals() {
  if (lastWasEq) return;
  const num  = currentInput || '0';
  const expr = equationStr + num;
  if (!equationStr) {
    currentInput = num; lastWasEq = true;
    mainDisplay.classList.add('result'); render(); return;
  }
  try {
    const r = evalMDAS(tokenise(expr));
    if (!isFinite(r)) { showError(); return; }
    equationStr  = expr + '=';
    currentInput = fmt(r);
    lastWasEq = true; lastWasOp = false;
  } catch { showError(); return; }
  mainDisplay.classList.add('result');
  clearOpHighlight(); render();
}

function memAdd()      { const v = parseFloat(currentInput || '0'); if (!isNaN(v)) { memory += v; memHasValue = true; } flashMem('btnMA'); render(); }
function memSubtract() { const v = parseFloat(currentInput || '0'); if (!isNaN(v)) { memory -= v; memHasValue = memory !== 0; } flashMem('btnMS'); render(); }
function memRecall()   { if (!memHasValue) return; currentInput = fmt(memory); lastWasEq = lastWasOp = false; render(); }
function memClear()    { memory = 0; memHasValue = false; flashMem('btnMC'); render(); }

function highlightOp(op) {
  const labels = { '+':'Add', '-':'Subtract', '*':'Multiply', '/':'Divide' };
  document.querySelectorAll('.btn-op').forEach(b => b.classList.toggle('active-op', b.title === labels[op]));
}

function clearOpHighlight() {
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active-op'));
}

function flashMem(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.color = '#FF6363';
  setTimeout(() => el.style.color = '', 400);
}

document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') pressNum(e.key);
  else if (e.key === '.') pressDecimal();
  else if ('+-*'.includes(e.key)) pressOp(e.key);
  else if (e.key === '/') { e.preventDefault(); pressOp('/'); }
  else if (e.key === 'Enter' || e.key === '=') pressEquals();
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') allClear();
  else if (e.key === 'Delete') clearInput();
});
