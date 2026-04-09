                  // 1. Explicitly tell the JS file to fetch the font
                  const matrixFont = new FontFace('White Rabbit Local', 'url(https://www.eryc.my.id/assets/font/white-rabbit.woff2)');
                  
                  // 2. Force it into the document's font registry
                  matrixFont.load().then(function(loadedFont) {
                      document.fonts.add(loadedFont);
                      console.log("White Rabbit font securely loaded into JavaScript!");
                  }).catch(function(error) {
                      console.error("Font failed to load in JS. Check your URLs or CORS:", error);
                  });
const dialogues = [
                       { name: "Neo", avatar: "https://www.dropbox.com/scl/fi/v82xxogszj3prw54nje5v/eryctrijunis-neo-2-bg-blue.webp?rlkey=4pjytvnf9ipkxq4gk562knp5u&st=isvagyqm&raw=1", text: "Why do I speak, yet no one hears me?", align: "left" },
                       { name: "The_Architect", avatar: "https://www.dropbox.com/scl/fi/17x178xjw6b6ko7h1cvhx/eryctrijunis-the-architect2.webp?rlkey=5egh7ieebg09gqx5ae0lgw5ng&st=7lvnw7l8&raw=1", text: "Because you stand at the wrong gate, calling out to those who do not seek you.", align: "right" },
                       { name: "Neo", avatar: "https://www.dropbox.com/scl/fi/v82xxogszj3prw54nje5v/eryctrijunis-neo-2-bg-blue.webp?rlkey=4pjytvnf9ipkxq4gk562knp5u&st=isvagyqm&raw=1", text: "Then how shall I be found?", align: "left" },
                       { name: "The_Architect", avatar: "https://www.dropbox.com/scl/fi/vprb4ud7lo3aklcdvb2hy/eryctrijunis-the-architect-3-nobg.webp?rlkey=zya6upazg1eryftnxsytrew9z&st=wdx7lk3a&raw=1", text: "The secret isn't to chase visibility, but to become worthy of being seen...", align: "right" },
                       { name: "The_Architect", avatar: "https://www.dropbox.com/scl/fi/aivqc6b1u2td9yq4qqi2z/eryctrijunis-the-architect-4-nobg.webp?rlkey=4xxsr3lb3uidtvlzgyzya988d&st=8aiwrly0&raw=1", text: "For the Algorithm does not serve you; it serves those who seek.", align: "right" },
                       { name: "The_Architect", avatar: "https://www.dropbox.com/scl/fi/ddl6qv63lwmaumjumvs2d/eryctrijunis-the-architect-5-bg-blue.webp?rlkey=ky26weueu6dzexwxo71vtfhkp&st=w8xu9e6x&raw=1", text: "Align yourself with truth, and you shall be found.", align: "right" },
                       { name: "The_Architect", avatar: "https://www.dropbox.com/scl/fi/ldsf84vub6z7hmvfiypc7/eryctrijunis-the-architect-6-nobg.webp?rlkey=a7onvx8jb1y9a6l5n8qvwdzdq&st=y4exrpq4&raw=1", text: "Chase shadows, and you shall become one.", align: "right" },
                       { name: "Neo", avatar: "https://www.dropbox.com/scl/fi/kotgyntvygoiqp34xfk0h/eryctrijunis-neo-1-bg-blue.webp?rlkey=o36q020jub1cc5dgnw7d74fy2&st=w4dozbhp&raw=1", text: "I understand now... I must be the answer, not just an echo.", align: "left" }
                   ];

                   const avatarCache = {};

                   dialogues.forEach(d => {
                       const img = new Image();
                       img.src = d.avatar;
                       avatarCache[d.avatar] = img;
                   });

                   let currentIndex = 0;
                   const textContent = document.getElementById("text-content");
                   const textBox = document.getElementById("text-box");
                   const avatar = document.getElementById("avatar");
                   const cursor = document.getElementById("cursor");
                   const nextBtn = document.getElementById("next-btn");
                   const prevBtn = document.getElementById("prev-btn");
                   const characterContainer = document.getElementById("character-container");
                   const pressStart = document.getElementById("press-start");
                   const nameInput = document.getElementById("name-input");
                   const nameInputBox = document.getElementById("name-input-box");

                   const originalPlaceholder = nameInputBox.placeholder;
                   const preloadedBG = new Image();
                   preloadedBG.src = "https://dl.dropboxusercontent.com/scl/fi/2bkgl4ltkftldq777rkbh/eryctrijunis-mr.smith-bg.gif?rlkey=223hnunccxf2q645lm2lg9lxy&st=vehiiii1";

                   nameInputBox.addEventListener("focus", function(){
                       this.placeholder = "";
                   });

                   nameInputBox.addEventListener("blur", function(){
                       if(this.value === ""){
                           this.placeholder = originalPlaceholder;
                       }
                   });


                   const backgroundAnimation = document.getElementById("background-animation");
                   const controls = document.querySelector(".controls");
                   /* PRELOAD SECOND BACKGROUND */
                   const bg2 = new Image();
                   bg2.src = "https://www.dropbox.com/scl/fi/7nvpg21r0vtu06j8abrri/eryctrijunis-neo-vs-the-architect-640.webp?rlkey=sb2njpet4y9ncrt1tihjwgky6&st=1cphapxy&raw=1";
                   let typingTimeout;

                   function typeText(index) {
                       clearTimeout(typingTimeout);
                       textContent.innerHTML = "";
                       cursor.style.visibility = "visible";
                       let text = dialogues[index].text;
                       let i = 0;
                       function type() {
                           if (i < text.length) {
                               textContent.innerHTML += text.charAt(i);
                               i++;
                               typingTimeout = setTimeout(type, 50);
                           } else {
                               cursor.style.visibility = "hidden";
                           }
                       }
                       setTimeout(type, 300);
                   }

                   const characterName = document.getElementById("character-name");

                   function updateDialogue() {
                       avatar.style.opacity = 0;
                       textBox.style.opacity = 0;
                       prevBtn.style.display = currentIndex === 0 ? "none" : "inline-block";
                       clearTimeout(typingTimeout);

                       avatar.onload = function () {
                           avatar.style.opacity = 1;
                           textBox.style.opacity = 1;
                           typeText(currentIndex);

                           if (currentIndex === dialogues.length - 1) {
                               nextBtn.innerHTML = 'Take <span class="red-pill"><\/span> ▸';
                               prevBtn.innerHTML = '◂<span class="blue-pill"><\/span> Take';
                           } else {
                               nextBtn.innerText = "Next ▸";
                               prevBtn.innerText = "◂ Prev";
                           }
                       };





                       const currentDialogue = dialogues[currentIndex];
                       avatar.src = avatarCache[currentDialogue.avatar].src;
                       characterContainer.className = "character " + currentDialogue.align;

                       characterName.textContent = currentDialogue.name;

                       // Ensure Neo color is applied, even if the name was changed
                       if (currentDialogue.name === "Neo" || currentDialogue.name === nameInputBox.value) {
                           characterName.className = "Neo";
                       } else {
                           characterName.className = currentDialogue.name.toLowerCase();
                       }
                   }



                   function nextText() {

                       if (currentIndex < dialogues.length - 1) {
                           currentIndex++;
                           updateDialogue();
                           return;
                       }

                       // If already at the last dialogue
                       enterMatrix(event);
                   }



                   function prevText(){

                       if(currentIndex === dialogues.length - 1){

                           /* Blue pill effect */

                           matrixGlitchReset();

                           return;
                       }

                       if(currentIndex > 0){
                           currentIndex--;
                           updateDialogue();
                       }

                   }

                   function resetGame(){

                       /* restore normal colors */

                       document.body.style.filter = "";
                       document.body.style.transform = "";
                       document.body.style.boxShadow = "";
                       document.body.style.transition = "";
                       document.body.style.backgroundColor = "";

                       currentIndex = 0;

                       backgroundAnimation.src = preloadedBG.src;

                       backgroundAnimation.style.display = "block";

                       pressStart.style.display = "block";
                       nameInput.style.display = "none";

                       characterContainer.style.display = "none";
                       controls.style.display = "none";

                       nameInputBox.value = "";
                       nameInputBox.placeholder = "Enter Your Name";
                   }

                   function matrixGlitchReset(){

                       const glitch = document.createElement("div");
                       glitch.className = "matrix-glitch";
                       document.body.appendChild(glitch);

                       // original blue pill shift
                       document.body.style.transition = "0.3s";

                       document.body.style.filter = "brightness(1.15)";

                       document.body.style.backgroundColor = "#04122d";

                       // random jitter
                       let jitter = setInterval(()=>{
                           const colors = "#00bba9";

                           document.body.style.transform =
                               `translate(${(Math.random()-0.5)*20}px, ${(Math.random()-0.5)*10}px)`;

                           const randomColor = colors[Math.floor(Math.random()*colors.length)];

                           document.body.style.boxShadow =
                               `0 0 40px #00bba9 inset, 0 0 35px ${randomColor}, 0 0 60px ${randomColor}`;

                           document.body.style.filter =
                               `brightness(1.15) drop-shadow(4px 0 #00bba9) drop-shadow(-4px 0 #00bba9)`;
                       },45);

                       setTimeout(()=>{
                           clearInterval(jitter);
                           document.body.style.transform = "";
                           glitch.remove();
                           resetGame();
                       },800);
                   }
                   function startGame() {
                       const userName = nameInputBox.value || "Neo";
                       dialogues.forEach(dialogue => {
                           if (dialogue.name === "Neo") {
                               dialogue.name = userName;
                           }
                       });
                       pressStart.style.display = "none";
                       nameInput.style.display = "none";
                       backgroundAnimation.style.display = "none";
                       characterContainer.style.display = "flex";
                       controls.style.display = "flex";
                       updateDialogue();
                   }

                   document.getElementById("game-container").addEventListener("click", function() {

                       if (pressStart.style.display !== "none") {

                           pressStart.style.display = "none";
                           nameInput.style.display = "block";

                           /* switch background instantly */
                           backgroundAnimation.src = bg2.src;

                       }

                   });

                 function enterMatrix(e) {
                if (e) e.stopPropagation();
            
                document.getElementById("game-container").style.display = "none";
                canvas.style.display = "block";
            
                // 1. Manually declare the font in JavaScript
                const matrixFont = new FontFace('White Rabbit Local', 'url(https://www.eryc.my.id/assets/font/white-rabbit.woff2)');
            
                // 2. Force the browser to download it NOW
                matrixFont.load().then(function(loadedFont) {
                    // 3. Add it to the document's font registry
                    document.fonts.add(loadedFont);
                    
                    // 4. Now that we are 100% sure it is downloaded, start the canvas
                    startMatrixEffect();
                    
                }).catch(function(error) {
                    console.error("Font failed to load. Is there a CORS or URL issue?", error);
                    // Fallback: Start the effect anyway so the screen isn't blank
                    startMatrixEffect(); 
                });
            }


                   // Matrix effect
                   const canvas = document.getElementById("matrixCanvas");
                   canvas.style.display = "none";

                   const ctx = canvas.getContext("2d");

                   // Set canvas dimensions to match the viewport
                   function resizeCanvas() {
                       canvas.width = document.documentElement.clientWidth;
                       canvas.height = document.documentElement.clientHeight;
                   }

                   // Initialize canvas size
                   resizeCanvas();

                   // Matrix characters: Katakana, Numbers, and Latin Letters
                   const matrixChars = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                   const fontSize = 16;
                   let columns = Math.floor(canvas.width / fontSize);
                   let drops = Array(columns).fill(1); // Initialize drops array
                   let columnChars = Array.from({ length: columns }, () =>
                                                matrixChars[Math.floor(Math.random() * matrixChars.length)]
                                               );
                   let speeds = Array.from({ length: columns }, () => 1 + Math.random() * 1.5);    

                   // Set the solid background color once at the beginning
                   ctx.fillStyle = "#060522";
                   ctx.fillRect(0, 0, canvas.width, canvas.height);

                   // Secret message setup
                   const secretMessage = "FREE YOUR MIND".split(""); // Convert to array of characters
                   const letterSpacing = 3; // spacing between characters in pixels
                   let messageStartTime = null;  // To track when the message should start displaying
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
                       ctx.font = fontSize + "px 'White Rabbit', sans-serif";
                       ctx.shadowColor = "#060522";
                       ctx.shadowBlur = 4;

                       for (let i = 0; i < drops.length; i++) {

                           const x = i * fontSize;
                           const y = drops[i] * fontSize;
                           const prevDrop = Math.floor(drops[i] - speeds[i]);

                           // store char for this column
                           const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];

                           // repaint previous head as green trail
                           for (let j = prevDrop; j < drops[i]; j++) {
                               const yFill = j * fontSize;

                               if (yFill >= 0) {
                                   ctx.fillStyle = "#00bba9";
                                   ctx.fillText(columnChars[i], x, yFill);
                               }
                           }

                           // draw new white head
                           ctx.fillStyle = "#ecfeff";
                           ctx.fillText(char, x, y);

                           // save char for next frame
                           columnChars[i] = char;

                           drops[i] += speeds[i];

                           if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                               drops[i] = 0;
                               const r = Math.random();
                               speeds[i] = r < 0.88 ? 1 : r < 0.98 ? 2 : 3;
                           }
                       }

                       // Start showing the secret message after 3 seconds
                       if (!messageStartTime) {
                           messageStartTime = Date.now();
                       }

                       // After 3 seconds, begin displaying the secret message
                       const elapsedTime = Date.now() - messageStartTime;
                       if (elapsedTime >= 3000) {
                           ctx.globalCompositeOperation = "source-over";
                           ctx.font = "300 16px 'White Rabbit Local', sans-serif"; // Set font weight to 500

                           // Calculate the position to center the message
                           const textWidth = ctx.measureText(secretMessage.join("")).width +(secretMessage.length - 1) * letterSpacing;
                           const xPos = (canvas.width - textWidth) / 2;
                           const yPos = canvas.height / 2;

                           // Draw the message letter by letter with a fade effect
                           let offsetX = 0;

                           secretMessage.forEach((char, index) => {

                               const letterAppearTime = 3000 + index * letterDelay;

                               if (elapsedTime >= letterAppearTime) {

                                   if (letterFadeProgress[index] < 1) {
                                       letterFadeProgress[index] += letterFadeSpeed;
                                   }

                                   ctx.fillStyle = `rgba(226, 232, 240, ${Math.min(letterFadeProgress[index], 1)})`;

                                   ctx.fillText(char, xPos + offsetX, yPos);

                                   offsetX += ctx.measureText(char).width + letterSpacing;

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

                       drops = Array.from({ length: columns }, () =>
                                          -Math.floor(Math.random() * canvas.height / fontSize)
                                         );

                       // ADD THIS PART 👇
                       columnChars = Array.from({ length: columns }, () =>
                                                matrixChars[Math.floor(Math.random() * matrixChars.length)]
                                               );

                       // speeds reset
                       speeds = Array.from({ length: columns }, () => {
                           const r = Math.random();
                           return r < 0.88 ? 1 : r < 0.98 ? 2 : 3;
                       });

                       letterFadeProgress = Array(secretMessage.length).fill(0);
                       messageStartTime = null;

                       // Start the new interval
                       canvas.style.display = "block";
                       matrixInterval = setInterval(drawMatrix, 50);
                   }

                   // Stop Matrix effect on click or Enter key
                   //setTimeout(() => {
                   //document.addEventListener("click", stopMatrixEffect);
                   //}, 500);
                   //document.addEventListener("keypress", function (event) {
                   //if (event.key === "Enter") {
                   //  stopMatrixEffect();
                   //  }
                   //});

                   //function stopMatrixEffect() {
                   //  if (matrixInterval) {
                   //  clearInterval(matrixInterval);
                   //  matrixInterval = null;
                   //  }
                   //  canvas.style.display = "none";
                   //}

                   // Resize canvas on window resize
                   window.addEventListener("resize", () => {
                       resizeCanvas();

                       // Reset columns
                       columns = Math.floor(canvas.width / fontSize);

                       // Reset drops (start above screen)
                       drops = Array.from({ length: columns }, () =>
                                          -Math.floor(Math.random() * canvas.height / fontSize)
                                         );

                       // Reset stored characters
                       columnChars = Array.from({ length: columns }, () =>
                                                matrixChars[Math.floor(Math.random() * matrixChars.length)]
                                               );

                       // Reset speeds
                       speeds = Array.from({ length: columns }, () =>
                                           Math.random() < 0.1 ? 2 : 1
                                          );
                   });
