const query = new URLSearchParams(location.search);
const state = query.get('state') || 'fresh';
const cards = document.querySelector('.cards');
const first = cards.firstElementChild;
if (state === 'one' || state === 'two') {
  [...cards.children].slice(state === 'one' ? 1 : 2).forEach(card => card.remove());
}
if (state === 'feed-down') {
  cards.outerHTML = '<p>This week\'s pieces are on Substack</p><a href="https://home.makeyourmindup.ai/archive">Read on Substack ↗</a>';
  document.querySelector('#recent').hidden = true;
}
if (state === 'nocover') {
  document.querySelector('.panel').classList.add('no-cover');
  const title = document.createElement('strong');
  title.textContent = first.querySelector('h3').textContent;
  first.querySelector('.photo').replaceChildren(title);
}
if (state === 'longtitle') first.querySelector('h3').innerHTML = 'Why did<br>pop songs<br>get shorter?';
if (state === 'nowatch') first.querySelectorAll('nav a:not(:first-child)').forEach(link => link.remove());
if (state === 'reduced') document.documentElement.classList.add('reduced');
if (query.get('grid') === '1') {
  const guides = document.createElement('div');
  guides.className = 'guides';
  guides.setAttribute('aria-hidden', 'true');
  guides.innerHTML = '<i></i>'.repeat(12);
  document.body.append(guides);
}
const sheet = document.querySelector('dialog');
const opener = document.querySelector('#open-sheet');
opener.addEventListener('click', event => {
  event.preventDefault();
  sheet.showModal();
  sheet.querySelector('input').focus();
});
document.querySelector('#close-sheet').onclick = () => sheet.close();
sheet.addEventListener('click', event => {
  if (event.target !== sheet) return;
  const box = sheet.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) sheet.close();
});
const updateHeader = () => document.body.classList.toggle('scrolled', scrollY > 80);
addEventListener('scroll', updateHeader, {passive:true});
updateHeader();
for (const form of document.querySelectorAll('.subscribe')) {
  const field = form.elements.email;
  const feedback = form.querySelector('small');
  const hint = feedback.textContent;
  function showInvalid() {
    field.setAttribute('aria-invalid','true');
    feedback.textContent = 'Check the email address.';
  }
  field.addEventListener('invalid', showInvalid);
  field.addEventListener('input', () => {
    field.removeAttribute('aria-invalid');
    feedback.textContent = hint;
  });
  form.addEventListener('submit', () => feedback.textContent = 'Check your inbox to confirm.');
  if (state === 'sub-invalid') { field.value = 'reader@'; showInvalid(); }
  if (state === 'sub-sent') feedback.textContent = 'Check your inbox to confirm.';
}
const panels = [...document.querySelectorAll('.panel')];
for (const panel of panels) {
  panel.name = 'recent-piece';
  panel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && matchMedia('(min-width:701px) and (hover:hover)').matches) panel.open = true;
  });
}

// Object-position is a percentage of the cropped distance, not of the source image.
const cropObserver = new ResizeObserver(entries => {
  for (const {target: image, contentRect: box} of entries) {
    if (!box.width || !box.height || !image.naturalWidth) continue;
    const [x, y] = image.dataset.focus.split(',').map(Number);
    const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight);
    function position(focus, size, viewport) {
      const overflow = size * scale - viewport;
      if (overflow <= 0) return 50;
      return 100 * Math.max(0, Math.min(1, (focus * size * scale - viewport / 2) / overflow));
    }
    image.style.objectPosition = position(x, image.naturalWidth, box.width) + '% ' +
      position(y, image.naturalHeight, box.height) + '%';
  }
});
for (const image of document.querySelectorAll('img[data-focus]')) {
  if (image.complete) cropObserver.observe(image);
  else image.addEventListener('load', () => cropObserver.observe(image), {once:true});
}
