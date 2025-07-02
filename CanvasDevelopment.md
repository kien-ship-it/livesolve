### **Plan of Execution**

*   **Goal:** To replace the static `div` in our `DrawingCanvas.tsx` component with a truly interactive, auto-expanding drawing canvas using the `react-sketch-canvas` library.

*   **Files to be Modified/Referenced:**
    *   **Primary Target:** `frontend/src/components/workspace/DrawingCanvas.tsx` will be completely refactored.
    *   **Container Styling:** `frontend/src/components/layout/CenterColumn.tsx` may need styling adjustments to allow for scrolling.
    *   **State Management (New):** `frontend/src/contexts/CanvasContext.tsx` and `frontend/src/hooks/useCanvas.ts`. This feature is complex enough to warrant its own context for managing canvas state, which will be essential later for the toolbar and AI interactions.
    *   **Package Management:** `frontend/package.json` to add the new dependency.

*   **Explicit Assumptions & Dependencies:**
    *   I assume the static frontend layout from our previous plan is complete.
    *   I assume we are now ready to introduce more complex state management beyond simple `useState` and will create our first feature-specific React Context.

*   **High-Level Logic (The Strategy):**
    1.  **Installation & Basic Setup:** Install the library and render a basic, fixed-size canvas to ensure it works.
    2.  **Container & Scrolling:** Wrap the canvas in a container `div` styled to enable scrolling when the canvas's inner dimensions exceed the container's visible area. This is the key to the "infinite" feel.
    3.  **Stateful Dimensions:** Manage the canvas's `width` and `height` using React state.
    4.  **Expansion on Draw:** Use the library's `onDraw` or `onUpdate` callback to get the coordinates of the user's strokes in real-time.
    5.  **Conditional Growth Logic:** Inside the callback, check if the stroke's coordinates are near the right or bottom edge. If they are, update the state to increase the canvas's dimensions, triggering a re-render with a larger drawing surface.
    6.  **Refinement:** Introduce a "buffer" so the canvas expands *before* the user hits the absolute edge. We will also "debounce" the state updates to ensure smooth performance.

---

## Development Plan: Infinite Auto-Expanding Canvas

### Phase 1: Setup and Basic Integration

**Goal:** Get a basic, non-expanding drawing canvas working within our existing layout.

| Task | Files to Create/Modify | Notes / Goals |
| :--- | :--- | :--- |
| **1. Install Canvas Library** | `package.json` (Terminal) | Open a terminal in the `frontend/` directory and run: <br> `npm install --save react-sketch-canvas` |
| **2. Initial Canvas Render** | `workspace/DrawingCanvas.tsx` | Replace the placeholder `div` with the `<ReactSketchCanvas />` component. Give it fixed, hardcoded `width` and `height` props for now (e.g., width="1000" height="800"). |
| **3. Create Scrolling Container** | `layout/CenterColumn.tsx` or `workspace/DrawingCanvas.tsx` | The parent container of the canvas must be styled to handle overflow. The best place is likely a wrapper `div` inside `DrawingCanvas.tsx`. <br> **CSS Required:** `overflow: auto;`, `position: relative;` |

---

### Phase 2: Implementing the Core Expansion Logic

**Goal:** Make the canvas grow dynamically as the user draws near the edges.

| Task | Files to Create/Modify | Notes / Goals |
| :--- | :--- | :--- |
| **1. Manage Canvas Size in State** | `workspace/DrawingCanvas.tsx` | Use `useState` to control the canvas dimensions. <br> `const [size, setSize] = useState({ width: 1200, height: 800 });` <br> Pass these state variables to the `<ReactSketchCanvas />` props. |
| **2. Define Expansion Constants** | `workspace/DrawingCanvas.tsx` | Create constants to make the logic clear. <br> `const EXPANSION_BUFFER = 100; // pixels` <br> `const EXPANSION_AMOUNT = 400; // pixels` |
| **3. Implement the `onUpdate` Handler**| `workspace/DrawingCanvas.tsx` | The `react-sketch-canvas` library provides an `onUpdate` callback that fires when the canvas is drawn on. We will use this to check the stroke position. |
| **4. Write the Expansion Logic** | `workspace/DrawingCanvas.tsx` | Inside the `onUpdate` handler, get the latest stroke data. It contains an array of paths, each with its own points. Find the maximum `x` and `y` of the latest stroke. <br> **Logic:** <br> `if (latestX > size.width - EXPANSION_BUFFER) { setSize(prev => ({ ...prev, width: prev.width + EXPANSION_AMOUNT })); }` <br> `if (latestY > size.height - EXPANSION_BUFFER) { setSize(prev => ({ ...prev, height: prev.height + EXPANSION_AMOUNT })); }` |

---

### Phase 3: Refinement and Robust State Management

**Goal:** Improve performance with debouncing and create a proper state management structure for future features.

| Task | Files to Create/Modify | Notes / Goals |
| :--- | :--- | :--- |
| **1. Debounce State Updates** | `workspace/DrawingCanvas.tsx` | The `onUpdate` event can fire very rapidly. Calling `setSize` on every event is inefficient. We will "debounce" our expansion check so it only runs after the user has stopped drawing for a brief moment (e.g., 250ms). You can use a simple custom hook with `setTimeout` or a library like `lodash.debounce`. This is critical for a smooth user experience. |
| **2. Create the Canvas Context** | `contexts/CanvasContext.tsx` | Create a new context to manage all things related to the canvas. The Provider will hold the canvas `size` state and the `setSize` function. |
| **3. Create the `useCanvas` Hook** | `hooks/useCanvas.ts` | Create a custom hook `useCanvas` that simply consumes and returns the `CanvasContext`. This provides a clean way for other components to access canvas state. |
| **4. Refactor `DrawingCanvas`** | `workspace/DrawingCanvas.tsx` | Move the `size` state logic into the `CanvasProvider`. The `DrawingCanvas` component will now read the size from the context using `const { size, setSize } = useCanvas();`. |
| **5. Wrap the App in the Provider** | `pages/WorkspacePage.tsx` or `layout/AppLayout.tsx` | Wrap the main layout component with `<CanvasProvider>...</CanvasProvider>` so that the canvas and all future components (like the toolbar) have access to the context. |

---

### Phase 4: Testing and Verification Protocol

**Goal:** Formally test the feature to ensure it meets all requirements.

| Test Case | Expected Outcome |
| :--- | :--- |
| **1. Initial Load** | The canvas appears with its initial dimensions. Scrollbars are not visible if the canvas fits within the `CenterColumn` view. |
| **2. Draw in Center** | Drawing in the middle of the canvas works smoothly. The canvas does not change size. |
| **3. Approach Right Edge** | As your stroke gets within `100px` of the right boundary, the canvas width increases by `400px`, and a horizontal scrollbar appears or adjusts. |
| **4. Approach Bottom Edge** | As your stroke gets within `100px` of the bottom boundary, the canvas height increases by `400px`, and a vertical scrollbar appears or adjusts. |
| **5. Top and Left Edge Behavior** | Drawing near the top or left edges does **not** change the canvas size. The content remains anchored to the top-left. |
| **6. Smoothness Check** | The drawing experience remains smooth even during expansion, confirming the debouncing logic is effective. |