import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Exercise } from './exercise-item';
import { ExerciseList } from './exercise-list';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: Date;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  exercises: Exercise[];
  completedAt: Date;
  totalSets: number;
  totalVolume: number;
}

const STORAGE_KEY = '@PumpIt:workouts';
const SELECTED_WORKOUT_KEY = '@PumpIt:selectedWorkout';
const PROGRESS_KEY = '@PumpIt:workoutSessions';

const DEFAULT_WORKOUTS: Workout[] = [
  {
    id: '1',
    name: 'Push Day',
    exercises: [
      {
        id: '1',
        name: 'Bench Press',
        sets: 3,
        reps: 10,
        weight: 60,
      },
      {
        id: '2',
        name: 'Shoulder Press',
        sets: 3,
        reps: 8,
        weight: 30,
      },
    ],
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Pull Day',
    exercises: [
      {
        id: '3',
        name: 'Pull-ups',
        sets: 4,
        reps: 8,
        weight: 0,
      },
      {
        id: '4',
        name: 'Rows',
        sets: 3,
        reps: 10,
        weight: 40,
      },
    ],
    createdAt: new Date(),
  },
];

export function WorkoutManager() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#404040' }, 'text');
  const inputBackground = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const modalBackground = useThemeColor({ light: '#ffffff', dark: '#1a1a1a' }, 'background');

  const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);

  // Load workouts from storage on component mount
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const storedWorkouts = await AsyncStorage.getItem(STORAGE_KEY);
        const storedSelectedId = await AsyncStorage.getItem(SELECTED_WORKOUT_KEY);
        
        if (storedWorkouts) {
          const parsedWorkouts = JSON.parse(storedWorkouts).map((w: any) => ({
            ...w,
            createdAt: new Date(w.createdAt)
          }));
          setWorkouts(parsedWorkouts);
          
          if (storedSelectedId && parsedWorkouts.find((w: Workout) => w.id === storedSelectedId)) {
            setSelectedWorkoutId(storedSelectedId);
          } else {
            setSelectedWorkoutId(parsedWorkouts[0]?.id || '');
          }
        } else {
          // First time - load default workouts
          setWorkouts(DEFAULT_WORKOUTS);
          setSelectedWorkoutId(DEFAULT_WORKOUTS[0]?.id || '');
          await saveWorkouts(DEFAULT_WORKOUTS);
        }
      } catch (error) {
        console.error('Error loading workouts:', error);
        setWorkouts(DEFAULT_WORKOUTS);
        setSelectedWorkoutId(DEFAULT_WORKOUTS[0]?.id || '');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWorkouts();
  }, []);

  // Save workouts to storage
  const saveWorkouts = async (workoutsToSave: Workout[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(workoutsToSave));
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  };

  // Save selected workout ID
  const saveSelectedWorkout = async (workoutId: string) => {
    try {
      await AsyncStorage.setItem(SELECTED_WORKOUT_KEY, workoutId);
    } catch (error) {
      console.error('Error saving selected workout:', error);
    }
  };

  // Save completed workout session
  const saveWorkoutSession = async (workout: Workout) => {
    try {
      const existingSessions = await AsyncStorage.getItem(PROGRESS_KEY);
      const sessions: WorkoutSession[] = existingSessions ? JSON.parse(existingSessions) : [];
      
      const newSession: WorkoutSession = {
        id: Date.now().toString(),
        workoutId: workout.id,
        workoutName: workout.name,
        exercises: workout.exercises,
        completedAt: new Date(),
        totalSets: workout.exercises.reduce((total, ex) => total + ex.sets, 0),
        totalVolume: workout.exercises.reduce((total, ex) => total + (ex.sets * ex.weight), 0),
      };
      
      const updatedSessions = [newSession, ...sessions];
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedSessions));
      
      Alert.alert('Workout Complete!', `Great job finishing ${workout.name}!`);
    } catch (error) {
      console.error('Error saving workout session:', error);
      Alert.alert('Error', 'Failed to save workout progress');
    }
  };

  const createNewWorkout = async () => {
    if (!newWorkoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: newWorkoutName.trim(),
      exercises: [],
      createdAt: new Date(),
    };

    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    setSelectedWorkoutId(newWorkout.id);
    setNewWorkoutName('');
    setShowCreateModal(false);
    
    await saveWorkouts(updatedWorkouts);
    await saveSelectedWorkout(newWorkout.id);
  };

  const deleteWorkout = (workoutId: string) => {
    if (workouts.length <= 1) {
      Alert.alert('Error', 'You must have at least one workout');
      return;
    }

    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
            setWorkouts(updatedWorkouts);
            
            let newSelectedId = selectedWorkoutId;
            if (selectedWorkoutId === workoutId) {
              newSelectedId = updatedWorkouts[0]?.id || '';
              setSelectedWorkoutId(newSelectedId);
            }
            
            await saveWorkouts(updatedWorkouts);
            if (newSelectedId !== selectedWorkoutId) {
              await saveSelectedWorkout(newSelectedId);
            }
          },
        },
      ]
    );
  };

  const updateWorkoutExercises = useCallback(async (exercises: Exercise[]) => {
    const updatedWorkouts = workouts.map(workout =>
      workout.id === selectedWorkoutId
        ? { ...workout, exercises }
        : workout
    );
    setWorkouts(updatedWorkouts);
    await saveWorkouts(updatedWorkouts);
  }, [selectedWorkoutId, workouts]);

  const selectWorkout = async (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    await saveSelectedWorkout(workoutId);
  };

  const renderWorkoutTab = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={[
        styles.workoutTab,
        { borderColor },
        selectedWorkoutId === item.id && styles.selectedTab,
        selectedWorkoutId === item.id && { backgroundColor: '#007AFF20' }
      ]}
      onPress={() => selectWorkout(item.id)}
      onLongPress={() => deleteWorkout(item.id)}
    >
      <ThemedText style={[
        styles.workoutTabText,
        selectedWorkoutId === item.id && styles.selectedTabText
      ]}>
        {item.name}
      </ThemedText>
      <ThemedText style={styles.exerciseCount}>
        {item.exercises.length} exercises
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading workouts...</ThemedText>
        </ThemedView>
      ) : (
        <>
          {/* Workout Tabs */}
          <View style={styles.workoutNavigation}>
        <FlatList
          data={workouts}
          renderItem={renderWorkoutTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.workoutList}
          contentContainerStyle={styles.workoutListContent}
        />
        <TouchableOpacity
          style={styles.addWorkoutButton}
          onPress={() => setShowCreateModal(true)}
        >
          <ThemedText style={styles.addWorkoutButtonText}>+</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Current Workout */}
      {selectedWorkout && (
        <View style={styles.workoutContent}>
          <ExerciseList
            exercises={selectedWorkout.exercises}
            onUpdateExercises={updateWorkoutExercises}
            workoutName={selectedWorkout.name}
            onWorkoutDone={() => saveWorkoutSession(selectedWorkout)}
          />
        </View>
      )}

      {/* Create Workout Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: modalBackground }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Create New Workout
            </ThemedText>
            
            <TextInput
              style={[styles.workoutNameInput, { color: textColor, backgroundColor: inputBackground, borderColor }]}
              value={newWorkoutName}
              onChangeText={setNewWorkoutName}
              placeholder="Enter workout name"
              placeholderTextColor={textColor + '80'}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewWorkoutName('');
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={createNewWorkout}
              >
                <ThemedText style={styles.createButtonText}>Create</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  workoutList: {
    flex: 1,
  },
  workoutListContent: {
    gap: 8,
  },
  workoutTab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedTab: {
    borderColor: '#007AFF',
  },
  workoutTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTabText: {
    color: '#007AFF',
  },
  exerciseCount: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },
  addWorkoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addWorkoutButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  workoutContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  workoutNameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    opacity: 0.7,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});