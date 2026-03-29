 // Constants
 const features = {
 	Technical: {
 		Starter: [{
 			text: "Delivery Time",
 			days: "2 days"
 		}, "Site SEO Audit", "Image Compression"],
 		Standard: [{
 			text: "Delivery Time",
 			days: "3 days"
 		}, "Site SEO Audit", "XML Sitemap", "Robots.txt", "Image Compression", "HTTPS Setup"],
 		Advanced: [{
 			text: "Delivery Time",
 			days: "5 days"
 		}, "Site SEO Audit", "Index Optimization", "XML Sitemap", "Robots.txt", "Image Compression", "HTTPS Setup", "Penalty Removal", ]
 	},
 	OnPage: {
 		Starter: [{
 			text: "Delivery Time",
 			days: "2 days"
 		}, {
 			text: "Number of Pages Optimized",
 			value: "1"
 		}, {
 			text: "Number of Keywords Researched",
 			value: "3"
 		}, "Title Optimization", "H1, H2, H3 Tags", "Meta Description", "Image Alt Tags"],
 		Standard: [{
 			text: "Delivery Time",
 			days: "5 days"
 		}, {
 			text: "Number of Pages Optimized",
 			value: "6"
 		}, {
 			text: "Number of Keywords Researched",
 			value: "6"
 		}, "Title Optimization", "H1, H2, H3 Tags", "Meta Description", "Image Alt Tags", "Page Audit"],
 		Advanced: [{
 			text: "Delivery Time",
 			days: "8 days"
 		}, {
 			text: "Number of Pages Optimized",
 			value: "12"
 		}, {
 			text: "Number of Keywords Researched",
 			value: "20"
 		}, "Title Optimization", "H1, H2, H3 Tags", "Meta Description", "Image Alt Tags", "Schema Markup", "Page Audit"]
 	},
 	CWV: { // New CWV SEO Tab
 		Starter: [{
 			text: "Delivery Time",
 			days: "3 days"
 		}, {
 			text: "Number of Revisions",
 			value: "1"
 		}, "Software Version Upgrade", "Browser Caching", "Resize Photos", "Minification", "Database Optimization"],
 		Standard: [{
 			text: "Delivery Time",
 			days: "7 days"
 		}, {
 			text: "Number of Revisions",
 			value: "2"
 		}, "Software Version Upgrade", "Browser Caching", "Resize Photos", "Minification", "Database Optimization"],
 		Advanced: [{
 			text: "Delivery Time",
 			days: "10 days"
 		}, {
 			text: "Number of Revisions",
 			value: "3"
 		}, "Software Version Upgrade", "Browser Caching", "Resize Photos", "Minification", "Database Optimization"]
 	}
 };
 const prices = {
 	Technical: {
 		Starter: 49,
 		Standard: 149,
 		Advanced: 249
 	},
 	OnPage: {
 		Starter: 49,
 		Standard: 199,
 		Advanced: 449
 	},
 	CWV: { // New CWV SEO Prices
 		Starter: 40,
 		Standard: 80,
 		Advanced: 150
 	}
 };
 const addOnPrices = {
 	Technical: {
 		Starter: 20,
 		Standard: 40,
 		Advanced: 50
 	},
 	OnPage: {
 		Starter: 0,
 		Standard: 0,
 		Advanced: 0
 	},
 	CWV: { // New CWV SEO Add-On Prices
 		Starter: 0,
 		Standard: 0,
 		Advanced: 0
 	}
 };
 // State
 let selectedTier = 'Starter';
 let isAddOnSelected = false;
 let currentTab = 'Technical';
 // Helper Functions
 function calculateDeliveryDate(daysToAdd) {
 	const today = new Date();
 	const deliveryDate = new Date(today);
 	deliveryDate.setDate(today.getDate() + daysToAdd);
 	const options = {
 		year: 'numeric',
 		month: 'short',
 		day: 'numeric'
 	};
 	return deliveryDate.toLocaleDateString('en-US', options);
 }

 function updateFeaturesList(featuresList, features) {
 	featuresList.innerHTML = features.map(feature => {
 		if (typeof feature === 'object' && feature.text === "Delivery Time") {
 			return `
	                   <li>
	                       <div class="delivery-line">
	                           <span class="delivery-text">${feature.text}<\/span>
	                           <span class="delivery-days">${feature.days}<\/span>
	                       <\/div>
	                   <\/li>
	               `;
 		} else if (typeof feature === 'object' && feature.value) {
 			return `
	                   <li class="no-checkmark">
	                       <div class="delivery-line">
	                           <span class="delivery-text">${feature.text}<\/span>
	                           <span class="delivery-days align-right">${feature.value}<\/span>
	                       <\/div>
	                   <\/li>
	               `;
 		} else {
 			return `<li>${feature}<\/li>`;
 		}
 	}).join('');
 }

 function updateDeliveryDate(daysToAdd) {
 	const deliveryDateElement = document.getElementById('delivery-date');
 	const formattedDate = calculateDeliveryDate(daysToAdd);
 	deliveryDateElement.textContent = `${daysToAdd} days delivery — ${formattedDate}`; // Use em dash here
 }

 function updateTotalPrice() {
 	const continueButton = document.querySelector('.continue-button');
 	const basePrice = prices[currentTab][selectedTier];
 	const addOnPrice = isAddOnSelected ? addOnPrices[currentTab][selectedTier] : 0;
 	const totalPrice = basePrice + addOnPrice;
 	continueButton.textContent = `Total ($${totalPrice})`;
 }
 // Main Functions
 function updateTier() {
 	const starter = document.getElementById('starter');
 	const standard = document.getElementById('standard');
 	const advanced = document.getElementById('advanced');
 	const featuresList = document.getElementById('features');
 	const addOnsSection = document.getElementById('add-ons-section');
 	const fastDeliveryPrice = document.getElementById('fast-delivery-price');
 	selectedTier = starter.checked ? 'Starter' : standard.checked ? 'Standard' : 'Advanced';
 	// Update prices under radio buttons based on the active tab
 	document.querySelectorAll('.tier-option').forEach(option => {
 		const tierName = option.querySelector('input[name="tier"]').value;
 		const priceElement = option.querySelector('.tier-price');
 		priceElement.textContent = `$${prices[currentTab][tierName]}`;
 	});
 	// Update add-on price dynamically
 	if (currentTab === 'Technical') {
 		fastDeliveryPrice.textContent = `+$${addOnPrices[currentTab][selectedTier]}`;
 	}
 	// Update features list
 	updateFeaturesList(featuresList, features[currentTab][selectedTier]);
 	// Update delivery date
 	const daysToAdd = parseInt(features[currentTab][selectedTier][0].days);
 	updateDeliveryDate(isAddOnSelected ? daysToAdd - 1 : daysToAdd); // Subtract 1 day if add-on is selected
 	// Update add-ons section visibility
 	addOnsSection.style.display = currentTab === 'Technical' ? 'block' : 'none';
 	// Update total price
 	updateTotalPrice();
 }

 function switchTab(tab) {
 	currentTab = tab === 'technical' ? 'Technical' : tab === 'onpage' ? 'OnPage' : 'CWV';
 	document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
 	document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add('active');
 	updateTier();
 }

 function selectAddOn() {
 	if (currentTab === 'Technical') {
 		const dropdownItem = document.querySelector('.dropdown-item');
 		isAddOnSelected = !isAddOnSelected;
 		dropdownItem.classList.toggle('active', isAddOnSelected);
 		// Update delivery date and total price
 		updateTier();
 	}
 }

 function handleContinue() {
 	const basePrice = prices[currentTab][selectedTier];
 	const addOnPrice = isAddOnSelected ? addOnPrices[currentTab][selectedTier] : 0;
 	const totalPrice = basePrice + addOnPrice;
 	alert(`Proceeding to payment for ${selectedTier} tier ($${totalPrice})`);
 	// Redirect to payment page or handle payment logic here
 }
 // Initialize
 switchTab('technical');
