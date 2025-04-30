import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { counts } from "../utils/data";
import CountsCard from "../components/cards/CountsCard";
import WeeklyStatCard from "../components/cards/WeeklyStatCard";
import CategoryChart from "../components/cards/CategoryChart";
import AddWorkout from "../components/AddWorkout";
import WorkoutCard from "../components/cards/WorkoutCard";
import { addWorkout, getDashboardDetails, getWorkouts } from "../api";
import toast from "react-hot-toast";

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
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Title = styled.div`
  padding: 0px 16px;
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;
const FlexWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 22px;
  padding: 0px 16px;
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

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [workout, setWorkout] = useState(`#Legs
-Back Squat
-5 setsX15 reps
-30 kg
-10 min`);

  const dashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("fittrack-app-token");
      const response = await getDashboardDetails(token);
      setData(response.data);
      console.log("Dashboard data:", response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysWorkout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("fittrack-app-token");
      const response = await getWorkouts(token);
      setTodaysWorkouts(response?.data?.todaysWorkouts || []);
      console.log("Today's workouts:", response.data);
    } catch (error) {
      toast.error("Failed to load today's workouts");
      console.error("Today's workouts error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNewWorkout = async () => {
    try {
      setButtonLoading(true);
      const token = localStorage.getItem("fittrack-app-token");

      // First, add the workout
      const response = await addWorkout(token, { workoutString: workout });

      // Use timeout to allow server to process the data before fetching
      setTimeout(async () => {
        try {
          // Fetch updated dashboard data
          const dashboardResponse = await getDashboardDetails(token);
          setData(dashboardResponse.data);

          // Fetch today's workouts
          const todayWorkoutsResponse = await getWorkouts(token, "");
          setTodaysWorkouts(todayWorkoutsResponse?.data?.todaysWorkouts || []);
        } catch (refreshErr) {
          toast.error("Error refreshing data:", refreshErr);
        } finally {
          setButtonLoading(false);
        }
      }, 1000); // Add a 1-second delay before refreshing data
    } catch (err) {
      console.error("Error adding workout:", err);

      // Display proper error message
      const errorMessage =
        err.response?.data?.message ||
        "Failed to add workout. Please check your format.";
      toast.error(errorMessage);
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    dashboardData();
    getTodaysWorkout();
  }, []);
  return (
    <Container>
      <Wrapper>
        <Title>Dashboard</Title>
        <FlexWrap>
          {counts.map((item) => (
            <CountsCard item={item} data={data} />
          ))}
        </FlexWrap>

        <FlexWrap>
          <WeeklyStatCard data={data} />
          <CategoryChart data={data} />
          <AddWorkout
            workout={workout}
            setWorkout={setWorkout}
            addNewWorkout={addNewWorkout}
            buttonLoading={buttonLoading}
          />
        </FlexWrap>

        <Section>
          <Title>Todays Workouts</Title>
          <CardWrapper>
            {todaysWorkouts.map((workout) => (
              <WorkoutCard workout={workout} />
            ))}
          </CardWrapper>
        </Section>
      </Wrapper>
    </Container>
  );
};

export default Dashboard;
