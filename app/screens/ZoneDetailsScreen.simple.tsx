import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';

interface ZoneDetailsScreenProps {
  navigation: any;
  route?: any;
}

export default function ZoneDetailsScreen({ navigation, route }: ZoneDetailsScreenProps) {
  const zone = route?.params?.zone;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Zone Details</Text>
        {zone ? (
          <>
            <Text style={styles.text}>🗺️ Zone: {zone.id}</Text>
            <Text style={styles.text}>💰 XP Value: {zone.xp_value}</Text>
            <Text style={styles.text}>
              🔒 Status: {zone.is_claimed ? 'Claimed' : 'Available'}
            </Text>
            {zone.owner_username && (
              <Text style={styles.text}>👤 Owner: {zone.owner_username}</Text>
            )}
          </>
        ) : (
          <Text style={styles.text}>📍 Zone information will appear here</Text>
        )}

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
