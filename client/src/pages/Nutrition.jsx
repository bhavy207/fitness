import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Add,
  Delete,
  FastfoodOutlined,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  addNutritionItem,
  getNutritionItems,
  getNutritionSummary,
  deleteNutritionItem,
} from "../api";
import toast from "react-hot-toast";

// Styled components
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
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const Title = styled.div`
  padding: 0px 16px;
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 10px;
  padding: 20px;
  flex: 1;
  min-width: 220px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_secondary};
  text-transform: uppercase;
`;

const StatValue = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  display: flex;
  align-items: baseline;
`;

const StatUnit = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
  margin-left: 5px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 10px;
  padding: 20px;
  flex: 1 1 ${(props) => props.flexBasis || "300px"};
  min-height: ${(props) => props.height || "350px"};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    flex: 1 1 100%;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const DateControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DateDisplay = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_primary};
`;

const MealItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: ${({ theme }) => theme.bg};
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
  }
`;

const MealInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const MealName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const MealDetails = styled.div`
  display: flex;
  gap: 10px;
`;

const NutrientBadge = styled.div`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) => props.bg || "#e0e0e0"};
  color: ${(props) => props.color || "#333"};
`;

const DeleteIconButton = styled(IconButton)`
  color: ${({ theme }) => theme.red || "#f44336"} !important;
`;

const AddButton = styled(Button)`
  && {
    background-color: ${({ theme }) => theme.primary};
    color: white;
    text-transform: none;
    font-weight: 600;
    border-radius: 8px;
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
    padding: 6px 16px;

    &:hover {
      background-color: ${({ theme }) => theme.primary_dark || theme.primary};
      box-shadow: 0px 5px 8px rgba(0, 0, 0, 0.2);
    }
  }
`;

const EmptyState = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text_secondary};
  padding: 20px;
`;

