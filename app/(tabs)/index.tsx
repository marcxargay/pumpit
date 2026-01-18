import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { WorkoutManager } from '../../components/workout-manager';

export default function WorkoutsScreen() {
  return (
    <ThemedView style={styles.container}>
      <WorkoutManager />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
});
