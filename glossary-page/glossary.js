const searchInput = document.getElementById('searchInput');
												const glossaryItems = document.querySelectorAll('.glossary-item');
												const sections = document.querySelectorAll('.glossary-section');
												const alphabetLinks = document.querySelectorAll('.alphabet-index a');
												const alphabetIndex = document.getElementById('alphabetIndex');
												const scrollLeftBtn = document.getElementById('scrollLeftBtn');
												const scrollRightBtn = document.getElementById('scrollRightBtn');
												
								//Set iframe Height Dynamically 
								//  window.onload = function () {
								//document.body.style.height = document.body.scrollHeight + 'px';
								//};					
		
								// Unified Search & Filter Logic
							searchInput.addEventListener('input', () => {
								const filter = searchInput.value.toLowerCase();
								let resultsFound = false;

								// Loop through all glossary sections
								sections.forEach(section => {
									
									// SPECIAL CASE: Handle the "End of Glossary" duck banner
									if (section.id === 'end-of-glossary') {
										// Keep the duck visible at all times!
										section.style.display = ''; 
										return; // Skip the rest of the loop for this specific section
									}

									let hasMatchingItems = false;

									// Check each h3 within the regular sections
									const items = section.querySelectorAll('.glossary-item');
									items.forEach(item => {
										const term = item.querySelector('h3').textContent.toLowerCase();
										if (term.includes(filter)) {
											item.style.display = ''; // Show matching items
											hasMatchingItems = true; 
											resultsFound = true; // Trigger for the 404 message
										} else {
											item.style.display = 'none'; // Hide non-matching items
										}
									});

									// Hide or show the whole letter section (A, B, C) based on matches
									section.style.display = hasMatchingItems ? '' : 'none';
								});

								// Handle the Custom Cyberpunk 404 Message
								const noResultsMessage = document.getElementById('noResultsMessage');
								if (!resultsFound && filter.trim() !== '') {
									noResultsMessage.style.display = 'block'; 
								} else {
									noResultsMessage.style.display = 'none'; 
								}

								// Automatically scroll to the first visible section with an offset for desktop
								const firstVisibleSection = document.querySelector('.glossary-section:not([style*="display: none"])');
								if (firstVisibleSection && filter.trim() !== '') {
									const offset = 70; // Adjust this value to match your header or fixed element height
									const scrollToPosition = firstVisibleSection.getBoundingClientRect().top + window.pageYOffset - offset;
									window.scrollTo({
										top: scrollToPosition,
										behavior: 'smooth',
									});
								}
							});

												// Scroll left
												scrollLeftBtn.addEventListener('click', () => {
													alphabetIndex.scrollBy({ left: -150, behavior: 'smooth' });
												});

												// Scroll right
												scrollRightBtn.addEventListener('click', () => {
													alphabetIndex.scrollBy({ left: 150, behavior: 'smooth' });
												});

												// Function to update the highlighted index
												const updateHighlightedIndex = () => {
													let current = '';
													sections.forEach(section => {
														const sectionTop = section.offsetTop - 70;
														if (window.scrollY >= sectionTop) {
															current = section.getAttribute('id');
														}
													});

													// Highlight the corresponding alphabet link
													alphabetLinks.forEach(link => {
														link.classList.remove('active');
														if (link.getAttribute('href').substring(1) === current) {
															link.classList.add('active');
															// Ensure the active link is visible
															scrollToVisible(link);
														}
													});

													// If the scroll is at the top, make sure the 'A' link is highlighted
													if (window.scrollY === 0) {
														const firstLink = document.querySelector('.alphabet-index a[href="#' + sections[0].id + '"]');
														if (firstLink) {
															firstLink.classList.add('active');
															// Ensure the 'A' link is visible
															scrollToVisible(firstLink);
														}
													}
												};

												// Function to scroll the alphabet index so that the highlighted letter is visible
												const scrollToVisible = (link) => {
													const linkPosition = link.getBoundingClientRect();
													const indexPosition = alphabetIndex.getBoundingClientRect();

													// Check if the link is out of view on the left or right
													if (linkPosition.left < indexPosition.left) {
														// Scroll left to bring the link into view
														alphabetIndex.scrollBy({ left: linkPosition.left - indexPosition.left, behavior: 'smooth' });
													} else if (linkPosition.right > indexPosition.right) {
														// Scroll right to bring the link into view
														alphabetIndex.scrollBy({ left: linkPosition.right - indexPosition.right, behavior: 'smooth' });
													}
												};

												// Highlight the 'A' index by default on page load
												document.addEventListener('DOMContentLoaded', () => {
													// Highlight 'A' index when the page loads
													const firstSection = document.querySelector('.glossary-section');
													if (firstSection) {
														const firstLetter = firstSection.id.charAt(0).toUpperCase();
														const firstLink = document.querySelector(`.alphabet-index a[href='#${firstSection.id}']`);
														if (firstLink) firstLink.classList.add('active');
														// Ensure the 'A' link is visible
														scrollToVisible(firstLink);
													}
												});

												// Smooth scrolling to section h2 with offset
												alphabetLinks.forEach(link => {
													link.addEventListener('click', (e) => {
														e.preventDefault();
														const targetSection = document.querySelector(link.getAttribute('href'));
														if (!targetSection) return;

														const sectionHeading = targetSection.querySelector('h2');
														if (!sectionHeading) return;

														const offset = 	25;
														const scrollToPosition = sectionHeading.offsetTop - offset;
														window.scrollTo({
															top: scrollToPosition,
															behavior: 'smooth',
														});
													});
												});

												// Toggle glossary item visibility on click
												glossaryItems.forEach(item => {
													item.querySelector('h3').addEventListener('click', () => {
														item.classList.toggle('active');
													});
												});

												// Update highlighted index on scroll
												window.addEventListener('scroll', () => {
													updateHighlightedIndex();
												});										

							 // Ensure only one description is open at a time
							glossaryItems.forEach(item => {
								const heading = item.querySelector('h3');
								const description = heading.nextElementSibling;

								if (description && description.tagName === 'P') {
									// Initially hide all descriptions
									description.style.display = 'none';
								}

								heading.addEventListener('click', () => {
									// Close all other descriptions
									glossaryItems.forEach(otherItem => {
										if (otherItem !== item) {
											const otherDescription = otherItem.querySelector('p');
											if (otherDescription) {
												otherDescription.style.display = 'none';
												otherItem.querySelector('h3').classList.remove('active');
											}
										}
									});

									// Toggle visibility of the clicked description
									if (description) {
										const isOpen = description.style.display === 'block';
										description.style.display = isOpen ? 'none' : 'block';
										heading.classList.toggle('active', !isOpen);
									}
								});
							});
