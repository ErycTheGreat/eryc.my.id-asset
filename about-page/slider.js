const slider = document.querySelector('.slider');
const slideTrack = document.querySelector('.slide-track');
const slides = document.querySelectorAll('.slide');
slides.forEach(slide => {
	const clone = slide.cloneNode(true);
	slideTrack.appendChild(clone);
});
let scrollAmount = 0;
const scrollSpeed = 60;
let lastTime = null;

function scrollSlider(time) {
	if (!lastTime) lastTime = time;
	const deltaTime = time - lastTime;
	lastTime = time;
	scrollAmount += (scrollSpeed * deltaTime) / 1000;
	if (scrollAmount >= slideTrack.scrollWidth / 2) {
		scrollAmount = 0;
	}
	slideTrack.style.transform = `translateX(-${scrollAmount}px)`;
	requestAnimationFrame(scrollSlider);
}
requestAnimationFrame(scrollSlider);
document.addEventListener("DOMContentLoaded", function() {
	let dpr = window.devicePixelRatio;
	if (dpr === 3.0) {
		let style = document.createElement("style");
		style.innerHTML = `
	   body::before {
	   left: -3%;
	   }
	   `;
		document.head.appendChild(style);
	}
});
