import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { addWorkout } from "../../api";
import toast from "react-hot-toast";

const AddWorkoutModal = ({ open, onClose, date, onWorkoutAdded }) => {
  const [workoutString, setWorkoutString] = useState(
    `#Legs
-Squat
-3 sets15 reps
-60 kg
-10 min`
  );
  const [loading, setLoading] = useState(false);

  const handleAddWorkout = async () => {
    if (!workoutString.trim()) {
      toast.error("Please enter workout details");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("fittrack-app-token");

      // Format the date for the API
      const formattedDate = formatDateForAPI(date);
      console.log(formattedDate);
      // Send the workout to the API with the date
      await addWorkout(token, {
        workoutString,
        date: formattedDate,
      });

      toast.success("Workout added successfully");
      setWorkoutString("");
      onClose();

      // Refresh the workouts list
      if (onWorkoutAdded) {
        onWorkoutAdded();
      }
    } catch (error) {
      console.error("Error adding workout:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add workout. Please check your format.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;

    try {
      // Parse the date (assuming MM/DD/YYYY format)
      const parts = dateString.split("/");
      if (parts.length !== 3) return dateString; // Return original if not in expected format

      // Don't use toISOString() as it converts to UTC and can cause date shifts
      // Instead, just return the date in the format your API expects
      return dateString; // Keep the MM/DD/YYYY format that your server expects
    } catch (e) {
      console.error("Date parsing error:", e);
      return dateString; // Return original date string on error
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Workout for{" "}
        {new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </DialogTitle>
      <DialogContent>
        <div style={{ marginTop: "16px", marginBottom: "8px" }}>
          <strong>Format your workout like this:</strong>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "8px",
              borderRadius: "4px",
              marginTop: "8px",
              fontFamily: "monospace",
            }}
          >
            {`#Category
-Workout Name
-Sets setsReps reps
-Weight kg
-Duration min`}
          </pre>
        </div>
        <TextField
          label="Workout Details"
          multiline
          rows={8}
          value={workoutString}
          onChange={(e) => setWorkoutString(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Enter your workout details"
        />
      </DialogContent>
      <DialogActions style={{ padding: "16px" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAddWorkout}
          variant="contained"
          color="primary"
          disabled={loading || !workoutString.trim()}
        >
          {loading ? <CircularProgress size={24} /> : "Add Workout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWorkoutModal;
