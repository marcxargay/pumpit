import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { WorkoutSession } from "./workout-manager";

const PROGRESS_KEY = "@PumpIt:workoutSessions";

export function ProgressList() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const storedSessions = await AsyncStorage.getItem(PROGRESS_KEY);
        if (storedSessions) {
          const parsedSessions = JSON.parse(storedSessions).map(
            (session: any) => ({
              ...session,
              completedAt: new Date(session.completedAt),
            }),
          );
          setSessions(parsedSessions);
        }
      } catch (error) {
        console.error("Error loading workout sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();

    // Listen for storage changes (when a new workout is completed)
    const interval = setInterval(loadSessions, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deleteSession = async (sessionId: string) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to remove this workout from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedSessions = sessions.filter(
                (session) => session.id !== sessionId,
              );
              setSessions(updatedSessions);
              await AsyncStorage.setItem(
                PROGRESS_KEY,
                JSON.stringify(updatedSessions),
              );
            } catch (error) {
              console.error("Error deleting workout session:", error);
              Alert.alert("Error", "Failed to delete workout session");
            }
          },
        },
      ],
    );
  };

  const renderSessionItem = ({ item }: { item: WorkoutSession }) => (
    <ThemedView style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <ThemedText type="defaultSemiBold" style={styles.workoutName}>
          {item.workoutName}
        </ThemedText>
        <View style={styles.headerRight}>
          <View style={styles.dateTime}>
            <ThemedText style={styles.date}>
              {formatDate(item.completedAt)}
            </ThemedText>
            <ThemedText style={styles.time}>
              {formatTime(item.completedAt)}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteSession(item.id)}
          >
            <ThemedText style={styles.deleteButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sessionStats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {item.exercises.length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Exercises</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{item.totalSets}</ThemedText>
          <ThemedText style={styles.statLabel}>Sets</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{item.totalVolume}</ThemedText>
          <ThemedText style={styles.statLabel}>Volume (kg)</ThemedText>
        </View>
      </View>

      <View style={styles.exerciseList}>
        <ThemedText style={styles.date}>
          Completed on: {formatDate(item.completedAt)}
        </ThemedText>
        {item.exercises.map((exercise, index) => (
          <ThemedText key={exercise.id} style={styles.exerciseItem}>
            {exercise.name}: {exercise.sets} × {exercise.reps} @{" "}
            {exercise.weight}kg
          </ThemedText>
        ))}
      </View>
    </ThemedView>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading workout history...</ThemedText>
      </ThemedView>
    );
  }

  if (sessions.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyTitle}>
          No workouts completed yet
        </ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Complete your first workout to start tracking progress!
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Workout History</ThemedText>
        <ThemedText style={styles.totalCount}>
          {sessions.length} completed
        </ThemedText>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    opacity: 0.6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 20,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dateTime: {
    alignItems: "flex-end",
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#771010ba",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  time: {
    fontSize: 10,
    opacity: 0.6,
  },
  sessionStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },
  exerciseList: {
    gap: 4,
  },
  exerciseItem: {
    fontSize: 12,
    opacity: 0.7,
  },
  moreExercises: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: "italic",
  },
});
