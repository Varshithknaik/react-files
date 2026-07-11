# Implement Skeleton Loading with Refs

The current layout uses a sequential progressive painting queue (`schedulePaint`). This queue blocks subsequent images from rendering if a single earlier image takes too long to load (or fails), leaving empty white space.

The user has requested to move to a **Skeleton Loading** approach using refs. This is how modern platforms like Pinterest handle image loading:
1. The layout boxes are rendered immediately with a gray "skeleton" background.
2. The images are loaded natively by the browser.
3. As each image finishes loading, it fades in over its skeleton.

## Proposed Changes

### `app/(content)/pinterest-feed/page.js`
- **[DELETE]** Remove the complex sequential queue logic: `preloadImage`, `schedulePaint`, `paintPointerRef`, `loadedPinsRef`, and `allPinsRef`.
- **[MODIFY]** Replace `paintedPins` state with a single `layoutPins` state.
- **[MODIFY]** In `loadBatch`, immediately append new layout pins to the `layoutPins` state. This instantly renders the skeleton boxes.
- **[MODIFY]** Add a `skeletonRefs` (or `imageRefs`) object to track the image DOM nodes.
- **[MODIFY]** Update the rendering loop:
  - Add a gray background color (`#e2e8f0`) to the wrapper `div` to serve as the skeleton.
  - Set the `img` to `opacity: 0` initially.
  - Use the native `onLoad` event on the `img` to directly mutate the ref's `opacity` to `1`, avoiding costly React re-renders.

## User Review Required
Does this match your vision for "skeleton refs"? This will eliminate the sequential pop-in effect and instead show all placeholders instantly, fading in the images exactly as they load.
