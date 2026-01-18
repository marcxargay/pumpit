import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Exercise, ExerciseItem } from "./exercise-item";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface ExerciseListProps {
  exercises: Exercise[];
  onUpdateExercises: (exercises: Exercise[]) => void;
  workoutName: string;
  onWorkoutDone?: () => void;
}

export function ExerciseList({
  exercises: initialExercises,
  onUpdateExercises,
  workoutName,
  onWorkoutDone,
}: ExerciseListProps) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  useEffect(() => {
    setExercises(initialExercises);
  }, [initialExercises]);

  const addNewExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "New Exercise",
      sets: 3,
      reps: 10,
      weight: 0,
    };
    const updatedExercises = [...exercises, newExercise];
    setExercises(updatedExercises);
    onUpdateExercises(updatedExercises);
    setNewlyAddedId(newExercise.id);
  };

  const updateExercise = (updatedExercise: Exercise) => {
    const updatedExercises = exercises.map((exercise) =>
      exercise.id === updatedExercise.id ? updatedExercise : exercise,
    );
    setExercises(updatedExercises);
    onUpdateExercises(updatedExercises);
  };

  const deleteExercise = (id: string) => {
    const updatedExercises = exercises.filter((exercise) => exercise.id !== id);
    setExercises(updatedExercises);
    onUpdateExercises(updatedExercises);
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <ExerciseItem
      exercise={item}
      onUpdate={(updatedExercise) => {
        updateExercise(updatedExercise);
        if (newlyAddedId === item.id) {
          setNewlyAddedId(null);
        }
      }}
      onDelete={deleteExercise}
      isEditing={newlyAddedId === item.id}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={exercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {exercises.length === 0 && (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No exercises added yet
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Tap &quot;Add Exercise&quot; to start building your workout
          </ThemedText>
        </ThemedView>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addNewExercise}>
          <ThemedText style={styles.addButtonText}>+ Add Exercise</ThemedText>
        </TouchableOpacity>
        {exercises.length > 0 && onWorkoutDone && (
          <TouchableOpacity
            style={styles.workoutDoneButton}
            onPress={onWorkoutDone}
          >
            <ThemedText style={styles.workoutDoneButtonText}>
              Workout Done
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.5,
  },
  workoutDoneButton: {
    backgroundColor: "#14381d",
    paddingVertical: 12, // Match padding with addButton
    paddingHorizontal: 16, // Match padding with addButton
    borderRadius: 12, // Match roundness with addButton
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutDoneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
