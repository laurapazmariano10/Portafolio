const potrace = require("potrace");
const fs = require("fs");

potrace.trace("./public/Firma.png", { 
    color: "#000000",
    background: "transparent",
    optTolerance: 0.2, // higher = simpler path
    turdSize: 100 // remove small artifacts
}, function(err, svg) {
  if (err) throw err;
  fs.writeFileSync("./public/firma.svg", svg);
  console.log("SVG extracted successfully.");
});
