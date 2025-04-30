import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";
import mongoose from "mongoose";
dotenv.config();

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;

    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return next(createError(409, "Email is already in use."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    const createdUser = await user.save();
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    // Check if user exists
    if (!user) {
      return next(createError(404, "User not found"));
    }
    console.log(user);
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Get today's date boundaries in user's timezone
    const today = new Date();
    const startToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Calculate total calories burnt today
    const totalCaloriesBurnt = await Workout.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startToday, $lt: endToday },
        },
      },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    // Calculate total number of workouts today
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    // Calculate average calories burnt per workout
    let avgCaloriesBurntPerWorkout = 0;
    if (totalWorkouts > 0 && totalCaloriesBurnt.length > 0) {
      avgCaloriesBurntPerWorkout =
        totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts;
    }

    // Get calories burnt by workout category (for pie chart)
    const categoryCalories = await Workout.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startToday, $lt: endToday },
        },
      },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    // Format category data for pie chart
    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    // Get weekly data (last 7 days)
    const weeks = [];
    const caloriesBurnt = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayLabel = `${date.getDate()}${getDaySuffix(date.getDate())}`;
      weeks.push(dayLabel);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const dailyCalories = await Workout.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
      ]);

      caloriesBurnt.push(
        dailyCalories.length > 0 ? dailyCalories[0].totalCaloriesBurnt : 0
      );
    }

    return res.status(200).json({
      totalCaloriesBurnt:
        totalCaloriesBurnt.length > 0
          ? totalCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      totalWorkouts,
      avgCaloriesBurntPerWorkout,
      totalWeeksCaloriesBurnt: {
        weeks,
        caloriesBurned: caloriesBurnt,
      },
      pieChartData,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    next(err);
  }
};

