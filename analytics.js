"use client";
import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-NESF6WKDS3";

export function initGA() {
  console.log("GA init with ID:", GA_MEASUREMENT_ID);
  ReactGA.initialize(GA_MEASUREMENT_ID, {
    debug: true, // so you see events in browser console
  });
}

export function sendPageView(path) {
  console.log("Sending pageview for:", path);
  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
}

export function trackGeminiRequest(feature = "Hair style preview") {
  console.log("Tracking Gemini request:", feature);
  ReactGA.event({
    category: "API Request",
    action: "Called Gemini API",
    label: feature,
  });
}

// Metric 1 – Try It Now click
export function trackTryItNowClick() {
  console.log("Tracking Try It Now click");
  ReactGA.event({
    category: "CTA",
    action: "Click Try It Now",
    label: "Homepage hero button",
  });
}

// Metric 3 – Favorite look saved
export function trackFavoriteSaved() {
  console.log("Tracking favorite saved");
  ReactGA.event({
    category: "Engagement",
    action: "Save favorite look",
    label: "Editor",
  });
}
