/* Gate configuration.

   No passcode is stored here. Each entry in VERIFIERS is a salted SHA-256
   digest of a passcode, re-hashed ITERATIONS times, so reading this file does
   not reveal any passcode. Every listed verifier grants the same access.
   Unlock persists in localStorage until cleared.

   To change the passcodes, run this from the repo root with the full set you
   want valid; it rewrites the list below in place:

     node tools/set-passcode.js "first passcode" "second passcode"

   Note: this is a client-side gate. It keeps casual visitors out and no longer
   leaks passcodes in plain text, but anyone determined can still brute-force a
   short passcode offline. Use server-side auth for genuinely sensitive work.
*/
window.__PORTFOLIO_CONFIG = {
  STORAGE_KEY: 'portfolioUnlocked',
  ITERATIONS: 250000,
  VERIFIERS: [
    { salt: '1fb16cb299d69bd7ee61e3d3baff7f69', hash: '41c394df3319dd5b77e08278812aa72bc4f260f76568de25b9ccab2e3297e15d' },
    { salt: '916017dcb214fc9f66d7162ae9fa9309', hash: '9ffc0278ac1c697b2d6606af56f65e64e7a76c5d88911c58a818f60f49e9427b' }
  ]
};
