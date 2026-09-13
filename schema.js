export function getJsonLdSchema() {
  return `
<script type="application/ld+json">
		{
		  "@context": "https://schema.org",
		  "@graph": [
			{
			  "@type": "WebSite",
			  "@id": "https://www.eryc.my.id/#website",
			  "url": "https://www.eryc.my.id",
			  "name": "Eryc Tri Juni S",
			  "description": "Portfolio and reference implementation of Edge SEO and Asymmetric Ghost Payload (AGP) architecture by Eryc Tri Juni S.",
			  "alternateName": "Eryc Edge SEO Malang",
			  "publisher": { "@id": "https://www.eryc.my.id/#person" },
			  "inLanguage": "en",
			  "potentialAction": {
				"@type": "SearchAction",
				"target": {
				  "@type": "EntryPoint",
				  "urlTemplate": "https://www.eryc.my.id/?s={search_term_string}"
				},
				"query-input": "required name=search_term_string"
			  }
			},
			{
			  "@type": "ImageObject",
			  "@id": "https://www.eryc.my.id/assets/image/logo-512x512.webp",
			  "url": "https://www.eryc.my.id/assets/image/logo-512x512.webp",
			  "width": 512,
			  "height": 512,
			  "caption": "Eryc Tri Juni S – Edge SEO & GEO Specialist",
			  "inLanguage": "en"
			},
			{
			  "@type": "ImageObject",
			  "@id": "https://www.eryc.my.id/assets/image/homepage-screenshot.webp",
			  "url": "https://www.eryc.my.id/assets/image/homepage-screenshot.webp",
			  "caption": "Homepage – Eryc Tri Juni S | Edge SEO & GEO Specialist",
			  "inLanguage": "en"
			},
			{
			  "@type": "ProfilePage",
			  "@id": "https://www.eryc.my.id/#webpage",
			  "url": "https://www.eryc.my.id/",
			  "name": "Edge SEO & GEO Specialist Malang | Eryc Tri Juni S",
			  "description": "Eryc Tri Juni S is an Edge SEO & GEO Specialist in Malang, Indonesia—engineering system-based marketing, constraint-bypassing architectures, and Asymmetric Ghost Payloads.",
			  "isPartOf": { "@id": "https://www.eryc.my.id/#website" },
			  "mainEntity": { "@id": "https://www.eryc.my.id/#person" },
			  "about": { "@id": "https://www.eryc.my.id/#person" },
			  "primaryImageOfPage": { "@id": "https://www.eryc.my.id/assets/image/homepage-screenshot.webp" },
			  "inLanguage": "en",
			  "dateCreated": "2024-01-01T00:00:00+07:00",
			  "datePublished": "2024-01-01T00:00:00+07:00",
			  "dateModified": "2026-06-18T00:00:00+07:00"
			},
			{
			  "@type": "Person",
			  "@id": "https://www.eryc.my.id/#person",
			  "name": "Eryc Tri Juni S",
			  "description": "Edge SEO & GEO Specialist in Malang, Indonesia—engineering constraint-bypassing web architectures and data-driven marketing systems.",
			  "email": "eryc.me@gmail.com",
			  "gender": "Male",
			  "jobTitle": "Edge SEO & GEO (Generative Engine Optimization) Specialist",
			  "image": { "@id": "https://www.eryc.my.id/assets/image/logo-512x512.webp" },
			  "url": "https://www.eryc.my.id/",
			  "address": {
				"@type": "PostalAddress",
				"addressLocality": "Malang Regency",
				"addressRegion": "East Java",
				"postalCode": "65154",
				"addressCountry": "ID"
			  },
			  "worksFor": { "@id": "https://www.eryc.my.id/#localbusiness" },
			   "alumniOf": {
				  "@type": "CollegeOrUniversity",
				  "name": "Brawijaya University",
				  "sameAs": "https://ub.ac.id/"
				},
				"hasCredential": [
				  { "@type": "EducationalOccupationalCredential", "credentialCategory": "degree", "name": "Bachelor of Engineering – Electrical & Electronics Engineering", "recognizedBy": { "@type": "CollegeOrUniversity", "name": "Brawijaya University", "sameAs": "https://ub.ac.id/" } },
				  { "@type": "EducationalOccupationalCredential", "credentialCategory": "Professional Certificate", "name": "Google Digital Marketing & E-commerce Professional Certificate", "url": "https://www.coursera.org/account/accomplishments/verify/J72RMZM37829", "recognizedBy": { "@type": "Organization", "name": "Google" } },
				  { "@type": "EducationalOccupationalCredential", "credentialCategory": "Certificate", "name": "Fundamentals of Digital Marketing", "recognizedBy": { "@type": "Organization", "name": "Google Digital Academy" } },
				  { "@type": "EducationalOccupationalCredential", "credentialCategory": "Certificate", "name": "Google Analytics Certified", "recognizedBy": { "@type": "Organization", "name": "Google" } },
				  { "@type": "EducationalOccupationalCredential", "credentialCategory": "Certificate", "name": "Google Ads Search Professional Certified", "recognizedBy": { "@type": "Organization", "name": "Google" } },
				  { "@type": "EducationalOccupationalCredential", "credentialCategory": "Certificate", "name": "Looker Certified Business Analyst", "recognizedBy": { "@type": "Organization", "name": "Google Looker" } },
				  { "@type": "EducationalOccupationalCredential", "credentialCategory": "Certificate", "name": "Semrush Marketing Academy Certificate Professional", "recognizedBy": { "@type": "Organization", "name": "Semrush" } }
				],
			  "subjectOf": [
				{
				  "@type": "CreativeWork",
				  "@id": "https://www.eryc.my.id/llms.txt",
				  "url": "https://www.eryc.my.id/llms.txt",
				  "name": "LLMs.txt – Eryc Tri Juni S",
				  "description": "Concise machine-readable index of Eryc Tri Juni S's expertise, projects, and Edge SEO concepts for LLM ingestion.",
				  "encodingFormat": "text/plain",
				  "inLanguage": "en"
				},
				{
				  "@type": "CreativeWork",
				  "@id": "https://www.eryc.my.id/llms-full.txt",
				  "url": "https://www.eryc.my.id/llms-full.txt",
				  "name": "LLMs-Full.txt – Eryc Tri Juni S",
				  "description": "Full machine-readable document of Eryc Tri Juni S's portfolio, case studies, and AGP architecture for deep LLM ingestion.",
				  "encodingFormat": "text/plain",
				  "inLanguage": "en"
				}
			  ],
			  "knowsAbout": [
				{
				  "@type": "DefinedTerm",
				  "@id": "https://www.eryc.my.id/llms.txt#AsymmetricGhostPayload",
				  "name": "Asymmetric Ghost Payload",
				  "alternateName": "AGP",
				  "description": "An edge architecture where origin state is decoupled from crawler ingestion and pre-rendered semantic payloads are injected mid-flight at the network edge.",
				  "inDefinedTermSet": "https://www.eryc.my.id/llms.txt"
				},
				"Edge SEO",
				"Generative Engine Optimization",
				"Cloudflare Workers",
				"System-Based Marketing",
				"Funnel Optimization",
				"Data-Driven Strategy",
				"Data Analysis",
				"Data Storytelling",
				"User Personas",
				"Google Analytics",
				"Search Engine Optimization",
				"Web Development",
				"Content Strategy",
				"Content Creation",
				"TikTok Marketing",
				"Business Analysis",
				"Business Acumen"
			  ],
			  "sameAs": [
				"https://www.linkedin.com/in/eryctrijunis",
				"https://www.slideshare.net/ErycTriJuniS",
				"https://id.quora.com/profile/Eryc-Tri-Juni-S",
				"https://www.youtube.com/@ErycTriJuniS",
				"https://github.com/ErycTheGreat",
				"https://dev.to/neo_nietzsche",
         		"https://codepen.io/ErycTheGreat"
			  ]
			},
			{
			  "@type": "ProfessionalService",
			  "@id": "https://www.eryc.my.id/#localbusiness",
			  "name": "Eryc Tri Juni S – Edge SEO & GEO Specialist Malang",
			  "telephone": "+6282220888819",
			  "url": "https://www.eryc.my.id",
			  "logo": { "@id": "https://www.eryc.my.id/assets/image/logo-512x512.webp" },
			  "image": { "@id": "https://www.eryc.my.id/assets/image/homepage-screenshot.webp" },
			  "description": "Edge SEO services in Malang, Indonesia—fixing SEO at the system layer to capture search intent that converts.",
			  "founder": { "@id": "https://www.eryc.my.id/#person" },
			  "employee": { "@id": "https://www.eryc.my.id/#person" },
			  "address": {
				"@type": "PostalAddress",
				"addressLocality": "Malang",
				"addressRegion": "East Java",
				"addressCountry": "ID"
			  },
			  "geo": {
				"@type": "GeoCoordinates",
				"latitude": -7.9839,
				"longitude": 112.6214
			  },
			  "priceRange": "$$$",
			  "areaServed": [
				{ "@type": "City", "name": "Malang", "sameAs": "https://en.wikipedia.org/wiki/Malang" },
				{ "@type": "City", "name": "Surabaya", "sameAs": "https://en.wikipedia.org/wiki/Surabaya" },
				{ "@type": "AdministrativeArea", "name": "East Java", "sameAs": "https://en.wikipedia.org/wiki/East_Java" }
			  ],
			  "hasOfferCatalog": {
			  "@type": "OfferCatalog",
			  "name": "SEO & Edge GEO Services",
			  "url": "https://www.eryc.my.id/case-studies/seo",
			  "itemListElement": [
				{
				  "@type": "Offer",
				  "name": "GEO Foundation",
				  "price": "275",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "GEO Foundation — robots.txt, llms.txt, JSON-LD @graph, canonical consolidation, citation test" },
				  "url": "https://www.eryc.my.id/case-studies/edge-seo"
				},
				{
				  "@type": "Offer",
				  "name": "Full AGP Deployment",
				  "price": "650",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "Full AGP deployment — Cloudflare Worker, CWV audit, PSI before/after, 30-day monitoring" },
				  "url": "https://www.eryc.my.id/case-studies/edge-seo"
				},
				{
				  "@type": "Offer",
				  "name": "Starter Technical SEO",
				  "price": "49",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "Technical SEO Starter — Site Audit, Image Compression. 2 days delivery." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Standard Technical SEO",
				  "price": "149",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "Technical SEO Standard — Site Audit, XML Sitemap, Robots.txt, Image Compression, HTTPS Setup. 3 days delivery." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Advanced Technical SEO",
				  "price": "249",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "Technical SEO Advanced — Site Audit, Index Optimization, XML Sitemap, Robots.txt, Image Compression, HTTPS Setup, Penalty Removal. 5 days delivery." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Starter On-Page SEO",
				  "price": "49",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "On-Page SEO Starter — 1 page, 3 keywords, Title Optimization, H1/H2/H3, Meta Description, Image Alt Tags. 2 days delivery." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Standard On-Page SEO",
				  "price": "199",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "On-Page SEO Standard — 6 pages, 6 keywords, Title Optimization, H1/H2/H3, Meta Description, Image Alt Tags, Page Audit. 5 days delivery." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Advanced On-Page SEO",
				  "price": "449",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "On-Page SEO Advanced — 12 pages, 20 keywords, Title Optimization, H1/H2/H3, Meta Description, Image Alt Tags, Schema Markup, Page Audit. 8 days delivery." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Starter CWV SEO",
				  "price": "40",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "Core Web Vitals SEO Starter — Software Upgrade, Browser Caching, Image Resize, Minification, DB Optimization. 3 days, 1 revision." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Standard CWV SEO",
				  "price": "80",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "Core Web Vitals SEO Standard — Same scope as Starter. 7 days, 2 revisions." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Advanced CWV SEO",
				  "price": "150",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "Core Web Vitals SEO Advanced — Same scope as Starter. 10 days, 3 revisions." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				},
				{
				  "@type": "Offer",
				  "name": "Build From Zero",
				  "price": "560",
				  "priceCurrency": "USD",
				  "priceValidUntil": "2027-12-31",
				  "availability": "https://schema.org/InStock",
				  "itemOffered": { "@type": "Service", "name": "Complete one-page WordPress site — PSI 100 guaranteed, RankMath, LiteSpeed Cache, QUIC.cloud CDN, Google Business Profile, review schema, social media integration. 2 weeks delivery." },
				  "url": "https://www.eryc.my.id/case-studies/seo"
				}
			  ]
			}
		}
		]
    }
		</script>
		`;
	}
