import { StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const response = await fetch('https://app.tekoai.com/chatbotapi/users/loginByEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          account: email,
          isEmail: true,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Alert.alert('Success', 'Sign in successful');
        
        // Store result in local storage
        await AsyncStorage.setItem('user', JSON.stringify(result));

        router.replace('/home'); // Navigate to the main page (home)
      } else {
        Alert.alert('Error', result.message || 'Sign in failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        keyboardType="email-address"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry={true}
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.optionsContainer}>
        <View style={styles.rememberMeContainer}>
          <TouchableOpacity>
            <Ionicons name="square-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.rememberMeText}>Remember me</Text>
        </View>
        <TouchableOpacity onPress={() => {router.replace('/forgot')}}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInButtonText}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleSignInButton}>
        <Ionicons name="logo-google" size={24} color="black" style={styles.googleIcon} />
        <Text style={styles.googleSignInButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Not a member yet? </Text>
        <TouchableOpacity  onPress={() => {router.replace('/signup')}}>
          <Text style={styles.signUpLink}>Sign up!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 25,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 5,
    fontSize: 16,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: 'red',
  },
  signInButton: {
    backgroundColor: '#4e8ef7',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingVertical: 15,
    justifyContent: 'center',
    marginBottom: 30,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleSignInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 16,
  },
  signUpLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4e8ef7',
  },
});