const options = document.querySelectorAll(".option");
		let currentIndex = 0; 
		let intervalId; 
		let isAutoPlaying = false; 
		
		// NEW: The Watchdog Timer
		let watchdogId; 

		const blinkingArrow = document.createElement("span"); 
		blinkingArrow.classList.add("blinking-arrow");
		blinkingArrow.textContent = "▶";

		function appendArrowToOption(index) {
			options.forEach(option => {
				if (option.contains(blinkingArrow)) {
					option.removeChild(blinkingArrow);
				}
			});
			options[index].prepend(blinkingArrow);
		}

		function toggleArrow() {
			currentIndex = (currentIndex + 1) % options.length;
			appendArrowToOption(currentIndex);
		}

		function startAutoToggle() {
			if (isAutoPlaying) return; 
			isAutoPlaying = true;
			clearInterval(watchdogId); // Stop the watchdog when playing
			clearInterval(intervalId);
			intervalId = setInterval(toggleArrow, 3000);
		}

		function stopAutoToggle() {
			isAutoPlaying = false;
			clearInterval(intervalId);
			startWatchdog(); // Wake up the watchdog to sniff for the glow turning off!
		}

		// NEW: This checks the actual CSS state of the options every 500ms
		function startWatchdog() {
			clearInterval(watchdogId);
			watchdogId = setInterval(() => {
				// Check if ANY option currently has the CSS :hover or :active state
				const isAnyOptionGlowing = Array.from(options).some(opt => 
					opt.matches(':hover') || opt.matches(':active')
				);

				// If the browser turned the glow off, but our auto-player is still stopped...
				if (!isAnyOptionGlowing && !isAutoPlaying) {
					clearInterval(watchdogId); // Kill the watchdog
					toggleArrow(); // Force the immediate jump
					startAutoToggle(); // Resume the patrol
				}
			}, 500); // Checks twice a second
		}

		// Initial setup
		appendArrowToOption(currentIndex);
		startAutoToggle();

		// Event Listeners for the Options
		options.forEach((option, index) => {
			// Desktop Hover
			option.addEventListener("mouseenter", () => {
				stopAutoToggle();
				currentIndex = index; 
				appendArrowToOption(currentIndex);
			});
			
			// Mobile Tap
			option.addEventListener("touchstart", () => {
				stopAutoToggle();
				currentIndex = index;
				appendArrowToOption(currentIndex);
			});
		});

		// Lazy Load Image Script
		// Lazy Load Image Script (Edge-Optimized)
		document.addEventListener("DOMContentLoaded", () => {
			const avatar = document.querySelector(".lazy-avatar");
			
			// Safety check: Only run if the avatar actually exists!
			if (avatar && avatar.dataset.src) {
				const img = new Image();
				img.src = avatar.dataset.src;

				img.onload = () => {
					avatar.src = img.src;
					avatar.classList.add("loaded");
				};
			}
		});
