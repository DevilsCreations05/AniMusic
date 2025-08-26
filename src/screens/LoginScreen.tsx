import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GoogleSignin, GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CartoonButton} from '../components/CartoonButton';
import {CartoonInput} from '../components/CartoonInput';
import {theme} from '../theme';
import {AuthService} from '../services/AuthService';
import {RootStackParamList} from '../../App';

const {width, height} = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const authService = AuthService.getInstance();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const user = await authService.signInWithGoogle();
      
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      Alert.alert('Sign In Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      await authService.sendOTP(email);
      setShowOtp(true);
      Alert.alert('Success', 'OTP sent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      const user = await authService.verifyOTP(email, otp);
      
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await authService.sendOTP(email);
      Alert.alert('Success', 'OTP resent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/wallpaperimg1.jpg')}
      style={styles.container}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.85)']}
        style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            
            {/* Cartoon Style Logo Header */}
            <View style={styles.logoContainer}>
              <View style={styles.logoOuter}>
                <View style={styles.logoInner}>
                  <Text style={styles.appLogo}>AniMusic</Text>
                </View>
              </View>
            </View>

            {/* Cartoon Title Box */}
            <View style={styles.titleContainer}>
              <View style={styles.titleBox}>
                <Text style={styles.title}>ENTER THE STORY</Text>
                <View style={styles.titleDivider} />
                <Text style={styles.subtitle}>Your Musical Adventure</Text>
              </View>
            </View>

            {/* Cartoon Style Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>LOGIN</Text>
                <View style={styles.formHeaderLine} />
              </View>

              <View style={styles.googleContainer}>
                <GoogleSigninButton
                  style={styles.googleButton}
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                />
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerBox}>
                  <Text style={styles.dividerText}>OR</Text>
                </View>
                <View style={styles.dividerLine} />
              </View>

              <CartoonInput
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!showOtp}
              />

              {showOtp && (
                <CartoonInput
                  label="Verification Code"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
              )}

              <CartoonButton
                title={showOtp ? 'VERIFY' : 'SEND CODE'}
                onPress={showOtp ? handleOtpVerify : handleEmailLogin}
                loading={loading}
                size="large"
                variant="primary"
              />

              {showOtp && (
                <View style={styles.otpActions}>
                  <CartoonButton
                    title="RESEND"
                    onPress={handleResendOtp}
                    loading={loading}
                    size="small"
                    variant="outline"
                  />
                  <CartoonButton
                    title="CHANGE EMAIL"
                    onPress={() => {
                      setShowOtp(false);
                      setOtp('');
                    }}
                    size="small"
                    variant="secondary"
                  />
                </View>
              )}
            </View>

            {/* Decorative Elements */}
            <View style={styles.decorativeContainer}>
              <View style={styles.decorativeLine1} />
              <View style={styles.decorativeLine2} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoOuter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 4,
    borderColor: '#000000',
    padding: 5,
  },
  logoInner: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 4,
  },
  appLogo: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleBox: {
    backgroundColor: '#000000',
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  titleDivider: {
    height: 2,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    width: '80%',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    padding: 20,
  },
  formHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  formHeaderLine: {
    height: 4,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    borderRadius: 2,
  },
  googleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 5,
    marginBottom: 15,
  },
  googleButton: {
    width: '100%',
    height: 48,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#FFFFFF',
  },
  dividerBox: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginHorizontal: 10,
  },
  dividerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  decorativeContainer: {
    position: 'absolute',
    width: width,
    height: height,
    pointerEvents: 'none',
  },
  decorativeLine1: {
    position: 'absolute',
    width: 100,
    height: 4,
    backgroundColor: '#FFFFFF',
    top: 50,
    right: -30,
    transform: [{rotate: '45deg'}],
    opacity: 0.3,
  },
  decorativeLine2: {
    position: 'absolute',
    width: 80,
    height: 4,
    backgroundColor: '#FFFFFF',
    bottom: 100,
    left: -20,
    transform: [{rotate: '-30deg'}],
    opacity: 0.3,
  },
});