const div = document.createElement('div');
div.innerHTML = `<div style='height: 50px; width: 50px; overflow: scroll; visibility: hidden'>
  <section style='height: 100px'></section>
</div>`;

document.body.appendChild(div);
const d = div.getElementsByTagName('div')[0];
const s = div.getElementsByTagName('section')[0];

const isScrollUgly = d.offsetWidth > s.offsetWidth;
// __logger.log(d.offsetWidth, s.offsetWidth);
document.body.removeChild(div);

export default isScrollUgly;


