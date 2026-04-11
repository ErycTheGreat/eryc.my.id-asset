const app = document.querySelector("#app");
const delay = ms => new Promise(res => setTimeout(res, ms));
// The master list of available terminal commands
const availableCommands = ["clear", "ls", "matrix", "proof", "scan", "sudo", "skill", "sysinfo", "whoami"];
app.addEventListener("keypress", async function(event) {
	if (event.key === "Enter") {
		// If Matrix is active, stop processing the terminal command!
		if (matrixInterval) return;
		await delay(100);
		// 1. ADD 'await' HERE. This tells the terminal to wait for any long functions inside it to finish.
		await getInputValue();
		removeInput();
		await delay(100);
		new_line();
	}
});
// --- PASTE THE NEW TAB LISTENER RIGHT HERE ---
app.addEventListener("keydown", function(event) {
	if (event.key === "Tab") {
		event.preventDefault(); // Stops the browser from changing focus
		const input = document.querySelector("input");
		if (!input || input.disabled) return;
		const typedText = input.value.toLowerCase();
		if (typedText === "") return;
		const match = availableCommands.find(cmd => cmd.startsWith(typedText));
		if (match) {
			input.value = match;
			input.dispatchEvent(new Event("input")); // ADD THIS: Forces your custom mirror to update instantly!
		}
	}
});
// Leave your click listener exactly like this!
app.addEventListener("click", function(event) {
	const input = document.querySelector("input");
	if (input) input.focus(); // (Added a quick 'if' check just so it doesn't error while the scan runs)
});
async function open_terminal() {  // 1. Get Real-Time System Date (Local Time)
	 
	const now = new Date(); 
	const pad = (n) => n.toString().padStart(2, '0'); 
	const dateString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;  // 2. Create the element and attach the CSS spinner
	 
	const p = document.createElement("p"); 
	p.setAttribute("class", "spinner"); 
	p.textContent = `ERYC-OS v1.0b [${dateString}]`; 
	app.appendChild(p);  // 3. Wait a tiny bit just for a smooth "boot" pacing
	 
	await delay(800);
	// 4. Continue with the rest of your boot sequence
	 
	createText("<div style='height: 1.5em;'></div>Type or Click a command:");  
	createCode("> whoami", "Eryc – In a Nutshell."); 
	createCode("> proof", "My qualifications."); 
	createCode("> skill", "Unlocked skills so far."); 
	await delay(500); 
	createText("<div style='height: 1.5em;'></div>Type 'ls' to list commands <div style='height: 1em;'></div>"); 
	await delay(500); 
	new_line();
}
async function runSystemScan() {
	createText("<span class='blue'>Analyzing hardware...<br/>> potato-grade detected</span>");
	await delay(800);
	// 1. Hardware Metrics
	const cores = navigator.hardwareConcurrency || "Hidden";
	const ram = navigator.deviceMemory || "Hidden";
	createText(`<div class='scan-grid'><span class='scan-label'>CPU  : </span><span class='blue'>${cores} Cores</span></div>`);
	await delay(300);
	createText(`<div class='scan-grid'><span class='scan-label'>RAM  : </span><span class='blue'>~${ram} GB RAM</span></div>`);
	await delay(300);
	// 2. Display Metrics
	const screenW = window.screen.width;
	const screenH = window.screen.height;
	createText(`<div class='scan-grid'><span class='scan-label'>RES  : </span><span class='blue'>${screenW}x${screenH}</span></div>`);
	await delay(300);
	// 3. The WebGL GPU Trick
	let gpu = "Unknown/Blocked";
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		if (gl) {
			const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
			if (debugInfo) {
				gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
			}
		}
	} catch (e) {}
	createText(`<div class='scan-grid'><span class='scan-label'>GPU  : </span><span class='blue'>${gpu}</span></div>`);
	await delay(600);
	// 4. Network & Location Ping
	createText("<br/>Resolving geodata...<br/>> Life difficulty: nightmare");
	await delay(800);
	try {
		const response = await fetch('https://ipapi.co/json/');
		const data = await response.json();
		createText(`<div class='scan-grid'><span class='scan-label'>IPv4 : </span><span class='blue'>${data.ip}</span></div>`);
		await delay(200);
		createText(`<div class='scan-grid'><span class='scan-label'>LOC  : </span><span class='blue'>${data.city}, ${data.region}, ${data.country_name}</span></div>`);
		await delay(200);
		createText(`<div class='scan-grid'><span class='scan-label'>ISP  : </span><span class='blue'>${data.org}</span></div>`);
	} catch (e) {
		createText("<span class='error'>Network scan blocked by client firewall.</span>");
	}
}