// Helper function to get day suffix (1st, 2nd, 3rd, etc.)
const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    let date = req.query.date ? new Date(req.query.date) : new Date();

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    // Changed 'userId: userId' to 'user: userId' to match the schema field name
    const todaysWorkouts = await Workout.find({
      user: userId, // Changed from userId to user to match your schema
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};

export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { workoutString, date } = req.body;
    console.log("Received date from client:", date);

    if (!workoutString) {
      return next(createError(400, "Workout string is missing"));
    }

    // Split workoutString into lines and filter out empty ones
    const eachworkout = workoutString.split(";").filter((line) => line.trim());

    // Check if any workouts start with "#" to indicate categories
    const categories = eachworkout.filter((line) => line.startsWith("#"));
    if (categories.length === 0) {
      return next(createError(400, "No categories found in workout string"));
    }

    const parsedWorkouts = [];
    let currentCategory = "";
    let count = 0;

    // Parse workout details from each line
    for (const line of eachworkout) {
      count++;
      if (line.startsWith("#")) {
        const parts = line
          .split("\n")
          .map((part) => part.trim())
          .filter(Boolean);

        if (parts.length < 5) {
          return next(
            createError(400, `Workout string is missing for ${count}th workout`)
          );
        }

        // Update current category
        currentCategory = parts[0].substring(1).trim();

        // Extract workout details
        const workoutDetails = parseWorkoutLine(parts);
        if (!workoutDetails) {
          return next(createError(400, "Please enter in proper format"));
        }

        // Add category to workout details
        workoutDetails.category = currentCategory;
        parsedWorkouts.push(workoutDetails);
      } else {
        return next(
          createError(400, `Workout string is missing for ${count}th workout`)
        );
      }
    }

    // Process the custom date if provided - FIXED DATE HANDLING
    let workoutDate = new Date();
    if (date) {
      try {
        // Handle MM/DD/YYYY format specifically
        if (typeof date === "string" && date.includes("/")) {
          const [month, day, year] = date.split("/").map(Number);

          // Log the parsed date components
          console.log("Parsing date parts:", { month, day, year });

          // Create date with specific components and set to noon to avoid timezone issues
          workoutDate = new Date(year, month - 1, day, 12, 0, 0);
        } else {
          // For other formats, still try standard parsing but set time to noon
          workoutDate = new Date(date);
          workoutDate.setHours(12, 0, 0, 0);
        }

        console.log(
          "Created workout date:",
          workoutDate.toISOString(),
          "Local date:",
          workoutDate.toLocaleDateString()
        );
      } catch (err) {
        console.error("Invalid date format:", err, date);
        workoutDate = new Date();
        workoutDate.setHours(12, 0, 0, 0);
      }
    }

    // Create date range for the workout day (start to end of day)
    // Use the workoutDate year/month/day but with explicit times
    const startOfDay = new Date(
      workoutDate.getFullYear(),
      workoutDate.getMonth(),
      workoutDate.getDate(),
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date(
      workoutDate.getFullYear(),
      workoutDate.getMonth(),
      workoutDate.getDate(),
      23,
      59,
      59,
      999
    );

    console.log("Date range for duplicate check:", {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    // Check for duplicate workout names on the SAME DATE
    for (const workout of parsedWorkouts) {
      // Check if a workout with the same name already exists for this user ON THE SAME DATE
      const existingWorkout = await Workout.findOne({
        user: userId,
        workoutName: workout.workoutName,
        date: { $gte: startOfDay, $lte: endOfDay }, // Changed to $lte to include end of day
      });

      if (existingWorkout) {
        return next(
          createError(
            409,
            `Workout "${workout.workoutName}" already exists for this date. Please use a different name.`
          )
        );
      }
    }

    // Save all workouts to database
    const savedWorkouts = [];
    for (const workout of parsedWorkouts) {
      workout.caloriesBurned = parseFloat(calculateCaloriesBurnt(workout));

      // Create workout with the specified date - preserve the exact time
      const savedWorkout = await Workout.create({
        ...workout,
        user: userId,
        date: workoutDate,
      });

      savedWorkouts.push(savedWorkout);
    }

    return res.status(201).json({
      message: "Workouts added successfully",
      workouts: savedWorkouts,
    });
  } catch (err) {
    console.error("Error adding workout:", err);
    next(err);
  }
};

// Function to parse workout details from a line
const parseWorkoutLine = (parts) => {
  const details = {};
  console.log(parts);
  if (parts.length >= 5) {
    details.workoutName = parts[1].substring(1).trim();
    details.sets = parseInt(parts[2].split("sets")[0].substring(1).trim());
    details.reps = parseInt(
      parts[2].split("sets")[1].split("reps")[0].substring(1).trim()
    );
    details.weight = parseFloat(parts[3].split("kg")[0].substring(1).trim());
    details.duration = parseFloat(parts[4].split("min")[0].substring(1).trim());
    console.log(details);
    return details;
  }
  return null;
};

// Function to calculate calories burnt for a workout
const calculateCaloriesBurnt = (workoutDetails) => {
  const durationInMinutes = parseInt(workoutDetails.duration);
  const weightInKg = parseInt(workoutDetails.weight);
  const caloriesBurntPerMinute = 5; // Sample value, actual calculation may vary
  return durationInMinutes * caloriesBurntPerMinute * weightInKg;
};

// Add these new controller functions

// Update a workout
// Update a workout
export const updateWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const workoutId = req.params.id;
    const { workoutName, category, sets, reps, weight, duration } = req.body;

    // Verify the workout exists and belongs to the user
    const workout = await Workout.findOne({
      _id: workoutId,
      user: userId,
    });

    if (!workout) {
      return next(createError(404, "Workout not found or not authorized"));
    }

    // Only check for duplicate names if the name is changing
    if (workoutName && workoutName !== workout.workoutName) {
      // Get date boundaries for the workout's date
      const workoutDate = new Date(workout.date);

      const startOfDay = new Date(
        workoutDate.getFullYear(),
        workoutDate.getMonth(),
        workoutDate.getDate(),
        0,
        0,
        0,
        0
      );

      const endOfDay = new Date(
        workoutDate.getFullYear(),
        workoutDate.getMonth(),
        workoutDate.getDate(),
        23,
        59,
        59,
        999
      );

      console.log("Checking for duplicates in date range:", {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
      });

      // Check if a workout with this name exists ON THE SAME DATE
      const existingWorkout = await Workout.findOne({
        user: userId,
        workoutName,
        _id: { $ne: workoutId }, // exclude current workout
        date: { $gte: startOfDay, $lte: endOfDay }, // only check same date
      });

      if (existingWorkout) {
        return next(
          createError(
            409,
            `A workout named "${workoutName}" already exists for this date. Please use a different name.`
          )
        );
      }
    }

    // Calculate calories if weight or duration changes
    let caloriesBurned = workout.caloriesBurned;
    if (
      (weight && weight !== workout.weight) ||
      (duration && duration !== workout.duration)
    ) {
      const workoutDetails = {
        weight: weight || workout.weight,
        duration: duration || workout.duration,
      };
      caloriesBurned = calculateCaloriesBurnt(workoutDetails);
    }

    // Update the workout
    const updatedWorkout = await Workout.findByIdAndUpdate(
      workoutId,
      {
        workoutName: workoutName || workout.workoutName,
        category: category || workout.category,
        sets: sets !== undefined ? sets : workout.sets,
        reps: reps !== undefined ? reps : workout.reps,
        weight: weight !== undefined ? weight : workout.weight,
        duration: duration !== undefined ? duration : workout.duration,
        caloriesBurned,
      },
      { new: true } // Return updated document
    );

    return res.status(200).json({
      message: "Workout updated successfully",
      workout: updatedWorkout,
    });
  } catch (err) {
    console.error("Error updating workout:", err);
    next(err);
  }
};

// Delete a workout
export const deleteWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const workoutId = req.params.id;

    // Verify the workout exists and belongs to the user
    const workout = await Workout.findOne({
      _id: workoutId,
      user: userId,
    });

    if (!workout) {
      return next(createError(404, "Workout not found or not authorized"));
    }

    // Delete the workout
    await Workout.findByIdAndDelete(workoutId);

    return res.status(200).json({
      message: "Workout deleted successfully",
      id: workoutId,
    });
  } catch (err) {
    console.error("Error deleting workout:", err);
    next(err);
  }
};
