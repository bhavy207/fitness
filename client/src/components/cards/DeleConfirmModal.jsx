import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { deleteWorkout } from "../../api/index";
import toast from "react-hot-toast";

const DeleteConfirmModal = ({ open, onClose, workout, onWorkoutDeleted }) => {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!workout?._id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("fittrack-app-token");
      await deleteWorkout(token, workout._id);

      toast.success("Workout deleted successfully");
      onWorkoutDeleted(workout._id);
      onClose();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to delete workout";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>Delete Workout</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the workout "{workout?.workoutName}"?
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions style={{ padding: "16px" }}>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmModal;