function new_line() {
	const p = document.createElement("p");
	const span1 = document.createElement("span");
	const span2 = document.createElement("span");
	p.setAttribute("class", "path");
	p.textContent = "#eryc";
	span1.textContent = "@terminal:";
	span2.textContent = "~$";
	p.appendChild(span1);
	p.appendChild(span2);
	app.appendChild(p);
	const div = document.createElement("div");
	div.setAttribute("class", "type");
	const i = document.createElement("i");
	i.setAttribute("class", "fa fa-angle-right icone");
	// --- Custom Block Cursor Logic ---
	const inputContainer = document.createElement("div");
	inputContainer.setAttribute("class", "input-container");
	// ADD THIS: Create the ghost element
	const ghost = document.createElement("span");
	ghost.setAttribute("class", "ghost-suggestion");
	const input = document.createElement("input");
	input.setAttribute("autocomplete", "off");
	input.setAttribute("spellcheck", "false");
	const mirrorWrapper = document.createElement("div");
	mirrorWrapper.setAttribute("class", "input-mirror-wrapper");
	// 1. ADD THE CLASS HERE
	const textBefore = document.createElement("span");
	textBefore.setAttribute("class", "text-before-cursor");
	// 2. DELETE THESE THREE LINES completely:
	// const cursor = document.createElement("span");
	// cursor.setAttribute("class", "custom-cursor");
	// cursor.innerHTML = "&nbsp;"; 
	const textAfter = document.createElement("span");
	mirrorWrapper.appendChild(textBefore);
	// 3. DELETE THIS LINE completely:
	// mirrorWrapper.appendChild(cursor); 
	mirrorWrapper.appendChild(textAfter);
	// Update the visual cursor position based on the real hidden input
	function updateCursor() {
		textBefore.textContent = input.value.substring(0, input.selectionStart);
		textAfter.textContent = input.value.substring(input.selectionEnd);
		// ADD THIS: The Ghost Text Matching Logic
		const typedText = input.value.toLowerCase();
		if (typedText === "") {
			ghost.textContent = "";
		} else {
			const match = availableCommands.find(cmd => cmd.startsWith(typedText));
			ghost.textContent = match ? match : "";
		}
		// Use setTimeout to ensure the browser has updated the native scrollLeft before reading it
		setTimeout(() => {
			mirrorWrapper.style.transform = `translateX(-${input.scrollLeft}px)`;
			// ADD THIS: Keep the ghost text scrolling perfectly with your input
			ghost.style.transform = `translateX(-${input.scrollLeft}px)`;
		}, 0);
	}
	// Track typing, arrow keys, and mouse clicks
	input.addEventListener("input", updateCursor);
	input.addEventListener("keyup", updateCursor);
	input.addEventListener("keydown", updateCursor);
	input.addEventListener("click", updateCursor);
	inputContainer.appendChild(ghost); // Append ghost first so it stays in the background
	inputContainer.appendChild(input);
	inputContainer.appendChild(mirrorWrapper);
	div.appendChild(i);
	div.appendChild(inputContainer);
	// --- End Custom Block Cursor Logic ---
	app.appendChild(div);
	input.focus();
}

