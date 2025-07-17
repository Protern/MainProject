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

// const executeC = (filepath, inputPath, timeout = 5000) => {
//   // Default timeout 5 seconds
//   const jobId = path.basename(filepath).split(".")[0];
//   const outPath = path.join(outputPath, `${jobId}.out`);
//   const errorPath = path.join(outputPath, `${jobId}.err`);

//   return new Promise((resolve, reject) => {
//     const command = `g++ ${filepath} -o ${outPath} && ${outPath}`;
//     if (inputPath) {
//       command += ` < ${inputPath}`;
//     }

//     // Start the process
//     const process = exec(command, { timeout }, (error, stdout, stderr) => {
//       // Handle process errors
//       if (error) {
//         reject({
//           error: error.message,
//           stderr: stderr || error.message,
//         });
//         return;
//       }
//       if (stderr) {
//         reject(stderr);
//         return;
//       }
//       resolve(stdout);
//     });

//     // Handle process termination due to timeout
//     process.on("error", (err) => {
//       reject({ error: err.message });
//     });

//     // Optionally log the errors to a file
//     process.stderr.pipe(fs.createWriteStream(errorPath));
//   });
// };

// export default executeC;


import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output folder
const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Main execution function
const executeC = (filepath, inputPath = null, timeout = 5000) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);
  const errorPath = path.join(outputPath, `${jobId}.err`);

  return new Promise((resolve, reject) => {
    let command = `gcc "${filepath}" -o "${outPath}" && "${outPath}"`;
    if (inputPath) command += ` < "${inputPath}"`;

    const process = exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        return reject({
          error: error.message,
          stderr: stderr || error.message,
        });
      }
      if (stderr) return reject({ stderr });
      resolve(stdout);
    });

    process.on("error", (err) => {
      reject({ error: err.message });
    });

    process.stderr.pipe(fs.createWriteStream(errorPath));
  });
};

export default executeC;
