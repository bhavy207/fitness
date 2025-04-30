import { createError } from "../error.js";
import Nutrition from "../models/Nutrition.js";
import User from "../models/User.js";
import mongoose from "mongoose";
// Add a new nutrition entry
export const addNutritionItem = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { foodName, calories, protein, carbs, fat, date } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const nutritionItem = new Nutrition({
      user: userId,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      date: date ? new Date(date) : new Date(),
    });

    const savedItem = await nutritionItem.save();
    return res.status(201).json(savedItem);
  } catch (err) {
    next(err);
  }
};

// Get nutrition items for a specific date or date range
export const getNutritionItems = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { date, startDate, endDate } = req.query;

    let dateQuery = {};

    if (date) {
      // For specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      dateQuery = {
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      };
    } else if (startDate && endDate) {
      // For date range
      dateQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      // Default to today
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );

      dateQuery = {
        date: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      };
    }

    const nutritionItems = await Nutrition.find({
      user: userId,
      ...dateQuery,
    }).sort({ date: -1 });

    return res.status(200).json(nutritionItems);
  } catch (err) {
    next(err);
  }
};

// Get nutrition summary (totals, weekly data)
// Get nutrition summary (totals, weekly data)
export const getNutritionSummary = async (req, res, next) => {
  try {
    // Use req.user.id consistently like in other functions
    const userId = req.user?.id;

    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    // Convert string ID to ObjectId for MongoDB queries
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get today's totals
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const todayTotals = await Nutrition.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: startOfDay, $lt: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$calories" },
          totalProtein: { $sum: "$protein" },
          totalCarbs: { $sum: "$carbs" },
          totalFat: { $sum: "$fat" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get weekly data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const dayData = await Nutrition.aggregate([
        {
          $match: {
            user: userObjectId,
            date: { $gte: dayStart, $lt: dayEnd },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCalories: { $sum: "$calories" },
            totalProtein: { $sum: "$protein" },
            totalCarbs: { $sum: "$carbs" },
            totalFat: { $sum: "$fat" },
          },
        },
      ]);

      weeklyData.push({
        date: dayStart,
        calories: dayData[0]?.totalCalories || 0,
        protein: dayData[0]?.totalProtein || 0,
        carbs: dayData[0]?.totalCarbs || 0,
        fat: dayData[0]?.totalFat || 0,
      });
    }

    return res.status(200).json({
      today: todayTotals[0] || {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        count: 0,
      },
      weeklyData,
    });
  } catch (err) {
    next(err);
  }
};

// Delete nutrition item
// Delete nutrition item
export const deleteNutritionItem = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const itemId = req.params.id;

    const nutritionItem = await Nutrition.findById(itemId);
    if (!nutritionItem) {
      return next(createError(404, "Nutrition item not found"));
    }

    if (nutritionItem.user.toString() !== userId) {
      return next(
        createError(403, "You can only delete your own nutrition items")
      );
    }

    await Nutrition.findByIdAndDelete(itemId);
    return res
      .status(200)
      .json({ message: "Nutrition item deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Update nutrition item
export const updateNutritionItem = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const itemId = req.params.id;
    const { foodName, calories, protein, carbs, fat, date } = req.body;

    const nutritionItem = await Nutrition.findById(itemId);
    if (!nutritionItem) {
      return next(createError(404, "Nutrition item not found"));
    }

    if (nutritionItem.user.toString() !== userId) {
      return next(
        createError(403, "You can only update your own nutrition items")
      );
    }

    const updatedItem = await Nutrition.findByIdAndUpdate(
      itemId,
      {
        foodName,
        calories,
        protein,
        carbs,
        fat,
        date: date ? new Date(date) : nutritionItem.date,
      },
      { new: true }
    );

    return res.status(200).json(updatedItem);
  } catch (err) {
    next(err);
  }
};
// Update nutrition item
