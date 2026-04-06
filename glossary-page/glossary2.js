const searchInput = document.getElementById('searchInput');
const glossaryItems = document.querySelectorAll('.glossary-item');
const sections = document.querySelectorAll('.glossary-section');
const alphabetLinks = document.querySelectorAll('.alphabet-index a:not(.inactive)');
const alphabetIndex = document.getElementById('alphabetIndex');
const scrollLeftBtn = document.getElementById('scrollLeftBtn');
const scrollRightBtn = document.getElementById('scrollRightBtn');
const container = document.querySelector('.container'); // 🚨 NEW: We must target the container for scrolling!

// 1. Unified Search & Filter Logic
searchInput.addEventListener('input', () => {
	const filter = searchInput.value.toLowerCase();
	let resultsFound = false;

	sections.forEach(section => {
		if (section.id === 'end-of-glossary') {
			section.style.display = '';
			return; 
		}

		let hasMatchingItems = false;
		const items = section.querySelectorAll('.glossary-item');
		
		items.forEach(item => {
			const term = item.querySelector('h3').textContent.toLowerCase();
			if (term.includes(filter)) {
				item.style.display = ''; 
				hasMatchingItems = true;
				resultsFound = true; 
			} else {
				item.style.display = 'none'; 
			}
		});

		section.style.display = hasMatchingItems ? '' : 'none';
	});

	// Handle the Custom Cyberpunk 404 Message
	const noResultsMessage = document.getElementById('noResultsMessage');
	if (!resultsFound && filter.trim() !== '') {
		noResultsMessage.style.display = 'block';
	} else {
		noResultsMessage.style.display = 'none';
	}

	// 🚨 FIX: Auto-scroll to first result using scrollIntoView
	const firstVisibleSection = document.querySelector('.glossary-section:not([style*="display: none"])');
	if (firstVisibleSection && filter.trim() !== '') {
		firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
});

// 2. Scroll Left/Right Carousel
if (scrollLeftBtn && scrollRightBtn && alphabetIndex) {
	scrollLeftBtn.addEventListener('click', () => {
		alphabetIndex.scrollBy({ left: -150, behavior: 'smooth' });
	});
	scrollRightBtn.addEventListener('click', () => {
		alphabetIndex.scrollBy({ left: 150, behavior: 'smooth' });
	});
}

// 3. Highlight Alphabet Index on Scroll
const updateHighlightedIndex = () => {
	let current = '';
	
	sections.forEach(section => {
		// 🚨 FIX: Use getBoundingClientRect to check if the section is near the top of the screen
		const rect = section.getBoundingClientRect();
		// If the section is within the top 150px of the viewport, mark it as active
		if (rect.top <= 150 && rect.bottom >= 150) {
			current = section.getAttribute('id');
		}
	});

	alphabetLinks.forEach(link => {
		link.classList.remove('active');
		if (link.getAttribute('href').substring(1) === current) {
			link.classList.add('active');
			scrollToVisible(link);
		}
	});
};

// Function to keep active letter visible in the carousel
const scrollToVisible = (link) => {
	const linkPosition = link.getBoundingClientRect();
	const indexPosition = alphabetIndex.getBoundingClientRect();

	if (linkPosition.left < indexPosition.left) {
		alphabetIndex.scrollBy({ left: linkPosition.left - indexPosition.left, behavior: 'smooth' });
	} else if (linkPosition.right > indexPosition.right) {
		alphabetIndex.scrollBy({ left: linkPosition.right - indexPosition.right, behavior: 'smooth' });
	}
};

// 4. Smooth Anchor Scrolling on Alphabet Click
alphabetLinks.forEach(link => {
	link.addEventListener('click', function(e) {
		e.preventDefault();
		const targetId = this.getAttribute('href').substring(1);
		const targetSection = document.getElementById(targetId);
		
		if (targetSection) {
			// 🚨 FIX: Uses modern scrollIntoView so it works perfectly inside the container
			targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	});
});

// 5. Clean Accordion Logic (Only ONE loop needed)
glossaryItems.forEach(item => {
	const heading = item.querySelector('h3');
	
	heading.addEventListener('click', () => {
		// Close all other descriptions
		glossaryItems.forEach(otherItem => {
			if (otherItem !== item) {
				otherItem.classList.remove('active');
			}
		});
		// Toggle the clicked one (Let CSS handle the actual display animation!)
		item.classList.toggle('active');
	});
});

// 6. Event Listeners
// 🚨 FIX: Listen to the .container scrolling, NOT the window!
if (container) {
	container.addEventListener('scroll', updateHighlightedIndex);
}

document.addEventListener('DOMContentLoaded', () => {
	// Trigger the first calculation to highlight 'A'
	updateHighlightedIndex();
});
