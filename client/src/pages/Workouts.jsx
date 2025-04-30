import React, { useEffect, useState } from "react";
import styled from "styled-components";
import WorkoutCard from "../components/cards/WorkoutCard";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers";
import { getWorkouts } from "../api";
import { Button, CircularProgress, IconButton } from "@mui/material";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import WorkoutModal from "../components/cards/WorkoutModal";
import DeleteConfirmModal from "../components/cards/DeleConfirmModal";
import { DeleteOutline, EditOutlined, Add } from "@mui/icons-material";
import AddWorkoutModal from "../components/cards/AddWorkoutModal";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
`;
const Wrapper = styled.div`
  flex: 1;
  max-width: 1600px;
  display: flex;
  gap: 22px;
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
    flex-direction: column;
  }
`;
const Left = styled.div`
  flex: 0.2;
  height: fit-content;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
`;
const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;
const Right = styled.div`
  flex: 1;
`;
const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 100px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
  gap: 22px;
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 5px;
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const CardContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;

  &:hover ${ActionButtons} {
    opacity: 1;
  }
`;
const SecTitle = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;
const AddButton = styled(Button)`
  && {
    margin: 10px 0;
    background-color: ${({ theme }) => theme.primary};
    color: white;
    &:hover {
      background-color: ${({ theme }) => theme.secondary};
    }
  }
`;

const Workouts = () => {
  const dispatch = useDispatch();
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [addWorkoutModalOpen, setAddWorkoutModalOpen] = useState(false);

  const getTodaysWorkout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("fittrack-app-token");
      const res = await getWorkouts(token, date ? `?date=${date}` : "");
      setTodaysWorkouts(res?.data?.todaysWorkouts || []);
    } catch (error) {
      toast.error("Failed to load workouts");
      console.error("Error loading workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (workout) => {
    setSelectedWorkout(workout);
    setEditModalOpen(true);
  };

  const formatDateForServer = (dateString) => {
    if (!dateString) return null;

    // Parse the date in MM/DD/YYYY format
    const parts = dateString.split("/");
    if (parts.length !== 3) return null;

    return new Date(parts[2], parts[0] - 1, parts[1])
      .toISOString()
      .split("T")[0];
  };
  // Handle delete button click
  const handleDeleteClick = (workout) => {
    setSelectedWorkout(workout);
    setDeleteModalOpen(true);
  };

  const handleWorkoutUpdated = (updatedWorkout) => {
    setTodaysWorkouts((prev) =>
      prev.map((w) => (w._id === updatedWorkout._id ? updatedWorkout : w))
    );
  };

  // Handle workout deleted
  const handleWorkoutDeleted = (deletedWorkoutId) => {
    setTodaysWorkouts((prev) => prev.filter((w) => w._id !== deletedWorkoutId));
  };

  useEffect(() => {
    getTodaysWorkout();
  }, [date]);

  return (
    <Container>
      <Wrapper>
        <Left>
          <Title>Select Date</Title>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              onChange={(e) => setDate(`${e.$M + 1}/${e.$D}/${e.$y}`)}
            />
          </LocalizationProvider>
          <AddButton
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddWorkoutModalOpen(true)}
            fullWidth
          >
            Add Workout for {date || "Today"}
          </AddButton>
        </Left>
        <Right>
          <Section>
            <SecTitle>
              {date ? `Workouts for ${date}` : "Today's Workouts"}
            </SecTitle>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "40px",
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              <CardWrapper>
                {todaysWorkouts.length > 0 ? (
                  todaysWorkouts.map((workout) => (
                    <CardContainer key={workout._id}>
                      <WorkoutCard workout={workout} />
                      <ActionButtons>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(workout)}
                          style={{ backgroundColor: "#f0f0f0" }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(workout)}
                          style={{ backgroundColor: "#ffeeee" }}
                        >
                          <DeleteOutline fontSize="small" color="error" />
                        </IconButton>
                      </ActionButtons>
                    </CardContainer>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#888",
                    }}
                  >
                    No workouts found for this date
                  </div>
                )}
              </CardWrapper>
            )}
          </Section>
        </Right>
      </Wrapper>

      <AddWorkoutModal
        open={addWorkoutModalOpen}
        onClose={() => setAddWorkoutModalOpen(false)}
        date={date || new Date().toLocaleDateString()}
        onWorkoutAdded={getTodaysWorkout}
      />

      {/* Edit Workout Modal */}
      <WorkoutModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        workout={selectedWorkout}
        onWorkoutUpdated={handleWorkoutUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        workout={selectedWorkout}
        onWorkoutDeleted={handleWorkoutDeleted}
      />
    </Container>
  );
};

export default Workouts;
