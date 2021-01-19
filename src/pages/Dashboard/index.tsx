import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const { data } = await api.get('foods');
      setFoods(data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const newFoods = await api.post('foods', { ...food, available: true });
      setFoods(state => [...state, newFoods.data]);
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>) => {
      const foodUpdated = foods.find(f => f.id === editingFood.id);
      await api.put(`foods/${editingFood.id}`, {
        ...foodUpdated,
        ...food,
      });
      const updatedFoods = [
        ...foods.filter(f => f.id !== editingFood.id),
        { ...editingFood, ...food },
      ];
      setFoods(updatedFoods);
      setEditingFood({} as IFoodPlate);
    },
    [editingFood, foods],
  );

  async function handleDeleteFood(id: number): Promise<void> {
    api.delete(`foods/${id}`);
    setFoods(state => state.filter(food => food.id !== id));
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  const handleEditFood = useCallback(
    (food: IFoodPlate) => {
      setEditingFood(food);
      setEditModalOpen(!editModalOpen);
    },
    [editModalOpen],
  );

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
