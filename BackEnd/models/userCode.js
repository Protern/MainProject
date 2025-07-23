// import mongoose from "mongoose";

// const userCodeSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   problemId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Problem", // Reference the Problem model
//     required: true,
//   },
//   language: {
//     type: String,
//     required: true,
//   },
//   code: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["unsolved", "attempted", "solved"],
//     default: "unsolved",
//   },
// });

// const UserCode = mongoose.model("UserCode", userCodeSchema);

// export default UserCode;



import mongoose from "mongoose";

const userCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    /* ---------- code & language ---------- */
    language: { type: String, required: true },      // "cpp" | "c" | "py" | "java"
    code:     { type: String, required: true },

    /* ---------- judge result ---------- */
    verdict: {
      type: String,
      enum: ["", "Accepted", "Wrong Answer", "TLE", "RE", "CE","Runtime Error","Compilation Error"],
      default: "",
    },
    execTimeMs: Number,          // runtime of this attempt (optional)
    memoryKb:   Number,          // memory used (optional; set later)
    stderr:     String,          // compiler or runtime error text

    /* ---------- per‑problem flag ---------- */
    status: {
      type: String,
      enum: ["unsolved", "attempted", "solved"],
      default: "unsolved",
    },
  },
  { timestamps: true }           // adds createdAt & updatedAt automatically
);

export default mongoose.model("UserCode", userCodeSchema);