function removeInput() {
	const div = document.querySelector(".type");
	app.removeChild(div);
}
async function getInputValue() {
	const value = document.querySelector("input").value;
	if (value === "ls") {
		trueValue(value);
		createCode("> whoami", "Eryc – In a Nutshell.");
		createCode("> proof", "My qualifications.");
		createCode("> skill", "Unlocked skills so far");
		createCode("> scan", "Run system diagnostic.");
		createCode("> clear", "Clean the terminal.");
	} else if (value === "skill") {
		trueValue(value);
		createText("<span class='blue'> Skills: </span> • Data Analysis • Google Analytics • SEO • TikTok Marketing • Funnel Optimization • User Personas • Content Strategy • Content Creation • Data Story Telling");
		createText("<span class='blue'> Trasferable Skills: </span> • Critical Thinking • Problem Solving • Business Analysis • Business Acumen");
	} else if (value === "whoami") {
		trueValue(value);
		createText("I wear two hats: Engineer & Digital Marketer. My engineering roots fuel my <span class='blue'>data-driven strategies</span>, allowing me to engineer <span class='blue'>constraint-bypassing web architectures</span> and <span class='blue'>full-stack funnels</span>. The result? Scalable, measurable business solutions. The core? Deep, honest understanding through empathy. <span class='blue'>No B.S.</span>");
		createText("<a href='https://drive.google.com/uc?id=1jZGpfGOVA7SyieMhNXl5unk2EEe8E-OX&export=download' target='_blank'><i class='fa fa-file-pdf-o white'></i> Download Resume</a>");
	} else if (value === "dir") {
		trueValue(value);
		createText("Nice try.<br/>> try sudo");
	} else if (value === "proof") {
		trueValue(value);
		createText("<a href='' target='_blank'><i class='fa fa-graduation-cap white'></i> Bachelor of Engineering - BE, Electrical & Electronics Engineering</a>");
		createText("<a href='https://www.coursera.org/account/accomplishments/verify/J72RMZM37829' target='_blank'><i class='fa fa-google white'></i> Google Digital Marketing & E-commerce Professional Certificate</a>");
		createText("<a href='https://skillshop.exceedlms.com/student/award/PPxPty4xaKJ7UvXnT6XU6UpY' target='_blank'><i class='fa fa-google'></i> Google Digital Academy (Skillshop) - Fundamentals of digital marketing</a>");
		createText("<br>");
		createText("The real proof isn't a certificate—it's the terminal you are reading right now.");
		createText("This site is a live demonstration of <span class='blue'>Edge SEO</span>. It runs on a locked-down platform, bypassed at the CDN layer using my <span class='blue'>Asymmetric Ghost Payload (AGP)</span> architecture.");
		createText("Want to see how the system routes human execution versus crawler ingestion? Check the <a href='https://github.com/ErycTheGreat/eryc.my.id-asset' target='_blank'><i class='fa fa-github white'></i> GitHub docs</a> or parse my <a href='https://www.eryc.my.id/llm.txt' target='_blank'><i class='fa fa-terminal white'></i> llm.txt</a>.");
	} else if (value === "sudo" || value === "sudo su") {
		// Hide the real input cursor
		document.querySelector(".type").style.display = "none";
		// Hide the header elements for the cinematic scene!
		document.querySelectorAll("p.spinner").forEach(e => e.style.display = "none");
		document.querySelectorAll("p").forEach(e => {
			if (e.innerHTML.includes("Type 'ls'")) e.style.display = "none";
		});
		// Clear the rest of the screen
		clearScreen();
		await delay(1000);
		await typeWriter("Wake up, Neo...");
		await delay(2500);
		// --- NEW: Specifically delete the previous typing line! ---
		document.querySelectorAll(".matrix-typing").forEach(e => e.parentNode && e.parentNode.removeChild(e));
		await delay(500);
		await typeWriter("The Matrix has you...");
		await delay(2500);
		// --- NEW: Specifically delete the previous typing line! ---
		document.querySelectorAll(".matrix-typing").forEach(e => e.parentNode && e.parentNode.removeChild(e));
		await delay(500);
		await typeWriter("Knock, knock, Neo.");
		await delay(1500);
		// Clear the last line and trigger the falling code!
		document.querySelectorAll(".matrix-typing").forEach(e => e.parentNode && e.parentNode.removeChild(e));
		startMatrixEffect();
	} else if (value === "matrix") {
		trueValue(value);
		startMatrixEffect(); // Start the Matrix effect
	} else if (value === "scan" || value === "sysinfo") {
		trueValue(value);
		await runSystemScan();
	} else if (value === "clear") {
		clearScreen(); // Uses your new smart clear function!
	} else {
		falseValue(value);
		createText(`command not found: ${value}`);
	}
}

