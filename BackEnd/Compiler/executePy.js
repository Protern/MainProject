// import { exec } from "child_process";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// // Convert import.meta.url to a path
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const outputPath = path.join(__dirname, "outputs");

// if (!fs.existsSync(outputPath)) {
//   fs.mkdirSync(outputPath, { recursive: true });
// }

// const executePy = (filepath, inputPath = null, timeout = 5000) => {
//   // Default timeout 5 seconds
//   const jobId = path.basename(filepath).split(".")[0];
//   const errorPath = path.join(outputPath, `${jobId}.err`);

//   return new Promise((resolve, reject) => {
//     const command = `python ${filepath}`;

//     // Start the process
//     const process = exec(
//       command,
//       {
//         timeout,
//         input: inputPath ? fs.readFileSync(inputPath) : undefined,
//       },
//       (error, stdout, stderr) => {
//         // Handle process errors
//         if (error) {
//           reject({
//             error: error.message,
//             stderr: stderr || error.message,
//           });
//           return;
//         }
//         if (stderr) {
//           reject(stderr);
//           return;
//         }
//         resolve(stdout);
//       }
//     );

//     // Handle process termination due to timeout
//     process.on("error", (err) => {
//       reject({ error: err.message });
//     });

//     // Optionally log the errors to a file
//     process.stderr.pipe(fs.createWriteStream(errorPath));
//   });
// };

// export default executePy;


// executePy.js  (space‑safe, proper stdin redirection)
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

const runTimeout = 3000; // 3 s default

export default function executePy(filepath, inputPath = null, timeout = runTimeout) {
  const jobId   = path.basename(filepath).split(".")[0];
  const errFile = path.join(outputPath, `${jobId}.err`);

  let cmd = `python "${filepath}"`;
  if (inputPath) cmd += ` < "${inputPath}"`;   // ← proper stdin

  return new Promise((resolve, reject) => {
    exec(cmd, { timeout }, (err, stdout, stderr) => {
      if (err) {
        if (err.killed) return reject({ error: err, stderr: "Time Limit Exceeded" });
        return reject({ error: err, stderr: stderr || "Runtime Error" });
      }
      if (stderr) return reject({ stderr });
      resolve(stdout);
    })
    .stderr.pipe(fs.createWriteStream(errFile));
  });
}
