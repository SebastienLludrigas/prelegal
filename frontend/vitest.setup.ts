import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement scrollIntoView; components use it to auto-scroll.
Element.prototype.scrollIntoView = () => {};
