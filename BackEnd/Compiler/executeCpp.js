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

// const executeCpp = (filepath, inputPath, timeout = 5000) => {
//   // 5000 ms = 5 seconds
//   const jobId = path.basename(filepath).split(".")[0];
//   const outPath = path.join(outputPath, jobId);

//   return new Promise((resolve, reject) => {
//     let command = `g++ ${filepath} -o ${outPath} && ${outPath}`;
//     if (inputPath) {
//       command += ` < ${inputPath}`;
//     }

//     // Execute the command with a timeout
//     const child = exec(command, { timeout }, (error, stdout, stderr) => {
//       if (error) {
//         if (error.code === 1) {
//           // Compilation error
//           reject({ error, stderr });
//         } else if (error.killed) {
//           // Timeout error
//           reject({
//             error: new Error("Process killed due to timeout"),
//             stderr: "Time Limit Exceeded",
//           });
//         } else {
//           reject({ error, stderr });
//         }
//       } else if (stderr) {
//         reject(stderr);
//       } else {
//         resolve(stdout);
//       }
//     });

//     // Handle the case where the process was killed due to timeout
//     child.on("error", (err) => {
//       reject({ error: err, stderr: "Process error" });
//     });
//   });
// };

// export default executeCpp;


// executeCpp.js (compile & run separately)
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

const compileTimeout = 30000;   // 30 s for g++ compile
const runTimeout     = 3000;    // 3 s for user program

export default function executeCpp(filepath, inputPath = null) {
  const jobId   = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, jobId);

  /* ---------- STEP 1: COMPILE ---------- */
  const compileCmd = `g++ "${filepath}" -o "${outPath}"`;

  return new Promise((resolve, reject) => {
    exec(compileCmd, { timeout: compileTimeout }, (compErr, _, compStderr) => {
      if (compErr) {
        return reject({ error: compErr, stderr: compStderr || "Compilation Error" });
      }

      /* ---------- STEP 2: RUN ---------- */
      let runCmd = `"${outPath}"`;
      if (inputPath) runCmd += ` < "${inputPath}"`;

      exec(runCmd, { timeout: runTimeout }, (runErr, stdout, runStderr) => {
        if (runErr) {
          if (runErr.killed) {
            return reject({ error: runErr, stderr: "Time Limit Exceeded" });
          }
          return reject({ error: runErr, stderr: runStderr });
        }
        if (runStderr) return reject({ stderr: runStderr });
        resolve(stdout);
      });
    });
  });
}
