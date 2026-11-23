import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { colors, radius } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const { height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const { containerStyle } = useFormFactor();

  return (
  <LinearGradient
    colors={[colors.yellow, colors.orange]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.container, containerStyle]}
  >
    <View style={styles.top}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={34} color={colors.orange} />
      </View>
      <Text style={styles.brand}>FastaPick</Text>
      <Text style={styles.tagline}>Good food, fast. Right here in Ekiti.</Text>
    </View>

    <View style={styles.art}>
      <View style={styles.circle}>
        <Text style={styles.bowl}>🍲</Text>
        <View style={styles.badgeOne}>
          <Text style={styles.badgeEmoji}>🛵</Text>
        </View>
        <View style={styles.badgeTwo}>
          <Text style={styles.badgeEmoji}>🔥</Text>
        </View>
      </View>
    </View>

    <View style={styles.bottom}>
      <Text style={styles.headline}>Your favourite Ekiti meals,{'\n'}delivered in minutes.</Text>
      <Text style={styles.body}>
        From Ado Buka classics to smoky suya and sweet treats — order from the best kitchens around you.
      </Text>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Ionicons name="time" size={18} color={colors.white} />
          <Text style={styles.featureText}>Fast delivery</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="wallet" size={18} color={colors.white} />
          <Text style={styles.featureText}>Best prices</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="heart" size={18} color={colors.white} />
          <Text style={styles.featureText}>Local favourites</Text>
        </View>
      </View>

      <Button
        title="Get started"
        onPress={() => navigation.navigate('Register')}
        variant="ghost"
        textStyle={{ color: colors.white }}
        style={styles.primary}
      />
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
        <Text style={styles.linkText}>I already have an account</Text>
      </TouchableOpacity>
    </View>
  </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  top: {
    alignItems: 'center',
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#B45309',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  brand: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: height * 0.28,
  },
  circle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bowl: {
    fontSize: 96,
  },
  badgeOne: {
    position: 'absolute',
    top: 16,
    right: 4,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B45309',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  badgeTwo: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B45309',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  badgeEmoji: {
    fontSize: 26,
  },
  bottom: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 24,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 11,
    color: colors.white,
    marginTop: 5,
    fontWeight: '600',
  },
  primary: {
    backgroundColor: colors.white,
    width: '100%',
  },
  link: {
    marginTop: 16,
    paddingVertical: 8,
  },
  linkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
