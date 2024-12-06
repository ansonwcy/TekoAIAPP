import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    const handleSignUp = async () => {
        try {
            const response = await fetch('https://app.tekoai.com/chatbotapi/users/createClient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    rePassword: confirmPassword,
                    username,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                router.replace('/login');
            } else {
                console.error('Error signing up:', data);
            }
        } catch (error) {
            console.error('Error signing up:', error);
        }
        console.log('User signed up:', { username, email, password, confirmPassword});
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

            <TextInput
                style={styles.input}
                placeholder="Your display name (username)"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />

            <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
            />

            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                <Text style={styles.signUpButtonText}>Sign up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInLink} onPress={() => { router.replace('/login'); }}>
                <Text>Already a member with us? </Text>
                <Text style={styles.signInText}>Sign in!</Text>
            </TouchableOpacity>
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
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberMeText: {
        marginLeft: 5,
        fontSize: 16,
    },
    signUpButton: {
        backgroundColor: '#4e8ef7',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signInLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        alignItems: 'center',
    },
    signInText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});
