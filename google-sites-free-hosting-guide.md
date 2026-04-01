```text
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║      █████╗ ███████╗███████╗███████╗████████╗                  ║
║     ██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝                  ║
║     ███████║███████╗███████╗█████╗     ██║                     ║
║     ██╔══██║╚════██║╚════██║██╔══╝     ██║                     ║
║     ██║  ██║███████║███████║███████╗   ██║                     ║
║     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝                     ║
║                                                                ║
║            H O S T I N G   G U I D E   V . 1 . 0               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

✦ **Store and use images, videos, or files in Google Sites.**
✦ **WITHOUT paid hosting using Google Drive or Dropbox.**

---

## ❖ [1] GOOGLE DRIVE METHOD (RECOMMENDED)

**┌─[ STEP 1 ]** Upload file to Google Drive
**├─[ STEP 2 ]** Copy share link
│  ↳ *Example:* `https://drive.google.com/file/d/YOUR_FILE_ID_HERE/view?usp=sharing`
**└─[ STEP 3 ]** Convert link

```diff
- [✗] CHANGE THIS:
  [https://drive.google.com/file/d/YOUR_FILE_ID_HERE/view?usp=sharing](https://drive.google.com/file/d/YOUR_FILE_ID_HERE/view?usp=sharing)

+ [✓] TO THIS:
  [https://drive.google.com/uc?export=view&id=YOUR_FILE_ID_HERE](https://drive.google.com/uc?export=view&id=YOUR_FILE_ID_HERE)
```

➤ **QUICK WAY (DUMMY EXPLANATION):**
* Copy the `FILE_ID` (the text after `/d/`)
* Replace it in this URL: `https://drive.google.com/uc?export=view&id=FILE_ID`

➤ **FINAL EXAMPLE:**
```html
<img src="[https://drive.google.com/uc?export=view&id=YOUR_FILE_ID_HERE](https://drive.google.com/uc?export=view&id=YOUR_FILE_ID_HERE)">
```

```text
╭━━━━━━━━━━━━━━━━━━━━━━━╮
│  DIRECT DOWNLOAD LINK │
╰━━━━━━━━━━━━━━━━━━━━━━━╯
```
➤ `https://drive.google.com/uc?id=YOUR_FILE_ID_HERE&export=download`

```text
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│  WHY THIS WORKS                                             │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
```
✦ **Default link** = opens Google Drive page  
✦ **Modified link** = gives direct file

* **[✗]** If it opens a page → **WRONG** * **[✓]** If it shows ONLY file → **CORRECT**

---

## ❖ [2] DROPBOX METHOD (ALTERNATIVE)

**┌─[ STEP 1 ]** Upload file to Dropbox
**├─[ STEP 2 ]** Copy link
│  ↳ *Example:* `https://www.dropbox.com/s/your_folder/image.jpg?dl=0`
**└─[ STEP 3 ]** Convert link

```diff
- [✗] CHANGE THIS:
  [https://www.dropbox.com/s/your_folder/image.jpg?dl=0](https://www.dropbox.com/s/your_folder/image.jpg?dl=0)

+ [✓] TO THIS:
  [https://www.dropbox.com/s/your_folder/image.jpg?raw=1](https://www.dropbox.com/s/your_folder/image.jpg?raw=1)
```

➤ **QUICK WAY (DUMMY EXPLANATION):**
* Just delete `dl=0`
* Replace with `raw=1`

➤ **FINAL EXAMPLE:**
```html
<img src="[https://www.dropbox.com/s/your_folder/image.jpg?raw=1](https://www.dropbox.com/s/your_folder/image.jpg?raw=1)">
```

```text
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│  FASTER DROPBOX VERSION                                     │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
```
```diff
- [✗] CHANGE THIS:
  [https://www.dropbox.com/s/your_folder/image.jpg?dl=0](https://www.dropbox.com/s/your_folder/image.jpg?dl=0)

+ [✓] TO THIS:
  [https://dl.dropboxusercontent.com/s/your_folder/image.jpg](https://dl.dropboxusercontent.com/s/your_folder/image.jpg)
```

➤ **QUICK WAY (DUMMY EXPLANATION):**
* Change `www.dropbox.com` → `dl.dropboxusercontent.com`
* Remove `?dl=0` or `?raw=1`

➤ **FINAL EXAMPLE:**
```html
<img src="[https://dl.dropboxusercontent.com/s/your_folder/image.jpg](https://dl.dropboxusercontent.com/s/your_folder/image.jpg)">
```

---

## ❖ [3] PERFORMANCE BOOST (OPTIONAL)

```html
<link rel="preconnect" href="[https://dl.dropboxusercontent.com](https://dl.dropboxusercontent.com)">
<link rel="preload" href="YOUR_IMAGE_URL" as="image" type="image/webp" fetchpriority="high">
<img src="YOUR_IMAGE_URL" fetchpriority="high">
```

➤ **REAL EXAMPLE:**
```html
<link rel="preconnect" href="[https://dl.dropboxusercontent.com](https://dl.dropboxusercontent.com)">
<link rel="preload" href="[https://dl.dropboxusercontent.com/s/your_folder/hero-banner.webp](https://dl.dropboxusercontent.com/s/your_folder/hero-banner.webp)" as="image" type="image/webp" fetchpriority="high">
<img src="[https://dl.dropboxusercontent.com/s/your_folder/hero-banner.webp](https://dl.dropboxusercontent.com/s/your_folder/hero-banner.webp)" fetchpriority="high">
```

➤ **QUICK EXPLANATION:**
* `preconnect` = prepare connection earlier
* `preload` = force early image loading
* `fetchpriority` = mark as important image
* **Result:** Image loads faster (especially above-the-fold)

---

## ❖ [4] IMPORTANT WARNING

**➤ Google Drive:**
* `[+]` Stable
* `[+]` SEO friendly
* `[+]` Recommended
* `[-]` Slightly slower

**➤ Dropbox:**
* `[+]` Faster (sometimes)
* `[-]` Can hurt PageSpeed score
* `[-]` Not designed for hosting
* `[-]` Can be inconsistent

---

## ❖ [5] SIMPLE DECISION

✦ Use **Google Drive** → real projects / SEO  
✦ Use **Dropbox** → testing / speed experiment

```text
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│  FINAL CHECK                                                │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
```
Open your link in browser:

* **[✓]** IF you see: Only image/file → **GOOD**
* **[✗]** IF you see: A webpage → **WRONG**

---

```text
────────╔═══╗─マーケター
────────║╔══╝──Digital
────────║╚══╦══╦╗─╔╦══╗
────────║╔══╣╔═╣║─║║╔═╝
────────║╚══╣║─║╚═╝║╚═╗
────────╚═══╩╝─╚═╗╔╩══╝
───────────────╔═╝║
───────────────╚══╝
               END
```
