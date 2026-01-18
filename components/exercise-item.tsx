import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface ExerciseItemProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  isEditing?: boolean;
}

export function ExerciseItem({ exercise, onUpdate, onDelete, isEditing: initialIsEditing }: ExerciseItemProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing || false);
  const [editedExercise, setEditedExercise] = useState<Exercise>(exercise);
  
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#404040' }, 'text');
  const inputBackground = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');

  useEffect(() => {
    if (initialIsEditing !== undefined) {
      setIsEditing(initialIsEditing);
    }
  }, [initialIsEditing]);

  const handleSave = () => {
    onUpdate(editedExercise);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedExercise(exercise);
    setIsEditing(false);
  };

  const updateField = (field: keyof Exercise, value: string | number) => {
    setEditedExercise(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ThemedView style={[styles.container, { borderColor }]}>
      {isEditing ? (
        <View style={styles.editMode}>
          <TextInput
            style={[styles.nameInput, { color: textColor, backgroundColor: inputBackground }]}
            value={editedExercise.name}
            onChangeText={(text) => updateField('name', text)}
            placeholderTextColor={textColor + '80'}
          />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.label}>Sets</ThemedText>
              <TextInput
                style={[styles.numberInput, { color: textColor, backgroundColor: inputBackground }]}
                value={editedExercise.sets.toString()}
                onChangeText={(text) => updateField('sets', parseInt(text) || 0)}
                keyboardType="numeric"
                placeholderTextColor={textColor + '80'}
              />
            </View>
            
            <View style={styles.statItem}>
              <ThemedText style={styles.label}>Reps</ThemedText>
              <TextInput
                style={[styles.numberInput, { color: textColor, backgroundColor: inputBackground }]}
                value={editedExercise.reps.toString()}
                onChangeText={(text) => updateField('reps', parseInt(text) || 0)}
                keyboardType="numeric"
                placeholderTextColor={textColor + '80'}
              />
            </View>
            
            <View style={styles.statItem}>
              <ThemedText style={styles.label}>Weight (kg)</ThemedText>
              <TextInput
                style={[styles.numberInput, { color: textColor, backgroundColor: inputBackground }]}
                value={editedExercise.weight.toString()}
                onChangeText={(text) => updateField('weight', parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholderTextColor={textColor + '80'}
              />
            </View>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.viewMode}>
          <View style={styles.header}>
            <ThemedText type="defaultSemiBold" style={styles.exerciseName}>
              {exercise.name}
            </ThemedText>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <ThemedText style={styles.editButtonText}>Edit</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(exercise.id)}>
                <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statDisplay}>
              <ThemedText style={styles.statValue}>{exercise.sets}</ThemedText>
              <ThemedText style={styles.statLabel}>sets</ThemedText>
            </View>
            <View style={styles.statDisplay}>
              <ThemedText style={styles.statValue}>{exercise.reps}</ThemedText>
              <ThemedText style={styles.statLabel}>reps</ThemedText>
            </View>
            <View style={styles.statDisplay}>
              <ThemedText style={styles.statValue}>{exercise.weight}</ThemedText>
              <ThemedText style={styles.statLabel}>kg</ThemedText>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  editMode: {
    gap: 8,
  },
  viewMode: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 18,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDisplay: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    opacity: 0.7,
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 6,
    textAlign: 'center',
    fontSize: 14,
    minWidth: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    opacity: 0.7,
  },
});