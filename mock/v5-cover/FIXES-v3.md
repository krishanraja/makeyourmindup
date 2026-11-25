# Mock v3: one wordmark, one headline

Edit only inside mock/v5-cover/. Do not commit. Do not launch a browser.

Krish's ruling (25 Nov): "I like the square MAKEYOURMINDUP wordmark, but there should only be one of these wordmarks on any given artifact or page, and the headline should only appear once on any given medium".

The square wordmark is assets/marks/s3h.svg: MAKE / YOUR / MIND/UP in three Anton lines, with the D icon as the O in YOUR and a mint UP. The headline is "Creativity, AI and money, simplified."

Apply to every page (index, members, legal, terms, 404):
1. **One wordmark per page, and it is the square one on the cover.**
   - **Header:** the D icon at left, then Subscribe at right. Remove V9 from the header: the icon is not a wordmark, so keep it.
   - **Hero, left (columns 1 to 6):** s3h.svg large, as the one wordmark. Under it, the headline once, in Fraunces at about 40 to 48 px desktop and 28 px mobile, sentence case: "Creativity, AI and money, simplified." Then the email form and the "Free to read" line.
   - Remove the separate "Who gets paid..." line from the hero, so the headline stands alone.
   - **Hero, right (columns 7 to 12):** the photo stays as it is, aligned to the wordmark's cap top and the form's baseline.
   - **The footer:** the D icon only, no wordmark.
   - **Members, legal, terms and 404:** the header icon only, no wordmark anywhere.
2. **The headline appears once on the whole site:** in the hero only.
   - Keep the meta description and og alt text; they are metadata, not on the page.
   - The FAQ "What is this?" answer must not repeat the headline. Use: "A publication about what AI is doing to creative work and the money around it. Three pieces a week, each followed down to the evidence."
3. **Check the long-title, one, nocover, narrow and wide states.** The hero must still fit the first screen at 1440 x 900, and at 390 x 844 the form must show without scrolling past the wordmark (scale s3h to fit).

Update render.py if anything moved, and keep every assert.
