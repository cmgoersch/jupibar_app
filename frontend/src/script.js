
let its_on = 'no';

let img, toggleBtn, wrapper, stateLabel;
let timerId = null;
let startTime = null; // timestamp when Jupi was turned on

function updateUI(){
	if(!img) return;
	if(its_on === 'yes'){
		img.classList.remove('off');
		img.classList.add('on');
		if(toggleBtn) toggleBtn.textContent = 'STOP';
		if(wrapper) wrapper.setAttribute('aria-pressed','true');
		startCounter();
		updateFavicon();
	} else {
		img.classList.remove('on');
		img.classList.add('off');
		if(toggleBtn) toggleBtn.textContent = 'START';
		if(wrapper) wrapper.setAttribute('aria-pressed','false');
		stopCounter();
		updateFavicon();
	}
}

function formatTwo(n){ return String(n).padStart(2,'0'); }

function buildOpenMessage(ms){
	// ms -> hours, minutes, seconds
	const totalSec = Math.floor(ms/1000);
	const hours = Math.floor(totalSec/3600);
	const minutes = Math.floor((totalSec%3600)/60);
	const seconds = totalSec % 60;

	// build German message, hide hours if zero
	if(hours >= 1){
		const hLabel = hours === 1 ? 'Stunde' : 'Stunden';
		return `Die Jupi Bar ist seit ${hours} ${hLabel}, ${minutes} Minuten und ${seconds} Sekunden geöffnet.`;
	} else {
		return `Die Jupi Bar ist seit ${minutes} Minuten und ${seconds} Sekunden geöffnet.`;
	}
}

function startCounter(){
	// reset startTime to now every time we switch on
	startTime = Date.now();
	if(timerId) clearInterval(timerId);
	// update immediately
	if(stateLabel) stateLabel.textContent = buildOpenMessage(0);
	timerId = setInterval(()=>{
		if(!stateLabel || !startTime) return;
		const now = Date.now();
		stateLabel.textContent = buildOpenMessage(now - startTime);
	}, 1000);
}

function stopCounter(){
	if(timerId){ clearInterval(timerId); timerId = null; }
	startTime = null;
	if(stateLabel) stateLabel.textContent = 'Die Jupi Bar ist geschlossen. Wenn sie geöffnet ist erfährst du es hier.';
}

function toggle(){
	its_on = (its_on === 'yes') ? 'no' : 'yes';
	updateUI();
}

function setupDrag(el){
	if(!el) return;
	let isDown = false;
	let isDragging = false;
	let wasDragging = false; // used to suppress click after drag
	let startX = 0, startY = 0, startLeft = 0, startTop = 0;
	let origLeft = 0, origTop = 0;

	el.addEventListener('pointerdown', (e) => {
	// if pointerdown started on a link inside the stack, don't start drag here
	if(e.target && e.target.closest && e.target.closest('a')) return;
	if(e.button && e.button !== 0) return; // only left button
		el.setPointerCapture(e.pointerId);
		isDown = true;
		isDragging = false;
		startX = e.clientX;
		startY = e.clientY;

		const parent = el.parentElement;
		const pRect = parent.getBoundingClientRect();
		const elRect = el.getBoundingClientRect();

		// store original position relative to parent (or viewport)
		origLeft = elRect.left - pRect.left;
		origTop = elRect.top - pRect.top;
		startLeft = origLeft;
		startTop = origTop;
	});

	document.addEventListener('pointermove', (e) => {
		if(!isDown) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		// start actual dragging only after a small threshold to avoid clicks becoming drags
		if(!isDragging){
			if(Math.hypot(dx, dy) < 6) return; // not enough movement yet

			// initiate dragging
			isDragging = true;
			wasDragging = true;

			// convert current visual position to explicit left/top (px) relative to offsetParent
			const parent = el.parentElement;
			const pRect = parent.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			const currLeft = elRect.left - pRect.left;
			const currTop = elRect.top - pRect.top;
			// remove transform so left/top take effect
			el.style.left = currLeft + 'px';
			el.style.top = currTop + 'px';
			el.style.transform = 'none';
			startLeft = currLeft;
			startTop = currTop;
		}

		// now apply movement
		let newLeft = startLeft + dx;
		let newTop = startTop + dy;

		// clamp either to viewport (if fixed) or to parent bounds
		const isFixed = getComputedStyle(el).position === 'fixed';
		if(isFixed){
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const elRect = el.getBoundingClientRect();
			newLeft = Math.max(0, Math.min(newLeft, vw - elRect.width));
			newTop = Math.max(0, Math.min(newTop, vh - elRect.height));
		} else {
			const parent = el.parentElement;
			const pRect = parent.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			newLeft = Math.max(0, Math.min(newLeft, pRect.width - elRect.width));
			newTop = Math.max(0, Math.min(newTop, pRect.height - elRect.height));
		}

		el.style.left = newLeft + 'px';
		el.style.top = newTop + 'px';
	});

	document.addEventListener('pointerup', (e) => {
		if(!isDown) return;
		isDown = false;
		// keep wasDragging true for a short time to suppress click
		if(isDragging){
			setTimeout(()=>{ wasDragging = false; }, 50);
		}
		isDragging = false;
		try{ el.releasePointerCapture(e.pointerId); } catch(err){}
	});

	// expose wasDragging so click handler can check
	el._wasDragging = () => wasDragging;
}

document.addEventListener('DOMContentLoaded', () => {
	img = document.getElementById('jupi-logo');
	toggleBtn = document.getElementById('toggle-btn');
	wrapper = document.getElementById('stacked-logos');
	stateLabel = document.getElementById('state-label');

	// attach toggle handlers
	if(toggleBtn) toggleBtn.addEventListener('click', toggle);
	if(wrapper){
		// We keep the wrapper focusable for drag, but do NOT toggle on wrapper clicks or keys.
		// Clicking the GV link (inside the wrapper) still works because it's a normal anchor.
		// The Jupi state should only be changed via the bottom toggle button.
		// Therefore we intentionally do NOT attach a click or keydown handler that toggles here.
	}

	// enable drag on stacked element
	setupDrag(wrapper);

	// set initial favicon and UI
	updateUI();
});

// --- Favicon helper -------------------------------------------------
function setFaviconHref(href){
	if(!href) return;
	let link = document.getElementById('favicon');
	if(!link){
		link = document.createElement('link');
		link.id = 'favicon';
		link.rel = 'icon';
		document.head.appendChild(link);
	}
	link.href = href;

	// also update shortcut icon for compatibility
	let sc = document.querySelector('link[rel="shortcut icon"]');
	if(!sc){
		sc = document.createElement('link');
		sc.rel = 'shortcut icon';
		document.head.appendChild(sc);
	}
	sc.href = href;
}

function updateFavicon(){
	// switch between green (_G) and red (_R) variants
	const onHref = 'icons/Jupibar_Logo_R.svg';
	const offHref = 'icons/Jupibar_Logo_G.svg';
	setFaviconHref(its_on === 'yes' ? onHref : offHref);
}

// small dev helper
window.__jupi = {
	get state(){ return its_on },
	set state(v){ its_on = v; updateUI(); }
};