function trueValue(value) {
	const div = document.createElement("section");
	div.setAttribute("class", "type2");
	const i = document.createElement("i");
	i.setAttribute("class", "fa fa-angle-right icone");
	const mensagem = document.createElement("h2");
	mensagem.setAttribute("class", "sucess");
	mensagem.textContent = `${value}`;
	div.appendChild(i);
	div.appendChild(mensagem);
	app.appendChild(div);
}

function falseValue(value) {
	const div = document.createElement("section");
	div.setAttribute("class", "type2");
	const i = document.createElement("i");
	i.setAttribute("class", "fa fa-angle-right icone error");
	const mensagem = document.createElement("h2");
	mensagem.setAttribute("class", "error");
	mensagem.textContent = `${value}`;
	div.appendChild(i);
	div.appendChild(mensagem);
	app.appendChild(div);
}

function createText(text, classname) {
	const p = document.createElement("p");
	p.innerHTML = text;
	app.appendChild(p);
}

function createCode(code, text) {
	const p = document.createElement("p");
	p.setAttribute("class", "code");
	const cleanCommand = code.replace("> ", "").trim();
	// Notice the new <span class="rpg-cursor">&gt;</span> we injected right before the command!
	p.innerHTML = `<span class="clickable-cmd" onclick="handleCommandClick('${cleanCommand}')"><span class="rpg-cursor">&gt;</span> ${cleanCommand}</span> <span class='text'>${text}</span>`;
	app.appendChild(p);
}
async function handleCommandClick(cmd) {
	const input = document.querySelector("input");
	// 1. SAFETY CHECK: If the terminal is already busy (input disabled or missing), ignore the click!
	if (!input || input.disabled) return;
	// 2. Visually drop the clicked command into the text box
	input.value = cmd;
	// 3. Instantly freeze the input so they can't type or click anything else
	input.disabled = true;
	await delay(150);
	// 4. Run the exact same sequence we use for the "Enter" key!
	await getInputValue();
	removeInput();
	await delay(150);
	new_line();
}
open_terminal();
// --- Smart Screen Clear ---
function clearScreen() {
	// 1. Delete all paragraphs EXCEPT the spinner and the 'ls' instructions
	document.querySelectorAll("p").forEach(e => {
		if (!e.classList.contains("spinner") && !e.innerHTML.includes("Type 'ls'")) {
			e.parentNode && e.parentNode.removeChild(e);
		}
	});
	// 2. Delete all the echoed commands (like "> sudo" or "> clear")
	document.querySelectorAll("section").forEach(e => {
		e.parentNode && e.parentNode.removeChild(e);
	});
}
async function typeWriter(text) {
	const p = document.createElement("p");
	p.className = "matrix-typing"; // <-- ADD THIS NEW LINE!
	p.style.color = "#00bba9";
	app.appendChild(p);
	// Type out the characters one by one
	for (let i = 0; i < text.length; i++) {
		p.innerHTML = `<span class="text-before-cursor">${text.substring(0, i + 1)}</span>`;
		app.scrollTop = app.scrollHeight;
		await delay(50 + Math.random() * 100);
	}
	p.innerHTML = text;
}
// Matrix effect
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");
// Set canvas dimensions to match the viewport
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
// Initialize canvas size
resizeCanvas();
// Matrix characters: Katakana, Numbers, and Latin Letters
const matrixChars = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1); // Initialize drops array
// Set the solid background color once at the beginning
ctx.fillStyle = "#060522";
ctx.fillRect(0, 0, canvas.width, canvas.height);
// Secret message setup
const secretMessage = "follow the white rabbit".split(""); // Convert to array of characters
let messageStartTime = null; // To track when the message should start displaying
let letterFadeProgress = Array(secretMessage.length).fill(0); // Array to track opacity per letter
const letterFadeSpeed = 0.02; // Speed of fade-in per frame
const letterDelay = 500; // Delay in milliseconds between each letter
function drawMatrix() {
	// Clear the canvas with a semi-transparent black rectangle
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "rgba(6, 5, 34, 0.07)"; // Fading effect
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// Draw the Matrix characters
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "#00bba9"; // Green text color
	ctx.font = fontSize + "px 'White Rabbit Local', sans-serif";
	for (let i = 0; i < drops.length; i++) {
		const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
		ctx.fillText(text, i * fontSize, drops[i] * fontSize);
		// Reset drop if it goes below the canvas and a random condition is met
		if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
			drops[i] = 0;
		}
		drops[i]++;
	}
	// Start showing the secret message after 3 seconds
	if (!messageStartTime) {
		messageStartTime = Date.now();
	}
	// After 3 seconds, begin displaying the secret message
	const elapsedTime = Date.now() - messageStartTime;
	if (elapsedTime >= 3000) {
		ctx.globalCompositeOperation = "source-over";
		ctx.font = "400 18px 'White Rabbit Local', sans-serif"; // Set font weight to 500
		// Calculate the position to center the message
		const textWidth = ctx.measureText(secretMessage.join("")).width;
		const xPos = (canvas.width - textWidth) / 2;
		const yPos = canvas.height / 2;
		// Draw the message letter by letter with a fade effect
		secretMessage.forEach((char, index) => {
			const letterAppearTime = 3000 + index * letterDelay; // When this letter should start appearing
			if (elapsedTime >= letterAppearTime) {
				if (letterFadeProgress[index] < 1) {
					letterFadeProgress[index] += letterFadeSpeed; // Increase opacity gradually
				}
				ctx.fillStyle = `rgba(0, 187, 169, ${Math.min(letterFadeProgress[index], 1)})`; // Apply fade effect
				ctx.fillText(char, xPos + ctx.measureText(secretMessage.slice(0, index).join("")).width, yPos);
			}
		});
	}
}
let matrixInterval = null;
// Start Matrix effect
function startMatrixEffect() {
	// Clear any existing interval
	if (matrixInterval) {
		clearInterval(matrixInterval);
		matrixInterval = null;
	}
	// Reset the drops array
	columns = Math.floor(canvas.width / fontSize);
	drops = Array(columns).fill(1);
	letterFadeProgress = Array(secretMessage.length).fill(0); // Reset fade progress
	messageStartTime = null;
	// Start the new interval
	document.getElementById("matrixCanvas").style.display = "block";
	matrixInterval = setInterval(drawMatrix, 50);
}
// Stop Matrix effect on click or Enter key
document.addEventListener("click", stopMatrixEffect);
document.addEventListener("keypress", function(event) {
	if (event.key === "Enter") {
		stopMatrixEffect();
	}
});

function stopMatrixEffect() {
	if (matrixInterval) {
		clearInterval(matrixInterval);
		matrixInterval = null;
		// Hide the Matrix canvas
		document.getElementById("matrixCanvas").style.display = "none";
		// --- NEW: Bring the pinned header back to life! ---
		document.querySelectorAll("p.spinner").forEach(e => e.style.display = "block");
		document.querySelectorAll("p").forEach(e => {
			if (e.innerHTML.includes("Type 'ls'")) e.style.display = "block";
		});
		// --------------------------------------------------
		// Wipe the terminal (Leaves the restored header intact!)
		clearScreen();
		// Delete the orphaned input cursor
		const oldInput = document.querySelector(".type");
		if (oldInput && oldInput.parentNode) {
			oldInput.parentNode.removeChild(oldInput);
		}
		// Draw a fresh cursor
		new_line();
	}
}
// Resize canvas on window resize
window.addEventListener("resize", () => {
	resizeCanvas();
	// Reset columns and drops array on resize
	columns = Math.floor(canvas.width / fontSize);
	drops = Array(columns).fill(1);
});
