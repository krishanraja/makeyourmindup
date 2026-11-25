const state = new URLSearchParams(location.search).get('state');
const gate = document.querySelector('#gate');
const response = document.querySelector('#response');
const wrong = "That code didn't work.";
if (state === 'unlocked' || state === 'no-code') {
  gate.hidden = true;
  document.querySelector(state === 'unlocked' ? '#files' : '#closed').hidden = false;
}
if (state === 'wrong-code') setTimeout(() => response.textContent = wrong, 800);
document.querySelector('#code').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  response.textContent = '';
  await new Promise(resolve => setTimeout(resolve, 800));
  response.textContent = wrong;
  button.disabled = false;
});
