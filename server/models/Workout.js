import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    workoutName: {
      type: String,
      required: true,
      // Remove any unique constraint here
    },
    sets: {
      type: Number,
    },
    reps: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    caloriesBurned: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Remove the existing index (will need to be done in your MongoDB directly)

// Create a compound index for user+workoutName+date - this will allow
// the same workout name on different dates for the same user
WorkoutSchema.index(
  {
    user: 1,
    workoutName: 1,
    date: 1,
  },
  {
    unique: true,
    background: true,
    name: "user_workoutName_date_unique",
  }
);

export default mongoose.model("Workout", WorkoutSchema);
