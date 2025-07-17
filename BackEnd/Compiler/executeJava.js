// import { exec } from "child_process";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // Convert import.meta.url to a path
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const outputPath = path.join(__dirname, "outputs");

// if (!fs.existsSync(outputPath)) {
//   fs.mkdirSync(outputPath, { recursive: true });
// }

// const executeJava = (filepath, inputPath = null, timeout = 5000) => {
//   // Default timeout 5 seconds
//   const jobId = path.basename(filepath).split(".")[0];
//   const errorPath = path.join(outputPath, `${jobId}.err`);

//   return new Promise((resolve, reject) => {
//     let command;

//     if (inputPath) {
//       // Command with input file
//       command = `java ${filepath}`;
//     } else {
//       // Command without input file
//       command = `java ${filepath}`;
//     }

//     // Start the process
//     const process = exec(
//       command,
//       { timeout, input: inputPath ? fs.readFileSync(inputPath) : undefined },
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

// export default executeJava;
// executeJava.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ---------- resolve dir ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ---------- outputs (class files) ---------- */
const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

const compileTimeout = 15000;  // 15 s for javac compile
const runTimeout     = 3000;   // 3 s for user program

export default function executeJava(filepath, inputPath = null) {
  const dirOfSrc = path.dirname(filepath);
  const jobId    = path.basename(filepath).split(".")[0];       // random uuid
  const classDir = path.join(outputPath, jobId);

  if (!fs.existsSync(classDir)) fs.mkdirSync(classDir, { recursive: true });

  /* ---------- STEP 1: COMPILE ---------- */
  // Copy source to a fixed name Main.java inside classDir
  const mainSrc = path.join(classDir, "Main.java");
  fs.copyFileSync(filepath, mainSrc);

  const compileCmd = `javac "${mainSrc}"`;

  return new Promise((resolve, reject) => {
    exec(compileCmd, { timeout: compileTimeout }, (compErr, _, compStderr) => {
      if (compErr) {
        return reject({
          error: compErr,
          stderr: compStderr || "Compilation Error",
        });
      }

      /* ---------- STEP 2: RUN ---------- */
      let runCmd = `java -classpath "${classDir}" Main`;
      if (inputPath) runCmd += ` < "${inputPath}"`;

      exec(runCmd, { timeout: runTimeout }, (runErr, stdout, runStderr) => {
        if (runErr) {
          if (runErr.killed) {
            return reject({ error: runErr, stderr: "Time Limit Exceeded" });
          }
          return reject({ error: runErr, stderr: runStderr || "Runtime Error" });
        }
        if (runStderr) return reject({ stderr: runStderr });
        resolve(stdout);
      });
    });
  });
}
