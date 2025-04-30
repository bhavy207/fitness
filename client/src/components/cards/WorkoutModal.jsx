import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { updateWorkout } from "../../api";
import toast from "react-hot-toast";

const WorkoutModal = ({ open, onClose, workout, onWorkoutUpdated }) => {
  const [formData, setFormData] = useState({
    workoutName: "",
    category: "",
    sets: 0,
    reps: 0,
    weight: 0,
    duration: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workout) {
      setFormData({
        workoutName: workout.workoutName || "",
        category: workout.category || "",
        sets: workout.sets || 0,
        reps: workout.reps || 0,
        weight: workout.weight || 0,
        duration: workout.duration || 0,
      });
    }
  }, [workout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "workoutName" || name === "category" ? value : Number(value),
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.workoutName || !formData.category) {
      toast.error("Workout name and category are required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("fittrack-app-token");
      const response = await updateWorkout(token, workout._id, formData);

      toast.success("Workout updated successfully");
      onWorkoutUpdated(response.data.workout);
      onClose();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update workout";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Workout</DialogTitle>
      <DialogContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          <TextField
            label="Workout Name"
            name="workoutName"
            value={formData.workoutName}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            required
          />

          <div style={{ display: "flex", gap: "16px" }}>
            <TextField
              label="Sets"
              name="sets"
              type="number"
              value={formData.sets}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Reps"
              name="reps"
              type="number"
              value={formData.reps}
              onChange={handleChange}
              fullWidth
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <TextField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Duration (min)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              fullWidth
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions style={{ padding: "16px" }}>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutModal;
