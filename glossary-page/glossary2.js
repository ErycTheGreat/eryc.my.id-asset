const searchInput = document.getElementById('searchInput');
const glossaryItems = document.querySelectorAll('.glossary-item');
const sections = document.querySelectorAll('.glossary-section');
const alphabetLinks = document.querySelectorAll('.alphabet-index a:not(.inactive)');
const alphabetIndex = document.getElementById('alphabetIndex');
const scrollLeftBtn = document.getElementById('scrollLeftBtn');
const scrollRightBtn = document.getElementById('scrollRightBtn');
const container = document.querySelector('.container');

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

	const noResultsMessage = document.getElementById('noResultsMessage');
	if (!resultsFound && filter.trim() !== '') {
		noResultsMessage.style.display = 'block';
	} else {
		noResultsMessage.style.display = 'none';
	}

	// Force scroll to first result using Hard Math
	const firstVisibleSection = document.querySelector('.glossary-section:not([style*="display: none"])');
	if (firstVisibleSection && filter.trim() !== '') {
		container.scrollTo({ 
            top: firstVisibleSection.offsetTop - 130, 
            behavior: 'smooth' 
        });
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

// 3. Highlight Alphabet Index on Scroll (Using Hard Math)
const updateHighlightedIndex = () => {
	let current = '';
	const scrollPos = container.scrollTop;
	
	sections.forEach(section => {
        // If the container's scroll position passes the top of the section (minus our 130px header buffer)
		if (section.offsetTop - 140 <= scrollPos) {
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

// Keep active letter visible in the carousel
const scrollToVisible = (link) => {
	const linkPosition = link.getBoundingClientRect();
	const indexPosition = alphabetIndex.getBoundingClientRect();

	if (linkPosition.left < indexPosition.left) {
		alphabetIndex.scrollBy({ left: linkPosition.left - indexPosition.left, behavior: 'smooth' });
	} else if (linkPosition.right > indexPosition.right) {
		alphabetIndex.scrollBy({ left: linkPosition.right - indexPosition.right, behavior: 'smooth' });
	}
};

// 4. Smooth Anchor Scrolling on Alphabet Click (Using Hard Math)
alphabetLinks.forEach(link => {
	link.addEventListener('click', function(e) {
		e.preventDefault();
		const targetId = this.getAttribute('href').substring(1);
		const targetSection = document.getElementById(targetId);
		
		if (targetSection) {
			// Find the exact pixel height of the letter, subtract the 130px header, and force the scroll
			container.scrollTo({
                top: targetSection.offsetTop - 130,
                behavior: 'smooth'
            });
		}
	});
});

// 5. Clean Accordion Logic
glossaryItems.forEach(item => {
	const heading = item.querySelector('h3');
	
	heading.addEventListener('click', () => {
		glossaryItems.forEach(otherItem => {
			if (otherItem !== item) {
				otherItem.classList.remove('active');
			}
		});
		item.classList.toggle('active');
	});
});

// 6. Event Listeners attached explicitly to the container
if (container) {
	container.addEventListener('scroll', updateHighlightedIndex);
}

document.addEventListener('DOMContentLoaded', () => {
	updateHighlightedIndex();
});
