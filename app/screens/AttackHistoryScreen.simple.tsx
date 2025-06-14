import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';

interface AttackHistoryScreenProps {
  navigation: any;
}

export default function AttackHistoryScreen({ navigation }: AttackHistoryScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Attack History</Text>
        <Text style={styles.text}>⚔️ Your recent battles will appear here</Text>
        <Text style={styles.text}>🏆 Track your wins and losses</Text>
        <Text style={styles.text}>📊 Analyze your performance</Text>

        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.LARGE_TITLE,
    color: COLORS.DARK,
    marginBottom: SPACING.LG,
  },
  text: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  button: {
    marginTop: SPACING.LG,
  },
});
