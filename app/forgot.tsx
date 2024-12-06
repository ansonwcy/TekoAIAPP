import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleForgotPassword = async () => {
    try {
      // Make an API request to send the reset link
      const response = await fetch(`https://app.tekoai.com/chatbotapi/users/sendResetPswdEmail/${email}`, {
        method: 'GET',
      });
      if (response.ok) {
        console.log('Reset password link sent successfully');
        router.replace('/login');

      } else {
        const data = await response.text();
        console.error('Error response:', data);
        setErrorMessage('We cannot find your email...');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.description}>Enter your email and we’ll send you a link to reset your password.</Text>

      <TextInput
        style={styles.input}
        placeholder="example@tekoai.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.submitButton} onPress={handleForgotPassword}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#777',
    marginBottom: 30,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#00BFFF',
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4e8ef7',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 30
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backToLoginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  backToLoginText: {
    marginLeft: 10,
    color: '#00BFFF',
    fontSize: 16,
  },
});
