# Image generation prompts

Tool: built-in image_gen (no CLI/API fallback).

The landscape images were first generated as style references; the portrait images were recomposed with those references and are the active mobile-first assets.

## Outside reference

Use case: stylized-concept. Asset type: full-screen background plate for an interactive Christmas cabin scene. Create a cinematic high-end 3D animated feature film still, richly detailed physically realistic materials, soft rounded storybook shapes, believable snow and wood, NOT flat vector, NOT low poly, NOT an interface. Wide landscape 16:9 composition. Snowy evergreen forest at blue-hour winter night, charming rustic timber cabin centered slightly left, front door visible at roughly x=46% y=64%, warm amber windows flanking the door, deep fluffy snow on steep roof, smoking chimney. Decorated Christmas tree on right at x=72% y=60%, golden fairy lights and star, a small snowman on far right at x=86% y=76%, antique glowing lantern at x=27% y=65%. Snowy winding footpath leads from foreground to the door, close snow-laden pine boughs frame edges, distant mountains, subtle moonlight, gentle falling snow. Cozy magical anticipation, exquisite volumetric lighting, warm glow reflected on powder snow contrasting midnight teal forest, realistic rich textures and cinematic depth. Keep all interactive objects inside central 80% of frame, clearly distinct and unobstructed. Scene fills entire image edge to edge. No people, no text, no letters, no numbers, no logos, no labels, no borders, no UI, no watermark.

## Inside reference

Use case: stylized-concept. Asset type: fullscreen background plate for the interior of an interactive Christmas cabin. Create a cinematic high-end 3D animated feature film still with physically realistic rich materials, gently rounded storybook forms and exquisite warm lighting; NOT flat vector, NOT low-poly, NOT an interface. Wide 16:9 landscape, eye-level cozy interior view. Rustic timber walls and beams. Large stone fireplace with lively golden fire centered slightly left at x=43% y=57%, knitted stockings on mantel, candles on mantel. Decorated Christmas tree at x=22% y=58% and wrapped presents under it at x=24% y=83%. Snowy blue winter night visible through a window at x=73% y=42%, comfortable wool armchair at x=75% y=74%, steaming ceramic cocoa mug on a small wooden table at x=62% y=78%. A wooden exit door clearly visible on far right at x=90% y=60%, leading outside. Thick woven rug, tactile blankets, pine garland, subtle fairy lights. Believable wood grain, plush fabrics, amber volumetric firelight, natural shadows, cool blue window contrast, inviting quiet intimate atmosphere, realistic animation film environment. No people, no text, no letters, no numbers, no logos, no labels, no border, no UI, no watermark. Entire frame is the environment.

## Outside mobile — src/assets/outside-mobile.png

Edit target: supplied Christmas cabin image. Preserve its realistic cinematic animated-film aesthetic, detailed rustic materials, midnight blue forest and warm gold light. Recompose into a PORTRAIT 9:16 mobile fullscreen scene, NOT a crop of the landscape image. All important objects must fit the portrait composition comfortably: snowy timber cabin centered in upper-middle, front door x=45% y=57%, two warm windows x=29% and x=61% y=53%. Snowy steep roof x=45% y=38%. Christmas tree x=76% y=67%, snowman x=83% y=82%, glowing antique lantern x=18% y=75%. Winding snowy path foreground leads to door. Tall snow-heavy evergreen trees frame edges, moon and mountains above, intimate enchanting winter night. Make cabin and interactive objects large enough to tap on a phone; avoid foreground branches blocking them. Richly realistic wood, powder snow and gentle volumetric lighting with high-end animation movie atmosphere. Environment edge to edge, no text, no letters, no numbers, no UI, no borders, no watermarks. Output portrait aspect ratio 9:16.

## Inside mobile — src/assets/inside-mobile.png

Edit target: supplied warm Christmas cabin interior. Preserve realistic cinematic animated-film look, rich warm timber, natural materials and golden firelight. RECOMPOSE as PORTRAIT 9:16 mobile fullscreen scene, not a crop. Large stone fireplace at x=43% y=46% with visible lively fire at y=53%, candles on mantel x=41% y=35%. Decorated Christmas tree at x=20% y=60%, presents at x=23% y=79%. Snowy blue nighttime window upper right x=73% y=29%. Cozy wool armchair at x=74% y=68%. Steaming cocoa mug on a small table x=56% y=77%. Wooden exit door on right x=90% y=50% clearly visible and tappable. Cozy beams, stockings, thick rug foreground. Everything fits the tall composition with large clear objects suitable to tap on a phone. Exquisite realistic fabric, stone and wood detail, warm animation movie environment, no people, no text, no lettering, no UI, no logos, no borders, no watermark. Output portrait 9:16 aspect ratio.



## 2026-09-30 — aligned lights-off plates

Edited from the matching portrait originals with OpenAI ImageGen. Scene geometry was requested to remain unchanged. Output is used only through local object masks. Encoded as WebP with sharp, quality 88; no remote image runtime dependencies.

### Exterior

Edit target: attached portrait Christmas cabin. Make a perfectly registered alternate state for animation compositing. Keep EXACT same image dimensions, camera, composition, geometry, snow, tree foliage and decorations, foreground, moon, every object location and all textures. Change ONLY artificial lights: turn off all lights in cabin windows (glass now dark blue reflective), turn off the front antique lantern flame (empty dark lantern glass), turn off fairy lights and star on Christmas tree. Keep moonlight and natural light intact, and keep other porch lanterns lit. Keep cabin and snow gently visible, do not globally darken the photo. No other changes, no new objects, no text. Output same portrait aspect ratio. This is an off-state plate to crossfade locally with the original, so pixel alignment is crucial.

### Interior

Edit target: supplied portrait cozy cabin interior. Create a precisely registered alternate light state for an animated scene. Keep EXACT camera angle, portrait dimensions, geometry, objects, rug, chair, table, gifts, window view, door, garlands, every texture and position unchanged. Change ONLY: remove visible flames and flying sparks from inside the fireplace, leaving glowing logs and red embers, dim brick firebox but leave the opening shape exact; switch off Christmas tree fairy lights/star; extinguish ONLY the white mantel candles, keeping the other lanterns and chandelier lights lit. Maintain warm room ambient lighting from those other lights. Do not darken the entire scene. No new elements, no text. Alignment to original frame must be exact; output same portrait aspect ratio.
