/*
	Set `its_on` to either 'yes' or 'no' here.
	Einfach ändern: its_on = 'yes'  oder its_on = 'no'
*/
let its_on = 'no';

const img = document.getElementById('jupi-logo');
const toggleBtn = document.getElementById('toggle-btn');
const wrapper = document.getElementById('logo-toggle');
const stateLabel = document.getElementById('state-label');

function updateUI(){
	if(!img) return;
	if(its_on === 'yes'){
		img.classList.remove('off');
		img.classList.add('on');
		toggleBtn.textContent = 'AUS';
		wrapper.setAttribute('aria-pressed','true');
		stateLabel.textContent = 'yes';
	} else {
		img.classList.remove('on');
		img.classList.add('off');
		toggleBtn.textContent = 'AN';
		wrapper.setAttribute('aria-pressed','false');
		stateLabel.textContent = 'no';
	}
}

function toggle(){
	its_on = (its_on === 'yes') ? 'no' : 'yes';
	updateUI();
}

// Attach handlers if elements are present
if(toggleBtn){ toggleBtn.addEventListener('click', toggle); }
if(wrapper){
	wrapper.addEventListener('click', toggle);
	wrapper.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
}

// initial render
document.addEventListener('DOMContentLoaded', updateUI);

// Export for dev console if wanted
window.__jupi = { get state(){ return its_on }, set state(v){ its_on = v; updateUI(); } };
