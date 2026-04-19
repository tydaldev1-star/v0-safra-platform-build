import { execSync } from "child_process"

console.log("Installing leaflet and @types/leaflet...")
execSync("pnpm add leaflet @types/leaflet", {
  cwd: "/vercel/share/v0-project",
  stdio: "inherit",
})
console.log("Done.")
