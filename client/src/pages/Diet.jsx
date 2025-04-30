import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Add, Remove, Star } from "@mui/icons-material";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  color: ${({ theme }) => theme.text_primary};
  height: calc(100vh - 80px);
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const DietSection = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const DietHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const DietTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const MealPlanList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MealPlanItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.bg};
  border-radius: 8px;
`;

const MealPlanInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MealPlanName = styled.div`
  font-weight: 500;
`;

const MealPlanDetails = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text_secondary};
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Diet = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [mealPlans, setMealPlans] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    meals: [],
  });

  // Load meal plans from API
  useEffect(() => {
    const loadMealPlans = async () => {
      if (!currentUser) return;

      try {
        const response = await axios.get("/api/diet");
        setMealPlans(response.data);
      } catch (error) {
        toast.error("Error loading meal plans:", error);
      }
    };

    loadMealPlans();
  }, [currentUser]);

  // Save meal plans to API
  const saveMealPlans = async (plans) => {
    if (!currentUser) return;

    try {
      await axios.post("/api/diet", { plans });
    } catch (error) {
      toast.error("Error saving meal plans:", error);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewPlan({
      name: "",
      description: "",
      meals: [],
    });
  };

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.description || !newPlan.calories) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedPlans = [
      ...mealPlans,
      {
        id: Date.now().toString(),
        ...newPlan,
        calories: Number(newPlan.calories),
        protein: Number(newPlan.protein),
        carbs: Number(newPlan.carbs),
        fat: Number(newPlan.fat),
      },
    ];

    setMealPlans(updatedPlans);
    saveMealPlans(updatedPlans);
    handleCloseModal();
  };

  const handleRemovePlan = (planId) => {
    const updatedPlans = mealPlans.filter((plan) => plan.id !== planId);
    setMealPlans(updatedPlans);
    saveMealPlans(updatedPlans);
  };

  return (
    <Container>
      <Header>
        <Title>Diet Plans</Title>
        <AddButton onClick={handleOpenModal}>
          <Add /> Add Diet Plan
        </AddButton>
      </Header>

      {mealPlans.map((plan) => (
        <DietSection key={plan.id}>
          <DietHeader>
            <DietTitle>{plan.name}</DietTitle>
            <Remove
              style={{ cursor: "pointer", color: "red" }}
              onClick={() => handleRemovePlan(plan.id)}
            />
          </DietHeader>
          <MealPlanInfo>
            <MealPlanName>{plan.description}</MealPlanName>
            <MealPlanDetails>
              {plan.calories} calories • {plan.protein}g protein • {plan.carbs}g
              carbs • {plan.fat}g fat
            </MealPlanDetails>
          </MealPlanInfo>
          <ChipContainer>
            {plan.meals.map((meal, index) => (
              <Chip
                key={index}
                label={meal}
                color="primary"
                variant="outlined"
                icon={<Star />}
              />
            ))}
          </ChipContainer>
        </DietSection>
      ))}

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Add Diet Plan</DialogTitle>
        <DialogContent>
          <ModalContent>
            <TextField
              label="Plan Name"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newPlan.description}
              onChange={(e) =>
                setNewPlan({ ...newPlan, description: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Daily Calories"
              type="number"
              value={newPlan.calories}
              onChange={(e) =>
                setNewPlan({ ...newPlan, calories: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Protein (g)"
              type="number"
              value={newPlan.protein}
              onChange={(e) =>
                setNewPlan({ ...newPlan, protein: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Carbs (g)"
              type="number"
              value={newPlan.carbs}
              onChange={(e) =>
                setNewPlan({ ...newPlan, carbs: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Fat (g)"
              type="number"
              value={newPlan.fat}
              onChange={(e) => setNewPlan({ ...newPlan, fat: e.target.value })}
              fullWidth
            />
            <TextField
              label="Meals (one per line)"
              value={newPlan.meals.join("\n")}
              onChange={(e) =>
                setNewPlan({ ...newPlan, meals: e.target.value.split("\n") })
              }
              fullWidth
              multiline
              rows={4}
            />
          </ModalContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleAddPlan} variant="contained" color="primary">
            Add Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Diet;