const EmptyStateIcon = styled(FastfoodOutlined)`
  font-size: 50px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

// Main component
const Nutrition = () => {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nutritionItems, setNutritionItems] = useState([]);
  const [nutritionSummary, setNutritionSummary] = useState({
    today: {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    },
    weeklyData: [],
  });
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [newItem, setNewItem] = useState({
    foodName: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    date: new Date().toISOString().split("T")[0],
  });

  // Format date for API
  const formatDateForAPI = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const handleOpenModal = () => {
    // Format the selected date to YYYY-MM-DD format for the date input
    const formattedDate = selectedDate.toISOString().split("T")[0];

    // Update the newItem state with the selected date
    setNewItem({
      ...newItem,
      date: formattedDate,
    });

    // Open the modal
    setOpenModal(true);
  };
  // Load nutrition data
  useEffect(() => {
    const loadNutritionData = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("fittrack-app-token");

        // Get nutrition summary
        const summaryResponse = await getNutritionSummary(token);
        setNutritionSummary(summaryResponse.data);

        // Get items for selected date
        const formattedDate = formatDateForAPI(selectedDate);
        const itemsResponse = await getNutritionItems(token, formattedDate);
        setNutritionItems(itemsResponse.data);
      } catch (error) {
        console.error("Error loading nutrition data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNutritionData();
  }, [currentUser, selectedDate]);

  // Add new nutrition item
  const handleAddItem = async () => {
    if (!newItem.foodName || newItem.calories <= 0) {
      toast.error("Please enter a food name and valid calories");
      return;
    }

    try {
      const token = localStorage.getItem("fittrack-app-token");
      await addNutritionItem(token, newItem);

      // Refresh data
      const formattedDate = formatDateForAPI(selectedDate);
      const itemsResponse = await getNutritionItems(token, formattedDate);
      setNutritionItems(itemsResponse.data);

      const summaryResponse = await getNutritionSummary(token);
      setNutritionSummary(summaryResponse.data);

      // Reset form and close modal
      setOpenModal(false);
      setNewItem({
        foodName: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error adding food item:", error);
      toast.error("Failed to add food item. Please try again.");
    }
  };

  // Delete nutrition item
  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem("fittrack-app-token");
      await deleteNutritionItem(token, itemId);

      // Refresh data
      const formattedDate = formatDateForAPI(selectedDate);
      const itemsResponse = await getNutritionItems(token, formattedDate);
      setNutritionItems(itemsResponse.data);

      const summaryResponse = await getNutritionSummary(token);
      setNutritionSummary(summaryResponse.data);
    } catch (error) {
      console.error("Error removing food item:", error);
      toast.errors("Failed to remove food item. Please try again.");
    }
  };

  // Navigate date
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Format data for chart
  const chartData =
    nutritionSummary.weeklyData?.map((day) => ({
      name: new Date(day.date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      calories: day.calories,
      protein: day.protein,
      carbs: day.carbs,
      fat: day.fat,
    })) || [];

  // Format data for pie chart
  const pieData = nutritionSummary.today
    ? [
        {
          name: "Protein",
          value: nutritionSummary.today.totalProtein,
          color: "#4CAF50",
        },
        {
          name: "Carbs",
          value: nutritionSummary.today.totalCarbs,
          color: "#FF9800",
        },
        {
          name: "Fat",
          value: nutritionSummary.today.totalFat,
          color: "#F44336",
        },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <Container>
      <Wrapper>
        <Title>
          Nutrition Dashboard
          <AddButton
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenModal(true)}
          >
            Add Food
          </AddButton>
        </Title>

        {/* Top Stats Cards */}
        <FlexWrap>
          <StatCard>
            <StatTitle>Daily Calories</StatTitle>
            <StatValue>
              {nutritionSummary.today?.totalCalories || 0}
              <StatUnit>kcal</StatUnit>
            </StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>Protein</StatTitle>
            <StatValue>
              {nutritionSummary.today?.totalProtein || 0}
              <StatUnit>g</StatUnit>
            </StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>Carbs</StatTitle>
            <StatValue>
              {nutritionSummary.today?.totalCarbs || 0}
              <StatUnit>g</StatUnit>
            </StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>Fat</StatTitle>
            <StatValue>
              {nutritionSummary.today?.totalFat || 0}
              <StatUnit>g</StatUnit>
            </StatValue>
          </StatCard>
        </FlexWrap>

        {/* Charts and Meal List */}
        <FlexWrap>
          {/* Bar Chart */}
          <Card flexBasis="60%">
            <CardHeader>
              <CardTitle>Weekly Nutrition Overview</CardTitle>
            </CardHeader>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="calories"
                    name="Calories (kcal)"
                    fill="#8884d8"
                  />
                  <Bar dataKey="protein" name="Protein (g)" fill="#4CAF50" />
                  <Bar dataKey="carbs" name="Carbs (g)" fill="#FF9800" />
                  <Bar dataKey="fat" name="Fat (g)" fill="#F44336" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Pie Chart */}
          <Card flexBasis="35%">
            <CardHeader>
              <CardTitle>Macronutrient Breakdown</CardTitle>
            </CardHeader>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}g`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState>
                <EmptyStateIcon />
                <div>No nutrition data for today</div>
              </EmptyState>
            )}
          </Card>
        </FlexWrap>

        {/* Today's Meals */}
        <Section>
          <Title>
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            Meals
            <DateControls>
              <IconButton onClick={() => navigateDate(-1)}>
                <NavigateBefore />
              </IconButton>
              <DateDisplay>
                {selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </DateDisplay>
              <IconButton onClick={() => navigateDate(1)}>
                <NavigateNext />
              </IconButton>
            </DateControls>
          </Title>

          <CardWrapper>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "40px",
                  width: "100%",
                }}
              >
                <CircularProgress />
              </div>
            ) : nutritionItems.length > 0 ? (
              <Card flexBasis="100%" height="auto">
                <CardHeader>
                  <CardTitle>Food Items</CardTitle>
                </CardHeader>
                {nutritionItems.map((item) => (
                  <MealItem key={item._id}>
                    <MealInfo>
                      <MealName>{item.foodName}</MealName>
                      <MealDetails>
                        <NutrientBadge bg="#8884d815" color="#8884d8">
                          {item.calories} cal
                        </NutrientBadge>
                        <NutrientBadge bg="#4CAF5015" color="#4CAF50">
                          {item.protein}g protein
                        </NutrientBadge>
                        <NutrientBadge bg="#FF980015" color="#FF9800">
                          {item.carbs}g carbs
                        </NutrientBadge>
                        <NutrientBadge bg="#F4433615" color="#F44336">
                          {item.fat}g fat
                        </NutrientBadge>
                      </MealDetails>
                    </MealInfo>
                    <DeleteIconButton
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      <Delete />
                    </DeleteIconButton>
                  </MealItem>
                ))}
              </Card>
            ) : (
              <Card flexBasis="100%" height="auto">
                <EmptyState>
                  <EmptyStateIcon />
                  <div>No food items recorded for this day</div>
                  <AddButton
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenModal} // Use the new function
                  >
                    Add Food
                  </AddButton>
                </EmptyState>
              </Card>
            )}
          </CardWrapper>
        </Section>

        {/* Add Food Item Modal */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            style: { borderRadius: "10px" },
          }}
        >
          <DialogTitle>Add Food Item</DialogTitle>
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
                label="Food Name"
                value={newItem.foodName}
                onChange={(e) =>
                  setNewItem({ ...newItem, foodName: e.target.value })
                }
                fullWidth
                variant="outlined"
                placeholder="e.g. Grilled Chicken"
              />
              <TextField
                label="Calories (kcal)"
                type="number"
                value={newItem.calories}
                onChange={(e) =>
                  setNewItem({ ...newItem, calories: Number(e.target.value) })
                }
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Protein (g)"
                type="number"
                value={newItem.protein}
                onChange={(e) =>
                  setNewItem({ ...newItem, protein: Number(e.target.value) })
                }
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Carbs (g)"
                type="number"
                value={newItem.carbs}
                onChange={(e) =>
                  setNewItem({ ...newItem, carbs: Number(e.target.value) })
                }
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Fat (g)"
                type="number"
                value={newItem.fat}
                onChange={(e) =>
                  setNewItem({ ...newItem, fat: Number(e.target.value) })
                }
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Date"
                type="date"
                value={newItem.date}
                onChange={(e) =>
                  setNewItem({ ...newItem, date: e.target.value })
                }
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </DialogContent>
          <DialogActions style={{ padding: "16px" }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button
              onClick={handleAddItem}
              variant="contained"
              color="primary"
              disabled={!newItem.foodName || newItem.calories <= 0}
            >
              Add Food
            </Button>
          </DialogActions>
        </Dialog>
      </Wrapper>
    </Container>
  );
};

export default Nutrition;
