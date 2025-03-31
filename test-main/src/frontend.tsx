/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import {createRoot} from "react-dom/client";
import {App} from "./App";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "@/dev";

function start() {
    const root = createRoot(document.getElementById("root")!);
    root.render(<DevSupport ComponentPreviews={ComponentPreviews}
                            useInitialHook={useInitial}
    >
        <App/>
    </DevSupport>);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
} else {
    start();
}
